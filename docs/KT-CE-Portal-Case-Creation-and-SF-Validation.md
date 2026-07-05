# KT Document: CE Portal Case Creation & Salesforce Validation

## Overview

This document explains how the **Customer Experience (CE) Portal** case creation process works and how we verify the submitted data in **Salesforce (SF)**. This is the core E2E flow used across most of our test automation scenarios.

---

## 1. CE Portal — What Is It?

The CE Portal is the **customer-facing support portal** where support agents (or end users) create support cases. It is a web application separate from Salesforce. When a case is submitted in the CE Portal, it flows into Salesforce as a backend record.

**Key URL:** Stored in the `.env` file as an environment variable (not hardcoded in tests).

---

## 2. CE Portal Login Flow

Every test starts with logging into the CE Portal:

```gherkin
Given I navigate to CE Portal ""
When I click on "Log in"
When I wait for 3 seconds
When I enter "" in "CE_UserName"
When I click on "Continue"
When I enter "" in "CE_Password"
When I click on "Continue"
When I wait for 3 seconds
```

**Important notes:**
- Empty strings `""` for credentials mean the framework reads values from environment variables (`CE_UserName`, `CE_Password` in the `.env` file).
- The 30-second wait after login gives the portal time to fully load.

---

## 3. Navigating to Case Creation

After login, navigate to the case creation form:

```gherkin
When I click on "Support"
When I wait for 3 seconds
When I enter "Portal" in "Search for help"
When I wait for 3 seconds
When I click on "Create a Case"
```

This takes you to the **"How can we help?"** page with the case creation form.

---

## 4. Mandatory Case Fields

Every case requires these fields to be filled before submission:

| Field | Step Example | Notes |
|-------|-------------|-------|
| **Product** | `When I select "ScriptlessIQ Fiscal Management..." from "Select a Product"` | Dropdown selection |
| **Account** | `When I select "Meena's General Practice1" from "Select an Account"` | Dropdown, appears after Product |
| **Impact** | `When I select "Partial loss of service" from "Impact"` | Dropdown |
| **Subject** | `When I enter "Case description" in "Subject"` | Free text |
| **Description** | `When I enter "Details here" in "Description"` | Free text |
| **Contact Method** | `When I select "Phone" from "How would you like to be contacted"` | Dropdown |

---

## 5. Patient Safety Feature

When the **"Is this a Patient Safety case?"** checkbox is checked, 5 additional sub-checkboxes appear, each with a mandatory description field:

| # | Sub-Checkbox (CE Portal Label) | Description Field |
|---|-------------------------------|-------------------|
| 1 | Did Actual Patient Harm/Injury Occur? | Actual Patient Harm/Injury Details |
| 2 | Is there Increase Risk for Potential Patient Harm/Injury? | Increase Risk for Potential Patient Harm/Injury Details |
| 3 | Are there Potential Data Issues with Clinical Impact? | Potential Data Issues with Clinical Impact Details |
| 4 | Is there a Potential Impact on Alarms or Warnings? | Potential Impact on Alarms or Warnings Details |
| 5 | Could Clinical Communication Potentially Be Affected? | Potential Effect on Clinical Communication Details |

**Validation rules:**
- If a sub-checkbox is checked, its description field becomes **mandatory**.
- Submitting without filling a mandatory description shows a red error banner.
- Unchecking the main checkbox hides all sub-checkboxes and their fields.

**Example — checking a sub-checkbox and filling its description:**
```gherkin
When I check "Is this a Patient Safety case?"
When I check "Did Actual Patient Harm/Injury Occur?"
When I enter "Patient fell during procedure" in "Actual Patient Harm/Injury Details"
```

**Example — unchecking a checkbox:**
```gherkin
When I uncheck "Did Actual Patient Harm/Injury Occur?"
```

---

## 6. Submitting the Case & Capturing the Case Number

```gherkin
When I click on "Submit"
When I wait for 10 seconds
When I capture text from "Case Number" and store as "case1"
When I log captured "case1"
```

After submission, the portal displays a confirmation with the **Case Number**. We capture this number and store it in a variable (e.g., `case1`) so we can search for it later in Salesforce.

---

## 7. Salesforce Validation — Login

After creating cases in the CE Portal, we log into Salesforce to verify the data:

```gherkin
When I navigate to Salesforce ""
When I enter "" in "SFQA_UserName"
When I enter "" in "SF_Password"
When I click on "Log In to Sandbox"
When I wait for 5 seconds
When I click on "App Launcher"
When I enter "Service Console" in "Search apps and items..."
When I click on "Service Console"
When I wait for 3 seconds
```

**Notes:**
- We use the **Sandbox** environment (not production).
- `SFQA_UserName` and `SF_Password` are read from `.env`.
- We navigate to **Service Console** where cases are managed.

---

## 8. Salesforce Validation — Searching for a Case

**First search (fresh session):**
```gherkin
When I click on "Search..."
When I click on "Search: All"
When I enter captured "case1" in "Search..."
When I click on captured "case1"
```

