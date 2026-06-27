@CaseCreation12
Feature: Create Case in CE Portal and verify in Salesforce
  As a user
  I want to create a case in the CE Portal So that I can verify it in Salesforce

  @BTC-81
  Scenario: Create Case and Validate in Salesforce

 #Login to SF and verify the case
    #  When I navigate to Salesforce ""
    # #When I close the permission popup
    # #Search for Console
    # When I click on "App Launcher"
    # When I enter "Sales Console" in "Search apps and items..."
    # When I click on "Sales Console"
    # When I wait for 5 seconds

    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    # When I click on "Continue"
    # When I wait for 3 seconds
    # When I click on "Support"
    # When I wait for 5 seconds
    # When I enter "Portal" in "Search for help"
    # When I wait for 3 seconds
    # When I click on "Create a Case"
    # When I select "Veradigm Fiscal Management and Supply Chain Solutions" from "Select a Product"
    # When I select "Sumit Gupta Pediatrics" from "Select an Account"
    # When I select "Partial loss of service" from "Impact"
    # When I enter "Portal access is not working" in "Subject"
    # When I enter "Not able to access Portal" in "Description"
    # When I select "Phone" from "How would you like to be contacted"
    # When I enter "Case creation testing" in the "Protected Health Information Details" textarea
    # When I upload "FileUpload_1.PNG" to "Upload Files"
    # When I wait for 2 seconds
    # When I click on "Done"
    # When I wait for 2 seconds
    # When I click on "Submit"
    # When I wait for 10 seconds
    # # Then I see "Status" as "New"
    # #capture the case details
    # When I capture text from "Case Number" and store as "caseId"
    # When I log captured "caseId"

    # #Login to SF and verify the case
    #  When I navigate to Salesforce ""
    # When I enter "" in "SFQA_UserName"
    # When I enter "" in "SF_Password"
    # When I click on "Log In to Sandbox"
    # When I wait for 5 seconds
    # #When I close the permission popup
    # #Search for Console
    # When I click on "App Launcher"
    # When I enter "Service Console" in "Search apps and items..."
    # When I click on "Service Console"
    # When I wait for 5 seconds
    #  When I click on "Search..."
    # When I click on "Search: All"
    #  When I select "Cases" from "Search by object type"
    #  When I enter captured "caseId" in "Search..."
    #  When I click on captured "caseId"
    #  When I wait for 5 seconds
    #  When I click on the "Details" tab
    #  When I wait for 3 seconds
    #  #validate the case details
    # Then I see "Status" as "New"


