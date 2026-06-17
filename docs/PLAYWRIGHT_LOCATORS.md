# Playwright Real-Time Locator Identification

## Overview
The Everest Framework now integrates Microsoft Playwright's CLI and locator generation capabilities for real-time locator identification, inspection, and debugging.

## ⚡ Quick Start: Which Mode to Use?

### **For End-to-End Automation (Fully Automated)**
```bash
# Cucumber/Gherkin Tests
npm test                    # Headless (fastest)
npm run test:headed         # Headed (visible browser)

# Playwright Tests
npm run test:playwright           # Headless (fastest)
npm run test:playwright:headed    # Headed (visible browser)
```
✅ **Runs completely automated** - No manual interaction needed

### **For Debugging/Development (Manual Interaction)**
```bash
# Inspector (pauses execution - requires manual steps)
npm run test:playwright:debug
npm run test:playwright:inspector

# Codegen (record actions)
npm run codegen

# UI Mode (watch tests interactively)
npm run test:playwright:ui
```
❌ **NOT for E2E automation** - Requires manual interaction

## 🎯 Features

### 1. **Playwright Inspector (Real-Time Debugging)**
⚠️ **NOTE: Inspector mode is for DEBUGGING ONLY, not for end-to-end automation.**

Run tests with the Playwright Inspector to identify locators in real-time:

```bash
# Debug mode with Inspector (PAUSES execution - NOT for E2E automation)
npm run test:playwright:debug

# Inspector mode with environment variable (PAUSES execution)
npm run test:playwright:inspector

# UI mode (interactive - semi-automated)
npm run test:playwright:ui
```

**What you get:**
- ✅ Pause execution at any point
- ✅ Inspect elements in real-time
- ✅ See suggested locators
- ✅ Step through test execution manually
- ✅ View screenshots and traces

**Use Inspector for:**
- 🔍 Finding correct locators
- 🐛 Debugging failing tests
- 📝 Understanding test flow
- ❌ **NOT for automated E2E test runs**

**For E2E Automation, use:**
```bash
# Headless (fastest, fully automated)
npm run test:playwright

# Headed (visible browser, fully automated)
npm run test:playwright:headed
```

### 2. **Codegen (Record & Generate Locators)**
Record actions and get Playwright-recommended locators:

```bash
# Start recording
npm run codegen

# Record from specific URL
npm run codegen:url https://example.com
```

**What you get:**
- ✅ Real-time locator generation
- ✅ Playwright's recommended selectors
- ✅ Auto-generated test code
- ✅ Visual element picker

### 3. **Enhanced Self-Healing with Playwright Locators**
The framework now uses Playwright's built-in locator strategies:

```typescript
import { EnhancedSelfHealing } from '../utils/enhanced-self-healing';

// Click with Playwright's smart locators
await EnhancedSelfHealing.click(page, originalLocator, 'Login', (result) => {
  console.log('Healed:', result.healedLocator);
});

// Fill with Playwright's smart locators
await EnhancedSelfHealing.fill(page, originalLocator, 'Username', 'test@example.com');
```

**Healing Priority:**
1. `getByRole()` - Most resilient (ARIA roles)
2. `getByLabel()` - Best for forms
3. `getByPlaceholder()` - Input fields
4. `getByText()` - Visible text
5. `getByTestId()` - Custom test IDs

### 4. **Playwright Locator Generator API**
Generate smart locators programmatically:

```typescript
import { PlaywrightLocatorGenerator } from '../utils/playwright-locator-generator';

// Auto-detect best locator
const locators = await PlaywrightLocatorGenerator.autoDetectLocator(page, 'Login');

// Generate smart locator with options
const locator = await PlaywrightLocatorGenerator.generateSmartLocator(
  page,
  'Submit',
  { role: 'button' }
);

// Get locator suggestions
const suggestion = await PlaywrightLocatorGenerator.inspectAndSuggest(page, 'Login');
console.log('Recommended:', suggestion.recommended);
console.log('Alternatives:', suggestion.alternatives);
```

## 🔧 Usage Examples

### Example 1: Debug Test with Inspector

```bash
npm run test:playwright:debug
```

1. Test pauses at first action
2. Click "Pick Locator" in Inspector
3. Hover over element on page
4. See recommended locator in Inspector
5. Copy locator to your test

### Example 2: Record Actions with Codegen

```bash
npm run codegen https://example.com
```

1. Browser opens with Inspector
2. Perform actions (click, type, etc.)
3. See generated code in Inspector
4. Copy code to feature file or test

### Example 3: Use Enhanced Self-Healing in Tests

```typescript
import { test } from '@playwright/test';
import { EnhancedSelfHealing } from '../utils/enhanced-self-healing';

test('login with enhanced healing', async ({ page }) => {
  await page.goto('https://example.com/login');
  
  // Uses Playwright's getByRole, getByLabel, etc.
  await EnhancedSelfHealing.fill(page, '#username', 'Username', 'test@example.com');
  await EnhancedSelfHealing.fill(page, '#password', 'Password', 'password123');
  await EnhancedSelfHealing.click(page, '#login-btn', 'Login');
});
```

### Example 4: Generate Locators Programmatically

