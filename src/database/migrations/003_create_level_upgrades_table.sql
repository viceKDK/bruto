 -- Migration: Create level_upgrades table (Story 8.2)
-- Stores history of level-up upgrade choices

CREATE TABLE IF NOT EXISTS level_upgrades (
  id TEXT PRIMARY KEY,
  bruto_id TEXT NOT NULL,
  level_number INTEGER NOT NULL,
  
  -- Option A details
  option_a_type TEXT NOT NULL,
  option_a_description TEXT NOT NULL,
  option_a_stats TEXT, -- JSON string: {"strength": 2, "hp": 0, ...}
  
  -- Option B details
  option_b_type TEXT NOT NULL,
  option_b_description TEXT NOT NULL,
  option_b_stats TEXT, -- JSON string
  
  -- Player's choice
  chosen_option TEXT NOT NULL CHECK(chosen_option IN ('A', 'B')),
  
  -- Metadata
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  
  FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_level_upgrades_bruto_id 
  ON level_upgrades(bruto_id);

CREATE INDEX IF NOT EXISTS idx_level_upgrades_level_number 
  ON level_upgrades(bruto_id, level_number);
