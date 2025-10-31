import { Weapon } from '../../models/Weapon';

/**
 * Story 5.4: Disarm Mechanic
 * 
 * Handles weapon disarm mechanics during combat:
 * - AC1: Disarm chance checked per weapon hit
 * - AC2: Disarmed opponent deals reduced damage (bare hands only)
 * - AC3: Weapon returns after combat or after X turns
 */

export interface DisarmedWeapon {
  weaponId: string;
  turnsRemaining: number;
  originallyEquipped: boolean;
}

export interface DisarmState {
  attackerDisarmedWeapons: DisarmedWeapon[];
  defenderDisarmedWeapons: DisarmedWeapon[];
}

export class DisarmService {
  private static readonly BASE_DISARM_CHANCE = 5; // Base 5% chance
  private static readonly DISARM_DURATION_TURNS = 3; // Weapons return after 3 turns

  /**
   * Calculate total disarm chance for an attack
   * AC1: Disarm chance checked per weapon hit
   * 
   * @param attackerWeapon - Weapon being used to attack (can be null for bare hands)
   * @param attackerStats - Bruto stats (dexterity affects disarm)
   * @returns Disarm chance percentage (0-100)
   */
  static calculateDisarmChance(
    attackerWeapon: Weapon | null,
    attackerDexterity: number
  ): number {
    let disarmChance = this.BASE_DISARM_CHANCE;

    // Add weapon's disarm modifier
    if (attackerWeapon?.modifiers?.disarm) {
      disarmChance += attackerWeapon.modifiers.disarm;
    }

    // Dexterity affects disarm chance (every 10 points of dexterity = +1% disarm)
    const dexterityBonus = Math.floor(attackerDexterity / 10);
    disarmChance += dexterityBonus;

    // Clamp between 0 and 95 (never 100% guaranteed)
    return Math.max(0, Math.min(95, disarmChance));
  }

  /**
   * Check if a disarm attempt succeeds
   * AC1: Disarm chance checked per weapon hit
   * 
   * @param disarmChance - Calculated disarm chance percentage
   * @returns true if disarm succeeds
   */
  static attemptDisarm(disarmChance: number): boolean {
    const roll = Math.random() * 100;
    return roll < disarmChance;
  }

  /**
   * Apply disarm effect to a combatant
   * AC2: Disarmed opponent deals reduced damage
   * AC3: Weapon returns after X turns
   * 
   * @param equippedWeapons - Currently equipped weapons
   * @returns Weapon that was disarmed (randomly selected from equipped)
   */
  static applyDisarm(equippedWeapons: Weapon[]): DisarmedWeapon | null {
    if (equippedWeapons.length === 0) {
      return null; // Can't disarm bare hands
    }

    // Randomly select one equipped weapon to disarm
    const randomIndex = Math.floor(Math.random() * equippedWeapons.length);
    const weaponToDisarm = equippedWeapons[randomIndex];

    return {
      weaponId: weaponToDisarm.id,
      turnsRemaining: this.DISARM_DURATION_TURNS,
      originallyEquipped: true,
    };
  }

  /**
   * Get weapons that are currently available (not disarmed)
   * AC2: Disarmed opponent deals reduced damage
   * 
   * @param allEquippedWeapons - All equipped weapons
   * @param disarmedWeapons - Currently disarmed weapons
   * @returns Weapons that can be used in combat
   */
  static getAvailableWeapons(
    allEquippedWeapons: Weapon[],
    disarmedWeapons: DisarmedWeapon[]
  ): Weapon[] {
    const disarmedIds = new Set(disarmedWeapons.map(d => d.weaponId));
    return allEquippedWeapons.filter(w => !disarmedIds.has(w.id));
  }

  /**
   * Update disarm timers at the end of a turn
   * AC3: Weapon returns after X turns
   * 
   * @param disarmedWeapons - Currently disarmed weapons
   * @returns Updated list with decremented timers (recovered weapons removed)
   */
  static updateDisarmTimers(disarmedWeapons: DisarmedWeapon[]): DisarmedWeapon[] {
    return disarmedWeapons
      .map(weapon => ({
        ...weapon,
        turnsRemaining: weapon.turnsRemaining - 1,
      }))
      .filter(weapon => weapon.turnsRemaining > 0);
  }

  /**
   * Recover all disarmed weapons at end of combat
   * AC3: Weapon returns after combat
   * 
   * @returns Empty array (all weapons recovered)
   */
  static recoverAllWeapons(): DisarmedWeapon[] {
    return [];
  }

  /**
   * Initialize empty disarm state for a new battle
   */
  static initializeDisarmState(): DisarmState {
    return {
      attackerDisarmedWeapons: [],
      defenderDisarmedWeapons: [],
    };
  }

  /**
   * Check if a specific weapon is currently disarmed
   * 
   * @param weaponId - ID of the weapon to check
   * @param disarmedWeapons - List of disarmed weapons
   * @returns true if weapon is disarmed
   */
  static isWeaponDisarmed(weaponId: string, disarmedWeapons: DisarmedWeapon[]): boolean {
    return disarmedWeapons.some(d => d.weaponId === weaponId);
  }

  /**
   * Get the number of turns remaining until weapon is recovered
   * 
   * @param weaponId - ID of the weapon
   * @param disarmedWeapons - List of disarmed weapons
   * @returns Number of turns remaining, or 0 if not disarmed
   */
  static getTurnsUntilRecovery(weaponId: string, disarmedWeapons: DisarmedWeapon[]): number {
    const disarmed = disarmedWeapons.find(d => d.weaponId === weaponId);
    return disarmed ? disarmed.turnsRemaining : 0;
  }
}
