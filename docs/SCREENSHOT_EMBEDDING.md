# Screenshot Embedding in Cucumber HTML Reports

## Overview

The Everest Framework supports automatic screenshot embedding in Cucumber HTML reports. Screenshots can be embedded for both **failed** and **passed** scenarios based on a configuration flag.

---

## 🎯 Features

✅ **Automatic screenshot on failure** - Always captures and saves screenshots for failed scenarios  
✅ **Optional embedding** - Control whether screenshots are embedded in HTML reports  
✅ **Passed scenario screenshots** - Optionally capture screenshots for successful tests  
✅ **Manual screenshots** - Embed screenshots taken via step definitions  
✅ **Full-page screenshots** - Captures entire page, not just viewport  

---

## 🚀 Usage

### Enable Screenshot Embedding

Set the `EMBED_SCREENSHOTS` environment variable to `true`:

```bash
# Enable screenshot embedding
export EMBED_SCREENSHOTS=true  # Linux/Mac
set EMBED_SCREENSHOTS=true     # Windows CMD
$env:EMBED_SCREENSHOTS="true"  # Windows PowerShell

# Run tests
npm run test:headed
```

### Using NPM Scripts

We've added convenient npm scripts for screenshot embedding:

```bash
# Run all tests with screenshots embedded
npm run test:with-screenshots

# Run tests headed with screenshots
npm run test:with-screenshots:headed

# Run smoke tests with screenshots
npm run test:smoke:with-screenshots
```

### Disable Screenshot Embedding (Default)

By default, screenshots are **saved to files** but **not embedded** in reports:

```bash
# Screenshots saved to files only (default)
npm run test:headed
npm run test:smoke
```

---

## 📸 Screenshot Behavior

### When `EMBED_SCREENSHOTS=false` (Default)

| Scenario Status | Screenshot Saved | Embedded in Report |
|----------------|------------------|-------------------|
| Failed         | ✅ Yes           | ❌ No             |
| Passed         | ❌ No            | ❌ No             |
| Manual Step    | ✅ Yes           | ❌ No             |

**Location:** `test-results/screenshots/`

### When `EMBED_SCREENSHOTS=true`

| Scenario Status | Screenshot Saved | Embedded in Report |
|----------------|------------------|-------------------|
| Failed         | ✅ Yes           | ✅ Yes            |
| Passed         | ✅ Yes           | ✅ Yes            |
| Manual Step    | ✅ Yes           | ✅ Yes            |

**Location:** `test-results/screenshots/` + embedded in HTML report

---

## 🔧 Configuration

### Environment Variables

```bash
# Enable screenshot embedding
EMBED_SCREENSHOTS=true

# Disable screenshot embedding (default)
EMBED_SCREENSHOTS=false
# or simply don't set the variable
```

### In package.json

```json
{
  "scripts": {
    "test:with-screenshots": "cross-env EMBED_SCREENSHOTS=true cucumber-js",
    "test:with-screenshots:headed": "cross-env HEADLESS=false EMBED_SCREENSHOTS=true cucumber-js --parallel 4"
  }
}
```

### In CI/CD Pipeline

**Azure DevOps:**
```yaml
- script: |
    export EMBED_SCREENSHOTS=true
    npm run test:smoke
  displayName: 'Run Smoke Tests with Screenshots'
```

**GitHub Actions:**
```yaml
- name: Run tests with screenshots
  run: npm run test:with-screenshots
  env:
    EMBED_SCREENSHOTS: true
```

---

## 📝 Manual Screenshot Step

You can also take manual screenshots in your feature files:

```gherkin
Feature: User Login

  Scenario: Successful login
    Given I navigate to "https://example.com/login"
    When I enter "user@example.com" in "Email"
    And I enter "Password123!" in "Password"
    Then I take a screenshot named "before-login"
    When I click on "Login"
    Then I should see "Welcome"
    And I take a screenshot named "after-login"
```

**With `EMBED_SCREENSHOTS=true`:**
- Screenshots are saved to `test-results/screenshots/`
- Screenshots are embedded in the Cucumber HTML report

