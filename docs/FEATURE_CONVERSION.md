# Feature to Test Conversion

## Overview
The Everest Framework includes a CLI tool to convert Gherkin feature files into Playwright test stubs, following the workflow described in the README:

```
Feature File → Playwright CLI → Test Stubs → PageObjects
```

## Usage

### Convert a Single Feature File
```bash
npm run feature-to-test automation/features/login.feature
```

This generates a Playwright test file in `automation/tests/` with the same name (e.g., `login.spec.ts`).

### Convert All Feature Files
```bash
npm run convert-all-features
```

This scans `automation/features/` and converts all `.feature` files to Playwright test stubs.

## What Gets Generated

Given a feature file like:
```gherkin
Feature: User Login
  Scenario: Successful login
    Given I navigate to "https://example.com/login"
    When I enter "user@test.com" in "username"
    And I enter "password123" in "password"
    And I click on "Login"
    Then I should see "Welcome"
```

The tool generates:
```typescript
import { test, expect } from '@playwright/test';
import { BrowserManager } from '../utils/browser-manager';
import { ReportLogger } from '../utils/report-logger';

test.describe('User Login', () => {
  let page: any;

  test.beforeEach(async () => {
    await BrowserManager.launchBrowser();
    await BrowserManager.createContext();
    page = await BrowserManager.createPage();
  });

  test.afterEach(async () => {
    await BrowserManager.cleanup();
  });

  test('Successful login', async ({ page }, testInfo) => {
    // TODO: Implement test steps
    // Given I navigate to "https://example.com/login"
    await page.goto('https://example.com/login');
    // When I enter "user@test.com" in "username"
    // TODO: Implement this step
    // And I enter "password123" in "password"
    // TODO: Implement this step
    // And I click on "Login"
    await page.click('text="Login"');
    // Then I should see "Welcome"
    await expect(page.locator('text="Welcome"')).toBeVisible();

    ReportLogger.attachToPlaywrightTest(testInfo);
  });
});
```

## Auto-Generated Code

The converter automatically generates:
- ✅ Test structure with describe/test blocks
- ✅ Browser setup/teardown hooks
- ✅ Basic Playwright actions for common steps
- ✅ Smart Report integration
- ✅ TODO comments for manual implementation

## Supported Step Patterns

The converter recognizes and auto-generates code for:

| Gherkin Pattern | Generated Code |
|----------------|----------------|
| `I navigate to "URL"` | `await page.goto('URL');` |
| `I click on "text"` | `await page.click('text="text"');` |
| `I should see "text"` | `await expect(page.locator('text="text"')).toBeVisible();` |
| Other steps | `// TODO: Implement this step` |

## Workflow

### 1. Record User Actions
```bash
npm run codegen
```
Record actions in the browser.

### 2. Convert to Gherkin
Manually create a `.feature` file from recorded actions:
```gherkin
Feature: Shopping Cart
  Scenario: Add item to cart
    Given I navigate to "https://shop.example.com"
    When I click on "Add to Cart"
    Then I should see "Item added"
```

### 3. Generate Test Stub
```bash
npm run feature-to-test automation/features/shopping.feature
```

### 4. Implement Custom Logic
Edit the generated test file to add:
- Page Object imports
- Custom assertions
- Data-driven test logic
- Complex interactions

### 5. Run Tests
```bash
npm run test:playwright
```

## Benefits

✅ **Fast Test Creation** - Generate test structure automatically  
✅ **Consistent Format** - All tests follow the same pattern  
✅ **BDD to Code** - Bridge Gherkin scenarios to Playwright tests  
✅ **Smart Defaults** - Common actions auto-implemented  
✅ **Easy Customization** - TODO comments guide implementation  

## Advanced Usage

### Custom Output Directory
```bash
npm run feature-to-test automation/features/login.feature automation/tests/auth
```

### Integration with CI/CD
```yaml
# .github/workflows/test.yml
- name: Convert features to tests
  run: npm run convert-all-features
  
- name: Run Playwright tests
  run: npm run test:playwright
```

## Notes

- Generated tests are **stubs** - you'll need to implement complex logic
- Use **Page Objects** for better maintainability
- The converter is a **starting point**, not a complete solution
- Review and customize generated code before committing

## Complete Flow Example

```bash
# 1. Record actions
npm run codegen

# 2. Create feature file (manual)
# automation/features/checkout.feature

# 3. Convert to test
npm run feature-to-test automation/features/checkout.feature

# 4. Implement PageObject (manual)
# automation/pom/checkout-page.ts

# 5. Update generated test to use POM (manual)
# automation/tests/checkout.spec.ts

# 6. Run test
npm run test:playwright
```

This completes the **Feature File → Playwright CLI → Test Stubs** workflow! 🎉
