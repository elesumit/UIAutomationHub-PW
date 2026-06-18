@UAT.016 @UAT.017 @UAT.018 @functional @erp @lead @opportunity
Feature: UAT.016-018 - ERP Lead and Opportunity Management
  As an ERP BU Sales Rep
  I want to manage ERP leads and opportunities through the full sales cycle
  So that deals are properly tracked and progressed to Closed Won or Closed Lost

  Background:
    Given the user is logged into Salesforce as an ERP BU Sales Rep

  # ──────────────────────────────────────────────
  # UAT.016 — ERP Lead Management
  # ──────────────────────────────────────────────

  @TC.0047 @UAT.016
  Scenario: Update an existing ERP Lead from HubSpot with required fields
    Given the user navigates to the Leads tab
    And the user selects the "Enterprise Resource Planning" list view
    When the user opens any Lead record and updates the following fields
      | Field        | Value                    |
      | Company      | Test ERP Hospital        |
      | Company Type | Hospital                 |
      | Lead Source  | HubSpot                  |
    And the user clicks "Save"
    Then the Lead should be qualified and ready for conversion

  @TC.0048 @UAT.016
  Scenario: Manually create a new ERP Lead
    Given the user navigates to the Leads tab
    When the user clicks "New"
    Then the New Lead modal should open

  @TC.0049 @UAT.016
  Scenario: Fill required fields on a new ERP Lead and save
    Given the user is on the New Lead creation page
    When the user fills in the following required fields
      | Field                      | Value                        |
      | First Name                 | ERP                          |
      | Last Name                  | TestLead                     |
      | Company                    | Test ERP Hospital            |
      | Business Unit of Interest  | Enterprise Resource Planning |
      | Solutions of Interest      | Enterprise Resource Planning |
      | Lead Status                | New                          |
      | Lead Source                | Web                          |
      | Email                      | erp.test@automation.com      |
    And the user clicks "Save"
    Then the new lead should be created and assigned to the user

  @TC.0050 @UAT.016
  Scenario: Convert an ERP Lead to Account Contact and Opportunity
    Given the user has a qualified ERP Lead open
    When the user clicks the "Convert" button
    And the user updates the Opportunity Name per Veradigm naming conventions
    And the user clicks "Convert"
    Then the Lead should be converted into an Account, Contact, and Opportunity

  # ──────────────────────────────────────────────
  # UAT.017 — ERP Opp Closed Won
  # ──────────────────────────────────────────────

  @TC.0051 @UAT.017
  Scenario: Work an ERP Opportunity with a primary quote
    Given the user navigates to the newly created ERP Opportunity
    When the user works the Opportunity and a primary quote is added
    Then the Primary Quote should be added and the Opportunity should be ready for Sales Won

  @TC.0052 @UAT.017
  Scenario: Move an ERP Opportunity to Sales Won
    Given the user has an ERP Opportunity with an approved primary quote
    When the user fills in the required fields
      | Field               | Value         |
      | Type                | New Business  |
      | Close Date          | <future_date> |
      | Primary Win Reason  | Functionality |
    And the user sets the Stage to "Sales Won"
    And the user sets the Sub-Stage to "In QA Queue"
    And the user clicks "Save"
    Then the Opportunity should be updated to "Sales Won"
    And a QA Review Case should be created on the Opportunity

  @TC.0053 @UAT.017
  Scenario: QA Case is created and appears in Signed Contract List
    Given an ERP Opportunity has been set to Sales Won with Sub-Stage "In QA Queue"
    Then a QA Review Case should be visible on the Opportunity record
    When the user navigates to Cases - Signed Contract List View
    Then the QA case should appear in the Signed Contract List

  @TC.0055 @UAT.017
  Scenario: Update Sales QA Entered Date on ERP Opportunity
    Given the user has navigated to the ERP Opportunity from the QA Case
    When the user sets the Sub-Stage to "In QA Queue"
    And the user sets the Sales QA Entered Date to today's date
    And the user clicks "Save"
    Then the Opportunity Sub-Stage should be updated
    And the Sales QA Entered Date should reflect today's date

  @TC.0056 @UAT.017
  Scenario: Close Won an ERP Opportunity and verify Order creation
    Given the user has an ERP Opportunity in Sales Won stage
    When the user clicks the "Closed" stage on the Opportunity Path
    And the user selects Stage "Closed Won"
    And the user clicks "Save"
    Then the Opportunity Stage should be "Closed Won"
    And an Order should be created and visible in the Related List Quick Links

  # ──────────────────────────────────────────────
  # UAT.018 — ERP Opp Closed Lost
  # ──────────────────────────────────────────────

  @TC.0057 @UAT.018
  Scenario: ERP Opportunity Closed Lost requires Primary Loss Reason
    Given the user navigates to an open ERP Opportunity
    When the user changes the Stage to "Closed Lost"
    Then the user should be prompted to fill out the Primary Loss Reason field

  @TC.0058 @UAT.018
  Scenario Outline: ERP Opportunity Closed Lost with valid loss reason
    Given the user has an open ERP Opportunity
    When the user changes the Stage to "Closed Lost"
    And the user selects Primary Loss Reason as "<loss_reason>"
    And the user clicks "Save"
    Then the Opportunity should be updated to "Closed Lost"

    Examples:
      | loss_reason                                    |
      | Communication (Veradigm Press Releases)        |
      | Duplicate Opportunity                          |
      | Expired (Auto-Close)                           |
      | Lost to Competitor                             |
      | No Budget / Lost Funding                       |
      | No Decision / Non-Responsive                   |
      | Price/Term                                     |
      | Project Cancelled                              |
      | Remaining with Incumbent Vendor                |
      | Strategic Direction Change (Customer)          |
