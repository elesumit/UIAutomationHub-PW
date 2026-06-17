@UAT.028 @UAT.029 @functional @provider @opportunity
Feature: UAT.028 & UAT.029 - Provider Opportunity Management
  As a Provider BU Sales Rep or Manager
  I want to progress Provider Opportunities to Closed Won or Closed Lost
  So that the sales cycle is completed correctly with QA validation

  Background:
    Given the user is logged into Salesforce as a Provider BU Sales Rep
    And an active Provider Opportunity exists

  # ──────────────────────────────────────────────
  # UAT.028 — Provider Opp Closed Won
  # ──────────────────────────────────────────────

  @TC.0093 @UAT.028
  Scenario: Work a Provider Opportunity with all required fields
    Given the user has an open Provider Opportunity
    When the user fills in the following required fields
      | Field               | Value           |
      | Type                | New Business    |
      | Close Date          | <future_date>   |
      | Forecast Category   | Commit          |
      | SOW Sent Date       | <today_date>    |
      | Sales Commit Period | Q2              |
      | Next Step           | Contract Review |
      | Primary Win Reason  | Relationship    |
    And the user changes the Stage to "Closed Won"
    And the user clicks "Save"
    Then the Opportunity should save successfully with all mandatory fields completed

  @TC.0093 @UAT.028
  Scenario: Provider Opportunity save fails when required fields are missing
    Given the user has an open Provider Opportunity
    When the user attempts to save the Opportunity with one or more required fields missing
    Then the system should display a validation error listing the missing fields
    And the Opportunity should not be saved

  @TC.0095 @UAT.028
  Scenario: Move Provider Opportunity to Sales Won with Sub-Stage In QA Queue
    Given the user has a Provider Opportunity ready to close
    When the user sets the Stage to "Sales Won"
    And the user sets the Sub-Stage to "In QA Queue"
    And the user clicks "Save"
    Then the Opportunity Stage should be "Sales Won"
    And the Sub-Stage should be "In QA Queue"
    And a QA Review Case should be created on the Opportunity

  @TC.0095 @UAT.028
  Scenario: Sales Won fails when mandatory fields are missing
    Given the user has a Provider Opportunity
    When the user sets the Stage to "Sales Won" without completing required fields
    And the user clicks "Save"
    Then the system should prevent the update and display a validation error

  @TC.0096 @UAT.028
  Scenario: QA Case is created and visible on Opportunity after Sales Won
    Given a Provider Opportunity has been set to Sales Won with Sub-Stage "In QA Queue"
    Then the Opportunity record page should display the QA Review Case
    And the Case should appear in the "Cases - Signed Contract List View"

  @TC.0098 @UAT.028
  Scenario: Update Sales QA Entered Date on Provider Opportunity
    Given the user navigates from the QA Case to the Provider Opportunity
    When the user sets the Sub-Stage to "In QA Queue"
    And the user sets the Sales QA Entered Date to today's date
    And the user clicks "Save"
    Then the Opportunity Sub-Stage should be updated
    And the Sales QA Entered Date should reflect today's date

  @TC.0099 @UAT.028
  Scenario: Close Won a Provider Opportunity and verify Order
    Given the user has a Provider Opportunity in Sales Won stage
    When the user clicks the "Closed" stage on the Opportunity Path
    And the user selects Stage "Closed Won"
    And the user clicks "Save"
    Then the Opportunity Stage should be "Closed Won"
    And an Order should be visible in the Related List Quick Links section

  # ──────────────────────────────────────────────
  # UAT.029 — Provider Opp Closed Lost
  # ──────────────────────────────────────────────

  @TC.0100 @UAT.029
  Scenario: Provider Opportunity Closed Lost requires Sub-Status
    Given the user has an open Provider Opportunity
    When the user changes the Stage to "Closed Lost"
    And the user attempts to save without selecting a Sub-Status
    Then the system should prevent saving and display a validation error

  @TC.0100 @UAT.029
  Scenario: Competitor field is required when Sub-Status is Lost to Competitor
    Given the user has an open Provider Opportunity
    When the user changes the Stage to "Closed Lost"
    And the user sets the Sub-Status to "Lost to Competitor"
    And the user attempts to save without filling the Competitor field
    Then the system should require the Competitor field to be filled

  @TC.0100 @UAT.029
  Scenario: Provider Opportunity closes as Closed Lost with all required fields
    Given the user has an open Provider Opportunity
    When the user changes the Stage to "Closed Lost"
    And the user selects a valid Sub-Status
    And the user clicks "Save"
    Then the Opportunity should be successfully updated to "Closed Lost"
    And the Opportunity should no longer appear in active pipeline views
