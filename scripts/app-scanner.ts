/**
 * App Scanner — Phase 1 of grounded test generation.
 *
 * Crawls a target web app and emits `app-map.json`: a per-page inventory of every
 * interactive element ({ role, name, text, tag, type, selector }). This map is the
 * ground truth that the AI generator is fed so it writes steps against elements
 * that ACTUALLY EXIST, instead of hallucinating labels.
 *
 * Usage:
 *   ts-node scripts/app-scanner.ts [--url <baseUrl>] [--login] [--max-pages N] [--out path] [--headed]
 *
 * Defaults:
 *   --url        CE_QA_URL (or BASE_URL) from .env
 *   --max-pages  25
 *   --out        app-map.json
 *   --login      off; when set, logs in first using CE_UserName / CE_Password
 *
 * Example (saucedemo):
 *   ts-node scripts/app-scanner.ts --url https://www.saucedemo.com/ --login --headed
 */

import { chromium, Browser, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// ─────────────────────────── CLI args ───────────────────────────
function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  return fallback;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const BASE_URL = arg('url', process.env.CE_QA_URL || process.env.BASE_URL);
const MAX_PAGES = parseInt(arg('max-pages', '25')!, 10);
const OUT_PATH = arg('out', 'app-map.json')!;
const DO_LOGIN = flag('login');
const HEADED = flag('headed') || process.env.HEADLESS === 'false';

if (!BASE_URL) {
  console.error('❌ No target URL. Pass --url <baseUrl> or set CE_QA_URL / BASE_URL in .env');
  process.exit(1);
}

// ─────────────────────────── types ───────────────────────────
interface ElementInfo {
  role: string;
  name: string;
  text: string;
  tag: string;
  type: string;
  selector: string;
}
interface PageInfo {
  url: string;
  route: string;
  title: string;
  elements: ElementInfo[];
}

// ─────────────────────────── login (heuristic) ───────────────────────────
// Fills the first username-like + password field and clicks a login/submit
// button. Works for saucedemo (standard_user / secret_sauce) and most simple
// login forms. Credentials come from CE_UserName / CE_Password env vars.
async function tryLogin(page: Page): Promise<void> {
  const user = process.env.CE_UserName || process.env.CE_QA_USERNAME || '';
  const pass = process.env.CE_Password || process.env.CE_QA_PASSWORD || '';
  if (!user || !pass) {
    console.warn('⚠️  --login set but CE_UserName / CE_Password are empty; skipping login.');
    return;
  }
  const userField = page
    .locator('input[type="email"], input[type="text"], input[name*="user" i], input[id*="user" i], input[placeholder*="user" i], input[name*="email" i]')
    .first();
  const passField = page.locator('input[type="password"]').first();
  try {
    await userField.fill(user, { timeout: 8000 });
    await passField.fill(pass, { timeout: 8000 });
    const loginBtn = page
      .locator('button[type="submit"], input[type="submit"], button:has-text("Log"), button:has-text("Sign"), #login-button')
      .first();
    await loginBtn.click({ timeout: 8000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    console.log(`🔐 Logged in as ${user}`);
  } catch (e: any) {
    console.warn(`⚠️  Login attempt failed (continuing unauthenticated): ${e.message}`);
  }
}

// ─────────────────────────── element extraction ───────────────────────────
// Runs in the page context: collects visible interactive elements and computes a
// stable selector + accessible name for each. Selector preference:
//   [data-test] > [data-testid] > #id > [name] > getByRole-style > text
async function extractElements(page: Page): Promise<ElementInfo[]> {
  return page.evaluate(() => {
    const INTERACTIVE = [
      'a[href]', 'button', 'input', 'select', 'textarea',
      '[role="button"]', '[role="link"]', '[role="checkbox"]', '[role="radio"]',
      '[role="tab"]', '[role="menuitem"]', '[role="switch"]', '[contenteditable="true"]',
    ].join(',');

    const isVisible = (el: Element): boolean => {
      const he = el as HTMLElement;
      if (he.hidden) return false;
      const style = window.getComputedStyle(he);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      if (el.getAttribute('aria-hidden') === 'true') return false;
      const rect = he.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const roleOf = (el: Element): string => {
      const explicit = el.getAttribute('role');
      if (explicit) return explicit;
      const tag = el.tagName.toLowerCase();
      if (tag === 'a') return 'link';
      if (tag === 'button') return 'button';
      if (tag === 'select') return 'combobox';
      if (tag === 'textarea') return 'textbox';
      if (tag === 'input') {
        const t = (el.getAttribute('type') || 'text').toLowerCase();
        if (t === 'checkbox') return 'checkbox';
        if (t === 'radio') return 'radio';
        if (t === 'submit' || t === 'button') return 'button';
        if (t === 'password' || t === 'email' || t === 'text' || t === 'search' || t === 'tel' || t === 'number') return 'textbox';
        return t;
      }
      return tag;
    };

    const accessibleName = (el: Element): string => {
      const aria = el.getAttribute('aria-label');
      if (aria && aria.trim()) return aria.trim();
      const labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        const ref = document.getElementById(labelledby);
        if (ref && ref.textContent?.trim()) return ref.textContent.trim();
      }
      const id = el.getAttribute('id');
      if (id) {
        const lbl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (lbl && lbl.textContent?.trim()) return lbl.textContent.trim();
      }
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) return text.slice(0, 80);
      const ph = el.getAttribute('placeholder');
      if (ph && ph.trim()) return ph.trim();
      const val = (el as HTMLInputElement).value;
      if (val && val.trim()) return val.trim();
      const title = el.getAttribute('title');
      if (title && title.trim()) return title.trim();
      return '';
    };

    const cssEscape = (s: string): string => (window.CSS && CSS.escape ? CSS.escape(s) : s.replace(/"/g, '\\"'));

    const selectorFor = (el: Element): string => {
      const dt = el.getAttribute('data-test');
      if (dt) return `[data-test="${dt}"]`;
      const dti = el.getAttribute('data-testid');
      if (dti) return `[data-testid="${dti}"]`;
      const id = el.getAttribute('id');
      if (id && !/^[0-9]/.test(id)) return `#${cssEscape(id)}`;
      const name = el.getAttribute('name');
      if (name) return `${el.tagName.toLowerCase()}[name="${name}"]`;
      const role = roleOf(el);
      const nm = accessibleName(el);
      if (nm) return `role=${role}[name="${nm.replace(/"/g, '\\"').slice(0, 60)}"]`;
      // Fallback: nth-of-type path (last resort)
      const tag = el.tagName.toLowerCase();
      const parent = el.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
        const idx = sameTag.indexOf(el) + 1;
        return `${tag}:nth-of-type(${idx})`;
      }
      return tag;
    };

    const seen = new Set<string>();
    const out: any[] = [];
    document.querySelectorAll(INTERACTIVE).forEach((el) => {
      if (!isVisible(el)) return;
      const selector = selectorFor(el);
      const name = accessibleName(el);
      const key = `${selector}|${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({
        role: roleOf(el),
        name,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        selector,
      });
    });
    return out;
  });
}

// ─────────────────────────── link discovery ───────────────────────────
async function sameOriginLinks(page: Page, origin: string): Promise<string[]> {
  const hrefs: string[] = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]')).map((a) => (a as HTMLAnchorElement).href),
  );
  const skip = /(logout|signout|sign-out|log-out)/i; // never follow logout — it kills the session
  return Array.from(
    new Set(
      hrefs
        .filter((h) => h.startsWith(origin))
        .map((h) => h.split('#')[0]) // drop fragments
        .filter((h) => !skip.test(h)),
    ),
  );
}

// ─────────────────────────── crawl (BFS) ───────────────────────────
async function crawl(): Promise<PageInfo[]> {
  const browser: Browser = await chromium.launch({ headless: !HEADED });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const origin = new URL(BASE_URL!).origin;

  const pages: PageInfo[] = [];
  const visited = new Set<string>();
  const queue: string[] = [BASE_URL!];

  await page.goto(BASE_URL!, { waitUntil: 'domcontentloaded' });
  if (DO_LOGIN) await tryLogin(page);

  while (queue.length && pages.length < MAX_PAGES) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      if (page.url().split('#')[0] !== url) {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(800);
      }
      const elements = await extractElements(page);
      const title = await page.title();
      const route = new URL(page.url()).pathname || '/';
      pages.push({ url: page.url(), route, title, elements });
      console.log(`🔎 ${route}  —  ${elements.length} elements  (${pages.length}/${MAX_PAGES})`);

      for (const link of await sameOriginLinks(page, origin)) {
        if (!visited.has(link) && !queue.includes(link)) queue.push(link);
      }
    } catch (e: any) {
      console.warn(`⚠️  Skipped ${url}: ${e.message}`);
    }
  }

  await browser.close();
  return pages;
}

// ─────────────────────────── main ───────────────────────────
(async () => {
  console.log(`🗺️  App Scanner — target: ${BASE_URL}  (max ${MAX_PAGES} pages, login=${DO_LOGIN})`);
  const pages = await crawl();
  const totalElements = pages.reduce((n, p) => n + p.elements.length, 0);
  const appMap = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    pageCount: pages.length,
    elementCount: totalElements,
    pages,
  };
  const outAbs = path.resolve(OUT_PATH);
  fs.writeFileSync(outAbs, JSON.stringify(appMap, null, 2));
  console.log(`\n✅ Wrote ${outAbs}`);
  console.log(`   ${pages.length} pages, ${totalElements} interactive elements`);
})().catch((e) => {
  console.error('❌ Scanner failed:', e);
  process.exit(1);
});
