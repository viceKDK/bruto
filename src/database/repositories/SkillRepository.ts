/**
 * SkillRepository
 * Manages skill ownership and acquisition for brutos
 */

import { BaseRepository } from './BaseRepository';
import { Result, ok, err } from '../../utils/result';
import { ErrorCodes } from '../../utils/errors';
import { BrutoSkill, Skill } from '../../models/Skill';
import { skillCatalog } from '../../engine/skills/SkillCatalog';

interface BrutoSkillRow {
  id: string;
  bruto_id: string;
  skill_id: string;
  acquired_at: number;
  acquired_level: number;
  stack_count: number;
}

/**
 * Generate unique ID for skill assignment
 */
function generateSkillId(brutoId: string, skillId: string): string {
  return `${brutoId}_${skillId}_${Date.now()}`;
}

export class SkillRepository extends BaseRepository<BrutoSkill> {
  protected getTableName(): string {
    return 'bruto_skills';
  }

  protected mapRowToEntity(row: BrutoSkillRow): BrutoSkill {
    return {
      brutoId: row.bruto_id,
      skillId: row.skill_id,
      acquiredAt: new Date(row.acquired_at),
      acquiredLevel: row.acquired_level,
      stackCount: row.stack_count
    };
  }

  protected mapEntityToRow(entity: BrutoSkill): BrutoSkillRow {
    return {
      id: generateSkillId(entity.brutoId, entity.skillId),
      bruto_id: entity.brutoId,
      skill_id: entity.skillId,
      acquired_at: entity.acquiredAt.getTime(),
      acquired_level: entity.acquiredLevel,
      stack_count: entity.stackCount
    };
  }

  /**
   * Add a skill to a bruto
   */
  async addSkillToBruto(
    brutoId: string,
    skillId: string,
    acquiredLevel: number
  ): Promise<Result<void>> {
    // Validate skill exists
    const skill = skillCatalog.getSkillById(skillId);
    if (!skill) {
      return err(`Skill not found: ${skillId}`, ErrorCodes.SKILL_NOT_FOUND);
    }

    // Check if bruto already has this skill
    const hasSkill = await this.hasSkill(brutoId, skillId);
    if (hasSkill.success && hasSkill.data) {
      // If skill is stackable, increment stack count
      if (skill.stackable) {
        return this.incrementSkillStack(brutoId, skillId);
      }
      return err(`Bruto already has skill: ${skillId}`, ErrorCodes.SKILL_DUPLICATE);
    }

    // Check mutual exclusions
    if (skill.mutuallyExclusiveWith && skill.mutuallyExclusiveWith.length > 0) {
      const conflicts = await this.checkMutualExclusions(brutoId, skill.mutuallyExclusiveWith);
      if (conflicts.success && conflicts.data.length > 0) {
        return err(
          `Cannot acquire ${skillId}: conflicts with ${conflicts.data.join(', ')}`,
          ErrorCodes.SKILL_CONFLICT
        );
      }
    }

    const sql = `
      INSERT INTO bruto_skills (id, bruto_id, skill_id, acquired_at, acquired_level, stack_count)
      VALUES (?, ?, ?, ?, ?, 1)
    `;

    return this.execute(sql, [generateSkillId(brutoId, skillId), brutoId, skillId, Date.now(), acquiredLevel]);
  }

  /**
   * Increment stack count for a stackable skill
   */
  private async incrementSkillStack(brutoId: string, skillId: string): Promise<Result<void>> {
    const skill = skillCatalog.getSkillById(skillId);
    if (!skill || !skill.stackable) {
      return err(`Skill ${skillId} is not stackable`, ErrorCodes.SKILL_NOT_STACKABLE);
    }

    // Check current stack count
    const currentSkill = await this.getBrutoSkill(brutoId, skillId);
    if (!currentSkill.success || !currentSkill.data) {
      return err(`Skill not found for bruto`, ErrorCodes.DB_NOT_FOUND);
    }

    // Check max stacks
    if (skill.maxStacks && currentSkill.data.stackCount >= skill.maxStacks) {
      return err(
        `Skill ${skillId} already at max stacks (${skill.maxStacks})`,
        ErrorCodes.SKILL_LIMIT_EXCEEDED
      );
    }

    const sql = `
      UPDATE bruto_skills
      SET stack_count = stack_count + 1
      WHERE bruto_id = ? AND skill_id = ?
    `;

    return this.execute(sql, [brutoId, skillId]);
  }

