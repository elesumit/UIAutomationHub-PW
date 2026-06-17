@UAT.035 @UAT.036 @functional @account @contact
Feature: UAT.035-036 - Contact and Account Updates
  As a Sales Rep or Sales Manager
  I want to update contact and account records and manage team members
  So that data is current and team collaboration is enabled

  Background:
    Given the user is logged into Salesforce
    And the user has a record that they own

  # ──────────────────────────────────────────────
  # UAT.035 — Contact Updates
  # ──────────────────────────────────────────────
  @TC.0128
  Scenario: Update key fields on a Contact record
    Given the user navigates to a Contact record they own
    When the user updates the following fields
      | Field                          | Value              |
      | Mobile                         | 555-123-4567       |
      | Contact Type                   | Decision Maker     |
      | Direct Account Relationship    | Active             |
      | Mailing Address - Street       | 123 Test Ave       |
      | Mailing Address - City         | Chicago            |
      | Mailing Address - State        | IL                 |
    And the user clicks "Save"
    Then the contact record should be updated with the new values

  @TC.0129
  Scenario: Add a Contact to an Opportunity Team
    Given the user navigates to an open Opportunity they own
    When the user clicks "Add Team Member" in the "Opportunity Team" related list
    And the user fills in the following fields
      | Field                   | Value       |
      | Role                    | Technical   |
      | User                    | <test_user> |
      | Opportunity Access Level| Read Only   |
    And the user clicks "Save"
    Then the contact's outlook activity should be available on the Opportunity record

  # ──────────────────────────────────────────────
  # UAT.036 — Account Updates
  # ──────────────────────────────────────────────
  @TC.0130
  Scenario: Update fields on an Account record
    Given the user navigates to an Account record
    When the user updates all pertinent account fields
    And the user clicks "Save"
    Then the account should be updated with the new values

  @TC.0131 @TC.0132
  Scenario: Add a team member to an Account team
    Given the user navigates to an Account they own or that is in their BU
    When the user clicks the "Account Team" related list in the Related List Quick Links area
    Then the user should be brought to the Account Team modal
    When the user clicks "Add Team Members"
    And the user fills in the following fields
      | Field           | Value          |
      | Team Member     | <bu_sales_rep> |
      | Team Role       | Sales Rep      |
      | Account Access  | Read/Write     |
      | Opportunity Access | Read Only   |
    And the user saves the changes
    Then the new team member should appear under the Account Team list
