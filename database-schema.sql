-- Round Robin Golf Database Schema
-- Complete Supabase setup for user match persistence

-- =============================================================================
-- SUPABASE BUILT-IN AUTHENTICATION SYSTEM
-- =============================================================================
-- Supabase provides a built-in authentication system in the `auth` schema:
--
-- auth.users table (managed by Supabase):
-- - id (uuid, primary key) - unique user identifier
-- - email (text) - user's email address
-- - encrypted_password (text) - hashed password
-- - email_confirmed_at (timestamptz) - when email was confirmed
-- - created_at (timestamptz) - account creation time
-- - updated_at (timestamptz) - last profile update
-- - raw_user_meta_data (jsonb) - additional user metadata
-- - raw_app_meta_data (jsonb) - app-specific metadata
--
-- Functions available:
-- - auth.uid() - returns the current user's ID (null if not authenticated)
-- - auth.jwt() - returns the current JWT token claims
--
-- Authentication handled via:
-- - Supabase Auth API (signup, login, logout, password reset)
-- - Row Level Security (RLS) for data isolation
-- - JWT tokens for session management
-- =============================================================================

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

-- =============================================================================
-- MATCH SHARING FOR SPECTATOR ACCESS
-- =============================================================================
-- Allows match owners to share a 4-digit code so spectators can view standings

-- Table for storing share codes
CREATE TABLE match_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code varchar(4) NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE match_shares ENABLE ROW LEVEL SECURITY;

-- Index for fast share code lookups
CREATE INDEX idx_match_shares_code ON match_shares(share_code) WHERE is_active = true;
CREATE INDEX idx_match_shares_user_id ON match_shares(user_id);

-- RLS Policy: Owner can manage their own share codes
CREATE POLICY "Users manage their own shares" ON match_shares
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy: Anyone can look up active share codes (for spectator validation)
CREATE POLICY "Anyone can read active shares" ON match_shares
  FOR SELECT USING (is_active = true);

-- RLS Policy: Allow spectators to read match data via valid share code
CREATE POLICY "Spectators view via share code" ON user_current_match
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM match_shares
      WHERE match_shares.user_id = user_current_match.user_id
      AND match_shares.is_active = true
    )
  );