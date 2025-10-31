/**
 * PetCombatService - Story 7.3
 * Handles pet combat logic: attacks, damage, special abilities
 * 
 * Responsibilities:
 * - Execute pet attacks with pet's own stats
 * - Calculate pet attack damage based on damage tier
 * - Handle Oso disarm special ability
 * - Process pet damage and knockout
 */

import { IPetCombatant, PetAbility, PetDisarmEvent, getPetAbility, CombatSide } from './PetCombatant';
import { PetType } from './PetType';
import { SeededRandom } from '../../utils/SeededRandom';

export interface PetAttackResult {
  attacker: IPetCombatant;
  targetSide: CombatSide;
  hit: boolean;
  damage: number;
  isCritical: boolean;
  disarmEvent?: PetDisarmEvent;
}

/**
 * Pet damage tiers based on pet type
 * From docs/stast.md: Perro (Bajo), Pantera (Medio), Oso (Alto)
 */
const PET_DAMAGE_TIERS: Record<PetType, { min: number; max: number }> = {
  [PetType.PERRO]: { min: 3, max: 7 },      // Bajo
  [PetType.PANTERA]: { min: 8, max: 15 },   // Medio
  [PetType.OSO]: { min: 18, max: 30 }       // Alto
};

/**
 * Oso disarm chance
 * Documented as "rara vez" (rare) - implementing as 15% base chance
 */
const OSO_DISARM_CHANCE = 0.15;

export class PetCombatService {
  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  /**
   * Execute pet attack against target
   * @param attacker Pet executing the attack
   * @param targetSide Which side is being attacked
   * @param targetAgility Target's agility for evasion
   * @param targetHasWeapon Whether target has weapon (for disarm)
   * @returns Attack result with damage and effects
   */
  public executePetAttack(
    attacker: IPetCombatant,
    targetSide: CombatSide,
    targetAgility: number,
    targetHasWeapon: boolean = false
  ): PetAttackResult {
    // Calculate hit chance based on pet's agility
    const hitChance = this.calculateHitChance(attacker.stats.agility, targetAgility);
    const hit = this.rng.roll(hitChance);

    let damage = 0;
    let isCritical = false;
    let disarmEvent: PetDisarmEvent | undefined;

    if (hit) {
      // Calculate damage from pet's damage tier
      damage = this.calculatePetDamage(attacker.petType);

      // Check for critical hit (using pet's multi-hit as crit chance)
      const critChance = Math.max(0, attacker.stats.multiHitChance / 100);
      isCritical = this.rng.roll(critChance);

      if (isCritical) {
        damage = Math.floor(damage * 1.5); // 50% bonus on crit
      }

      // Check for Oso disarm ability
      if (targetHasWeapon) {
        disarmEvent = this.attemptDisarm(attacker, targetSide);
      }
    }

    return {
      attacker,
      targetSide,
      hit,
      damage,
      isCritical,
      disarmEvent
    };
  }

  /**
   * Apply damage to pet
   * @param pet Pet receiving damage
   * @param damage Amount of damage
   * @returns Updated pet with new HP
   */
  public applyDamageToPet(pet: IPetCombatant, damage: number): IPetCombatant {
    const newHp = Math.max(0, pet.currentHp - damage);
    const isDefeated = newHp === 0;

    return {
      ...pet,
      currentHp: newHp,
      isDefeated
    };
  }

  /**
   * Calculate hit chance based on attacker agility vs target agility
   * Base hit chance 70%, +2% per agility difference
   */
  private calculateHitChance(attackerAgility: number, targetAgility: number): number {
    const baseHitChance = 0.70;
    const agilityDifference = attackerAgility - targetAgility;
    const agilityModifier = agilityDifference * 0.02;

    const finalChance = baseHitChance + agilityModifier;
    return Math.max(0.05, Math.min(0.95, finalChance)); // Clamp 5-95%
  }

  /**
   * Calculate damage from pet's damage tier
   */
  private calculatePetDamage(petType: PetType): number {
    const tier = PET_DAMAGE_TIERS[petType];
    return this.rng.nextInt(tier.min, tier.max);
  }

  /**
   * Attempt Oso disarm ability
   */
  private attemptDisarm(
    attacker: IPetCombatant,
    targetSide: CombatSide
  ): PetDisarmEvent | undefined {
    const ability = getPetAbility(attacker.petType);

    if (ability !== PetAbility.DISARM) {
      return undefined;
    }

    const success = this.rng.roll(OSO_DISARM_CHANCE);

    return {
      petType: attacker.petType,
      targetSide,
      success,
      weaponRemoved: success ? 'weapon' : undefined // Simplified - actual weapon type would come from target
    };
  }

  /**
   * Calculate pet initiative for turn ordering
   * From docs: Perro -10, Pantera -60, Oso -360
   * Lower initiative = faster turn
   */
  public calculatePetInitiative(petType: PetType, baseSpeed: number): number {
    const baseInitiative = 1000;
    const speedModifier = baseSpeed * -10;

    // Pet-specific initiative modifiers from docs/stast.md
    const petModifiers: Record<PetType, number> = {
      [PetType.PERRO]: -10,
      [PetType.PANTERA]: -60,
      [PetType.OSO]: -360
    };

    const petModifier = petModifiers[petType];
    return baseInitiative + speedModifier + petModifier;
  }
}
