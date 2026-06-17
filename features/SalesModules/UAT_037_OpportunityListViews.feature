@UAT.037 @functional @opportunity
Feature: UAT.037 - Opportunity List Views
  As a Sales Rep or Sales Manager
  I want to navigate and use opportunity list views
  So that I can manage and update my pipeline efficiently

  Background:
    Given the user is logged into Salesforce
    And the user navigates to the Opportunities tab

  @TC.0133
  Scenario: Sales Rep can view My Open Opportunities
    When the user changes the list view to "My Open Opportunities"
    Then the user should see a list of all their open opportunities

  @TC.0134
  Scenario: Sales Rep can view opportunities closing this month
    When the user changes the list view to "My Opps Closing This Month"
    Then the user should see all their opportunities that close this month

  @TC.0135
  Scenario: Sales Rep can view opportunities past close date
    When the user changes the list view to "My Opps Past Close Date"
    Then the user should see a list of open opportunities that are past their close date

  @TC.0136
  Scenario: Sales Rep can inline edit close date from list view
    Given the user is on the "My Opps Past Close Date" list view
    When the user clicks into the "Close Date" field on an opportunity row
    And the user updates the date to a future date
    And the user saves the change
    Then the opportunity's close date should be updated to the new future date

  @TC.0137
  Scenario: Sales Manager can view their team's open opportunities
    Given the user is logged in as a Sales Manager
    When the user changes the list view to "My Team's Open Opps"
    Then the user should see the entire team's list of open opportunities

  @TC.0138
  Scenario: Sales Manager can view team opportunities closing this month
    Given the user is logged in as a Sales Manager
    When the user changes the list view to "My Team's Open Opps Closing This Month"
    Then the user should see a list of the team's open opportunities closing this month

  @TC.0139
  Scenario: Sales Manager can view team opportunities past close date
    Given the user is logged in as a Sales Manager
    When the user changes the list view to "My Team's Open Opps Past Close Date"
    Then the user should see a list of the team's open opportunities past their close date

  @TC.0140
  Scenario: Sales Manager can bulk update past close dates from list view
    Given the user is on a list view showing past close date opportunities
    When the user clicks into the "Close Date" field of an opportunity
    And the user updates it to a future date
    Then the date should be updated inline without navigating away from the list view
