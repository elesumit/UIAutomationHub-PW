@error-validation @regression
Feature: Validate error banner for missing required fields in CE Portal case creation
  As a user
  I want to see an error banner when mandatory fields are missing
  So that I can identify and fill the required fields to create a case

  Background: Login and navigate to case creation form
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"

  @BTC-101
  Scenario: Submit case without selecting a product
    When I select "Test Account" from "Select an Account"
    When I select "High" from "Impact"
    When I enter "Test Subject" in "Subject"
    When I enter "This is a test description" in "Description"
    When I click on "Submit"
    Then I should see "Missing Required Fields"
    Then I see "Select a Product" as "required"

  @BTC-102
  Scenario: Submit case without selecting an account
    When I select "Test Product" from "Select a Product"
    When I select "High" from "Impact"
    When I enter "Test Subject" in "Subject"
    When I enter "This is a test description" in "Description"
    When I click on "Submit"
    Then I should see "Missing Required Fields"
    Then I see "Select an Account" as "required"

  @BTC-103
  Scenario: Submit case without selecting impact level
    When I select "Test Product" from "Select a Product"
    When I select "Test Account" from "Select an Account"
    When I enter "Test Subject" in "Subject"
    When I enter "This is a test description" in "Description"
    When I click on "Submit"
    Then I should see "Missing Required Fields"
    Then I see "Impact" as "required"

  @BTC-104
  Scenario: Submit case without entering a description
    When I select "Test Product" from "Select a Product"
    When I select "Test Account" from "Select an Account"
    When I select "High" from "Impact"
    When I enter "Test Subject" in "Subject"
    When I click on "Submit"
    Then I should see "Missing Required Fields"
    Then I see "Description" as "required"

  @BTC-105
  Scenario: Submit case without filling multiple mandatory fields
    When I select "Test Product" from "Select a Product"
    When I click on "Submit"
    Then I should see "Missing Required Fields"
    Then I see "Select an Account" as "required"
    Then I see "Impact" as "required"
    Then I see "Subject" as "required"
    Then I see "Description" as "required"