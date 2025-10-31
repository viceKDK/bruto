/**
 * ProgressionService Tests (Story 8.1)
 * 
 * Tests XP calculation, level-up logic, and infinite progression.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProgressionService } from './ProgressionService';
import { apiClient } from './ApiClient';

// Mock ApiClient
vi.mock('./ApiClient', () => ({
  apiClient: {
    getBruto: vi.fn(),
    updateBrutoXP: vi.fn(),
  },
}));

describe('ProgressionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getXPForNextLevel', () => {
    it('should calculate XP needed for next level using linear formula (level * 10)', () => {
      expect(ProgressionService.getXPForNextLevel(1)).toBe(10);
      expect(ProgressionService.getXPForNextLevel(2)).toBe(20);
      expect(ProgressionService.getXPForNextLevel(5)).toBe(50);
      expect(ProgressionService.getXPForNextLevel(10)).toBe(100);
      expect(ProgressionService.getXPForNextLevel(50)).toBe(500);
    });

    it('should support infinite levels without cap', () => {
      expect(ProgressionService.getXPForNextLevel(100)).toBe(1000);
      expect(ProgressionService.getXPForNextLevel(999)).toBe(9990);
      expect(ProgressionService.getXPForNextLevel(10000)).toBe(100000);
    });
  });

  describe('getXPProgress', () => {
    it('should calculate progress percentage within current level', () => {
      // Level 1, needs 10 XP for level 2
      expect(ProgressionService.getXPProgress(0, 1)).toBe(0); // 0%
      expect(ProgressionService.getXPProgress(5, 1)).toBe(50); // 50%
      expect(ProgressionService.getXPProgress(10, 1)).toBe(0); // 100% wraps to 0 for next level
      
      // Level 2, needs 20 XP for level 3
      expect(ProgressionService.getXPProgress(10, 2)).toBe(50); // 10 % 20 = 10/20 = 50%
      expect(ProgressionService.getXPProgress(20, 2)).toBe(0); // 20 % 20 = 0/20 = 0%
      expect(ProgressionService.getXPProgress(30, 2)).toBe(50); // 30 % 20 = 10/20 = 50%
    });

    it('should handle edge cases', () => {
      expect(ProgressionService.getXPProgress(0, 1)).toBe(0);
      expect(ProgressionService.getXPProgress(999, 100)).toBe(99.9); // 999 % 1000 = 999/1000 = 99.9%
    });
  });

  describe('awardXP', () => {
    it('should award +2 XP for wins and update database', async () => {
      const mockBruto = {
        id: 'bruto-1',
        userId: 'user-1',
        name: 'TestBruto',
        level: 1,
        xp: 5,
        hp: 60,
        maxHp: 60,
        str: 2,
        agility: 2,
        speed: 2,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 1,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.getBruto).mockResolvedValue(mockBruto);
      vi.mocked(apiClient.updateBrutoXP).mockResolvedValue(undefined as any);

      const result = await ProgressionService.awardXP('bruto-1', true);

      expect(result.newXP).toBe(7); // 5 + 2
      expect(result.newLevel).toBe(1); // Still level 1 (needs 10 XP)
      expect(result.leveledUp).toBe(false);
      expect(apiClient.updateBrutoXP).toHaveBeenCalledWith('bruto-1', 7, 1);
    });

    it('should award +1 XP for losses and update database', async () => {
      const mockBruto = {
        id: 'bruto-1',
        userId: 'user-1',
        name: 'TestBruto',
        level: 1,
        xp: 5,
        hp: 60,
        maxHp: 60,
        str: 2,
        agility: 2,
        speed: 2,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 1,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.getBruto).mockResolvedValue(mockBruto);
      vi.mocked(apiClient.updateBrutoXP).mockResolvedValue(undefined as any);

      const result = await ProgressionService.awardXP('bruto-1', false);

      expect(result.newXP).toBe(6); // 5 + 1
      expect(result.newLevel).toBe(1); // Still level 1
      expect(result.leveledUp).toBe(false);
      expect(apiClient.updateBrutoXP).toHaveBeenCalledWith('bruto-1', 6, 1);
    });

    it('should trigger level up when XP threshold is reached', async () => {
      const mockBruto = {
        id: 'bruto-1',
        userId: 'user-1',
        name: 'TestBruto',
        level: 1,
        xp: 9, // One XP away from leveling up
        hp: 60,
        maxHp: 60,
        str: 2,
        agility: 2,
        speed: 2,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 1,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.getBruto).mockResolvedValue(mockBruto);
      vi.mocked(apiClient.updateBrutoXP).mockResolvedValue(undefined as any);

      const result = await ProgressionService.awardXP('bruto-1', false); // +1 XP

      expect(result.newXP).toBe(10); // 9 + 1 = 10
      expect(result.newLevel).toBe(2); // Leveled up!
      expect(result.leveledUp).toBe(true);
      expect(result.xpForNextLevel).toBe(20); // Level 2 needs 20 XP
      expect(apiClient.updateBrutoXP).toHaveBeenCalledWith('bruto-1', 10, 2);
    });

    it('should support infinite progression across many levels', async () => {
      const mockBruto = {
        id: 'bruto-1',
        userId: 'user-1',
        name: 'HighLevelBruto',
        level: 99,
        xp: 989, // One XP away from level 100
        hp: 60,
        maxHp: 60,
        str: 2,
        agility: 2,
        speed: 2,
        resistance: 1.67,
        appearanceId: 1,
        colorVariant: 1,
        createdAt: new Date(),
      };

      vi.mocked(apiClient.getBruto).mockResolvedValue(mockBruto);
      vi.mocked(apiClient.updateBrutoXP).mockResolvedValue(undefined as any);

      const result = await ProgressionService.awardXP('bruto-1', false); // +1 XP

      expect(result.newXP).toBe(990); // 989 + 1
      expect(result.newLevel).toBe(100); // Leveled up to 100
      expect(result.leveledUp).toBe(true);
      expect(result.xpForNextLevel).toBe(1000); // Level 100 needs 1000 XP
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(apiClient.getBruto).mockRejectedValue(new Error('Network error'));

      await expect(ProgressionService.awardXP('bruto-1', true)).rejects.toThrow('Network error');
    });

    it('should throw error when bruto not found', async () => {
      vi.mocked(apiClient.getBruto).mockResolvedValue(null as any);

      await expect(ProgressionService.awardXP('bruto-1', true)).rejects.toThrow('Bruto not found');
    });
  });

  describe('getXPInfo', () => {
    it('should return complete XP information for UI display', () => {
      const bruto = { xp: 15, level: 2 };
      const info = ProgressionService.getXPInfo(bruto);

      expect(info.currentXP).toBe(15);
      expect(info.currentLevel).toBe(2);
      expect(info.xpForNextLevel).toBe(20); // Level 2 needs 20 XP
      expect(info.xpInCurrentLevel).toBe(15); // 15 % 20 = 15
      expect(info.progressPercentage).toBe(75); // 15/20 = 75%
    });

    it('should handle XP at exact level threshold', () => {
      const bruto = { xp: 10, level: 1 };
      const info = ProgressionService.getXPInfo(bruto);

      expect(info.currentXP).toBe(10);
      expect(info.xpInCurrentLevel).toBe(0); // 10 % 10 = 0
      expect(info.progressPercentage).toBe(0);
    });

    it('should work for high levels', () => {
      const bruto = { xp: 5500, level: 100 };
      const info = ProgressionService.getXPInfo(bruto);

      expect(info.currentXP).toBe(5500);
      expect(info.currentLevel).toBe(100);
      expect(info.xpForNextLevel).toBe(1000);
      expect(info.xpInCurrentLevel).toBe(500); // 5500 % 1000 = 500
      expect(info.progressPercentage).toBe(50);
    });
  });
});
