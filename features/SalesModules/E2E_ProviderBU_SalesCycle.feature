@E2E @provider @regression
Feature: E2E - Provider BU Sales Cycle (Lead to Closed Won)
  As a Veradigm sales team member
  I want to progress a Provider lead through the full sales lifecycle
  So that a qualified lead becomes a Closed Won opportunity with an active order and revenue schedule

  # ─────────────────────────────────────────────────────────────────
  # PHASE 1 — Login & App Verification
  # Covers: UAT_000_Login, UAT_023 (TC.0069)
  # ─────────────────────────────────────────────────────────────────

  @TC.E2E.001
  Scenario: E2E Provider BU Sales Cycle — Closed Won

    # -- Login --
    Given I navigate to Salesforce ""
    # When I enter "" in "SFQA_UserName"
    # When I enter "" in "SF_Password"
    # When I click on "Log In to Sandbox"
    # When I wait for 5 seconds
    Then I verify "Sales Console" is visible

    # -- Verify Sales Console navigation tabs --
    Then I verify "Leads" is visible
    Then I verify "Accounts" is visible
    Then I verify "Contacts" is visible
    Then I verify "Opportunities" is visible

  # ─────────────────────────────────────────────────────────────────
  # PHASE 2 — Marketing Creates a Lead
  # Covers: UAT_023 (TC.0070, TC.0071)
  # ─────────────────────────────────────────────────────────────────

    # -- Navigate to Leads and open New Lead form --
    When I click on "Show Navigation Menu"
    When I click on "Leads"
    When I wait for 2 seconds
    When I click on "New"
    When I wait for 2 seconds

    # -- Fill required Lead fields --
    When I select "Mr." from "Salutation"
    When I enter "Test" in "First Name"
    When I enter "ProviderE2E" in "Last Name"
    When I enter "Automation Test Practice" in "Company"
    When I enter "provider.e2e@automation.com" in "Email"
    When I enter "555-000-1234" in "Phone"
    When I select "Web" from "Lead Source"
    When I select "New" from "Lead Status"
    When I select "Provider" from "Business Unit of Interest"
    When I click on "Save"
    When I wait for 3 seconds
    Then I see "Lead" as "Mr. Test ProviderE2E"

  # ─────────────────────────────────────────────────────────────────
  # PHASE 3 — Assign Lead to Provider Queue
  # Covers: UAT_023 (TC.0072)
  # ─────────────────────────────────────────────────────────────────

    # -- Assign lead to Provider Queue --
    When I click on "Change Owner"
    When I click on "Queue"
    When I enter "Provider" in "Select New Owner"
    When I wait for 2 seconds
    When I click on "Provider Queue"
    When I click on "Submit"
    When I wait for 2 seconds
    Then I see "Lead Owner" as "Provider Queue"

  # ─────────────────────────────────────────────────────────────────
  # PHASE 4 — Sales Rep Accepts the Lead
  # Covers: UAT_027 (TC.0089)
  # ─────────────────────────────────────────────────────────────────

    # -- Navigate to Provider Leads list view --
    When I click on "Leads"
    When I wait for 2 seconds
    When I click on "Select a List View: Leads"
    When I click on "Provider"
    When I wait for 2 seconds

    # -- Open lead and accept it by changing owner to self --
    When I click on "Test ProviderE2E"
    When I wait for 2 seconds
    When I click on "Change Owner"
    When I enter "Sumit" in "Select New Owner"
    When I wait for 2 seconds
    When I click on "Sumit Gupta"
    When I click on "Submit"
    When I wait for 2 seconds
    Then I see "Lead Owner" as "Sumit Gupta"

  # ─────────────────────────────────────────────────────────────────
  # PHASE 5 — Work the Lead (fill required fields)
  # Covers: UAT_027 (TC.0090)
  # ─────────────────────────────────────────────────────────────────

    # -- Change status to Working and fill required fields --
    When I click on "Change Status"
    When I select "Working" from "Change Status"
    When I click on "Save"
    When I wait for 2 seconds
    Then I see "Lead Status" as "Working"

    When I click on "Edit"
    When I wait for 2 seconds
    When I enter "123 Test Street" in "Street"
    When I enter "Chicago" in "City"
    When I enter "IL" in "State/Province"
    When I enter "60601" in "Zip/Postal Code"
    When I click on "Save"
    When I wait for 2 seconds

  # ─────────────────────────────────────────────────────────────────
  # PHASE 6 — Qualify the Lead
  # Covers: UAT_027 (TC.0091)
  # ─────────────────────────────────────────────────────────────────

    When I click on "Change Status"
    When I select "Qualified" from "Change Status"
    When I click on "Save"
    When I wait for 2 seconds
    Then I see "Lead Status" as "Qualified"

  # ─────────────────────────────────────────────────────────────────
  # PHASE 7 — Convert Lead to Account, Contact & Opportunity
  # Covers: UAT_027 (TC.0092)
  # ─────────────────────────────────────────────────────────────────

    When I click on "Convert"
    When I wait for 3 seconds

    # -- Name opportunity per Veradigm naming convention --
    When I enter "Automation Test Practice - Provider E2E" in "Opportunity Name"
    When I click on "Convert"
    When I wait for 5 seconds

    # -- Verify conversion created Account, Contact and Opportunity --
    Then I verify "Your lead has been converted" is visible
    Then I verify "Automation Test Practice" is visible
    Then I verify "Test ProviderE2E" is visible
    Then I verify "Automation Test Practice - Provider E2E" is visible

    # -- Navigate to the converted Opportunity --
    When I click on "Automation Test Practice - Provider E2E"
    When I wait for 3 seconds

  # ─────────────────────────────────────────────────────────────────
  # PHASE 8 — Work the Opportunity (fill required fields)
  # Covers: UAT_028 (TC.0093)
  # ─────────────────────────────────────────────────────────────────

    When I click on "Edit"
    When I wait for 2 seconds
    When I select "New Business" from "Type"
    When I enter "12/31/2026" in "Close Date"
    When I select "Commit" from "Forecast Category"
    When I enter "06/18/2026" in "SOW Sent Date"
    When I select "Q2" from "Sales Commit Period"
    When I enter "Contract Review" in "Next Step"
    When I select "Relationship" from "Primary Win Reason"
    When I click on "Save"
    When I wait for 2 seconds

  # ─────────────────────────────────────────────────────────────────
  # PHASE 9 — Move to Sales Won with Sub-Stage In QA Queue
  # Covers: UAT_028 (TC.0095, TC.0096)
  # ─────────────────────────────────────────────────────────────────

    When I click on "Edit"
    When I wait for 2 seconds
    When I select "Sales Won" from "Stage"
    When I select "In QA Queue" from "Sub-Stage"
    When I click on "Save"
    When I wait for 3 seconds
    Then I see "Stage" as "Sales Won"
    Then I see "Sub-Stage" as "In QA Queue"

    # -- Verify QA Review Case is created and visible --
    Then I verify "QA Review" is visible

  # ─────────────────────────────────────────────────────────────────
  # PHASE 10 — Update Sales QA Entered Date
  # Covers: UAT_028 (TC.0098)
  # ─────────────────────────────────────────────────────────────────

    When I click on "Edit"
    When I wait for 2 seconds
    When I enter "06/18/2026" in "Sales QA Entered Date"
    When I click on "Save"
    When I wait for 2 seconds
    Then I see "Sales QA Entered Date" as "06/18/2026"

  # ─────────────────────────────────────────────────────────────────
  # PHASE 11 — Close Won & Verify Order Created
  # Covers: UAT_028 (TC.0099)
  # ─────────────────────────────────────────────────────────────────

    When I click on "Closed" on the Opportunity Path
    When I wait for 2 seconds
    When I select "Closed Won" from "Stage"
    When I click on "Save"
    When I wait for 3 seconds
    Then I see "Stage" as "Closed Won"

    # -- Verify Order is visible in Related List Quick Links --
    Then I verify "Orders" is visible

  # ─────────────────────────────────────────────────────────────────
  # PHASE 12 — Activate Order and Verify Account Products
  # Covers: UAT_030 (TC.0101)
  # ─────────────────────────────────────────────────────────────────

    # -- Navigate to Order and activate it --
    When I click on "Orders"
    When I wait for 2 seconds
    When I click on "Select Item 1"
    When I wait for 2 seconds
    When I click on "Activate"
    When I click on "OK"
    When I wait for 3 seconds
    Then I see "Status" as "Activated"

    # -- Navigate back to Opportunity and verify Account Products --
    When I click on "Automation Test Practice - Provider E2E"
    When I wait for 2 seconds
    Then I verify "Account Products" is visible

  # ─────────────────────────────────────────────────────────────────
  # PHASE 13 — Create Quote and Revenue Schedule
  # Covers: UAT_038 (TC.0141, TC.0142, TC.0143, TC.0145, TC.0147)
  # ─────────────────────────────────────────────────────────────────

    # -- Create a new Primary Quote on the Opportunity --
    When I click on "New Quote"
    When I wait for 3 seconds
    Then I verify "Account" is visible
    Then I verify "Automation Test Practice - Provider E2E" is visible

    When I click on "Primary"
    When I enter "06/18/2026" in "Start Date"
    When I enter "12" in "Subscription Term"
    When I click on "Save"
    When I wait for 3 seconds

    # -- Add Products to the Quote --
    When I click on "Add Products"
    When I wait for 3 seconds
    Then I verify "Product Filter" is visible

    When I click on "Select Item 1"
    When I click on "Select"
    When I wait for 2 seconds
    When I enter "1" in "Quantity"
    When I enter "5000" in "Unit Price"
    When I click on "Calculate"
    When I click on "Save"
    When I wait for 3 seconds

    # -- Verify Revenue Schedules on Opportunity Product --
    When I click on "Automation Test Practice - Provider E2E"
    When I wait for 2 seconds
    When I click on "Related"
    When I wait for 2 seconds
    When I click on "Select Item 1" in "Products"
    When I wait for 2 seconds
    When I click on "Related"
    When I wait for 2 seconds
    Then I verify "Revenue Schedules" is visible


  # ─────────────────────────────────────────────────────────────────
  # ALTERNATE PATH — Provider Opp Closed Lost
  # Covers: UAT_029 (TC.0100)
  # ─────────────────────────────────────────────────────────────────

  @TC.E2E.002
  Scenario: E2E Provider BU Sales Cycle — Closed Lost

    # -- Login --
    Given I navigate to Salesforce ""
    # When I enter "" in "SFQA_UserName"
    # When I enter "" in "SF_Password"
    # When I click on "Log In to Sandbox"
    # When I wait for 5 seconds

    # -- Navigate to an existing open Provider Opportunity --
    When I click on "Show Navigation Menu"
    When I click on "Opportunities"
    When I wait for 2 seconds
    When I click on "Select a List View: Opportunities"
    When I click on "My Open Opportunities"
    When I wait for 2 seconds
    When I click on "Select Item 1"
    When I wait for 3 seconds

    # -- Fill minimum required fields before closing lost --
    When I click on "Edit"
    When I wait for 2 seconds
    When I select "Closed Lost" from "Stage"
    When I select "Lost to Competitor" from "Sub-Status"
    When I enter "Competitor Name" in "Competitor"
    When I click on "Save"
    When I wait for 3 seconds
    Then I see "Stage" as "Closed Lost"
    Then I see "Sub-Status" as "Lost to Competitor"

    # -- Verify Opp is removed from active pipeline views --
    When I click on "Opportunities"
    When I wait for 2 seconds
    When I click on "Select a List View: Opportunities"
    When I click on "My Open Opportunities"
    When I wait for 2 seconds
    Then I verify "Select Item 1" is not visible
