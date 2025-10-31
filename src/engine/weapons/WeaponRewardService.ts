import weaponsData from '../../data/weapons.json';
import { Weapon } from '../../models/Weapon';
import { WeaponRepository } from '../../database/repositories/WeaponRepository';

/**
 * Story 5.6: Weapon Acquisition
 * 
 * Handles weapon acquisition through level-up rewards:
 * - AC1: Weapons offered as level-up choice (Weapon OR Skill option)
 * - AC2: Weapon ownership persisted to database
 * - AC3: Acquisition UI shows new weapon (handled by UI layer)
 * 
 * Level-up has 3 options:
 * - Option A: Weapon OR Skill (only one, randomly determined)
 * - Option B: +1 stat
 * - Option C: +2 stats split
 */

export interface WeaponAcquisitionResult {
  weaponId: string;
  weaponName: string;
  weaponNameEs: string;
  alreadyOwned: boolean;
  autoEquipped: boolean;
}

export class WeaponRewardService {
  private weaponRepository: WeaponRepository;

  constructor(weaponRepository: WeaponRepository) {
    this.weaponRepository = weaponRepository;
  }

  /**
   * Select a random weapon based on weighted odds
   * AC1: Level-up reward option (weapon OR skill, not both)
   * 
   * @param excludeOwnedWeaponIds - Weapon IDs already owned by bruto
   * @returns Random weapon, or null if no weapons available
   */
  selectRandomWeapon(excludeOwnedWeaponIds: string[] = []): Weapon | null {
    const weapons = weaponsData as Weapon[];
    
    // Filter out bare-hands and owned weapons
    const availableWeapons = weapons.filter(
      w => w.id !== 'bare-hands' && !excludeOwnedWeaponIds.includes(w.id)
    );

    if (availableWeapons.length === 0) {
      return null; // No weapons available
    }

    // Calculate total weight
    const totalWeight = availableWeapons.reduce((sum, w) => sum + w.odds, 0);

    // Random selection based on weighted odds
    let random = Math.random() * totalWeight;
    
    for (const weapon of availableWeapons) {
      random -= weapon.odds;
      if (random <= 0) {
        return weapon;
      }
    }

    // Fallback to last weapon (shouldn't happen with proper odds)
    return availableWeapons[availableWeapons.length - 1];
  }

  /**
   * Acquire a specific weapon for a bruto
   * AC2: Weapon ownership persisted to database
   * 
   * @param brutoId - ID of the bruto
   * @param weaponId - ID of the weapon to acquire
   * @param autoEquip - Whether to auto-equip the weapon
   * @returns Acquisition result
   */
  async acquireWeapon(
    brutoId: number,
    weaponId: string,
    autoEquip: boolean = false
  ): Promise<WeaponAcquisitionResult | null> {
    const weapons = weaponsData as Weapon[];
    const weapon = weapons.find(w => w.id === weaponId);

    if (!weapon) {
      return null; // Invalid weapon ID
    }

    // Check if already owned
    const alreadyOwned = await this.weaponRepository.hasBrutoWeapon(brutoId, weaponId);

    // Add to inventory if not owned
    if (!alreadyOwned) {
      await this.weaponRepository.addWeaponToBruto(brutoId, weaponId);

      // Auto-equip if requested
      if (autoEquip) {
        await this.weaponRepository.equipWeapon(brutoId, weaponId);
      }
    }

    return {
      weaponId: weapon.id,
      weaponName: weapon.name,
      weaponNameEs: weapon.nameEs,
      alreadyOwned,
      autoEquipped: autoEquip && !alreadyOwned,
    };
  }

  /**
   * Grant starter weapons to a new bruto
   * AC2: Weapon ownership persisted to database
   * 
   * @param brutoId - ID of the new bruto
   * @param weaponIds - IDs of starter weapons to grant
   * @returns Array of acquisition results
   */
  async acquireStarterWeapons(
    brutoId: number,
    weaponIds: string[]
  ): Promise<WeaponAcquisitionResult[]> {
    const results: WeaponAcquisitionResult[] = [];

    for (const weaponId of weaponIds) {
      const result = await this.acquireWeapon(brutoId, weaponId, false);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get a random weapon for level-up choice (optional reward)
   * AC1: Weapons granted via victory rewards with odds
   * 
   * @param brutoId - ID of the bruto
   * @returns Random weapon option, or null if none available
   */
  async getLevelUpWeaponOption(brutoId: number): Promise<Weapon | null> {
    // Get owned weapons to filter selection
    const ownedWeapons = await this.weaponRepository.getByBrutoId(brutoId);
    const ownedIds = ownedWeapons.map((w: Weapon) => w.id);
    return this.selectRandomWeapon(ownedIds);
  }

  /**
   * Get all weapons available in the catalog
   * 
   * @returns All weapons (excluding bare-hands)
   */
  getAllWeapons(): Weapon[] {
    const weapons = weaponsData as Weapon[];
    return weapons.filter(w => w.id !== 'bare-hands');
  }

  /**
   * Get weapon by ID
   * 
   * @param weaponId - ID of the weapon
   * @returns Weapon data, or null if not found
   */
  getWeaponById(weaponId: string): Weapon | null {
    const weapons = weaponsData as Weapon[];
    return weapons.find(w => w.id === weaponId) || null;
  }
}
