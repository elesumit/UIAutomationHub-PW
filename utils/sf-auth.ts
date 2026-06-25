import * as crypto from 'crypto';
import * as fs from 'fs';
import * as https from 'https';

const STORAGE_STATE_PATH = 'storage/storageState.json';
// Salesforce sandbox sessions default to 2h; refresh every 90m to stay inside the window
const SESSION_TTL_MS = 90 * 60 * 1000;

// ─── JWT construction ───────────────────────────────────────────────────────

function buildJwt(consumerKey: string, username: string, audience: string, privateKeyPem: string): string {
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const now     = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: consumerKey,
    sub: username,
    aud: audience,
    exp: now + 300, // SF requires exp ≤ now+5m
  })).toString('base64url');

  const signingInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  return `${signingInput}.${sign.sign(privateKeyPem, 'base64url')}`;
}

// ─── Token exchange ─────────────────────────────────────────────────────────

function requestToken(authUrl: string, jwt: string): Promise<{ access_token: string; instance_url: string }> {
  return new Promise((resolve, reject) => {
    const body = [
      'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer',
      `assertion=${encodeURIComponent(jwt)}`,
    ].join('&');

    const url = new URL(`${authUrl}/services/oauth2/token`);
    const req = https.request(
      {
        hostname: url.hostname,
        path:     url.pathname,
        method:   'POST',
        headers:  {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(`[SF Auth] Token exchange failed — ${parsed.error}: ${parsed.error_description}`));
            } else {
              resolve({ access_token: parsed.access_token, instance_url: parsed.instance_url });
            }
          } catch {
            reject(new Error(`[SF Auth] Unexpected token response: ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Private key resolution ──────────────────────────────────────────────────
// Priority:
//   1. SF_PRIVATE_KEY_PATH — path to a .pem file (Key Vault secret mounted as file, or local)
//   2. SF_PRIVATE_KEY      — raw PEM string in env var (dotenvx-encrypted in .env)

function resolvePrivateKey(): string {
  const keyPath = process.env.SF_PRIVATE_KEY_PATH;
  if (keyPath) {
    if (!fs.existsSync(keyPath)) throw new Error(`[SF Auth] SF_PRIVATE_KEY_PATH set but file not found: ${keyPath}`);
    return fs.readFileSync(keyPath, 'utf-8');
  }

  const pem = process.env.SF_PRIVATE_KEY;
  if (pem) {
    // GitHub Actions / JSON encoding can escape newlines — normalise them
    return pem.replace(/\\n/g, '\n');
  }

  throw new Error('[SF Auth] No private key found. Set SF_PRIVATE_KEY_PATH (file) or SF_PRIVATE_KEY (PEM string) in .env');
}

// ─── Session freshness check ─────────────────────────────────────────────────

function isSessionFresh(): boolean {
  if (!fs.existsSync(STORAGE_STATE_PATH)) return false;
  return Date.now() - fs.statSync(STORAGE_STATE_PATH).mtimeMs < SESSION_TTL_MS;
}

// ─── Public entry point ──────────────────────────────────────────────────────
// Called once in BeforeAll after the browser is launched.
// Does nothing when SF_USE_JWT !== 'true' so the old username/password flow still works.

export async function ensureSalesforceSession(): Promise<void> {
  if (process.env.SF_USE_JWT !== 'true') return;

  if (isSessionFresh()) {
    console.log('[SF Auth] Reusing existing storageState (session < 90 min old)');
    return;
  }

  const consumerKey = process.env.SF_CONSUMER_KEY;
  const username    = process.env.SF_JWT_USERNAME;
  const authUrl     = (process.env.SF_AUTH_URL || 'https://test.salesforce.com').replace(/\/$/, '');

  if (!consumerKey || !username) {
    throw new Error('[SF Auth] SF_CONSUMER_KEY and SF_JWT_USERNAME are required when SF_USE_JWT=true');
  }

  console.log(`[SF Auth] Minting Salesforce session for ${username} via JWT Bearer...`);

  const jwt                         = buildJwt(consumerKey, username, authUrl, resolvePrivateKey());
  const { access_token, instance_url } = await requestToken(authUrl, jwt);

  console.log(`[SF Auth] Access token obtained. Instance: ${instance_url}`);

  // Exchange the access_token for a real browser session cookie via frontdoor.jsp,
  // then persist cookies + localStorage as Playwright storageState for all test scenarios.
  // BrowserManager must already be launched before this is called.
  const { BrowserManager } = await import('./browser-manager');
  await BrowserManager.mintStorageState(
    `${instance_url}/secur/frontdoor.jsp?sid=${access_token}`,
    STORAGE_STATE_PATH
  );

  console.log(`[SF Auth] storageState saved → ${STORAGE_STATE_PATH}`);
}
