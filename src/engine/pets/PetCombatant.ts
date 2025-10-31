/**
 * PetCombatant - Story 7.3
 * Defines combat-ready pet entities for battle system
 * 
 * Pets participate in combat with own stats, abilities, and turn order.
 * They attack independently and can be targeted/defeated.
 */

import { PetType } from './PetType';
import { PetStats } from './Pet';

export type CombatSide = 'player' | 'opponent';

/**
 * Combat-specific pet data
 * Separates combat logic from database/UI concerns
 */
export interface IPetCombatant {
  petType: PetType;
  petSlot: string | null;           // 'A', 'B', 'C' for Perros, null for others
  ownerSide: CombatSide;             // Which bruto owns this pet
  ownerId: string;                   // Bruto ID of owner
  stats: PetStats;                   // Combat stats from catalog
  currentHp: number;                 // Mutable HP during battle
  isDefeated: boolean;               // Knockout state
}

/**
 * Pet combat ability types
 */
export enum PetAbility {
  NONE = 'none',
  DISARM = 'disarm'                  // Oso exclusive ability
}

/**
 * Pet disarm event data
 */
export interface PetDisarmEvent {
  petType: PetType;
  targetSide: CombatSide;
  success: boolean;
  weaponRemoved?: string;            // Weapon type if successful
}

/**
 * Factory function to create combat-ready pet
 */
export function createPetCombatant(
  petType: PetType,
  petSlot: string | null,
  ownerSide: CombatSide,
  ownerId: string,
  stats: PetStats
): IPetCombatant {
  return {
    petType,
    petSlot,
    ownerSide,
    ownerId,
    stats,
    currentHp: stats.hp,
    isDefeated: false
  };
}

/**
 * Get pet display name for combat log
 */
export function getPetDisplayName(pet: IPetCombatant): string {
  if (pet.petSlot) {
    return `${pet.petType} ${pet.petSlot}`;
  }
  return pet.petType;
}

/**
 * Check if pet has special ability
 */
export function getPetAbility(petType: PetType): PetAbility {
  if (petType === PetType.OSO) {
    return PetAbility.DISARM;
  }
  return PetAbility.NONE;
}
