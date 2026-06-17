@setup @data-setup
Feature: Test Data Setup — Create Leads in QA Sandbox
  As a QA automation engineer
  I want to create test leads  in the QA sandbox
  So that all UAT feature files have the required lead data to run against



  @TC.SETUP.Lead
  Scenario: Create all required test leads
    When I navigate to Salesforce ""
    When I enter "" in "SFQA_UserName"
    When I enter "" in "SF_Password"
    When I click on "Log In to Sandbox"
    When I wait for 5 seconds
    When I click on "App Launcher"
    When I enter "Sales Console" in "Search apps and items..."
    When I click on "Sales Console"
    When I wait for 3 seconds

    When I click on "Show Navigation Menu"

    When I click on "Leads"
    When I wait for 2 seconds

    When I click on "New"
    

    #Enter lead details
    When I wait for 2 seconds
    When I select "Mr." from "Salutation"

    When I select "New" from "Lead Status"
    When I select "Email" from "Lead Source"
    When I enter "Sumit2" in "First Name"
    When I enter "Gupta2" in "Last Name"
    When I enter "Automation LLC" in "Company"

    When I enter "sumit.gupta12@veradigm.com" in "Email"

   When I enter "123 Main St" in "Street"
    When I enter "Chicago" in "City"
    When I enter "IL" in "State/Province"
    When I enter "60601" in "Zip/Postal Code"
    When I enter "312-555-0100" in "Phone"


    When I select "Healthcare Providers" from "Business Unit of Interest"

    When I click on "Care Gap Closure Services"

    When I click on "Move selection to Chosen"
    When I enter "20" in "Provider Count"
    
     
    When I click on "Save"
    When I wait for 5 seconds
    Then I see "Lead" as "Mr. Sumit2 Gupta2"

    #go to lead page and convert it it working status
     When I click on "Leads"
    When I wait for 2 seconds
    When I click on "No Activity"
    When I click on "Total Leads"
    When I click on "Mr. Sumit2 Gupta2"
    When I click on "Change Status"
    When I select "Working" from "Change Status"
    When I click on "Save"
    When I wait for 2 seconds
    Then I see "Lead Status" as "Working"


    #change the lead owner to a specific user
    When I click on "Change Owner"
    When I enter "Sumit" in "Select New Owner"
    When I wait for 2 seconds
    When I click on "Sumit Gupta"
    When I click on "Submit"
    When I wait for 2 seconds
    When I click on "Sumit2 Gupta2"
    Then I see "Lead Owner" as "Sumit Gupta"

    #clean up leads after creation
  #  When I click on "Delete"
  #  When I click on "Delete"


  
@TC.SETUP.Lead3
  Scenario Outline: Create all required test leads
    When I navigate to Salesforce ""
    When I enter "" in "SFQA_UserName"
    When I enter "" in "SF_Password"
    When I click on "Log In to Sandbox"
    When I wait for 5 seconds
    When I click on "App Launcher"
    When I enter "<app_name>" in "Search apps and items..."
    When I click on "<app_name>"
    When I wait for 3 seconds

    When I click on "Show Navigation Menu"

    When I click on "<app_items>"
    When I wait for 2 seconds

    When I click on "New"


    #Enter lead details
    When I wait for 2 seconds
    When I select "<salutation>" from "Salutation"

    When I select "<lead_status>" from "Lead Status"
    When I select "<lead_source>" from "Lead Source"
    When I enter "<first_name>" in "First Name"
    When I enter "<last_name>" in "Last Name"
    When I enter "<company>" in "Company"

    When I enter "<email>" in "Email"

    When I enter "<street>" in "Street"
    When I enter "<city>" in "City"
    When I enter "<state>" in "State/Province"
    When I enter "<zip>" in "Zip/Postal Code"
    When I enter "<phone>" in "Phone"


    When I select "<business_unit>" from "Business Unit of Interest"

    When I click on "<solution_interest>"

    When I click on "Move selection to Chosen"
    When I enter "<provider_count>" in "Provider Count"


    When I click on "Save"
    When I wait for 5 seconds
    Then I see "Lead" as "<salutation> <first_name> <last_name>"
   
    #go to lead page and convert it it working status
    When I click on "Leads"
    When I wait for 2 seconds
    When I click on "No Activity"
    When I click on "Total Leads"
    When I click on "<salutation> <first_name> <last_name>"
    When I click on "Change Status"
    When I select "<status>" from "Change Status"
    When I click on "Save"
    When I wait for 2 seconds
    Then I see "Lead Status" as "<status>"


    #change the lead owner to a specific user
    When I click on "Change Owner"
    When I enter "Sumit" in "Select New Owner"
    When I wait for 2 seconds
    When I click on "Sumit Gupta"
    When I click on "Submit"
    When I wait for 2 seconds
    When I click on "<salutation> <first_name> <last_name>"
    Then I see "Lead Owner" as "Sumit Gupta"

    #clean up leads after creation
    #  When I click on "Delete"
    #  When I click on "Delete"
    #  When I click on "Delete"

    Examples:
      | app_name      | app_items | salutation | lead_status | lead_source | first_name | last_name | company        | email                    | street      | city    | state | zip   | phone        | business_unit        | solution_interest         | provider_count | status  |
      | Sales Console | Leads     | Mr.        | New         | Email       | Sumit2     | Gupta2    | Automation LLC | sumit2.gupta@example.com | 123 Main St | Chicago | IL    | 60601 | 312-555-0100 | Healthcare Providers | Care Gap Closure Services | 20             | Working |




