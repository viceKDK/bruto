-- Migration: Weapons System
-- Description: Create tables for weapons catalog and bruto weapon ownership
-- Date: 2025-10-31

-- ============================================================
-- WEAPONS CATALOG TABLE
-- ============================================================
-- Stores the master catalog of all available weapons
-- This is a reference table populated from weapons.json
CREATE TABLE IF NOT EXISTS weapons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_es TEXT NOT NULL,
    types TEXT NOT NULL, -- JSON array of WeaponType values
    odds REAL NOT NULL, -- Probability of obtaining (percentage)
    hit_speed INTEGER NOT NULL, -- Attack speed multiplier (percentage)
    damage INTEGER NOT NULL, -- Base damage
    draw_chance INTEGER NOT NULL, -- Probability of drawing in combat (percentage)
    reach INTEGER NOT NULL, -- Range (0 = melee, higher = longer)
    modifiers TEXT NOT NULL, -- JSON object of WeaponModifiers
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- BRUTO WEAPONS TABLE
-- ============================================================
-- Tracks which weapons each bruto owns and has equipped
CREATE TABLE IF NOT EXISTS bruto_weapons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bruto_id INTEGER NOT NULL,
    weapon_id TEXT NOT NULL,
    acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_equipped BOOLEAN DEFAULT FALSE,
    
    -- Foreign keys
    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE,
    FOREIGN KEY (weapon_id) REFERENCES weapons(id) ON DELETE CASCADE,
    
    -- Constraints
    UNIQUE(bruto_id, weapon_id) -- A bruto can only own each weapon once
);

-- ============================================================
-- INDEXES
-- ============================================================
-- Index for looking up weapons by bruto
CREATE INDEX IF NOT EXISTS idx_bruto_weapons_bruto_id 
    ON bruto_weapons(bruto_id);

-- Index for looking up equipped weapons
CREATE INDEX IF NOT EXISTS idx_bruto_weapons_equipped 
    ON bruto_weapons(bruto_id, is_equipped);

-- Index for weapon lookup by ID
CREATE INDEX IF NOT EXISTS idx_weapons_id 
    ON weapons(id);

-- ============================================================
-- SEED DATA
-- ============================================================
-- Insert default weapon (Bare Hands) - always available
INSERT OR IGNORE INTO weapons (
    id, name, name_es, types, odds, hit_speed, damage, draw_chance, reach, modifiers
) VALUES (
    'bare-hands',
    'Bare Hands',
    'Puños',
    '[]',
    100,
    100,
    5,
    100,
    1,
    '{"evasion":10,"dexterity":20,"block":-25,"disarm":5}'
);

-- Note: Full weapons catalog will be seeded from src/data/weapons.json
-- via the WeaponRepository seed method
