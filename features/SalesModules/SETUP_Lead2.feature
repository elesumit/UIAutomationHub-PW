@setup @data-setup
Feature: Test Data Setup — Create Leads in QA Sandbox
  As a QA automation engineer
  I want to create test leads  in the QA sandbox
  So that all UAT feature files have the required lead data to run against




  @TC.SETUP.Lead2
  Scenario: Create test lead
    Given I load test data from CSV file "testdata/leads.csv" row "1"
    When I navigate to Salesforce ""
    When I enter "" in "SFQA_UserName"
    When I enter "" in "SF_Password"
    When I click on "Log In to Sandbox"
    When I wait for 5 seconds
    When I click on "App Launcher"
    When I enter "${app_name}" in "Search apps and items..."
    When I click on "${app_name}"
    When I wait for 3 seconds

    When I click on "Show Navigation Menu"

    When I click on "${app_items}"
    When I wait for 2 seconds

    When I click on "New"


    #Enter lead details
    When I wait for 2 seconds
    When I select "${salutation}" from "Salutation"

    When I select "${lead_status}" from "Lead Status"
    When I select "${lead_source}" from "Lead Source"
    When I enter "${first_name}" in "First Name"
    When I enter "${last_name}" in "Last Name"
    When I enter "${company}" in "Company"

    When I enter "${email}" in "Email"

    When I enter "${street}" in "Street"
    When I enter "${city}" in "City"
    When I enter "${state}" in "State/Province"
    When I enter "${zip}" in "Zip/Postal Code"
    When I enter "${phone}" in "Phone"


    When I select "${business_unit}" from "Business Unit of Interest"

    When I click on "${solution_interest}"

    When I click on "Move selection to Chosen"
    When I enter "${provider_count}" in "Provider Count"


    When I click on "Save"
    When I wait for 5 seconds
    Then I see "Lead" as "${salutation} ${first_name} ${last_name}"
   
    #go to lead page and convert it it working status
    When I click on "Leads"
    When I wait for 2 seconds
    When I click on "Select a List View: Leads"
    When I click on "My Leads"
    When I wait for 2 seconds
    When I click on "No Activity"
    When I click on "Total Leads"
    #When I click on "${first_name} ${last_name}"
    When I click on "Select Item 1"
    When I click on "Change Status"
    When I select "${status}" from "Change Status"
    When I click on "Save"
    When I wait for 2 seconds
    Then I see "Lead Status" as "${status}"


    #change the lead owner to a specific user
    When I click on "Change Owner"
    When I enter "Sumit" in "Select New Owner"
    When I wait for 2 seconds
    When I click on "Sumit Gupta"
    When I click on "Submit"
    When I wait for 2 seconds
    When I click on "${salutation} ${first_name} ${last_name}"
    Then I see "Lead Owner" as "Sumit Gupta"

    #clean up leads after creation
    #  When I click on "Delete"
    #  When I click on "Delete"
    #  When I click on "Delete"


