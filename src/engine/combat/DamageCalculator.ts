/**
 * DamageCalculator - Combat damage formula calculations
 *
 * Implements all damage calculations per GDD Section 12:
 * - Base damage = STR value directly
 * - Critical hits = 2x damage multiplier
 * - Resistance-based damage reduction
 * - Weapon/skill modifier hooks for Epic 5-6
 */

import { IBrutoCombatant } from '../../models/Bruto';

export interface DamageModifiers {
  weaponDamage?: number; // Epic 5 integration point
  skillDamageBonus?: number; // Epic 6 integration point
  critChanceBonus?: number; // Epic 5-6 integration point
  multiHitChance?: number; // Epic 5-6 integration point
}

export interface DamageResult {
  raw: number; // Base damage before mitigation
  mitigated: number; // Damage reduced by resistance
  final: number; // Actual damage dealt
  breakdown: string[]; // Detailed calculation steps
}

/**
 * Calculates damage values using combat formulas from GDD
 */
export class DamageCalculator {
  /**
   * Calculate base attack damage (STR value)
   * Per GDD: "damage = STR value" (STR 5 = 5 damage)
   */
  public calculateBaseDamage(attacker: IBrutoCombatant, modifiers: DamageModifiers = {}): number {
    let damage = attacker.stats.str;

    // Epic 5: Weapon damage will add here
    if (modifiers.weaponDamage) {
      damage += modifiers.weaponDamage;
    }

    // Epic 6: Skill damage bonus will add here
    if (modifiers.skillDamageBonus) {
      damage += modifiers.skillDamageBonus;
    }

    return Math.max(0, damage);
  }

  /**
   * Calculate physical attack damage with full breakdown
   * Applies resistance-based damage reduction
   */
  public calculatePhysicalDamage(
    attacker: IBrutoCombatant,
    defender: IBrutoCombatant,
    modifiers: DamageModifiers = {}
  ): DamageResult {
    const breakdown: string[] = [];

    // Base damage
    const raw = this.calculateBaseDamage(attacker, modifiers);
    breakdown.push(`Base (STR ${attacker.stats.str}): ${raw}`);

    // Resistance damage reduction
    // Per architecture: resistance reduces damage (1 - min(0.75, resistance × 0.01))
    const resistanceFactor = Math.min(0.75, defender.stats.resistance * 0.01);
    const damageReduction = 1 - resistanceFactor;
    const mitigated = Math.floor(raw * damageReduction);

    if (resistanceFactor > 0) {
      breakdown.push(`Resistance (${defender.stats.resistance}): -${Math.floor((1 - damageReduction) * 100)}%`);
    }

    const final = Math.max(0, mitigated);
    breakdown.push(`Final: ${final}`);

    return {
      raw,
      mitigated,
      final,
      breakdown,
    };
  }

  /**
   * Apply critical strike multiplier (2x damage)
   * Per GDD: "Critical Hit - Chance for double damage"
   */
  public applyCriticalMultiplier(damage: number): number {
    return Math.floor(damage * 2);
  }

  /**
   * Calculate critical hit multiplier
   * Base is 2x, but returns configurable for future expansion
   */
  public calculateCritMultiplier(attacker: IBrutoCombatant, modifiers: DamageModifiers = {}): number {
    // Base critical multiplier is 2x
    let multiplier = 2.0;

    // Epic 5-6: Weapon/skill crit multipliers can modify this
    // Sharp weapons have "high critical damage multiplier" per GDD

    return multiplier;
  }

  /**
   * Calculate base critical hit chance
   * Returns probability 0.0-1.0
   *
   * Base is 10%, modifiable by weapons/skills in Epic 5-6
   */
  public calculateCritChance(attacker: IBrutoCombatant, modifiers: DamageModifiers = {}): number {
    // Base 10% crit chance
    let critChance = 0.1;

    // Epic 5-6: Weapon/skill crit chance bonuses
    if (modifiers.critChanceBonus) {
      critChance += modifiers.critChanceBonus;
    }

    // Cap at 95% (same as dodge cap)
    return Math.min(0.95, critChance);
  }

  /**
   * Calculate dodge chance from Agility stat
   * Per GDD: "Dodge - Agility stat determines % chance to avoid attacks"
   * Per Architecture: Agility × 0.1 = dodge percentage
   */
  public getDodgeChance(defender: IBrutoCombatant): number {
    // Agility × 0.1 (Agility 10 = 10% dodge)
    const dodgeChance = defender.stats.agility * 0.1;

    // Cap at 95% max dodge
    return Math.min(0.95, dodgeChance);
  }

  /**
   * Calculate multi-hit chance from Speed stat
   * Per GDD: "Speed Advantage - Extra turn probability based on Speed stat"
   *
   * Multi-hit is separate from extra turns - happens within same turn
   * Base calculation: Speed × configurable factor
   */
  public calculateMultiHitChance(attacker: IBrutoCombatant, modifiers: DamageModifiers = {}): number {
    // Base multi-hit chance from Speed (conservative: 2% per Speed point)
    let multiHitChance = attacker.stats.speed * 0.02;

    // Epic 5-6: Weapon/skill multi-hit bonuses
    if (modifiers.multiHitChance) {
      multiHitChance += modifiers.multiHitChance;
    }

    // Cap at reasonable max (50%)
    return Math.min(0.5, multiHitChance);
  }

  /**
   * Calculate weapon attack trigger chance
   * Per GDD: "Weapon Attack - Chance to trigger based on weapon stats"
   *
   * Stub for Epic 5 - returns 0 for now (no weapons)
   */
  public calculateWeaponTriggerChance(attacker: IBrutoCombatant): number {
    // Epic 5: Will use weapon's "Odds" attribute
    // For now, no weapons equipped = 0% chance
    return 0;
  }

  /**
   * Calculate skill activation chance
   * Per GDD: "Skill Activation: Probability-based during combat turns"
   *
   * Stub for Epic 6 - returns 0 for now (no skills in combat yet)
   */
  public calculateSkillActivationChance(attacker: IBrutoCombatant): number {
    // Epic 6: Will check equipped skills and their activation probabilities
    // For now, no skills in combat = 0% chance
    return 0;
  }
}