  /**
   * Get a specific skill for a bruto
   */
  private async getBrutoSkill(brutoId: string, skillId: string): Promise<Result<BrutoSkill | null>> {
    const sql = `
      SELECT * FROM bruto_skills
      WHERE bruto_id = ? AND skill_id = ?
    `;
    return this.queryOne(sql, [brutoId, skillId]);
  }

  /**
   * Get all skills for a bruto
   */
  async getBrutoSkills(brutoId: string): Promise<Result<BrutoSkill[]>> {
    const sql = `
      SELECT * FROM bruto_skills
      WHERE bruto_id = ?
      ORDER BY acquired_level ASC, acquired_at ASC
    `;
    return this.queryMany(sql, [brutoId]);
  }

  /**
   * Get full skill objects for a bruto (with catalog data)
   */
  async getBrutoSkillsWithData(brutoId: string): Promise<Result<Skill[]>> {
    const skillsResult = await this.getBrutoSkills(brutoId);
    if (!skillsResult.success) {
      return err(skillsResult.error, skillsResult.code);
    }

    const skills: Skill[] = [];
    for (const brutoSkill of skillsResult.data) {
      const skill = skillCatalog.getSkillById(brutoSkill.skillId);
      if (skill) {
        skills.push(skill);
      }
    }

    return ok(skills);
  }

  /**
   * Check if bruto has a specific skill
   */
  async hasSkill(brutoId: string, skillId: string): Promise<Result<boolean>> {
    const sql = `
      SELECT COUNT(*) as count
      FROM bruto_skills
      WHERE bruto_id = ? AND skill_id = ?
    `;

    const result = this.db.getOne(sql, [brutoId, skillId]);
    if (!result.success) {
      return err(result.error, result.code);
    }

    return ok((result.data?.count || 0) > 0);
  }

  /**
   * Check for mutually exclusive skills
   */
  private async checkMutualExclusions(
    brutoId: string,
    exclusiveSkillIds: string[]
  ): Promise<Result<string[]>> {
    if (exclusiveSkillIds.length === 0) {
      return ok([]);
    }

    const placeholders = exclusiveSkillIds.map(() => '?').join(',');
    const sql = `
      SELECT skill_id
      FROM bruto_skills
      WHERE bruto_id = ? AND skill_id IN (${placeholders})
    `;

    const result = this.db.query(sql, [brutoId, ...exclusiveSkillIds]);
    if (!result.success) {
      return err(result.error, result.code);
    }

    const conflicts = result.data.map((row: any) => row.skill_id);
    return ok(conflicts);
  }

  /**
   * Remove a skill from a bruto
   */
  async removeSkill(brutoId: string, skillId: string): Promise<Result<void>> {
    const sql = `
      DELETE FROM bruto_skills
      WHERE bruto_id = ? AND skill_id = ?
    `;
    return this.execute(sql, [brutoId, skillId]);
  }

  /**
   * Get skill count for a bruto
   */
  async getSkillCount(brutoId: string): Promise<Result<number>> {
    const sql = `
      SELECT COUNT(*) as count
      FROM bruto_skills
      WHERE bruto_id = ?
    `;

    const result = this.db.getOne(sql, [brutoId]);
    if (!result.success) {
      return err(result.error, result.code);
    }

    return ok(result.data?.count || 0);
  }

  /**
   * Get skills acquired at a specific level
   */
  async getSkillsAcquiredAtLevel(brutoId: string, level: number): Promise<Result<Skill[]>> {
    const sql = `
      SELECT * FROM bruto_skills
      WHERE bruto_id = ? AND acquired_level = ?
    `;

    const result = await this.queryMany(sql, [brutoId, level]);
    if (!result.success) {
      return err(result.error, result.code);
    }

    const skills: Skill[] = [];
    for (const brutoSkill of result.data) {
      const skill = skillCatalog.getSkillById(brutoSkill.skillId);
      if (skill) {
        skills.push(skill);
      }
    }

    return ok(skills);
  }
}
