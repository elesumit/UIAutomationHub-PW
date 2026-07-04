@smoke
Feature: Login to Demo Application (saucedemo.com)

  Scenario: Successful login with standard user
    Given I navigate to CE Portal ""
    When I enter "" in "CE_UserName"
    When I enter "" in "CE_Password"
    When I click on "Login"
    Then I should see "Products"
