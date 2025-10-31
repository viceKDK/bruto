/**
 * StatBoostService - Handles stat boost application from level-up upgrades
 * Story 8.3: Stat Boost Application System
 * Story 6.8: Level-Up Skill Bonuses Integration
 */

import { IBruto } from '../models/Bruto';
import { BrutoRepository } from '../database/repositories/BrutoRepository';
import { DatabaseManager } from '../database/DatabaseManager';
import { Result, ok, err } from '../utils/result';
import { ErrorCodes } from '../utils/errors';
import { SkillEffectEngine } from '../engine/skills/SkillEffectEngine'; // Story 6.8
import { SkillCatalog } from '../engine/skills/SkillCatalog'; // Story 6.8
import { StatType as SkillStatType } from '../models/Skill'; // Story 6.8

export type StatType = 'STR' | 'Speed' | 'Agility' | 'HP';

export interface StatBoostResult {
  updatedBruto: IBruto;
  changes: string[]; // Human-readable list of changes for UI feedback
}

export class StatBoostService {
  /**
   * Apply a full stat boost (+2 stat OR +12 HP)
   * Story 6.8: Now integrates skill bonuses for enhanced level-up gains
   */
  static async applyFullBoost(
    bruto: IBruto,
    statType: StatType
  ): Promise<Result<StatBoostResult>> {
    const db = DatabaseManager.getInstance();
    const repo = new BrutoRepository(db);

    const updatedBruto = { ...bruto };
    const changes: string[] = [];

    // Story 6.8: Get skill bonuses for level-up
    const skillBonuses = this.getSkillLevelUpBonuses(bruto, statType);

    // Apply boost based on type (with skill bonuses)
    if (statType === 'HP') {
      const hpIncrease = skillBonuses; // Base 12 + any skill modifiers
      updatedBruto.hp = (bruto.hp || 60) + hpIncrease;
      updatedBruto.maxHp = (bruto.maxHp || 60) + hpIncrease;
      changes.push(`+${hpIncrease} HP`);
    } else if (statType === 'STR') {
      const strIncrease = skillBonuses; // Base 2 + Fuerza Hércules (+1) = 3
      updatedBruto.str = (bruto.str || 2) + strIncrease;
      changes.push(`+${strIncrease} Fuerza`);
    } else if (statType === 'Speed') {
      const speedIncrease = skillBonuses; // Base 2 + Velocidad Mercurio (+1) = 3
      updatedBruto.speed = (bruto.speed || 2) + speedIncrease;
      changes.push(`+${speedIncrease} Velocidad`);
    } else if (statType === 'Agility') {
      const agilityIncrease = skillBonuses; // Base 2 + Agilidad Felina (+1) = 3
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

    console.log(`[StatBoostService] Applied full boost: ${statType} (+${skillBonuses}) for bruto ${bruto.id}`);
    return ok({ updatedBruto, changes });
  }

  /**
   * Apply a split stat boost (+1/+1 in two stats OR +6 HP + 1 stat)
   * Story 6.8: Now integrates skill bonuses for enhanced split gains
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

    // Story 6.8: Get skill bonuses for split upgrades (different from full)
    const bonus1 = this.getSkillLevelUpBonuses(bruto, stat1, true); // true = split upgrade
    const bonus2 = this.getSkillLevelUpBonuses(bruto, stat2, true);

    // Apply first stat boost
    const result1 = this.applySingleStatIncrease(updatedBruto, stat1, bonus1);
    if (!result1.success) return result1;
    changes.push(...result1.data.changes);

    // Apply second stat boost  
    const result2 = this.applySingleStatIncrease(updatedBruto, stat2, bonus2);
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
   * Story 6.8: Get skill-enhanced level-up bonuses
   * Maps StatBoostService stat types to Skill StatType and calculates bonuses
   * @param isSplit Whether this is a split upgrade (affects base values and skill multipliers)
   */
  private static getSkillLevelUpBonuses(bruto: IBruto, statType: StatType, isSplit: boolean = false): number {
    // Map our StatType to Skill StatType
    let skillStatType: SkillStatType;
    switch (statType) {
      case 'STR':
        skillStatType = SkillStatType.STR;
        break;
      case 'Speed':
        skillStatType = SkillStatType.SPEED;
        break;
      case 'Agility':
        skillStatType = SkillStatType.AGILITY;
        break;
      case 'HP':
        skillStatType = SkillStatType.HP;
        break;
      default:
        // Default base values: full (2/12) vs split (1/6)
        return isSplit ? (statType === 'HP' ? 6 : 1) : (statType === 'HP' ? 12 : 2);
    }

    // Get bruto's skills
    const skillIds = bruto.skills || [];
    if (skillIds.length === 0) {
      // No skills, return base values
      return isSplit ? (statType === 'HP' ? 6 : 1) : (statType === 'HP' ? 12 : 2);
    }

    // Load skill objects from catalog
    const catalog = SkillCatalog.getInstance();
    const skills = skillIds
      .map(id => catalog.getSkillById(id))
      .filter((skill): skill is NonNullable<typeof skill> => skill !== null);

    // Calculate bonus using SkillEffectEngine
    const engine = SkillEffectEngine.getInstance();
    const bonus = engine.getLevelUpBonus(skills, skillStatType, isSplit);

    return bonus;
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
