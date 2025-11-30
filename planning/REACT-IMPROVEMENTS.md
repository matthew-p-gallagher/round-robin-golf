# React Best Practices - Improvement Roadmap

This document outlines recommended improvements to better align with React and general software development best practices.

**Phases are ordered by recommended implementation sequence.**

---

## PHASE 1: COMPONENT EXTRACTION

Low risk, high value. Eliminates ~282 lines of duplicate code.

### 1.1 Create Reusable Form Components

#### 1.1.1 PasswordInput Component
- [x] Create `src/components/common/PasswordInput.jsx`
- [x] Add props: `id`, `label`, `value`, `onChange`, `placeholder`, `disabled`, `autoComplete`, `autoFocus`, `required`
- [x] Implement internal state for show/hide toggle
- [x] Refactor Login.jsx to use PasswordInput
- [x] Refactor Signup.jsx to use PasswordInput (2 instances)
- [x] Refactor UpdatePassword.jsx to use PasswordInput (2 instances)
- [x] Write unit tests for PasswordInput
- [x] Verify all auth flows work correctly

**Impact**: Eliminates ~115 lines of duplicate code (5 instances)
**New file**: `src/components/common/PasswordInput.jsx` (~45 lines)

---

#### 1.1.2 EmailInput Component
- [x] Create `src/components/common/EmailInput.jsx`
- [x] Add props: `id`, `label`, `value`, `onChange`, `placeholder`, `disabled`, `autoFocus`, `required`
- [x] Refactor Login.jsx to use EmailInput
- [x] Refactor Signup.jsx to use EmailInput
- [x] Refactor ResetPassword.jsx to use EmailInput
- [x] Write unit tests for EmailInput
- [x] Verify all auth flows work correctly

**Impact**: Eliminates ~48 lines of duplicate code (3 instances)
**New file**: `src/components/common/EmailInput.jsx` (~30 lines)

---

#### 1.1.3 AuthLayout Wrapper
- [x] Create `src/components/common/AuthLayout.jsx`
- [x] Add props: `title`, `subtitle`, `children`
- [x] Implement auth-container > auth-card > header structure
- [x] Refactor Login.jsx to use AuthLayout
- [x] Refactor Signup.jsx to use AuthLayout
- [x] Refactor ResetPassword.jsx to use AuthLayout
- [x] Refactor UpdatePassword.jsx to use AuthLayout
- [x] Verify styling consistency across all auth pages

**Impact**: Eliminates ~40 lines of duplicate code (4 instances)
**New file**: `src/components/common/AuthLayout.jsx` (~20 lines)

---

### 1.2 Create Feedback Components

#### 1.2.1 ErrorMessage Component
- [x] Create `src/components/common/ErrorMessage.jsx`
- [x] Support single error string via `error` prop
- [x] Support error array via `errors` prop
- [x] Add `className` prop for custom styling
- [x] Refactor all auth components to use ErrorMessage
- [x] Refactor MatchSetup.jsx to use ErrorMessage
- [x] Refactor App.jsx error display to use ErrorMessage
- [x] Write unit tests

**Impact**: Eliminates ~30 lines, centralizes error display logic
**New file**: `src/components/common/ErrorMessage.jsx` (~25 lines)

---

#### 1.2.2 SuccessMessage Component
- [x] Create `src/components/common/SuccessMessage.jsx`
- [x] Add props: `message`, `action`, `onAction`, `className`
- [x] Support optional action button
- [x] Refactor Signup.jsx to use SuccessMessage
- [x] Refactor ResetPassword.jsx to use SuccessMessage
- [x] Refactor UpdatePassword.jsx to use SuccessMessage
- [x] Write unit tests

**Impact**: Eliminates ~25 lines across auth flows
**New file**: `src/components/common/SuccessMessage.jsx` (~25 lines)

---

