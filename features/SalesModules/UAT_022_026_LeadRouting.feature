@UAT.022 @UAT.026 @functional @routing @lead
Feature: UAT.022 & UAT.026 - Round Robin and Provider Lead Routing
  As a BU Sales Manager or Rep
  I want leads to be automatically routed to the correct queue or user
  So that the right team members receive and own the correct leads

  Background:
    Given the user is logged into Salesforce
    And lead assignment rules are active and configured

  # ──────────────────────────────────────────────
  # UAT.022 — Round Robin Lead Assignment
  # ──────────────────────────────────────────────

  @TC.0065 @UAT.022
  Scenario: Provider SMB Lead is assigned to correct queue on creation
    Given the user creates a new Lead with the following attributes
      | Field                    | Value                         |
      | Area of Interest         | Healthcare Providers          |
      | Solutions of Interest    | Practice Fusion EHR           |
    When the user saves the Lead
    Then the Lead should be assigned to the "Provider SMB RR Lead" queue
    And the Lead should be assignable to the logged-in user

  @TC.0067 @UAT.022
  Scenario: Provider SMB Prospect Account is assigned to correct public group
    Given an EHR trial Account comes in for a Provider SMB prospect
    When the Account is created in Salesforce
    Then the Account should be assigned to the "Provider SMB RR Acct" Account Public Group

  @TC.0068 @UAT.022
  Scenario: Provider Customer Account is assigned to correct CSM based on Billing State
    Given an Account Record Type is changed from "Prospect" to "Customer"
    And the Legal Entity is "Practice Fusion"
    And Is Strategic Account is FALSE
    When the system processes the assignment
    Then the Account should be owned by the CSM assigned to the correct region
    And the CSM should be able to make updates to the record

  # ──────────────────────────────────────────────
  # UAT.026 — Provider Lead Routing
  # ──────────────────────────────────────────────

  @TC.0087 @UAT.026
  Scenario: Provider Lead is automatically routed to correct queue on save
    Given active Lead Assignment Rules are configured for Provider segment
    When the user creates a new Lead with Business Unit "Provider"
    And the user saves the Lead record
    Then the Lead should be automatically assigned to the correct queue or owner
    And the routing should match the expected routing configuration

  @TC.0087 @UAT.026
  Scenario: Provider Lead routing respects predefined rules
    Given the user imports or creates a new Lead with Provider as the business segment
    When the Lead is saved
    Then the Lead Owner or Queue should be populated automatically
    And the assignment should match the routing rule mapping for Provider leads
