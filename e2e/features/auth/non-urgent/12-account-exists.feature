Feature: Account Already Exists
  As a user trying to sign up with an existing email
  I want helpful guidance to access my account
  So that I don't get frustrated

  Background:
    Given an account already exists with email "existing@example.com"

  Scenario: Signup with email that already exists
    Given I am on the signup page
    When I enter "existing@example.com" in the email field
    And I enter "NewPassword123!" in the password fields
    And I click "Create Account"
    Then I should see an error message "An account with this email already exists"
    And I should see a suggestion "Already have an account?"
    And I should see a link or button to "Go to Sign In"

  Scenario: Quick navigation to login from account exists error
    Given I am on the signup page
    And I see the "account already exists" error
    When I click the "Go to Sign In" link
    Then I should be taken to the login page
    And the email field should be pre-filled with "existing@example.com"
    And the password field should be empty and focused

  Scenario: Account exists with forgot password option
    Given I am on the signup page
    And I see the "account already exists" error
    Then I should also see a "Forgot your password?" link
    When I click the "Forgot your password?" link
    Then I should be taken to the password reset page
    And the email field should be pre-filled with "existing@example.com"

  Scenario: Generic error message (security consideration)
    Given I am on the signup page
    When I enter "existing@example.com" in the email field
    And I click "Create Account"
    Then the error message should not reveal too much detail
    And it should balance user experience with security
    And it should not say "This email is registered" in a way that aids user enumeration

  Scenario: Retry signup with different email after account exists error
    Given I am on the signup page
    And I see the "account already exists" error for "existing@example.com"
    When I change the email to "newemail@example.com"
    And I click "Create Account"
    Then the error should clear
    And the signup should proceed normally if the new email is available

  Scenario: Social proof for account exists
    Given I am on the signup page
    And I see the "account already exists" error
    Then the message should be friendly and helpful
    And it should say something like "Good news - you already have an account!"
    And it should guide me toward logging in
