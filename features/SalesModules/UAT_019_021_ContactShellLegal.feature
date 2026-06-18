@UAT.019 @UAT.020 @UAT.021 @functional
Feature: UAT.019-021 - ERP Contact, Shell Accounts, and Legal Entity
  As a Sales user or Admin
  I want to manage Contact profile links, Shell Accounts, and Legal Entity assignments
  So that data integrity and automation rules work correctly

  Background:
    Given the user is logged into Salesforce

  # ──────────────────────────────────────────────
  # UAT.019 — ERP Contact Profile Link
  # ──────────────────────────────────────────────

  @TC.0059 @UAT.019
  Scenario: Add a Profile Link to a Contact record
    Given the user navigates to any Contact record
    When the user adds a Profile Link to the Contact
    And the user saves the record
    Then the Contact record should be updated with the Profile Link

  # ──────────────────────────────────────────────
  # UAT.020 — Shell Accounts
  # ──────────────────────────────────────────────

  @TC.0062 @UAT.020
  Scenario: Regular sales user cannot edit a Shell Account
    Given the user is logged in as a BU Sales Rep or Manager
    When the user navigates to an existing Shell Account
    And the user attempts to edit the Shell Account
    Then the user should not have access to edit the Shell Account record

  @TC.0063 @UAT.020
  Scenario: Admin user can edit a Shell Account
    Given the user is logged in as a Sales Ops or System Administrator
    When the user navigates to an existing Shell Account
    And the user attempts to edit the Shell Account
    Then the user should be able to make edits to the Shell Account record
    And the changes should save successfully

  @TC.0061 @UAT.020
  Scenario: System creates a Shell Account when a new Account is added
    Given the user is logged in as a BU Sales Rep
    When the user creates a new Account in Salesforce
    Then the system should check for an associated Shell Account
    And if no Shell Account exists, the system should create one automatically

  # ──────────────────────────────────────────────
  # UAT.021 — Legal Entity
  # ──────────────────────────────────────────────

  @TC.0064 @UAT.021
  Scenario: Legal Entity field is visible but not editable on a Lead
    Given the user creates a new Lead
    When the user fills in all required fields
    And the user views the Lead record
    Then the Legal Entity field should be visible on the Lead
    And the Legal Entity field should not be editable by the user

  @TC.0064 @UAT.021
  Scenario Outline: Legal Entity auto-assigned based on Business Unit of Interest
    Given the user creates a new Lead with Business Unit of Interest as "<bu>"
    When the user saves the Lead
    Then the Legal Entity field should be automatically set to "<expected_legal_entity>"

    Examples:
      | bu                            | expected_legal_entity     |
      | Life Sciences                 | Veradigm LLC              |
      | Health Plans and Payers       | Veradigm LLC              |
      | Enterprise Resource Planning  | Veradigm LLC              |
      | Healthcare Providers          | Practice Fusion           |
