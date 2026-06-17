@UAT.025 @functional @account
Feature: UAT.025 - Account Support Holds
  As a Sales user
  I want to see support hold warnings on accounts and related records
  So that I am aware of accounts on hold before creating cases or opportunities

  Background:
    Given the user is logged into Salesforce
    And the user has access to Account records

  @TC.0084
  Scenario: No banner displays on an account without Support Hold
    Given the user navigates to an existing Customer Account
    When the Support Hold checkbox is unchecked on the account
    Then no support hold banner or message should appear on the Account page

  @TC.0085
  Scenario: Support hold banner displays after enabling Support Hold
    Given the user has a Customer Account open
    When the user checks the "Support Hold" checkbox on the account
    And the user clicks "Save"
    Then the account page should display the message
      """
      PLEASE NOTE: This account is on Support Hold
      """

  @TC.0086
  Scenario: Support hold message appears when creating a case on a held account
    Given the user navigates to an Account that has "Support Hold" enabled
    When the user creates a new case of any type on the account
    And the user saves the case
    Then the case should be saved successfully
    And the support hold message should be visible on the case record
