@UAT.030 @UAT.038 @UAT.039 @UAT.040 @UAT.041 @functional
Feature: UAT.030, 038, 039, 040, 041 - Account Products, Revenue Schedule, Credit Memo, Notes, Fraud

  Background:
    Given the user is logged into Salesforce

  # ──────────────────────────────────────────────
  # UAT.030 — Account Products
  # ──────────────────────────────────────────────

  @TC.0101 @UAT.030
  Scenario: Account Products populate after Closed Won Opportunity with Active Order
    Given an Opportunity has been Closed Won
    And the Order on the Opportunity is in "Active" status
    When the user navigates to the Opportunity record
    Then Account Products should be visible for each product purchased
    And the Account Products related list should show accurate product details

  # ──────────────────────────────────────────────
  # UAT.038 — Revenue Schedule / Quote
  # ──────────────────────────────────────────────

  @TC.0141 @UAT.038
  Scenario: Create a New Primary Quote on an existing Opportunity
    Given the user navigates to an existing Life Sciences Opportunity
    When the user clicks the "New Quote" button on the top right of the page
    Then the "New Quote" popup window should display
    And the Account and Opportunity fields should be pre-populated

  @TC.0142 @UAT.038
  Scenario: Fill required fields and save a new Primary Quote
    Given the user is in the New Quote popup window
    When the user fills in the following fields
      | Field             | Value         |
      | Primary           | checked       |
      | Start Date        | <today_date>  |
      | Subscription Term | 12            |
    And the user clicks "Save"
    Then the Quote should be created
    And the user should be presented on the newly created Quote's Edit Quote page

  @TC.0143 @UAT.038
  Scenario: Add Products to a Quote via Edit Quote page
    Given the user is on the Edit Quote page
    When the user clicks the "Add Products" button
    Then the Product Selection page should display
    And all products should appear in the list on the left side
    And the Product Filter should be displayed on the right side

  @TC.0145 @TC.0146 @UAT.038
  Scenario: Select a product and update Quote Line fields
    Given the user is on the Product Selection page
    When the user selects a product and clicks "Select"
    And the user manually updates the Quote Line with Quantity and Price
    And the user clicks "Calculate" and then "Save"
    Then the Quote should be saved successfully

  @TC.0147 @UAT.038
  Scenario: Navigate to Revenue Schedules from Opportunity Product
    Given the user has a saved Quote with products
    When the user navigates from the Quote to the Opportunity record
    And the user clicks the "Related" tab
    And the user clicks "Product" to navigate to the Opportunity Product record
    And the user clicks the "Related" tab on the Opportunity Product
    Then the "Revenue Schedules" section should be visible and populated

  # ──────────────────────────────────────────────
  # UAT.039 — Credit Memo Approval Process
  # ──────────────────────────────────────────────

  @TC.0556 @UAT.039
  Scenario Outline: Create a Credit Memo case routed to correct queue based on amount
    Given the user navigates to an active Account
    When the user creates a "Client Disputes" case with the following details
      | Field         | Value        |
      | Type          | Credit Memo  |
      | Credit Amount | <amount>     |
    And the user saves the case
    Then the case should be created with Type "Credit Memo"
    And the case should be routed to "<expected_queue>"

    Examples:
      | amount    | expected_queue           |
      | 2500000   | CFO Queue                |
      | 500000    | SVP Queue                |
      | 50000     | Finance VP Queue         |
      | 15000     | Director/Sr Manager Queue|
      | 7500      | Manager Queue            |
      | 3500      | Assoc. Manager Queue     |
      | 1000      | Analyst Queue            |

  @TC.0557 @UAT.039
  Scenario: Submit a Credit Memo case for approval
    Given the user has a saved Credit Memo case
    When the user clicks the dropdown next to "Edit"
    And the user clicks "Submit for Approval"
    Then the case should be sent for approval
    And the case should no longer be editable by the submitter

  # ──────────────────────────────────────────────
  # UAT.040 — Notes on Account
  # ──────────────────────────────────────────────

  @TC.0559 @UAT.040
  Scenario: Creator can create and edit their own note on an Account
    Given the user navigates to an active Account
    When the user creates a new Note and saves it
    Then the Note should be visible on the Account
    When the same user edits the Note
    Then the Note should be updated successfully

  @TC.0555 @UAT.040
  Scenario: Another user cannot edit a Note they did not create
    Given a Note has been created on an Account by User A
    When a different User B attempts to edit the same Note
    Then the system should prevent User B from updating the original note

  # ──────────────────────────────────────────────
  # UAT.041 — Fraudulent Accounts
  # ──────────────────────────────────────────────

  @TC.0150 @UAT.041
  Scenario: Create a Fraud Investigation case on an Account
    Given the user navigates to an Account they own
    When the user creates a new case with the following details
      | Field   | Value                    |
      | Type    | Account Update Request   |
      | Subject | Suspicious Account       |
      | Type    | Fraud Investigation      |
    And the user saves the case
    Then a case for "Fraud Investigation" should be created on the Account

  @TC.0545 @UAT.041
  Scenario: Fraud investigation banner appears on Account after case creation
    Given a Fraud Investigation case has been created on an Account
    When the user navigates back to the Account record
    Then the Account should display a banner warning of a fraud investigation pending
