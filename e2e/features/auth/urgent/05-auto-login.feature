Feature: Auto-Login (Session Persistence)
  As a user with an active session
  I want to remain logged in when I return to the app
  So that I don't have to log in every time

  Background:
    Given I have an existing account with email "user@example.com"
    And I have previously logged in

  Scenario: Auto-login with valid session
    Given I have a valid session token stored
    When I navigate to the app
    Then I should see a loading indicator while the session is verified
    And I should be automatically logged in
    And I should be redirected to the match setup page
    And I should not see the login form
    And I should see my email in the header

  Scenario: Auto-login with saved match data
    Given I have a valid session token stored
    And I have a match in progress on hole 7
    When I navigate to the app
    Then I should see a loading indicator
    And I should be automatically logged in
    And my match data should be loaded from the database
    And I should see the "Resume Match" option

  Scenario: Auto-login fails with expired session
    Given I have an expired session token stored
    When I navigate to the app
    Then I should see a loading indicator briefly
    And I should be redirected to the login page
    And I should see a message "Session expired. Please log in again."
    And the session token should be cleared from storage

  Scenario: Auto-login fails with invalid session
    Given I have an invalid session token stored
    When I navigate to the app
    Then I should see a loading indicator briefly
    And I should be redirected to the login page
    And the session token should be cleared from storage
    And I should not see an intrusive error message

  Scenario: Auto-login with token refresh
    Given I have a session token that is about to expire
    When I navigate to the app
    Then the app should silently refresh the token
    And I should be automatically logged in
    And I should not notice any authentication process
    And the new token should be stored

  Scenario: Auto-login across multiple tabs
    Given I am logged in on tab 1
    When I open the app in a new tab (tab 2)
    Then tab 2 should automatically log me in using the same session
    And both tabs should show I am logged in
    And both tabs should have access to the same match data

  Scenario: Session persists after browser restart
    Given I logged in and closed the browser
    And the session was set to persist
    When I open the browser and navigate to the app
    Then I should be automatically logged in
    And I should see my match data if any exists

  Scenario: Session does not persist after manual logout
    Given I was logged in with auto-login
    When I click "Sign Out"
    And I close the browser
    And I reopen the browser and navigate to the app
    Then I should see the login page
    And I should not be automatically logged in
    And no session token should exist
