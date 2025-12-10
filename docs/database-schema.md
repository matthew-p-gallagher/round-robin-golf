# Database Schema

## Supabase Table

```sql
-- Single table for current match per user
CREATE TABLE user_current_match (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  match_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Row Level Security policies
-- Users can only access their own match data
-- Auto-update trigger for updated_at column
```

## Match Data Structure (JSONB)

```javascript
{
  players: [
    {
      name: string,
      points: number,
      wins: number,
      draws: number,
      losses: number
    },
    // ... 4 players total
  ],
  currentHole: 1-18,
  phase: 'setup' | 'scoring' | 'complete',
  holeResults: [
    {
      hole: number,
      matchups: [
        {
          player1: string,
          player2: string,
          result: 'player1' | 'draw' | 'player2'
        },
        {
          player1: string,
          player2: string,
          result: 'player1' | 'draw' | 'player2'
        }
      ]
    }
  ],
  maxHoleReached: 1-18
}
```