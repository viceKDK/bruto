/**
 * DamageCalculator - Combat damage calculation engine
 * 
 * Pure calculation logic for damage, crits, dodges
 * Zero game state - calculations only
 */

import { IBrutoCombatant } from '../../models/Bruto';
import { 
  ARMOR_CAP_PERCENT, 
  EVASION_CAP_PERCENT, 
  CRIT_CHANCE_CAP_PERCENT 
} from '../../utils/constants';

export interface DamageModifiers {
  weaponDamage?: number; // Epic 5 integration point
  skillDamageBonus?: number; // Epic 6 integration point
  critChanceBonus?: number; // Epic 5-6 integration point
  critDamageBonus?: number; // Critical damage multiplier bonus (e.g., Meditación: +50%)
  multiHitChance?: number; // Epic 5-6 integration point
  armorBonus?: number; // Epic 6: Passive armor skills (Piel Dura, Esqueleto de Plomo)
  evasionBonus?: number; // Epic 6: Passive evasion skills (Reflejos Felinos)
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
  ): number {
    const baseDamage = attacker.stats.str + (modifiers.weaponDamage || 0);
    const skillDamage = modifiers.skillDamageBonus || 0;
    
    // Apply armor bonus from passive skills (Piel Dura, Esqueleto de Plomo)
    const totalResistance = defender.stats.resistance + (modifiers.armorBonus || 0);
    const resistanceReduction = 1 - Math.min(ARMOR_CAP_PERCENT / 100, totalResistance * 0.01);
    
    const totalDamage = (baseDamage + skillDamage) * resistanceReduction;
    return Math.max(1, Math.floor(totalDamage));
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
   * Base is 2x (200%), modifiable by skills like Meditación (+50% = x3)
   */
  public calculateCritMultiplier(attacker: IBrutoCombatant, modifiers: DamageModifiers = {}): number {
    // Base critical multiplier is 2x (200%)
    let multiplier = 2.0;

    // Apply crit damage bonus from skills (e.g., Meditación: +50%)
    if (modifiers.critDamageBonus) {
      multiplier += modifiers.critDamageBonus; // +0.5 = 2.5x, +1.0 = 3.0x
    }

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
    return Math.min(CRIT_CHANCE_CAP_PERCENT / 100, critChance);
  }

  /**
   * Calculate dodge chance from Agility stat + passive skill modifiers
   * Per GDD Section 12: Agility × 0.1 (cap 95%)
   * Epic 6: +Reflejos Felinos bonus, -Esqueleto de Plomo penalty
   */
  public getDodgeChance(defender: IBrutoCombatant, modifiers: DamageModifiers = {}): number {
    // Base dodge from agility
    // Agility × 0.1 (Agility 10 = 10% dodge)
    let dodgeChance = defender.stats.agility * 0.1;
    
    // Apply evasion bonus/penalty from passive skills
    if (modifiers.evasionBonus) {
      dodgeChance += modifiers.evasionBonus;
    }

    // Cap at 95% max dodge
    return Math.min(EVASION_CAP_PERCENT / 100, Math.max(0, dodgeChance));
  }  /**
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
