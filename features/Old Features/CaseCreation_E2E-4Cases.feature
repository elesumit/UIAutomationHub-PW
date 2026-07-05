@CaseCreation_E2E-4Cases
Feature: Create Multiple Cases and Verify in Salesforce
  As a user
  I want to login once and create multiple cases with different products
  So that I can verify all cases in Salesforce efficiently

  @XSP-82
  Scenario: Login once and create multiple cases
    # CE Portal Login (once)
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds

    # Case 1: Fiscal Management - Complete loss of service (with file upload)
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "Login" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I select "Sumit Gupta Pediatrics" from "Select an Account"
    When I select "Complete loss of service" from "Impact"
    When I enter "Not able to login" in "Subject"
    When I enter "User is not able to login" in "Description"
    When I select "Customer Experience Portal" from "How would you like to be contacted"
    When I enter "Sejal Nagpal" in "Case Collaborators"
    When I click on "Sejal Nagpal"
    When I enter "Details: User is not able to login" in the "Protected Health Information Details" textarea
    When I upload "FileUpload_1.PNG" to "Upload Files"
    When I wait for 2 seconds
    When I click on "Done"
    When I wait for 2 seconds
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId1"
    When I log captured "caseId1"
    Then I see "Priority" as "Critical"


    # Case 2: Practice Management - Partial loss of service (with file upload)
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    When I wait for 3 seconds
    #When I select "EPCS" from "Select an Area"
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Report not working" in "Subject"
    When I enter "Not able to see the reports" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I enter "Details: Not able to see the reports" in the "Protected Health Information Details" textarea
    When I upload "FileUpload_1.PNG" to "Upload Files"
    When I wait for 2 seconds
    When I click on "Done"
    When I wait for 2 seconds
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId2"
    When I log captured "caseId2"
    Then I see "Priority" as "High"

    # Case 3: Academy - User training
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "Training" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Veradigm Academy" from "Select a Product"
    When I enter "User training" in "Subject"
    When I enter "How to create a case in portal" in "Description"
    When I select "Customer Experience Portal" from "How would you like to be contacted"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId3"
    When I log captured "caseId3"
    Then I see "Priority" as "Medium"

    # Case 4: Product Not Listed - Normal performance with minor issue
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "Product" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Product Not Listed" from "Select a Product"
    When I select "Sumit Gupta Pediatrics" from "Select an Account"
    When I select "Normal performance with minor issue" from "Impact"
    When I enter "List the product" in "Subject"
    When I enter "Not able to find my product" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I enter "Details: Not able to find my product" in the "Protected Health Information Details" textarea
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId4"
    When I log captured "caseId4"
    Then I see "Priority" as "Low"

    # Salesforce Verification - Login once and verify all cases
    When I navigate to Salesforce ""
    When I wait for 2 seconds
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 5 seconds

    # Verify Case 1
    When I click on "Search..."
    When I click on "Search: All"
    When I select "Cases" from "Search by object type"
    When I enter captured "caseId1" in "Search..."
    When I click on captured "caseId1"
    When I wait for 5 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Status" as "New"
    When I wait for 2 seconds

    # Verify Case 2
    When I click on "Search Cases"
    When I click on "Clear"
    When I enter captured "caseId2" in "Search..."
    When I click on captured "caseId2"
    When I wait for 5 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Status" as "New"
    When I wait for 2 seconds

    # Verify Case 3
    When I click on "Search Cases"
    When I click on "Clear"
    When I enter captured "caseId3" in "Search..."
    When I click on captured "caseId3"
    When I wait for 5 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Status" as "New"
    When I wait for 2 seconds

    # Verify Case 4
    When I click on "Search Cases"
    When I click on "Clear"
    When I enter captured "caseId4" in "Search..."
    When I click on captured "caseId4"
    When I wait for 5 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Status" as "New"
