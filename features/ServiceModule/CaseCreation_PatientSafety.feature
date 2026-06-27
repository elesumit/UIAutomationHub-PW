@PatientSafety123 @Regression
Feature: Create Patient Safety Cases and Validate in Salesforce - Two Cases with Checkbox Combinations 
  User Story OSF1275
  As a support agent
  I want additional Patient Safety-related fields to appear and be validated when "Is this a Patient Safety case?" is selected
  So that I can capture complete and accurate patient safety information during case creation

  @BTC-340
  Scenario Outline: Create Patient Safety Cases and Validate in Salesforce
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds

    # ── CASE 1: All 5 checkboxes ──────────────────────────────────────────
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "<product>" from "Select a Product"
    When I wait for 3 seconds
    When I select "<account>" from "Select an Account"
    When I select "<impact>" from "Impact"
    When I enter "<case1_subject>" in "Subject"
    When I enter "<case1_description>" in "Description"
    When I select "<contact_method>" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I enter "<harm_details1>" in "Actual Patient Harm/Injury Details"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I enter "<risk_details1>" in "Increase Risk for Potential Patient Harm/Injury Details"
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I enter "<clinical_impact1>" in "Potential Data Issues with Clinical Impact Details"
    When I check "Is there a Potential Impact on Alarms or Warnings?"
    When I enter "<alarms_details1>" in "Potential Impact on Alarms or Warnings Details"
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I enter "<comm_details1>" in "Potential Effect on Clinical Communication Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case1"
    When I log captured "case1"

    # ── CASE 2: Checkbox 1 only ────────────────────────────────────────────
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "<product>" from "Select a Product"
    When I wait for 3 seconds
    When I select "<account>" from "Select an Account"
    When I select "<impact>" from "Impact"
    When I enter "<case2_subject>" in "Subject"
    When I enter "<case2_description>" in "Description"
    When I select "<contact_method>" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I enter "<harm_details2>" in "Actual Patient Harm/Injury Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case2"
    When I log captured "case2"

    # ── SALESFORCE VALIDATION ─────────────────────────────────────────────
    When I navigate to Salesforce ""
    When I wait for 2 seconds
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds

    # Verify Case 1 - All 5 checkboxes
    When I click on "Search..."
    When I click on "Search: All"
    When I enter captured "case1" in "Search..."
    When I click on captured "case1"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Status" as "New"
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "<harm_details1>"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "true"
    Then I see "Increase Risk for Patient Harm Details" as "<risk_details1>"
    Then I see "Are Data Issues with Clinical Impact?" as "true"
    Then I see "Data Issues with Clinical Impact Details" as "<clinical_impact1>"
    Then I see "Is there an Impact on Alarms/Warnings?" as "true"
    Then I see "Impact on Alarms or Warnings Details" as "<alarms_details1>"
    Then I see "Could Clinical Comm be Affected?" as "true"
    Then I see "Potential Effect on Clinical Comm Detail" as "<comm_details1>"

    # Verify Case 2 - Checkbox 1 only
    When I click on Salesforce search and clear
    When I enter captured "case2" in "Search..."
    When I click on captured "case2"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "<harm_details2>"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "false"

    # Edit Case 2 - Add checkboxes 2 and 5
    When I click on "Edit Is Increase Risk for Pat"
    When I wait for 2 seconds
    When I select "<edit_issue>" from "Issue"
    When I check "Is Increase Risk for Pat Harm/Injury?"
    When I enter "<edit_risk_details>" in "Increase Risk for Patient Harm Details"
    When I check "Could Clinical Comm be Affected?"
    When I enter "<edit_comm_details>" in "Potential Effect on Clinical Comm Detail"
    When I click on "Save"
    When I wait for 5 seconds

    # Validate edited Case 2
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "<harm_details2>"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "true"
    Then I see "Increase Risk for Patient Harm Details" as "<edit_risk_details>"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "true"
    Then I see "Potential Effect on Clinical Comm Detail" as "<edit_comm_details>"

    Examples: excel:testdata/ServiceModule_QA_TestData.xlsx!case_patient_safety
