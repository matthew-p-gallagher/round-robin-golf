# E2E Testing Setup

End-to-end tests for Round Robin Golf using Playwright.

## Prerequisites

1. **Create a test user in Supabase**
   - Go to your Supabase dashboard
   - Navigate to Authentication > Users
   - Add a new user with email/password:
     - Email: `testuser@example.com`
     - Password: `TestPassword123!`
   - Confirm the user's email (mark as confirmed in dashboard)

2. **Configure test environment**
   - Update `.env.test` with your test user credentials
   - Ensure `.env.local` has your Supabase URL and anon key

## Running Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode (step through)
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

## Test Features

- **Automatic login**: `authenticatedPage` fixture logs in before each test
- **Database cleanup**: `cleanMatchData` fixture clears test user's match data
- **Screenshots on failure**: Automatically captured in `test-results/`
- **Video recording**: Recorded on test failure for debugging
- **Mobile viewport**: Tests run in iPhone 12 viewport (375x667)

## Test Structure

```
e2e/
├── fixtures/
│   └── auth.js              # Reusable auth fixtures
├── utils/
│   └── (future utilities)
├── specs/
│   └── auth.spec.js         # Authentication tests
└── README.md
```

## Writing New Tests

```javascript
import { test, expect } from '../fixtures/auth.js';

test.describe('My Feature', () => {
  test('should do something', async ({ authenticatedPage, cleanMatchData }) => {
    // authenticatedPage is already logged in
    // cleanMatchData has cleared any existing match

    await expect(authenticatedPage.locator('h1')).toContainText('Expected Text');
  });
});
```

## Troubleshooting

**Test fails with "Cannot find test user"**
- Ensure test user exists in Supabase dashboard
- Verify `.env.test` has correct credentials
- Check that user's email is confirmed

**Test fails with Supabase errors**
- Verify `.env.local` has correct Supabase URL and keys
- Check that Row Level Security policies allow test user access

**Screenshots not captured**
- Check `test-results/` directory after test failures
- Screenshots are only taken on failure by default
