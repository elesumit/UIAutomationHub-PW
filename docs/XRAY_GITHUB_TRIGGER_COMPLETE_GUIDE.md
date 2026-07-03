# 🎯 Complete Guide: Trigger Playwright Tests from Jira Xray

## Overview

This guide provides step-by-step instructions to set up automated Playwright test execution triggered from Jira Xray Test Executions. When you create a Test Execution in Jira, tests automatically run in GitHub Actions cloud and results upload back to Xray.

---

## 📋 Prerequisites

- GitHub repository with Playwright tests
- Jira project with Xray installed
- Admin or automation access in Jira
- GitHub account with repository access

---

## 🔧 Setup Steps

### **Step 1: Create GitHub Personal Access Token**

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Configure:
   - **Name:** `Xray Webhook Trigger`
   - **Expiration:** 90 days (or your preference)
   - **Scopes:** 
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
4. Click **"Generate token"**
5. **Copy the token immediately** (format: `ghp_xxxxxxxxxxxxx`)
6. **Save it securely** - you won't see it again!

---

### **Step 2: Authorize Token for SSO (If Required)**

If your organization uses SAML SSO:

1. Go to: https://github.com/settings/tokens
2. Find your token: **"Xray Webhook Trigger"**
3. Click **"Configure SSO"** or **"Enable SSO"**
4. Find your organization (e.g., `project-atlas`)
5. Click **"Authorize"**
6. Confirm authorization

---

### **Step 3: Create GitHub Workflow File**

Create `.github/workflows/xray-trigger.yml` in your repository:

```yaml
name: 🎯 Xray Triggered Test Execution

on:
  repository_dispatch:
    types: [xray-trigger]

jobs:
  run-tests:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: 📦 Install dependencies
        run: npm install
        
      - name: 🌐 Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: 📝 Create .env file
        run: |
          cat > .env << EOF
          # Environment Configuration
          ENV=QA
          BROWSER=chromium
          HEADLESS=true
          
          # CE Portal URLs
          CE_QA_URL=${{ secrets.CE_QA_URL }}
          CE_UAT_URL=${{ secrets.CE_UAT_URL }}
          
          # Salesforce URLs
          SF_QA_URL=${{ secrets.SF_QA_URL }}
          SF_UAT_URL=${{ secrets.SF_UAT_URL }}
          
          # Credentials
          CE_UserName=${{ secrets.CE_USERNAME }}
          CE_Password=${{ secrets.CE_PASSWORD }}
          CEUAT_UserName=${{ secrets.CEUAT_USERNAME }}
          CEUAT_Password=${{ secrets.CEUAT_PASSWORD }}
          
          SF_UserName=${{ secrets.SF_USERNAME }}
          SF_Password=${{ secrets.SF_PASSWORD }}
          SFQA_UserName=${{ secrets.SFQA_USERNAME }}
          SFQA_Password=${{ secrets.SFQA_PASSWORD }}
          
          # Xray Configuration
          XRAY_CLIENT_ID=${{ secrets.XRAY_CLIENT_ID }}
          XRAY_CLIENT_SECRET=${{ secrets.XRAY_CLIENT_SECRET }}
          XRAY_PROJECT_KEY=BTC
          XRAY_TEST_PLAN_KEY=${{ github.event.client_payload.test_plan_key }}
          
          # Execution Environment
          CE_Portal_Execution_Env=QA
          
          # Jira Integration
          JIRA_USER=${{ secrets.JIRA_USER }}
          JIRA_API_TOKEN=${{ secrets.JIRA_API_TOKEN }}
          
          # Slack
          SLACK_WEBHOOK_URL=${{ secrets.SLACK_WEBHOOK_URL }}
          ENABLE_SLACK_NOTIFICATIONS=true
          
          # Video Recording
          RECORD_VIDEO=false
          EOF

      - name: 🧪 Run Tests
        id: test_execution
        continue-on-error: true
        run: |
          # Determine which test profile to run based on Xray payload
          TEST_PROFILE="${{ github.event.client_payload.test_profile }}"
          
          if [ -z "$TEST_PROFILE" ] || [ "$TEST_PROFILE" == "null" ]; then
            TEST_PROFILE="smoke"
          fi
          
          echo "🚀 Running $TEST_PROFILE tests triggered from Xray"
          echo "📋 Test Plan: ${{ github.event.client_payload.test_plan_key }}"
          
          case "$TEST_PROFILE" in
            smoke)
              npm run test:smoke:xray
              ;;
            regression)
              npm run test:regression:xray
              ;;
            *)
              npm run test:smoke:xray
              ;;
          esac

      - name: 📋 Upload test reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ github.run_number }}
          path: test-results/
          retention-days: 30

      - name: 📊 Test Summary
        if: always()
        run: |
          echo "## 🎯 Xray Triggered Test Execution" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "- **Triggered From:** Jira Xray" >> $GITHUB_STEP_SUMMARY
          echo "- **Test Plan:** ${{ github.event.client_payload.test_plan_key }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Test Profile:** ${{ github.event.client_payload.test_profile }}" >> $GITHUB_STEP_SUMMARY
          echo "- **Status:** ${{ steps.test_execution.outcome }}" >> $GITHUB_STEP_SUMMARY
```

