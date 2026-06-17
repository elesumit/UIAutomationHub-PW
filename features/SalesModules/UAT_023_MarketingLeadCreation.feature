@UAT.023 @regression @marketing
Feature: UAT.023 - Marketing Manual Lead Creation
  As a Marketing Operations user
  I want to create and manage leads manually in Salesforce
  So that I can track and assign them to the correct BU queues

  Background:
    Given the user is logged into Salesforce as a Marketing Operations user
    And the user is in the "Sales Console" app

  @TC.0069
  Scenario: Default app after login is Sales Console
    When the user logs in with Veradigm SSO credentials
    Then the landing app should be "Sales Console"
    And the available tabs should include "Leads"
    And the available tabs should include "Accounts"
    And the available tabs should include "Contacts"
    And the available tabs should include "Opportunities"

  @TC.0070
  Scenario: Navigate to Leads and open New Lead form
    Given the user is on the Sales Console home page
    When the user selects "Leads" from the navigation dropdown
    And the user clicks the "New" button
    Then the user should be presented with the "New Lead" page

  @TC.0071
  Scenario: Create a new lead with required fields
    Given the user is on the New Lead creation page
    When the user fills in the following required fields
      | Field                    | Value                  |
      | First Name               | Test                   |
      | Last Name                | AutoLead               |
      | Company                  | Automation Test Co     |
      | Lead Status              | New                    |
      | Lead Source              | Web                    |
      | Email                    | test@automation.com    |
      | Business Unit of Interest| Life Sciences          |
    And the user clicks "Save"
    Then the user should be brought to the newly saved Lead record
    And the Lead should be owned by the user who created it

  @TC.0072
  Scenario: Manually assign a lead to a BU Queue
    Given the user has a lead record open
    When the user clicks the Lead Owner change icon in the highlights panel
    And the user switches the owner type to "Queue"
    And the user assigns the lead to "Life Science Queue"
    And the user saves the change
    Then the lead ownership should be updated to "Life Science Queue"

  @TC.0073
  Scenario: Lead appears in correct list views after queue assignment
    Given a lead has been assigned to "Life Science Queue"
    When the user navigates to the "Today's Leads" list view
    Then the newly created lead should appear in the list
    When the user navigates to the "Life Sciences" list view
    Then the newly assigned lead should appear in that list

  @TC.0074
  Scenario: Reassign lead from queue to a sales rep
    Given a lead is in the "Life Sciences" list view
    When the user opens the lead record
    And the user changes the owner to a Sales Rep or Sales Manager
    And the user saves the change
    Then the lead ownership should be updated to the Sales Rep
    And the lead should no longer appear in the "Life Sciences" list view

  @TC.0075 @TC.0076
  Scenario: Add a task to a lead and assign to sales user
    Given the user has a lead record open
    When the user navigates to the activity section on the right side of the page
    And the user clicks the Task icon (green icon)
    Then the New Task form should display
    When the user fills in the following task fields
      | Field       | Value                     |
      | Subject     | Follow Up Call            |
      | Type        | Call                      |
      | Assigned To | <assigned_sales_user>     |
      | Comments    | Automation test task      |
    And the user clicks "Save"
    Then the new task should be created and assigned to the Sales User
