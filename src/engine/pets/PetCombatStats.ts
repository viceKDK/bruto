/**
 * PetCombatStats - Story 7.2
 * Combat stats modifiers from pets
 * 
 * These interfaces extend combat calculations with pet-specific modifiers
 * like multi-hit chance, evasion chance, and initiative
 */

export interface PetCombatModifiers {
  multiHitChance: number;      // Percentage modifier (-20 to +60)
  evasionChance: number;       // Percentage modifier (0 to +5)
  initiative: number;          // Turn order modifier (-10 to +15)
}

export interface CombatStatsWithPets {
  hp: number;
  str: number;
  agility: number;
  speed: number;
  resistance: number;
  petModifiers: PetCombatModifiers;
}

/**
 * Calculate effective multi-hit chance including pet modifiers
 * @param baseChance Base multi-hit chance (typically 0)
 * @param petBonus Pet multi-hit bonus (sum of all pets)
 * @returns Effective multi-hit chance (0-100%)
 */
export function calculateMultiHitChance(
  baseChance: number,
  petBonus: number
): number {
  const total = baseChance + petBonus;
  return Math.max(0, Math.min(100, total));
}

/**
 * Calculate effective evasion chance including pet modifiers
 * @param agilityEvasion Evasion from agility stat
 * @param petBonus Pet evasion bonus
 * @returns Effective evasion chance (0-95%)
 */
export function calculateEvasionChance(
  agilityEvasion: number,
  petBonus: number
): number {
  const total = agilityEvasion + petBonus;
  return Math.max(0, Math.min(95, total));
}

/**
 * Calculate initiative for turn order
 * @param speed Bruto speed stat
 * @param petInitiative Pet initiative modifier
 * @returns Initiative value for combat ordering
 */
export function calculateInitiative(
  speed: number,
  petInitiative: number
): number {
  return speed + petInitiative;
}
