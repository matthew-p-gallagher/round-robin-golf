import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load test environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.test') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

// Test user credentials from .env.test
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

// Supabase credentials from .env.local
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend({
  /**
   * Authenticated page - automatically logs in before test
   */
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/');

    // Wait for login form
    await page.waitForSelector('input[type="email"]');

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);

    // Click login button
    await page.click('button:has-text("Sign In")');

    // Wait for successful login (header with email should appear)
    await page.waitForSelector('header');

    // Provide authenticated page to test
    await use(page);
  },

  /**
   * Supabase client for database operations
   */
  supabase: async ({}, use) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await use(supabase);
  },

  /**
   * Clean match data - clears test user's match before test
   */
  cleanMatchData: async ({ supabase }, use) => {
    // Login as test user to get their user_id
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    // Clear any existing match data for this user
    if (authData?.user) {
      await supabase
        .from('user_current_match')
        .delete()
        .eq('user_id', authData.user.id);
    }

    // Provide cleanup function to test
    await use(async () => {
      if (authData?.user) {
        await supabase
          .from('user_current_match')
          .delete()
          .eq('user_id', authData.user.id);
      }
    });

    // Cleanup after test
    if (authData?.user) {
      await supabase
        .from('user_current_match')
        .delete()
        .eq('user_id', authData.user.id);
    }

    // Sign out
    await supabase.auth.signOut();
  },
});

export { expect } from '@playwright/test';
