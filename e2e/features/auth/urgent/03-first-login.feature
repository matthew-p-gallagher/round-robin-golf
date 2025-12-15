Feature: First Login After Signup
  As a verified user
  I want to log in for the first time
  So that I can start using the app

  Background:
    Given I have signed up with email "newuser@example.com"
    And my email is verified
    And I have never logged in before
    And I am on the login page

  Scenario: Successful first login
    When I enter "newuser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Log In" button
    Then I should see a loading indicator
    And I should be redirected to the match setup page
    And I should see my email "newuser@example.com" in the header
    And I should see a "Sign Out" button
    And I should see the match setup screen with no saved match
    And I should see 4 empty player input fields
    And I should see a "Start Match" button

  Scenario: First login shows welcome message
    When I enter "newuser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Log In" button
    Then I should see a welcome message or onboarding tips
    And the message should acknowledge this is my first time

  Scenario: First login creates user database record
    When I enter "newuser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Log In" button
    Then a user_current_match record should be created in the database
    And the match_data field should be null or empty
    And the user_id should match my authenticated user ID

  Scenario: First login with unverified email blocked
    Given my email is not verified
    When I enter "newuser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Log In" button
    Then I should see an error or warning about email verification
    And I should not be logged in
    And I should see a "Resend verification email" option
