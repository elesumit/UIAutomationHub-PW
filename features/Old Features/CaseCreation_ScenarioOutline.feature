@CaseCreation_Outline
Feature: Create Cases with Different Product and Impact Combinations
  As a user
  I want to create cases with different product and impact selections
  So that I can validate case creation across various scenarios

  Background: Login to CE Portal
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds

  @BTC-84
  Scenario Outline: Create case with <Product> and <Impact>
    # Create Case
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "<Product>" from "Select a Product"
    When I select "<Account>" from "Select an Account"
    When I select "<Impact>" from "Impact"
    When I enter "<Subject>" in "Subject"
    When I enter "<Description>" in "Description"
    When I select "<ContactMethod>" from "How would you like to be contacted"
    When I enter "Case creation testing - <Product> - <Impact>" in the "Protected Health Information Details" textarea
    When I upload "FileUpload_1.PNG" to "Upload Files"
    When I wait for 2 seconds
    When I click on "Done"
    When I wait for 2 seconds
    When I click on "Submit"
    When I wait for 10 seconds
    
    # Capture Case Number
    When I capture text from "Case Number" and store as "caseId"
    When I log captured "caseId"

    Examples:
      | Product                                                   | Account                | Impact                              | Subject                                      | Description                                  | ContactMethod              |
      | Veradigm Fiscal Management and Supply Chain Solutions     | Sejal Nagpal - Customer| Complete loss of service            | Test - Complete service outage               | Complete loss of service issue               | Phone                      |
      | Veradigm Practice Management                              | Sejal Nagpal - Customer| Partial loss of service             | Test - Partial degradation                   | Partial loss of service issue                | Customer Experience Portal |
      | Veradigm Academy                                          | Sejal Nagpal - Customer| Service performance degradation     | Test - Performance issues                    | Performance degradation issue                | Phone                      |
      | Product Not Listed                                        | Sejal Nagpal - Customer| Normal performance with minor issue | Test - Minor issue                           | Minor performance issue                      | Customer Experience Portal |
      | Veradigm Fiscal Management and Supply Chain Solutions     | Sejal Nagpal - Customer| Training/How-To                     | Test - Training request                      | Need training on feature                     | Phone                      |
      | Veradigm Practice Management                              | Sejal Nagpal - Customer| General Inquiry                     | Test - General question                      | General inquiry about product                | Customer Experience Portal |
      | Veradigm Academy                                          | Sejal Nagpal - Customer| Partial loss of service             | Test - Academy partial issue                 | Academy partial service issue                | Phone                      |
      | Product Not Listed                                        | Sejal Nagpal - Customer| Complete loss of service            | Test - Product not listed critical           | Product not listed complete outage           | Customer Experience Portal |
      | Veradigm Fiscal Management and Supply Chain Solutions     | Sejal Nagpal - Customer| Normal performance with minor issue | Test - Fiscal Management minor               | Fiscal Management minor issue                | Phone                      |
      | Veradigm Practice Management                              | Sejal Nagpal - Customer| Service performance degradation     | Test - Practice Management slow              | Practice Management performance issue        | Customer Experience Portal |
