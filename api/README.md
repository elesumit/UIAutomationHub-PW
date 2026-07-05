# Automation Hub API (`/api/*`)

Backend for the Automation Hub site (`site/generator.html`, `site/execution.html`).
Azure **Functions v4** (Node 20), deployed to the **FC1 Flex Consumption** Function App
provisioned in `infra/functions.tf` and registered as the primary SWA's linked backend, so
these routes are served at `https://your-app.example.com/api/*` under the
site's Entra auth.

**Stateless** — talks only to GitHub Models, GitHub REST, Jira, and Xray. Nothing is
persisted to Azure (no database, no data storage). The only Azure storage is the FC1
runtime account.

## Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Liveness + config check |
| `/api/generate` | POST | Generate Gherkin via GitHub Models (gpt-4o) |
| `/api/save-to-github` | POST | Commit a feature file to the framework repo |
| `/api/save-to-local` | POST | Alias of save-to-github (no local FS in the cloud) |
| `/api/fetch-test-cases` | GET | List tests in Xray Test Plan XSP-58 |
| `/api/jira-issue-types` | GET | XSP project issue types |
| `/api/jira/story/{storyId}` | GET | Fetch a Jira story + parsed acceptance criteria |
| `/api/upload-to-jira-github` | POST | Import feature to Xray, link to XSP-58, commit to GitHub |
| `/api/create-test-execution` | POST | Create an Xray Test Execution, link to XSP-58 |
| `/api/execute-test` | POST | Dispatch the `xray-trigger` workflow in the test repo |
| `/api/check-workflow-status` | GET | Poll a GitHub Actions run status |
| `/api/get-test-report` | GET | Stream the cucumber HTML report from run artifacts |

## Configuration

All config comes from app settings (Key Vault references in `infra/functions.tf`):
`GITHUB_COPILOT_TOKEN`/`GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `JIRA_BASE_URL`,
`JIRA_USER`, `JIRA_API_TOKEN`, `XRAY_CLIENT_ID`, `XRAY_CLIENT_SECRET`.

## Local development

```bash
cd api
cp local.settings.json.example local.settings.json   # fill in real values (gitignored)
npm install
npm start            # func start — serves http://localhost:7071/api/*
```

## Security model & authorization

- **AuthN:** `/api/*` is served via the SWA linked-backend, so every request requires an
  authenticated tenant user (the site's Entra SSO). The Function App's own `auth_settings_v2`
  (`azure_static_web_app_v2`, `Return401`) validates the forwarded SWA principal; function
  routes are `authLevel: 'anonymous'` on purpose — Easy Auth enforces access, not function keys.
- **AuthZ is coarse (known, accept consciously):** the site gates on the `authenticated` role
  only, so **any** authenticated tenant user can call the write endpoints — `save-to-github`,
  `upload-to-jira-github`, `execute-test` — which act under the backend's GitHub PAT. If finer
  control is needed, role-gate these endpoints (custom SWA role + `x-ms-client-principal` check).
- **GitHub PAT scope:** `API_GITHUB_TOKEN` should be a **fine-grained PAT scoped to the single
  test repo** (Models + contents + workflow dispatch + actions:read) — *not* a broad classic PAT.
  This bounds the blast radius of the coarse authz above.
- **Write target branch:** `save-to-github` / `upload-to-jira-github` commit to
  `GITHUB_TARGET_BRANCH` (default `main`). Set it to a non-default branch (app setting /
  `var.github_target_branch`) so generated features land on a branch + PR instead of straight on `main`.
- **Secrets:** all tokens are KV-referenced (`infra/keyvault.tf`), never in code or plaintext
  app settings. The per-secret MI grants mean the backend can't read the AAD client secret.

## Deploy

Automatic via `.github/workflows/deploy-api.yml` on push to `main` under `api/**`.
Ported from `tools/ai-test-generator/server.js` (the original local Express version).

> **First-deploy caveats:**
> - Set the repo secrets (`API_GITHUB_TOKEN`, `JIRA_USER`, `JIRA_API_TOKEN`, `XRAY_CLIENT_ID`,
>   `XRAY_CLIENT_SECRET`) **before** the infra apply — otherwise Terraform writes empty KV
>   secrets and the backend 401s at runtime.
> - `Azure/functions-action@v1` on FC1 has had quirks in this stack; watch the first deploy and
>   fall back to a direct `az functionapp deployment` if it misbehaves.
