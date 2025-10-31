/**
 * DailyFightsRepository - CRUD for daily fight limits
 * Tracks fight availability per user per day
 */

import { BaseRepository } from './BaseRepository';
import { IDailyFights } from '../../models/DailyFights';
import { Result, err, ok } from '../../utils/result';
import { DatabaseManager } from '../DatabaseManager';
import { getUtcDateString } from '../../utils/dates';

export class DailyFightsRepository extends BaseRepository<IDailyFights> {
  constructor(db: DatabaseManager) {
    super(db);
  }

  protected getTableName(): string {
    return 'daily_fights';
  }

  protected mapRowToEntity(row: any): IDailyFights {
    return {
      id: row.id,
      userId: row.user_id,
      fightDate: row.fight_date,
      fightCount: row.fight_count,
      maxFights: row.max_fights,
    };
  }

  protected mapEntityToRow(dailyFights: IDailyFights): any {
    return {
      id: dailyFights.id,
      user_id: dailyFights.userId,
      fight_date: dailyFights.fightDate,
      fight_count: dailyFights.fightCount,
      max_fights: dailyFights.maxFights,
    };
  }

  /**
   * Get today's fight record for a user
   */
  async getTodaysFights(userId: string): Promise<Result<IDailyFights | null>> {
    const today = getUtcDateString();
    return this.queryOne(`SELECT * FROM daily_fights WHERE user_id = ? AND fight_date = ?`, [
      userId,
      today,
    ]);
  }

  /**
   * Get fight record for a specific date
   */
  async getFightsForDate(userId: string, date: string): Promise<Result<IDailyFights | null>> {
    return this.queryOne(`SELECT * FROM daily_fights WHERE user_id = ? AND fight_date = ?`, [
      userId,
      date,
    ]);
  }

  /**
   * Create or update today's fight record
   */
  async upsertTodaysFights(
    userId: string,
    fightCount: number,
    maxFights: number
  ): Promise<Result<void>> {
    const today = getUtcDateString();
    const existing = await this.getFightsForDate(userId, today);

    if (!existing.success) {
      return err(existing.error, existing.code);
    }

    if (existing.data) {
      return this.updateRecord({
        ...existing.data,
        fightCount,
        maxFights,
      });
    }

    return this.insertRecord({
      id: `${userId}_${today}`,
      userId,
      fightDate: today,
      fightCount,
      maxFights,
    });
  }

  /**
   * Increment fight count for today
   */
  async incrementTodaysFights(userId: string): Promise<Result<void>> {
    const current = await this.getTodaysFights(userId);

    if (!current.success) {
      return err(current.error, current.code);
    }

    const fightCount = current.data ? current.data.fightCount + 1 : 1;
    const maxFights = current.data ? current.data.maxFights : 6;

    return this.upsertTodaysFights(userId, fightCount, maxFights);
  }

  /**
   * Check if user has fights remaining today
   */
  async hasRemainingFights(userId: string): Promise<Result<boolean>> {
    const result = await this.getTodaysFights(userId);

    if (!result.success) {
      return err(result.error, result.code);
    }

    if (!result.data) {
      return ok(true); // No record means they haven't fought today
    }

    return ok(result.data.fightCount < result.data.maxFights);
  }

  /**
   * Get remaining fights for today
   */
  async getRemainingFights(userId: string): Promise<Result<number>> {
    const result = await this.getTodaysFights(userId);

    if (!result.success) {
      return err(result.error, result.code);
    }

    if (!result.data) {
      return ok(6); // Default max fights
    }

    const remaining = result.data.maxFights - result.data.fightCount;
    return ok(Math.max(0, remaining));
  }

  async insertRecord(record: IDailyFights): Promise<Result<void>> {
    const result = await this.execute(
      `INSERT INTO daily_fights (id, user_id, fight_date, fight_count, max_fights) VALUES (?, ?, ?, ?, ?)`,
      [record.id, record.userId, record.fightDate, record.fightCount, record.maxFights]
    );

    if (!result.success) {
      return result;
    }

    console.log(
      `[DailyFightsRepository] Created fight record for ${record.userId}: ${record.fightCount}/${record.maxFights}`
    );
    return ok(undefined);
  }

  async updateRecord(record: IDailyFights): Promise<Result<void>> {
    const result = await this.execute(
      `UPDATE daily_fights SET fight_count = ?, max_fights = ? WHERE id = ?`,
      [record.fightCount, record.maxFights, record.id]
    );

    if (!result.success) {
      return result;
    }

    console.log(
      `[DailyFightsRepository] Updated fights for ${record.userId}: ${record.fightCount}/${record.maxFights}`
    );
    return ok(undefined);
  }
}
