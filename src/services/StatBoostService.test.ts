/**
 * StatBoostService Unit Tests
 * Story 8.3: Stat Boost Application System
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatBoostService } from './StatBoostService';
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

describe('StatBoostService', () => {
  let mockBruto: IBruto;
  let mockRepo: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create base bruto for testing
    mockBruto = {
      id: 'test-bruto-123',
      userId: 'test-user',
      name: 'TestBruto',
      level: 2,
      xp: 0,
      hp: 60,
      maxHp: 60,
      str: 2,
      speed: 2,
      agility: 2,
      resistance: 1.67,
      appearanceId: 1,
      colorVariant: 0,
      createdAt: new Date(),
      skills: [],
    };

    // Mock repository methods
    mockRepo = {
      update: vi.fn().mockResolvedValue({ success: true }),
    };

    // Mock DatabaseManager to return our mock repo
    (DatabaseManager.getInstance as any).mockReturnValue({});
    (BrutoRepository as any).mockImplementation(() => mockRepo);
  });

  describe('applyFullBoost - AC #1', () => {
    it('should apply +2 STR boost correctly', async () => {
      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.str).toBe(4); // 2 + 2
      expect(result.data.changes).toContain('+2 Fuerza');
      expect(mockRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ str: 4 })
      );
    });

    it('should apply +2 Speed boost correctly', async () => {
      const result = await StatBoostService.applyFullBoost(mockBruto, 'Speed');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.speed).toBe(4); // 2 + 2
      expect(result.data.changes).toContain('+2 Velocidad');
    });

    it('should apply +2 Agility boost correctly', async () => {
      const result = await StatBoostService.applyFullBoost(mockBruto, 'Agility');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.agility).toBe(4); // 2 + 2
      expect(result.data.changes).toContain('+2 Agilidad');
    });

    it('should apply +12 HP boost correctly and update both hp and maxHp (AC #1)', async () => {
      const result = await StatBoostService.applyFullBoost(mockBruto, 'HP');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.hp).toBe(72); // 60 + 12
      expect(result.data.updatedBruto.maxHp).toBe(72); // 60 + 12 (AC #5: HP increase updates both)
      expect(result.data.changes).toContain('+12 HP');
    });
  });

  describe('applySplitBoost - AC #2', () => {
    it('should apply +1/+1 boost to STR and Speed correctly', async () => {
      const result = await StatBoostService.applySplitBoost(mockBruto, 'STR', 'Speed');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.str).toBe(3); // 2 + 1
      expect(result.data.updatedBruto.speed).toBe(3); // 2 + 1
      expect(result.data.changes).toContain('+1 Fuerza');
      expect(result.data.changes).toContain('+1 Velocidad');
    });

    it('should apply +6 HP + +1 STR correctly (AC #2)', async () => {
      const result = await StatBoostService.applySplitBoost(mockBruto, 'HP', 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.hp).toBe(66); // 60 + 6
      expect(result.data.updatedBruto.maxHp).toBe(66); // 60 + 6 (AC #5)
      expect(result.data.updatedBruto.str).toBe(3); // 2 + 1
      expect(result.data.changes).toContain('+6 HP');
      expect(result.data.changes).toContain('+1 Fuerza');
    });

    it('should apply +1 Agility + +6 HP correctly (reversed order)', async () => {
      const result = await StatBoostService.applySplitBoost(mockBruto, 'Agility', 'HP');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.agility).toBe(3);
      expect(result.data.updatedBruto.hp).toBe(66);
      expect(result.data.updatedBruto.maxHp).toBe(66);
    });
  });

  describe('Database Persistence - AC #3', () => {
    it('should persist stat changes immediately to database', async () => {
      const result = await StatBoostService.applyFullBoost(mockBruto, 'Speed');

      expect(result.success).toBe(true);
      expect(mockRepo.update).toHaveBeenCalledTimes(1);
      expect(mockRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockBruto.id,
          speed: 4,
        })
      );
    });

    it('should handle database update failure gracefully', async () => {
      mockRepo.update.mockResolvedValue({
        success: false,
        error: 'DB error',
        code: 'DB_QUERY_FAILED',
      });

      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(false);
      if (result.success) throw new Error('Should have failed');

      expect(result.error).toBe('DB error');
    });
  });

  describe('UI Feedback - AC #4', () => {
    it('should provide human-readable change descriptions for UI', async () => {
      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.changes).toHaveLength(1);
      expect(result.data.changes[0]).toBe('+2 Fuerza');
    });

    it('should provide multiple changes for split boosts', async () => {
      const result = await StatBoostService.applySplitBoost(mockBruto, 'HP', 'Agility');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.changes).toHaveLength(2);
      expect(result.data.changes).toContain('+6 HP');
      expect(result.data.changes).toContain('+1 Agilidad');
    });
  });

  describe('Validation - AC #5', () => {
    it('should allow stats to increase infinitely (no cap)', async () => {
      mockBruto.str = 100; // High value

      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.str).toBe(102); // No cap applied
    });

    it('should not modify original bruto object (immutability)', async () => {
      const originalStr = mockBruto.str;
      await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(mockBruto.str).toBe(originalStr); // Original unchanged
    });

    it('should preserve all other bruto properties', async () => {
      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      const updated = result.data.updatedBruto;
      expect(updated.id).toBe(mockBruto.id);
      expect(updated.userId).toBe(mockBruto.userId);
      expect(updated.name).toBe(mockBruto.name);
      expect(updated.level).toBe(mockBruto.level);
      expect(updated.appearanceId).toBe(mockBruto.appearanceId);
    });
  });

  describe('Story 6.8: Skill-Enhanced Level-Up Bonuses', () => {
    it('should apply +3 STR when bruto has Fuerza Hércules skill', async () => {
      // Bruto with Fuerza Hércules (STR level-up bonus +1)
      mockBruto.skills = ['fuerza_hercules'];

      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.str).toBe(5); // 2 + 3 (base 2 + skill +1)
      expect(result.data.changes).toContain('+3 Fuerza');
    });

    it('should apply +3 Speed when bruto has Golpe de Trueno skill', async () => {
      // Bruto with Golpe de Trueno (Speed level-up bonus +1)
      mockBruto.skills = ['golpe_trueno'];

      const result = await StatBoostService.applyFullBoost(mockBruto, 'Speed');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.speed).toBe(5); // 2 + 3
      expect(result.data.changes).toContain('+3 Velocidad');
    });

    it('should apply +3 Agility when bruto has Agilidad Felina skill', async () => {
      // Bruto with Agilidad Felina (Agility level-up bonus +1)
      mockBruto.skills = ['agilidad_felina'];

      const result = await StatBoostService.applyFullBoost(mockBruto, 'Agility');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.agility).toBe(5); // 2 + 3
      expect(result.data.changes).toContain('+3 Agilidad');
    });

    it('should apply base +2 STR when bruto has NO skills', async () => {
      // Bruto without skills
      mockBruto.skills = [];

      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.str).toBe(4); // 2 + 2 (base only)
      expect(result.data.changes).toContain('+2 Fuerza');
    });

    it('should apply +18 HP when bruto has Vitalidad skill (full boost)', async () => {
      // Bruto with Vitalidad (HP level-up bonus +6)
      mockBruto.skills = ['vitalidad'];

      const result = await StatBoostService.applyFullBoost(mockBruto, 'HP');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.maxHp).toBe(78); // 60 + 18 (base 12 + skill +6)
      expect(result.data.updatedBruto.hp).toBe(78);
      expect(result.data.changes).toContain('+18 HP');
    });

    it('should apply enhanced split boost with Fuerza Hércules (+3 STR same as full)', async () => {
      mockBruto.skills = ['fuerza_hercules'];

      const result = await StatBoostService.applySplitBoost(mockBruto, 'STR', 'Speed');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      // Note: Fuerza Hércules doesn't have separate split/full conditions
      // So it applies full value (3) even in split mode
      expect(result.data.updatedBruto.str).toBe(5); // 2 + 3 (full bonus applied)
      expect(result.data.updatedBruto.speed).toBe(3); // 2 + 1 (base split, no skill)
      expect(result.data.changes).toContain('+3 Fuerza');
      expect(result.data.changes).toContain('+1 Velocidad');
    });

    it('should apply enhanced HP split boost with Vitalidad (+9 HP instead of +6)', async () => {
      mockBruto.skills = ['vitalidad'];

      const result = await StatBoostService.applySplitBoost(mockBruto, 'HP', 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.maxHp).toBe(69); // 60 + 9 (split with skill)
      expect(result.data.updatedBruto.hp).toBe(69);
      expect(result.data.updatedBruto.str).toBe(3); // 2 + 1 (base split)
      expect(result.data.changes).toContain('+9 HP');
      expect(result.data.changes).toContain('+1 Fuerza');
    });

    it('should apply base +1/+1 split boost when bruto has NO skills', async () => {
      mockBruto.skills = [];

      const result = await StatBoostService.applySplitBoost(mockBruto, 'STR', 'Agility');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.str).toBe(3); // 2 + 1
      expect(result.data.updatedBruto.agility).toBe(3); // 2 + 1
      expect(result.data.changes).toContain('+1 Fuerza');
      expect(result.data.changes).toContain('+1 Agilidad');
    });

    it('should handle multiple stat-boosting skills correctly', async () => {
      // Bruto with both Fuerza Hércules and other skills (that don't affect STR level-up)
      mockBruto.skills = ['fuerza_hercules', 'armor', 'shield'];

      const result = await StatBoostService.applyFullBoost(mockBruto, 'STR');

      expect(result.success).toBe(true);
      if (!result.success) throw new Error('Test failed');

      expect(result.data.updatedBruto.str).toBe(5); // 2 + 3 (only Fuerza Hércules affects STR)
      expect(result.data.changes).toContain('+3 Fuerza');
    });
  });
});
