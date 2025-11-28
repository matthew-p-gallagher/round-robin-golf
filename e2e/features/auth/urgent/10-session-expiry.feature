Feature: Session Expiry (Auto-Logout)
  As a user with an expired session
  I want to be handled gracefully
  So that I don't lose data or get confused

  Background:
    Given I am logged in as "user@example.com"
    And I have a valid session token

  Scenario: Session expires while user is idle
    Given I have been idle for the session timeout duration
    When the session token expires
    And I navigate to a different page or refresh
    Then I should see a loading indicator briefly
    And I should be redirected to the login page
    And I should see a message "Your session has expired. Please log in again."
    And the expired session token should be cleared

  Scenario: Session expires during match scoring
    Given I have a match in progress on hole 10
    And my session is about to expire
    When the session expires
    And I try to record a hole result
    Then the API request should fail with an auth error
    And the match data should be automatically saved to localStorage as backup
    And I should see a message "Session expired. Please log in to continue."
    And I should be redirected to the login page
    When I log back in
    Then I should see the "Resume Match" option
    And my match should still be on hole 10

  Scenario: Token refresh before expiry (silent refresh)
    Given my session token is about to expire in 5 minutes
    When I perform any action that requires authentication
    Then the app should silently refresh my session token
    And I should not notice any interruption
    And I should remain logged in
    And the new token should be stored
    And the old token should be replaced

  Scenario: Failed token refresh results in logout
    Given my session token is expired
    When the app tries to refresh the token
    And the refresh fails
    Then I should be logged out
    And I should be redirected to the login page
    And I should see a message "Session expired. Please log in again."

  Scenario: Session expiry warning (optional enhancement)
    Given my session will expire in 5 minutes
    When the 5-minute warning threshold is reached
    Then I should see a warning notification "Your session will expire in 5 minutes"
    And I should see an option to "Stay logged in"
    When I click "Stay logged in"
    Then my session should be refreshed
    And the warning should disappear

  Scenario: Session expiry during form submission
    Given I am filling out a form
    And my session expires while I'm typing
    When I submit the form
    Then the submission should fail with an auth error
    And I should see a message "Session expired. Please log in to continue."
    And my form data should be preserved in the form fields
    And I should be redirected to the login page
    When I log back in
    Then I should be redirected back to the form
    And my form data should still be there (if possible)

  Scenario: Manual session check on app focus
    Given my session may have expired while the app was in the background
    When I switch back to the app tab
    Or when I focus the browser window
    Then the app should verify the session is still valid
    If the session is expired
    Then I should be logged out and redirected to login

  Scenario: Session expires across multiple tabs
    Given I am logged in on tab 1 and tab 2
    And my session expires
    When tab 1 detects the expired session
    Then tab 1 should be logged out
    And tab 1 should redirect to login
    When I perform an action on tab 2
    Then tab 2 should also detect the expired session
    And tab 2 should be logged out
    And tab 2 should redirect to login

  Scenario: Graceful handling of 401 Unauthorized responses
    Given I am logged in
    And my session is expired
    When I make any API request
    Then the API should return a 401 Unauthorized status
    And the app should catch this error globally
    And I should be automatically logged out
    And I should be redirected to the login page
    And I should see a message "Session expired. Please log in again."
    And the session should be cleared
