/**
 * BrutoRepository - CRUD for brutos
 * Handles fighter character data
 */

import { BaseRepository } from './BaseRepository';
import { IBruto } from '../../models/Bruto';
import { Result, ok, err } from '../../utils/result';
import { DatabaseManager } from '../DatabaseManager';

export class BrutoRepository extends BaseRepository<IBruto> {
  constructor(db: DatabaseManager) {
    super(db);
  }

  protected getTableName(): string {
    return 'brutos';
  }

  protected mapRowToEntity(row: any): IBruto {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      level: row.level,
      xp: row.xp,
      hp: row.hp,
      maxHp: row.max_hp,
      str: row.str,
      speed: row.speed,
      agility: row.agility,
      resistance: row.resistance,
      appearanceId: row.appearance_id,
      colorVariant: row.color_variant,
      createdAt: new Date(row.created_at),
      lastBattle: row.last_battle ? new Date(row.last_battle) : undefined,
      level10CoinRewarded: row.level_10_coin_rewarded === 1,
      skills: [],
    };
  }

  protected mapEntityToRow(bruto: IBruto): any {
    return {
      id: bruto.id,
      user_id: bruto.userId,
      name: bruto.name,
      level: bruto.level,
      xp: bruto.xp,
      hp: bruto.hp,
      max_hp: bruto.maxHp,
      str: bruto.str,
      speed: bruto.speed,
      agility: bruto.agility,
      resistance: bruto.resistance,
      appearance_id: bruto.appearanceId,
      color_variant: bruto.colorVariant,
      created_at: bruto.createdAt.getTime(),
      last_battle: bruto.lastBattle?.getTime() || null,
      level_10_coin_rewarded: bruto.level10CoinRewarded ? 1 : 0,
    };
  }

  /**
   * Find bruto by ID
   */
  async findById(id: string): Promise<Result<IBruto | null>> {
    const base = await this.queryOne(`SELECT * FROM brutos WHERE id = ?`, [id]);

    if (!base.success || base.data === null) {
      return base;
    }

    const skills = await this.getSkillsForBruto(base.data.id);
    if (!skills.success) {
      return err(skills.error, skills.code);
    }

    const enriched: IBruto = {
      ...base.data,
      skills: skills.data,
    };

    return ok<IBruto | null>(enriched);
  }

  /**
   * Find all brutos for a user
   */
  async findByUserId(userId: string): Promise<Result<IBruto[]>> {
    const base = await this.queryMany(
      `SELECT * FROM brutos WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    if (!base.success) {
      return base;
    }

    const attached = await this.attachSkills(base.data);
    if (!attached.success) {
      return err(attached.error, attached.code);
    }

    return attached;
  }

  /**
   * Find brutos by level (for matchmaking)
   */
  async findByLevel(level: number, limit: number = 10): Promise<Result<IBruto[]>> {
    const base = await this.queryMany(
      `SELECT * FROM brutos WHERE level = ? ORDER BY RANDOM() LIMIT ?`,
      [level, limit]
    );

    if (!base.success) {
      return base;
    }

    const attached = await this.attachSkills(base.data);
    if (!attached.success) {
      return err(attached.error, attached.code);
    }

    return attached;
  }

  /**
   * Check if name is unique for this user
   */
  async isNameUnique(userId: string, name: string): Promise<Result<boolean>> {
    const result = await this.queryOne(
      `SELECT 1 FROM brutos WHERE user_id = ? AND name = ?`,
      [userId, name]
    );

    if (!result.success) return err(result.error, result.code);

    return ok(result.data === null);
  }

  /**
   * Create new bruto
   */
  async create(bruto: IBruto): Promise<Result<void>> {
    const row = this.mapEntityToRow(bruto);

    const result = await this.execute(
      `INSERT INTO brutos (
        id, user_id, name, level, xp,
        hp, max_hp, str, speed, agility, resistance,
        appearance_id, color_variant, created_at, last_battle
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.user_id,
        row.name,
        row.level,
        row.xp,
        row.hp,
        row.max_hp,
        row.str,
        row.speed,
        row.agility,
        row.resistance,
        row.appearance_id,
        row.color_variant,
        row.created_at,
        row.last_battle,
      ]
    );

    if (!result.success) return result;

    console.log(`[BrutoRepository] Bruto created: ${bruto.name} (Level ${bruto.level})`);
    return ok(undefined);
  }

  /**
   * Update bruto
   */
  async update(bruto: IBruto): Promise<Result<void>> {
    const row = this.mapEntityToRow(bruto);

    const result = await this.execute(
      `UPDATE brutos SET
        name = ?, level = ?, xp = ?,
        hp = ?, max_hp = ?, str = ?, speed = ?, agility = ?, resistance = ?,
        appearance_id = ?, color_variant = ?, last_battle = ?
       WHERE id = ?`,
      [
        row.name,
        row.level,
        row.xp,
        row.hp,
        row.max_hp,
        row.str,
        row.speed,
        row.agility,
        row.resistance,
        row.appearance_id,
        row.color_variant,
        row.last_battle,
        row.id,
      ]
    );

    if (!result.success) return result;

    console.log(`[BrutoRepository] Bruto updated: ${bruto.id}`);
    return ok(undefined);
  }

  /**
   * Update bruto stats
   */
  async updateStats(
    brutoId: string,
    stats: { hp?: number; maxHp?: number; str?: number; speed?: number; agility?: number; resistance?: number }
  ): Promise<Result<void>> {
    const updates: string[] = [];
    const values: any[] = [];

    if (stats.hp !== undefined) {
      updates.push('hp = ?');
      values.push(stats.hp);
    }
    if (stats.maxHp !== undefined) {
      updates.push('max_hp = ?');
      values.push(stats.maxHp);
    }
    if (stats.str !== undefined) {
      updates.push('str = ?');
      values.push(stats.str);
    }
    if (stats.speed !== undefined) {
      updates.push('speed = ?');
      values.push(stats.speed);
    }
    if (stats.agility !== undefined) {
      updates.push('agility = ?');
      values.push(stats.agility);
    }
    if (stats.resistance !== undefined) {
      updates.push('resistance = ?');
      values.push(stats.resistance);
    }

    if (updates.length === 0) {
      return ok(undefined);
    }

    values.push(brutoId);

    return this.execute(`UPDATE brutos SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  /**
   * Delete bruto (cascade deletes weapons, skills, pets, battles)
   */
  async delete(brutoId: string): Promise<Result<void>> {
    const result = await this.execute(`DELETE FROM brutos WHERE id = ?`, [brutoId]);

    if (!result.success) return result;

    console.log(`[BrutoRepository] Bruto deleted: ${brutoId}`);
    return ok(undefined);
  }

  /**
   * Count brutos for a user
   */
  async countByUserId(userId: string): Promise<Result<number>> {
    const result = this.db.getOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM brutos WHERE user_id = ?`,
      [userId]
    );

    if (!result.success) return err(result.error, result.code);

    return ok(result.data?.count || 0);
  }

  private async getSkillsForBruto(brutoId: string): Promise<Result<string[]>> {
    const rows = this.db.query<{ skill_id: string }>(
      `SELECT skill_id FROM bruto_skills WHERE bruto_id = ?`,
      [brutoId]
    );

    if (!rows.success) {
      return err(rows.error, rows.code);
    }

    return ok(rows.data.map((row) => row.skill_id));
  }

  private async attachSkills(brutos: IBruto[]): Promise<Result<IBruto[]>> {
    const enriched: IBruto[] = [];

    for (const bruto of brutos) {
      const skills = await this.getSkillsForBruto(bruto.id);
      if (!skills.success) {
        return err(skills.error, skills.code);
      }

      enriched.push({
        ...bruto,
        skills: skills.data,
      });
    }

    return ok(enriched);
  }
}
