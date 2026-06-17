@UAT.007 @UAT.008 @UAT.009 @UAT.010 @functional @payerpath @opportunity
Feature: UAT.007-010 - Payerpath Opportunity Management
  As a Payerpath BU Sales Rep or Manager
  I want to progress Provider and Payer Opportunities to Closed Won or Closed Lost
  So that the sales process is tracked and QA review cases are generated correctly

  Background:
    Given the user is logged into Salesforce as a Payerpath BU Sales Rep
    And an active Payerpath Opportunity exists

  # ──────────────────────────────────────────────
  # UAT.007 — Provider Opp Closed Lost
  # ──────────────────────────────────────────────

  @TC.0025 @UAT.007
  Scenario: Work a Provider Opportunity to Closed Lost
    Given the user has an open Payerpath Provider Opportunity
    When the user changes the Stage to "Closed Lost"
    And the user fills in any required fields triggered by validation rules
    And the user clicks "Save"
    Then the Opportunity should be updated to "Closed Lost"

  # ──────────────────────────────────────────────
  # UAT.008 — Payerpath Provider Opp Closed Won
  # ──────────────────────────────────────────────

  @TC.0026 @UAT.008
  Scenario: Work a Payerpath Provider Opportunity with required fields
    Given the user has an open Payerpath Provider Opportunity
    When the user fills in all required fields on the Account and Opportunity
    And the user clicks "Save"
    Then the Opportunity should be updated successfully

  @TC.0028 @UAT.008
  Scenario: Move a Payerpath Provider Opportunity to Sales Won
    Given the user has a Payerpath Provider Opportunity with a Primary Quote approved
    When the user sets the Stage to "Sales Won"
    And the user sets the Sub-Stage to "In QA Queue"
    And the user clicks "Save"
    Then the Opportunity Stage should be "Sales Won"
    And a QA Review Case should be created on the Opportunity

  @TC.0029 @UAT.008
  Scenario: QA Case is created when Opportunity moves to Sales Won
    Given a Payerpath Provider Opportunity has been set to Sales Won with Sub-Stage "In QA Queue"
    Then a QA Review Case should be visible on the Opportunity record page
    And the Case should appear in the "Cases - Signed Contract List View"

  @TC.0031 @UAT.008
  Scenario: Update Sales QA Entered Date on Opportunity from QA Case
    Given the user navigates to the QA Case on the Opportunity
    And the user navigates from the QA Case to the Opportunity
    When the user sets the Sub-Stage to "In QA Queue"
    And the user sets the Sales QA Entered Date to today's date
    And the user clicks "Save"
    Then the Opportunity Sub-Stage should be updated
    And the Sales QA Entered Date should reflect today's date

  @TC.0032 @UAT.008
  Scenario: Close Won a Payerpath Provider Opportunity
    Given the user has a Payerpath Provider Opportunity in Sales Won stage
    When the user clicks the "Closed" stage on the Opportunity Path
    And the user clicks "Select Closed Stage"
    And the user selects Stage "Closed Won"
    And the user clicks "Save"
    Then the Opportunity Stage should be "Closed Won"
    And an Order should be created on the Opportunity

  # ──────────────────────────────────────────────
  # UAT.009 — Payerpath Payer Opp Closed Lost
  # ──────────────────────────────────────────────

  @TC.0033 @UAT.009
  Scenario: Work a Payerpath Payer Opportunity to Closed Lost
    Given the user has an open Payerpath Payer Opportunity
    When the user changes the Stage to "Closed Lost"
    And the user fills in any required fields prompted by validation rules
    And the user clicks "Save"
    Then the Opportunity should be updated to "Closed Lost"

  # ──────────────────────────────────────────────
  # UAT.010 — Payerpath Payer Opp Closed Won
  # ──────────────────────────────────────────────

  @TC.0034 @UAT.010
  Scenario: Work a Payerpath Payer Opportunity with required fields
    Given the user has an open Payerpath Payer Opportunity
    When the user fills in all required fields
      | Field               | Value          |
      | Type                | New Business   |
      | Close Date          | <future_date>  |
      | Forecast Category   | Commit         |
      | SOW Sent Date       | <today_date>   |
      | Sales Commit Period | Q1             |
      | Next Step           | Contract Review|
      | Primary Win Reason  | Functionality  |
    And the user clicks "Save"
    Then the Opportunity should be updated successfully

  @TC.0036 @UAT.010
  Scenario: Move a Payerpath Payer Opportunity to Sales Won
    Given the user has a Payerpath Payer Opportunity with a Primary Quote approved
    When the user sets the Stage to "Sales Won"
    And the user sets the Sub-Stage to "In QA Queue"
    And the user clicks "Save"
    Then the Opportunity Stage should be "Sales Won"
    And a QA Review Case should be created on the Opportunity

  @TC.0040 @UAT.010
  Scenario: Close Won a Payerpath Payer Opportunity
    Given the user has a Payerpath Payer Opportunity in Sales Won stage
    When the user clicks the "Closed" stage on the Opportunity Path
    And the user selects Stage "Closed Won"
    And the user clicks "Save"
    Then the Opportunity Stage should be "Closed Won"
    And an Order should be visible in the Related List Quick Links on the Opportunity
