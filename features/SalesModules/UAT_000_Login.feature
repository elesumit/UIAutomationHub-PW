@UAT.000 @smoke @regression
Feature: UAT.000.01 - Login and App Verification
  As a Veradigm user
  I want to log into the Salesforce Sales Console
  So that I can access all required modules

  # Done
  @TC.0001
  Scenario: Successful login and default app is Sales Console

    # Salesforce Verification - Login once and verify case
    When I navigate to Salesforce ""
 
    When I click on "App Launcher"
    When I enter "Sales Console" in "Search apps and items..."
    When I click on "Sales Console"
    When I wait for 3 seconds

    When I click on "Show Navigation Menu"
    Then I should see "Leads"
    Then I should see "Accounts"
    Then I should see "Contacts"
    Then I should see "Opportunities"


  #User can switch apps via the waffle menu
    When I click on "App Launcher"
    When I enter "Service Console" in "Search apps and items..."
    When I click on "Service Console"
    When I wait for 3 seconds
    When I click on "Show Navigation Menu"
    Then I should see "Cases"
    Then I should see "Contacts"
    Then I should see "Accounts"
    Then I should see "Knowledge"
    
    
    

