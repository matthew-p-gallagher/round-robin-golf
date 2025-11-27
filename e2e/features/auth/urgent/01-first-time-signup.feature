Feature: First-Time Signup
  As a new user
  I want to create an account
  So that I can start tracking my golf matches

  Background:
    Given I am not logged in
    And I am on the login page

  Scenario: Successful signup with valid credentials
    When I click the "Sign up" link
    Then I should see the signup form
    When I enter "newuser@example.com" in the email field
    And I enter "SecurePass123!" in the password field
    And I enter "SecurePass123!" in the confirm password field
    And I click the "Create Account" button
    Then I should see a loading indicator
    And I should see a success message "Account created! Please check your email to verify your account."
    And I should remain on the signup success screen

  Scenario: Signup with email already in use
    Given an account exists with email "existing@example.com"
    When I click the "Sign up" link
    And I enter "existing@example.com" in the email field
    And I enter "SecurePass123!" in the password field
    And I enter "SecurePass123!" in the confirm password field
    And I click the "Create Account" button
    Then I should see an error message containing "already registered" or "already exists"
    And I should see a link to the login page
    And the email field should still contain "existing@example.com"

  Scenario: Signup with mismatched passwords
    When I click the "Sign up" link
    And I enter "newuser@example.com" in the email field
    And I enter "SecurePass123!" in the password field
    And I enter "DifferentPass456!" in the confirm password field
    And I click the "Create Account" button
    Then I should see an error message "Passwords do not match"
    And the form should not be submitted
    And I should remain on the signup form

  Scenario: Signup with weak password
    When I click the "Sign up" link
    And I enter "newuser@example.com" in the email field
    And I enter "123" in the password field
    And I enter "123" in the confirm password field
    And I click the "Create Account" button
    Then I should see an error message "Password must be at least 6 characters long"
    And the form should not be submitted

  Scenario: Signup with empty fields
    When I click the "Sign up" link
    And I click the "Create Account" button
    Then I should see an error message "Please fill in all fields"
    And the form should not be submitted

  Scenario: Signup with invalid email format
    When I click the "Sign up" link
    And I enter "notanemail" in the email field
    And I enter "SecurePass123!" in the password field
    And I enter "SecurePass123!" in the confirm password field
    And I click the "Create Account" button
    Then the browser should show native email validation error
    And the form should not be submitted

  Scenario: Return to login from signup
    When I click the "Sign up" link
    Then I should see the signup form
    When I click the "Sign in" link
    Then I should see the login form
    And all form fields should be empty
