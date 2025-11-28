Feature: Sign Out
  As a logged-in user
  I want to sign out of my account
  So that my account is secure when I'm done

  Background:
    Given I am logged in as "user@example.com"
    And I am on the match setup page

  Scenario: Successful sign out with no match in progress
    Given I have no match in progress
    When I click the "Sign Out" button
    Then I should see a brief loading indicator
    And I should be redirected to the login page
    And I should not see my email in any header
    And my session token should be cleared
    And I should not be able to access protected pages

  Scenario: Sign out with match in progress shows confirmation
    Given I have a match in progress on hole 8
    When I click the "Sign Out" button
    Then I should see a confirmation dialog "Your match will be saved. Sign out?"
    When I click "Cancel"
    Then I should remain on the current page
    And I should still be logged in
    When I click the "Sign Out" button again
    And I click "Sign Out" in the confirmation dialog
    Then the match should be saved to the database
    And I should be redirected to the login page

  Scenario: Sign out saves match data to database
    Given I have a match in progress on hole 8
    When I click the "Sign Out" button
    And I confirm sign out
    Then the match data should be persisted to the database
    And the user_current_match table should contain my match state
    And the updated_at timestamp should be current

  Scenario: Sign out clears session across all tabs
    Given I am logged in on tab 1
    And I have the app open on tab 2
    When I click "Sign Out" on tab 1
    Then tab 1 should redirect to the login page
    And tab 2 should also detect the sign out
    And tab 2 should redirect to the login page
    And both tabs should clear the session

  Scenario: Sign out clears sensitive data from memory
    Given I am logged in
    And I have match data loaded
    When I click the "Sign Out" button
    And I confirm sign out
    Then all user data should be cleared from app state
    And match data should be cleared from memory
    And only the session should remain cleared in storage
    And I should not be able to access any user data

  Scenario: Sign out from different pages
    Given I am logged in
    And I am on the hole scoring page
    When I click the "Sign Out" button in the header
    Then I should be signed out successfully
    And I should be redirected to the login page

  Scenario: Re-login after sign out loads saved match
    Given I have a match in progress on hole 8
    When I click the "Sign Out" button and confirm
    And I am redirected to the login page
    When I log back in with "user@example.com"
    Then I should see the "Resume Match" option
    And the match should still be on hole 8
    And all previous scores should be intact

  Scenario: Sign out button always visible
    Given I am logged in
    And I am on any page in the app
    Then I should always see the "Sign Out" button in the header
    And it should be easily accessible
    And it should be clearly labeled

  Scenario: Failed sign out (network error)
    Given I am logged in
    And the network is disconnected
    When I click the "Sign Out" button
    Then I should see an error message "Unable to sign out. Check your connection."
    And I should remain logged in
    And the session should not be cleared
    When the network is reconnected
    And I click "Sign Out" again
    Then I should be signed out successfully
