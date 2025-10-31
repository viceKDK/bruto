-- Migration 005: Battle Snapshots for Replay System (Story 12.1)
-- Adds bruto snapshots and turn count for accurate battle replay

-- Add turn count to battles
ALTER TABLE battles ADD COLUMN turn_count INTEGER DEFAULT 0;

-- Add bruto snapshots (JSON strings capturing state at battle time)
ALTER TABLE battles ADD COLUMN player_bruto_snapshot TEXT;
ALTER TABLE battles ADD COLUMN opponent_bruto_snapshot TEXT;

-- Create index for efficient battle history queries
CREATE INDEX IF NOT EXISTS idx_battles_player_bruto_date
  ON battles(player_bruto_id, fought_at DESC);

-- Create index for opponent battles as well
CREATE INDEX IF NOT EXISTS idx_battles_opponent_bruto_date
  ON battles(opponent_bruto_id, fought_at DESC);
