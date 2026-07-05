@CaseCreation_Attachments
Feature: Case Creation with Attachment Handling in CE Portal
  As a user
  I want to create cases with attachments and verify attachment functionality
  So that I can ensure proper file handling in the CE Portal

  Background: Login to CE Portal
    Given I navigate to CE Portal ""
    When I click on "Log in"
    When I wait for 3 seconds
    When I enter "" in "CE_UserName"
    When I click on "Continue"
    When I enter "" in "CE_Password"
    When I click on "Continue"
    When I wait for 3 seconds


  @XSP-87 @regression
  Scenario: Verify option to remove attachment before submission
    When I click on "Support"
    When I wait for 5 seconds
    When I enter "Portal" in "Search for help"
    When I wait for 3 seconds
    When I click on "Create a Case"
    When I select "Payerpath Call" from "Select a Product"
    When I check "Approval to connect to server?"
    When I select "Meena's General Practice1" from "Select an Account"
    When I select "Partial loss of service" from "Impact"
    When I enter "Test remove attachment" in "Subject"
    When I enter "Testing remove attachment functionality" in "Description"
    When I select "Phone" from "How would you like to be contacted"
    When I enter "Testing attachment removal" in the "Protected Health Information Details" textarea
    When I upload "FileUpload_1.PNG" to "Upload Files"
    When I wait for 2 seconds
    When I click on "Done"
    When I wait for 2 seconds
    Then I should see "File(s) uploaded successfully."
    Then I should see "FileUpload_1.PNG"
    When I check "Contains PHI"
    When I click on the remove icon
    When I wait for 2 seconds
    Then I should not see "FileUpload_1.PNG"
    When I click on "Submit"
    When I wait for 10 seconds
    When I capture text from "Case Number" and store as "caseId"
    When I log captured "caseId"
    


  # @XSP-88 @regression
  # Scenario: Upload attachment marked as PHI
  #   When I click on "Support"
  #   When I wait for 5 seconds
  #   When I enter "Training" in "Search for help"
  #   When I wait for 3 seconds
  #   When I click on "Create a Case"
  #   When I select "Veradigm Academy" from "Select a Product"
  #   When I enter "Test PHI attachment" in "Subject"
  #   When I enter "Testing PHI marked attachment" in "Description"
  #   When I select "Customer Experience Portal" from "How would you like to be contacted"
  #   When I enter "This attachment contains PHI information" in the "Protected Health Information Details" textarea
  #   When I upload "FileUpload_1.PNG" to "Upload Files"
  #   When I wait for 2 seconds
  #   When I check "Mark as PHI" checkbox for uploaded file
  #   When I wait for 1 second
  #   Then I should see PHI indicator on uploaded file
  #   When I click on "Done"
  #   When I wait for 2 seconds
  #   When I click on "Submit"
  #   When I wait for 10 seconds
  #   When I capture text from "Case Number" and store as "caseId"
  #   When I log captured "caseId"
  #   Then I see "Status" as "New"

  # @XSP-89 @regression
  # Scenario: Verify Case PHI checkbox automatically updates
  #   When I click on "Support"
  #   When I wait for 5 seconds
  #   When I enter "Product" in "Search for help"
  #   When I wait for 3 seconds
  #   When I click on "Create a Case"
  #   When I select "Product Not Listed" from "Select a Product"
  #   When I select "Sumit Gupta Pediatrics" from "Select an Account"
  #   When I select "Normal performance with minor issue" from "Impact"
  #   When I enter "Test PHI checkbox auto-update" in "Subject"
  #   When I enter "Testing PHI checkbox behavior" in "Description"
  #   When I select "Phone" from "How would you like to be contacted"
  #   When I enter "PHI details entered here" in the "Protected Health Information Details" textarea
  #   When I wait for 2 seconds
  #   Then I should see "Case PHI" checkbox is checked
  #   When I upload "FileUpload_1.PNG" to "Upload Files"
  #   When I wait for 2 seconds
  #   When I check "Mark as PHI" checkbox for uploaded file
  #   When I wait for 1 second
  #   Then I should see "Case PHI" checkbox is checked
  #   When I click on "Done"
  #   When I wait for 2 seconds
  #   When I click on "Submit"
  #   When I wait for 10 seconds
  #   When I capture text from "Case Number" and store as "caseId"
  #   When I log captured "caseId"
  #   Then I see "Status" as "New"

  

  # @XSP-91 @regression
  # Scenario: Test attachment upload functionality in chat
  #   When I click on "Support"
  #   When I wait for 5 seconds
  #   When I enter "Portal" in "Search for help"
  #   When I wait for 3 seconds
  #   When I click on "Create a Case"
  #   When I select "Veradigm Practice Management" from "Select a Product"
  #   When I select "Meena's General Practice1" from "Select an Account"
  #   When I select "Partial loss of service" from "Impact"
  #   When I enter "Test chat attachment" in "Subject"
  #   When I enter "Testing attachment in chat" in "Description"
  #   When I select "Customer Experience Portal" from "How would you like to be contacted"
  #   When I enter "Chat attachment testing" in the "Protected Health Information Details" textarea
  #   When I click on "Submit"
  #   When I wait for 10 seconds
  #   When I capture text from "Case Number" and store as "caseId"
  #   When I log captured "caseId"
  #   # Open chat and upload attachment
  #   When I click on "Chat" icon
  #   When I wait for 3 seconds
  #   When I upload "FileUpload_1.PNG" to chat
  #   When I wait for 2 seconds
  #   Then I should see the uploaded file in chat
  #   When I send message "Attachment uploaded via chat" in chat
  #   When I wait for 3 seconds
  #   Then I should see chat message with attachment

  # @XSP-92 @regression
  # Scenario: Verify attachment handler processes files correctly
  #   When I click on "Support"
  #   When I wait for 5 seconds
  #   When I enter "Training" in "Search for help"
  #   When I wait for 3 seconds
  #   When I click on "Create a Case"
  #   When I select "Veradigm Academy" from "Select a Product"
  #   When I enter "Test file processing" in "Subject"
  #   When I enter "Testing attachment handler" in "Description"
  #   When I select "Phone" from "How would you like to be contacted"
  #   When I enter "File processing test" in the "Protected Health Information Details" textarea
  #   When I upload "FileUpload_1.PNG" to "Upload Files"
  #   When I wait for 3 seconds
  #   Then I should see file upload success indicator
  #   Then I should see file name "FileUpload_1.PNG"
  #   Then I should see file size displayed
  #   When I click on "Done"
  #   When I wait for 2 seconds
  #   When I click on "Submit"
  #   When I wait for 10 seconds
  #   When I capture text from "Case Number" and store as "caseId"
  #   When I log captured "caseId"
  #   Then I see "Status" as "New"

  # @XSP-93 @regression
  # Scenario: An attachment can be removed while creating the case
  #   When I click on "Support"
  #   When I wait for 5 seconds
  #   When I enter "Product" in "Search for help"
  #   When I wait for 3 seconds
  #   When I click on "Create a Case"
  #   When I select "Product Not Listed" from "Select a Product"
  #   When I select "Sumit Gupta Pediatrics" from "Select an Account"
  #   When I select "Normal performance with minor issue" from "Impact"
  #   When I enter "Test multiple attachment removal" in "Subject"
  #   When I enter "Testing removal of attachments" in "Description"
  #   When I select "Phone" from "How would you like to be contacted"
  #   When I enter "Multiple attachment removal test" in the "Protected Health Information Details" textarea
  #   When I upload "FileUpload_1.PNG" to "Upload Files"
  #   When I wait for 2 seconds
  #   Then I should see the uploaded file "FileUpload_1.PNG"
  #   When I upload "FileUpload_2.PNG" to "Upload Files"
  #   When I wait for 2 seconds
  #   Then I should see the uploaded file "FileUpload_2.PNG"
  #   When I click on "Remove" for file "FileUpload_1.PNG"
  #   When I wait for 2 seconds
  #   Then I should not see the uploaded file "FileUpload_1.PNG"
  #   Then I should see the uploaded file "FileUpload_2.PNG"
  #   When I click on "Done"
  #   When I wait for 2 seconds
  #   When I click on "Submit"
  #   When I wait for 10 seconds
  #   When I capture text from "Case Number" and store as "caseId"
  #   When I log captured "caseId"
  #   Then I see "Status" as "New"
