# Tag-Based Test Execution Guide

## Overview
The Everest Framework supports **tag-based test execution** using Cucumber profiles, allowing you to run specific subsets of tests based on tags like `@smoke`, `@regression`, `@critical`, or custom tags.

## 🏷️ Available Tags

### **Pre-configured Tags**
- `@smoke` - Quick smoke tests for critical functionality
- `@regression` - Full regression test suite
- `@critical` - Critical business flows
- `@wip` - Work in progress (runs with 1 worker for debugging)
- `@login` - Login-related tests
- Custom tags - Add your own as needed

## 🚀 Running Tests by Tags

### **Using Profiles**

#### **Smoke Tests**
```bash
# Headless
npm run test:smoke

# Headed (see browser)
npm run test:smoke:headed
```

#### **Regression Tests**
```bash
# Headless
npm run test:regression

# Headed
npm run test:regression:headed
```

#### **Critical Tests**
```bash
# Headless
npm run test:critical

# Headed
npm run test:critical:headed
```

#### **Work in Progress (WIP)**
```bash
# Headless (runs with 1 worker)
npm run test:wip

# Headed
npm run test:wip:headed
```

### **Using Custom Tag Expressions**

#### **Single Tag**
```bash
# Run all tests with @login tag
npm run test:tags "@login"

# Headed mode
cross-env HEADLESS=false npm run test:tags "@login"
```

#### **Multiple Tags (AND)**
```bash
# Run tests that have BOTH @smoke AND @critical
npm run test:tags "@smoke and @critical"
```

#### **Multiple Tags (OR)**
```bash
# Run tests that have EITHER @smoke OR @critical
npm run test:tags "@smoke or @critical"
```

#### **Exclude Tags (NOT)**
```bash
# Run all tests EXCEPT @wip
npm run test:tags "not @wip"

# Run @regression but exclude @slow
npm run test:tags "@regression and not @slow"
```

#### **Complex Expressions**
```bash
# Run smoke or critical, but not wip
npm run test:tags "(@smoke or @critical) and not @wip"

# Run login tests that are also smoke tests
npm run test:tags "@login and @smoke"
```

## 📝 Adding Tags to Features

### **Feature-Level Tags**
Tags at the feature level apply to ALL scenarios in that feature:

```gherkin
@login @smoke @critical
Feature: User Login
  As a user
  I want to login to the application
  
  Scenario: Successful login
    Given I navigate to "https://example.com/login"
    When I enter "user@test.com" in "username"
    And I click on "Login"
```

### **Scenario-Level Tags**
Tags at the scenario level apply only to that specific scenario:

```gherkin
@regression
Feature: User Management
  
  @smoke @critical
  Scenario: Create new user
    Given I am on the admin page
    When I create a new user
    
  @regression
  Scenario: Edit existing user
    Given I am on the admin page
    When I edit a user
    
  @wip
  Scenario: Delete user (work in progress)
    Given I am on the admin page
    When I delete a user
```

### **Multiple Tags**
You can add multiple tags to features and scenarios:

```gherkin
@api @integration @smoke
Feature: API Integration Tests
  
  @smoke @critical @fast
  Scenario: Health check endpoint
    Given the API is running
    When I call the health endpoint
    Then I should get a 200 response
```

## ⚙️ Profile Configuration

Profiles are defined in `cucumber.js`:

```javascript
module.exports = {
  default: {
    // Default profile - runs all tests
    paths: ['automation/features/**/*.feature'],
    parallel: 4,
    timeout: 60000
  },
  smoke: {
    // Smoke profile - runs only @smoke tests
    paths: ['automation/features/**/*.feature'],
    tags: '@smoke',
    parallel: 4,
    timeout: 60000
  },
  regression: {
    // Regression profile - runs only @regression tests
    paths: ['automation/features/**/*.feature'],
    tags: '@regression',
    parallel: 4,
    timeout: 60000
  },
  wip: {
    // WIP profile - runs only @wip tests with 1 worker
    paths: ['automation/features/**/*.feature'],
    tags: '@wip',
    parallel: 1,  // Single worker for debugging
    timeout: 60000
  }
};
```

## 🎯 Common Use Cases

### **1. Quick Smoke Test Before Commit**
```bash
npm run test:smoke:headed
```
Runs only critical smoke tests in headed mode to verify nothing is broken.

### **2. Full Regression Suite in CI/CD**
```bash
npm run test:regression
```
Runs all regression tests in headless mode with 4 parallel workers.

### **3. Debug Work in Progress**
```bash
npm run test:wip:headed
```
Runs WIP tests in headed mode with 1 worker for easier debugging.

### **4. Critical Tests Only**
```bash
npm run test:critical
```
Runs only business-critical tests.

### **5. Run Specific Feature Tests**
```bash
npm run test:tags "@login"
```
Runs all login-related tests.

### **6. Exclude Slow Tests**
```bash
npm run test:tags "@regression and not @slow"
```
Runs regression tests but skips slow ones.

## 📊 Tag Strategy Best Practices

