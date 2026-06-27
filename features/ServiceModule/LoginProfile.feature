@Login @Regression
Feature: Login into SF and switch the profiles between Sales and Service

  

  @loginProfile
  Scenario: Login and Switch Profiles in Salesforce
  
    # Salesforce Verification
    When I navigate to Salesforce ""
    # When I enter "" in "SFQA_UserName"
    # When I enter "" in "SF_Password"
    # When I click on "Log In to Sandbox"
    # When I wait for 5 seconds
    #When I click on "setupGear"
    When I click on "Setup"
    When I click on "Setup"

    When I enter "Support Agent Test 1" in "Search Setup"
    When I click on "Support Agent Test 1"
    When I wait for 3 seconds
    When I click on "Login"
    When I wait for 3 seconds
    
    Then I should see "Logged in as Support Agent Test 1"
    
    # When I enter "Service Console" in "Search apps and items..."
    # When I click on "Service Console"
    # When I wait for 3 seconds

    # When I click on "Search..."
    # When I click on "Search: All"
    # When I select "Cases" from "Search by object type"
    # When I enter captured "caseId" in "Search..."
    # When I click on captured "caseId"
    # When I wait for 3 seconds
    # When I click on the "Details" tab
    # When I wait for 3 seconds
    # Then I see "Status" as "<expected_status>"
    # When I wait for 2 seconds

  

   # Examples: excel:testdata/ServiceModule_QA_TestData.xlsx!case_creation_e2e
