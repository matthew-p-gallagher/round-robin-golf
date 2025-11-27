Feature: Account Deletion (Future Enhancement)
  As a user who no longer wants to use the app
  I want to delete my account
  So that my data is removed

  Background:
    Given I am logged in as "user@example.com"
    And I am on the account settings page

  Scenario: Access account deletion option
    When I navigate to account settings
    Then I should see a "Delete Account" button or link
    And it should be in a clearly marked "Danger Zone" section
    And it should have a warning color (red)

  Scenario: Initiate account deletion
    When I click "Delete Account"
    Then I should see a confirmation dialog
    And the dialog should have a strong warning "This action cannot be undone"
    And it should list what will be deleted:
      """
      - Your profile and login credentials
      - All saved matches and match history
      - All associated data
      """
    And it should have a password verification field
    And it should have a final "Delete My Account" button
    And it should have a "Cancel" option

  Scenario: Cancel account deletion
    Given I am in the account deletion confirmation dialog
    When I click "Cancel"
    Then the dialog should close
    And I should remain on the account settings page
    And my account should remain active
    And no changes should be made

  Scenario: Confirm account deletion with password
    Given I am in the account deletion confirmation dialog
    When I enter my password in the verification field
    And I click "Delete My Account"
    Then I should see a final confirmation "Are you absolutely sure?"
    When I confirm again
    Then I should see a loading indicator
    And my account should be marked for deletion
    And I should be signed out
    And I should be redirected to a "Account Deleted" page

  Scenario: Account deletion with wrong password
    Given I am in the account deletion confirmation dialog
    When I enter an incorrect password
    And I click "Delete My Account"
    Then I should see an error "Incorrect password"
    And the account should not be deleted
    And I should remain logged in

  Scenario: Data removal after deletion
    Given my account has been deleted
    Then my user record should be removed from the database
    And my match data should be removed from user_current_match table
    And my authentication credentials should be removed
    And I should not be able to log in with my old credentials

  Scenario: Grace period for account recovery
    Given I deleted my account
    And the app has a 30-day grace period policy
    When I try to log in within 30 days
    Then I should see an option to "Restore Account"
    When I click "Restore Account"
    And I verify my identity
    Then my account should be restored
    And all my data should be recovered
    And I should be logged in

  Scenario: Permanent deletion after grace period
    Given I deleted my account 31 days ago
    When I try to log in
    Then I should see an error "Account not found"
    And I should not have an option to restore
    And I should be able to sign up again with the same email as a new account

  Scenario: Email confirmation of deletion
    Given I just deleted my account
    Then I should receive a confirmation email at "user@example.com"
    And the email should confirm the deletion
    And the email should mention the grace period if applicable
    And the email should provide a support contact for questions

  Scenario: Download data before deletion
    Given I am about to delete my account
    When I am on the account settings page
    Then I should see a "Download My Data" option
    When I click it
    Then I should be able to download a JSON or CSV file with my data
    And the file should include all my match history
    And I should be encouraged to download before deleting

  Scenario: Account deletion with active session on other devices
    Given I am logged in on device A and device B
    When I delete my account on device A
    Then device A should be logged out
    And I should see the "Account Deleted" page
    When I perform an action on device B
    Then device B should detect the account no longer exists
    And device B should be logged out
    And device B should show an appropriate message