### **1. Use Consistent Tag Naming**
- Use lowercase for tags: `@smoke`, not `@Smoke`
- Use descriptive names: `@user-management`, not `@um`
- Avoid spaces: `@api-integration`, not `@api integration`

### **2. Tag Hierarchy**
```
@smoke          → Quick critical tests (5-10 scenarios)
@critical       → Business-critical flows (20-30 scenarios)
@regression     → Full test suite (all scenarios)
@wip            → Work in progress (temporary)
```

### **3. Functional Tags**
```
@login          → Login functionality
@checkout       → Checkout process
@search         → Search features
@api            → API tests
@ui             → UI tests
```

### **4. Technical Tags**
```
@fast           → Quick tests (<30s)
@slow           → Slow tests (>2min)
@flaky          → Known flaky tests
@skip           → Temporarily skip
```

### **5. Environment Tags**
```
@dev            → Development environment only
@staging        → Staging environment only
@production     → Production-safe tests
```

## 🔧 Creating Custom Profiles

Add a new profile to `cucumber.js`:

```javascript
module.exports = {
  // ... existing profiles ...
  
  myCustomProfile: {
    require: ['automation/steps/**/*.ts', 'automation/utils/world.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:test-results/cucumber-report.html',
      'json:test-results/cucumber-report.json',
      'junit:test-results/junit-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['automation/features/**/*.feature'],
    tags: '@myCustomTag',
    parallel: 2,
    timeout: 60000
  }
};
```

Then add an npm script in `package.json`:

```json
{
  "scripts": {
    "test:custom": "cucumber-js --profile myCustomProfile",
    "test:custom:headed": "cross-env HEADLESS=false cucumber-js --profile myCustomProfile"
  }
}
```

## 📋 Azure DevOps Integration

### **Run Specific Tags in Pipeline**

```yaml
- script: npm run test:smoke
  displayName: 'Run Smoke Tests'
  
- script: npm run test:regression
  displayName: 'Run Regression Tests'
  condition: eq(variables['Build.SourceBranch'], 'refs/heads/main')
  
- script: npm run test:critical
  displayName: 'Run Critical Tests'
  condition: always()
```

### **Dynamic Tag Selection**

```yaml
- script: npm run test:tags "$(TEST_TAGS)"
  displayName: 'Run Tests with Tags'
  env:
    TEST_TAGS: '@smoke or @critical'
```

## 🎨 Example Feature with Tags

```gherkin
@login @smoke @critical
Feature: User Authentication
  As a user
  I want to login to the application
  So that I can access my account

  Background:
    Given the application is running

  @smoke @critical @fast
  Scenario: Successful login with valid credentials
    Given I navigate to the login page
    When I enter "user@test.com" in "username"
    And I enter "Password123!" in "password"
    And I click on "Login"
    Then I should see "Welcome"
    And the URL should contain "dashboard"

  @regression
  Scenario: Login fails with invalid credentials
    Given I navigate to the login page
    When I enter "invalid@test.com" in "username"
    And I enter "WrongPassword" in "password"
    And I click on "Login"
    Then I should see "Invalid credentials"

  @regression @slow
  Scenario: Account lockout after multiple failed attempts
    Given I navigate to the login page
    When I attempt login 5 times with wrong password
    Then I should see "Account locked"
    And I should receive a lockout email

  @wip
  Scenario: Two-factor authentication (work in progress)
    Given I navigate to the login page
    When I enable two-factor authentication
    Then I should receive a verification code
```

## 🚀 Quick Reference

| Command | Description |
|---------|-------------|
| `npm run test:smoke` | Run smoke tests (headless) |
| `npm run test:smoke:headed` | Run smoke tests (headed) |
| `npm run test:regression` | Run regression tests (headless) |
| `npm run test:regression:headed` | Run regression tests (headed) |
| `npm run test:critical` | Run critical tests (headless) |
| `npm run test:wip` | Run WIP tests (1 worker) |
| `npm run test:tags "@tag"` | Run tests with specific tag |
| `npm run test:tags "@tag1 and @tag2"` | Run tests with both tags |
| `npm run test:tags "@tag1 or @tag2"` | Run tests with either tag |
| `npm run test:tags "not @tag"` | Run all except tagged tests |

## 🎉 Summary

Tag-based execution allows you to:

✅ **Run specific test subsets** - Smoke, regression, critical, etc.  
✅ **Speed up CI/CD** - Run only relevant tests per stage  
✅ **Organize tests logically** - Group by feature, priority, speed  
✅ **Debug efficiently** - Run WIP tests with single worker  
✅ **Flexible execution** - Combine tags with AND/OR/NOT  
✅ **Environment-specific tests** - Tag by dev/staging/prod  

**Start using tags today to make your test execution more efficient!** 🚀

## 📚 Related Documentation

- `RUNNING_TESTS.md` - How to run tests
- `AZURE_DEVOPS_INTEGRATION.md` - CI/CD integration
- `LOCATORPRO_INTEGRATION.md` - LocatorPro features
- `SETUP.md` - Framework setup
