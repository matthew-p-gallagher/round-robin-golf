# Round Robin Golf Scoring

Webapp for tracking a new golf scoring format.

## Match Format

The system implements a unique 4-player format where:
- Each hole features 2 separate 1v1 matchups
- Matchups rotate through different player combinations each hole
- Winners receive 3 points, draws award 1 point to each player
- Final winner is determined by total points after 18 holes


## Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Mobile-first CSS with CSS custom properties
- **Development**: ESLint
- **Target**: Mobile browsers (portrait orientation optimized)

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── App.jsx        # Main application component
├── App.css        # Application-specific styles
├── index.css      # Global styles and CSS variables
└── main.jsx       # Application entry point
```

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint