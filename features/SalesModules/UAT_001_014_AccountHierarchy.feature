@UAT.001 @UAT.014 @functional @account
Feature: UAT.001 & UAT.014 - Account Hierarchy
  As a BU Sales Rep or Manager
  I want to view the Account Hierarchy
  So that I can see the shell and parent account relationships

  Background:
    Given the user is logged into Salesforce as a BU Sales Rep
    And the user has access to Account records

  @TC.0004 @UAT.001
  Scenario: View account hierarchy from an Account record
    Given the user navigates to one of their Accounts
    When the user clicks the "Account Hierarchy" button
    Then the user should see the hierarchy of Accounts
    And the hierarchy should include the Shell account created by the system

  @TC.0045 @UAT.014
  Scenario: Account hierarchy shows shell account
    Given the user navigates to one of their Accounts
    When the user clicks the "Account Hierarchy" button
    Then the account hierarchy should be displayed
    And the Shell account associated with the account should be visible in the hierarchy