**With `EMBED_SCREENSHOTS=false`:**
- Screenshots are only saved to `test-results/screenshots/`

---

## 📊 Viewing Screenshots in Reports

### Cucumber HTML Report

After running tests with screenshot embedding:

```bash
# Run tests with screenshots
npm run test:with-screenshots:headed

# View the HTML report
open test-results/cucumber-report.html
```

Screenshots will appear inline in the report:
- **Failed scenarios:** Screenshot shows the failure state
- **Passed scenarios:** Screenshot shows the final state
- **Manual screenshots:** Appear at the step where they were taken

### Screenshot Files

All screenshots are also saved as PNG files:

```
test-results/screenshots/
├── Successful_login_1708518234567.png
├── Failed_login_1708518245678.png
├── before-login_1708518256789.png
└── after-login_1708518267890.png
```

---

## 🎨 Example Feature with Screenshots

```gherkin
@login @screenshots
Feature: Login with Visual Verification

  Scenario: Login flow with screenshots
    Given I navigate to "https://example.com/login"
    And I take a screenshot named "login-page"
    
    When I enter "user@example.com" in "Email"
    And I enter "Password123!" in "Password"
    And I take a screenshot named "filled-form"
    
    When I click on "Login"
    And I wait for 2 seconds
    Then I should see "Welcome"
    And I take a screenshot named "dashboard"
    
    # Screenshot automatically taken if this fails
    Then the URL should contain "dashboard"
```

**Run with screenshots:**
```bash
npm run test:with-screenshots:headed
```

---

## ⚡ Performance Considerations

### Impact on Test Execution

| Configuration | Screenshot Count | Performance Impact |
|--------------|------------------|-------------------|
| Default (no embedding) | Only on failure | Minimal |
| `EMBED_SCREENSHOTS=true` | Every scenario | Moderate (~200-500ms per screenshot) |
| Manual steps only | As specified | Controlled |

### Recommendations

**For Local Development:**
```bash
# Fast execution, screenshots only on failure
npm run test:headed
```

**For Debugging:**
```bash
# Capture everything for analysis
npm run test:with-screenshots:headed
```

**For CI/CD:**
```bash
# Smoke tests with screenshots for quick feedback
npm run test:smoke:with-screenshots
```

**For Regression:**
```bash
# Full regression without screenshots (faster)
npm run test:regression
```

---

## 🔍 Troubleshooting

### Screenshots Not Appearing in Report

**Check:**
1. `EMBED_SCREENSHOTS` is set to `true`
2. Cucumber HTML reporter is configured in `cucumber.js`
3. Test is actually running (not skipped)

**Verify:**
```bash
# Check environment variable
echo $EMBED_SCREENSHOTS  # Linux/Mac
echo %EMBED_SCREENSHOTS%  # Windows CMD
$env:EMBED_SCREENSHOTS   # Windows PowerShell
```

### Screenshots Too Large

**Solution:** Adjust screenshot options in `hooks.ts`:

```typescript
// Take viewport screenshot instead of full page
const screenshot = await this.page.screenshot({ fullPage: false });
```

### Missing Screenshot Directory

The framework automatically creates the directory, but you can manually create it:

```bash
mkdir -p test-results/screenshots
```

---

## 📚 Related Documentation

- `GENERIC_STEPS_REFERENCE.md` - All available steps including screenshot step
- `RUNNING_TESTS.md` - How to run tests with different configurations
- `AZURE_DEVOPS_INTEGRATION.md` - CI/CD integration with screenshots

---

## 🎯 Best Practices

### ✅ DO:
- Use `EMBED_SCREENSHOTS=true` for debugging failed tests
- Take manual screenshots at critical points in the flow
- Use descriptive names for manual screenshots
- Review screenshots in CI/CD for visual regression

### ❌ DON'T:
- Enable embedding for all tests in CI/CD (slows down execution)
- Take screenshots in every step (creates bloat)
- Forget to check screenshot directory size periodically
- Commit screenshots to version control

---

**Framework Version:** 1.0.0  
**Last Updated:** February 2026
