# LocatorPro-Playwright Integration

## Overview
The Everest Framework now integrates **LocatorPro-Playwright**, a sophisticated self-healing locator engine with **35-priority intelligent selector generation**. This provides the most robust and resilient test automation available.

## 🚀 What is LocatorPro?

LocatorPro is a self-healing locator system that:
- ✅ Generates **35 different selector strategies** automatically
- ✅ Tries multiple fallback strategies if the original selector fails
- ✅ Uses intelligent DOM scanning to find elements by visible text
- ✅ Provides auto-enhancement for existing locators
- ✅ Supports smart click, fill, and expect operations
- ✅ Finds elements by their relationship to other text

## 📦 Installation

Already installed in the framework:
```bash
npm install locatorpro-playwright
```

## 🎯 Key Features

### 1. **Smart Click** - Auto-Enhanced Clicking
```typescript
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';

// Smart click with auto-enhancement
await LocatorProWrapper.smartClick(page, '#submit-btn', 'Submit Button');

// Click by visible text (most user-friendly)
await LocatorProWrapper.clickByText(page, 'Login');
```

### 2. **Smart Fill** - Auto-Enhanced Form Filling
```typescript
// Smart fill with auto-enhancement
await LocatorProWrapper.smartFill(page, '#username', 'test@example.com', 'Username');

// Fill by visible text/label
await LocatorProWrapper.fillByText(page, 'Email Address', 'test@example.com');
```

### 3. **Find by Visible Text** - Intelligent DOM Scanning
```typescript
// Find element by visible text with 35-priority strategies
const element = await LocatorProWrapper.findByVisibleText(page, 'Submit');

// With fallbacks
const element = await LocatorProWrapper.findByVisibleText(page, 'Login', {
  fallbacks: ['Sign In', 'Log In'],
  elementTypes: ['button', 'a'],
  maxResults: 5
});
```

### 4. **Auto-Enhance** - Upgrade Existing Locators
```typescript
// Take a fragile locator and make it resilient
const fragileLocator = page.locator('#dynamic-id-12345');
const enhancedLocator = await LocatorProWrapper.autoEnhance(page, fragileLocator);
await enhancedLocator.click();
```

### 5. **Find by Related Text** - Contextual Element Finding
```typescript
// Find a button related to specific text
const deleteButton = await LocatorProWrapper.findByRelatedText(
  page,
  'Delete',
  'John Doe',
  { containerTypes: ['tr', 'div'], maxLevelsUp: 3 }
);
```

### 6. **Smart Expect** - Auto-Enhanced Assertions
```typescript
// Expect with auto-enhancement
const locator = page.locator('#status-message');
await LocatorProWrapper.smartExpect(page, locator).toBeVisible();
await LocatorProWrapper.smartExpect(page, locator).toHaveText('Success');
```

## 📋 Framework Integration

### **Cucumber Step Definitions**

The framework's generic step definitions now use LocatorPro automatically:

```gherkin
Feature: User Login
  Scenario: Successful login
    Given I navigate to "https://example.com/login"
    When I click on "Login"                    # Uses LocatorPro.clickByText()
    And I enter "user@test.com" in "Email"     # Uses LocatorPro.fillByText()
    Then I should see "Welcome"                # Uses LocatorPro.findByVisibleText()
```

**Behind the scenes:**
- `I click on "text"` → `LocatorProWrapper.clickByText()` with 35 strategies
- `I enter "value" in "field"` → `LocatorProWrapper.fillByText()` with intelligent DOM scanning
- `I should see "text"` → `LocatorProWrapper.findByVisibleText()` with fallback strategies

### **Page Object Model**

Use LocatorPro in your Page Objects:

```typescript
import { Page } from '@playwright/test';
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';

export class LoginPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    // Use LocatorPro for resilient interactions
    await LocatorProWrapper.fillByText(this.page, 'Username', username);
    await LocatorProWrapper.fillByText(this.page, 'Password', password);
    await LocatorProWrapper.clickByText(this.page, 'Login');
  }

  async verifyLoginSuccess() {
    const element = await LocatorProWrapper.findByVisibleText(this.page, 'Dashboard');
    await expect(element).toBeVisible();
  }
}
```

