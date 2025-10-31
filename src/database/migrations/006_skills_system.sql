-- Migration 006: Skills System Enhancement
-- Updates bruto_skills table for comprehensive skill tracking

-- Drop old table if exists and recreate with enhanced schema
DROP TABLE IF EXISTS bruto_skills;

CREATE TABLE bruto_skills (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    
    -- Acquisition tracking
    acquired_at INTEGER NOT NULL,
    acquired_level INTEGER NOT NULL,
    
    -- Stacking support (for skills that can stack)
    stack_count INTEGER DEFAULT 1,
    
    -- Meta
    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE,
    UNIQUE(bruto_id, skill_id)
);

-- Index for fast bruto skill lookups
CREATE INDEX IF NOT EXISTS idx_bruto_skills_bruto_id 
    ON bruto_skills(bruto_id);

-- Index for skill acquisition queries
CREATE INDEX IF NOT EXISTS idx_bruto_skills_acquired 
    ON bruto_skills(bruto_id, acquired_level);
