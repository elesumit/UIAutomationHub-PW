@CaseCreation_KA
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
    When I enter "<SearchText>" in "Search for help"
    When I wait for 3 seconds
    Then I should see "<KnowledgeArticle>"
    When I click on "<KnowledgeArticle>"
    When I switch to new tab
    When I wait for 3 seconds
    When I click on "Submit Support Case"
    When I wait for 5 seconds
    Then I should see "Select a Product"
    When I select "<Product>" from "Select a Product"
    When I select "<Account>" from "Select an Account"
    When I select "<Impact>" from "Impact"
    # When I enter "<Subject>" in "Subject"
    When I enter "<Description>" in "Description"
    When I select "<ContactMethod>" from "How would you like to be contacted"
    When I enter "Case creation testing - <Product> - <Impact>" in the "Protected Health Information Details" textarea
    When I upload "FileUpload_1.PNG" to "Upload Files"
    When I wait for 2 seconds
    When I click on "Done"
    When I wait for 2 seconds
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId1"
    When I log captured "caseId1"
    Then I see "Priority" as "High"

    Examples:
      | SearchText | KnowledgeArticle       | Product                                               | Account                | Impact                  | Description                      | ContactMethod |
      | Login      | I need help logging in | Veradigm Fiscal Management and Supply Chain Solutions | Sumit Gupta Pediatrics | Partial loss of service | Test12 Not able to access Portal | Phone         |

