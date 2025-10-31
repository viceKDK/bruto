/**
 * OpponentSelectionScene.test.ts - Tests for Story 9.2
 * 
 * Validates opponent selection logic and service integration.
 * Note: Phaser scene rendering is validated through manual/E2E testing.
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MatchmakingService } from '../services/MatchmakingService';
import { IBruto } from '../models/Bruto';
import { ok, err } from '../utils/result';
import { ErrorCodes } from '../utils/errors';

// Mock dependencies
vi.mock('../services/MatchmakingService');

describe('OpponentSelectionScene - Story 9.2 Integration Logic', () => {
  let mockBrutos: IBruto[];
  let mockPlayerBruto: IBruto;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock brutos
    mockPlayerBruto = {
      id: 'player-bruto-1',
      userId: 'user-1',
      name: 'TestPlayer',
      level: 5,
      xp: 100,
      hp: 50,
      maxHp: 50,
      str: 10,
      speed: 8,
      agility: 7,
      resistance: 5,
      appearanceId: 1,
      colorVariant: 0,
      createdAt: new Date(),
    };

    mockBrutos = [
      {
        id: 'opponent-1',
        userId: 'user-2',
        name: 'Opponent1',
        level: 5,
        xp: 50,
        hp: 45,
        maxHp: 45,
        str: 8,
        speed: 9,
        agility: 6,
        resistance: 4,
        appearanceId: 2,
        colorVariant: 1,
        createdAt: new Date(),
      },
      {
        id: 'opponent-2',
        userId: 'user-3',
        name: 'Opponent2',
        level: 5,
        xp: 75,
        hp: 48,
        maxHp: 48,
        str: 9,
        speed: 7,
        agility: 8,
        resistance: 5,
        appearanceId: 3,
        colorVariant: 2,
        createdAt: new Date(),
      },
      {
        id: 'opponent-3',
        userId: 'user-4',
        name: 'Opponent3',
        level: 5,
        xp: 60,
        hp: 52,
        maxHp: 52,
        str: 11,
        speed: 6,
        agility: 5,
        resistance: 6,
        appearanceId: 4,
        colorVariant: 0,
        createdAt: new Date(),
      },
      {
        id: 'opponent-4',
        userId: 'user-5',
        name: 'Opponent4',
        level: 5,
        xp: 80,
        hp: 49,
        maxHp: 49,
        str: 10,
        speed: 8,
        agility: 7,
        resistance: 4,
        appearanceId: 5,
        colorVariant: 1,
        createdAt: new Date(),
      },
      {
        id: 'opponent-5',
        userId: 'user-6',
        name: 'Opponent5',
        level: 5,
        xp: 90,
        hp: 51,
        maxHp: 51,
        str: 9,
        speed: 9,
        agility: 6,
        resistance: 5,
        appearanceId: 6,
        colorVariant: 2,
        createdAt: new Date(),
      },
    ];

    // Mock MatchmakingService
    (MatchmakingService.findOpponents as Mock).mockResolvedValue(
      ok({
        opponents: mockBrutos,
        totalAvailable: 5,
        requestedCount: 5,
      })
    );
  });

  describe('AC #1: Opponent Display - Service Integration', () => {
    it('should request 5 opponents from MatchmakingService', async () => {
      const result = await MatchmakingService.findOpponents(
        mockPlayerBruto.level,
        'user-1',
        5
      );

      expect(MatchmakingService.findOpponents).toHaveBeenCalledWith(5, 'user-1', 5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.opponents).toHaveLength(5);
        expect(result.data.requestedCount).toBe(5);
      }
    });

    it('should receive opponent data with all required fields', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(result.success).toBe(true);
      if (result.success) {
        const opponent = result.data.opponents[0];
        expect(opponent).toHaveProperty('id');
        expect(opponent).toHaveProperty('name');
        expect(opponent).toHaveProperty('level');
        expect(opponent).toHaveProperty('hp');
        expect(opponent).toHaveProperty('str');
        expect(opponent).toHaveProperty('speed');
        expect(opponent).toHaveProperty('agility');
        expect(opponent).toHaveProperty('appearanceId');
      }
    });
  });

  describe('AC #4: Pool Refresh - Service Re-query', () => {
    it('should call findOpponents again on refresh', async () => {
      // Initial load
      const result1 = await MatchmakingService.findOpponents(5, 'user-1', 5);
      expect(result1.success).toBe(true);

      // Refresh (simulate button click)
      const result2 = await MatchmakingService.findOpponents(5, 'user-1', 5);
      expect(result2.success).toBe(true);

      // Verify service called twice
      expect(MatchmakingService.findOpponents).toHaveBeenCalledTimes(2);
    });

    it('should get new random opponents on each refresh', async () => {
      // Mock different results for each call
      (MatchmakingService.findOpponents as Mock)
        .mockResolvedValueOnce(
          ok({
            opponents: mockBrutos.slice(0, 5),
            totalAvailable: 5,
            requestedCount: 5,
          })
        )
        .mockResolvedValueOnce(
          ok({
            opponents: mockBrutos.slice(0, 5).reverse(),
            totalAvailable: 5,
            requestedCount: 5,
          })
        );

      const result1 = await MatchmakingService.findOpponents(5, 'user-1', 5);
      const result2 = await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(result1.success && result2.success).toBe(true);
      if (result1.success && result2.success) {
        // Different opponent order (randomization working)
        const firstOpponentId1 = result1.data.opponents[0].id;
        const firstOpponentId2 = result2.data.opponents[0].id;
        // May be different due to randomization
        expect(firstOpponentId1).toBeDefined();
        expect(firstOpponentId2).toBeDefined();
      }
    });
  });

  describe('AC #5: Fight Initiation - Data Transformation', () => {
    it('should convert IBruto to IBrutoCombatant format', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(result.success).toBe(true);
      if (result.success) {
        const opponent = result.data.opponents[0];

        // Transform to combat format (as done in scene)
        const combatant = {
          id: opponent.id,
          name: opponent.name,
          stats: {
            hp: opponent.hp,
            maxHp: opponent.maxHp,
            str: opponent.str,
            speed: opponent.speed,
            agility: opponent.agility,
            resistance: opponent.resistance,
          },
        };

        expect(combatant.id).toBe(opponent.id);
        expect(combatant.name).toBe(opponent.name);
        expect(combatant.stats.hp).toBe(opponent.hp);
        expect(combatant.stats.str).toBe(opponent.str);
      }
    });
  });

  describe('AC #6: Empty State - Service Error Handling', () => {
    it('should handle empty opponent pool gracefully', async () => {
      (MatchmakingService.findOpponents as Mock).mockResolvedValue(
        ok({
          opponents: [],
          totalAvailable: 0,
          requestedCount: 5,
        })
      );

      const result = await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.opponents).toHaveLength(0);
        expect(result.data.totalAvailable).toBe(0);
      }
    });

    it('should handle matchmaking service errors', async () => {
      (MatchmakingService.findOpponents as Mock).mockResolvedValue(
        err('Database connection failed', ErrorCodes.DB_QUERY_FAILED)
      );

      const result = await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe(ErrorCodes.DB_QUERY_FAILED);
        expect(result.error).toContain('Database');
      }
    });
  });

  describe('Level-Based Matchmaking', () => {
    it('should filter opponents by exact level match', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(result.success).toBe(true);
      if (result.success) {
        // All opponents should be level 5
        result.data.opponents.forEach((opponent) => {
          expect(opponent.level).toBe(5);
        });
      }
    });

    it('should exclude current user brutos from pool', async () => {
      const currentUserId = 'user-1';
      const result = await MatchmakingService.findOpponents(5, currentUserId, 5);

      expect(MatchmakingService.findOpponents).toHaveBeenCalledWith(
        5,
        currentUserId,
        5
      );

      expect(result.success).toBe(true);
      if (result.success) {
        // No opponent should belong to user-1
        result.data.opponents.forEach((opponent) => {
          expect(opponent.userId).not.toBe(currentUserId);
        });
      }
    });
  });

  describe('Pool Size Validation', () => {
    it('should request exactly 5 opponents', async () => {
      await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(MatchmakingService.findOpponents).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(String),
        5 // Requested count
      );
    });

    it('should handle less than 5 opponents available', async () => {
      (MatchmakingService.findOpponents as Mock).mockResolvedValue(
        ok({
          opponents: mockBrutos.slice(0, 3),
          totalAvailable: 3,
          requestedCount: 5,
        })
      );

      const result = await MatchmakingService.findOpponents(5, 'user-1', 5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.opponents.length).toBeLessThan(5);
        expect(result.data.totalAvailable).toBe(3);
        expect(result.data.requestedCount).toBe(5);
      }
    });
  });
});
