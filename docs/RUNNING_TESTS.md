# Running Tests - Quick Reference

## 🚀 End-to-End Automation (Fully Automated)

### **Cucumber/Gherkin Tests (BDD)**

```bash
# Headless mode (fastest, no visible browser)
npm test

# Headed mode (visible browser, fully automated)
npm run test:headed

# Debug mode (pauses execution - NOT for automation)
npm run test:debug
```

### **Playwright Tests**

```bash
# Headless mode (fastest, no visible browser)
npm run test:playwright

# Headed mode (visible browser, fully automated)
npm run test:playwright:headed

# Specific test file
npx playwright test automation/tests/login.spec.ts

# Specific test file in headed mode
npx playwright test automation/tests/login.spec.ts --headed
```

## 🐛 Debugging & Development (Manual Interaction)

### **Playwright Inspector (Find Locators)**

```bash
# Debug mode - pauses at each step
npm run test:playwright:debug

# Inspector mode with environment variable
npm run test:playwright:inspector
```

**Use Inspector to:**
- Find correct locators visually
- Debug failing tests step-by-step
- Understand why a test fails
- See Playwright's recommended locators

**⚠️ Inspector pauses execution and requires manual interaction - NOT for automated E2E runs**

### **Codegen (Record Actions)**

```bash
# Start recording from scratch
npm run codegen

# Record from specific URL
npm run codegen https://example.com
```

**Use Codegen to:**
- Record user actions
- Get Playwright-recommended locators
- Generate test code automatically
- Create feature files from recordings

### **UI Mode (Interactive Test Runner)**

```bash
npm run test:playwright:ui
```

**Use UI Mode to:**
- Watch tests run interactively
- Pause/resume execution
- See test results in real-time
- Debug specific tests

## 📊 Comparison Table

| Command | Mode | Automated? | Browser Visible? | Use Case |
|---------|------|------------|------------------|----------|
| `npm test` | Cucumber Headless | ✅ Yes | ❌ No | CI/CD, Fast E2E |
| `npm run test:headed` | Cucumber Headed | ✅ Yes | ✅ Yes | Local E2E, Demos |
| `npm run test:debug` | Cucumber Debug | ❌ No | ✅ Yes | Debugging Cucumber |
| `npm run test:playwright` | Playwright Headless | ✅ Yes | ❌ No | CI/CD, Fast E2E |
| `npm run test:playwright:headed` | Playwright Headed | ✅ Yes | ✅ Yes | Local E2E, Demos |
| `npm run test:playwright:debug` | Playwright Inspector | ❌ No | ✅ Yes | Finding Locators |
| `npm run test:playwright:ui` | Playwright UI | ⚠️ Semi | ✅ Yes | Interactive Debug |
| `npm run codegen` | Codegen | ❌ No | ✅ Yes | Recording Actions |

## 🎯 Common Scenarios

### **Scenario 1: Run all tests locally**
```bash
npm test
```
Fast, headless, fully automated.

### **Scenario 2: Watch tests run with visible browser**
```bash
npm run test:headed
```
Fully automated, but you can see what's happening.

### **Scenario 3: Debug a failing test**
```bash
npm run test:playwright:debug
```
Pauses execution, lets you inspect elements and find correct locators.

### **Scenario 4: Record new test actions**
```bash
npm run codegen https://example.com
```
Record actions, get locators, create feature file.

### **Scenario 5: Run specific Playwright test**
```bash
npx playwright test automation/tests/login.spec.ts --headed
```
Run one test file with visible browser.

### **Scenario 6: CI/CD Pipeline**
```bash
npm test                    # Cucumber tests
npm run test:playwright     # Playwright tests
```
Headless, fast, fully automated.

## 📝 Workflow Examples

### **Development Workflow**

1. **Record actions**
   ```bash
   npm run codegen https://example.com
   ```

2. **Create feature file** (manual)
   ```gherkin
   Feature: Login
     Scenario: Successful login
       Given I navigate to "https://example.com/login"
       When I enter "user@test.com" in "username"
       And I click on "Login"
   ```

3. **Convert to test**
   ```bash
   npm run feature-to-test automation/features/login.feature
   ```

4. **Run in headed mode to verify**
   ```bash
   npm run test:playwright:headed
   ```

5. **If test fails, debug with Inspector**
   ```bash
   npm run test:playwright:debug
   ```

6. **Fix locators, run again**
   ```bash
   npm run test:playwright:headed
   ```

### **CI/CD Workflow**

```yaml
# .github/workflows/test.yml
- name: Run Cucumber Tests
  run: npm test

- name: Run Playwright Tests
  run: npm run test:playwright

- name: Upload Report
  run: npm run report
```

## 🔧 Environment Variables

Control test behavior with environment variables:

```bash
# .env file
HEADLESS=false          # Run with visible browser
BROWSER=chromium        # Browser type (chromium, firefox, webkit)
BASE_URL=http://localhost:3000
TIMEOUT=30000
```

Or use inline:

```bash
# Windows
set HEADLESS=false && npm test

# Linux/Mac
HEADLESS=false npm test
```

## 💡 Tips

1. **Use headless for CI/CD** - Fastest execution
2. **Use headed for local development** - See what's happening
3. **Use Inspector only for debugging** - Not for automation
4. **Use Codegen to discover locators** - Then convert to tests
5. **Run specific tests during development** - Faster feedback

## 🚨 Common Mistakes

❌ **Don't use Inspector for E2E automation**
```bash
# This will pause and wait for manual interaction
npm run test:playwright:debug
```

✅ **Use headed mode instead**
```bash
# This runs fully automated with visible browser
npm run test:playwright:headed
```

❌ **Don't use Codegen for running tests**
```bash
# This is for recording, not running
npm run codegen
```

✅ **Use test commands**
```bash
# This runs your tests
npm test
```

## 📚 Related Documentation

- `PLAYWRIGHT_LOCATORS.md` - Locator generation and strategies
- `FEATURE_CONVERSION.md` - Converting features to tests
- `SETUP.md` - Initial setup guide
- `QUICKSTART.md` - Getting started quickly