**Subsequent searches (reuse search bar):**
```gherkin
When I click on Salesforce search and clear
When I enter captured "case2" in "Search..."
When I click on captured "case2"
```

The `When I click on Salesforce search and clear` step handles clicking the global search button and clearing any previous search text. This is needed because the search UI changes after the first search.

---

## 9. Salesforce Validation — Verifying Field Values

After opening a case, switch to the **Details** tab and assert field values:

```gherkin
When I click on the "Details" tab
When I wait for 3 seconds
Then I see "Status" as "New"
Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
Then I see "Actual Patient Harm/Injury Details" as "Patient fell during procedure"
Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
```

**Important — SF field labels differ from CE Portal labels!**

| CE Portal Label | Salesforce Label |
|----------------|-----------------|
| Did Actual Patient Harm/Injury Occur? | Did Actual Patient Harm/Injury Occur? |
| Is there Increase Risk for Potential Patient Harm/Injury? | **Is Increase Risk for Pat Harm/Injury?** |
| Increase Risk for Potential Patient Harm/Injury Details | **Increase Risk for Patient Harm Details** |
| Are there Potential Data Issues with Clinical Impact? | **Are Data Issues with Clinical Impact?** |
| Potential Data Issues with Clinical Impact Details | **Data Issues with Clinical Impact Details** |
| Is there a Potential Impact on Alarms or Warnings? | **Is there an Impact on Alarms/Warnings?** |
| Potential Impact on Alarms or Warnings Details | **Impact on Alarms or Warnings Details** |
| Could Clinical Communication Potentially Be Affected? | **Could Clinical Comm be Affected?** |
| Potential Effect on Clinical Communication Details | **Potential Effect on Clinical Comm Detail** |

Always use the **exact Salesforce label** in `Then I see` assertions.

---

## 10. Salesforce — Editing a Case

You can also edit case fields directly in Salesforce:

```gherkin
When I click on "Edit Is Increase Risk for Pat"
When I wait for 2 seconds
When I select "Data issue" from "Issue"
When I check "Is Increase Risk for Pat Harm/Injury?"
When I enter "Updated description" in "Increase Risk for Patient Harm Details"
When I click on "Save"
When I wait for 5 seconds
```

Then re-validate the updated values with `Then I see` assertions.

---

## 11. Key Step Definitions Reference

| Step | Purpose |
|------|---------|
| `When I click on "<text>"` | Click a button/link by visible text |
| `When I enter "<value>" in "<field>"` | Type into an input field |
| `When I select "<option>" from "<dropdown>"` | Select from a dropdown |
| `When I check "<checkbox>"` | Check a checkbox (set to ON) |
| `When I uncheck "<checkbox>"` | Uncheck a checkbox (set to OFF) |
| `When I wait for <N> seconds` | Explicit wait |
| `When I capture text from "<element>" and store as "<var>"` | Store dynamic text for later use |
| `When I enter captured "<var>" in "<field>"` | Use a previously captured value |
| `When I click on captured "<var>"` | Click on a previously captured value |
| `Then I see "<field>" as "<value>"` | Assert a Salesforce field value |
| `Then I should see "<text>"` | Assert text is visible on page |
| `Then I should not see "<text>"` | Assert text is NOT visible |
| `Then I should see error "<message>"` | Assert error banner text |

---

## 12. Feature File Structure

Feature files are in the `features/` folder and use **Gherkin** syntax (`.feature` extension).

**Tags:**
- **Feature-level tags** describe the category: `@PatientSafety`, `@ErrorValidation`, `@MandatoryFields`
- **Scenario-level tags** link to Jira: `@JIRA_PLACEHOLDER_1`, `@OSC-1257`

**Running a specific scenario by tag:**
```bash
npx.cmd cucumber-js --tags @PatientSafety1
```

**Running in headed mode (visible browser):**
```bash
cross-env HEADLESS=false npx.cmd cucumber-js --tags @PatientSafety1
```

---

## 13. Environment Setup

Credentials and URLs are stored in the `.env` file at the project root. Key variables:
- `CE_UserName` / `CE_Password` — CE Portal credentials
- `SFQA_UserName` / `SF_Password` — Salesforce sandbox credentials
- Portal and Salesforce URLs

Never hardcode credentials in feature files — use empty strings `""` and the framework resolves them automatically.

---

## 14. Typical E2E Test Flow (Summary)

```
1. Login to CE Portal
2. Navigate to Support → Search → Create a Case
3. Fill mandatory fields (Product, Account, Impact, Subject, Description, Contact Method)
4. Optionally check Patient Safety checkboxes and fill descriptions
5. Submit the case
6. Capture the Case Number
7. (Repeat steps 2-6 for additional cases)
8. Login to Salesforce → Service Console
9. Search for each case by captured Case Number
10. Open Details tab → Assert field values (true/false for checkboxes, text for descriptions)
11. Optionally edit and re-validate
```

---

*Document created for QA onboarding. For framework architecture details, see `docs/ARCHITECTURE.md` and `docs/GENERIC_STEPS_REFERENCE.md`.*
