# Round Robin Golf - Design Guide

**This is the authoritative design specification for the Round Robin Golf application. All visual design decisions should reference this document.**

A comprehensive design system for the Round Robin Golf mobile-first web application.

---

## Theme: Botanical Garden

A fresh and organic theme featuring vibrant garden-inspired colors, perfect for a golf application that connects players with the natural outdoor environment.

---

## Color Palette

### Core Colors

| Name | Hex | RGB | CSS Variable | Usage |
|------|-----|-----|--------------|-------|
| **Fern Green** | `#4a7c59` | rgb(74, 124, 89) | `--color-primary` | Primary brand color, headers, app background, primary buttons |
| **Fern Green Light** | `#5a9469` | rgb(90, 148, 105) | `--color-primary-light` | Hover states, secondary emphasis |
| **Marigold** | `#f9a620` | rgb(249, 166, 32) | `--color-warning` | Accent highlights, warnings, draw states |
| **Terracotta** | `#b7472a` | rgb(183, 71, 42) | `--color-error` | Error states, loss indicators, destructive actions |
| **Cream** | `#f5f3ed` | rgb(245, 243, 237) | `--color-surface` | Card backgrounds, elevated surfaces |

### Supporting Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| **White** | `#ffffff` | `--color-secondary` | Text on dark backgrounds, button text |
| **Success Green** | `#28a745` | `--color-success` | Win states, positive actions, confirmations |
| **Text Dark** | `#1a1a1a` | `--color-text` | Main body text on light backgrounds |
| **Text Light** | `#666666` | `--color-text-light` | Supporting text, labels, captions |
| **Border** | `#e0e0e0` | `--color-border` | Dividers, card borders, input borders |

### Color Application

```
Background:     Fern Green (#4a7c59) for app chrome/header
Surfaces:       Cream (#f5f3ed) for cards and content areas
Text:           Dark (#1a1a1a) on light, White (#ffffff) on Fern Green
Accents:        Marigold (#f9a620) for highlights/draws
Errors:         Terracotta (#b7472a) for errors/losses
Success:        Success Green (#28a745) for wins/confirmations
```

---

## Typography

### Font Stack

```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Using system fonts ensures:
- Fast loading (no web font download)
- Native look on each platform
- Excellent readability across devices

### Type Scale

| Element | Mobile Size | Desktop Size | Weight | Line Height |
|---------|-------------|--------------|--------|-------------|
| **H1** | 1.75rem (28px) | 2rem (32px) | 700 | 1.2 |
| **H2** | 1.5rem (24px) | 1.75rem (28px) | 600 | 1.3 |
| **H3** | 1.25rem (20px) | 1.5rem (24px) | 600 | 1.4 |
| **Body** | 1rem (16px) | 1rem (16px) | 400 | 1.6 |
| **Small** | 0.875rem (14px) | 0.875rem (14px) | 400 | 1.5 |
| **Caption** | 0.75rem (12px) | 0.75rem (12px) | 400 | 1.4 |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| **Regular** | 400 | Body text, descriptions |
| **Semi-bold** | 600 | Section headers, labels, emphasis |
| **Bold** | 700 | Page titles, primary buttons, key stats |
| **Extra-bold** | 800 | Winner highlights, critical emphasis |

---

## Spacing System

Based on a 4px base unit with rem values for scalability.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--spacing-xs` | 0.25rem | 4px | Tight gaps, inline spacing |
| `--spacing-sm` | 0.5rem | 8px | Related element gaps |
| `--spacing-md` | 1rem | 16px | Standard component padding |
| `--spacing-lg` | 1.5rem | 24px | Section separation |
| `--spacing-xl` | 2rem | 32px | Major section breaks |

### Application Guidelines

- **Component padding**: Use `--spacing-md` (16px)
- **Between related items**: Use `--spacing-sm` (8px)
- **Section gaps**: Use `--spacing-lg` (24px)
- **Page margins**: Use `--spacing-md` on mobile, `--spacing-lg` on tablet+

---

## Layout

### Container Widths

| Breakpoint | Max Width | Padding |
|------------|-----------|---------|
| Mobile (< 768px) | 480px | 16px |
| Tablet (768px+) | 600px | 24px |
| Desktop (1024px+) | 800px | 24px |

### Responsive Breakpoints

```css
/* Mobile-first base styles */

@media (min-width: 768px) {
  /* Tablet and up */
}

@media (min-width: 1024px) {
  /* Desktop and up */
}
```

### Grid Patterns

**Matchup Controls (Mobile)**
```
| Button | Button | Button |
  1fr      1fr      1fr
```

**Points Table**
```
| Player | Thru | Pts | W | D | L |
  2fr     0.8fr  1fr  0.8fr 0.8fr 0.8fr
```

---

## Components

### Buttons

