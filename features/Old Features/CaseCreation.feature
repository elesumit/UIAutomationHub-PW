@CaseCreation_3
Feature: Create Case in CE Portal and verify in Salesforce
  As a user
  I want to create a case in the CE Portal
  So that I can verify it in Salesforce

  Background: Login to CE Portal
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds

  @BTC-181
  Scenario Outline: Create Case and validate in Portal
    # Case creation
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "<SearchText>" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "<SelectProduct>" from "Select a Product"
    When I select "<SelectAccount>" from "Select an Account"
    When I select "<Impact>" from "Impact"
    When I enter "<Subject>" in "Subject"
    When I enter "<Description>" in "Description"
    When I select "<ContactMethod>" from "How would you like to be contacted"
    When I enter "Case creation testing" in the "Protected Health Information Details" textarea
    When I upload "FileUpload_1.PNG" to "Upload Files"
    When I wait for 2 seconds
    When I click on "Done"
    When I wait for 2 seconds
    When I click on "Submit"
    When I wait for 10 seconds
    #capture the case details
    When I capture text from "Case Number" and store as "caseId"
    When I log captured "caseId"
    Then I see "Status" as "New"
    Then I see "Priority" as "<Priority>"

    Examples:
      | SearchText | SelectProduct                                         | SelectAccount             | Impact                              | Subject            | Description                    | ContactMethod              | Priority |
      | Login      | Veradigm Fiscal Management and Supply Chain Solutions | Sumit Gupta Pediatrics    | Complete loss of service            | Not able to login  | User is not able to login      | Customer Experience Portal | Critical |
      | Portal     | Payerpath Call                                        | Meena's General Practice1 | Partial loss of service             | Report not working | Not able to see the reports    | Phone                      | High     |
      | Training   | Veradigm Academy                                      | Sumit Gupta Pediatrics    | Normal performance with minor issue | User training      | How to create a case in portal | Customer Experience Portal | Medium   |
      | Product    | Product Not Listed                                    | Sumit Gupta Pediatrics    | Normal performance with minor issue | List the product   | Not able to find my product    | Phone                      | Low      |
