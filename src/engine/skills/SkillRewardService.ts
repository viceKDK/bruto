/**
 * SkillRewardService
 * Handles skill acquisition through victory rewards and level-ups
 * Uses weighted random selection based on skill odds from catalog
 */

import { Skill, SkillCategory } from '../../models/Skill';
import { IBruto } from '../../models/Bruto';
import { SkillCatalog } from './SkillCatalog';
import { SkillRepository } from '../../database/repositories/SkillRepository';
import { SkillEffectEngine } from './SkillEffectEngine';
import { DatabaseManager } from '../../database/DatabaseManager';
import { Result, ok, err } from '../../utils/result';

export interface SkillAcquisitionMetadata {
  source: 'victory' | 'level-up' | 'purchase' | 'starter';
  acquiredLevel: number;
  acquiredAt: Date;
}

export interface SkillAcquisitionResult {
  skill: Skill;
  statsChanged: boolean;
  statChanges?: {
    hp?: number;
    str?: number;
    speed?: number;
    agility?: number;
    resistance?: number;
  };
}

export class SkillRewardService {
  private static instance: SkillRewardService;
  private catalog: SkillCatalog;
  private repository: SkillRepository;
  private effectEngine: SkillEffectEngine;
  private rng: () => number;

  private constructor(database: DatabaseManager, rngFunction?: () => number) {
    this.catalog = SkillCatalog.getInstance();
    this.repository = new SkillRepository(database);
    this.effectEngine = SkillEffectEngine.getInstance();
    this.rng = rngFunction || Math.random;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(database: DatabaseManager, rngFunction?: () => number): SkillRewardService {
    if (!SkillRewardService.instance) {
      SkillRewardService.instance = new SkillRewardService(database, rngFunction);
    }
    return SkillRewardService.instance;
  }

  /**
   * Reset singleton (for testing)
   */
  public static resetInstance(): void {
    SkillRewardService.instance = null as any;
  }

  /**
   * Select a random skill for reward based on odds
   * Filters out owned unique skills and mutually exclusive skills
   * 
   * @param bruto - The bruto receiving the skill
   * @param rewardPool - Optional filter for specific skill categories or names
   * @returns Selected skill or null if no valid skills available
   */
  public async selectRandomSkill(
    bruto: IBruto,
    rewardPool?: SkillCategory[] | string[]
  ): Promise<Skill | null> {
    // Get owned skills
    const ownedSkillsResult = await this.repository.getBrutoSkills(bruto.id);
    if (!ownedSkillsResult.success) {
      console.error('Failed to fetch owned skills:', ownedSkillsResult.error);
      return null;
    }

    const ownedSkills = ownedSkillsResult.data;
    const ownedSkillNames = ownedSkills.map(bs => bs.skillId);

    // Get all skills from catalog
    let allSkills = this.catalog.getAllSkills();

    // Apply reward pool filter if specified
    if (rewardPool && rewardPool.length > 0) {
      if (typeof rewardPool[0] === 'string' && Object.values(SkillCategory).includes(rewardPool[0] as SkillCategory)) {
        // Filter by categories
        const categories = rewardPool as SkillCategory[];
        allSkills = allSkills.filter(skill => categories.includes(skill.category as SkillCategory));
      } else {
        // Filter by skill IDs
        const skillIds = rewardPool as string[];
        allSkills = allSkills.filter(skill => skillIds.includes(skill.id));
      }
    }

    // Filter available skills
    const availableSkills = allSkills.filter(skill => {
      // Skip if already owned and not stackable
      if (!skill.stackable && ownedSkillNames.includes(skill.id)) {
        return false;
      }

      // Skip if mutually exclusive with owned skill
      if (skill.mutuallyExclusiveWith && skill.mutuallyExclusiveWith.length > 0) {
        const hasExclusion = skill.mutuallyExclusiveWith.some(
          excludedId => ownedSkillNames.includes(excludedId)
        );
        if (hasExclusion) {
          return false;
        }
      }

      return true;
    });

    if (availableSkills.length === 0) {
      return null;
    }

    // Weighted random selection based on odds
    return this.weightedRandomSelect(availableSkills);
  }

  /**
   * Weighted random selection using skill odds
   * Skills with higher odds percentage have higher chance of selection
   * 
   * @param skills - Array of available skills
   * @returns Randomly selected skill based on weighted odds
   */
  private weightedRandomSelect(skills: Skill[]): Skill {
    // Calculate total weight
    const totalWeight = skills.reduce((sum, skill) => sum + skill.odds, 0);

    // Generate random value between 0 and total weight
    const random = this.rng() * totalWeight;

    // Select skill based on cumulative weight
    let cumulativeWeight = 0;
    for (const skill of skills) {
      cumulativeWeight += skill.odds;
      if (random <= cumulativeWeight) {
        return skill;
      }
    }

    // Fallback (should never reach here)
    return skills[skills.length - 1];
  }

  /**
   * Acquire a skill for a bruto
   * Applies immediate effects, persists to database, and returns result
   * 
   * @param bruto - The bruto acquiring the skill
   * @param skill - The skill to acquire
   * @param metadata - Acquisition metadata (source, level, timestamp)
   * @returns Result with acquisition details or error
   */
  public async acquireSkill(
    bruto: IBruto,
    skill: Skill,
    metadata: SkillAcquisitionMetadata
  ): Promise<Result<SkillAcquisitionResult>> {
    // Check if skill already owned (for non-stackable skills)
    const hasSkillResult = await this.repository.hasSkill(bruto.id, skill.id);
    if (!hasSkillResult.success) {
      return err(hasSkillResult.error);
    }

    if (hasSkillResult.data && !skill.stackable) {
      return err(`Bruto already owns non-stackable skill: ${skill.name}`, 'SKILL_DUPLICATE');
    }

    // Apply immediate effects to bruto stats
    const beforeStats = {
      hp: bruto.hp,
      str: bruto.str,
      speed: bruto.speed,
      agility: bruto.agility,
      resistance: bruto.resistance,
    };
    
    const modifiedBruto = this.effectEngine.applyImmediateEffects(bruto, skill);
    
    // Update bruto with modified stats
    bruto.hp = modifiedBruto.hp;
    bruto.str = modifiedBruto.str;
    bruto.speed = modifiedBruto.speed;
    bruto.agility = modifiedBruto.agility;
    bruto.resistance = modifiedBruto.resistance;
    bruto.maxHp = modifiedBruto.maxHp;

    // Calculate stat changes
    const statsChanged =
      beforeStats.hp !== modifiedBruto.hp ||
      beforeStats.str !== modifiedBruto.str ||
      beforeStats.speed !== modifiedBruto.speed ||
      beforeStats.agility !== modifiedBruto.agility ||
      beforeStats.resistance !== modifiedBruto.resistance;

    const statChanges = statsChanged
      ? {
          hp: modifiedBruto.hp - beforeStats.hp,
          str: modifiedBruto.str - beforeStats.str,
          speed: modifiedBruto.speed - beforeStats.speed,
          agility: modifiedBruto.agility - beforeStats.agility,
          resistance: modifiedBruto.resistance - beforeStats.resistance,
        }
      : undefined;

    // Persist skill to database
    const addResult = await this.repository.addSkillToBruto(
      bruto.id,
      skill.id,
      metadata.acquiredLevel
    );

    if (!addResult.success) {
      return err(addResult.error, addResult.code);
    }

    return ok({
      skill,
      statsChanged,
      statChanges,
    });
  }

  /**
   * Acquire multiple starter skills for a new bruto
   * Used during bruto creation to assign initial skills
   * 
   * @param bruto - The bruto acquiring skills
   * @param skillIds - Array of skill IDs to acquire
   * @returns Array of acquisition results
   */
  public async acquireStarterSkills(
    bruto: IBruto,
    skillIds: string[]
  ): Promise<Result<SkillAcquisitionResult>[]> {
    const results: Result<SkillAcquisitionResult>[] = [];

    for (const skillId of skillIds) {
      const skill = this.catalog.getSkillById(skillId);
      if (!skill) {
        results.push(
          err(`Skill not found: ${skillId}`, 'SKILL_NOT_FOUND')
        );
        continue;
      }

      const result = await this.acquireSkill(bruto, skill, {
        source: 'starter',
        acquiredLevel: 1,
        acquiredAt: new Date(),
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Get skill reward after victory
   * Randomly determines if skill is awarded and selects one
   * 
   * @param bruto - The bruto receiving reward
   * @param victoryLevel - Level of defeated opponent (affects reward pool)
   * @returns Skill acquisition result or null if no skill awarded
   */
  public async getVictoryReward(
    bruto: IBruto,
    victoryLevel: number
  ): Promise<Result<SkillAcquisitionResult> | null> {
    // Skill reward chance: 15% base + 2% per level difference
    const levelDiff = Math.max(0, victoryLevel - bruto.level);
    const skillChance = 0.15 + (levelDiff * 0.02);

    if (this.rng() > skillChance) {
      return null; // No skill reward
    }

    // Select random skill
    const skill = await this.selectRandomSkill(bruto);
    if (!skill) {
      return null; // No valid skills available
    }

    // Acquire skill
    return this.acquireSkill(bruto, skill, {
      source: 'victory',
      acquiredLevel: bruto.level,
      acquiredAt: new Date(),
    });
  }

  /**
   * Get skill reward on level-up
   * Offers choice between stat boost or skill reward
   * 
   * @param bruto - The bruto leveling up
   * @param category - Optional category filter for skill selection
   * @returns Selected skill or null if no valid skills
   */
  public async getLevelUpSkillOption(
    bruto: IBruto,
    category?: SkillCategory
  ): Promise<Skill | null> {
    const rewardPool = category ? [category] : undefined;
    return this.selectRandomSkill(bruto, rewardPool);
  }
}
