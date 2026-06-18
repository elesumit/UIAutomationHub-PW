# Generic Steps Reference Guide

**Complete list of all available Gherkin steps in the Everest Framework**

All steps use **LocatorPro** for self-healing with 35-priority intelligent selector generation.

---

## 📋 Table of Contents

- [Navigation Steps](#navigation-steps)
- [Form Interaction Steps](#form-interaction-steps)
- [Table/Grid Steps](#tablegrid-steps)
- [Verification Steps](#verification-steps)

---

## 🧭 Navigation Steps

### Navigate to URL
```gherkin
Given I navigate to "https://example.com"
Given I navigate to "file:///C:/Users/path/to/file.html"
```

### Click Elements
```gherkin
When I click on "Login"
When I click on "Submit"
When I click on "More information"
```
**Strategies:** Prioritizes buttons, submit inputs, links, then uses LocatorPro text search  
**Auto-Handling:** ✅ Automatically detects and switches to new pages/tabs opened by the click

### Click Links
```gherkin
When I click on the "Home" link
When I click on the "About Us" link
When I click on the "Contact" link
```
**Strategies:** Finds links by text, href, title, aria-label, role="link"  
**Auto-Handling:** ✅ Automatically detects and switches to new pages/tabs opened by the link

### Hover/Mouseover
```gherkin
When I hover over "Products"
When I hover over "User Menu"
When I hover over "Settings"
```
**Strategies:** Finds elements by text, role, id, class, then uses LocatorPro fallback

### Hover and Click Menu (Dropdown Menus)
```gherkin
When I hover over "Products" and click on "Software"
When I hover over "Account" and click on "Settings"
When I hover over "More" and click on "Help Center"
```
**Use Case:** Perfect for dropdown menus that appear on hover  
**Features:** Hovers over main menu, waits 500ms for dropdown, then clicks menu item

### Wait
```gherkin
When I wait for 2 seconds
When I wait for 5 seconds
```

### Screenshots
```gherkin
Then I take a screenshot named "homepage"
Then I take a screenshot named "error-state"
```

### New Page/Tab Handling

**✨ Automatic Behavior:**  
All click steps (`I click on` and `I click on the link`) **automatically detect and switch** to new pages/tabs! You don't need special steps for most cases.

**Manual Tab Switching (when needed):**
```gherkin
# Only use these when you need explicit control:
When I click on "Open in New Tab" and switch to new page
When I switch to new tab
When I switch to tab 0
When I switch to tab 1
When I switch to original tab
When I close current tab
```
**Use Cases for Manual Steps:**
- Switch between multiple already-open tabs
- Close specific tabs
- Return to original tab after working in new tab
- Handle complex multi-tab workflows

### Popup/Alert/Dialog Handling
```gherkin
When I accept the alert
When I dismiss the alert
When I accept the alert with text "My input"
Then I should see alert with message "Are you sure?"
```
**Features:**
- Handles JavaScript alerts, confirms, and prompts
- Verifies alert messages
- Accepts or dismisses dialogs
- Provides input to prompt dialogs

**Note:** LocatorPro and Playwright automatically handle iframes - no special steps needed!

---

## 📝 Form Interaction Steps

### Text Inputs
```gherkin
When I enter "john@example.com" in "Email"
When I enter "Password123!" in "password"
When I enter "John Doe" in the "Full Name" field
```
**Finds by:** name, id, placeholder, type+name, then text-based fallback

### Textareas
```gherkin
When I enter "Long text here..." in the "Comments" textarea
When I enter "Description" in the "Bio" textarea
```
**Finds by:** name, id, placeholder, aria-label, label association

### Dropdowns/Select
```gherkin
When I select "United States" from "Country"
When I select "Active" from "Status"
When I select "Option 1" from "dropdown"
```
**Finds by:** name, id (case-insensitive), aria-label

### Checkboxes
```gherkin
When I check "I agree to terms and conditions"
When I check "Subscribe to newsletter"
When I check "Remember me"
```
**Finds by:** name, id, value, label text association

### Radio Buttons
```gherkin
When I select the "Male" radio button
When I select the "Female" radio button
When I select the "Yes" radio button
```
**Finds by:** value, id, name, label text association

---

## 📊 Table/Grid Steps

### Click Table Elements

#### Click Entire Row
```gherkin
When I click on row 1 in the table
When I click on row 5 in the table
```

#### Click Specific Cell (by index)
```gherkin
When I click on row 2 column 3 in the table
```

#### Click Cell (by column name)
```gherkin
When I click on the cell in row 1 column "Actions"
When I click on the cell in row 3 column "Edit"
```

#### Click in Row Containing Text
```gherkin
When I click on "Edit" in the table row containing "John Doe"
When I click on "Delete" in the table row containing "john@example.com"
```

#### Click by Single Criterion
```gherkin
When I click on "Edit" in the row where "Email" is "john@example.com"
When I click on "View" in the row where "Status" is "Active"
```

#### Click by Multiple Criteria
```gherkin
When I click on "Delete" in the row where "Email" is "john@example.com" and "Status" is "Inactive"
When I click on "Edit" in the row where "Name" is "John Doe" and "Role" is "Admin"
```

### Table Data Entry

#### Enter Text in Cell
```gherkin
When I enter "New Value" in row 1 column "Name"
When I enter "100" in row 2 column "Quantity"
```

#### Select from Dropdown in Cell
```gherkin
When I select "Active" in row 1 column "Status"
When I select "High" in row 3 column "Priority"
```

### Table Sorting
```gherkin
When I sort the table by column "Name"
When I sort the table by column "Date"
```

### Pagination

#### Click Page Number
```gherkin
When I click on page 2 in the table pagination
When I click on page 5 in the table pagination
```

#### Click Pagination Buttons
```gherkin
When I click on "Next" in the table pagination
When I click on "Previous" in the table pagination
When I click on "Last" in the table pagination
```

### Table Verification

#### Verify Row Count
```gherkin
Then the table should have 10 rows
Then the table should have 25 rows
```

#### Verify Cell Content (by index)
```gherkin
Then the table row 1 column 2 should contain "Active"
Then the table row 3 column 4 should contain "Admin"
```

#### Verify Cell Content (by column name)
```gherkin
Then the table row 1 column "Status" should contain "Active"
Then the table row 2 column "Email" should contain "john@example.com"
```

#### Verify Table Contains Text
```gherkin
Then the table should contain "John Doe"
Then the table should contain "Active"
```

#### Verify Specific Cell in Row with Text
```gherkin
Then the table row containing "John Doe" should have "Admin" in column "Role"
Then the table row containing "john@example.com" should have "Active" in column "Status"
```

#### Verify All Rows in Column
```gherkin
Then all rows in column "Status" should contain "Active"
Then all rows in column "Type" should contain "Premium"
```

#### Verify Column Has Unique Values
```gherkin
Then the table column "Email" should contain unique values
Then the table column "ID" should contain unique values
```

#### Verify Column Matches Pattern (Regex)
```gherkin
Then all rows in column "Email" should match the pattern "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
Then all rows in column "Phone" should match the pattern "^\d{3}-\d{3}-\d{4}$"
Then all rows in column "Date" should match the pattern "^\d{4}-\d{2}-\d{2}$"
```

#### Verify Column Sorting
```gherkin
Then the table column "Name" should be sorted in "ascending" order
Then the table column "Date" should be sorted in "descending" order
```

### Wait for Table Updates

#### Wait for Specific Row Count
```gherkin
When I wait for the table to have 10 rows
When I wait for the table to have 5 rows
```

#### Wait for Table to Contain Text
```gherkin
When I wait for the table to contain "John Doe"
When I wait for the table to contain "Processing complete"
```

---

## ✅ Verification Steps

### Verify Text Visibility
```gherkin
Then I should see "Welcome"
Then I should see "Login successful"
Then I should see the text "Error message"
```

### Verify Page Title
```gherkin
Then the page title should be "Example Domain"
Then the page title should contain "Dashboard"
```

### Verify URL
```gherkin
Then the URL should be "https://example.com/dashboard"
Then the URL should contain "dashboard"
Then the URL should contain "success"
```

### Verify Element Visibility
```gherkin
Then the "Login button" should be visible
Then the "Error message" should be visible
Then the "Success banner" should not be visible
```

---

## 🎯 Quick Examples

### Complete Login Flow
```gherkin
@login @smoke
Feature: User Login

  Scenario: Successful login
    Given I navigate to "https://example.com/login"
    When I enter "user@example.com" in "Email"
    And I enter "Password123!" in "Password"
    And I check "Remember me"
    And I click on "Login"
    Then I should see "Welcome"
    And the URL should contain "dashboard"
```

### Registration Form with All Input Types
```gherkin
@registration
Feature: User Registration

  Scenario: Complete registration
    Given I navigate to "https://example.com/register"
    When I enter "John Doe" in "Full Name"
    And I enter "john@example.com" in "Email"
    And I enter "Password123!" in "Password"
    And I select the "Male" radio button
    And I select "United States" from "Country"
    And I enter "Tell us about yourself" in the "Bio" textarea
    And I check "I agree to terms and conditions"
    And I click on "Register"
    Then I should see "Registration successful"
```

### Dynamic Table Operations
```gherkin
@table @dynamic
Feature: User Management Table

  Scenario: Find and edit user
    Given I navigate to "https://example.com/users"
    When I click on "Edit" in the row where "Email" is "john@example.com"
    Then I should see "Edit User"
    
  Scenario: Verify table data
    Given I navigate to "https://example.com/users"
    Then the table should have 10 rows
    And the table row 1 column "Status" should contain "Active"
    And all rows in column "Status" should contain "Active"
    And the table column "Email" should contain unique values
    
  Scenario: Pagination
    Given I navigate to "https://example.com/users"
    When I click on page 2 in the table pagination
    Then the table should have 10 rows
    When I click on "Next" in the table pagination
    Then the table should contain "Page 3"
```

### Multi-Criteria Table Search
```gherkin
@table @advanced
Feature: Advanced Table Operations

  Scenario: Delete specific user
    Given I navigate to "https://example.com/users"
    When I click on "Delete" in the row where "Email" is "john@example.com" and "Status" is "Inactive"
    And I click on "Confirm"
    Then the table should not contain "john@example.com"
    
  Scenario: Verify email format
    Given I navigate to "https://example.com/users"
    Then all rows in column "Email" should match the pattern "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    
  Scenario: Verify sorted data
    Given I navigate to "https://example.com/users"
    When I sort the table by column "Name"
    Then the table column "Name" should be sorted in "ascending" order
```

---

## 📁 Step Definition Files

Steps are organized in the following files:

- **`navigation-steps.ts`** - Navigation, clicking, screenshots
- **`form-steps.ts`** - All form inputs (text, textarea, select, checkbox, radio)
- **`table-steps.ts`** - Table/grid operations and pagination
- **`verification-steps.ts`** - Assertions and validations

All steps are imported via **`generic-steps.ts`**

---

## 🔧 LocatorPro Features

Every step uses **LocatorPro** for:

✅ **35-priority intelligent selector generation**  
✅ **Self-healing locators** - Auto-recovery when selectors break  
✅ **Shadow DOM support** - Works inside shadow roots  
✅ **iframe support** - Works across iframe boundaries  
✅ **Smart DOM scanning** - Finds elements by text, role, attributes  
✅ **Multiple fallback strategies** - Never fails on first attempt  

---

## 💡 Best Practices

### 1. Use Descriptive Names
```gherkin
# Good
When I enter "john@example.com" in "Email"

# Avoid
When I enter "john@example.com" in "input1"
```

### 2. Leverage Column Names for Tables
```gherkin
# Good - Readable and maintainable
When I click on "Edit" in the row where "Email" is "john@example.com"

# Avoid - Hard to maintain
When I click on row 5 column 3 in the table
```

### 3. Use Tags for Organization
```gherkin
@smoke @critical
Scenario: Critical login flow

@regression
Scenario: Full registration flow

@wip
Scenario: New feature (work in progress)
```

### 4. Combine Steps Logically
```gherkin
# Good - Clear flow
Given I navigate to "https://example.com"
When I enter "user@example.com" in "Email"
And I enter "Password123!" in "Password"
And I click on "Login"
Then I should see "Welcome"
```

---

## 🚀 Running Tests with Specific Steps

```bash
# Run all tests
npm run test:headed

# Run tests with specific tags
npm run test:tags "@login"
npm run test:tags "@table"
npm run test:tags "@smoke and @critical"

# Run smoke tests
npm run test:smoke:headed

# Run with slow motion for observation
npm run test:login:slow
```

---

## 📚 Related Documentation

- `LOCATORPRO_INTEGRATION.md` - LocatorPro features and API
- `TAG_BASED_EXECUTION.md` - Tag-based test execution
- `AZURE_DEVOPS_INTEGRATION.md` - CI/CD integration
- `RUNNING_TESTS.md` - How to run tests

---

**Framework Version:** 1.0.0  
**Last Updated:** February 2026  
**Maintained by:** Everest Framework Team
