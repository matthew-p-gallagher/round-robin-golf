-- Round Robin Golf Database Schema
-- Complete Supabase setup for user match persistence

-- Main table: One current match per authenticated user
CREATE TABLE user_current_match (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  match_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_current_match ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own matches
CREATE POLICY "Users manage their own match" ON user_current_match
  FOR ALL USING (auth.uid() = user_id);

-- Index for performance (optional but recommended)
CREATE INDEX idx_user_current_match_user_id ON user_current_match(user_id);

-- Trigger function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_user_current_match_updated_at
    BEFORE UPDATE ON user_current_match
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Example match_data structure (for reference):
/*
{
  "players": [
    {
      "name": "Player 1",
      "points": 0,
      "wins": 0,
      "draws": 0,
      "losses": 0
    }
  ],
  "currentHole": 1,
  "phase": "scoring",
  "holeResults": [
    {
      "holeNumber": 1,
      "matchups": [
        {
          "players": ["Player 1", "Player 2"],
          "result": "player1" | "player2" | "draw"
        }
      ]
    }
  ],
  "maxHoleReached": 1
}
*/