Feature: Invalid or Malformed Email
  As a user who enters an invalid email
  I want clear validation feedback
  So that I can correct my mistake

  Background:
    Given I am on the signup page

  Scenario: Email missing @ symbol
    When I enter "userexample.com" in the email field
    And I move focus away from the email field (blur)
    Then I should see an inline validation error "Please enter a valid email address"
    Or the browser should show native validation on submit

  Scenario: Email missing domain
    When I enter "user@" in the email field
    And I move focus away from the email field
    Then I should see a validation error
    And the error should indicate the email is incomplete

  Scenario: Email with spaces
    When I enter "user @example.com" in the email field
    And I attempt to submit the form
    Then I should see a validation error "Email cannot contain spaces"
    Or the browser's native validation should catch it

  Scenario: Email with special characters in wrong places
    When I enter "@user@example.com" in the email field
    And I attempt to submit the form
    Then I should see a validation error
    And the form should not be submitted

  Scenario: Empty email field
    When I leave the email field empty
    And I click the submit button
    Then I should see a validation error "Please enter your email address"
    And the form should not be submitted

  Scenario: Real-time email validation on blur
    When I type "invalidemail" in the email field
    And I tab to the next field (blur event)
    Then I should see an inline error message immediately
    And the email field should have an error visual indicator (red border)
    When I correct it to "valid@example.com"
    And I blur the field again
    Then the error message should disappear
    And the visual indicator should change to success (green) or neutral

  Scenario: Email validation examples provided
    When I focus on the email field
    Then I should see a placeholder like "user@example.com"
    Or helpful text showing the expected format

  Scenario: Very long email address
    When I enter a 300-character email address
    And I submit the form
    Then I should see an error "Email address is too long"
    And the maximum length should be reasonable (e.g., 254 characters)

  Scenario: Email with typos (common domains)
    When I enter "user@gmial.com" in the email field
    Then I might see a helpful suggestion "Did you mean gmail.com?"
    And I should be able to click to accept the suggestion
