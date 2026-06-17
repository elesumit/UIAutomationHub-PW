# Locator Strategies Documentation

## Overview

This document provides comprehensive details on all locator strategies implemented in the Playwright-Cucumber automation framework. These strategies are designed to handle various UI patterns, including Salesforce Lightning components, standard web forms, and dynamic content.

---

## Table of Contents

1. [Navigation & Click Strategies](#navigation--click-strategies)
2. [Form Input Strategies](#form-input-strategies)
3. [Verification Strategies](#verification-strategies)
4. [Text Capture Strategies](#text-capture-strategies)
5. [Best Practices](#best-practices)

---

## Navigation & Click Strategies

### 1. Click on Elements (`When I click on {string}`)

**Location:** `steps/navigation-steps.ts`

**Purpose:** Click on buttons, links, tabs, and other clickable elements

#### Strategy Order:

1. **Role-based Selection (Playwright getByRole)**
   - Tries `button` role first
   - Falls back to `tab` role for tab elements
   - Falls back to `combobox` role for dropdowns
   - **Selectors:**
     - `getByRole('button', { name: elementName })`
     - `getByRole('tab', { name: elementName })`
     - `[role="tab"][data-label="${elementName}"]`
     - `getByRole('combobox', { name: elementName })`
     - `[role="combobox"][data-value*="${elementName}"]`

2. **Selector-based Strategies**
   - **Button selectors:**
     - `button:text-is("${elementName}")`
     - `button:has-text("${elementName}")`
     - `input[type="submit"][value="${elementName}"]`
     - `input[type="button"][value="${elementName}"]`
   
   - **Attribute-based:**
     - `button[name="${fieldName}"]`
     - `button[id="${fieldName}"]`
     - `button[aria-label="${elementName}"]`
   
   - **Role-based:**
     - `[role="button"]:has-text("${elementName}")`
     - `[role="option"]:has-text("${elementName}")` (for search results)
     - `[role="listitem"]:has-text("${elementName}")`
   
   - **Salesforce-specific:**
     - `[data-refid]:has-text("${elementName}")`
     - `[data-recordid]:has-text("${elementName}")`
     - `.slds-listbox__option:has-text("${elementName}")`
   
   - **Links (fallback):**
     - `a:has-text("${elementName}")`

3. **Navigation Detection**
   - Detects if element is a link with `href` attribute
   - Handles JavaScript navigation (`href="javascript:..."`)
   - Waits for page load after navigation
   - Logs URL and page title after navigation

#### Special Features:

- **Link Prioritization:** Prefers links with real URLs over `javascript:void(0)`
- **Visibility Check:** Ensures element is visible and enabled before clicking
- **Multiple Matches:** Iterates through all matches to find the first visible one
- **SPA Support:** Handles Single Page Application navigation with proper waits

---

### 2. Click on Tabs (`When I click on the {string} tab`)

**Location:** `steps/navigation-steps.ts`

**Purpose:** Specifically target tab elements to avoid ambiguity with other text

#### Strategy Order:

1. `[role="tab"][data-label="${tabName}"]` - Salesforce Lightning tabs
2. `[role="tab"]:has-text("${tabName}")` - Generic tab elements
3. `a[role="tab"]:has-text("${tabName}")` - Tab links
4. `.slds-tabs_default__link:has-text("${tabName}")` - Salesforce tab class

**Why Separate Step?**
- Prevents clicking on similarly named elements (e.g., "Details" tab vs "Article Details" link)
- More precise targeting for tab navigation
- Optimized for Salesforce Lightning UI

---

### 3. Click on Captured Values (`When I click on captured {string}`)

**Location:** `steps/navigation-steps.ts`

**Purpose:** Click on elements using previously captured dynamic values

#### Strategy Order:

1. `a:has-text("${elementName}")` - Links
2. `button:has-text("${elementName}")` - Buttons
3. `[role="option"]:has-text("${elementName}")` - Dropdown options
4. `[role="listitem"]:has-text("${elementName}")` - List items
5. `*:has-text("${elementName}")` - Any element (fallback)

**Data Source:**
- Checks `this.capturedData` (local scenario context) first
- Falls back to `SharedDataStore` (cross-scenario persistence)

---

## Form Input Strategies

### 1. Enter Text in Fields (`When I enter {string} in {string}`)

**Location:** `steps/form-steps.ts`

**Purpose:** Fill input fields, textareas, and editable elements

#### Strategy Order:

1. **Playwright getByLabel**
   - `getByLabel(elementName, { exact: false })`
   - Validates element is `input` or `textarea`
   - Checks visibility before filling

2. **Selector-based Strategies:**
   - `input[name="${fieldName}"]`
   - `input[id="${fieldName}"]`
   - `input[placeholder*="${elementName}" i]`
   - `input[aria-label*="${elementName}" i]`
   - `input[type="text"][name*="${fieldName}"]`
   - `input[type="email"][name*="${fieldName}"]`
   - `input[type="password"][name*="${fieldName}"]`
   - `label:has-text("${elementName}") input`
   - `label:has-text("${elementName}") + input` (adjacent sibling)
   - `label:has-text("${elementName}") ~ input` (general sibling)
   - `textarea[name="${fieldName}"]`
   - `textarea[placeholder*="${elementName}" i]`

**Environment Variable Support:**
- If value is empty string `""`, checks for environment variable
- Format: `PREFIX_FieldType` (e.g., `CE_UserName`, `SF_Password`)

---

### 2. Enter Captured Values (`When I enter captured {string} in {string}`)

**Location:** `steps/verification-steps.ts`

**Purpose:** Fill fields with previously captured dynamic values

#### Strategy Order:

1. `input[placeholder*="${fieldName}" i]`
2. `input[aria-label*="${fieldName}" i]`
3. `input[name*="${fieldNameLower}"]`
4. `input[id*="${fieldNameLower}"]`
5. `input[type="text"][placeholder*="${fieldName}" i]`
6. `input[type="search"][placeholder*="${fieldName}" i]`
7. `textarea[placeholder*="${fieldName}" i]`
8. `[role="searchbox"][placeholder*="${fieldName}" i]`
9. `[role="combobox"] input[placeholder*="${fieldName}" i]` - Salesforce combobox inputs

**Data Source:**
- Checks `this.capturedData` first
- Falls back to `SharedDataStore`

---

### 3. Select from Dropdown (`When I select {string} from {string}`)

**Location:** `steps/form-steps.ts`

**Purpose:** Select options from dropdown menus

#### Strategy Order:

1. **Native Select Elements:**
   - `select[name="${fieldName}"]`
   - `select[id="${fieldName}"]`
   - `select[aria-label*="${fieldName}" i]`
   - Uses Playwright's `selectOption()` method

2. **Custom Dropdowns:**
   - `label:has-text("${fieldName}") + select`
   - Handles custom-styled dropdowns

---

## Verification Strategies

### 1. Verify Text Visibility (`Then I should see {string}`)

**Location:** `steps/verification-steps.ts`

**Purpose:** Verify text is visible on the page (e.g., success messages, notifications)

#### Strategy Order:

1. `getByText(text, { exact: false })` - Playwright's built-in text finder
2. `text="${text}"` - Exact text selector
3. `*:has-text("${text}")` - Any element containing text
4. `//*[contains(text(), "${text}")]` - XPath text search
5. `.toast, .notification, .alert, .message, [role="alert"]` filtered by text - Notification elements

**Special Features:**
- 2-second initial wait for notifications/toasts to appear
- 10-second timeout for visibility
- Logs page content (first 500 chars) on failure for debugging

---

### 2. Verify Field Values (`Then I see {string} as {string}`)

**Location:** `steps/verification-steps.ts`

**Purpose:** Verify a field/label has a specific value (e.g., Status = "New")

#### Strategy Order:

1. **Ancestor Search (Salesforce-optimized)**
   - Finds the label element
   - Traverses up 1-3 ancestor levels
   - Searches for value within each ancestor container
   - **Use Case:** Salesforce Lightning field-value pairs in structured layouts

2. **Sibling Search**
   - Finds the label element
   - Checks next 1-3 following sibling elements
   - Matches sibling text content with expected value
   - **Use Case:** Label and value in adjacent DOM elements

3. **Container Search**
   - Finds container with label text
   - Searches for value within same container
   - **Use Case:** Label and value in same parent element

4. **Simple Visibility Check**
   - Verifies label is visible
   - Verifies value is visible
   - **Use Case:** When exact relationship doesn't matter, just presence

5. **Data Attribute Check**
   - Checks `aria-label` or `data-label` attributes
   - Validates attribute contains expected value
   - **Use Case:** Accessibility-labeled fields

**Why Multiple Strategies?**
- Different UI frameworks structure field-value pairs differently
- Salesforce Lightning uses complex nested structures
- Provides fallback options for various layouts

---

## Text Capture Strategies

### 1. Capture Text from Elements (`When I capture text from {string} and store as {string}`)

**Location:** `steps/verification-steps.ts`

**Purpose:** Extract text from UI elements for later use

#### Strategy Order:

1. **Parent-Child Extraction**
   - Finds element containing the label text
   - Gets parent container
   - Extracts all text from parent
   - Removes label text to isolate the value
   - Cleans up separators (`:`, `：`, `-`, `–`, `—`)
   - **Use Case:** Label and value in same container (e.g., "Case Number: 00204993")

2. **Adjacent Sibling**
   - Finds label element
   - Gets next sibling element
   - Extracts text from sibling
   - **Use Case:** Label and value in separate adjacent elements

3. **Data Attribute**
   - Finds elements with `data-label` or `aria-label` matching the field name
   - Extracts text content
   - **Use Case:** Accessibility-labeled fields

**Storage:**
- Stores in `this.capturedData` (local scenario context)
- Stores in `SharedDataStore` (cross-scenario file-based persistence)

---

### 2. Capture Text by Regex (`When I capture text matching {string} and store as {string}`)

**Location:** `steps/verification-steps.ts`

**Purpose:** Extract text matching a pattern (e.g., case numbers, IDs)

#### Process:

1. Gets entire page text content
2. Creates RegExp from provided pattern
3. Executes regex match
4. Stores first match group (or full match if no groups)

**Example:**
```gherkin
When I capture text matching "\d{8}" and store as "caseId"
# Captures: 00204993
```

**Storage:**
- Stores in both `this.capturedData` and `SharedDataStore`

---

### 3. Capture Element Attributes (`When I capture attribute {string} from {string} and store as {string}`)

**Location:** `steps/verification-steps.ts`

**Purpose:** Extract attribute values (e.g., href, data-id)

#### Strategy Order:

1. `text="${elementName}"` - Exact text match
2. `*:has-text("${elementName}")` - Contains text
3. `[aria-label*="${elementName}" i]` - Aria-label match
4. `[data-testid*="${elementName}" i]` - Test ID match

**Example:**
```gherkin
When I capture attribute "href" from "View Details" and store as "detailsUrl"
```

---

## Best Practices

### 1. Strategy Selection Priority

**Order of Preference:**
1. **Accessibility-first:** Use `getByRole`, `getByLabel` when possible
2. **Semantic selectors:** Use `role`, `aria-label`, `data-testid`
3. **Text-based:** Use text content as fallback
4. **CSS/XPath:** Use as last resort

### 2. Wait Strategies

- **Implicit waits:** Built into Playwright locators
- **Explicit waits:** `waitFor({ state: 'visible', timeout: 5000 })`
- **Navigation waits:** `waitForLoadState('networkidle')`
- **Custom waits:** `waitForTimeout()` for dynamic content

### 3. Error Handling

- **Try-catch blocks:** Each strategy wrapped in try-catch
- **Continue on failure:** Moves to next strategy if current fails
- **Detailed logging:** Logs which strategy succeeded
- **Debugging info:** Logs page content on final failure

### 4. Cross-Scenario Data Sharing

**SharedDataStore Implementation:**
- File-based storage: `test-results/shared-data.json`
- Persists across scenarios in same test run
- Automatic fallback from local to shared context

**Usage:**
```gherkin
# Scenario 1: Capture
When I capture text from "Case Number" and store as "caseId"

# Scenario 2: Use (different scenario, same run)
When I enter captured "caseId" in "Search..."
```

### 5. Salesforce-Specific Optimizations

**Lightning Component Patterns:**
- Tab navigation with `role="tab"` and `data-label`
- Combobox inputs with `role="combobox"`
- Search results with `.slds-listbox__option`
- Field-value pairs with ancestor/sibling traversal

**Common Selectors:**
- `.slds-tabs_default__link` - Tab links
- `[data-refid]` - Record references
- `[data-recordid]` - Record IDs
- Lightning web component attributes

### 6. Debugging Tips

**Enable Detailed Logging:**
- Check `ReportLogger` output for strategy attempts
- Review which strategy succeeded
- Examine page content dumps on failures

**Common Issues:**
- **Timing:** Add explicit waits for dynamic content
- **Multiple matches:** Use `.first()` or iterate through matches
- **Stale elements:** Re-query elements instead of storing references
- **Shadow DOM:** May require special handling (not yet implemented)

---

## Summary

This framework implements a **multi-strategy approach** to element location, providing:

✅ **Robustness:** Multiple fallback strategies  
✅ **Flexibility:** Handles various UI patterns  
✅ **Maintainability:** Centralized strategy logic  
✅ **Debuggability:** Detailed logging and error messages  
✅ **Reusability:** Generic steps work across different applications  
✅ **Reliability:** Self-healing through strategy iteration  

The strategies are continuously improved based on real-world test scenarios and UI patterns encountered in the application under test.
