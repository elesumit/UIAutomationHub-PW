@ErrorValidation @MandatoryFields
Feature: Display error banner for missing mandatory fields on case creation

  Background: Login to CE Portal
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds
    When I click on "Support"
    When I wait for 3 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"

  @JIRA_PLACEHOLDER_1
  Scenario: Submit case without selecting a product
    When I select "Test Account" from "Select an Account"
    When I select "High" from "Impact"
    When I enter "Login issue" in "Subject"
    When I enter "User cannot log in" in "Description"
    When I click on "Submit"
    Then I should see error banner with text "The following field is required: Product"

  @JIRA_PLACEHOLDER_2
  Scenario: Submit case without selecting an account
    When I select "Test Product" from "Select a Product"
    When I select "High" from "Impact"
    When I enter "Login issue" in "Subject"
    When I enter "User cannot log in" in "Description"
    When I click on "Submit"
    Then I should see error banner with text "The following field is required: Account"
