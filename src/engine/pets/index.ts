/**
 * Pets Module - Stories 7.1, 7.2 & 7.3
 * Central exports for pet system
 */

// Story 7.1: Data Model & Validation
export { PetType } from './PetType';
export type { Pet, PetStats, ResistanceCost, BrutoPet, PetSlot } from './Pet';
export { PetCatalog } from './PetCatalog';
export { PetCostCalculator } from './PetCostCalculator';
export { PetStackingValidator } from './PetStackingValidator';
export type { ValidationResult } from './PetStackingValidator';

// Story 7.2: Stats & Combat
export { PetStatsService } from './PetStatsService';
export type { PetStatsSummary } from './PetStatsService';
export type { PetCombatModifiers, CombatStatsWithPets } from './PetCombatStats';
export {
  calculateMultiHitChance,
  calculateEvasionChance,
  calculateInitiative
} from './PetCombatStats';

// Story 7.3: Combat AI
export type { IPetCombatant, PetDisarmEvent } from './PetCombatant';
export { PetAbility, createPetCombatant, getPetDisplayName, getPetAbility } from './PetCombatant';
export { PetCombatService } from './PetCombatService';
export type { PetAttackResult } from './PetCombatService';
