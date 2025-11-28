Feature: Repeat Login (Returning User)
  As a returning user
  I want to log in to my account
  So that I can access my saved matches

  Background:
    Given I have an existing account with email "returninguser@example.com"
    And my email is verified
    And I have logged in before
    And I am on the login page

  Scenario: Successful login with no saved match
    Given I have no saved match data
    When I enter "returninguser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Sign In" button
    Then I should see a loading indicator
    And I should be redirected to the match setup page
    And I should see my email in the header
    And I should see a clean match setup screen
    And I should not see a "Resume Match" button

  Scenario: Successful login with saved match
    Given I have a match in progress saved to the database
    And the match is on hole 5
    When I enter "returninguser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Sign In" button
    Then I should see a loading indicator while match data is fetched
    And I should be redirected to the match setup page
    And I should see my email in the header
    And I should see a "Resume Match" button
    And I should see a "Start New Match" button
    And the resume button should indicate the saved match state

  Scenario: Login and resume saved match
    Given I have a match in progress on hole 5
    When I successfully log in
    And I click the "Resume Match" button
    Then I should be taken to the hole scoring screen
    And I should be on hole 5
    And all previous hole scores should be loaded
    And the player names should match my saved match

  Scenario: Login and start new match (overwrite saved)
    Given I have a match in progress on hole 5
    When I successfully log in
    And I click the "Start New Match" button
    Then I should see a confirmation dialog "This will replace your current match. Continue?"
    When I confirm the action
    Then I should see the match setup form
    And the saved match should be cleared from the database

  Scenario: Login with remember me (pre-filled email)
    Given I previously logged in on this device
    And I checked "Remember me" or the browser saved my email
    When I navigate to the login page
    Then the email field should be pre-filled with "returninguser@example.com"
    And the password field should be empty
    And I should be able to just enter my password and submit

  Scenario: Login shows welcome back message
    When I enter "returninguser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Sign In" button
    Then I should see a "Welcome back" message
    And I should see when I last accessed the app (if tracked)
