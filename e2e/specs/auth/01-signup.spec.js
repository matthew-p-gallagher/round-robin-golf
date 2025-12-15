import { test, expect } from '../../fixtures/auth.js';

/**
 * First-Time Signup E2E Tests
 * Based on: e2e/features/auth/urgent/01-first-time-signup.feature
 *
 * Tests the signup flow for new users including:
 * - Successful signup
 * - Validation errors (mismatched passwords, weak password, empty fields)
 * - Email format validation
 * - Navigation between signup and login
 */

test.describe('First-Time Signup', () => {
  test.beforeEach(async ({ page }) => {
    // Start at login page
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Welcome Back")');
  });

  test('should navigate to signup form from login', async ({ page }) => {
    // Given I am on the login page
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // When I click the "Sign up" link
    await page.click('text=Sign up');

    // Then I should see the signup form
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('p.auth-subtitle')).toContainText('Sign up to start tracking your golf matches');

    // And I should see all required fields
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
  });

  test('should show validation error with mismatched passwords', async ({ page }) => {
    // Given I am on the signup page
    await page.click('text=Sign up');
    await expect(page.locator('h1')).toContainText('Create Account');

    // When I enter valid email and mismatched passwords
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input#password[type="password"]', 'SecurePass123!');
    await page.fill('input#confirmPassword[type="password"]', 'DifferentPass456!');

    // And I click the "Create Account" button
    await page.click('button:has-text("Create Account")');

    // Then I should see an error message
    await expect(page.locator('.auth-error')).toContainText('Passwords do not match');

    // And the form should not be submitted (still on signup page)
    await expect(page.locator('h1')).toContainText('Create Account');

    // And the email field should still contain my email
    await expect(page.locator('input[type="email"]')).toHaveValue('newuser@example.com');
  });

  test('should show validation error with weak password', async ({ page }) => {
    // Given I am on the signup page
    await page.click('text=Sign up');

    // When I enter a password that is too short
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input#password[type="password"]', '123');
    await page.fill('input#confirmPassword[type="password"]', '123');

    // And I click the "Create Account" button
    await page.click('button:has-text("Create Account")');

    // Then I should see an error message about password length
    await expect(page.locator('.auth-error')).toContainText('Password must be at least 6 characters long');

    // And the form should not be submitted
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should show validation error with empty fields', async ({ page }) => {
    // Given I am on the signup page
    await page.click('text=Sign up');

    // When I click "Create Account" without entering any data
    await page.click('button:has-text("Create Account")');

    // Then I should see an error message
    await expect(page.locator('.auth-error')).toContainText('Please fill in all fields');

    // And the form should not be submitted
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('should validate email format', async ({ page }) => {
    // Given I am on the signup page
    await page.click('text=Sign up');

    // When I enter an invalid email format
    await page.fill('input[type="email"]', 'notanemail');
    await page.fill('input#password[type="password"]', 'SecurePass123!');
    await page.fill('input#confirmPassword[type="password"]', 'SecurePass123!');

    // And I click the "Create Account" button
    await page.click('button:has-text("Create Account")');

    // Then the browser should show native email validation
    // Note: Native validation prevents form submission
    const emailInput = page.locator('input[type="email"]');
    const validationMessage = await emailInput.evaluate((el) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should navigate back to login from signup', async ({ page }) => {
    // Given I am on the signup page
    await page.click('text=Sign up');
    await expect(page.locator('h1')).toContainText('Create Account');

    // When I click the "Sign in" link
    await page.click('text=Sign in');

    // Then I should be taken back to the login page
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // And all form fields should be empty
    await expect(page.locator('input[type="email"]')).toHaveValue('');
    await expect(page.locator('input[type="password"]')).toHaveValue('');
  });

  test('should disable button and show loading state during signup', async ({ page }) => {
    // Given I am on the signup page
    await page.click('text=Sign up');

    // When I fill in valid data
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input#password[type="password"]', 'SecurePass123!');
    await page.fill('input#confirmPassword[type="password"]', 'SecurePass123!');

    // And I click the "Create Account" button
    const submitButton = page.locator('button:has-text("Create Account")');
    await submitButton.click();

    // Then I should see a loading state
    await expect(page.locator('button:has-text("Creating account...")')).toBeVisible();

    // And the button should be disabled
    await expect(submitButton).toBeDisabled();
  });

  test('should show success message after successful signup', async ({ page, supabase }) => {
    // Generate unique test email
    const uniqueEmail = `test-signup-${Date.now()}@example.com`;
    const testPassword = 'SecurePass123!';

    // Given I am on the signup page
    await page.click('text=Sign up');

    // When I enter valid credentials
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input#password[type="password"]', testPassword);
    await page.fill('input#confirmPassword[type="password"]', testPassword);

    // And I click the "Create Account" button
    await page.click('button:has-text("Create Account")');

    // Then I should see a success message
    await expect(page.locator('.auth-success')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.auth-success')).toContainText('Account created! Please check your email to verify your account.');

    // And I should see a "Back to Log In" button
    await expect(page.locator('button:has-text("Back to Log In")')).toBeVisible();

    // Cleanup: Delete the test user
    try {
      // Sign in as the user to get their ID
      const { data } = await supabase.auth.signInWithPassword({
        email: uniqueEmail,
        password: testPassword,
      });

      if (data?.user) {
        // Delete from our custom table
        await supabase
          .from('user_current_match')
          .delete()
          .eq('user_id', data.user.id);

        // Note: Can't delete from auth.users via client SDK
        // Will need to manually clean up or use admin API
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.log('Cleanup error (non-critical):', error.message);
    }
  });

  test('should show error when signing up with existing email', async ({ page }) => {
    // This test assumes the TEST_USER_EMAIL already exists
    const existingEmail = process.env.TEST_USER_EMAIL || 'testuser@example.com';

    // Given I am on the signup page
    await page.click('text=Sign up');

    // When I try to sign up with an email that already exists
    await page.fill('input[type="email"]', existingEmail);
    await page.fill('input#password[type="password"]', 'AnyPassword123!');
    await page.fill('input#confirmPassword[type="password"]', 'AnyPassword123!');

    // And I click the "Create Account" button
    await page.click('button:has-text("Create Account")');

    // Then I should see an error message
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 10000 });
    const errorText = await page.locator('.auth-error').textContent();

    // The error should indicate the email is taken (Supabase may say different things)
    expect(errorText.toLowerCase()).toMatch(/already|exist|registered|taken/);

    // And I should remain on the signup page
    await expect(page.locator('h1')).toContainText('Create Account');

    // And the email field should still contain the email
    await expect(page.locator('input[type="email"]')).toHaveValue(existingEmail);
  });

  test('should clear error message when user corrects input', async ({ page }) => {
    // Given I am on the signup page with an error
    await page.click('text=Sign up');

    // Trigger an error (empty fields)
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('.auth-error')).toContainText('Please fill in all fields');

    // When I start correcting the input
    await page.fill('input[type="email"]', 'corrected@example.com');
    await page.fill('input#password[type="password"]', 'SecurePass123!');

    // The error should either:
    // 1. Clear immediately when I start typing, OR
    // 2. Stay visible until I submit again (both are acceptable UX)

    // Let's check that submitting with correct data doesn't show the old error
    await page.fill('input#confirmPassword[type="password"]', 'SecurePass123!');
    await page.click('button:has-text("Create Account")');

    // Should not see the "fill in all fields" error anymore
    const errorVisible = await page.locator('.auth-error:has-text("Please fill in all fields")').isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  });
});
