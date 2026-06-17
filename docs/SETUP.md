# Everest Playwright Framework - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Playwright Browsers
```bash
npx playwright install
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Edit `.env`:
```
BASE_URL=http://localhost:3000
HEADLESS=true
BROWSER=chromium
TIMEOUT=30000
```

## Running Tests

### Cucumber/Gherkin Tests
```bash
# Run all feature files
npm test

# Run in headed mode
npm run test:headed

# Debug mode
npm run test:debug
```

### Playwright Tests
```bash
# Run Playwright tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test automation/tests/example.spec.ts

# Show report
npm run report
```

## Recording User Actions

### Using Playwright Codegen
```bash
npm run codegen
```

This will:
1. Open a browser window
2. Record your actions
3. Generate code that can be converted to Gherkin

### Converting to Gherkin
After recording, convert the actions to Gherkin format in a `.feature` file:

**Example Recording:**
```javascript
await page.goto('https://example.com/login');
await page.fill('#username', 'testuser');
await page.fill('#password', 'password123');
await page.click('#login-button');
```

**Converted to Gherkin:**
```gherkin
Feature: User Login
  Scenario: Login with valid credentials
    Given I navigate to "https://example.com/login"
    When I enter "testuser" in the "username" field
    And I enter "password123" in the "password" field
    And I click on "Login"
    Then I should be logged in successfully
```

## Framework Structure

```
/automation
  /features        # Gherkin feature files (.feature)
  /pom             # PageObject Model classes
  /steps           # Step definitions (generic + custom)
  /tests           # Playwright test files (.spec.ts)
  /storage         # Session storage files (storageState.json)
  /utils           # Utility classes (browser, self-healing, reporting)
```

## Creating New Tests

### 1. Create a Feature File
Create a new `.feature` file in `automation/features/`:

```gherkin
Feature: Shopping Cart
  Scenario: Add item to cart
    Given I navigate to "https://example.com/products"
    When I click on "Add to Cart"
    Then I should see "Item added to cart"
```

### 2. Create Page Object (if needed)
If generic steps don't cover your needs, create a new POM in `automation/pom/`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ProductPage extends BasePage {
  private locators = {
    addToCartButton: '#add-to-cart',
    productTitle: '.product-title',
  };

  constructor(page: Page) {
    super(page);
  }

  async addToCart(): Promise<void> {
    await this.click(this.locators.addToCartButton, 'Add to Cart');
  }
}
```

### 3. Create Custom Steps (if needed)
If generic steps aren't sufficient, add custom steps in `automation/steps/`:

```typescript
import { When } from '@cucumber/cucumber';
import { ProductPage } from '../pom/product-page';

When('I add the product to cart', async function () {
  const productPage = new ProductPage(this.page);
  await productPage.addToCart();
});
```

## Self-Healing Locators

The framework automatically attempts to heal broken locators using multiple strategies:
- Text-based locators
- ARIA labels
- Placeholders
- Titles
- Names

When a locator fails, the framework tries alternative strategies and logs the healed locator in the report.

## Session Management

### Saving Session State
```gherkin
When I save the session state
```

This saves authentication state to `automation/storage/storageState.json`.

### Reusing Session State
The framework automatically loads saved session state in subsequent test runs, skipping login steps.

## Viewing Reports

### Cucumber HTML Report
After running tests, view the report:
```bash
open test-results/cucumber-report.html
```

### Playwright HTML Report
```bash
npm run report
```

## Troubleshooting

### TypeScript Errors
Install dependencies first:
```bash
npm install
```

### Browser Not Found
Install Playwright browsers:
```bash
npx playwright install
```

### Tests Failing
1. Check if the application is running at BASE_URL
2. Review screenshots in `test-results/screenshots/`
3. Check healed locator logs in console output
4. Run in headed mode to debug: `npm run test:headed`

## Best Practices

1. **Use Generic Steps First**: Try to use existing generic step definitions before creating custom ones
2. **Keep POMs Clean**: Store locators and actions in PageObject classes
3. **Leverage Self-Healing**: Let the framework handle minor UI changes automatically
4. **Review Healed Locators**: Check Smart Report annotations to update locators if needed
5. **Save Session State**: Reuse authentication to speed up test execution
6. **Use Descriptive Names**: Write clear scenario and step descriptions
