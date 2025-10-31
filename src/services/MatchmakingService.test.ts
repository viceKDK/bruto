/**
 * MatchmakingService Unit Tests
 * Story 9.1: Opponent Matchmaking Pool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatchmakingService } from './MatchmakingService';
import { IBruto } from '../models/Bruto';
import { DatabaseManager } from '../database/DatabaseManager';
import { BrutoRepository } from '../database/repositories/BrutoRepository';

// Mock DatabaseManager
vi.mock('../database/DatabaseManager', () => ({
  DatabaseManager: {
    getInstance: vi.fn(),
  },
}));

// Mock BrutoRepository
vi.mock('../database/repositories/BrutoRepository');

describe('MatchmakingService', () => {
  let mockRepo: any;
  let mockBrutos: IBruto[];

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock brutos for testing
    mockBrutos = [
      createMockBruto('bruto-1', 'user-1', 'Alice', 5),
      createMockBruto('bruto-2', 'user-2', 'Bob', 5),
      createMockBruto('bruto-3', 'user-3', 'Charlie', 5),
      createMockBruto('bruto-4', 'user-4', 'Diana', 5),
      createMockBruto('bruto-5', 'user-5', 'Eve', 5),
      createMockBruto('bruto-6', 'user-6', 'Frank', 5),
      createMockBruto('bruto-7', 'user-7', 'Grace', 5),
    ];

    // Mock repository methods
    mockRepo = {
      queryMany: vi.fn(),
      queryOne: vi.fn(),
      attachSkills: vi.fn(),
    };

    // Default: queryMany returns all mock brutos
    mockRepo.queryMany.mockResolvedValue({
      success: true,
      data: mockBrutos,
    });

    // Default: attachSkills returns brutos unchanged (skills already attached)
    mockRepo.attachSkills.mockImplementation((brutos: IBruto[]) =>
      Promise.resolve({
        success: true,
        data: brutos,
      })
    );

    // Mock DatabaseManager to return our mock repo
    (DatabaseManager.getInstance as any).mockReturnValue({});
    (BrutoRepository as any).mockImplementation(() => mockRepo);
  });

  describe('findOpponents - AC #1: Same-Level Matching', () => {
    it('should query for opponents with exact same level', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);

      expect(result.success).toBe(true);
      expect(mockRepo.queryMany).toHaveBeenCalledWith(
        expect.stringContaining('WHERE level = ?'),
        [5, 'user-current']
      );
    });

    it('should exclude current user\'s brutos from results', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);

      expect(result.success).toBe(true);
      expect(mockRepo.queryMany).toHaveBeenCalledWith(
        expect.stringContaining('AND user_id != ?'),
        [5, 'user-current']
      );
    });

    it('should include all eligible brutos from local database', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-current', 10);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      // Should return all 7 mock brutos
      expect(result.data.totalAvailable).toBe(7);
      expect(result.data.opponents.length).toBe(7); // Less than requested 10, returns all
    });
  });

  describe('findOpponents - AC #2: Opponent Pool Size', () => {
    it('should return up to 5 opponents by default', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-current');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.opponents.length).toBe(5);
      expect(result.data.requestedCount).toBe(5);
    });

    it('should return all available opponents if less than requested count', async () => {
      // Return only 3 brutos
      mockRepo.queryMany.mockResolvedValue({
        success: true,
        data: mockBrutos.slice(0, 3),
      });

      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.opponents.length).toBe(3);
      expect(result.data.totalAvailable).toBe(3);
      expect(result.data.requestedCount).toBe(5);
    });

    it('should support custom opponent count', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-current', 3);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.opponents.length).toBe(3);
      expect(result.data.requestedCount).toBe(3);
    });

    it('should refresh pool each time (randomized query)', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);

      expect(result.success).toBe(true);
      expect(mockRepo.queryMany).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY RANDOM()'),
        [5, 'user-current']
      );
    });
  });

  describe('findOpponents - AC #3: Ghost Battle System', () => {
    it('should attach skills to create complete opponent snapshot', async () => {
      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);

      expect(result.success).toBe(true);
      expect(mockRepo.attachSkills).toHaveBeenCalled();
    });

    it('should return opponents with frozen stats and skills', async () => {
      const brutoWithSkills = {
        ...mockBrutos[0],
        skills: ['skill-1', 'skill-2'],
      };

      mockRepo.attachSkills.mockResolvedValue({
        success: true,
        data: [brutoWithSkills],
      });

      mockRepo.queryMany.mockResolvedValue({
        success: true,
        data: [mockBrutos[0]],
      });

      const result = await MatchmakingService.findOpponents(5, 'user-current', 1);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.opponents[0].skills).toEqual(['skill-1', 'skill-2']);
    });

    it('should handle skill attachment failure gracefully', async () => {
      mockRepo.attachSkills.mockResolvedValue({
        success: false,
        error: 'Failed to load skills',
        code: 'DB_QUERY_FAILED',
      });

      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Should have failed');

      expect(result.error).toBe('Failed to load skills');
    });
  });

  describe('findOpponents - AC #4: Database Query', () => {
    it('should execute correct SQL query with parameters', async () => {
      await MatchmakingService.findOpponents(10, 'user-123', 5);

      expect(mockRepo.queryMany).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM brutos'),
        [10, 'user-123']
      );
    });

    it('should handle database query failure', async () => {
      mockRepo.queryMany.mockResolvedValue({
        success: false,
        error: 'Database error',
        code: 'DB_QUERY_FAILED',
      });

      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Should have failed');

      expect(result.error).toBe('Database error');
      expect(result.code).toBe('DB_QUERY_FAILED');
    });
  });

  describe('findOpponents - AC #5: Fallback Logic', () => {
    it('should return empty array when no opponents available', async () => {
      mockRepo.queryMany.mockResolvedValue({
        success: true,
        data: [],
      });

      const result = await MatchmakingService.findOpponents(99, 'user-current', 5);

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.opponents).toEqual([]);
      expect(result.data.totalAvailable).toBe(0);
    });

    it('should log message when no opponents found', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      mockRepo.queryMany.mockResolvedValue({
        success: true,
        data: [],
      });

      await MatchmakingService.findOpponents(99, 'user-current', 5);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No opponents found at level 99')
      );
    });
  });

  describe('countOpponentsAtLevel', () => {
    it('should count total eligible opponents at level', async () => {
      mockRepo.queryOne.mockResolvedValue({
        success: true,
        data: { count: 15 },
      });

      const result = await MatchmakingService.countOpponentsAtLevel(5, 'user-current');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data).toBe(15);
      expect(mockRepo.queryOne).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count FROM brutos'),
        [5, 'user-current']
      );
    });

    it('should return 0 when no opponents available', async () => {
      mockRepo.queryOne.mockResolvedValue({
        success: true,
        data: { count: 0 },
      });

      const result = await MatchmakingService.countOpponentsAtLevel(99, 'user-current');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data).toBe(0);
    });

    it('should handle query failure gracefully', async () => {
      mockRepo.queryOne.mockResolvedValue({
        success: false,
        error: 'Database error',
        code: 'DB_QUERY_FAILED',
      });

      const result = await MatchmakingService.countOpponentsAtLevel(5, 'user-current');

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Should have failed');

      expect(result.error).toBe('Database error');
    });
  });

  describe('Performance - AC #7', () => {
    it('should handle 100+ brutos efficiently', async () => {
      // Create 100 mock brutos
      const largeBrutoSet = Array.from({ length: 100 }, (_, i) =>
        createMockBruto(`bruto-${i}`, `user-${i}`, `Player${i}`, 5)
      );

      mockRepo.queryMany.mockResolvedValue({
        success: true,
        data: largeBrutoSet,
      });

      const startTime = Date.now();
      const result = await MatchmakingService.findOpponents(5, 'user-current', 5);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.opponents.length).toBe(5);
      expect(result.data.totalAvailable).toBe(100);

      // Performance check: should complete in under 100ms (mock data, no real DB)
      expect(duration).toBeLessThan(100);
    });
  });
});

/**
 * Helper: Create mock IBruto for testing
 */
function createMockBruto(id: string, userId: string, name: string, level: number): IBruto {
  return {
    id,
    userId,
    name,
    level,
    xp: level * 10,
    hp: 60 + level * 12,
    maxHp: 60 + level * 12,
    str: 2 + level,
    speed: 2 + level,
    agility: 2 + level,
    resistance: 1.67,
    appearanceId: 1,
    colorVariant: 0,
    createdAt: new Date(),
    skills: [],
  };
}
