@UAT.031 @UAT.032 @UAT.033 @functional @case-management
Feature: UAT.031-033 - Internal Case Management
  As a BU Customer Success Manager or Sales Rep
  I want to create, manage, assign, validate, close, clone and create child cases
  So that internal workflows are tracked and enforced correctly

  Background:
    Given the user is logged into Salesforce
    And the user has valid permissions for Case management
    And the user is in the "Sales Console" app

  # ──────────────────────────────────────────────
  # UAT.031.01 — Case Creation
  # ──────────────────────────────────────────────
  @TC.0106
  Scenario: Successfully create an internal case with all required fields
    Given the user navigates to the Cases tab
    When the user clicks "New Case"
    And the user selects record type "Demo Request/Assistance"
    Then the appropriate page layout should load with custom fields
    When the user fills in the following required fields
      | Field        | Value                    |
      | Subject      | Automation Test Case     |
      | Description  | Created by automation    |
      | Account      | <test_account_name>      |
      | Contact      | <test_contact_name>      |
      | Product Name | <test_product_name>      |
    And the user clicks "Save"
    Then the case record should be created successfully
    And the correct record type layout should be displayed
    And the "Internal/External" field should be auto-populated

  @TC.0106
  Scenario: Case creation fails when required fields are missing
    Given the user is on the New Case creation page
    And the user selects record type "Demo Request/Assistance"
    When the user leaves the "Account" field blank
    And the user clicks "Save"
    Then the system should display a required field validation error
    And the case record should NOT be created

  # ──────────────────────────────────────────────
  # UAT.031.02 — Case Assignment
  # ──────────────────────────────────────────────
  @TC.0107
  Scenario: Case auto-assigns to correct queue based on record type
    Given the user creates a new case with record type "Data Request"
    When the user saves the case
    Then the case owner should be automatically assigned to the configured queue for "Data Request"

  @TC.0107
  Scenario: Create legal review case from existing case
    Given the user has an existing case record open
    When the user checks the "Create Legal Review" checkbox under Additional Information
    And the user saves the record
    Then a new Legal Review case should be created
    And the new case should be linked to the original case

  # ──────────────────────────────────────────────
  # UAT.031.03 — Case Validation and Approval
  # ──────────────────────────────────────────────
  @TC.0108
  Scenario: Rejection reason is required when status is set to Rejected
    Given the user has an existing In Progress case open
    When the user changes the Status to "Rejected"
    And the user leaves the Rejection Reason blank
    And the user clicks "Save"
    Then the system should display the validation message
      """
      When entering a Status of 'Rejected' you must provide a Rejection Reason. (C2)
      """

  @TC.0108
  Scenario: Case saves successfully when Rejection Reason is provided
    Given the user has an existing In Progress case open
    When the user changes the Status to "Rejected"
    And the user enters a valid Rejection Reason
    And the user clicks "Save"
    Then the case should save successfully with Status "Rejected"

  # ──────────────────────────────────────────────
  # UAT.031.04 — Case Closure
  # ──────────────────────────────────────────────
  @TC.0109
  Scenario: Closed case cannot be reopened
    Given the user has a case with Status "In Progress"
    When the user sets the Status to "Closed - Completed"
    And the user saves the record
    Then the case should be closed successfully
    When the user attempts to change the status back to "In Progress"
    And the user clicks "Save"
    Then the system should display the validation message
      """
      Once closed, a case cannot be reopened. Please clone to continue working this issue. [C1]
      """

  @TC.0109
  Scenario: Cloned case retains parent reference
    Given the user has a closed case record
    When the user clicks the "Clone" button
    Then the new case page should open with pre-populated values
    When the user saves the cloned case
    Then the new case should show a link back to the parent case it was cloned from

  # ──────────────────────────────────────────────
  # UAT.032 — Create Child Case
  # ──────────────────────────────────────────────
  @TC.0110 @TC.0111
  Scenario: Create a child case from an existing open case
    Given the user has an open case record that they own
    When the user navigates to the "Related" tab
    And the user clicks "New" in the cases related list
    And the user selects a Case Type and clicks "Next"
    Then the user should be brought to the New Case page
    When the user fills in the required fields
      | Field  | Value       |
      | Status | New         |
      | Type   | <case_type> |
    And the user clicks "Save"
    Then the user should be brought to the newly saved child case record

  @TC.0112 @TC.0113
  Scenario: Child case shows related records and hierarchy
    Given the user has a child case record open
    Then the associated Opportunity and related cases should be visible
    When the user clicks the dropdown next to "Clone" and selects "View Case Hierarchy"
    Then the case hierarchy view should display

  # ──────────────────────────────────────────────
  # UAT.033 — Case Cloning
  # ──────────────────────────────────────────────
  @TC.0114 @TC.0115
  Scenario: Clone an existing case and verify parent link
    Given the user navigates to an existing case they want to clone
    When the user clicks the "Clone" button
    Then the user should see a new Case page with pre-populated values from the original
    When the user updates fields as needed and clicks "Save"
    Then the new case record should show a link back to the parent case it was cloned from
    And all original data should be maintained on the parent case
