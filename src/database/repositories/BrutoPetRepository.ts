import { BaseRepository } from './BaseRepository';
import { DatabaseManager } from '../DatabaseManager';
import { Result, ok } from '../../utils/result';
import { ErrorCodes } from '../../utils/errors';

export interface BrutoPet {
  id: string;
  brutoId: string;
  petType: string;
  acquiredAtLevel: number;
}

export interface BrutoPetWithCost extends BrutoPet {
  resistanceCost: number;
}

export class BrutoPetRepository extends BaseRepository<BrutoPet> {
  constructor(db: DatabaseManager) {
    super(db);
  }

  protected mapRowToEntity(row: any): BrutoPet {
    return {
      id: row.id,
      brutoId: row.bruto_id,
      petType: row.pet_type,
      acquiredAtLevel: row.acquired_at_level,
    };
  }

  protected mapEntityToRow(entity: BrutoPet): any {
    return {
      id: entity.id,
      bruto_id: entity.brutoId,
      pet_type: entity.petType,
      acquired_at_level: entity.acquiredAtLevel,
    };
  }

  protected getTableName(): string {
    return 'bruto_pets';
  }

  async findByBrutoId(brutoId: string): Promise<Result<BrutoPet[]>> {
    return this.queryMany(`SELECT * FROM ${this.getTableName()} WHERE bruto_id = ?`, [brutoId]);
  }

  async findWithResistanceCost(brutoId: string): Promise<Result<BrutoPetWithCost[]>> {
    const base = await this.findByBrutoId(brutoId);
    if (!base.success) {
      return base;
    }

    const enriched = base.data.map((pet) => ({
      ...pet,
      resistanceCost: this.resolveResistanceCost(pet.petType),
    }));

    return ok(enriched);
  }

  private resolveResistanceCost(petType: string): number {
    switch (petType) {
      case 'dog_a':
      case 'dog_b':
      case 'dog_c':
        return 2;
      case 'panther':
        return 6;
      case 'bear':
        return 8;
      default:
        console.warn(`[BrutoPetRepository] Unknown pet type "${petType}" while resolving cost.`);
        return 0;
    }
  }
}
