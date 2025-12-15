Feature: Email Verification
  As a user who just signed up
  I want to verify my email address
  So that I can access my account

  Background:
    Given I have signed up with email "newuser@example.com"
    And I have not yet verified my email

  Scenario: Successful email verification
    Given I receive a verification email
    When I click the verification link in the email
    Then I should be redirected to the app
    And I should see a success message "Email verified successfully"
    And I should be redirected to the login page
    And the email field should be pre-filled with "newuser@example.com"

  Scenario: Email verification with expired token
    Given I receive a verification email
    And the verification token has expired
    When I click the verification link in the email
    Then I should be redirected to the app
    And I should see an error message "Verification link has expired"
    And I should see a "Resend verification email" button
    And I should see a link to the login page

  Scenario: Email verification with invalid token
    When I navigate to the app with an invalid verification token
    Then I should see an error message "Invalid verification link"
    And I should see a link to the login page
    And I should see a "Request new verification email" option

  Scenario: Email verification for already verified account
    Given my email is already verified
    And I receive a verification email
    When I click the verification link in the email
    Then I should be redirected to the app
    And I should see a message "Email already verified"
    And I should be redirected to the login page

  Scenario: Resend verification email
    Given I am on the verification help page
    When I enter "newuser@example.com" in the email field
    And I click the "Resend verification email" button
    Then I should see a success message "Verification email sent! Check your inbox"
    And I should see a reminder to check my spam folder
    And the "Resend" button should be disabled for 60 seconds

  Scenario: Login attempt with unverified email
    Given my email is not verified
    When I navigate to the login page
    And I enter "newuser@example.com" in the email field
    And I enter my password in the password field
    And I click the "Log In" button
    Then I should see a warning message "Please verify your email address"
    And I should see a "Resend verification email" link
    And I should not be logged in
