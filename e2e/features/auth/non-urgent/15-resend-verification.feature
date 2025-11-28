Feature: Resend Verification Email
  As a user who didn't receive the verification email
  I want to request a new one
  So that I can verify my account

  Background:
    Given I have signed up with email "newuser@example.com"
    And my email is not verified
    And I did not receive the verification email

  Scenario: Access resend verification option
    Given I am on the login page
    When I try to log in with my unverified account
    Then I should see a message "Please verify your email address"
    And I should see a "Resend verification email" link
    And I should see a "Check spam folder" reminder

  Scenario: Successfully resend verification email
    Given I am on the verification help page
    When I click "Resend verification email"
    Then I should see a loading indicator
    And I should see a success message "Verification email sent! Check your inbox."
    And a new verification email should be sent to "newuser@example.com"
    And the email should contain a new verification token

  Scenario: Resend verification with rate limiting
    Given I just requested a verification email
    When I immediately click "Resend verification email" again
    Then I should see an error "Please wait 60 seconds before requesting another email"
    And the resend button should be disabled
    And I should see a countdown "Resend available in 45 seconds..."

  Scenario: Resend verification countdown
    Given the resend button is disabled due to rate limiting
    When I wait and watch the countdown
    Then I should see it count down from 60 to 0
    When it reaches 0
    Then the button should become enabled again
    And I should be able to resend

  Scenario: Multiple verification emails (only latest valid)
    Given I requested a verification email at 10:00
    When I wait 60 seconds and request another at 10:01
    Then both emails should be sent
    But only the token from the 10:01 email should be valid
    And the 10:00 token should be invalidated
    When I click the link from the 10:00 email
    Then I should see an error "This verification link is no longer valid"
    When I click the link from the 10:01 email
    Then my email should be verified successfully

  Scenario: Resend for already verified email
    Given my email is already verified
    When I try to request a resend verification email
    Then I should see a message "Your email is already verified"
    And I should be directed to log in
    And no email should be sent

  Scenario: Resend verification from dedicated page
    Given I am on a dedicated "Resend Verification" page
    When I enter "newuser@example.com" in the email field
    And I click "Send Verification Email"
    Then I should see a success message
    And I should see helpful information about checking spam
    And I should see a link back to the login page

  Scenario: Check spam folder reminder
    Given I am on the resend verification page
    Then I should see prominent text "Check your spam or junk folder"
    And I should see a suggestion "Add noreply@yourapp.com to your contacts"
    And I should see an estimate of how long emails take to arrive

  Scenario: Support contact for verification issues
    Given I am on the resend verification page
    And I have tried multiple times without success
    Then I should see a "Still having trouble?" section
    And I should see a link to contact support
    And I should see alternative verification methods if available
