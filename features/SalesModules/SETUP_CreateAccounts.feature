@setup @data-setup
Feature: Test Data Setup — Create Test Accounts in QA Sandbox
  As a QA automation engineer
  I want to create test accounts in the QA sandbox
  So that all UAT feature files have the required account data to run against



  @TC.SETUP.Account
  Scenario: Create all required test accounts
    When I navigate to Salesforce ""
    When I enter "" in "SFQA_UserName"
    When I enter "" in "SF_Password"
    When I click on "Log In to Sandbox"
    When I wait for 5 seconds
    When I click on "App Launcher"
    When I enter "Sales Console" in "Search apps and items..."
    When I click on "Sales Console"
    When I wait for 3 seconds

    When I click on "Show Navigation Menu"

    When I click on "Accounts"
    When I wait for 2 seconds

    When I click on "New"
    #When I Click on "Prospect"
    When I click on "Next"
   

    #Enter account details
    When I wait for 2 seconds
    When I enter "Automation Test Account - Prospect" in "Account Name"
    When I select "Active" from "Status"
    When I select "None" from "Sub Status"
    When I enter "312-555-0100" in "Phone"
    When I select "Practice" from "Type"
    When I select "Veradigm LLC" from "Legal Entity"

    When I enter "123 Main St" in "Billing Street"
    When I enter "Chicago" in "Billing City"
    When I enter "IL" in "Billing State/Province"
    When I enter "60601" in "Billing Zip/Postal Code"
    When I click on "Save"
    When I wait for 5 seconds
    Then I see "Account" as "Automation Test Account - Prospect"

    #clean up accounts after creation
    When I click on "Delete"
    When I click on "Delete"

  # Examples:
  #   | account_name                          | record_type | phone        |
  #   | Automation Test Account - Prospect    | Prospect    | 312-555-0100 |
  #   | Automation Test Account - Customer    | Customer    | 312-555-0200 |
  #   | Automation Test Account - Payerpath   | Prospect    | 312-555-0300 |
  #   | Automation Test Account - ERP         | Prospect    | 312-555-0400 |
  #   | Automation Test Account - Provider    | Prospect    | 312-555-0500 |

  
