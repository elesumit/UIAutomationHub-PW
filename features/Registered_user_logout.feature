@Regression @E2E @General
Feature: Registered user logout

  Background: Login
    Given I navigate to CE Portal ""
    When I enter "" in "CE_UserName"
    When I enter "" in "CE_Password"
    When I click on "Login"

  @XSP-66
  Scenario: Log Out option is visible in the header for an authenticated user
    Then I should see "Log Out"

  @XSP-65
  Scenario: Clicking Log Out terminates session and redirects to Home Page A
    When I click on "Log Out"
    Then I should see "Home Page A"
    Then I should see "Main Navigation"
    Then I should see "Home Banner"
    Then I should see "Footer"

  @XSP-64
  Scenario: Log Out is accessible from the account menu and performs logout
    When I click on "Account Menu"
    Then I should see "Log Out"
    When I click on "Log Out"
    Then I should see "Home Page A"

  @XSP-63
  Scenario: After logout, accessing user-specific content prompts the login screen
    When I click on "Log Out"
    Then I should see "Home Page A"
    When I click on "My Account"
    Then I should see "Login"

  @XSP-62
  Scenario: Logging out from the Dashboard terminates session and removes access to Dashboard
    When I click on "Dashboard"
    Then I should see "Dashboard"
    When I click on "Log Out"
    Then I should see "Home Page A"
    Then I should not see "Dashboard"

  @XSP-61
  Scenario: Repeated clicks on Log Out are idempotent and maintain redirection to Home Page A
    When I click on "Log Out"
    When I click on "Log Out"
    Then I should see "Home Page A"
    When I click on "My Account"
    Then I should see "Login"

  @XSP-60
  Scenario: Home Page A is displayed in its entirety after logout with key components visible
    When I click on "Log Out"
    Then I should see "Home Page A"
    Then I should see "Search"
    Then I should see "Featured Products"
    Then I should see "Footer"