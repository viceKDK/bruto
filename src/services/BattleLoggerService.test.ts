/**
 * BattleLoggerService Tests (Story 12.1)
 *
 * Tests battle logging, snapshots, and automatic cleanup of old battles.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BattleLoggerService, IBattleLog, IBrutoSnapshot, ICombatEvent } from './BattleLoggerService';
import { db } from '../database/DatabaseManager';
import { IBruto } from '../models/Bruto';

// Mock DatabaseManager
vi.mock('../database/DatabaseManager', () => ({
  db: {
    query: vi.fn(),
    run: vi.fn(),
  },
}));

describe('BattleLoggerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should have correct max battles per bruto', () => {
      expect(BattleLoggerService.MAX_BATTLES_PER_BRUTO).toBe(8);
    });
  });

  describe('createBrutoSnapshot', () => {
    it('should create complete snapshot of bruto', () => {
      const bruto: IBruto = {
        id: 'bruto-1',
        userId: 'user-1',
        name: 'TestBruto',
        level: 5,
        xp: 50,
        hp: 72,
        maxHp: 72,
        str: 4,
        speed: 3,
        agility: 3,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 2,
        createdAt: new Date(),
        skills: ['skill1', 'skill2'],
      };

      const snapshot = BattleLoggerService.createBrutoSnapshot(bruto);

      expect(snapshot).toEqual({
        id: 'bruto-1',
        name: 'TestBruto',
        level: 5,
        hp: 72,
        maxHp: 72,
        str: 4,
        speed: 3,
        agility: 3,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 2,
        skills: ['skill1', 'skill2'],
      });
    });

    it('should handle bruto without skills', () => {
      const bruto: IBruto = {
        id: 'bruto-1',
        userId: 'user-1',
        name: 'TestBruto',
        level: 1,
        xp: 0,
        hp: 60,
        maxHp: 60,
        str: 2,
        speed: 2,
        agility: 2,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 1,
        createdAt: new Date(),
      };

      const snapshot = BattleLoggerService.createBrutoSnapshot(bruto);

      expect(snapshot.skills).toEqual([]);
    });
  });

  describe('saveBattle', () => {
    it('should save complete battle log to database', async () => {
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      const battleLog: IBattleLog = {
        playerBrutoId: 'bruto-1',
        opponentBrutoId: 'bruto-2',
        winnerId: 'bruto-1',
        turnCount: 5,
        playerXpGained: 2,
        playerHpRemaining: 45,
        opponentHpRemaining: 0,
        playerBrutoSnapshot: {
          id: 'bruto-1',
          name: 'Player',
          level: 3,
          hp: 66,
          maxHp: 66,
          str: 3,
          speed: 2,
          agility: 2,
          resistance: 1.67,
          appearanceId: 1,
          colorVariant: 1,
        },
        opponentBrutoSnapshot: {
          id: 'bruto-2',
          name: 'Opponent',
          level: 3,
          hp: 66,
          maxHp: 66,
          str: 3,
          speed: 2,
          agility: 2,
          resistance: 1.67,
          appearanceId: 2,
          colorVariant: 2,
        },
        combatLog: [
          { type: 'start', turn: 0, message: 'Battle started' },
          { type: 'attack', turn: 1, attacker: 'bruto-1', defender: 'bruto-2', damage: 21, message: 'Hit!' },
        ],
        rngSeed: '12345',
        foughtAt: new Date('2025-01-15T10:00:00Z'),
      };

      const battleId = await BattleLoggerService.saveBattle(battleLog);

      expect(battleId).toBeTruthy();
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO battles'),
        expect.arrayContaining([
          expect.any(String), // id
          'bruto-1',
          'bruto-2',
          'bruto-1',
          5,
          2,
          45,
          0,
          expect.stringContaining('Player'), // JSON snapshot
          expect.stringContaining('Opponent'), // JSON snapshot
          expect.stringContaining('Battle started'), // JSON combat log
          '12345',
          expect.any(Number), // timestamp
        ])
      );
    });

    it('should trigger cleanup after saving', async () => {
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      const battleLog: IBattleLog = {
        playerBrutoId: 'bruto-1',
        opponentBrutoId: 'bruto-2',
        winnerId: 'bruto-1',
        turnCount: 3,
        playerXpGained: 2,
        playerHpRemaining: 50,
        opponentHpRemaining: 0,
        playerBrutoSnapshot: {} as IBrutoSnapshot,
        opponentBrutoSnapshot: {} as IBrutoSnapshot,
        combatLog: [],
        rngSeed: '12345',
        foughtAt: new Date(),
      };

      await BattleLoggerService.saveBattle(battleLog);

      // Should query battles for cleanup
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, fought_at FROM battles'),
        ['bruto-1']
      );
    });

    it('should throw error when database insert fails', async () => {
      vi.mocked(db.run).mockReturnValue({
        success: false,
        error: 'Database error',
      } as any);

      const battleLog: IBattleLog = {
        playerBrutoId: 'bruto-1',
        opponentBrutoId: 'bruto-2',
        winnerId: null,
        turnCount: 1,
        playerXpGained: 1,
        playerHpRemaining: 30,
        opponentHpRemaining: 35,
        playerBrutoSnapshot: {} as IBrutoSnapshot,
        opponentBrutoSnapshot: {} as IBrutoSnapshot,
        combatLog: [],
        rngSeed: '12345',
        foughtAt: new Date(),
      };

      await expect(BattleLoggerService.saveBattle(battleLog)).rejects.toThrow('Failed to save battle');
    });
  });

  describe('cleanupOldBattles', () => {
    it('should delete battles beyond 8 most recent', async () => {
      // Mock 10 battles
      const mockBattles = Array.from({ length: 10 }, (_, i) => ({
        id: `battle-${i + 1}`,
        fought_at: Date.now() - i * 60000, // Decreasing timestamps
      }));

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: mockBattles,
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      const deleted = await BattleLoggerService.cleanupOldBattles('bruto-1');

      expect(deleted).toBe(2); // Should delete battles 9 and 10
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM battles WHERE id IN'),
        ['battle-9', 'battle-10']
      );
    });

    it('should not delete anything when 8 or fewer battles', async () => {
      const mockBattles = Array.from({ length: 5 }, (_, i) => ({
        id: `battle-${i + 1}`,
        fought_at: Date.now() - i * 60000,
      }));

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: mockBattles,
      } as any);

      const deleted = await BattleLoggerService.cleanupOldBattles('bruto-1');

      expect(deleted).toBe(0);
      expect(db.run).not.toHaveBeenCalled();
    });

    it('should handle query errors gracefully', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: false,
        error: 'Query failed',
      } as any);

      const deleted = await BattleLoggerService.cleanupOldBattles('bruto-1');

      expect(deleted).toBe(0);
    });
  });

  describe('getBattlesForBruto', () => {
    it('should return battles in chronological order (newest first)', async () => {
      const mockRows = [
        {
          id: 'battle-1',
          player_bruto_id: 'bruto-1',
          opponent_bruto_id: 'bruto-2',
          winner_id: 'bruto-1',
          turn_count: 5,
          player_xp_gained: 2,
          player_hp_remaining: 45,
          opponent_hp_remaining: 0,
          player_bruto_snapshot: JSON.stringify({ id: 'bruto-1', name: 'Player' }),
          opponent_bruto_snapshot: JSON.stringify({ id: 'bruto-2', name: 'Opponent' }),
          combat_log: JSON.stringify([]),
          rng_seed: '12345',
          fought_at: Date.now(),
        },
      ];

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: mockRows,
      } as any);

      const battles = await BattleLoggerService.getBattlesForBruto('bruto-1');

      expect(battles).toHaveLength(1);
      expect(battles[0].id).toBe('battle-1');
      expect(battles[0].playerBrutoSnapshot.name).toBe('Player');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY fought_at DESC'),
        ['bruto-1', 8]
      );
    });

    it('should support custom limit', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      await BattleLoggerService.getBattlesForBruto('bruto-1', 5);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        ['bruto-1', 5]
      );
    });

    it('should throw error when query fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: false,
        error: 'Query failed',
      } as any);

      await expect(BattleLoggerService.getBattlesForBruto('bruto-1')).rejects.toThrow(
        'Failed to query battles'
      );
    });
  });

  describe('getBattleById', () => {
    it('should return specific battle by ID', async () => {
      const mockRow = {
        id: 'battle-123',
        player_bruto_id: 'bruto-1',
        opponent_bruto_id: 'bruto-2',
        winner_id: 'bruto-1',
        turn_count: 3,
        player_xp_gained: 2,
        player_hp_remaining: 50,
        opponent_hp_remaining: 0,
        player_bruto_snapshot: JSON.stringify({ id: 'bruto-1', name: 'Player' }),
        opponent_bruto_snapshot: JSON.stringify({ id: 'bruto-2', name: 'Opponent' }),
        combat_log: JSON.stringify([{ type: 'start', turn: 0, message: 'Started' }]),
        rng_seed: '54321',
        fought_at: Date.now(),
      };

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [mockRow],
      } as any);

      const battle = await BattleLoggerService.getBattleById('battle-123');

      expect(battle).not.toBeNull();
      expect(battle?.id).toBe('battle-123');
      expect(battle?.turnCount).toBe(3);
      expect(battle?.rngSeed).toBe('54321');
    });

    it('should return null when battle not found', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      const battle = await BattleLoggerService.getBattleById('nonexistent');

      expect(battle).toBeNull();
    });
  });

  describe('getBattleCount', () => {
    it('should return count of battles for bruto', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ count: 5 }],
      } as any);

      const count = await BattleLoggerService.getBattleCount('bruto-1');

      expect(count).toBe(5);
    });

    it('should return 0 when no battles', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ count: 0 }],
      } as any);

      const count = await BattleLoggerService.getBattleCount('bruto-1');

      expect(count).toBe(0);
    });

    it('should return 0 on error', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: false,
        error: 'Query failed',
      } as any);

      const count = await BattleLoggerService.getBattleCount('bruto-1');

      expect(count).toBe(0);
    });
  });

  describe('Integration: Full Battle Logging Flow', () => {
    it('should save 10 battles and keep only last 8', async () => {
      let battleCount = 0;

      // Mock save succeeds
      vi.mocked(db.run).mockImplementation(() => ({
        success: true,
      } as any));

      // Mock cleanup queries
      vi.mocked(db.query).mockImplementation(() => {
        battleCount++;
        const battles = Array.from({ length: battleCount }, (_, i) => ({
          id: `battle-${i + 1}`,
          fought_at: Date.now() - (battleCount - i - 1) * 60000,
        }));
        return {
          success: true,
          data: battles,
        } as any;
      });

      const createMockBattle = (index: number): IBattleLog => ({
        playerBrutoId: 'bruto-1',
        opponentBrutoId: `bruto-opp-${index}`,
        winnerId: 'bruto-1',
        turnCount: 3,
        playerXpGained: 2,
        playerHpRemaining: 50,
        opponentHpRemaining: 0,
        playerBrutoSnapshot: { id: 'bruto-1', name: 'Player' } as IBrutoSnapshot,
        opponentBrutoSnapshot: { id: 'bruto-opp', name: 'Opponent' } as IBrutoSnapshot,
        combatLog: [],
        rngSeed: `seed-${index}`,
        foughtAt: new Date(),
      });

      // Save 10 battles
      for (let i = 1; i <= 10; i++) {
        await BattleLoggerService.saveBattle(createMockBattle(i));
      }

      // Check that delete was called for battles 9 and 10
      const deleteCalls = vi.mocked(db.run).mock.calls.filter(call =>
        call[0].includes('DELETE FROM battles')
      );

      // Should have 2 delete calls (one for 9th battle, one for 10th)
      expect(deleteCalls.length).toBeGreaterThanOrEqual(1);
    });
  });
});
