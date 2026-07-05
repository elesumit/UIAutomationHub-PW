# E2E Test Execution Flow - CI/CD Pipeline

## 🔄 End-to-End Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TRIGGER EXECUTION                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │   Manual     │ │  Pull Request│ │   Scheduled  │
            │   Dispatch   │ │    Trigger   │ │    (Cron)    │
            └──────────────┘ └──────────────┘ └──────────────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS WORKFLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│  Workflow: playwright.yml                                               │
│  Runner: ubuntu-latest                                                  │
│  Profile: smoke / regression                                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    📢 SLACK NOTIFICATION - STARTED                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Message: "🚀 Test Execution Started"                                   │
│  Details:                                                                │
│    • Profile: smoke / regression                                        │
│    • Triggered by: @username                                            │
│    • Branch: main / feature-branch                                      │
│    • Workflow Run: #123                                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SETUP & INSTALLATION                              │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Checkout Code                                                        │
│  2. Setup Node.js (v18)                                                  │
│  3. Install Dependencies (npm ci)                                        │
│  4. Install Playwright Browsers (Chromium)                               │
│  5. Inject Environment Variables (GitHub Secrets)                        │
│     • CE_QA_URL, SF_QA_URL                                              │
│     • CE_USERNAME, CE_PASSWORD                                          │
│     • SF_USERNAME, SF_PASSWORD                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TEST EXECUTION                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  Command: npm run smoke / npm run regression                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Cucumber + Playwright Execution                               │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │  • Parse Feature Files                                         │    │
│  │  • Execute Step Definitions                                    │    │
│  │  • Interact with CE Portal & Salesforce                        │    │
│  │  • Capture Screenshots on Failure                              │    │
│  │  • Generate Logs & Reports                                     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Real-time Logs:                                                        │
│    ✓ Login to CE Portal                                                │
│    ✓ Create Case #00205069                                             │
│    ✓ Verify in Salesforce                                              │
│    ✓ Status: New ✓                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GENERATE REPORTS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  JUnit XML   │  │ Cucumber JSON│  │  HTML Report │                 │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤                 │
│  │ • Test Cases │  │ • Scenarios  │  │ • Visual     │                 │
│  │ • Pass/Fail  │  │ • Steps      │  │ • Interactive│                 │
│  │ • Duration   │  │ • Tags       │  │ • Screenshots│                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    UPLOAD TO GITHUB ARTIFACTS                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Artifacts Uploaded:                                                     │
│    📦 test-results/                                                     │
│       ├── junit-report.xml                                              │
│       ├── cucumber-report.json                                          │
│       ├── cucumber-report.html                                          │
│       ├── screenshots/                                                  │
│       └── logs/                                                         │
│                                                                          │
│  Retention: 30 days                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SYNC RESULTS TO JIRA XRAY                             │
├─────────────────────────────────────────────────────────────────────────┤
│  API: https://xray.cloud.getxray.app/api/v2                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Xray Import                                                   │    │
│  ├────────────────────────────────────────────────────────────────┤    │
│  │  • Parse JUnit XML                                             │    │
│  │  • Map Test Cases to Jira Issues (@XSP-XX tags)               │    │
│  │  • Create Test Execution                                       │    │
│  │  • Update Test Results (Pass/Fail)                            │    │
│  │  • Attach Screenshots & Logs                                   │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Jira Updated:                                                          │
│    ✓ XSP-80: PASSED ✅                                                 │
│    ✓ XSP-85: PASSED ✅                                                 │
│    ✓ Test Execution: TE-456 created                                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                📢 SLACK NOTIFICATION - COMPLETED                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Message: "✅ Test Execution Completed Successfully"                    │
│                                                                          │
│  Summary:                                                                │
│    • Total Tests: 15                                                    │
│    • Passed: 14 ✅                                                      │
│    • Failed: 1 ❌                                                       │
│    • Duration: 8m 32s                                                   │
│                                                                          │
│  Links:                                                                  │
│    🔗 GitHub Workflow Run                                               │
│    🔗 Test Report (Artifacts)                                           │
│    🔗 Jira Test Execution (TE-456)                                      │
│                                                                          │
│  Failed Tests:                                                           │
│    ❌ XSP-82: Login with invalid credentials                            │
│       Screenshot: 📸 attached                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         STAKEHOLDER ACCESS                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   Slack      │  │  Jira Xray   │  │   GitHub     │                 │
│  │  Channel     │  │  Dashboard   │  │  Artifacts   │                 │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤                 │
│  │ • Real-time  │  │ • Test       │  │ • Detailed   │                 │
│  │   Updates    │  │   Coverage   │  │   Reports    │                 │
│  │ • Quick      │  │ • Trends     │  │ • Screenshots│                 │
│  │   Summary    │  │ • Traceability│ │ • Logs       │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📊 Execution Metrics

| Metric | Value |
|--------|-------|
| **Average Execution Time** | 8-12 minutes |
| **Parallel Execution** | Supported |
| **Browser Coverage** | Chromium (primary) |
| **Environment** | QA, UAT, Production |
| **Notification Channels** | Slack, Email |
| **Report Retention** | 30 days (GitHub), Permanent (Jira) |

## 🔔 Slack Notification Examples

### Started Notification
```
🚀 Test Execution Started
━━━━━━━━━━━━━━━━━━━━━━━━
Profile: smoke
Triggered by: @sumit.gupta
Branch: main
Workflow: #456
━━━━━━━━━━━━━━━━━━━━━━━━
```

### Completed Notification
```
✅ Test Execution Completed
━━━━━━━━━━━━━━━━━━━━━━━━
Total: 15 | Passed: 14 ✅ | Failed: 1 ❌
Duration: 8m 32s
━━━━━━━━━━━━━━━━━━━━━━━━
🔗 View Report | 🔗 Jira TE-456
```
