import { test, expect } from '../../fixtures/auth.js';

/**
 * Email Verification E2E Tests
 * Based on: e2e/features/auth/urgent/02-email-verification.feature
 *
 * Tests the email verification flow including:
 * - Login blocked for unverified users
 * - Email verification callback handling
 * - Resend verification email
 * - Expired/invalid token handling
 *
 * NOTE: Some of these tests will fail initially because:
 * - Email verification enforcement is not implemented yet
 * - Resend verification component doesn't exist
 * - Verification callback handling is not implemented
 * This is expected in BDD - write tests first, then implement features.
 */

test.describe('Email Verification', () => {

  test.describe('Login Blocking for Unverified Users', () => {
    let unverifiedEmail;
    let unverifiedPassword;

    test.beforeAll(async ({ supabase }) => {
      // Create an unverified test user
      unverifiedEmail = `unverified-${Date.now()}@example.com`;
      unverifiedPassword = 'TestPassword123!';

      const { data, error } = await supabase.auth.signUp({
        email: unverifiedEmail,
        password: unverifiedPassword,
        options: {
          emailRedirectTo: 'http://localhost:5173/auth/verify'
        }
      });

      if (error) {
        console.error('Failed to create unverified test user:', error);
      }

      await supabase.auth.signOut();
    });

    test('should block login for unverified email', async ({ page }) => {
      // Given I have an unverified email account
      // When I navigate to the login page
      await page.goto('/');
      await page.waitForSelector('h1:has-text("Welcome Back")');

      // And I enter my unverified email credentials
      await page.fill('input[type="email"]', unverifiedEmail);
      await page.fill('input[type="password"]', unverifiedPassword);

      // And I click the "Sign In" button
      await page.click('button:has-text("Sign In")');

      // Then I should see a warning message about email verification
      await expect(page.locator('.auth-error, .auth-warning')).toBeVisible({ timeout: 10000 });
      const warningText = await page.locator('.auth-error, .auth-warning').textContent();
      expect(warningText.toLowerCase()).toMatch(/verify|verification|email/);

      // And I should see a "Resend verification email" link or button
      await expect(page.locator('button:has-text("Resend"), a:has-text("Resend")')).toBeVisible();

      // And I should not be logged in (no header with email)
      const headerVisible = await page.locator('header:has-text("Sign Out")').isVisible().catch(() => false);
      expect(headerVisible).toBe(false);

      // Should still be on login page or verification prompt
      const isOnLoginOrVerification = await page.locator('h1:has-text("Welcome Back"), h1:has-text("Verify")').isVisible();
      expect(isOnLoginOrVerification).toBe(true);
    });

    test('should show resend verification option on unverified login', async ({ page }) => {
      // Given I have an unverified account
      // When I try to log in
      await page.goto('/');
      await page.fill('input[type="email"]', unverifiedEmail);
      await page.fill('input[type="password"]', unverifiedPassword);
      await page.click('button:has-text("Sign In")');

      // Then I should see a resend verification option
      await expect(page.locator('button:has-text("Resend"), a:has-text("Resend")')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Email Verification Callback', () => {

    test('should handle verification callback with invalid token', async ({ page }) => {
      // When I navigate to the app with an invalid verification token
      await page.goto('/?type=signup&token=invalid_token_12345');

      // Or if using hash fragments (common for Supabase)
      // await page.goto('/#access_token=invalid&type=signup');

      // Then I should see an error message about invalid verification
      await expect(page.locator('text=/Invalid.*verification/i, text=/Invalid.*link/i')).toBeVisible({ timeout: 5000 });

      // And I should see a link to the login page
      await expect(page.locator('a:has-text("Sign In"), a:has-text("Login"), button:has-text("Back to Sign In")')).toBeVisible();

      // And I should see an option to request a new verification email
      await expect(page.locator('text=/Request.*verification/i, text=/Resend/i')).toBeVisible();
    });

    test('should show message for already verified account', async ({ page, supabase }) => {
      // Given I have a verified account (use the test user which should be verified)
      const verifiedEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';

      // When I navigate with a verification token for an already verified account
      // This simulates clicking an old verification link
      // Note: This is hard to test without a real token, so we might need to mock

      // For now, just verify the logic exists by checking if the app handles it
      // This test might need to be updated based on actual implementation

      // Placeholder: When verification callback is implemented, test that
      // already-verified users see appropriate message
      test.skip('TODO: Implement when verification callback is added');
    });
  });

  test.describe('Resend Verification Email', () => {
    let testEmail;
    let testPassword;

    test.beforeAll(async ({ supabase }) => {
      // Create a test user for resend testing
      testEmail = `resend-test-${Date.now()}@example.com`;
      testPassword = 'TestPassword123!';

      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      await supabase.auth.signOut();
    });

    test('should show resend verification page', async ({ page }) => {
      // This test assumes there's a dedicated resend verification page/component
      // It might be part of login, or a separate route

      await page.goto('/');

      // Try to login with unverified account
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button:has-text("Sign In")');

      // Should see resend option
      const resendButton = page.locator('button:has-text("Resend"), a:has-text("Resend")');
      await expect(resendButton).toBeVisible({ timeout: 10000 });

      // When I click resend
      await resendButton.click();

      // Then I should see a success message
      await expect(page.locator('text=/Verification email sent/i, text=/Email sent/i')).toBeVisible({ timeout: 5000 });

      // And I should see a reminder about spam folder
      await expect(page.locator('text=/spam/i, text=/junk/i')).toBeVisible();
    });

    test('should disable resend button after sending', async ({ page }) => {
      await page.goto('/');

      // Try to login with unverified account
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', testPassword);
      await page.click('button:has-text("Sign In")');

      // Click resend
      const resendButton = page.locator('button:has-text("Resend")').first();
      await expect(resendButton).toBeVisible({ timeout: 10000 });
      await resendButton.click();

      // Wait for success message
      await expect(page.locator('text=/Verification email sent/i, text=/Email sent/i')).toBeVisible({ timeout: 5000 });

      // The resend button should be disabled
      // Check if button is disabled or shows countdown
      const isDisabled = await resendButton.isDisabled().catch(() => false);
      const hasCountdown = await page.locator('text=/wait/i, text=/seconds/i').isVisible().catch(() => false);

      // Either the button is disabled OR there's a countdown message
      expect(isDisabled || hasCountdown).toBe(true);
    });
  });

  test.describe('Email Verification Configuration Check', () => {
    test('should check if Supabase email confirmation is enabled', async ({ supabase }) => {
      // This is more of a sanity check to understand the Supabase configuration
      // Create a test user and check their email_confirmed_at status

      const testEmail = `config-check-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';

      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      expect(signupError).toBeNull();
      expect(signupData.user).toBeTruthy();

      // Check if email is auto-confirmed or requires confirmation
      const emailConfirmed = signupData.user.email_confirmed_at !== null;

      console.log(`Supabase email confirmation config:`);
      console.log(`  - Auto-confirm: ${emailConfirmed}`);
      console.log(`  - email_confirmed_at: ${signupData.user.email_confirmed_at}`);

      // If auto-confirmed, some of our verification tests won't work as expected
      if (emailConfirmed) {
        console.warn('WARNING: Supabase is set to auto-confirm emails. Email verification tests may not work as expected.');
        console.warn('To test verification flow, disable "Enable email confirmations" in Supabase Dashboard > Authentication > Settings');
      }

      // Cleanup
      await supabase.auth.signOut();
    });
  });

  test.describe('Verified User Can Login', () => {
    test('should allow verified user to login successfully', async ({ page }) => {
      // Given I have a verified account (test user should be verified)
      const verifiedEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';
      const verifiedPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

      // When I navigate to login
      await page.goto('/');
      await page.waitForSelector('h1:has-text("Welcome Back")');

      // And I enter my credentials
      await page.fill('input[type="email"]', verifiedEmail);
      await page.fill('input[type="password"]', verifiedPassword);

      // And I click sign in
      await page.click('button:has-text("Sign In")');

      // Then I should be logged in successfully
      await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('header')).toContainText(verifiedEmail);

      // And I should see the match setup page
      await expect(page.locator('h1, h2')).toContainText(/Match Setup/i);

      // Cleanup - sign out
      await page.click('button:has-text("Sign Out")');
    });
  });

  test.describe('Navigation from Verification Error', () => {
    test('should navigate back to login from verification error', async ({ page }) => {
      // Given I'm on a verification error page (invalid token)
      await page.goto('/?type=signup&token=invalid_token');

      // When I see the error and click "Back to Sign In"
      const backButton = page.locator('a:has-text("Sign In"), button:has-text("Back to Sign In"), a:has-text("Login")');
      await expect(backButton).toBeVisible({ timeout: 5000 });
      await backButton.first().click();

      // Then I should be on the login page
      await expect(page.locator('h1')).toContainText('Welcome Back');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });
});
