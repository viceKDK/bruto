-- Migration 007: Pets System - Story 7.1
-- Creates table for tracking pet ownership by brutos
-- Supports pet stacking rules (max 3 Perros with slots A, B, C)
-- Enforces mutual exclusion (Pantera XOR Oso)

CREATE TABLE IF NOT EXISTS bruto_pets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bruto_id INTEGER NOT NULL,
  pet_type TEXT NOT NULL CHECK(pet_type IN ('perro', 'pantera', 'oso')),
  pet_slot TEXT CHECK(pet_slot IN ('A', 'B', 'C') OR pet_slot IS NULL),
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acquired_level INTEGER NOT NULL,
  
  FOREIGN KEY (bruto_id) REFERENCES brutos(id) ON DELETE CASCADE,
  
  -- Unique constraint: Each bruto can have one pet per slot
  -- For Perros: slots A, B, C (up to 3)
  -- For Pantera/Oso: slot is NULL (max 1 each)
  UNIQUE(bruto_id, pet_type, pet_slot)
);

-- Index for fast pet lookups by bruto
CREATE INDEX IF NOT EXISTS idx_bruto_pets_bruto_id ON bruto_pets(bruto_id);

-- Index for pet type queries
CREATE INDEX IF NOT EXISTS idx_bruto_pets_type ON bruto_pets(pet_type);
