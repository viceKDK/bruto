-- Migration 001: Initial Schema
-- Creates all core tables for El Bruto game

-- Migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    applied_at INTEGER NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    coins INTEGER DEFAULT 0,
    bruto_slots INTEGER DEFAULT 3,
    created_at INTEGER NOT NULL,
    last_login INTEGER
);

-- Brutos table
CREATE TABLE IF NOT EXISTS brutos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,

    -- Stats
    hp INTEGER DEFAULT 60,
    max_hp INTEGER DEFAULT 60,
    str INTEGER DEFAULT 2,
    speed INTEGER DEFAULT 2,
    agility INTEGER DEFAULT 2,
    resistance REAL DEFAULT 1.67,

    -- Appearance
    appearance_id INTEGER NOT NULL,
    color_variant INTEGER NOT NULL,

    -- Meta
    created_at INTEGER NOT NULL,
    last_battle INTEGER,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bruto Weapons (many-to-many)
CREATE TABLE IF NOT EXISTS bruto_weapons (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    weapon_id TEXT NOT NULL,
    acquired_at_level INTEGER NOT NULL,

    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

-- Bruto Skills (many-to-many)
CREATE TABLE IF NOT EXISTS bruto_skills (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    acquired_at_level INTEGER NOT NULL,

    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

-- Bruto Pets (many-to-many, max 4: 3 dogs + 1 other)
CREATE TABLE IF NOT EXISTS bruto_pets (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    pet_type TEXT NOT NULL, -- 'dog_a', 'dog_b', 'dog_c', 'panther', 'bear'
    acquired_at_level INTEGER NOT NULL,

    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

-- Battle History
CREATE TABLE IF NOT EXISTS battles (
    id TEXT PRIMARY KEY,
    player_bruto_id TEXT NOT NULL,
    opponent_bruto_id TEXT NOT NULL,

    -- Result
    winner_id TEXT,
    player_xp_gained INTEGER NOT NULL,
    player_hp_remaining INTEGER,
    opponent_hp_remaining INTEGER,

    -- Combat log (JSON string for replay)
    combat_log TEXT NOT NULL,

    -- RNG seed for replay
    rng_seed TEXT,

    -- Meta
    fought_at INTEGER NOT NULL,

    FOREIGN KEY (player_bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);

-- Daily Fight Tracker
CREATE TABLE IF NOT EXISTS daily_fights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    fight_date TEXT NOT NULL, -- YYYY-MM-DD
    fight_count INTEGER DEFAULT 0,
    max_fights INTEGER DEFAULT 6,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Level Up History (tracks choices made at each level)
CREATE TABLE IF NOT EXISTS level_up_history (
    id TEXT PRIMARY KEY,
    bruto_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    chosen_option TEXT NOT NULL, -- 'A' or 'B'
    chosen_at INTEGER NOT NULL,

    FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE
);
