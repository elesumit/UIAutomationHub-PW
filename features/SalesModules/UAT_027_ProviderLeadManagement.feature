@UAT.027 @functional @provider @lead
Feature: UAT.027 - Provider Lead Management
  As a Provider BU Sales Rep or Manager
  I want to manage Provider leads from acceptance through conversion
  So that leads are properly qualified and converted to Accounts, Contacts, and Opportunities

  Background:
    Given the user is logged into Salesforce as a Provider BU Sales Rep
    And the user has access to the Leads module

  @TC.0088
  Scenario: Provider lead shows only BU-relevant fields
    Given the user creates a new Lead with Business Unit "Provider"
    When the user saves the record
    And the user opens the Lead record
    Then only fields relevant to the Provider BU should be visible
    And non-provider fields should be restricted from view

  @TC.0089
  Scenario: Accept a lead in Working status by changing owner to self
    Given the user navigates to Leads and selects the Provider List View
    When the user locates a Lead with Status "Working"
    And the user opens the Lead record
    And the user changes the Owner to themselves
    And the user saves the record
    Then the Lead ownership should change to the logged-in user
    And the Lead should appear in the "My Leads" view

  @TC.0090
  Scenario: Work a lead with all required fields saves successfully
    Given the user navigates to the Provider Leads list view
    And the user opens a Lead in "Working" status
    When the user fills in all required qualification fields
      | Field        | Value                    |
      | Lead Source  | Web                      |
      | Company      | Automation Test Practice |
      | First Name   | Test                     |
      | Last Name    | Provider                 |
      | Email        | provider@test.com        |
    And the user clicks "Save"
    Then the Lead should save successfully

  @TC.0090
  Scenario: Work a lead with missing required fields shows validation error
    Given the user opens a Lead in "Working" status
    When the user leaves a required field blank
    And the user clicks "Save"
    Then the system should display a validation error identifying the missing fields
    And the record should not be saved

  @TC.0091
  Scenario: Qualify a Provider Lead to Qualified status
    Given the user has a Provider Lead open with all required fields filled
    When the user changes the Status to "Qualified"
    And the user clicks "Save"
    Then the Lead status should update to "Qualified"

  @TC.0091
  Scenario: Qualify Lead fails when required fields are missing
    Given the user has a Provider Lead open
    When the user changes the Status to "Qualified"
    And leaves one or more required fields blank
    And the user clicks "Save"
    Then the system should display a validation rule listing the missing fields
    And the record should not be saved

  @TC.0092
  Scenario: Convert a qualified Provider Lead to Account Contact and Opportunity
    Given the user navigates to the "My Leads" list view
    And a Lead exists in "Qualified" status
    When the user opens the Lead record
    And the user clicks the "Convert" button
    And the user updates the Opportunity Name to follow Veradigm naming convention
    And the user clicks "Convert"
    Then the Lead should be converted successfully
    And a new Account, Contact, and Opportunity should be created
    And the Opportunity should be owned by the converting Sales Rep