---

### **Step 4: Push Workflow to GitHub**

```bash
git add .github/workflows/xray-trigger.yml
git commit -m "Add Xray trigger workflow for automated test execution"
git push origin main
```

Verify the file is in GitHub:
- Go to: `https://github.com/YOUR_ORG/YOUR_REPO/blob/main/.github/workflows/xray-trigger.yml`

---

### **Step 5: Create Jira Automation Rule**

#### **5.1 Navigate to Automation**

1. Go to Jira: https://automationhubpw.atlassian.net
2. Navigate to your project (e.g., **BUS Testing CoE**)
3. Click **Project settings** (bottom left)
4. Click **Automation** in the left menu
5. Click **"Create rule"**

---

#### **5.2 Add Trigger**

1. Click **"Add trigger"**
2. Select **"Field value changed"**
3. Configure:
   - **Fields to monitor:** `Issue Type`
   - **Change type:** `Any changes to the field value`
   - **For:** `Create work item`
4. Click **"Save"** or **"Next"**

---

#### **5.3 Add Action - Send Web Request**

1. Click **"Add action"**
2. Scroll down and select **"Send web request"**
3. Fill in the form:

**Webhook URL:**
```
https://api.github.com/repos/YOUR_ORG/YOUR_REPO/dispatches
```
*Replace `YOUR_ORG` and `YOUR_REPO` with your actual values*

**Example:**
```
https://api.github.com/repos/project-atlas/Testing-Automation-PlayWright/dispatches
```

**HTTP method:**
```
POST
```

**Web request body:**
- Click dropdown and select **"Custom data"**
- Paste this EXACTLY:

```json
{
  "event_type": "xray-trigger",
  "client_payload": {
    "test_plan_key": "{{issue.key}}",
    "test_profile": "smoke"
  }
}
```

**Headers - Add 3 headers:**

Click **"+ Add another header"** for each:

**Header 1:**
- **Key:** `Accept`
- **Value:** `application/vnd.github.v3+json`

**Header 2:**
- **Key:** `Authorization`
- **Value:** `Bearer ghp_YOUR_GITHUB_TOKEN_HERE`
  *(Replace with your actual GitHub token from Step 1)*

**Header 3:**
- **Key:** `Content-Type`
- **Value:** `application/json`

---

#### **5.4 Save and Enable Rule**

1. Click **"Next"**
2. **Name:** `Xray Trigger Playwright Tests`
3. **Description:** `Automatically triggers Playwright test execution in GitHub Actions when Test Execution is created`
4. Make sure toggle is **ON** (enabled)
5. Click **"Turn on rule"**