#### Primary Button
- Background: `--color-primary` (#4a7c59 Fern Green)
- Text: White
- Border: 2px solid primary
- Min-height: 44px (touch target)
- Border-radius: 8px
- Font-weight: 600

#### Secondary Button
- Background: Transparent
- Text: `--color-primary`
- Border: 2px solid primary
- Same sizing as primary

#### Success Button (CTA)
- Background: `--color-success` (#28a745)
- Text: White
- Used for: "Start Match", "Next Hole", "Resume Match"
- Min-height: 52-56px for major CTAs

#### Destructive Button
- Background: `--color-error` (#b7472a Terracotta)
- Text: White
- Used for: Confirmations, "End Match"

#### Button States
```
:hover    - Lighten background, maintain border
:active   - translateY(1px)
:disabled - opacity: 0.6, cursor: not-allowed
:focus    - 3px box-shadow ring
```

### Cards

```css
.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
}
```

**Variants:**
- **Standard Card**: Default surface color, subtle border
- **Resume Card**: Success-tinted background, success border
- **Matchup Card**: 2px border for emphasis
- **Overlay Card**: Elevated shadow for full-screen views

### Form Inputs

```css
input {
  min-height: 44px;          /* Touch target */
  padding: 8px 16px;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.15);
}
```

### Tables

**Points Table Header**
- Background: Fern Green (#4a7c59)
- Text: White, uppercase, 0.875rem
- Letter-spacing: 0.05em

**Table Rows**
- Background: White (#ffffff)
- Border: 1px solid Border (#e0e0e0)
- Hover: Cream (#f5f3ed) background
- Winner row: Success Green tinted background, 4px left border

---

## Iconography

The app uses minimal iconography, relying on text labels for clarity:

- **Navigation**: Text buttons ("Prev", "Next", "Back")
- **Actions**: Clear text labels on buttons
- **Status**: Color-coded badges and borders
- **Progress**: Visual progress bar with golf flag indicator

### Logo
- Header logo height: 80px
- Maintains aspect ratio
- Displayed on primary background

---

## Motion and Animation

### Transitions
```css
transition: all 0.2s ease;
```

Standard timing for:
- Button hover/active states
- Input focus states
- Background color changes

### Loading Spinner
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}
```

### Progress Bar
```css
.progress-fill {
  transition: width 0.3s ease;
}
```

---

## Accessibility

### Touch Targets
- Minimum size: 44x44px for all interactive elements
- Adequate spacing between touch targets

### Color Contrast
- Text on primary background: White (#ffffff) on Fern Green (#4a7c59) - AA compliant
- Body text: Dark (#1a1a1a) on Cream (#f5f3ed) - AAA compliant
- Success/Error states use distinct colors beyond just hue
- Marigold (#f9a620) on dark backgrounds for warnings

### Focus States
All interactive elements have visible focus indicators:
```css
:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.2);
}
```

### Screen Reader Support
- Semantic HTML elements
- Descriptive button labels
- Form labels associated with inputs

---

## Mobile-First Considerations

### iOS Specific
```css
-webkit-text-size-adjust: 100%;        /* Prevent auto-zoom */
-webkit-tap-highlight-color: transparent; /* Remove tap highlight */
-webkit-appearance: none;              /* Remove default styling */
```

### Input Handling
- Font-size 16px+ on inputs prevents iOS zoom
- Touch-friendly sizing throughout

### Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

---

## Component Reference

### Authentication Pages
- Centered card layout
- Max-width: 400px
- Fern Green (#4a7c59) background with Cream (#f5f3ed) surface card
- Form-focused design

### Match Setup
- Player name inputs (4 fields)
- Resume match card (when applicable)
- Start match CTA button
- Match format info section

### Hole Scoring
- Hole number header with navigation
- Progress bar with flag indicator
- Two matchup cards per hole
- Three-button selection (Player 1 / Draw / Player 2)
- Current standings table

### Final Results
- Winner announcement header
- Complete standings table
- New match CTA button

### Spectator View
- Read-only standings display
- Auto-refresh capability
- Badge indicating spectator mode

---

## File Structure

```
src/
  index.css     - Base styles, CSS variables, resets
  App.css       - Component-specific styles
```

### CSS Variable Definitions
All design tokens should be defined in `:root` in `index.css`:
```css
:root {
  /* Botanical Garden Theme Colors */
  --color-primary: #4a7c59;        /* Fern Green */
  --color-primary-light: #5a9469;  /* Fern Green Light */
  --color-secondary: #ffffff;       /* White */
  --color-background: #4a7c59;      /* Fern Green */
  --color-surface: #f5f3ed;         /* Cream */
  --color-border: #e0e0e0;          /* Border Gray */

  /* Text Colors */
  --color-text: #1a1a1a;            /* Text Dark */
  --color-text-light: #666666;      /* Text Light */

  /* Semantic Colors */
  --color-success: #28a745;         /* Success Green */
  --color-warning: #f9a620;         /* Marigold */
  --color-error: #b7472a;           /* Terracotta */

  /* Spacing Scale */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */

  /* Component Tokens */
  --touch-target: 44px;
  --border-radius: 8px;
}
```

---

## Design Principles

1. **Mobile-First**: Design for small screens, enhance for larger
2. **Touch-Friendly**: All interactive elements meet 44px minimum
3. **High Contrast**: Optimized for outdoor visibility on golf course
4. **Clear Hierarchy**: Visual weight guides user attention
5. **Minimal Decoration**: Function over form, no unnecessary elements
6. **Consistent Spacing**: Rhythm created through spacing system
7. **Accessible**: WCAG compliant colors and interactions

---

*Design Guide Version 1.0*
*Theme: Botanical Garden*
*Last Updated: December 2024*
