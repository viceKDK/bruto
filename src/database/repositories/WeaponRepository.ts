import { DatabaseManager } from '../DatabaseManager';
import { Weapon, WeaponType, BrutoWeapon } from '../../models/Weapon';
import weaponsData from '../../data/weapons.json';

/**
 * WeaponRepository
 * Handles all database operations related to weapons
 */
export class WeaponRepository {
  private db: DatabaseManager;

  constructor(db: DatabaseManager) {
    this.db = db;
  }

  /**
   * Get all weapons from the catalog
   */
  async getAll(): Promise<Weapon[]> {
    const result = this.db.query<any>('SELECT * FROM weapons ORDER BY name');
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data.map(this.mapRowToWeapon);
  }

  /**
   * Get a specific weapon by ID
   */
  async getById(weaponId: string): Promise<Weapon | null> {
    const result = this.db.getOne<any>(
      'SELECT * FROM weapons WHERE id = ?',
      [weaponId]
    );
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data ? this.mapRowToWeapon(result.data) : null;
  }

  /**
   * Get all weapons owned by a bruto
   */
  async getByBrutoId(brutoId: number): Promise<Weapon[]> {
    const result = this.db.query<any>(
      `SELECT w.* 
       FROM weapons w
       INNER JOIN bruto_weapons bw ON w.id = bw.weapon_id
       WHERE bw.bruto_id = ?
       ORDER BY bw.acquired_at DESC`,
      [brutoId]
    );
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data.map(this.mapRowToWeapon);
  }

  /**
   * Get all equipped weapons for a bruto
   */
  async getEquippedWeapons(brutoId: number): Promise<Weapon[]> {
    const result = this.db.query<any>(
      `SELECT w.* 
       FROM weapons w
       INNER JOIN bruto_weapons bw ON w.id = bw.weapon_id
       WHERE bw.bruto_id = ? AND bw.is_equipped = 1
       ORDER BY bw.acquired_at DESC`,
      [brutoId]
    );
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data.map(this.mapRowToWeapon);
  }

  /**
   * Add a weapon to a bruto's inventory
   */
  async addWeaponToBruto(brutoId: number, weaponId: string): Promise<BrutoWeapon> {
    const insertResult = this.db.run(
      `INSERT INTO bruto_weapons (bruto_id, weapon_id, acquired_at, is_equipped)
       VALUES (?, ?, CURRENT_TIMESTAMP, FALSE)`,
      [brutoId, weaponId]
    );
    
    if (!insertResult.success) {
      throw new Error(insertResult.error);
    }

    // Get the last inserted row
    const result = this.db.query<any>(
      'SELECT * FROM bruto_weapons WHERE bruto_id = ? AND weapon_id = ?',
      [brutoId, weaponId]
    );
    
    if (!result.success || result.data.length === 0) {
      throw new Error('Failed to retrieve inserted weapon');
    }

    return this.mapRowToBrutoWeapon(result.data[0]);
  }

  /**
   * Equip a weapon for a bruto
   */
  async equipWeapon(brutoId: number, weaponId: string): Promise<void> {
    const result = this.db.run(
      `UPDATE bruto_weapons 
       SET is_equipped = TRUE 
       WHERE bruto_id = ? AND weapon_id = ?`,
      [brutoId, weaponId]
    );
    
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  /**
   * Unequip a weapon for a bruto
   */
  async unequipWeapon(brutoId: number, weaponId: string): Promise<void> {
    const result = this.db.run(
      `UPDATE bruto_weapons 
       SET is_equipped = FALSE 
       WHERE bruto_id = ? AND weapon_id = ?`,
      [brutoId, weaponId]
    );
    
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  /**
   * Unequip all weapons for a bruto
   */
  async unequipAllWeapons(brutoId: number): Promise<void> {
    const result = this.db.run(
      `UPDATE bruto_weapons 
       SET is_equipped = FALSE 
       WHERE bruto_id = ?`,
      [brutoId]
    );
    
    if (!result.success) {
      throw new Error(result.error);
    }
  }

  /**
   * Check if a bruto owns a specific weapon
   */
  async hasBrutoWeapon(brutoId: number, weaponId: string): Promise<boolean> {
    const result = this.db.getOne<any>(
      `SELECT id FROM bruto_weapons 
       WHERE bruto_id = ? AND weapon_id = ?`,
      [brutoId, weaponId]
    );
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return !!result.data;
  }

  /**
   * Get a random weapon based on odds
   * Returns null if no weapon is won
   */
  getRandomWeapon(): Weapon | null {
    const allWeaponsResult = this.db.query<any>('SELECT * FROM weapons');
    if (!allWeaponsResult.success) {
      throw new Error(allWeaponsResult.error);
    }
    
    const allWeapons = allWeaponsResult.data.map(this.mapRowToWeapon);
    
    // Filter out bare-hands (always available)
    const availableWeapons = allWeapons.filter(w => w.id !== 'bare-hands');
    
    // Calculate total odds
    const totalOdds = availableWeapons.reduce((sum, w) => sum + w.odds, 0);
    
    // Roll a random number
    const roll = Math.random() * totalOdds;
    
    // Find the weapon
    let cumulative = 0;
    for (const weapon of availableWeapons) {
      cumulative += weapon.odds;
      if (roll <= cumulative) {
        return weapon;
      }
    }
    
    return null;
  }

  /**
   * Seed the weapons catalog from weapons.json
   */
  seedWeaponsCatalog(): void {
    const weapons = weaponsData as Weapon[];
    
    for (const weapon of weapons) {
      const result = this.db.run(
        `INSERT OR REPLACE INTO weapons 
         (id, name, name_es, types, odds, hit_speed, damage, draw_chance, reach, modifiers)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          weapon.id,
          weapon.name,
          weapon.nameEs,
          JSON.stringify(weapon.types),
          weapon.odds,
          weapon.hitSpeed,
          weapon.damage,
          weapon.drawChance,
          weapon.reach,
          JSON.stringify(weapon.modifiers),
        ]
      );
      
      if (!result.success) {
        throw new Error(`Failed to seed weapon ${weapon.id}: ${result.error}`);
      }
    }
  }

  /**
   * Map database row to Weapon interface
   */
  private mapRowToWeapon(row: any): Weapon {
    return {
      id: row.id,
      name: row.name,
      nameEs: row.name_es,
      types: JSON.parse(row.types) as WeaponType[],
      odds: row.odds,
      hitSpeed: row.hit_speed,
      damage: row.damage,
      drawChance: row.draw_chance,
      reach: row.reach,
      modifiers: JSON.parse(row.modifiers),
    };
  }

  /**
   * Map database row to BrutoWeapon interface
   */
  private mapRowToBrutoWeapon(row: any): BrutoWeapon {
    return {
      id: row.id,
      brutoId: row.bruto_id,
      weaponId: row.weapon_id,
      acquiredAt: new Date(row.acquired_at),
      isEquipped: row.is_equipped === 1,
    };
  }
}