---

## 🧪 Testing the Integration

### **Method 1: Create Test Execution in Jira**

1. Go to your Test Plan in Jira (e.g., BTC-104)
2. Click **"Create Test Execution"**
3. Select the tests you want to run (e.g., BTC-80 for smoke tests)
4. Fill in any required fields
5. Click **"Create"**

**Expected Result:**
- Within 5-10 seconds, check GitHub Actions
- You should see a new workflow run: **"🎯 Xray Triggered Test Execution"**
- Tests run in GitHub cloud (3-5 minutes)
- Results automatically upload back to Jira Xray

---

### **Method 2: Manual API Test (Quick Test)**

Test the webhook directly:

```bash
curl -X POST \
  https://api.github.com/repos/YOUR_ORG/YOUR_REPO/dispatches \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "xray-trigger",
    "client_payload": {
      "test_plan_key": "BTC-104",
      "test_profile": "smoke"
    }
  }'
```

**Expected Result:**
- No output = success
- Check GitHub Actions immediately
- Workflow should start within seconds

---

## 📊 Monitoring Execution

### **In GitHub Actions:**
1. Go to: `https://github.com/YOUR_ORG/YOUR_REPO/actions`
2. Look for workflow: **"🎯 Xray Triggered Test Execution"**
3. Click on the run to see live logs
4. View test execution progress in real-time

### **In Jira Xray:**
1. Open the Test Execution you created
2. After 3-5 minutes, refresh the page
3. Test results will show PASS/FAIL status
4. Summary and description auto-populated with execution details

### **In Slack (if configured):**
1. Start notification when tests begin
2. Completion notification with results
3. Direct links to GitHub Actions and Jira Test Execution

---

## 🔍 Troubleshooting Guide

### **Issue 1: Workflow doesn't trigger at all**

**Symptoms:**
- Create Test Execution in Jira
- No workflow appears in GitHub Actions
- No error in Jira automation audit log

**Possible Causes & Solutions:**

#### **A. Workflow file not in GitHub**
**Check:**
```bash
# Verify file exists locally
ls .github/workflows/xray-trigger.yml

# Check if pushed to GitHub
git status
```

**Fix:**
```bash
git add .github/workflows/xray-trigger.yml
git commit -m "Add Xray trigger workflow"
git push origin main
```

**Verify:** Go to `https://github.com/YOUR_ORG/YOUR_REPO/blob/main/.github/workflows/xray-trigger.yml`

---

#### **B. GitHub token missing scopes**
**Check:**
- Go to: https://github.com/settings/tokens
- Find your token
- Verify scopes include:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Action workflows)

**Fix:**
- If scopes are missing, regenerate token with correct scopes
- Update token in Jira automation rule

---

#### **C. Jira automation rule disabled**
**Check:**
- Go to Jira automation rule
- Look for toggle switch at top
- Status should show **"ENABLED"**

**Fix:**
- Click toggle to enable
- Try creating Test Execution again

---

#### **D. Wrong trigger configuration**
**Check:**
- Jira automation trigger should be:
  - **Trigger:** Field value changed
  - **Field:** Issue Type
  - **Change type:** Any changes to the field value
  - **For:** Create work item

**Fix:**
- Edit the trigger in Jira automation rule
- Ensure it fires on Test Execution creation

---

### **Issue 2: HTTP 404 - Not Found**

**Symptoms:**
- Jira automation audit log shows:
  ```
  Unable to publish the web request - received HTTP status response: 404
  Error: "message":"Not Found"
  ```

**Cause:** Incorrect webhook URL

**Common Mistakes:**
- ❌ `https://api.github.com/rest/repos/repos#create-a-repository-dispatch-event`
- ❌ `https://github.com/ORG/REPO/dispatches`
- ❌ `https://api.github.com/repos/ORG/REPO/dispatch` (missing 'es')

