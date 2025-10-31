/**
 * PetRepository - Story 7.1
 * Database operations for pet ownership
 * 
 * Responsibilities:
 * - Add/remove pets from brutos
 * - Query pet ownership
 * - Enforce database constraints
 */

import { BaseRepository } from './BaseRepository';
import { BrutoPet, PetSlot } from '../../engine/pets/Pet';
import { PetType } from '../../engine/pets/PetType';
import { Result, ok, err } from '../../utils/result';
import { DatabaseManager } from '../DatabaseManager';

export class PetRepository extends BaseRepository<BrutoPet> {
  constructor(db: DatabaseManager) {
    super(db);
  }

  protected getTableName(): string {
    return 'bruto_pets';
  }

  protected mapRowToEntity(row: any): BrutoPet {
    return {
      id: row.id,
      brutoId: row.bruto_id,
      petType: row.pet_type as PetType,
      petSlot: row.pet_slot as PetSlot,
      acquiredAt: new Date(row.acquired_at),
      acquiredLevel: row.acquired_level
    };
  }

  protected mapEntityToRow(pet: BrutoPet): any {
    return {
      id: pet.id,
      bruto_id: pet.brutoId,
      pet_type: pet.petType,
      pet_slot: pet.petSlot,
      acquired_at: pet.acquiredAt.toISOString(),
      acquired_level: pet.acquiredLevel
    };
  }

  /**
   * Get all pets owned by a bruto
   * @param brutoId Bruto ID
   * @returns Array of pet ownership records
   */
  public async getBrutoPets(brutoId: number): Promise<Result<BrutoPet[]>> {
    const query = `
      SELECT id, bruto_id, pet_type, pet_slot, acquired_at, acquired_level
      FROM bruto_pets
      WHERE bruto_id = ?
      ORDER BY acquired_at ASC
    `;

    return this.queryMany(query, [brutoId]);
  }

  /**
   * Add a pet to a bruto
   * @param brutoId Bruto ID
   * @param petType Pet type
   * @param petSlot Pet slot (for Perros: A, B, C; for others: null)
   * @param acquiredLevel Bruto's level when pet was acquired
   * @returns Result with success/error
   */
  public async addPetToBruto(
    brutoId: number,
    petType: PetType,
    petSlot: PetSlot,
    acquiredLevel: number
  ): Promise<Result<void>> {
    const query = `
      INSERT INTO bruto_pets (bruto_id, pet_type, pet_slot, acquired_level)
      VALUES (?, ?, ?, ?)
    `;

    return this.execute(query, [brutoId, petType, petSlot, acquiredLevel]);
  }

  /**
   * Remove a specific pet from a bruto
   * @param id Pet ownership record ID
   */
  public async removePetFromBruto(id: number): Promise<Result<void>> {
    const query = `
      DELETE FROM bruto_pets
      WHERE id = ?
    `;

    return this.execute(query, [id]);
  }

  /**
   * Remove pet by type and slot
   * @param brutoId Bruto ID
   * @param petType Pet type
   * @param petSlot Pet slot (optional, for Perros)
   */
  public async removePetByTypeAndSlot(
    brutoId: number,
    petType: PetType,
    petSlot?: PetSlot
  ): Promise<Result<void>> {
    let query = `
      DELETE FROM bruto_pets
      WHERE bruto_id = ? AND pet_type = ?
    `;
    const params: any[] = [brutoId, petType];

    if (petSlot !== undefined) {
      query += ' AND pet_slot = ?';
      params.push(petSlot);
    } else {
      query += ' AND pet_slot IS NULL';
    }

    return this.execute(query, params);
  }

  /**
   * Remove all pets from a bruto
   * @param brutoId Bruto ID
   */
  public async removeAllPets(brutoId: number): Promise<Result<void>> {
    const query = `
      DELETE FROM bruto_pets
      WHERE bruto_id = ?
    `;

    return this.execute(query, [brutoId]);
  }

  /**
   * Count pets of a specific type owned by bruto
   * @param brutoId Bruto ID
   * @param petType Pet type
   * @returns Count of pets
   */
  public async countPetsByType(
    brutoId: number,
    petType: PetType
  ): Promise<Result<number>> {
    const query = `
      SELECT COUNT(*) as count
      FROM bruto_pets
      WHERE bruto_id = ? AND pet_type = ?
    `;

    const result = this.db.getOne<{ count: number }>(query, [brutoId, petType]);
    
    if (!result.success) {
      return err(result.error, result.code);
    }

    return ok(result.data?.count || 0);
  }

  /**
   * Check if bruto has a specific pet
   * @param brutoId Bruto ID
   * @param petType Pet type
   * @returns True if bruto has this pet
   */
  public async hasPet(brutoId: number, petType: PetType): Promise<Result<boolean>> {
    const countResult = await this.countPetsByType(brutoId, petType);
    
    if (!countResult.success) {
      return err(countResult.error, countResult.code);
    }

    return ok(countResult.data > 0);
  }

  /**
   * Get pet types owned by bruto (without duplicates)
   * @param brutoId Bruto ID
   * @returns Array of unique pet types
   */
  public async getPetTypes(brutoId: number): Promise<Result<PetType[]>> {
    const query = `
      SELECT DISTINCT pet_type
      FROM bruto_pets
      WHERE bruto_id = ?
    `;

    const result = this.db.query<{ pet_type: string }>(query, [brutoId]);
    
    if (!result.success) {
      return err(result.error, result.code);
    }

    const petTypes = result.data.map(row => row.pet_type as PetType);
    return ok(petTypes);
  }
}

