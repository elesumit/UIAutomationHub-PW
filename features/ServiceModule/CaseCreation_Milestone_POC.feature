@CaseCreation_Milestone1
Feature: Create Case in CE Portal and verify in Salesforce
  As a user
  I want to create a case in the CE Portal
  So that I can verify it in Salesforce

  @POC
  Scenario: Create Multiple Cases and Validate Milestones in Salesforce
    # Login to CE Portal once
    # Given I navigate to CE Portal ""
    # When I click on "Log in"
    # When I wait for 3 seconds
    # When I enter "" in "CE_UserName"
    # When I click on "Continue"
    # When I enter "" in "CE_Password"
    # When I click on "Continue"
    # When I wait for 3 seconds

    # # Case 1: Complete loss of service (Critical priority)
    # When I click on "Support"
    # When I wait for 3 seconds
    # When I enter "Portal" in "Search for help"
    # When I wait for 3 seconds
    # When I click on "Create a Case"
    # When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    # When I select "Sumit Gupta Pediatrics" from "Select an Account"
    # When I select "Complete loss of service" from "Impact"
    # When I enter "Test - Complete service outage" in "Subject"
    # When I enter "Complete loss of service issue" in "Description"
    # When I select "Phone" from "How would you like to be contacted"
    # When I enter "Sejal Nagpal" in "Case Collaborators"
    # When I click on "Sejal Nagpal"
    # When I enter "Test - Complete service outage" in the "Protected Health Information Details" textarea
    # When I upload "FileUpload_1.PNG" to "Upload Files"
    # When I wait for 2 seconds
    # When I click on "Done"
    # When I wait for 2 seconds
    # When I click on "Submit"
    # When I wait for 4 seconds
    # When I capture text from "Case Number" and store as "caseId1"
    # When I log captured "caseId1"
    # Then I see "Priority" as "Critical"

    # # Case 2: Partial loss of service (High priority)
    # When I click on "Support"
    # When I wait for 3 seconds
    # When I enter "Portal" in "Search for help"
    # When I wait for 3 seconds
    # When I click on "Create a Case"
    # When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    # When I select "Sumit Gupta Pediatrics" from "Select an Account"
    # When I select "Partial loss of service" from "Impact"
    # When I enter "Test - Partial degradation" in "Subject"
    # When I enter "Partial loss of service issue" in "Description"
    # When I select "Customer Experience Portal" from "How would you like to be contacted"
    # When I enter "Sejal Nagpal" in "Case Collaborators"
    # When I click on "Sejal Nagpal"
    # When I enter "Test - Partial degradation" in the "Protected Health Information Details" textarea
    # When I upload "FileUpload_1.PNG" to "Upload Files"
    # When I wait for 2 seconds
    # When I click on "Done"
    # When I wait for 2 seconds
    # When I click on "Submit"
    # When I wait for 4 seconds
    # When I capture text from "Case Number" and store as "caseId2"
    # When I log captured "caseId2"
    # Then I see "Priority" as "High"

    # Salesforce Verification - Login once and verify all cases
    When I navigate to Salesforce ""
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds

    # Verify Case 1 (Critical - Response: 30 min, Resolution: 120 min)
#     When I click on "Search..."
#     When I click on "Search: All"
#     When I select "Cases" from "Search by object type"

#      When I enter "00205385" in "Search..."
#      When I click on "00205385"



#   #  When I enter captured "caseId1" in "Search..."
#   #  When I click on captured "caseId1"

#     When I click on "Share"
# When I enter "Hello Test" in "Share an update..."
#     When I click on "Share"
    # When I click on the "Details" tab
    # When I wait for 3 seconds
    # When I click on "Edit Status"

    #  When I wait for 2 seconds
    # When I select "High" from "Priority"
    # When I wait for 2 seconds
    # When I select "Billing & Payment Issue" from "Issue"

    #  When I click on "Save"
    # When I wait for 2 seconds

    # When I wait for 15 seconds
    # When I click milestone Show More
    # When I wait for 2 seconds
    # Then I see milestone "First Response to Customer" with response time within "1440" minutes
    # Then I see milestone "Case Resolution Milestone" with response time within "9000" minutes

    # # Verify Case 2 (High - Response: 1440 min, Resolution: TBD)
    # When I click on "Search..."
    # When I click on "Search: All"
    # When I select "Cases" from "Search by object type"
    # When I enter captured "caseId2" in "Search..."
    # When I click on captured "caseId2"
    # When I wait for 15 seconds
    # When I click milestone Show More
    # When I wait for 2 seconds
    # Then I see milestone "First Response to Customer" with response time within "1440" minutes