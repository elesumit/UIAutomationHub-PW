# 🎯 Xray to GitHub Actions Integration Guide

## Overview

This guide explains how to trigger Playwright test execution from Jira Xray using GitHub Actions.

---

## ✅ What You Already Have

1. **GitHub Actions Workflow** - `playwright.yml` (manual trigger)
2. **Xray Upload Integration** - Results automatically upload to Xray
3. **New Xray Trigger Workflow** - `xray-trigger.yml` (API trigger)

---

## 🔧 Setup Steps

### Step 1: Create GitHub Personal Access Token (PAT)

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token (classic)**
3. Name: `Xray Test Trigger`
4. Expiration: Choose appropriate duration
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click **Generate token**
7. **Copy the token** - you won't see it again!

**Token format:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 2: Configure Xray Webhook

#### Option A: Using Xray Cloud Automation

1. Go to Jira → **Apps** → **Xray** → **Settings**
2. Navigate to **Automation** → **Webhooks**
3. Click **Create Webhook**
4. Configure:
   - **Name:** `GitHub Actions Trigger`
   - **URL:** `https://api.github.com/repos/YOUR_ORG/YOUR_REPO/dispatches`
   - **Method:** `POST`
   - **Headers:**
     ```
     Accept: application/vnd.github.v3+json
     Authorization: Bearer YOUR_GITHUB_PAT
     Content-Type: application/json
     ```
   - **Body:**
     ```json
     {
       "event_type": "xray-trigger",
       "client_payload": {
         "test_plan_key": "${testPlan.key}",
         "test_profile": "smoke"
       }
     }
     ```
   - **Trigger:** When Test Execution is created or updated

#### Option B: Using Jira Automation Rules

1. Go to Jira → **Project Settings** → **Automation**
2. Click **Create rule**
3. **Trigger:** Test Execution created/updated
4. **Action:** Send web request
   - **URL:** `https://api.github.com/repos/YOUR_ORG/YOUR_REPO/dispatches`
   - **HTTP method:** POST
   - **Headers:**
     ```
     Accept: application/vnd.github.v3+json
     Authorization: Bearer YOUR_GITHUB_PAT
     Content-Type: application/json
     ```
   - **Body:**
     ```json
     {
       "event_type": "xray-trigger",
       "client_payload": {
         "test_plan_key": "{{issue.key}}",
         "test_profile": "smoke"
       }
     }
     ```

---

### Step 3: Replace Placeholders

In the webhook configuration, replace:
- `YOUR_ORG` → Your GitHub organization/username
- `YOUR_REPO` → Repository name (e.g., `Automation-PW`)
- `YOUR_GITHUB_PAT` → The token from Step 1

**Example URL:**
```
https://api.github.com/repos/Automation-PW/dispatches
```

---

## 🚀 How to Use

### Method 1: From Xray Test Plan

1. Open a Test Plan in Jira (e.g., XSP-58)
2. Click **Execute** or create a new Test Execution
3. The webhook automatically triggers GitHub Actions
4. Tests run in GitHub Actions
5. Results upload back to Xray

### Method 2: Manual API Trigger (Testing)

Use this to test the integration:

```bash
curl -X POST \
  https://api.github.com/repos/YOUR_ORG/YOUR_REPO/dispatches \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "xray-trigger",
    "client_payload": {
      "test_plan_key": "XSP-58",
      "test_profile": "smoke"
    }
  }'
```

---

## 📊 Workflow Parameters

The Xray trigger workflow accepts these parameters via `client_payload`:

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `test_plan_key` | Xray Test Plan Key | Required | XSP-58, XSP-105, etc. |
| `test_profile` | Test suite to run | `smoke` | `smoke`, `regression` |

**Example payloads:**

**Smoke Tests:**
```json
{
  "event_type": "xray-trigger",
  "client_payload": {
    "test_plan_key": "XSP-58",
    "test_profile": "smoke"
  }
}
```

**Regression Tests:**
```json
{
  "event_type": "xray-trigger",
  "client_payload": {
    "test_plan_key": "XSP-58",
    "test_profile": "regression"
  }
}
```

---

## 🔍 Monitoring Execution

### In GitHub:
1. Go to **Actions** tab in your repository
2. Look for workflow: **🎯 Xray Triggered Test Execution**
3. Click on the run to see details

### In Xray:
1. Results automatically upload to the Test Execution
2. Check the Test Execution in Jira for results
3. Summary and description are auto-populated

### In Slack (if configured):
1. Start notification when tests begin
2. Completion notification with results
3. Link to Jira Test Execution

---

## 🔐 Required GitHub Secrets

Ensure these secrets are configured in GitHub repository settings:

### Xray Integration
- `XRAY_CLIENT_ID` - Xray API client ID
- `XRAY_CLIENT_SECRET` - Xray API client secret

