@UAT.012 @functional @account
Feature: UAT.012 - Account Types
  As a Sales user
  I want to verify the correct Account Type is assigned to an Account
  So that the account is categorised correctly for the business unit

  Background:
    Given the user is logged into Salesforce
    And the user has navigated to an Account they have created or own

  @TC.0042
  Scenario Outline: Correct Account Type is assigned based on business context
    Given the user navigates to the Account record
    When the user scrolls down to the "Account Type Details" section
    Then the Account Type should be "<expected_type>"

    Examples:
      | expected_type                  |
      | Diagnostic Center              |
      | Health Information Exchange    |
      | Health System                  |
      | Hospital                       |
      | Life Sciences                  |
      | MSO                            |
      | Payer                          |
      | Practice                       |
      | Solution Platform              |

  @TC.0042
  Scenario: Account Type Details section is visible on the Account record
    Given the user navigates to an Account record
    When the user scrolls to the "Account Type Details" section
    Then the Account Type field should be present and populated
