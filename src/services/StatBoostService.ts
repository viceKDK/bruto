/**
 * StatBoostService - Handles stat boost application from level-up upgrades
 * Story 8.3: Stat Boost Application System
 */

import { IBruto } from '../models/Bruto';
import { BrutoRepository } from '../database/repositories/BrutoRepository';
import { DatabaseManager } from '../database/DatabaseManager';
import { Result, ok, err } from '../utils/result';
import { ErrorCodes } from '../utils/errors';

export type StatType = 'STR' | 'Speed' | 'Agility' | 'HP';

export interface StatBoostResult {
  updatedBruto: IBruto;
  changes: string[]; // Human-readable list of changes for UI feedback
}

export class StatBoostService {
  /**
   * Apply a full stat boost (+2 stat OR +12 HP)
   */
  static async applyFullBoost(
    bruto: IBruto,
    statType: StatType
  ): Promise<Result<StatBoostResult>> {
    const db = DatabaseManager.getInstance();
    const repo = new BrutoRepository(db);

    const updatedBruto = { ...bruto };
    const changes: string[] = [];

    // Apply boost based on type
    if (statType === 'HP') {
      const hpIncrease = 12;
      updatedBruto.hp = (bruto.hp || 60) + hpIncrease;
      updatedBruto.maxHp = (bruto.maxHp || 60) + hpIncrease;
      changes.push(`+${hpIncrease} HP`);
    } else if (statType === 'STR') {
      const strIncrease = 2;
      updatedBruto.str = (bruto.str || 2) + strIncrease;
      changes.push(`+${strIncrease} Fuerza`);
    } else if (statType === 'Speed') {
      const speedIncrease = 2;
      updatedBruto.speed = (bruto.speed || 2) + speedIncrease;
      changes.push(`+${speedIncrease} Velocidad`);
    } else if (statType === 'Agility') {
      const agilityIncrease = 2;
      updatedBruto.agility = (bruto.agility || 2) + agilityIncrease;
      changes.push(`+${agilityIncrease} Agilidad`);
    }

    // Validate no negative stats
    if (!this.validateStats(updatedBruto)) {
      return err('Stat validation failed: negative values not allowed', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    // Update database
    const updateResult = await repo.update(updatedBruto);
    if (!updateResult.success) {
      return err(updateResult.error, updateResult.code);
    }

    console.log(`[StatBoostService] Applied full boost: ${statType} for bruto ${bruto.id}`);
    return ok({ updatedBruto, changes });
  }

  /**
   * Apply a split stat boost (+1/+1 in two stats OR +6 HP + 1 stat)
   */
  static async applySplitBoost(
    bruto: IBruto,
    stat1: StatType,
    stat2: StatType
  ): Promise<Result<StatBoostResult>> {
    const db = DatabaseManager.getInstance();
    const repo = new BrutoRepository(db);

    const updatedBruto = { ...bruto };
    const changes: string[] = [];

    // Apply first stat boost
    const result1 = this.applySingleStatIncrease(updatedBruto, stat1, stat1 === 'HP' ? 6 : 1);
    if (!result1.success) return result1;
    changes.push(...result1.data.changes);

    // Apply second stat boost  
    const result2 = this.applySingleStatIncrease(updatedBruto, stat2, stat2 === 'HP' ? 6 : 1);
    if (!result2.success) return result2;
    changes.push(...result2.data.changes);

    // Validate no negative stats
    if (!this.validateStats(updatedBruto)) {
      return err('Stat validation failed: negative values not allowed', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    // Update database
    const updateResult = await repo.update(updatedBruto);
    if (!updateResult.success) {
      return err(updateResult.error, updateResult.code);
    }

    console.log(`[StatBoostService] Applied split boost: ${stat1}+${stat2} for bruto ${bruto.id}`);
    return ok({ updatedBruto, changes });
  }

  /**
   * Helper: Apply a single stat increase (mutates bruto object)
   */
  private static applySingleStatIncrease(
    bruto: IBruto,
    statType: StatType,
    amount: number
  ): Result<{ changes: string[] }> {
    const changes: string[] = [];

    if (statType === 'HP') {
      bruto.hp = (bruto.hp || 60) + amount;
      bruto.maxHp = (bruto.maxHp || 60) + amount;
      changes.push(`+${amount} HP`);
    } else if (statType === 'STR') {
      bruto.str = (bruto.str || 2) + amount;
      changes.push(`+${amount} Fuerza`);
    } else if (statType === 'Speed') {
      bruto.speed = (bruto.speed || 2) + amount;
      changes.push(`+${amount} Velocidad`);
    } else if (statType === 'Agility') {
      bruto.agility = (bruto.agility || 2) + amount;
      changes.push(`+${amount} Agilidad`);
    } else {
      return err(`Invalid stat type: ${statType}`, ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    return ok({ changes });
  }

  /**
   * Validate that all stats are non-negative
   */
  private static validateStats(bruto: IBruto): boolean {
    return (
      (bruto.hp ?? 0) >= 0 &&
      (bruto.maxHp ?? 0) >= 0 &&
      (bruto.str ?? 0) >= 0 &&
      (bruto.speed ?? 0) >= 0 &&
      (bruto.agility ?? 0) >= 0
    );
  }
}
