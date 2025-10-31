/**
 * Game Constants
 * Centralized game-wide constants following architecture conventions
 */

// Bruto limits
export const MAX_BRUTOS_DEFAULT = 3;
export const MAX_BRUTOS_WITH_UNLOCK = 4;
export const BRUTO_SLOT_UNLOCK_COST = 500;

// Daily limits
export const DAILY_FIGHT_LIMIT_DEFAULT = 6;
export const DAILY_FIGHT_LIMIT_WITH_REGENERATION = 8;

// Initial stats
export const INITIAL_HP = 60;
export const INITIAL_STR = 2;
export const INITIAL_SPEED = 2;
export const INITIAL_AGILITY = 2;
export const INITIAL_RESISTANCE = 1.67;

// XP rewards
export const XP_FOR_WIN = 2;
export const XP_FOR_LOSS = 1;

// Level milestone
export const FIRST_COIN_REWARD_LEVEL = 10;
export const FIRST_COIN_REWARD_AMOUNT = 100;

// Combat balance - Story 6.6: Skill stacking caps
export const ARMOR_CAP_PERCENT = 75;
export const EVASION_CAP_PERCENT = 95;
export const CRIT_CHANCE_CAP_PERCENT = 50; // Max crit chance from skills (weapons can add more)
export const MULTI_HIT_CAP_PERCENT = 50;
export const RESISTANCE_CAP_PERCENT = 75;

// Active ability thresholds - Story 6.5
export const FUERZA_BRUTA_STR_DIVISOR = 30; // Uses = floor(STR / 30) + 1
export const POCION_TRAGICA_MIN_HEAL_PERCENT = 0.25;
export const POCION_TRAGICA_MAX_HEAL_PERCENT = 0.50;
export const POCION_TRAGICA_USE_THRESHOLD = 0.75; // Use when HP < 75%

// Combat mechanics
export const EXTRA_TURN_SPEED_MULTIPLIER = 0.05;
export const EXTRA_TURN_CAP_PERCENT = 0.60;
