@Regression @Login
Feature: User authentication

  Background: Login
    Given I navigate to CE Portal ""
    When I enter "" in "CE_UserName"
    When I enter "" in "CE_Password"
    When I click on "Login"

  @JIRA_PLACEHOLDER_1
  Scenario: Successful login lands on the products page
    Then I should see "Products"

  @JIRA_PLACEHOLDER_2
  Scenario: Locked-out user sees an error
    Then I should see error banner with text "this user has been locked out"
