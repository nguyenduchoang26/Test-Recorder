Feature: MyDrive Select Application Navigation
  As a user of the MyDrive Select application
  I want to navigate through the initial setup and template selection
  So that I can create a new drive project

  Scenario: Accept cookies and select a project template
    # Step 1: Accept cookies banner
    When I click the "ACCEPT ALL" button on the cookie banner
    Then the cookie banner should disappear

    # Step 2: Accept consent dialog
    When I click the "ACCEPT" button on the consent dialog
    Then the consent dialog should disappear

    # Step 3: Initialize project creation page
    When I click the "CREATE PROJECT" button on the home page
    Then the project creation page should be shown

    # Step 4: Input project name
    When I input "Demo Project" as project name
    Then the project name should be set correctly

    # Step 5: Select project unit system
    When I click the unit system dropdown
    And I select "Metric" from the dropdown
    Then the unit system should be set to "Metric"

    # Step 6: Select a specific System Type
    When I click on the System Modules template image
    Then the selected System Modules template should be highlighted
    And I should be able to proceed with the project creation

    # Step 7: Configure Supply Grid
    When I click the voltage input field
    And I input 690 as the suppy grid voltage value
    Then the voltage value should be set correctly
    And I should be able to proceed with the project creation

    # Step 8: Select Application template
    When I click "Processing Constant Power (CP) as the application template
    Then the selected application template should be highlighted
    And I should be able to proceed with the project creation

    # Step 9: Create Project
    When I click the "Create" button
    Then a project should be created
    And all configured information should be saved correctly