### Jira Integration
- `JIRA_USER` - Jira email address
- `JIRA_API_TOKEN` - Jira API token

### Application URLs
- `CE_QA_URL` - CE Portal QA URL
- `CE_UAT_URL` - CE Portal UAT URL
- `SF_QA_URL` - Salesforce QA URL
- `SF_UAT_URL` - Salesforce UAT URL

### Credentials
- `CE_USERNAME` - CE Portal QA username
- `CE_PASSWORD` - CE Portal QA password
- `CEUAT_USERNAME` - CE Portal UAT username
- `CEUAT_PASSWORD` - CE Portal UAT password
- `SF_USERNAME` - Salesforce username
- `SF_PASSWORD` - Salesforce password
- `SFQA_USERNAME` - Salesforce QA username
- `SFQA_PASSWORD` - Salesforce QA password

### Notifications
- `SLACK_WEBHOOK_URL` - Slack webhook URL (optional)

---

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         XRAY TRIGGER FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. User Action in Xray
   └─> Create/Update Test Execution in Jira
        └─> Test Plan: XSP-58

2. Xray Webhook Triggered
   └─> POST to GitHub API
        └─> Event: xray-trigger
        └─> Payload: { test_plan_key: "XSP-58", test_profile: "smoke" }

3. GitHub Actions Triggered
   └─> Workflow: xray-trigger.yml
        └─> Checkout code
        └─> Install dependencies
        └─> Install Playwright browsers
        └─> Create .env file with secrets

4. Test Execution
   └─> Run: npm run test:smoke:xray
        └─> Execute Cucumber tests
        └─> Generate reports (HTML, JSON, JUnit)

5. Upload Results to Xray
   └─> Authenticate with Xray API
   └─> Upload JUnit XML
   └─> Update Test Execution summary/description
   └─> Link to Test Plan: XSP-58

6. Notifications
   └─> Slack notification (if enabled)
        └─> Test results summary
        └─> Link to GitHub Actions run
        └─> Link to Jira Test Execution

7. Artifacts Stored
   └─> Test reports (30 days)
   └─> Screenshots (on failure, 14 days)
   └─> Videos (on failure, 14 days)
```

---

## 🐛 Troubleshooting

### Webhook not triggering GitHub Actions

**Check:**
1. GitHub PAT has correct permissions (`repo`, `workflow`)
2. PAT is not expired
3. Repository URL is correct in webhook
4. Webhook is enabled in Xray

**Test manually:**
```bash
# Test the GitHub API endpoint
curl -X POST \
  https://api.github.com/repos/YOUR_ORG/YOUR_REPO/dispatches \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"xray-trigger","client_payload":{"test_plan_key":"XSP-58","test_profile":"smoke"}}'
```

### Tests run but results don't upload to Xray

**Check:**
1. `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` are set in GitHub Secrets
2. `JIRA_USER` and `JIRA_API_TOKEN` are set in GitHub Secrets
3. JUnit report is generated: `test-results/junit-report.xml`
4. Check GitHub Actions logs for Xray upload errors

### Slack notifications not sent

**Check:**
1. `SLACK_WEBHOOK_URL` is set in GitHub Secrets
2. `ENABLE_SLACK_NOTIFICATIONS=true` in .env
3. Webhook URL is valid and active

---

## 📝 Best Practices

1. **Use Test Plans:** Always link Test Executions to Test Plans for better traceability
2. **Naming Convention:** Use consistent Test Plan keys (e.g., XSP-58 for Smoke, XSP-105 for Regression)
3. **Monitor Runs:** Check GitHub Actions regularly for failed runs
4. **Rotate Tokens:** Update GitHub PAT before expiration
5. **Review Results:** Always review Xray Test Executions after automated runs
6. **Slack Alerts:** Enable Slack for immediate failure notifications

---

## 🔄 Alternative: Manual Trigger from GitHub

You can also manually trigger tests from GitHub Actions UI:

1. Go to **Actions** → **🎭 Automation - Playwright Test Executor**
2. Click **Run workflow**
3. Select:
   - Test profile (smoke/regression)
   - Environment (QA/UAT)
   - Browser
   - Other options
4. Enter Test Plan Key (e.g., XSP-58)
5. Click **Run workflow**

---

## 📞 Support

For issues or questions:
- Check GitHub Actions logs
- Review Xray webhook logs in Jira
- Verify all secrets are configured correctly
- Test webhook manually using curl command

---

## 🎉 Success Indicators

You'll know the integration is working when:

✅ GitHub Actions workflow runs automatically when Test Execution is created in Xray
✅ Test results appear in Xray Test Execution
✅ Test Execution has custom summary and description
✅ Slack notification received (if enabled)
✅ GitHub Actions artifacts are stored
✅ Test Plan is linked to Test Execution

---

**Last Updated:** April 3, 2026
**Version:** 1.0
