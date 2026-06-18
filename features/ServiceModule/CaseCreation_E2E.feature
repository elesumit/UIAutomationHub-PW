@CaseCreation_E2E @Regression
Feature: Create Case in CE Portal and verify in Salesforce
  As a user
  I want to create a case in the CE Portal
  So that I can verify it in Salesforce

  @smoke @tc_id1
  Scenario Outline: Create Case and Validate in Salesforce - <scenario_name>
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds

    # Case Creation
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "<product>" from "Select a Product"
    When I select "<account>" from "Select an Account"
    When I select "<impact>" from "Impact"
    When I enter "<subject>" in "Subject"
    When I enter "<description>" in "Description"
    When I select "<contact_method>" from "How would you like to be contacted"
    When I enter "<case_collaborator>" in "Case Collaborators"
    When I click on "<case_collaborator>"
    When I enter "<phi_details>" in the "Protected Health Information Details" textarea
    When I upload "<file_upload>" to "Upload Files"
    When I wait for 2 seconds
    When I click on "Done"
    When I wait for 2 seconds
    When I click on "Submit"
    When I wait for 4 seconds
    When I capture text from "Case Number" and store as "caseId"
    When I log captured "caseId"
    Then I see "Priority" as "<expected_priority>"

    # Salesforce Verification
    When I navigate to Salesforce ""
    When I enter "" in "SFQA_UserName"
    When I enter "" in "SF_Password"
    When I click on "Log In to Sandbox"
    When I wait for 5 seconds
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds

    When I click on "Search..."
    When I click on "Search: All"
    When I select "Cases" from "Search by object type"
    When I enter captured "caseId" in "Search..."
    When I click on captured "caseId"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Status" as "<expected_status>"
    When I wait for 2 seconds

    # Update Case Status
    When I click on "Edit Status"
    When I wait for 2 seconds
    When I select "<update_status>" from "Status"
    When I wait for 2 seconds
    When I select "<issue>" from "Issue"
    When I wait for 2 seconds
    When I select "<sub_issue>" from "Sub Issue"
    When I wait for 2 seconds
    When I enter "<close_comment>" in "Close Case Comment"
    When I wait for 2 seconds
    When I select "<close_code>" from "Close Code"
    When I wait for 2 seconds
    When I select "<close_sub_code>" from "Close Sub Code"
    When I wait for 2 seconds
    When I click on "Save"
    When I wait for 2 seconds
    Then I see "Status" as "<expected_final_status>"

    Examples: excel:testdata/ServiceModule_QA_TestData.xlsx!case_creation_e2e