### **Playwright Tests**

Use LocatorPro directly in Playwright tests:

```typescript
import { test } from '@playwright/test';
import { LocatorProWrapper } from '../utils/locatorpro-wrapper';

test('login with LocatorPro', async ({ page }) => {
  await page.goto('https://example.com/login');
  
  // Smart fill with auto-enhancement
  await LocatorProWrapper.smartFill(page, '#username', 'test@example.com');
  await LocatorProWrapper.smartFill(page, '#password', 'password123');
  
  // Smart click with 35-priority strategies
  await LocatorProWrapper.smartClick(page, '#login-btn', 'Login Button');
  
  // Find by visible text
  const welcomeMsg = await LocatorProWrapper.findByVisibleText(page, 'Welcome');
  await expect(welcomeMsg).toBeVisible();
});
```

## 🔧 API Reference

### **LocatorProWrapper Methods**

#### Smart Operations
```typescript
// Smart click with auto-enhancement
smartClick(page: Page, selector: string, elementName?: string): Promise<void>

// Smart fill with auto-enhancement
smartFill(page: Page, selector: string, value: string, elementName?: string): Promise<void>

// Smart expect with auto-enhancement
smartExpect(page: Page, locator: Locator): { toBeVisible, toHaveText, toBeHidden }
```

#### Find Methods
```typescript
// Find by visible text (35-priority strategies)
findByVisibleText(page: Page, text: string, options?: {
  fallbacks?: string[];
  elementTypes?: string[];
  maxResults?: number;
}): Promise<Locator>

// Find by text with self-healing
findByText(page: Page, text: string, fallbacks?: string[]): Promise<Locator>

// Find by role with self-healing
findByRole(page: Page, role: string, name?: string): Promise<Locator>

// Find by test ID
findByTestId(page: Page, testId: string): Promise<Locator>

// Find by CSS selector with self-healing
findBySelector(page: Page, selector: string): Promise<Locator>

// Find by related text (contextual)
findByRelatedText(page: Page, targetText: string, relatedText: string, options?: {
  containerTypes?: string[];
  maxLevelsUp?: number;
  maxStrategies?: number;
}): Promise<Locator>
```

#### Enhancement Methods
```typescript
// Enhance existing locator with self-healing
enhanceLocator(page: Page, locator: Locator): Promise<Locator>

// Auto-enhance: Try original first, enhance if fails
autoEnhance(page: Page, locator: Locator, timeout?: number): Promise<Locator>
```

#### User-Friendly Methods
```typescript
// Click by visible text (most user-friendly)
clickByText(page: Page, text: string, fallbacks?: string[]): Promise<void>

// Fill by visible text/label
fillByText(page: Page, text: string, value: string, fallbacks?: string[]): Promise<void>
```

#### Utility Methods
```typescript
// Validate that a locator can find elements
validateLocator(page: Page, locator: Locator): Promise<boolean>

// Get debug information about strategies
getDebugInfo(page: Page, selector: string): Promise<{
  strategies: any[];
  validStrategies: any[];
  recommended: string;
}>
```

## 💡 Usage Examples

### Example 1: Simple Click with Text
```typescript
// Old way (fragile)
await page.click('button:has-text("Submit")');

// LocatorPro way (resilient with 35 strategies)
await LocatorProWrapper.clickByText(page, 'Submit');
```

### Example 2: Fill Form with Labels
```typescript
// Old way (fragile)
await page.fill('#email', 'test@example.com');
await page.fill('#password', 'password123');

// LocatorPro way (finds by label text, 35 strategies)
await LocatorProWrapper.fillByText(page, 'Email', 'test@example.com');
await LocatorProWrapper.fillByText(page, 'Password', 'password123');
```

