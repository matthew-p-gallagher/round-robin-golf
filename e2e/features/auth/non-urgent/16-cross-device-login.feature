Feature: Cross-Device Login
  As a user with multiple devices
  I want to access my account from any device
  So that I can use the app wherever I am

  Background:
    Given I have an account with email "user@example.com"
    And I have a match in progress saved to the database

  Scenario: Login on new device sees synced data
    Given I am on my home computer (device A)
    And I started a match on hole 8
    And the match is saved to the database
    When I open the app on my phone (device B)
    And I log in with "user@example.com"
    Then I should see a loading indicator while data syncs
    And I should see the "Resume Match" option
    When I resume the match
    Then I should see the match on hole 8
    And all player names and scores should match device A
    And all previous hole results should be intact

  Scenario: Concurrent sessions on multiple devices
    Given I am logged in on device A (laptop)
    And I am logged in on device B (phone)
    When I record a hole result on device A
    Then the match should be saved to the database
    When I refresh or navigate on device B
    Then device B should fetch the updated match data
    And device B should show the new hole result
    And both devices should be in sync

  Scenario: Conflict resolution - last write wins
    Given I am logged in on both device A and device B
    And I am on hole 10 on both devices
    When I record a result on device A at 10:00:00
    And I record a different result on device B at 10:00:05
    Then device B's update should overwrite device A's update
    When I refresh on device A
    Then device A should show device B's result
    And the database should contain the latest update (from device B)

  Scenario: Offline on one device, online on another
    Given I am logged in on device A (offline)
    And I am logged in on device B (online)
    When I make changes on device B
    Then device B should save to the database normally
    When device A comes back online
    And I refresh or navigate on device A
    Then device A should fetch the latest data from the database
    And device A should show the changes made on device B

  Scenario: Session persistence across devices
    Given I logged in on device A yesterday
    And I log in on device B today
    Then I should have independent sessions on each device
    And logging in on device B should not log out device A
    And both sessions should remain valid
    When I sign out on device B
    Then device A should remain logged in

  Scenario: Device identification (future enhancement)
    Given I am logged in on multiple devices
    When I view my account settings
    Then I should see a list of active sessions
    And each session should show device type and last activity
    And I should be able to sign out specific devices remotely

  Scenario: Sync indicator shows when data is loading
    Given I just logged in on a new device
    When the app is fetching my match data
    Then I should see a sync indicator like "Syncing your data..."
    And the indicator should show progress if possible
    When the sync completes
    Then I should see "Sync complete" briefly
    And the indicator should disappear

  Scenario: First device vs returning device
    Given I have never logged in on device C
    When I log in on device C for the first time
    Then the app should sync all my data
    And I should see the same match state as my other devices
    And the experience should be seamless
