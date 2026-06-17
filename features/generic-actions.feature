# @manual
# Feature: Generic User Actions
#   As a test automation framework
#   I want to support generic actions
#   So that tests can be written without custom step definitions

#   Scenario: Navigation and Login
#     Given I navigate to Salesforce ""
#     Given I navigate to CE Portal ""
#     Given I navigate to "https://example.com"
#     When I click on "Login"
#     When I click on the remove icon
#     When I click on the "Dashboard" link
#     When I click on the "Details" tab
#     When I hover over "Menu"
#     When I hover over "Menu" and click on "Submenu"
#     When I wait for 2 seconds
#     When I click on "Profile" and switch to new page
#     When I switch to new tab
#     When I switch to tab 2
#     When I switch to original tab
#     When I close current tab
#     When I accept the alert
#     When I dismiss the alert
#     When I accept the alert with text "Are you sure?"
   

#   Scenario: Handle Browser Permissions popup
#     When I allow browser permissions
#     When I deny browser permissions
#     When I close the permission popup
    

#   Scenario: Form Interactions
#     When I enter "testuser" in "username"
#     When I enter "password123" in "Password"
#     When I enter "testuser" in the "username" field
#     When I select "Option1" from "dropdown"
#     When I check "Remember Me"
#     When I select the "Male" radio button
#     When I enter "Some text" in the "Comments" textarea
#     When I upload "path/to/file.pdf" to "Upload Files"
#     When I upload file "test-data/document.pdf"

#   Scenario: Table Interactions
#     When I click on row 1 in the table
#     When I click on row 2 column 3 in the table
#     When I click on the cell in row 1 column "Status"
#     When I click on "Edit" in the table row containing "John"
#     When I click on "Delete" in the row where "Name" is "Jane"
#     When I click on "Edit" in the row where "Name" is "Jane" and "Status" is "Active"
#     When I enter "New Value" in row 1 column "Status"
#     When I select "Active" in row 2 column "Status"
#     When I sort the table by column "Name"
#     When I click on page 2 in the table pagination
#     When I click on "Next" in the table pagination
#     When I wait for the table to have 5 rows
#     When I wait for the table to contain "Completed"


#   Scenario: Verification
#     Then I should see "Welcome"
#     Then I should see the text "Dashboard"
#     Then the page title should be "Home"
#     Then the page title should contain "Dashboard"
#     Then the URL should be "https://example.com/dashboard"
#     Then the URL should contain "dashboard"
#     Then the "Profile" should be visible
#     Then the "Logout" should not be visible
#     Then I see "Status" as "New"
#     Then I see "Priority" as "Critical"
#     Then I take a screenshot named "dashboard"
#     Then I should see alert with message "Action successful"
#     Then the table should have 5 rows
#     Then the table row 1 column 2 should contain "Active"
#     Then the table row 1 column "Status" should contain "Active"
#     Then the table should contain "John"
#     Then the table row containing "Jane" should have "Active" in column "Status"
#     Then all rows in column "Status" should contain "Active"
#     Then the table column "ID" should contain unique values
#     Then all rows in column "Email" should match the pattern "@example.com"
#     Then the table column "Name" should be sorted in "ascending" order

#   Scenario: Text Capture and Reuse
#     When I capture text from "Case Number" and store as "caseId"
#     When I capture text matching "Case #\d+" and store as "caseNumber"
#     When I capture attribute "href" from "View Details" and store as "detailsUrl"
#     When I enter captured "caseId" in "Search"
#     Then I should see captured "caseNumber"
#     Then captured "caseId" should contain "CASE"
#     When I log captured "caseId"

  # @smoke @regression
  # Scenario: Navigate and verify text
  #   Given I navigate to "https://example.com"
  #   Then I should see "Example Domain"
  #   And the page title should contain "Example"

  # @regression
  # Scenario: Navigate to IANA link
  #   Given I navigate to "https://example.com"
  #   When I click on "More information"
  #   Then the URL should contain "iana.org"

  # @regression
  # Scenario: Verify multiple page elements
  #   Given I navigate to "https://example.com"
  #   Then the page title should be "Example Domain"
  #   And the "Example Domain" should be visible
  #   And I take a screenshot named "homepage"