```typescript
import { PlaywrightLocatorGenerator } from '../utils/playwright-locator-generator';

// In your test
const suggestion = await PlaywrightLocatorGenerator.inspectAndSuggest(page, 'Submit');

console.log('🔍 Locator Suggestion for: Submit');
console.log('Recommended:', suggestion.recommended);
console.log('Strategy:', suggestion.strategy);
console.log('Alternatives:', suggestion.alternatives);
```

## 📋 Playwright Locator Strategies

### Priority Order (Most → Least Resilient)

1. **Role-based** (Recommended)
   ```typescript
   page.getByRole('button', { name: 'Login' })
   page.getByRole('textbox', { name: 'Username' })
   page.getByRole('link', { name: 'Sign Up' })
   ```

2. **Label-based** (Forms)
   ```typescript
   page.getByLabel('Username')
   page.getByLabel('Email Address')
   ```

3. **Placeholder-based** (Inputs)
   ```typescript
   page.getByPlaceholder('Enter your email')
   ```

4. **Text-based** (Visible Text)
   ```typescript
   page.getByText('Welcome')
   page.getByText(/hello/i)
   ```

5. **Test ID** (Custom Attributes)
   ```typescript
   page.getByTestId('submit-button')
   ```

6. **CSS/XPath** (Last Resort)
   ```typescript
   page.locator('#login-btn')
   page.locator('//button[@type="submit"]')
   ```

## 🎨 Complete Workflow

### Workflow 1: Record → Feature → Test

```bash
# 1. Record actions
npm run codegen https://example.com

# 2. Create feature file from recording
# automation/features/checkout.feature

# 3. Convert to test
npm run feature-to-test automation/features/checkout.feature

# 4. Run with Inspector to verify locators
npm run test:playwright:debug
```

### Workflow 2: Debug → Heal → Update

```bash
# 1. Run test in debug mode
npm run test:playwright:debug

# 2. Test fails on locator
# Inspector shows suggested locators

# 3. Framework auto-heals using Playwright strategies
# Check console for healed locator

# 4. Update POM with healed locator
```

### Workflow 3: Inspect → Generate → Implement

```typescript
// 1. Use locator generator in test
const suggestion = await PlaywrightLocatorGenerator.inspectAndSuggest(page, 'Login');

// 2. See recommendations
// Recommended: getByRole('button', { name: 'Login' })

// 3. Update PageObject
private locators = {
  loginButton: page.getByRole('button', { name: 'Login' })
};
```

## 🚀 Advanced Features

### Filtered Locators
```typescript
const locator = PlaywrightLocatorGenerator.getFilteredLocator(
  page,
  'button',
  { hasText: 'Submit' }
);
```

### Chained Locators
```typescript
const locator = PlaywrightLocatorGenerator.getChainedLocator(
  page,
  '.form-container',
  'input[type="text"]'
);
```

### Auto-Detection
```typescript
const locators = await PlaywrightLocatorGenerator.autoDetectLocator(page, 'Login');
// Returns array of all working locators
```

## 📊 Comparison: Old vs New

### Old Approach (Custom Self-Healing)
```typescript
// Tries CSS selectors only
await page.click('button:has-text("Login")');
// Falls back to: [aria-label], [placeholder], etc.
```

### New Approach (Playwright Locators)
```typescript
// Uses Playwright's recommended strategies
await page.getByRole('button', { name: 'Login' });
// Falls back to: getByLabel, getByText, etc.
```

**Benefits:**
- ✅ More resilient to UI changes
- ✅ Better accessibility support
- ✅ Playwright-recommended best practices
- ✅ Real-time Inspector integration
- ✅ Auto-generated smart locators

## 🛠️ Available Commands

```bash
# Testing with Inspector
npm run test:playwright:debug          # Debug mode with Inspector
npm run test:playwright:inspector      # Inspector with PWDEBUG
npm run test:playwright:ui             # Interactive UI mode

# Recording
npm run codegen                        # Start Codegen
npm run codegen:url <url>             # Codegen from URL

# Regular Testing
npm run test:playwright               # Run all tests
npm run test:playwright:headed        # Run with visible browser

# Reports
npm run report                        # View HTML report
```

## 💡 Best Practices

1. **Use Playwright Inspector for debugging**
   - Identify correct locators visually
   - See Playwright's recommendations
   - Understand why locators fail

2. **Prefer role-based locators**
   - Most resilient to changes
   - Better accessibility
   - Playwright-recommended

3. **Use Codegen for complex flows**
   - Record multi-step processes
   - Get accurate locators
   - Convert to Gherkin

4. **Let enhanced self-healing work**
   - Framework tries Playwright strategies first
   - Logs healed locators
   - Update POMs with healed locators

5. **Combine approaches**
   - Record with Codegen
   - Convert to Gherkin
   - Generate test stubs
   - Debug with Inspector
   - Use enhanced self-healing

## 🎉 Summary

The framework now provides **three levels of locator identification**:

1. **Real-time (Inspector)** - Debug and inspect during test execution
2. **Recording (Codegen)** - Record actions and get recommended locators
3. **Runtime (Enhanced Self-Healing)** - Auto-heal using Playwright strategies

All integrated seamlessly into the Everest Framework! 🚀