**Correct Format:**
```
https://api.github.com/repos/ORG/REPO/dispatches
```

**Example:**
```
https://api.github.com/repos/project-atlas/Testing-Automation-PlayWright/dispatches
```

**Fix:**
1. Go to Jira automation rule
2. Click **"Rule details"**
3. Click on **"Then: Send web request"**
4. Update **Webhook URL** to correct format
5. Save the rule
6. Test again

**Verify:**
- Organization name matches your GitHub org
- Repository name matches exactly (case-sensitive)
- URL ends with `/dispatches`
- No extra paths or parameters

---

### **Issue 3: HTTP 403 - SAML Enforcement**

**Symptoms:**
- Jira automation audit log shows:
  ```
  Unable to publish the web request - received HTTP status response: 403
  Error: "message":"Resource protected by organization SAML enforcement. 
  You must grant your Personal Access token access to an organization within this enterprise."
  ```

**Cause:** GitHub organization uses SAML SSO and token is not authorized

**Fix - Step by Step:**

1. **Go to GitHub Token Settings:**
   - Navigate to: https://github.com/settings/tokens

2. **Find Your Token:**
   - Look for: "Xray Webhook Trigger" or your token name

3. **Configure SSO:**
   - Click **"Configure SSO"** button next to the token
   - A popup will appear showing organizations

4. **Authorize Organization:**
   - Find your organization (e.g., `project-atlas`)
   - Click **"Authorize"** button
   - Confirm authorization

5. **Verify Authorization:**
   - Token should now show "Authorized" next to organization name

6. **Test Again:**
   - Create new Test Execution in Jira
   - Should work now

**Alternative - Use Organization Token:**
If you can't authorize SSO:
- Ask GitHub org admin to create an **Organization Access Token**
- Use that token instead in Jira automation

---

### **Issue 4: HTTP 401 - Unauthorized**

**Symptoms:**
- Jira automation audit log shows:
  ```
  Unable to publish the web request - received HTTP status response: 401
  Error: "message":"Bad credentials"
  ```

**Possible Causes:**

#### **A. Token expired**
**Check:**
- Go to: https://github.com/settings/tokens
- Look for expiration date

**Fix:**
- Generate new token
- Update in Jira automation rule

---

#### **B. Token format incorrect**
**Check Authorization header:**
- Should be: `Bearer ghp_xxxxxxxxxxxxx`
- NOT: `ghp_xxxxxxxxxxxxx` (missing "Bearer ")
- NOT: `Bearer: ghp_xxxxxxxxxxxxx` (extra colon)

**Correct Format:**
```
Authorization: Bearer ghp_YOUR_TOKEN_HERE
```

**Fix:**
- Edit Jira automation rule
- Update Authorization header
- Ensure "Bearer " prefix with space

---

#### **C. Token revoked or deleted**
**Check:**
- Go to: https://github.com/settings/tokens
- Verify token still exists

**Fix:**
- Generate new token
- Update in Jira automation rule

---

### **Issue 5: Webhook body formatting issues**

**Symptoms:**
- Workflow doesn't trigger
- No clear error in audit log
- OR error about invalid JSON

**Common Mistakes:**

❌ **Extra quotes:**
```json
"{
  "event_type": "xray-trigger"
}"
```

❌ **Missing quotes:**
```json
{
  event_type: xray-trigger
}
```

❌ **Wrong variable syntax:**
```json
{
  "test_plan_key": "${issue.key}"
}
```

✅ **Correct Format:**
```json
{
  "event_type": "xray-trigger",
  "client_payload": {
    "test_plan_key": "{{issue.key}}",
    "test_profile": "smoke"
  }
}
```

**Fix:**
1. Copy the correct JSON exactly
2. Paste into Jira automation "Custom data" field
3. Don't modify the `{{issue.key}}` syntax
4. Ensure no extra spaces or line breaks

