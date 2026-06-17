# Everest Framework - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
npx playwright install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your application URL:
```
BASE_URL=http://localhost:3000
```

### Step 3: Run Example Tests

#### Option A: Cucumber/Gherkin Tests
```bash
npm test
```

#### Option B: Playwright Tests
```bash
npx playwright test
```

### Step 4: View Reports
```bash
# Cucumber report
open test-results/cucumber-report.html

# Playwright report
npm run report
```

## 📝 Write Your First Test

### 1. Create a Feature File
Create `automation/features/my-first-test.feature`:

```gherkin
Feature: My First Test
  Scenario: Visit homepage
    Given I navigate to "https://example.com"
    Then I should see "Example Domain"
    And the page title should contain "Example"
```

### 2. Run Your Test
```bash
npm test
```

That's it! The framework uses generic step definitions, so no additional code is needed.

## 🎯 Common Test Patterns

### Login Test
```gherkin
Feature: User Login
  Scenario: Successful login
    Given I am on the login page
    When I enter username "user@example.com"
    And I enter password "password123"
    And I click the login button
    Then I should be logged in successfully
```

### Form Submission
```gherkin
Feature: Contact Form
  Scenario: Submit contact form
    Given I navigate to "https://example.com/contact"
    When I enter "John Doe" in "Name"
    And I enter "john@example.com" in "Email"
    And I enter "Hello!" in "Message"
    And I click on "Submit"
    Then I should see "Thank you"
```

### Navigation Test
```gherkin
Feature: Navigation
  Scenario: Navigate to about page
    Given I navigate to "https://example.com"
    When I click on "About"
    Then the URL should contain "about"
```

## 🔧 Advanced Features

### Self-Healing Locators
The framework automatically heals broken locators. No configuration needed!

### Session State
Save login state to skip authentication in subsequent tests:

```gherkin
Scenario: Login and save state
  Given I am on the login page
  When I login with username "user@example.com" and password "pass123"
  Then I should be logged in successfully
  And I save the session state
```

### Screenshots
Take screenshots during tests:

```gherkin
Then I take a screenshot named "homepage"
```

## 📚 Next Steps

1. **Read the full setup guide**: `SETUP.md`
2. **Understand the architecture**: `ARCHITECTURE.md`
3. **Learn to contribute**: `CONTRIBUTING.md`
4. **Explore example tests**: `automation/features/`
5. **Check out Page Objects**: `automation/pom/`

## 🆘 Need Help?

- Check `SETUP.md` for detailed installation instructions
- Review `ARCHITECTURE.md` to understand the framework
- Look at example tests in `automation/features/`
- Check the console output for healed locator logs

## 🎉 You're Ready!

Start writing tests using the generic step definitions, and create custom Page Objects and steps only when needed.

Happy Testing! 🚀
