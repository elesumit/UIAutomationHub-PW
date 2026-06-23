@PatientSafety @Regression
Feature: Verify Patient Safety checkbox visibility, mandatory validations and successful submission
  As a support agent
  I want additional Patient Safety-related fields to appear and be validated when "Is this a Patient Safety case?" is selected
  So that I can capture complete and accurate patient safety information during case creation

  @JIRA_PLACEHOLDER_1 @PatientSafety1 @BTC-371
  Scenario Outline: Verify Patient Safety checkbox visibility, mandatory validations and successful submission
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"

    # Fill mandatory case fields
    When I select "<product>" from "Select a Product"
    When I wait for 3 seconds
    When I select "<account>" from "Select an Account"
    When I select "<impact>" from "Impact"
    When I enter "<subject>" in "Subject"
    When I enter "<description>" in "Description"
    When I select "<contact_method>" from "How would you like to be contacted"
    When I wait for 2 seconds

    # TC1: Verify visibility of Patient Safety fields when main checkbox is selected
    When I check "Is this a Patient Safety case?"
    Then I should see "Did Actual Patient Harm/Injury Occur?"
    Then I should see "Is there Increase Risk for Potential Patient Harm/Injury?"
    Then I should see "Are there Potential Data Issues with Clinical Impact?"
    Then I should see "Is there a Potential Impact on Alarms or Warnings?"
    Then I should see "Could Clinical Communication Potentially Be Affected?"

    # TC11: Verify unchecking hides all related fields
    When I uncheck "Is this a Patient Safety case?"
    When I wait for 2 seconds
    Then I should not see "Did Actual Patient Harm/Injury Occur?"
    Then I should not see "Is there Increase Risk for Potential Patient Harm/Injury?"
    Then I should not see "Are there Potential Data Issues with Clinical Impact?"
    Then I should not see "Is there a Potential Impact on Alarms or Warnings?"
    Then I should not see "Could Clinical Communication Potentially Be Affected?"

    # TC2: Mandatory validation - checkbox 1
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Actual Patient Harm/Injury Details"
    When I uncheck "Did Actual Patient Harm/Injury Occur?"

    # TC3: Mandatory validation - checkbox 2
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Increase Risk for Potential Patient Harm/Injury Details"
    When I uncheck "Is there Increase Risk for Potential Patient Harm/Injury?"

    # TC4: Mandatory validation - checkbox 3
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Potential Data Issues with Clinical Impact Details"
    When I uncheck "Are there Potential Data Issues with Clinical Impact?"

    # TC5: Mandatory validation - checkbox 4
    When I check "Is there a Potential Impact on Alarms or Warnings?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Potential Impact on Alarms or Warnings Details"
    When I uncheck "Is there a Potential Impact on Alarms or Warnings?"

    # TC6: Mandatory validation - checkbox 5
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Potential Effect on Clinical Communication Details"
    When I uncheck "Could Clinical Communication Potentially Be Affected?"

    # TC7: Two checkboxes mandatory validation
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Actual Patient Harm/Injury Details"
    Then I should see error "Missing Required Fields: The following field is required: Increase Risk for Potential Patient Harm/Injury Details"
    When I uncheck "Did Actual Patient Harm/Injury Occur?"
    When I uncheck "Is there Increase Risk for Potential Patient Harm/Injury?"

    # TC8: Three checkboxes mandatory validation
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Actual Patient Harm/Injury Details"
    Then I should see error "Missing Required Fields: The following field is required: Increase Risk for Potential Patient Harm/Injury Details"
    Then I should see error "Missing Required Fields: The following field is required: Potential Data Issues with Clinical Impact Details"
    When I uncheck "Did Actual Patient Harm/Injury Occur?"
    When I uncheck "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I uncheck "Are there Potential Data Issues with Clinical Impact?"

    # TC9: All five checkboxes mandatory validation
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I check "Is there a Potential Impact on Alarms or Warnings?"
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Actual Patient Harm/Injury Details"
    Then I should see error "Missing Required Fields: The following field is required: Increase Risk for Potential Patient Harm/Injury Details"
    Then I should see error "Missing Required Fields: The following field is required: Potential Data Issues with Clinical Impact Details"
    Then I should see error "Missing Required Fields: The following field is required: Potential Impact on Alarms or Warnings Details"
    Then I should see error "Missing Required Fields: The following field is required: Potential Effect on Clinical Communication Details"

    # TC10: Fill all mandatory fields and submit successfully
    When I enter "<harm_details>" in "Actual Patient Harm/Injury Details"
    When I enter "<risk_details>" in "Increase Risk for Potential Patient Harm/Injury Details"
    When I enter "<clinical_impact_details>" in "Potential Data Issues with Clinical Impact Details"
    When I enter "<alarms_details>" in "Potential Impact on Alarms or Warnings Details"
    When I enter "<comm_details>" in "Potential Effect on Clinical Communication Details"
    When I click on "Submit"
    Then I see "Priority" as "<expected_priority>"

    Examples: excel:testdata/ServiceModule_QA_TestData.xlsx!case_mandatory_validation