---

### **Issue 6: Wrong event_type**

**Symptoms:**
- Workflow file exists in GitHub
- No errors in Jira
- But workflow never runs

**Cause:** Event type mismatch

**Check:**
- Workflow expects: `types: [xray-trigger]`
- Webhook must send: `"event_type": "xray-trigger"`
- They must match exactly (case-sensitive)

**Fix:**
- Verify webhook body has: `"event_type": "xray-trigger"`
- Verify workflow has: `types: [xray-trigger]`
- Ensure spelling and case match

---

### **Issue 7: Tests run but results don't upload to Xray**

**Symptoms:**
- GitHub Actions workflow completes successfully
- But Test Execution in Jira shows no results

**Possible Causes:**

#### **A. Missing GitHub Secrets**
**Check:**
- Go to: `https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions`
- Verify these exist:
  - `XRAY_CLIENT_ID`
  - `XRAY_CLIENT_SECRET`
  - `JIRA_USER`
  - `JIRA_API_TOKEN`

**Fix:**
- Add missing secrets
- Re-run workflow

---

#### **B. JUnit report not generated**
**Check GitHub Actions logs:**
- Look for: `test-results/junit-report.xml`
- Verify file was created

**Fix:**
- Check test execution logs for errors
- Ensure tests actually ran
- Verify JUnit reporter is configured in `cucumber.js`

---

#### **C. Xray upload script error**
**Check GitHub Actions logs:**
- Look for step: "Upload test results to Jira Xray"
- Check for error messages

**Common Errors:**
- Invalid Xray credentials
- Network timeout
- Invalid project key

**Fix:**
- Verify `XRAY_CLIENT_ID` and `XRAY_CLIENT_SECRET` are correct
- Check `XRAY_PROJECT_KEY` matches your Jira project
- Review `xray-upload.ts` script for errors

---

### **Issue 8: Wrong tests execute**

**Symptoms:**
- Workflow runs
- But wrong tests execute (or no tests run)

**Cause:** Tag mismatch

**Example:**
- Webhook sends: `"test_profile": "smoke"`
- But feature file has: `@regression` tag
- Result: No tests run

**Fix:**

1. **Check feature file tags:**
```gherkin
@BTC-80 @smoke @regression
Scenario: Create Case and Validate in Salesforce
```

2. **Verify webhook payload:**
```json
{
  "test_profile": "smoke"
}
```

3. **Ensure npm script matches:**
```json
{
  "test:smoke:xray": "cucumber-js --profile smoke"
}
```

4. **Check cucumber profile:**
```javascript
smoke: [
  '--tags "@smoke"'
]
```

**All must align!**

---

### **Issue 9: Jira automation rule fires multiple times**

**Symptoms:**
- Create one Test Execution
- Multiple workflows trigger in GitHub

**Cause:** Trigger configured incorrectly

**Fix:**
- Check trigger is: **"Create work item"** (not "Edit work item")
- Add condition to filter only Test Execution issue type
- Disable duplicate rules

---

### **Issue 10: Slow test execution**

**Symptoms:**
- Tests take very long to complete
- Excessive wait times

**Cause:** Hard-coded waits in feature files

**Example:**
```gherkin
When I wait for 3 seconds
When I wait for 5 seconds
```

**Fix:**
- Replace with dynamic waits
- Use element visibility checks
- Reduce unnecessary wait times
- This is a test optimization issue, not integration issue

---

### **Issue 11: GitHub Actions quota exceeded**

**Symptoms:**
- Workflow doesn't start
- Error: "Workflow run quota exceeded"

**Cause:** Free tier limits reached

**GitHub Actions Free Tier:**
- Public repos: Unlimited
- Private repos: 2,000 minutes/month

**Fix:**
- Check usage: `https://github.com/settings/billing`
- Wait for quota reset (monthly)
- Upgrade to paid plan
- Optimize test execution time

