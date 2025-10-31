/**
 * DailyFightsService - Business logic wrapper around DailyFightsRepository.
 * Enforces daily fight limits, UTC resets, and Regeneration skill bonuses.
 */

import { DailyFightsRepository } from '../database/repositories/DailyFightsRepository';
import { IDailyFights } from '../models/DailyFights';
import { Result, err, ok } from '../utils/result';
import { ErrorCodes } from '../utils/errors';
import { getUtcDateString, secondsUntilNextUtcMidnight } from '../utils/dates';

export interface DailyFightStatus {
  fightDate: string;
  fightCount: number;
  maxFights: number;
  remaining: number;
  resetInSeconds: number;
}

export interface DailyFightOptions {
  hasRegeneration: boolean;
}

export class DailyFightsService {
  constructor(private readonly repository: DailyFightsRepository) {}

  /**
   * Calculate max fights for the day based on regeneration state.
   */
  private resolveMaxFights({ hasRegeneration }: DailyFightOptions): number {
    return hasRegeneration ? 8 : 6;
  }

  /**
   * Ensure we have a record for the current UTC day and align max fights.
   */
  private async ensureTodayRecord(
    userId: string,
    options: DailyFightOptions
  ): Promise<Result<IDailyFights>> {
    const today = getUtcDateString();
    const targetMax = this.resolveMaxFights(options);
    const existing = await this.repository.getFightsForDate(userId, today);

    if (!existing.success) {
      return err(existing.error, existing.code);
    }

    if (!existing.data) {
      const newRecord: IDailyFights = {
        id: `${userId}_${today}`,
        userId,
        fightDate: today,
        fightCount: 0,
        maxFights: targetMax,
      };

      const insertResult = await this.repository.insertRecord(newRecord);
      if (!insertResult.success) {
        return err(insertResult.error, insertResult.code);
      }

      return ok(newRecord);
    }

    const record = existing.data;
    const needsMaxUpgrade = targetMax > record.maxFights;

    if (needsMaxUpgrade) {
      record.maxFights = targetMax;
      const updateResult = await this.repository.updateRecord(record);
      if (!updateResult.success) {
        return err(updateResult.error, updateResult.code);
      }
    }

    return ok(record);
  }

  private buildStatus(record: IDailyFights): DailyFightStatus {
    const remaining = Math.max(0, record.maxFights - record.fightCount);
    return {
      fightDate: record.fightDate,
      fightCount: record.fightCount,
      maxFights: record.maxFights,
      remaining,
      resetInSeconds: secondsUntilNextUtcMidnight(),
    };
  }

  /**
   * Fetch current status for user after ensuring today's record.
   */
  async getStatus(userId: string, options: DailyFightOptions): Promise<Result<DailyFightStatus>> {
    const recordResult = await this.ensureTodayRecord(userId, options);
    if (!recordResult.success) {
      return err(recordResult.error, recordResult.code);
    }

    return ok(this.buildStatus(recordResult.data));
  }

  /**
   * Register a fight start, enforcing limits and returning updated status.
   */
  async registerFight(
    userId: string,
    options: DailyFightOptions
  ): Promise<Result<DailyFightStatus>> {
    const recordResult = await this.ensureTodayRecord(userId, options);
    if (!recordResult.success) {
      return err(recordResult.error, recordResult.code);
    }

    const record = recordResult.data;
    if (record.fightCount >= record.maxFights) {
      return err('Daily fight limit reached', ErrorCodes.GAMEPLAY_DAILY_LIMIT_REACHED);
    }

    const updated: IDailyFights = {
      ...record,
      fightCount: record.fightCount + 1,
    };

    const updateResult = await this.repository.updateRecord(updated);
    if (!updateResult.success) {
      return err(updateResult.error, updateResult.code);
    }

    return ok(this.buildStatus(updated));
  }
}
