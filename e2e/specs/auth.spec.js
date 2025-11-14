import { test, expect } from '../fixtures/auth.js';

test.describe('Authentication Flow', () => {
  test('should successfully log in and see match setup', async ({ authenticatedPage, cleanMatchData }) => {
    // authenticatedPage fixture has already logged us in
    // cleanMatchData fixture has cleared any existing match data

    // Verify we're logged in - header should show user email
    await expect(authenticatedPage.locator('header')).toContainText('testuser@example.com');

    // Verify we can see the match setup screen
    await expect(authenticatedPage.locator('h1')).toContainText('Match Setup');

    // Verify player input fields are present
    const playerInputs = authenticatedPage.locator('input[type="text"]');
    await expect(playerInputs).toHaveCount(4);

    // Verify start match button is present
    await expect(authenticatedPage.locator('button:has-text("Start Match")')).toBeVisible();
  });

  test('should log out successfully', async ({ authenticatedPage }) => {
    // Click sign out button
    await authenticatedPage.click('button:has-text("Sign Out")');

    // Wait for redirect to login page
    await authenticatedPage.waitForURL('/');

    // Verify we see the login form
    await expect(authenticatedPage.locator('h1')).toContainText('Sign In');
    await expect(authenticatedPage.locator('input[type="email"]')).toBeVisible();
  });

  test('should validate login with wrong password', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');

    // Fill in wrong credentials
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'WrongPassword123!');

    // Click login button
    await page.click('button:has-text("Sign In")');

    // Should see error message
    await expect(page.locator('.error, [role="alert"]')).toBeVisible();
  });
});