---

### **Issue 12: Environment variables not loading**

**Symptoms:**
- Tests fail with "undefined" errors
- Missing credentials

**Cause:** .env file not created properly in workflow

**Check GitHub Actions logs:**
- Look for step: "Create .env file"
- Verify all secrets are populated

**Fix:**
- Ensure all required secrets exist in GitHub
- Check workflow YAML has correct secret names
- Verify .env file creation step completes successfully

---

## 🔧 Quick Diagnostic Checklist

Use this checklist to quickly diagnose issues:

### **Before Creating Test Execution:**

- [ ] Workflow file exists in GitHub: `.github/workflows/xray-trigger.yml`
- [ ] GitHub token created with `repo` and `workflow` scopes
- [ ] Token authorized for SSO (if organization uses SAML)
- [ ] Jira automation rule created and **ENABLED**
- [ ] Webhook URL is correct format
- [ ] Webhook body is valid JSON
- [ ] Authorization header has "Bearer " prefix
- [ ] All GitHub Secrets configured
- [ ] Feature files have correct tags

### **After Creating Test Execution:**

- [ ] Check Jira automation audit log for errors
- [ ] Check GitHub Actions for new workflow run
- [ ] Verify workflow is running (not queued/failed)
- [ ] Check GitHub Actions logs for errors
- [ ] Wait 3-5 minutes for completion
- [ ] Refresh Jira Test Execution page
- [ ] Verify results uploaded

### **If Still Not Working:**

1. **Test webhook manually with curl:**
   ```bash
   curl -X POST \
     https://api.github.com/repos/ORG/REPO/dispatches \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"event_type":"xray-trigger","client_payload":{"test_plan_key":"BTC-104","test_profile":"smoke"}}'
   ```

2. **Check curl response:**
   - No output = Success
   - Error message = Fix the error

3. **If curl works but Jira doesn't:**
   - Issue is with Jira automation configuration
   - Review webhook URL, headers, and body

4. **If curl doesn't work:**
   - Issue is with GitHub token or repository access
   - Verify token, SSO, and repository name

---

## 📞 Getting Help

If you've tried all troubleshooting steps and still have issues:

1. **Collect Information:**
   - Jira automation audit log screenshot
   - GitHub Actions log (if workflow ran)
   - Webhook configuration screenshot
   - Error messages

2. **Check Documentation:**
   - GitHub Actions: https://docs.github.com/en/actions
   - Xray API: https://docs.getxray.app/
   - Jira Automation: https://www.automationhubpw.atlassian.com/software/jira/guides/automation

3. **Common Support Channels:**
   - GitHub Community Forum
   - Atlassian Community
   - Internal DevOps team

---

## 📝 Configuration Reference

### **Test Profiles**

The webhook supports different test profiles:

**Smoke Tests:**
```json
{
  "event_type": "xray-trigger",
  "client_payload": {
    "test_plan_key": "{{issue.key}}",
    "test_profile": "smoke"
  }
}
```

**Regression Tests:**
```json
{
  "event_type": "xray-trigger",
  "client_payload": {
    "test_plan_key": "{{issue.key}}",
    "test_profile": "regression"
  }
}
```

---

### **Required GitHub Secrets**

Configure these in: `https://github.com/YOUR_ORG/YOUR_REPO/settings/secrets/actions`

**Xray Integration:**
- `XRAY_CLIENT_ID` - Xray API client ID
- `XRAY_CLIENT_SECRET` - Xray API client secret

**Jira Integration:**
- `JIRA_USER` - Jira email address
- `JIRA_API_TOKEN` - Jira API token

**Application URLs:**
- `CE_QA_URL` - CE Portal QA URL
- `CE_UAT_URL` - CE Portal UAT URL
- `SF_QA_URL` - Salesforce QA URL
- `SF_UAT_URL` - Salesforce UAT URL

