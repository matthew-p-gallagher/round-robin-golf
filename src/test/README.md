# Testing Infrastructure

This directory contains the testing infrastructure and utilities for the Round Robin Golf Scoring System.

## Directory Structure

```
src/test/
├── utils/                    # Test utility functions
│   ├── async-test-utils.js  # Async/debounce testing helpers
│   ├── component-test-utils.jsx  # Component testing utilities
│   ├── form-test-utils.jsx  # Form testing helpers
│   └── test-providers.jsx   # Mock providers (AuthContext, etc.)
├── fixtures/                 # Test data and fixtures
│   └── mock-data.js         # Mock match data and players
├── mocks/                    # Module mocks
│   └── supabase-mock.js     # Supabase client mock factory
├── integration/              # Integration tests
│   ├── backward-navigation.test.js
│   └── scoring-scenarios.test.js
├── setup.js                  # Global test setup
├── test-utils.jsx           # Custom render functions
└── README.md                # This file
```

## Setup

The testing environment is configured with:
- **Vitest** - Fast unit test runner that works seamlessly with Vite
- **React Testing Library** - Testing utilities for React components
- **jsdom** - DOM environment for testing
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - User interaction simulation

## Files

### Core Files

#### `setup.js`
Global test setup file that:
- Imports jest-dom matchers
- Clears mocks between tests
- Configures global test environment

#### `test-utils.jsx`
Custom render function and re-exports of React Testing Library utilities. Imports from `utils/test-providers.jsx`.

### Utilities (`utils/`)

#### `async-test-utils.js`
Helpers for testing asynchronous behavior and debounced functions.

#### `component-test-utils.jsx`
Specialized utilities for component testing:
- `renderWithUser()` - Renders components with user event setup
- Button state assertions
- Mobile touch event simulation
- Form validation helpers

#### `form-test-utils.jsx`
Utilities for testing form validation and submission flows.

#### `test-providers.jsx`
Mock providers for testing components that require context:
- `MockAuthProvider` - Mock authentication context
- `createMockAuthContext()` - Helper for creating mock auth values
- `AUTH_STATES` - Common auth state configurations

### Fixtures (`fixtures/`)

#### `mock-data.js`
Mock data for golf match scenarios:
- Sample players with various stats
- Match states for different phases (setup, scoring, complete)
- Expected matchup rotation patterns
- Helper functions for creating test data

### Mocks (`mocks/`)

#### `supabase-mock.js`
Factory function for creating Supabase client mocks with configurable responses.

### Integration Tests (`integration/`)

#### `backward-navigation.test.js`
Integration tests for navigating backward through holes and editing previous results.

#### `scoring-scenarios.test.js`
Comprehensive scoring scenarios testing edge cases in points calculation.

## Available Scripts

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (if @vitest/ui is installed)
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## Writing Tests

### Basic Test Structure
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import MyComponent from '../components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Component Testing with User Interactions
```javascript
import { renderWithUser } from '../test/utils/component-test-utils'
import { mockPlayers } from '../test/fixtures/mock-data'

describe('Interactive Component', () => {
  it('should handle user clicks', async () => {
    const { user } = renderWithUser(<MyComponent players={mockPlayers} />)
    const button = screen.getByRole('button')

    await user.click(button)
    expect(/* assertion */).toBeTruthy()
  })
})
```

### Using Mock Data
```javascript
import { mockMatchState, mockPlayers } from '../test/fixtures/mock-data'

describe('Match Logic', () => {
  it('should process match state correctly', () => {
    const result = processMatch(mockMatchState)
    expect(result.players).toEqual(mockPlayers)
  })
})
```

## Coverage Configuration

Coverage is configured to:
- Generate text, JSON, and HTML reports
- Exclude test files, node_modules, and config files
- Report on all source files in the `src` directory

Coverage reports are generated in the `coverage` directory (gitignored).

## Best Practices

1. **Test Naming**: Use descriptive test names that explain the expected behavior
2. **Arrange-Act-Assert**: Structure tests with clear setup, action, and assertion phases
3. **Mock Data**: Use the provided mock data for consistent test scenarios
4. **User Events**: Use `@testing-library/user-event` for realistic user interactions
5. **Accessibility**: Test with screen readers in mind using semantic queries
6. **Mobile Testing**: Consider touch interactions and mobile-specific behaviors

## Golf-Specific Testing Considerations

- Test matchup rotation logic for all 18 holes
- Verify points calculation (3 for win, 1 for draw)
- Test player stats updates (wins, draws, losses)
- Validate mobile-friendly interactions
- Test edge cases like ties and validation errors