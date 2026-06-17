@setup @data-setup
Feature: Test Data Setup — Create Test Accounts in QA Sandbox
  As a QA automation engineer
  I want to create test accounts in the QA sandbox
  So that all UAT feature files have the required account data to run against



  @TC.SETUP.Account2
  Scenario Outline: Create all required test accounts
    When I navigate to Salesforce ""
    When I enter "" in "SFQA_UserName"
    When I enter "" in "SF_Password"
    When I click on "Log In to Sandbox"
    When I wait for 5 seconds
    When I click on "App Launcher"
    When I enter "<app_name>" in "Search apps and items..."
    When I click on "<app_name>"
    When I wait for 3 seconds

    When I click on "Show Navigation Menu"

    When I click on "<app_items>"
    When I wait for 2 seconds

    When I click on "New"
    #When I Click on "Prospect"
    When I click on "Next"


    #Enter account details
    When I wait for 2 seconds
    When I enter "<account_name>" in "Account Name"
    When I select "<status>" from "Status"
    When I select "<sub_status>" from "Sub Status"
    When I enter "<phone>" in "Phone"
    When I select "<type>" from "Type"
    When I select "<legal_entity>" from "Legal Entity"

    When I enter "<billing_street>" in "Billing Street"
    When I enter "<billing_city>" in "Billing City"
    When I enter "<billing_state>" in "Billing State/Province"
    When I enter "<billing_zip>" in "Billing Zip/Postal Code"
    When I click on "Save"
    When I wait for 10 seconds
    Then I see "Account" as "<account_name>"

    #clean up accounts after creation
    When I click on "Delete"
    When I click on "Delete"

    Examples:
      | app_name      | app_items | account_name                       | status | sub_status | type     | legal_entity | phone        | billing_street | billing_city | billing_state | billing_zip |
      | Sales Console | Accounts  | Automation Test Account - Prospect | Active | None       | Practice | Veradigm LLC | 312-555-0100 | 123 Main St    | Chicago      | IL            | 60601       |