**Credentials:**
- `CE_USERNAME` - CE Portal QA username
- `CE_PASSWORD` - CE Portal QA password
- `CEUAT_USERNAME` - CE Portal UAT username
- `CEUAT_PASSWORD` - CE Portal UAT password
- `SF_USERNAME` - Salesforce username
- `SF_PASSWORD` - Salesforce password
- `SFQA_USERNAME` - Salesforce QA username
- `SFQA_PASSWORD` - Salesforce QA password

**Notifications (Optional):**
- `SLACK_WEBHOOK_URL` - Slack webhook URL

---

## 🎯 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    XRAY → GITHUB TRIGGER FLOW                    │
└─────────────────────────────────────────────────────────────────┘

1. User Creates Test Execution in Jira Xray
   └─> Test Plan: BTC-104
   └─> Select Tests: BTC-80 (@smoke)

2. Jira Automation Rule Triggers
   └─> Field value changed: Issue Type
   └─> For: Create work item

3. Webhook Sent to GitHub API
   └─> POST https://api.github.com/repos/ORG/REPO/dispatches
   └─> Event: xray-trigger
   └─> Payload: { test_plan_key: "BTC-104", test_profile: "smoke" }

4. GitHub Actions Workflow Starts
   └─> Workflow: xray-trigger.yml
   └─> Runner: ubuntu-latest
   └─> Node.js: v20

5. Environment Setup
   └─> Checkout code
   └─> Install dependencies (npm install)
   └─> Install Playwright browsers
   └─> Create .env file with secrets

6. Test Execution
   └─> Run: npm run test:smoke:xray
   └─> Execute tests tagged with @smoke
   └─> Generate reports (HTML, JSON, JUnit)

7. Upload Results to Xray
   └─> Authenticate with Xray API
   └─> Upload JUnit XML report
   └─> Update Test Execution summary/description
   └─> Link to Test Plan

8. Notifications (if enabled)
   └─> Slack notification with results
   └─> Link to GitHub Actions run
   └─> Link to Jira Test Execution

9. Artifacts Stored
   └─> Test reports (30 days retention)
   └─> Screenshots on failure (14 days)
   └─> Videos on failure (14 days)

10. Results Visible in Jira
    └─> Test Execution shows PASS/FAIL
    └─> Summary auto-populated
    └─> Description includes execution details
```

---

## 🎉 Success Indicators

You'll know the integration is working when:

✅ GitHub Actions workflow runs automatically when Test Execution is created  
✅ Test results appear in Xray Test Execution  
✅ Test Execution has custom summary and description  
✅ Slack notification received (if enabled)  
✅ GitHub Actions artifacts are stored  
✅ Test Plan is linked to Test Execution  
✅ No error emails from Jira Automation  

---

## 📞 Support & Maintenance

### **Regular Maintenance:**

1. **Token Rotation:** Update GitHub token before expiration
2. **Secret Updates:** Keep GitHub Secrets up to date
3. **Audit Logs:** Regularly check Jira automation audit logs
4. **Workflow Updates:** Keep GitHub Actions versions updated

### **Best Practices:**

1. ✅ Use Test Plans for better traceability
2. ✅ Tag tests appropriately (@smoke, @regression)
3. ✅ Monitor GitHub Actions for failed runs
4. ✅ Review Xray Test Executions after automated runs
5. ✅ Enable Slack for immediate failure notifications
6. ✅ Keep workflow file in version control

---

## 📚 Additional Resources

- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **Xray API Documentation:** https://docs.getxray.app/display/XRAY/REST+API
- **Jira Automation Documentation:** https://www.automationhubpw.atlassian.com/software/jira/guides/automation
- **Playwright Documentation:** https://playwright.dev/

---

**Last Updated:** April 3, 2026  
**Version:** 1.0  
**Author:** Sumit Gupta  
**Status:** ✅ Tested and Working
