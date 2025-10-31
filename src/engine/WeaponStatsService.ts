import { Weapon, WeaponModifiers } from '../models/Weapon';
import { IBruto } from '../models/Bruto';

/**
 * WeaponStatsService
 * Handles weapon stat calculations and modifier application
 */
export class WeaponStatsService {
  /**
   * Calculate total damage including weapon bonus
   * Formula: Base STR damage + Weapon damage
   */
  static calculateTotalDamage(bruto: IBruto, weapon: Weapon | null): number {
    const baseDamage = bruto.str; // STR = base damage
    const weaponDamage = weapon ? weapon.damage : 0;
    return baseDamage + weaponDamage;
  }

  /**
   * Apply all weapon modifiers to combat stats
   * Returns modified stats object
   */
  static applyWeaponModifiers(
    baseStats: CombatStats,
    weapon: Weapon | null
  ): CombatStats {
    if (!weapon || !weapon.modifiers) {
      return { ...baseStats };
    }

    const modifiers = weapon.modifiers;
    const modifiedStats = { ...baseStats };

    // Apply each modifier as percentage increase/decrease
    if (modifiers.criticalChance !== undefined) {
      modifiedStats.criticalChance += this.applyPercentageModifier(
        baseStats.criticalChance,
        modifiers.criticalChance
      );
    }

    if (modifiers.evasion !== undefined) {
      modifiedStats.evasion += this.applyPercentageModifier(
        baseStats.evasion,
        modifiers.evasion
      );
    }

    if (modifiers.dexterity !== undefined) {
      modifiedStats.dexterity += this.applyPercentageModifier(
        baseStats.dexterity,
        modifiers.dexterity
      );
    }

    if (modifiers.accuracy !== undefined) {
      modifiedStats.accuracy += this.applyPercentageModifier(
        baseStats.accuracy,
        modifiers.accuracy
      );
    }

    if (modifiers.block !== undefined) {
      modifiedStats.block += this.applyPercentageModifier(
        baseStats.block,
        modifiers.block
      );
    }

    if (modifiers.disarm !== undefined) {
      modifiedStats.disarm += this.applyPercentageModifier(
        baseStats.disarm,
        modifiers.disarm
      );
    }

    if (modifiers.combo !== undefined) {
      modifiedStats.combo += this.applyPercentageModifier(
        baseStats.combo,
        modifiers.combo
      );
    }

    if (modifiers.deflect !== undefined) {
      modifiedStats.deflect += this.applyPercentageModifier(
        baseStats.deflect,
        modifiers.deflect
      );
    }

    if (modifiers.reversal !== undefined) {
      modifiedStats.reversal += this.applyPercentageModifier(
        baseStats.reversal,
        modifiers.reversal
      );
    }

    return modifiedStats;
  }

  /**
   * Apply percentage modifier to a base value
   * Example: base=50, modifier=20 -> returns 10 (20% of 50)
   * Example: base=50, modifier=-25 -> returns -12.5 (-25% of 50)
   */
  private static applyPercentageModifier(baseValue: number, modifier: number): number {
    return (baseValue * modifier) / 100;
  }

  /**
   * Calculate hit speed multiplier from weapon
   * Returns 1.0 for no weapon, weapon.hitSpeed/100 for equipped weapon
   */
  static getHitSpeedMultiplier(weapon: Weapon | null): number {
    if (!weapon) return 1.0;
    return weapon.hitSpeed / 100;
  }

  /**
   * Get weapon reach for combat order determination
   * Longer reach = attacks first
   */
  static getWeaponReach(weapon: Weapon | null): number {
    return weapon ? weapon.reach : 1; // Default reach is 1 (bare hands)
  }

  /**
   * Determine if weapon should be drawn this turn
   * Based on weapon's drawChance
   */
  static shouldDrawWeapon(weapon: Weapon | null): boolean {
    if (!weapon) return true; // Always use bare hands
    const roll = Math.random() * 100;
    return roll <= weapon.drawChance;
  }

  /**
   * Combine modifiers from multiple weapons
   * Used when bruto has multiple weapons equipped
   */
  static combineWeaponModifiers(weapons: Weapon[]): WeaponModifiers {
    const combined: WeaponModifiers = {};

    for (const weapon of weapons) {
      const modifiers = weapon.modifiers;
      
      if (modifiers.criticalChance !== undefined) {
        combined.criticalChance = (combined.criticalChance || 0) + modifiers.criticalChance;
      }
      if (modifiers.evasion !== undefined) {
        combined.evasion = (combined.evasion || 0) + modifiers.evasion;
      }
      if (modifiers.dexterity !== undefined) {
        combined.dexterity = (combined.dexterity || 0) + modifiers.dexterity;
      }
      if (modifiers.accuracy !== undefined) {
        combined.accuracy = (combined.accuracy || 0) + modifiers.accuracy;
      }
      if (modifiers.block !== undefined) {
        combined.block = (combined.block || 0) + modifiers.block;
      }
      if (modifiers.disarm !== undefined) {
        combined.disarm = (combined.disarm || 0) + modifiers.disarm;
      }
      if (modifiers.combo !== undefined) {
        combined.combo = (combined.combo || 0) + modifiers.combo;
      }
      if (modifiers.deflect !== undefined) {
        combined.deflect = (combined.deflect || 0) + modifiers.deflect;
      }
      if (modifiers.reversal !== undefined) {
        combined.reversal = (combined.reversal || 0) + modifiers.reversal;
      }
    }

    return combined;
  }

  /**
   * Select which weapon to use this turn from equipped weapons
   * Based on drawChance and random selection
   */
  static selectActiveWeapon(equippedWeapons: Weapon[]): Weapon | null {
    if (equippedWeapons.length === 0) return null;

    // Filter weapons that can be drawn this turn
    const availableWeapons = equippedWeapons.filter(w => this.shouldDrawWeapon(w));

    if (availableWeapons.length === 0) {
      return null; // No weapon drawn, use bare hands
    }

    // Random selection from available weapons
    const randomIndex = Math.floor(Math.random() * availableWeapons.length);
    return availableWeapons[randomIndex];
  }
}

/**
 * Combat Stats Interface
 * Base stats that can be modified by weapons
 */
export interface CombatStats {
  criticalChance: number;
  evasion: number;
  dexterity: number;
  accuracy: number;
  block: number;
  disarm: number;
  combo: number;
  deflect: number;
  reversal: number;
}
