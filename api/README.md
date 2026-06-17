# Automation Hub API (`/api/*`)

Backend for the Automation Hub site (`site/generator.html`, `site/execution.html`).
Azure **Functions v4** (Node 20), deployed to the **FC1 Flex Consumption** Function App
provisioned in `infra/functions.tf` and registered as the primary SWA's linked backend, so
these routes are served at `https://automation-pw.internal.veradigm.com/api/*` under the
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
| `/api/fetch-test-cases` | GET | List tests in Xray Test Plan BTC-104 |
| `/api/jira-issue-types` | GET | BTC project issue types |
| `/api/jira/story/{storyId}` | GET | Fetch a Jira story + parsed acceptance criteria |
| `/api/upload-to-jira-github` | POST | Import feature to Xray, link to BTC-104, commit to GitHub |
| `/api/create-test-execution` | POST | Create an Xray Test Execution, link to BTC-104 |
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

## Deploy

Automatic via `.github/workflows/deploy-api.yml` on push to `main` under `api/**`.
Ported from `tools/ai-test-generator/server.js` (the original local Express version).
