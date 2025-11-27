Feature: Password Reset Completion
  As a user who requested a password reset
  I want to set a new password
  So that I can access my account again

  Background:
    Given I have requested a password reset for "user@example.com"
    And I have received a password reset email

  Scenario: Access password reset form with valid token
    When I click the reset link in the email
    Then I should be redirected to the app
    And I should see a "Update Password" form
    And I should see a "New Password" field
    And I should see a "Confirm New Password" field
    And I should see an "Update Password" button
    And the form should not show my email (for security)
    And the token should be validated on page load

  Scenario: Successfully update password
    Given I am on the update password form with a valid token
    When I enter "NewSecurePass123!" in the new password field
    And I enter "NewSecurePass123!" in the confirm password field
    And I click the "Update Password" button
    Then I should see a loading indicator
    And I should see a success message "Password updated successfully!"
    And I should be automatically logged in
    Or I should be redirected to the login page with a success message
    And the old password should no longer work
    And the reset token should be invalidated

  Scenario: Password reset with expired token
    Given the reset token has expired
    When I click the reset link in the email
    Then I should be redirected to the app
    And I should see an error message "This password reset link has expired"
    And I should see a "Request new reset link" button
    And I should not see the password update form

  Scenario: Password reset with invalid token
    When I navigate to the app with an invalid or malformed reset token
    Then I should see an error message "Invalid password reset link"
    And I should see a link to request a new reset
    And I should not see the password update form

  Scenario: Password reset with already-used token
    Given I have already used this reset token to change my password
    When I click the same reset link again
    Then I should see an error message "This password reset link has already been used"
    And I should see a "Request new reset link" button
    And I should not see the password update form

  Scenario: Update password with mismatched passwords
    Given I am on the update password form with a valid token
    When I enter "NewSecurePass123!" in the new password field
    And I enter "DifferentPass456!" in the confirm password field
    And I click the "Update Password" button
    Then I should see an error message "Passwords do not match"
    And the form should not be submitted
    And the token should remain valid

  Scenario: Update password with weak password
    Given I am on the update password form with a valid token
    When I enter "123" in the new password field
    And I enter "123" in the confirm password field
    And I click the "Update Password" button
    Then I should see an error message "Password must be at least 6 characters long"
    And I should see password strength requirements
    And the form should not be submitted

  Scenario: Update password with password strength indicator
    Given I am on the update password form with a valid token
    When I start typing in the new password field
    Then I should see a password strength indicator
    And the indicator should update as I type
    And it should show weak/medium/strong states
    And it should provide helpful feedback like "Add a number" or "Use special characters"

  Scenario: Update password and auto-login
    Given I am on the update password form with a valid token
    When I successfully update my password to "NewSecurePass123!"
    Then I should be automatically logged in
    And I should be redirected to the match setup page
    And I should see my email in the header
    And a new session should be created

  Scenario: Request new reset link from expired token page
    Given I am on the expired token error page
    When I click the "Request new reset link" button
    Then I should be taken to the password reset request page
    And I should be able to enter my email
    And I should be able to request a new reset email

  Scenario: Empty password fields
    Given I am on the update password form with a valid token
    When I click the "Update Password" button without entering passwords
    Then I should see an error message "Please fill in all fields"
    And the form should not be submitted
