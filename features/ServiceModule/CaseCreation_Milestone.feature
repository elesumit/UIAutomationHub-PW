@CaseCreation_Milestone @Regression
Feature: Create Case in CE Portal and verify in Salesforce
  As a user
  I want to create cases with different priorities
  So that I can verify milestone timings in Salesforce

  # ──────────────────────────────────────────────────────────────────────────
  # Outline 1: Cases with milestone timings (Critical / High / Medium)
  # ──────────────────────────────────────────────────────────────────────────
  @smoke @CaseCreation_Milestone1
  Scenario Outline: Create Case and Verify Milestone Timings - <scenario_name>
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
    When I enter "<search_keyword>" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "<product>" from "Select a Product"
    When I select "<account>" from "Select an Account"
    When I select "<impact>" from "Impact"
    When I enter "<subject>" in "Subject"
    When I enter "<description>" in "Description"
    When I select "<contact_method>" from "How would you like to be contacted"
    
    # When I enter "Sejal Nagpal" in "Case Collaborators"
    # When I click on "Sejal Nagpal"
    # When I enter "Details: User is not able to login" in the "Protected Health Information Details" textarea

    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId"
    When I log captured "caseId"
    Then I see "Priority" as "<expected_priority>"


    # Salesforce Login
    When I navigate to Salesforce ""
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds

    # Navigate to Case
    When I click on "Search..."
    When I click on "Search: All"
    When I select "Cases" from "Search by object type"
    When I enter captured "caseId" in "Search..."
    When I click on captured "caseId"
    When I wait for 15 seconds

    # Verify Milestones
    When I click milestone Show More
    When I wait for 2 seconds
    Then I see milestone "First Response to Customer" with response time within "<first_response_minutes>" minutes
    Then I see milestone "Case Resolution Milestone" with response time within "<resolution_minutes>" minutes

    # Verify Notification
    When I click on "Notifications"
    When I wait for 3 seconds
    Then I should see "Case Number: $caseId"
    Then I should see "Case Priority: <notification_priority>"
    Then I should see "Account Name: <account_name>"

    Examples: excel:testdata/ServiceModule_QA_TestData.xlsx!case_milestone


  # ──────────────────────────────────────────────────────────────────────────
  # Outline 2: Low priority case — no milestones expected
  # ──────────────────────────────────────────────────────────────────────────
  @smoke @CaseCreation_Milestone2
  Scenario Outline: Create Low Priority Case and Verify No Milestones - <scenario_name>
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
    When I wait for 5 seconds
    When I enter "<search_keyword>" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "<product>" from "Select a Product"
    When I select "<account>" from "Select an Account"
    When I select "<impact>" from "Impact"
    When I enter "<subject>" in "Subject"
    When I enter "<description>" in "Description"
    When I select "<contact_method>" from "How would you like to be contacted"
    When I enter "<phi_details>" in the "Protected Health Information Details" textarea
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId"
    When I log captured "caseId"
    Then I see "Priority" as "<expected_priority>"

    # Salesforce Login
    When I navigate to Salesforce ""
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds

    # Navigate to Case and Verify No Milestones
    When I click on "Search..."
    When I click on "Search: All"
    When I select "Cases" from "Search by object type"
    When I enter captured "caseId" in "Search..."
    When I click on captured "caseId"
    When I wait for 15 seconds
    Then I should see "No milestones to show."

    Examples: excel:testdata/ServiceModule_QA_TestData.xlsx!case_milestone_low
