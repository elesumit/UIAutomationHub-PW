@UAT.006 @functional @payerpath @lead
Feature: UAT.006 - Payerpath Lead Management
  As a Payerpath BU Sales Rep or Manager
  I want to manage Provider and Payer leads through qualification and conversion
  So that leads progress correctly through the Payerpath sales process

  Background:
    Given the user is logged into Salesforce as a Payerpath BU Sales Rep
    And the user has access to the Leads module

  # ──────────────────────────────────────────────
  # Provider Lead Management
  # ──────────────────────────────────────────────

  @TC.0018
  Scenario: Provider Lead shows correct new fields when BU is Healthcare Providers
    Given the user opens a Lead where BU equals "Healthcare Providers"
    Then the following fields should be visible on the Lead record
      | Field                         |
      | Current Statement Vendor      |
      | Current Clearinghouse         |
      | Monthly Claim Volume          |
      | Location Count                |

  @TC.0019
  Scenario: Work a Provider Lead and fill required fields
    Given the user has a Provider Lead open
    When the user fills in the following required fields
      | Field                              | Value                    |
      | Company                            | Test Provider Practice   |
      | Company Type                       | Hospital                 |
      | Specialty                          | General Practice         |
      | Provider Count                     | 5                        |
      | Mid-Level Provider Count           | 2                        |
      | Current EHR                        | Epic                     |
      | Current Practice Management Software | Allscripts             |
      | Current Billing Method             | In-House                 |
      | Current Clearinghouse              | Availity                 |
      | Lead Source                        | Web                      |
    And the user clicks "Save"
    Then the Lead should be ready to be Qualified

  @TC.0020
  Scenario: Update Provider Lead status to Qualified
    Given the user has a fully filled Provider Lead open
    When the user changes the Status to "Qualified"
    And the user clicks "Save"
    Then the Lead status should be updated to "Qualified"

  @TC.0021
  Scenario: Convert a qualified Provider Lead to Account Contact and Opportunity
    Given the user has a Qualified Provider Lead open
    When the user clicks the "Convert" button
    And the user updates the Opportunity Name to follow Veradigm naming conventions
    And the user clicks "Convert"
    Then a new Account, Contact, and Opportunity should be created

  # ──────────────────────────────────────────────
  # Payer Lead Management
  # ──────────────────────────────────────────────

  @TC.0022
  Scenario: Payer Lead shows correct fields when BU is Health Plans and Payers
    Given the user opens a Lead where BU equals "Health Plans and Payers"
    Then the following fields should be visible on the Lead record
      | Field                  |
      | Location Count         |
      | Monthly Claim Volume   |
      | Current Clearinghouse  |

  @TC.0023
  Scenario: Work a Payer Lead through to Qualified with required fields
    Given the user has a Payer Lead open
    When the user fills in the following required fields
      | Field                 | Value           |
      | Company               | Test Payer Inc  |
      | Company Type          | Health Plan     |
      | Lead Source           | Web             |
      | Current Clearinghouse | Availity        |
    And the user sets Status to "Qualified"
    And the user clicks "Save"
    Then the Lead should be updated to "Qualified"

  @TC.0023
  Scenario: Payer Lead fails validation when required fields are missing
    Given the user has a Payer Lead open
    When the user attempts to set Status to "Qualified" without filling required fields
    And the user clicks "Save"
    Then the system should display a validation error listing the missing fields

  @TC.0024
  Scenario: Convert a qualified Payer Lead to Account Contact and Opportunity
    Given the user has a Qualified Payer Lead open
    When the user clicks the "Convert" button
    And the user updates the Opportunity Name to follow Veradigm naming conventions
    And the user clicks "Convert"
    Then the user should be presented with the new Account, Contact, and Opportunity
