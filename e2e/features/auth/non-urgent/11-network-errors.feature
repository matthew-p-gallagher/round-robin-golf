Feature: Network and Connection Errors
  As a user experiencing network issues
  I want clear feedback and recovery options
  So that I can complete my authentication tasks

  Background:
    Given I am on the login page

  Scenario: Login with no internet connection
    Given I have no internet connection
    When I enter my email and password
    And I click the "Sign In" button
    Then I should see a loading indicator
    And the request should timeout or fail
    And I should see an error message "Unable to connect. Check your internet connection."
    And I should not see a generic error message
    And the form should remain filled with my email
    And I should see a "Retry" button or option

  Scenario: Signup with network timeout
    Given I am on the signup page
    And the network is very slow
    When I fill out the signup form
    And I click "Create Account"
    Then I should see a loading indicator
    And the request should timeout after a reasonable duration (e.g., 30 seconds)
    And I should see an error message "Request timed out. Please try again."
    And my form data should still be in the fields
    And I should be able to retry without re-entering data

  Scenario: Password reset request fails due to network
    Given I am on the password reset page
    And the network is disconnected
    When I enter my email and click "Send Reset Link"
    Then I should see an error message "Network error. Please check your connection."
    And the email field should remain filled
    And I should see a "Try Again" button

  Scenario: Offline detection before request
    Given I am on the login page
    And the browser detects I'm offline (navigator.onLine === false)
    When I try to submit the login form
    Then I should immediately see a warning "You appear to be offline"
    And the form should not be submitted to the server
    And I should be encouraged to check my connection

  Scenario: Network recovery and retry
    Given I attempted to log in but got a network error
    And I now have a working internet connection
    When I click the "Retry" or "Try Again" button
    Then the login should be attempted again
    And if successful, I should be logged in
    And the error message should disappear

  Scenario: Slow network with loading state
    Given the network is very slow but working
    When I submit the login form
    Then I should see a loading indicator
    And the submit button should be disabled
    And I should see a hint like "This may take a moment..."
    And the request should eventually complete (success or timeout)

  Scenario: Network error during session check
    Given I am returning to the app
    And the app is checking my session
    And the network fails during the session check
    Then I should see a loading state briefly
    And I should see an error message "Unable to verify session. Check your connection."
    And I should be given the option to retry
    Or I should be redirected to login after a timeout

  Scenario: Partial network failure (some endpoints work, others don't)
    Given the auth API is unreachable but the app loads
    When I try to log in
    Then I should see an error message "Authentication service unavailable. Please try again later."
    And the error should distinguish this from a general network error
    And I should see when to try again or a support link
