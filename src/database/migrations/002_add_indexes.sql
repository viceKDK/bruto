-- Migration 002: Performance Indexes
-- Adds indexes for critical queries

-- Brutos indexes (matchmaking and lookups)
CREATE INDEX IF NOT EXISTS idx_brutos_user ON brutos(user_id);
CREATE INDEX IF NOT EXISTS idx_brutos_level ON brutos(level);
CREATE INDEX IF NOT EXISTS idx_brutos_name ON brutos(name);

-- Weapons, Skills, Pets indexes
CREATE INDEX IF NOT EXISTS idx_bruto_weapons_bruto ON bruto_weapons(bruto_id);
CREATE INDEX IF NOT EXISTS idx_bruto_skills_bruto ON bruto_skills(bruto_id);
CREATE INDEX IF NOT EXISTS idx_bruto_pets_bruto ON bruto_pets(bruto_id);

-- Battle history indexes
CREATE INDEX IF NOT EXISTS idx_battles_player ON battles(player_bruto_id);
CREATE INDEX IF NOT EXISTS idx_battles_date ON battles(fought_at);
CREATE INDEX IF NOT EXISTS idx_battles_opponent ON battles(opponent_bruto_id);

-- Daily fights indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_fights_user_date ON daily_fights(user_id, fight_date);

-- Level up history index
CREATE INDEX IF NOT EXISTS idx_level_up_history_bruto ON level_up_history(bruto_id);
