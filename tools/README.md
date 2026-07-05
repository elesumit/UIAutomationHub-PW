# 🛠️ Test Creation Tools for Manual Testers

This folder contains tools to simplify test creation for manual testers, making Playwright test automation as easy as AccelQ.

## 📋 Tools Overview

### 1. **Excel to Gherkin Converter** 
Convert Excel spreadsheets to Gherkin feature files - no coding required!

### 2. **Codegen UI Wrapper**
Visual test recorder with a simple web interface - record tests by clicking through your application.

---

## 🚀 Quick Start

### Prerequisites

Install required dependencies:

```bash
npm install xlsx express
```

---

## 📊 Tool 1: Excel to Gherkin Converter

### How It Works

1. Manual testers write test steps in Excel/CSV
2. Run the converter script
3. Get a ready-to-use Gherkin feature file

### Excel Format

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| Test Case ID | Scenario Name | Tags | Action | Element | Value |
| XSP-135 | Create Case | @smoke, @regression | Click | Log in | |
| | | | Enter | CE_UserName | admin |
| | | | Click | Continue | |

### Supported Actions (Simple Version - Recommended)

Use these intuitive actions in your Excel file:

- **Open** - Open a website (e.g., CE Portal, Salesforce)
- **Click** - Click on any button, link, or element
- **Type** - Type text into any field or box
- **Choose** - Select an option from a dropdown
- **Attach** - Upload a file
- **Remember** - Save a value to use later (e.g., Case Number)
- **Check** - Verify that something shows the expected value

### Advanced Actions (For Power Users)

- **Wait** - Wait for X seconds (auto-added by framework, usually not needed)
- **Navigate** - Same as "Open"
- **Enter** - Same as "Type"
- **Select** - Same as "Choose"
- **Upload** - Same as "Attach"
- **Capture** - Same as "Remember"
- **Verify** - Same as "Check"
- **ClickCaptured** - Click on a previously remembered value
- **EnterCaptured** - Type a previously remembered value
- **Tab** - Click on a tab

### Usage

**Step 1: Create your test in Excel**

Use the provided template: `tools/test-case-template.csv`

**Step 2: Convert to Gherkin**

```bash
npx ts-node tools/excel-to-gherkin.ts test-cases.xlsx features
```

**Step 3: Run your test**

```bash
npm run test:smoke
```

### Example

**Excel Input:**
```
Test Case ID: XSP-135
Scenario Name: Login to CE Portal
Tags: @smoke
Action: Navigate, Element: CE Portal
Action: Click, Element: Log in
Action: Enter, Element: CE_UserName, Value: admin
Action: Click, Element: Continue
```

**Generated Gherkin:**
```gherkin
@XSP-135
Feature: Login to CE Portal

  @XSP-135 @smoke
  Scenario: Login to CE Portal
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I enter "admin" in "CE_UserName"
    When I click on "Continue"
```

---

## 🎬 Tool 2: Codegen UI Wrapper

### How It Works

1. Open the web UI in your browser
2. Enter test details (Test Case ID, Scenario Name)
3. Click "Start Recording"
4. Interact with your application in the opened browser
5. Click "Stop Recording"
6. Review and convert to Gherkin
7. Save the feature file

### Usage

**Step 1: Start the UI server**

```bash
npx ts-node tools/codegen-ui/server.ts
```

**Step 2: Open in browser**

Navigate to: http://localhost:3000

**Step 3: Record your test**

1. Fill in test information:
   - Test Case ID (e.g., XSP-135)
   - Scenario Name
   - Starting URL
   - Tags (@smoke, @regression, etc.)

2. Click "Start Recording"
   - A browser window will open
   - Perform your test actions
   - The tool records everything

3. Click "Stop Recording"
   - Review the recorded code
   - Click "Convert to Gherkin"

4. Save the feature file
   - Review the generated Gherkin
   - Click "Save Feature File"
   - File is saved to `features/` folder

### Features

✅ **Visual Recording** - No command line needed  
✅ **Automatic Conversion** - Playwright code → Gherkin  
✅ **Jira Integration** - Link to test case IDs  
✅ **Tag Management** - Add @smoke, @regression tags  
✅ **Live Preview** - See generated steps in real-time  
✅ **One-Click Save** - Saves directly to features folder  

---

## 📝 Best Practices

### For Excel Method

1. **Use the template** - Start with `test-case-template.csv`
2. **One scenario per sheet** - Keep it simple
3. **Clear element names** - Use exact button/field names from the UI
4. **Test locally first** - Verify the generated feature file works
5. **Version control** - Keep Excel files in a separate folder

### For Codegen UI

1. **Plan your test** - Know what you want to test before recording
2. **Go slow** - Give the page time to load between actions
3. **Review before saving** - Check the generated Gherkin makes sense
4. **Edit if needed** - You can manually edit the generated code
5. **Test immediately** - Run the test right after creating it

---

## 🎯 Comparison with AccelQ

| Feature | AccelQ | Our Tools | Notes |
|---------|--------|-----------|-------|
| Visual Recording | ✅ | ✅ | Codegen UI |
| Excel/CSV Import | ✅ | ✅ | Excel Converter |
| No Coding Required | ✅ | ✅ | Both tools |
| Jira Integration | ✅ | ✅ | Built-in |
| Free & Open Source | ❌ | ✅ | No licensing costs |
| Playwright Power | ❌ | ✅ | Full Playwright features |

---

## 🆘 Troubleshooting

### Excel Converter Issues

**Problem:** "Cannot find module 'xlsx'"  
**Solution:** Run `npm install xlsx`

**Problem:** "File not found"  
**Solution:** Use absolute path or run from project root

**Problem:** "Unknown action"  
**Solution:** Check supported actions list above

### Codegen UI Issues

**Problem:** "Cannot find module 'express'"  
**Solution:** Run `npm install express`

**Problem:** "Port 3000 already in use"  
**Solution:** Kill the process or change PORT in server.ts

**Problem:** "Browser doesn't open"  
**Solution:** Make sure Playwright is installed: `npx playwright install`

---

## 🎓 Training Manual Testers

### 30-Minute Onboarding

**Minute 0-5:** Introduction
- Show the tools
- Explain the benefits
- Demo a simple test

**Minute 5-15:** Excel Method
- Open the template
- Fill in a simple test (login)
- Run the converter
- Show the generated file
- Run the test

**Minute 15-25:** Codegen UI
- Open the web interface
- Record a test together
- Convert to Gherkin
- Save and run

**Minute 25-30:** Q&A and Practice
- Answer questions
- Let them try on their own
- Provide the template and documentation

---

## 📞 Support

If you encounter issues:

1. Check this README
2. Review the example files
3. Ask the automation team
4. Create a Jira ticket with details

---

## 🔄 Future Enhancements

- [ ] Bulk Excel import (multiple test cases at once)
- [ ] AI-powered step suggestions
- [ ] Screenshot capture during recording
- [ ] Test data management
- [ ] Integration with Test Management tools
- [ ] Mobile app recording support

---

**Happy Testing! 🎉**