#### 1.2.3 LoadingSpinner Component
- [x] Create `src/components/common/LoadingSpinner.jsx`
- [x] Add `message` prop with default "Loading..."
- [x] Refactor App.jsx loading state to use LoadingSpinner
- [x] Refactor MatchSetup.jsx loading state to use LoadingSpinner
- [x] Write unit tests

**Impact**: Eliminates ~10 lines, ensures consistency
**New file**: `src/components/common/LoadingSpinner.jsx` (~15 lines)

---

### 1.3 Create Layout Components

#### 1.3.1 PageLayout Component
- [x] Create `src/components/common/PageLayout.jsx`
- [x] Add props: `children`, `className`
- [x] Implement screen > container wrapper
- [x] Refactor MatchSetup.jsx to use PageLayout
- [x] Refactor HoleScoring.jsx to use PageLayout
- [x] Refactor FinalResults.jsx to use PageLayout
- [x] Verify layout consistency

**Impact**: Standardizes screen/container pattern
**New file**: `src/components/common/PageLayout.jsx` (~10 lines)

---

#### 1.3.2 Card Component (Optional)
- [x] Create `src/components/common/Card.jsx`
- [x] Add props: `title`, `description`, `children`, `className`
- [x] Refactor MatchSetup.jsx cards (2 instances)
- [x] Write unit tests

**Impact**: Standardizes card pattern
**New file**: `src/components/common/Card.jsx` (~20 lines)

---

### 1.4 Extract Validation Utilities
- [x] Create `src/utils/validation.js`
- [x] Move `validatePassword` from Signup.jsx and UpdatePassword.jsx
- [x] Add `validateEmail` function
- [x] Export reusable validators
- [x] Refactor Signup.jsx to use validation utils
- [x] Refactor UpdatePassword.jsx to use validation utils
- [x] Write unit tests for validation functions

**Impact**: Eliminates duplicate validation logic
**New file**: `src/utils/validation.js` (~20 lines)
**Lines removed**: ~14 lines

---

## PHASE 2: CRITICAL FIXES (Stability Improvements)

Fixes performance and stability issues.

### 2.1 Fix useMatchState Auto-Save Performance Issue
- [x] Add `isInitialLoad` state flag in useMatchState
- [x] Add `saveTimeoutRef` using useRef
- [x] Modify save effect to skip during initial load
- [x] Implement 800ms debouncing for saves
- [x] Add cleanup function to clear timeout on unmount
- [x] Update load effect to set `isInitialLoad = false` after completion
- [x] Test that saves don't trigger during initial load
- [x] Test that subsequent changes trigger debounced saves

**File**: `src/hooks/useMatchState.js:75-97`
**Problem**: Save effect triggers on every state change, including initial loads
**Impact**: Unnecessary database writes, potential race conditions
**Lines modified**: ~30 lines

---

### 2.2 Replace setTimeout with useDebounce Hook
- [x] Create `src/hooks/useDebounce.js`
- [x] Implement useDebounce with useRef and useCallback
- [x] Add cleanup on unmount
- [x] Refactor HoleScoring.jsx `handleAutoSave` to use useDebounce
- [x] Remove naked setTimeout from HoleScoring
- [x] Write unit tests for useDebounce hook
- [x] Test auto-save behavior in HoleScoring
- [x] Run full test suite

**File**: `src/components/HoleScoring.jsx:64-85`
**Problem**: Naked `setTimeout` in event handler causes memory leaks
**Impact**: Memory leaks, unpredictable behavior
**New file**: `src/hooks/useDebounce.js` (~40 lines)
**Lines modified**: ~15 lines in HoleScoring

---

### 2.3 Add Error Boundaries
- [x] Create `src/components/ErrorBoundary.jsx` class component
- [x] Implement getDerivedStateFromError
- [x] Implement componentDidCatch with error logging
- [x] Add user-friendly error UI with "Try again" button
- [x] Wrap app in ErrorBoundary in `main.jsx`


**Problem**: Any error crashes entire app with white screen
**Impact**: Poor UX, no graceful degradation
**New file**: `src/components/ErrorBoundary.jsx` (~50 lines)
**Lines modified**: 3 lines in `main.jsx`

