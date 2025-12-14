# Round Robin Golf Scoring

A mobile-first web app for tracking a novel golf format.

<img width="335" height="719" alt="image" src="https://github.com/user-attachments/assets/e3241334-6061-4b8c-860b-f9de6858050d" />
<img width="338" height="719" alt="image" src="https://github.com/user-attachments/assets/cac0d95a-62dd-4e19-a7cb-e55604cc5851" />



## Match Format

- Each hole features 2 separate 1v1 matchups
- Matchups rotate through different player combinations each hole
- Winners receive 3 points, draws award 1 point to each player
- Final winner is determined by total points after 18 holes

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm
- Supabase account with project created

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173`

## Technology Stack

- **Frontend**: React 19.1 with Vite 7.x
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Styling**: Mobile-first CSS with CSS custom properties
- **Testing**: Vitest (unit) + Playwright (E2E)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:e2e` | Run E2E tests |

## Documentation

- [Database Schema](./docs/database-schema.md) - Supabase table structure
