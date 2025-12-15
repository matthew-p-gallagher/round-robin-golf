Feature: Wrong Password Handling
  As a user who entered the wrong password
  I want clear feedback and recovery options
  So that I can successfully log in

  Background:
    Given I have an existing account with email "user@example.com"
    And my correct password is "CorrectPass123!"
    And I am on the login page

  Scenario: Single wrong password attempt
    When I enter "user@example.com" in the email field
    And I enter "WrongPassword" in the password field
    And I click the "Log In" button
    Then I should see a loading indicator
    And I should see an error message "Invalid login credentials"
    And the error should not reveal whether email or password was wrong
    And I should remain on the login page
    And the email field should still contain "user@example.com"
    And the password field should be cleared
    And I should see the "Forgot your password?" link highlighted or emphasized

  Scenario: Multiple wrong password attempts
    When I enter "user@example.com" in the email field
    And I enter "WrongPassword1" in the password field
    And I click the "Log In" button
    Then I should see an error message
    When I enter "WrongPassword2" in the password field
    And I click the "Log In" button
    Then I should see an error message
    When I enter "WrongPassword3" in the password field
    And I click the "Log In" button
    Then I should see an error message
    And I should see a more prominent "Forgot your password?" link
    And I may see a suggestion "Having trouble logging in?"

  Scenario: Wrong password with rate limiting
    Given I have exceeded the maximum login attempts
    When I enter "user@example.com" in the email field
    And I enter any password in the password field
    And I click the "Log In" button
    Then I should see an error message "Too many login attempts. Please try again later."
    And the login button should be disabled temporarily
    And I should see a countdown or time until I can retry
    And I should still have access to the "Forgot password?" link

  Scenario: Wrong password followed by forgot password
    When I enter "user@example.com" in the email field
    And I enter "WrongPassword" in the password field
    And I click the "Log In" button
    Then I should see an error message
    When I click the "Forgot your password?" link
    Then I should be taken to the password reset page
    And the email field should be pre-filled with "user@example.com"

  Scenario: Wrong password with non-existent email
    When I enter "nonexistent@example.com" in the email field
    And I enter "SomePassword" in the password field
    And I click the "Log In" button
    Then I should see a generic error message "Invalid login credentials"
    And the error should not reveal that the email doesn't exist
    And I should remain on the login page

  Scenario: Correct email with empty password
    When I enter "user@example.com" in the email field
    And I leave the password field empty
    And I click the "Log In" button
    Then I should see an error message "Please fill in all fields"
    And the form should not be submitted to the server
    And I should remain on the login page
