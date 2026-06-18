@PatientSafety @ErrorValidation @MandatoryFields
Feature: Patient Safety Conditional Fields Visibility and Mandatory Validation in Case Creation
  As a support agent
  I want additional Patient Safety-related fields to appear and be validated when "Is this a Patient Safety case?" is selected
  So that I can capture complete and accurate patient safety information during case creation

  @JIRA_PLACEHOLDER_1 @PatientSafety1
  Scenario: Verify Patient Safety checkbox visibility, mandatory validations for all 5 checkboxes, combinations, and successful submission
    # Login to CE Portal
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
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Report not working" in "Subject"
    When I enter "Not able to see the reports" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds

    # TC1: Verify visibility of Patient Safety-related fields when main checkbox is selected
    When I check "Is this a Patient Safety case?"
    Then I should see "Did Actual Patient Harm/Injury Occur?"
    Then I should see "Is there Increase Risk for Potential Patient Harm/Injury?"
    Then I should see "Are there Potential Data Issues with Clinical Impact?"
    Then I should see "Is there a Potential Impact on Alarms or Warnings?"
    Then I should see "Could Clinical Communication Potentially Be Affected?"

    # TC11: Verify unchecking "Is this a Patient Safety case?" hides all related fields
    When I uncheck "Is this a Patient Safety case?"
    When I wait for 2 seconds
    Then I should not see "Did Actual Patient Harm/Injury Occur?"
    Then I should not see "Is there Increase Risk for Potential Patient Harm/Injury?"
    Then I should not see "Are there Potential Data Issues with Clinical Impact?"
    Then I should not see "Is there a Potential Impact on Alarms or Warnings?"
    Then I should not see "Could Clinical Communication Potentially Be Affected?"

    # TC2: Verify mandatory validation for "Did Actual Patient Harm/Injury Occur?" checkbox
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Actual Patient Harm/Injury Details"
    When I uncheck "Did Actual Patient Harm/Injury Occur?"

    # TC3: Verify mandatory validation for "Is there Increase Risk for Potential Patient Harm/Injury?" checkbox
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Increase Risk for Potential Patient Harm/Injury Details"
    When I uncheck "Is there Increase Risk for Potential Patient Harm/Injury?"

    # TC4: Verify mandatory validation for "Are there Potential Data Issues with Clinical Impact?" checkbox
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Potential Data Issues with Clinical Impact Details"
    When I uncheck "Are there Potential Data Issues with Clinical Impact?"

    # TC5: Verify mandatory validation for "Is there a Potential Impact on Alarms or Warnings?" checkbox
    When I check "Is there a Potential Impact on Alarms or Warnings?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Potential Impact on Alarms or Warnings Details"
    When I uncheck "Is there a Potential Impact on Alarms or Warnings?"

    # TC6: Verify mandatory validation for "Could Clinical Communication Potentially Be Affected?" checkbox
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Potential Effect on Clinical Communication Details"
    When I uncheck "Could Clinical Communication Potentially Be Affected?"

    # TC7: Verify mandatory validation for two selected checkboxes
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I click on "Submit"
    Then I should see error "Missing Required Fields: The following field is required: Actual Patient Harm/Injury Details"
    Then I should see error "Missing Required Fields: The following field is required: Increase Risk for Potential Patient Harm/Injury Details"
    When I uncheck "Did Actual Patient Harm/Injury Occur?"
    When I uncheck "Is there Increase Risk for Potential Patient Harm/Injury?"

    # TC8: Verify mandatory validation for three selected checkboxes
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

    # TC9: Verify mandatory validation for all five checkboxes
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

    # TC10: Fill all mandatory fields and verify successful submission
    When I enter "Details about patient harm" in "Actual Patient Harm/Injury Details"
    When I enter "Details about potential harm risk" in "Increase Risk for Potential Patient Harm/Injury Details"
    When I enter "Details about clinical impact data issues" in "Potential Data Issues with Clinical Impact Details"
    When I enter "Details about alarms or warnings impact" in "Potential Impact on Alarms or Warnings Details"
    When I enter "Details about clinical communication impact" in "Potential Effect on Clinical Communication Details"
    When I click on "Submit"
    Then I see "Priority" as "High"

    

  @JIRA_PLACEHOLDER_2
  Scenario: Create 9 cases with different Patient Safety checkbox combinations and validate in Salesforce
    # Login to CE Portal (single login for all 9 cases)
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds

    # ==================== CASE 1: All 5 checkboxes checked ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case1 - All 5 checkboxes" in "Subject"
    When I enter "Testing all 5 patient safety checkboxes" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I enter "Test 1st checkbox" in "Actual Patient Harm/Injury Details"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I enter "Test 2nd checkbox" in "Increase Risk for Potential Patient Harm/Injury Details"
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I enter "Test 3rd checkbox" in "Potential Data Issues with Clinical Impact Details"
    When I check "Is there a Potential Impact on Alarms or Warnings?"
    When I enter "Test 4th checkbox" in "Potential Impact on Alarms or Warnings Details"
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I enter "Test 5th checkbox" in "Potential Effect on Clinical Communication Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case1"
    When I log captured "case1"

    # ==================== CASE 2: Checkbox 1 only ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case2 - Checkbox 1 only" in "Subject"
    When I enter "Testing checkbox 1 only" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I enter "Test 1st checkbox" in "Actual Patient Harm/Injury Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case2"
    When I log captured "case2"

    # ==================== CASE 3: Checkbox 2 only ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case3 - Checkbox 2 only" in "Subject"
    When I enter "Testing checkbox 2 only" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I enter "Test 2nd checkbox" in "Increase Risk for Potential Patient Harm/Injury Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case3"
    When I log captured "case3"

    # ==================== CASE 4: Checkbox 3 only ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case4 - Checkbox 3 only" in "Subject"
    When I enter "Testing checkbox 3 only" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I enter "Test 3rd checkbox" in "Potential Data Issues with Clinical Impact Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case4"
    When I log captured "case4"

    # ==================== CASE 5: Checkbox 4 only ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case5 - Checkbox 4 only" in "Subject"
    When I enter "Testing checkbox 4 only" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Is there a Potential Impact on Alarms or Warnings?"
    When I enter "Test 4th checkbox" in "Potential Impact on Alarms or Warnings Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case5"
    When I log captured "case5"

    # ==================== CASE 6: Checkbox 5 only ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case6 - Checkbox 5 only" in "Subject"
    When I enter "Testing checkbox 5 only" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I enter "Test 5th checkbox" in "Potential Effect on Clinical Communication Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case6"
    When I log captured "case6"

    # ==================== CASE 7: Checkboxes 1, 3 ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case7 - Checkboxes 1 and 3" in "Subject"
    When I enter "Testing checkboxes 1 and 3" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I enter "Test 1st checkbox" in "Actual Patient Harm/Injury Details"
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I enter "Test 3rd checkbox" in "Potential Data Issues with Clinical Impact Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case7"
    When I log captured "case7"

    # ==================== CASE 8: Checkboxes 2, 5 ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case8 - Checkboxes 2 and 5" in "Subject"
    When I enter "Testing checkboxes 2 and 5" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Is there Increase Risk for Potential Patient Harm/Injury?"
    When I enter "Test 2nd checkbox" in "Increase Risk for Potential Patient Harm/Injury Details"
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I enter "Test 5th checkbox" in "Potential Effect on Clinical Communication Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case8"
    When I log captured "case8"

    # ==================== CASE 9: Checkboxes 1, 3, 5 ====================
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Case9 - Checkboxes 1, 3 and 5" in "Subject"
    When I enter "Testing checkboxes 1, 3 and 5" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I wait for 2 seconds
    When I check "Is this a Patient Safety case?"
    When I check "Did Actual Patient Harm/Injury Occur?"
    When I enter "Test 1st checkbox" in "Actual Patient Harm/Injury Details"
    When I check "Are there Potential Data Issues with Clinical Impact?"
    When I enter "Test 3rd checkbox" in "Potential Data Issues with Clinical Impact Details"
    When I check "Could Clinical Communication Potentially Be Affected?"
    When I enter "Test 5th checkbox" in "Potential Effect on Clinical Communication Details"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "case9"
    When I log captured "case9"

    # ==================== SALESFORCE VALIDATION (single login) ====================
    When I navigate to Salesforce ""
    When I enter "" in "SFQA_UserName"
    When I enter "" in "SF_Password"
    When I click on "Log In to Sandbox"
    When I wait for 5 seconds
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds

    # Verify Case 1: All 5 checkboxes checked
    When I click on "Search..."
    When I click on "Search: All"
    When I enter captured "case1" in "Search..."
    When I click on captured "case1"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Status" as "New"
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "Test 1st checkbox"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "true"
    Then I see "Increase Risk for Patient Harm Details" as "Test 2nd checkbox"
    Then I see "Are Data Issues with Clinical Impact?" as "true"
    Then I see "Data Issues with Clinical Impact Details" as "Test 3rd checkbox"
    Then I see "Is there an Impact on Alarms/Warnings?" as "true"
    Then I see "Impact on Alarms or Warnings Details" as "Test 4th checkbox"
    Then I see "Could Clinical Comm be Affected?" as "true"
    Then I see "Potential Effect on Clinical Comm Detail" as "Test 5th checkbox"

    # Verify Case 2: Checkbox 1 only
    When I click on Salesforce search and clear
    When I enter captured "case2" in "Search..."
    When I click on captured "case2"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "Test 1st checkbox"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "false"

    # ==================== EDIT Case 2: Add checkboxes 2, 5 and set Issue ====================
    When I click on "Edit Is Increase Risk for Pat"
    When I wait for 2 seconds
    When I select "Data issue" from "Issue"

    When I check "Is Increase Risk for Pat Harm/Injury?"
    When I enter "checkbox 2 updated" in "Increase Risk for Patient Harm Details"
    
    When I check "Could Clinical Comm be Affected?"
    When I enter "checkbox 5 updated" in "Potential Effect on Clinical Comm Detail"
    When I click on "Save"
    When I wait for 5 seconds

    # Validate edited Case 2 Patient Safety fields
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "Test 1st checkbox"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "true"
    Then I see "Increase Risk for Patient Harm Details" as "checkbox 2 updated"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "true"
    Then I see "Potential Effect on Clinical Comm Detail" as "checkbox 5 updated"

    # Verify Case 3: Checkbox 2 only
    When I click on Salesforce search and clear
    When I enter captured "case3" in "Search..."
    When I click on captured "case3"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "false"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "true"
    Then I see "Increase Risk for Patient Harm Details" as "Test 2nd checkbox"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "false"

    # Verify Case 4: Checkbox 3 only
    When I click on Salesforce search and clear
    When I enter captured "case4" in "Search..."
    When I click on captured "case4"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "false"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
    Then I see "Are Data Issues with Clinical Impact?" as "true"
    Then I see "Data Issues with Clinical Impact Details" as "Test 3rd checkbox"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "false"

    # Verify Case 5: Checkbox 4 only
    When I click on Salesforce search and clear
    When I enter captured "case5" in "Search..."
    When I click on captured "case5"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "false"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "true"
    Then I see "Impact on Alarms or Warnings Details" as "Test 4th checkbox"
    Then I see "Could Clinical Comm be Affected?" as "false"

    # Verify Case 6: Checkbox 5 only
    When I click on Salesforce search and clear
    When I enter captured "case6" in "Search..."
    When I click on captured "case6"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "false"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "true"
    Then I see "Potential Effect on Clinical Comm Detail" as "Test 5th checkbox"

    # Verify Case 7: Checkboxes 1, 3
    When I click on Salesforce search and clear
    When I enter captured "case7" in "Search..."
    When I click on captured "case7"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "Test 1st checkbox"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
    Then I see "Are Data Issues with Clinical Impact?" as "true"
    Then I see "Data Issues with Clinical Impact Details" as "Test 3rd checkbox"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "false"

    # Verify Case 8: Checkboxes 2, 5
    When I click on Salesforce search and clear
    When I enter captured "case8" in "Search..."
    When I click on captured "case8"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "false"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "true"
    Then I see "Increase Risk for Patient Harm Details" as "Test 2nd checkbox"
    Then I see "Are Data Issues with Clinical Impact?" as "false"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "true"
    Then I see "Potential Effect on Clinical Comm Detail" as "Test 5th checkbox"

    # Verify Case 9: Checkboxes 1, 3, 5
    When I click on Salesforce search and clear
    When I enter captured "case9" in "Search..."
    When I click on captured "case9"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Did Actual Patient Harm/Injury Occur?" as "true"
    Then I see "Actual Patient Harm/Injury Details" as "Test 1st checkbox"
    Then I see "Is Increase Risk for Pat Harm/Injury?" as "false"
    Then I see "Are Data Issues with Clinical Impact?" as "true"
    Then I see "Data Issues with Clinical Impact Details" as "Test 3rd checkbox"
    Then I see "Is there an Impact on Alarms/Warnings?" as "false"
    Then I see "Could Clinical Comm be Affected?" as "true"
    Then I see "Potential Effect on Clinical Comm Detail" as "Test 5th checkbox"