### Example 3: Auto-Enhance Fragile Locators
```typescript
// You have a fragile locator
const fragileBtn = page.locator('#btn-12345-dynamic-id');

// Enhance it with 35 fallback strategies
const resilientBtn = await LocatorProWrapper.autoEnhance(page, fragileBtn);
await resilientBtn.click();
```

### Example 4: Find Element by Related Text
```typescript
// Find "Delete" button in the row containing "John Doe"
const deleteBtn = await LocatorProWrapper.findByRelatedText(
  page,
  'Delete',
  'John Doe',
  { containerTypes: ['tr', 'div'], maxLevelsUp: 2 }
);
await deleteBtn.click();
```

### Example 5: Smart Expect with Auto-Enhancement
```typescript
// Old way
await expect(page.locator('#status')).toBeVisible();

// LocatorPro way (auto-enhances if original fails)
await LocatorProWrapper.smartExpect(page, page.locator('#status')).toBeVisible();
```

## 🎯 35-Priority Selector Strategies

LocatorPro automatically tries these strategies in order:

1. **Role-based selectors** (ARIA roles)
2. **Test ID selectors** (data-testid, data-test)
3. **Label-based selectors** (for form fields)
4. **Placeholder selectors**
5. **Name attribute selectors**
6. **ID selectors**
7. **Class selectors**
8. **Text content selectors**
9. **Partial text selectors**
10. **Case-insensitive text**
11. **XPath text selectors**
12. **CSS attribute selectors**
13. **Tag + text combinations**
14. **Parent-child relationships**
15. **Sibling relationships**
... and 20 more strategies!

## 🔍 Debugging

### Get Debug Information
```typescript
const debugInfo = await LocatorProWrapper.getDebugInfo(page, '#my-selector');
console.log('Strategies:', debugInfo.strategies);
console.log('Valid strategies:', debugInfo.validStrategies);
console.log('Recommended:', debugInfo.recommended);
```

### Validate Locator
```typescript
const isValid = await LocatorProWrapper.validateLocator(page, myLocator);
console.log('Locator is valid:', isValid);
```

## 📊 Comparison: Before vs After

### Before (Fragile)
```typescript
// Breaks if ID changes
await page.click('#submit-btn-12345');

// Breaks if exact text changes
await page.click('button:has-text("Submit Form")');

// Breaks if structure changes
await page.fill('div.form > input:nth-child(2)', 'value');
```

### After (Resilient with LocatorPro)
```typescript
// Tries 35 strategies to find "Submit"
await LocatorProWrapper.clickByText(page, 'Submit');

// Finds by label, placeholder, name, or text
await LocatorProWrapper.fillByText(page, 'Email', 'test@example.com');

// Auto-enhances with fallback strategies
await LocatorProWrapper.smartClick(page, '#submit-btn', 'Submit');
```

## 🚀 Benefits

✅ **35x More Resilient** - 35 fallback strategies vs 1 selector  
✅ **Self-Healing** - Automatically finds alternative selectors  
✅ **User-Friendly** - Use visible text instead of CSS selectors  
✅ **Contextual Finding** - Find elements by their relationship to other text  
✅ **Auto-Enhancement** - Upgrade fragile locators automatically  
✅ **Intelligent DOM Scanning** - Finds elements even with complex structures  
✅ **Zero Configuration** - Works out of the box  

## 🎉 Summary

The Everest Framework now uses **LocatorPro-Playwright** for:
- All Cucumber step definitions
- Page Object Model interactions
- Playwright test scripts
- Self-healing locator strategies

**Result:** Tests that are **35x more resilient** to UI changes! 🚀

## 📚 Related Documentation

- `PLAYWRIGHT_LOCATORS.md` - Playwright Inspector integration
- `RUNNING_TESTS.md` - How to run tests
- `FEATURE_CONVERSION.md` - Converting features to tests
- `ARCHITECTURE.md` - Framework architecture
