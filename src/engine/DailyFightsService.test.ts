import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DailyFightsService } from './DailyFightsService';
import { IDailyFights } from '../models/DailyFights';
import { Result, err, ok } from '../utils/result';
import { ErrorCodes } from '../utils/errors';

vi.mock('../utils/dates', () => ({
  getUtcDateString: () => '2025-10-30',
  secondsUntilNextUtcMidnight: () => 3600,
}));

class FakeDailyFightsRepository {
  private records = new Map<string, IDailyFights>();

  async getFightsForDate(userId: string, date: string): Promise<Result<IDailyFights | null>> {
    const key = `${userId}_${date}`;
    return ok(this.records.get(key) ?? null);
  }

  async insertRecord(record: IDailyFights): Promise<Result<void>> {
    this.records.set(record.id, record);
    return ok(undefined);
  }

  async updateRecord(record: IDailyFights): Promise<Result<void>> {
    if (!this.records.has(record.id)) {
      return err('Record not found', ErrorCodes.DB_NOT_FOUND);
    }

    this.records.set(record.id, record);
    return ok(undefined);
  }
}

describe('DailyFightsService', () => {
  let repository: FakeDailyFightsRepository;
  let service: DailyFightsService;

  beforeEach(() => {
    repository = new FakeDailyFightsRepository();
    service = new DailyFightsService(repository as any);
  });

  it('creates a new record with default fights when none exist', async () => {
    const status = await service.getStatus('user_1', { hasRegeneration: false });
    expect(status.success).toBe(true);
    if (!status.success) {
      throw new Error(status.error);
    }
    expect(status.data.fightCount).toBe(0);
    expect(status.data.maxFights).toBe(6);
    expect(status.data.remaining).toBe(6);
  });

  it('increments fights and blocks when the limit is reached', async () => {
    for (let i = 0; i < 6; i++) {
      const result = await service.registerFight('user_2', { hasRegeneration: false });
      expect(result.success).toBe(true);
    }

    const blocked = await service.registerFight('user_2', { hasRegeneration: false });
    expect(blocked.success).toBe(false);
    if (blocked.success) {
      throw new Error('Expected fight registration to be blocked');
    }
    expect(blocked.code).toBe(ErrorCodes.GAMEPLAY_DAILY_LIMIT_REACHED);
  });

  it('upgrades max fights when regeneration activates mid-day', async () => {
    for (let i = 0; i < 3; i++) {
      const result = await service.registerFight('user_3', { hasRegeneration: false });
      expect(result.success).toBe(true);
    }

    const upgraded = await service.getStatus('user_3', { hasRegeneration: true });
    expect(upgraded.success).toBe(true);
    if (!upgraded.success) {
      throw new Error(upgraded.error);
    }
    expect(upgraded.data.fightCount).toBe(3);
    expect(upgraded.data.maxFights).toBe(8);
    expect(upgraded.data.remaining).toBe(5);
  });
});
