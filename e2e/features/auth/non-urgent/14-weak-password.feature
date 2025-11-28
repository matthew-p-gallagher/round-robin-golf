Feature: Weak Password Validation
  As a user creating a password
  I want clear guidance on password strength
  So that I can create a secure account

  Background:
    Given I am on the signup page

  Scenario: Password too short
    When I enter "abc" in the password field
    And I enter "abc" in the confirm password field
    And I click "Create Account"
    Then I should see an error "Password must be at least 6 characters long"
    And the form should not be submitted

  Scenario: Password strength indicator - weak
    When I type "123456" in the password field
    Then I should see a password strength indicator
    And it should show "Weak" in red
    And I should see a suggestion "Add letters and special characters"

  Scenario: Password strength indicator - medium
    When I type "Password1" in the password field
    Then the password strength indicator should show "Medium" in yellow
    And I should see a suggestion "Add special characters for better security"

  Scenario: Password strength indicator - strong
    When I type "SecureP@ss123!" in the password field
    Then the password strength indicator should show "Strong" in green
    And I should not see additional suggestions
    And I should feel confident submitting the form

  Scenario: Password requirements list
    When I focus on the password field
    Then I should see a list of password requirements
    And the list should include "At least 6 characters"
    And requirements should update with checkmarks as I type

  Scenario: Common password rejected
    When I enter "password" in the password field
    And I enter "password" in the confirm password field
    And I click "Create Account"
    Then I might see a warning "This password is too common. Please choose a stronger password."
    And I should be encouraged to make it more unique

  Scenario: Password with only numbers
    When I enter "12345678" in the password field
    Then the strength indicator should show "Weak"
    And I should see a suggestion "Add letters for better security"

  Scenario: Password with only letters
    When I enter "abcdefgh" in the password field
    Then the strength indicator should show "Weak" or "Medium"
    And I should see a suggestion "Add numbers or special characters"

  Scenario: Progressive password validation
    When I type "p" in the password field
    Then I should see strength indicator as "Too short"
    When I continue typing to "pass"
    Then it should still show "Too short"
    When I continue to "password"
    Then it should show "Weak - too common"
    When I change it to "Password1!"
    Then it should show "Strong"

  Scenario: Show/hide password toggle
    When I am entering a password
    Then I should see a "Show" or eye icon button
    When I click the show password button
    Then the password field should change to text type
    And I should see my password in plain text
    And the button should change to "Hide" or crossed-eye icon
    When I click it again
    Then the password should be hidden again

  Scenario: Copy-paste long password
    When I paste a very long strong password from a password manager
    Then the password should be accepted
    And the strength indicator should show "Strong"
    And I should not see character limit warnings (within reason)
