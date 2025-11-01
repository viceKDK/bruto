/**
 * WeaponCombatService - Story 5 Integration
 * 
 * Bridges weapon system with combat engine
 * Converts equipped weapons to combat modifiers
 */

import { Weapon } from '../../models/Weapon';
import { DamageModifiers } from './DamageCalculator';
import weaponsData from '../../data/weapons.json';

/**
 * Interface for weapon service (Dependency Inversion Principle)
 * Allows CombatEngine to depend on abstraction, not concrete implementation
 */
export interface IWeaponCombatService {
  getWeapon(weaponId: string): Weapon | null;
  calculateWeaponDamage(equippedWeaponIds: string[]): number;
  calculateCombatModifiers(
    equippedWeapons: string[],
    disarmedWeapons?: string[]
  ): DamageModifiers;
  getDisarmChanceModifier(equippedWeapons: string[], disarmedWeapons: string[]): number;
  hasWeapons(equippedWeapons?: string[]): boolean;
  getWeaponNames(weaponIds: string[]): string[];
}

/**
 * Service that calculates combat modifiers from equipped weapons
 */
export class WeaponCombatService implements IWeaponCombatService {
  private weaponCatalog: Map<string, Weapon>;

  constructor() {
    this.weaponCatalog = new Map();
    this.loadWeaponCatalog();
  }

  /**
   * Load weapon catalog from JSON data
   */
  private loadWeaponCatalog(): void {
    const weapons = weaponsData as Weapon[];
    weapons.forEach(weapon => {
      this.weaponCatalog.set(weapon.id, weapon);
    });
  }

  /**
   * Get weapon by ID
   */
  public getWeapon(weaponId: string): Weapon | null {
    return this.weaponCatalog.get(weaponId) || null;
  }

  /**
   * Calculate total damage bonus from equipped weapons
   * Story 5.2: Sum damage from all equipped weapons (max 3)
   */
  public calculateWeaponDamage(equippedWeaponIds: string[]): number {
    let totalDamage = 0;

    for (const weaponId of equippedWeaponIds) {
      const weapon = this.getWeapon(weaponId);
      if (weapon) {
        totalDamage += weapon.damage;
      }
    }

    return totalDamage;
  }

  /**
   * Calculate aggregate weapon modifiers for combat
   * Story 5.2: Combines modifiers from all equipped weapons
   * Story 5.4: Falls back to bare-hands when all weapons disarmed
   * 
   * Modifiers stack additively (e.g., +10% crit + +5% crit = +15% crit)
   * 
   * @param equippedWeaponIds - Array of weapon IDs (max 3)
   * @param disarmedWeaponIds - Array of temporarily disarmed weapon IDs (Story 5.4)
   * @returns DamageModifiers object for combat calculations
   */
  public calculateCombatModifiers(
    equippedWeaponIds: string[],
    disarmedWeaponIds: string[] = []
  ): DamageModifiers {
    const modifiers: DamageModifiers = {};
    
    // Filter out disarmed weapons (Story 5.4)
    let activeWeaponIds = equippedWeaponIds.filter(
      id => !disarmedWeaponIds.includes(id)
    );

    // If all weapons are disarmed, fall back to bare-hands
    if (activeWeaponIds.length === 0 && equippedWeaponIds.length > 0) {
      activeWeaponIds = ['bare-hands'];
    }

    // Calculate total damage from active weapons
    modifiers.weaponDamage = this.calculateWeaponDamage(activeWeaponIds);

    // Aggregate modifiers from all active weapons
    let critChanceBonus = 0;
    let evasionBonus = 0;
    let armorBonus = 0;
    let blockBonus = 0;
    let accuracyBonus = 0;
    let dexterityBonus = 0;

    for (const weaponId of activeWeaponIds) {
      const weapon = this.getWeapon(weaponId);
      if (!weapon || !weapon.modifiers) continue;

      // Critical chance modifier (percentage converted to decimal)
      if (weapon.modifiers.criticalChance !== undefined) {
        critChanceBonus += weapon.modifiers.criticalChance / 100;
      }

      // Evasion modifier (percentage converted to decimal)
      if (weapon.modifiers.evasion !== undefined) {
        evasionBonus += weapon.modifiers.evasion / 100;
      }

      // Armor/Resistance modifier (e.g., Shield +20% block)
      if (weapon.modifiers.armor !== undefined) {
        armorBonus += weapon.modifiers.armor;
      }

      // Block modifier (percentage)
      if (weapon.modifiers.block !== undefined) {
        blockBonus += weapon.modifiers.block;
      }

      // Accuracy modifier (percentage)
      if (weapon.modifiers.accuracy !== undefined) {
        accuracyBonus += weapon.modifiers.accuracy;
      }

      // Dexterity modifier (percentage)
      if (weapon.modifiers.dexterity !== undefined) {
        dexterityBonus += weapon.modifiers.dexterity;
      }
    }

    // Set modifiers if they have non-zero values
    if (critChanceBonus !== 0) {
      modifiers.critChanceBonus = critChanceBonus;
    }

    if (evasionBonus !== 0) {
      modifiers.evasionBonus = evasionBonus;
    }

    if (armorBonus !== 0) {
      modifiers.armorBonus = armorBonus;
    }

    // Store additional modifiers for future use (combo, deflect, etc.)
    // These will be used when implementing advanced combat mechanics
    if (blockBonus !== 0 || accuracyBonus !== 0 || dexterityBonus !== 0) {
      // For now, these contribute to evasion/armor calculations
      // Future: Implement dedicated block/accuracy systems
      const additionalEvasion = (dexterityBonus + accuracyBonus) / 200; // Convert to decimal
      if (additionalEvasion !== 0) {
        modifiers.evasionBonus = (modifiers.evasionBonus || 0) + additionalEvasion;
      }
    }

    return modifiers;
  }

  /**
   * Get disarm chance modifier from equipped weapons
   * Story 5.4: Weapon disarm mechanics
   * 
   * @param equippedWeaponIds - Array of weapon IDs
   * @param disarmedWeaponIds - Array of temporarily disarmed weapon IDs
   * @returns Total disarm chance bonus as percentage (0-100)
   */
  public getDisarmChanceModifier(
    equippedWeaponIds: string[],
    disarmedWeaponIds: string[] = []
  ): number {
    let disarmBonus = 0;

    // Filter out disarmed weapons
    const activeWeaponIds = equippedWeaponIds.filter(
      id => !disarmedWeaponIds.includes(id)
    );

    for (const weaponId of activeWeaponIds) {
      const weapon = this.getWeapon(weaponId);
      if (weapon && weapon.modifiers && weapon.modifiers.disarm !== undefined) {
        disarmBonus += weapon.modifiers.disarm;
      }
    }

    return disarmBonus;
  }

  /**
   * Check if bruto has any weapons equipped
   */
  public hasWeapons(equippedWeaponIds: string[] | undefined): boolean {
    return !!equippedWeaponIds && equippedWeaponIds.length > 0;
  }

  /**
   * Get list of all equipped weapon names for UI display
   */
  public getWeaponNames(equippedWeaponIds: string[]): string[] {
    const names: string[] = [];

    for (const weaponId of equippedWeaponIds) {
      const weapon = this.getWeapon(weaponId);
      if (weapon) {
        names.push(weapon.name);
      }
    }

    return names;
  }

  /**
   * @deprecated Use getWeaponNames instead
   */
  public getEquippedWeaponNames(equippedWeaponIds: string[]): string[] {
    return this.getWeaponNames(equippedWeaponIds);
  }
}
