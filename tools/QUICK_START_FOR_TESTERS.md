# 📝 Quick Start Guide for Manual Testers

## The Easiest Way to Create Automated Tests

No coding required! Just fill out an Excel/CSV file and run one command.

---

## 🚀 3-Step Process

### Step 1: Open the Template

Open this file in Excel: `tools/test-case-template-simple.csv`

### Step 2: Fill in Your Test

| Column | What to Put | Example |
|--------|-------------|---------|
| **A: Test Case ID** | Your Jira ticket number | BTC-201 |
| **B: Scenario Name** | What the test does | Create Case |
| **C: Tags** | Test categories | @smoke, @regression |
| **D: Action** | What to do (see below) | Click |
| **E: What to Click/Enter** | Button or field name | Log in button |
| **F: Value** | Text to type (if needed) | admin@test.com |

**Important:** Only fill columns A, B, C on the FIRST row. Leave them blank for all other rows.

### Step 3: Convert to Test

Run this command:
```bash
npx ts-node tools/excel-to-gherkin.ts your-test.csv features
```

Done! Your test is ready to run.

---

## 📋 Simple Actions You Can Use

### Basic Actions (Use These Most)

| Action | When to Use | Example Element | Example Value |
|--------|-------------|-----------------|---------------|
| **Open** | Start at a website | CE Portal | _(leave blank)_ |
| **Click** | Click anything | Log in button | _(leave blank)_ |
| **Type** | Enter text | Username field | admin@test.com |
| **Choose** | Pick from dropdown | Product dropdown | Fiscal Management |
| **Check** | Verify something | Status field shows | New |

### Special Actions

| Action | When to Use | Example Element | Example Value |
|--------|-------------|-----------------|---------------|
| **Attach** | Upload a file | Upload Files button | test.png |
| **Remember** | Save a value for later | Case Number | caseId1 |
| **Type** (with remembered value) | Use saved value | Search box | Use remembered caseId1 |

---

## 💡 Examples

### Example 1: Simple Login Test

```csv
Test Case ID,Scenario Name,Tags,Action,What to Click/Enter,Value
BTC-100,Login to Portal,@smoke,Open,CE Portal,
,,,Click,Log in button,
,,,Type,Username field,admin@test.com
,,,Type,Password field,MyPassword123
,,,Click,Continue button,
,,,Check,Welcome message shows,Welcome Admin
```

### Example 2: Create Case with Verification

```csv
Test Case ID,Scenario Name,Tags,Action,What to Click/Enter,Value
BTC-101,Create Support Case,@regression,Open,CE Portal,
,,,Click,Log in button,
,,,Type,Username field,
,,,Click,Continue button,
,,,Type,Password field,
,,,Click,Continue button,
,,,Click,Support link,
,,,Click,Create a Case button,
,,,Type,Subject field,Portal not loading
,,,Type,Description field,User cannot access portal
,,,Click,Submit button,
,,,Remember,Case Number,myCase
,,,Check,Status shows,Submitted
```

### Example 3: Using Remembered Values

```csv
Test Case ID,Scenario Name,Tags,Action,What to Click/Enter,Value
BTC-102,Search for Case,@smoke,Open,Salesforce,
,,,Click,Search box,
,,,Type,Search field,Use remembered myCase
,,,Click,Search button,
,,,Check,Case status shows,Open
```

---

## ❌ Common Mistakes to Avoid

### ❌ DON'T: Add waits manually
```csv
,,,Wait,5,
```
**Why:** The framework adds waits automatically. You don't need to worry about timing.

### ✅ DO: Just write the actions
```csv
,,,Click,Submit button,
,,,Check,Success message shows,Case Created
```

---

### ❌ DON'T: Use technical field names
```csv
,,,Type,input[name="username"],admin
```
**Why:** Too technical. Use simple descriptions.

### ✅ DO: Use simple, clear names
```csv
,,,Type,Username field,admin
```

---

### ❌ DON'T: Fill Test Case ID on every row
```csv
BTC-100,Login Test,@smoke,Open,CE Portal,
BTC-100,Login Test,@smoke,Click,Log in,
BTC-100,Login Test,@smoke,Type,Username,admin
```
**Why:** Only the first row needs it.

### ✅ DO: Leave it blank after the first row
```csv
BTC-100,Login Test,@smoke,Open,CE Portal,
,,,Click,Log in button,
,,,Type,Username field,admin
```

---

## 🎯 Tips for Success

1. **Be descriptive** - "Log in button" is better than "Login" or "Button1"
2. **One action per row** - Don't combine multiple actions
3. **Use simple language** - Write like you're telling someone what to do
4. **Test small first** - Start with a 5-step test, then expand
5. **Save often** - Save your CSV file frequently

---

## 🆘 Need Help?

### "I don't know what to put in the Element column"

Look at the screen and describe what you see:
- "Log in button" (not "btn_login")
- "Username field" (not "input_user")
- "Product dropdown" (not "select_product")

### "Should I add waits between steps?"

No! The framework handles all timing automatically. Just write the actions in order.

### "How do I verify something?"

Use the **Check** action:
```csv
,,,Check,Status field shows,Completed
,,,Check,Error message shows,Invalid username
```

### "Can I reuse a value I captured earlier?"

Yes! Use **Remember** to save it, then **Type** with "Use remembered":
```csv
,,,Remember,Order Number,orderNum
,,,Type,Search box,Use remembered orderNum
```

---

## 🎓 Training Video

_(Coming soon - 5-minute walkthrough video)_

---

## 📞 Support

Questions? Ask the automation team or create a Jira ticket.

**Happy Testing! 🎉**
