@CaseCreation_Case_Assignment_Rules @Regression
Feature: Create Case in CE Portal and verify the Queue in Salesforce
  As a user
  I want to create a case in the CE Portal
  So that I can verify it in Salesforce

  @OSF-534 @smoke @BTC-370
  Scenario Outline: Create Case and Validate <expected_queue> queue in Salesforce
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
 
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds

    # Verify Queue
    When I click on "Search..."
    When I click on "Search: All"
    When I select "Cases" from "Search by object type"
    When I enter captured "caseId" in "Search..."
    When I click on captured "caseId"
    When I wait for 3 seconds
    When I click on the "Details" tab
    When I wait for 3 seconds
    Then I see "Case Queue Name" as "<expected_queue>"
    Then I see "Case Owner" as "<expected_owner>"

    # Create Task and Validate
    When I click on the "Feed" tab
    When I click on the "New Task" tab
    When I wait for 3 seconds
    When I select "<task_subject>" from "Subject"
    When I clear the "Assigned To" lookup field
    When I open the object picker for "Assigned To"
    When I click on "Queues"
    When I enter "<task_queue_search>" in "Search Queues..."
    When I wait for 2 seconds
    When I click on "<task_queue_search>"
    When I wait for 2 seconds
    When I click on "<task_queue_select>"
    When I click on "Save"
    When I wait for 2 seconds
    Then I should see "Related To: $caseId"
    Then I should see "Subject: <task_subject>"

    Examples: excel:testdata/ServiceModule_QA_TestData.xlsx!case_assignment_rules