---

## PHASE 3: ARCHITECTURAL IMPROVEMENTS (Higher Effort)

Requires careful testing. Consider feature branch.

### 3.1 Split useMatchState God Hook
- [ ] Create `src/hooks/useMatchCore.js` (state management only)
- [ ] Create `src/hooks/useMatchPersistence.js` (save/load logic only)
- [ ] Extract core state logic to useMatchCore
- [ ] Extract persistence logic to useMatchPersistence
- [ ] Update `useMatchState.js` to compose both hooks
- [ ] Update all tests
- [ ] Run full test suite
- [ ] Manual testing of all match flows

**File**: `src/hooks/useMatchState.js` (382 lines)
**Problem**: Hook does too much - violates Single Responsibility Principle
**Impact**: Hard to test, maintain, reuse
**Files created**: 2 new hook files

---

### 3.2 Convert matchState to useReducer
- [ ] Create `src/reducers/matchReducer.js`
- [ ] Define initialState
- [ ] Implement reducer with actions: START_MATCH, RECORD_HOLE, NAVIGATE_TO_HOLE, UPDATE_HOLE, RESET_MATCH, LOAD_MATCH
- [ ] Replace `useState` with `useReducer` in useMatchState
- [ ] Update all state updates to use dispatch
- [ ] Update tests to work with reducer pattern
- [ ] Run full test suite
- [ ] Manual testing of all state transitions

**File**: `src/hooks/useMatchState.js`
**Problem**: Complex interdependent state managed with `useState`
**Impact**: Error-prone state updates, harder to track changes
**New file**: `src/reducers/matchReducer.js` (~80 lines)
**Lines modified**: ~50 lines in useMatchState

---

### 3.3 Remove Unnecessary Pass-Through Functions
- [ ] Remove `handleStartMatch` wrapper in App.jsx
- [ ] Remove `handleRecordResults` wrapper in App.jsx
- [ ] Pass `startMatch` directly to MatchSetup
- [ ] Pass `recordHoleResult` directly to HoleScoring
- [ ] Move error handling to child components if needed
- [ ] Test all affected flows
- [ ] Run full test suite

**File**: `src/App.jsx:53-82`
**Problem**: Wrapper functions that just re-throw errors add no value
**Lines removed**: ~20 lines

---

### 3.4 Consolidate Error State Management
- [ ] Audit error state usage in AuthContext and all auth components
- [ ] Use context error for auth errors only
- [ ] Use local state for validation errors only
- [ ] Refactor Login.jsx error handling
- [ ] Refactor Signup.jsx error handling
- [ ] Refactor ResetPassword.jsx error handling
- [ ] Refactor UpdatePassword.jsx error handling
- [ ] Update error display logic
- [ ] Test all error scenarios
- [ ] Run full test suite

**Files**: `AuthContext.jsx`, all auth components
**Problem**: Duplicate error state in context and components
**Impact**: Confusing error state management
**Lines modified**: ~30 lines across 5 files

---

## PHASE 4: PERFORMANCE OPTIMIZATIONS

Measurable performance improvements.

### 4.1 Add React.memo to Pure Components
- [ ] Wrap PointsTable export with React.memo
- [ ] Wrap FinalResults export with React.memo
- [ ] Add custom comparison function if needed
- [ ] Test components still render correctly
- [ ] Use React DevTools Profiler to measure improvement

**Files**: `PointsTable.jsx`, `FinalResults.jsx`
**Impact**: Prevent unnecessary re-renders
**Lines modified**: 2 lines per component

---

### 4.2 Memoize Callbacks in HoleScoring
- [ ] Wrap `handleResultSelect` with useCallback
- [ ] Wrap `handlePreviousHole` with useCallback
- [ ] Wrap `handleNextHole` with useCallback
- [ ] Add proper dependency arrays
- [ ] Consider memoizing `getButtonClass`
- [ ] Test all callbacks work correctly
- [ ] Use React DevTools Profiler to measure improvement

