Feature: Forgot Password (Initiate Reset)
  As a user who forgot my password
  I want to request a password reset
  So that I can regain access to my account

  Background:
    Given I am on the login page

  Scenario: Access password reset from login page
    When I click the "Forgot your password?" link
    Then I should be taken to the password reset page
    And I should see a title "Reset Password"
    And I should see instructions "Enter your email to receive a password reset link"
    And I should see an email input field
    And I should see a "Send Reset Link" button
    And I should see a "Back to Log In" link

  Scenario: Successful password reset request
    Given I am on the password reset page
    When I enter "user@example.com" in the email field
    And I click the "Send Reset Link" button
    Then I should see a loading indicator
    And I should see a success message "Password reset email sent! Check your inbox."
    And I should see a reminder to check my spam folder
    And I should see a "Back to Log In" button
    And a password reset email should be sent to "user@example.com"
    And the email should contain a reset link with a token

  Scenario: Password reset request with non-existent email
    Given I am on the password reset page
    When I enter "nonexistent@example.com" in the email field
    And I click the "Send Reset Link" button
    Then I should see a loading indicator
    And I should see the same success message "Password reset email sent! Check your inbox."
    And the response should not reveal that the email doesn't exist
    And no email should actually be sent

  Scenario: Password reset request with invalid email format
    Given I am on the password reset page
    When I enter "notanemail" in the email field
    And I click the "Send Reset Link" button
    Then the browser should show native email validation error
    And the form should not be submitted

  Scenario: Password reset request with empty email
    Given I am on the password reset page
    When I click the "Send Reset Link" button without entering an email
    Then I should see an error message "Please enter your email address"
    And the form should not be submitted

  Scenario: Return to login from password reset
    Given I am on the password reset page
    When I click the "Back to Log In" link
    Then I should be taken to the login page
    And all form fields should be cleared

  Scenario: Password reset request rate limiting
    Given I am on the password reset page
    And I have just requested a password reset for "user@example.com"
    When I enter "user@example.com" again
    And I click the "Send Reset Link" button immediately
    Then I should see an error message "Please wait before requesting another reset email"
    Or the button should be disabled with a countdown
    And I should not receive another email

  Scenario: Multiple password reset requests
    Given I am on the password reset page
    When I request a password reset for "user@example.com"
    And I wait 60 seconds
    And I request another password reset for "user@example.com"
    Then both reset emails should be sent
    But only the most recent token should be valid
    And the first token should be invalidated

  Scenario: Password reset email content
    Given I have requested a password reset for "user@example.com"
    When I receive the password reset email
    Then the email should contain a clear call-to-action button or link
    And the email should explain what action was requested
    And the email should state when the link expires (e.g., "valid for 1 hour")
    And the email should provide a way to contact support if I didn't request this
    And the reset link should point to the correct app URL
