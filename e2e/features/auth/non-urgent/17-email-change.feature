Feature: Email Change (Future Enhancement)
  As a user who wants to update my email
  I want to change my account email address
  So that I can use my current email

  Background:
    Given I am logged in as "olduser@example.com"
    And I am on the account settings page

  Scenario: Initiate email change
    When I click "Change Email"
    Then I should see a form to update my email
    And I should see a field for "New Email Address"
    And I should see a field for "Current Password" (for verification)
    And I should see an "Update Email" button

  Scenario: Successfully change email
    Given I am on the change email form
    When I enter "newuser@example.com" in the new email field
    And I enter my current password for verification
    And I click "Update Email"
    Then I should see a loading indicator
    And I should see a message "Verification email sent to newuser@example.com"
    And I should see instructions "Click the link to confirm your new email"
    And a verification email should be sent to "newuser@example.com"
    And my email should not change yet (pending verification)

  Scenario: Verify new email address
    Given I initiated an email change to "newuser@example.com"
    And I received a verification email
    When I click the verification link in the email
    Then I should be redirected to the app
    And I should see a success message "Email updated successfully!"
    And my account email should now be "newuser@example.com"
    And I should be automatically logged in
    And the old email "olduser@example.com" should no longer work

  Scenario: Security notification to old email
    Given I successfully changed my email to "newuser@example.com"
    Then a notification email should be sent to "olduser@example.com"
    And the email should say "Your account email was changed to newuser@example.com"
    And the email should provide a way to revert if this was unauthorized
    And the email should include a link to contact support

  Scenario: Email change with wrong password
    Given I am on the change email form
    When I enter "newuser@example.com" in the new email field
    And I enter an incorrect password
    And I click "Update Email"
    Then I should see an error "Incorrect password"
    And the email should not be changed
    And no verification email should be sent

  Scenario: Email change to existing account email
    Given another account exists with "taken@example.com"
    When I try to change my email to "taken@example.com"
    And I enter my correct password
    And I click "Update Email"
    Then I should see an error "This email is already in use"
    And the email change should not proceed

  Scenario: Email change verification expires
    Given I initiated an email change to "newuser@example.com"
    And the verification token has expired
    When I click the verification link
    Then I should see an error "Email verification link has expired"
    And my email should remain "olduser@example.com"
    And I should see an option to request a new verification email

  Scenario: Cancel email change
    Given I initiated an email change to "newuser@example.com"
    And I haven't verified it yet
    When I go to account settings
    Then I should see a "Cancel Email Change" option
    When I click "Cancel Email Change"
    Then the pending email change should be cancelled
    And my email should remain "olduser@example.com"
    And the verification link should be invalidated

  Scenario: Rollback unauthorized email change
    Given my email was changed to "hacker@example.com" without my authorization
    And I received a security notification at "olduser@example.com"
    When I click "I didn't make this change" in the email
    Then I should be taken to a security recovery page
    And I should be able to revert the email change
    And I should be prompted to change my password
    And the account should be secured