**File**: `src/components/HoleScoring.jsx`
**Problem**: Callbacks recreated on every render
**Lines modified**: ~15 lines

---

### 4.3 Fix MatchSetup Dependency Issue
- [ ] Add `useRef` to store canResumeMatch function reference
- [ ] Update ref when canResumeMatch changes
- [ ] Update useEffect to only run once on mount
- [ ] OR move check to App.jsx and pass boolean prop
- [ ] Test resume match functionality
- [ ] Verify no unnecessary re-renders

**File**: `src/components/MatchSetup.jsx:33`
**Problem**: `canResumeMatch` function in useEffect dependencies causes re-runs
**Lines modified**: ~10 lines

---

## PHASE 5: POLISH & ENHANCEMENTS

Nice-to-have improvements.

### 5.1 Add Code Splitting for Auth Components
- [ ] Import React.lazy in App.jsx
- [ ] Convert Login import to lazy load
- [ ] Convert Signup import to lazy load
- [ ] Convert ResetPassword import to lazy load
- [ ] Convert UpdatePassword import to lazy load
- [ ] Wrap auth section in Suspense with LoadingSpinner fallback
- [ ] Test lazy loading works
- [ ] Measure initial bundle size reduction

**File**: `src/App.jsx`
**Impact**: Faster initial load (auth components only loaded when needed)
**Lines modified**: ~10 lines

---

### 5.2 Improve Accessibility
- [ ] Audit all buttons for aria-label attributes
- [ ] Add aria-disabled to disabled buttons
- [ ] Add aria-label to icon buttons (password toggle)
- [ ] Verify focus order is logical
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Test with screen reader (NVDA or JAWS)
- [ ] Add focus indicators where missing
- [ ] Document accessibility features

**Files**: All components with interactive elements
**Impact**: Better screen reader support, keyboard navigation
**Lines modified**: ~20 lines across multiple files

---

### 5.3 Create Reusable Button Component (Optional)
- [ ] Create `src/components/common/Button.jsx`
- [ ] Add props: `loading`, `loadingText`, `disabled`, `type`, `className`, `children`
- [ ] Implement automatic loading text (append "...")
- [ ] Support custom loadingText prop
- [ ] Write unit tests
- [ ] Refactor auth components to use Button
- [ ] Refactor match components to use Button
- [ ] Verify consistent button behavior

**Impact**: Standardizes loading states, reduces duplication
**New file**: `src/components/common/Button.jsx` (~30 lines)
**Lines modified**: ~40 lines across many files

---

## TESTING CHECKLIST

After each phase:
- [ ] All existing unit tests pass
- [ ] All integration tests pass
- [ ] New components have unit tests (minimum 80% coverage)
- [ ] No console errors or warnings
- [ ] Manual testing of affected features
- [ ] Regression testing of related features
- [ ] Test on mobile viewport (375x667)
- [ ] Test authentication flows end-to-end
- [ ] Test match flows end-to-end

---

**Key Wins**:
- Eliminates **282 lines** of duplicate code (Phase 1)
- Improves maintainability through separation of concerns
- Reduces bug surface area by centralizing common patterns
- Better testability with smaller, focused components

---

## IMPLEMENTATION NOTES

- **Phase 1** can be done incrementally - each component is independent
- **Phase 2** should be done carefully - involves fixing bugs
- **Phase 3** requires extensive testing - consider feature branch
- **Phase 4** is optional but recommended for performance
- **Phase 5** is nice-to-have, can be done anytime

**After completing each phase**:
1. Run `npm test` to ensure all tests pass
2. Run `npm run dev` and manually test affected features
3. Commit changes with descriptive message
4. Update CLAUDE.md if project structure changes significantly

**Pro tip**: Start with Phase 1.1.1 (PasswordInput) - it's the highest impact, lowest risk change and will build confidence for the rest of the work.
