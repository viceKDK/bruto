/**
 * UpgradeGenerator.test.ts - Unit tests for Story 8.2
 * 
 * Tests upgrade option generation, randomization, stat formulas
 */

import { describe, it, expect } from 'vitest';
import { UpgradeGenerator } from './UpgradeGenerator';
import { IBruto } from '../models/Bruto';

// Helper to create mock bruto
function createMockBruto(overrides: Partial<IBruto> = {}): IBruto {
  return {
    id: 'test-bruto-1',
    userId: 'test-user',
    name: 'Test Bruto',
    level: 1,
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
    ...overrides,
  };
}

describe('UpgradeGenerator', () => {
  describe('generateOptions', () => {
    it('should generate exactly 2 options', () => {
      const bruto = createMockBruto();
      const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, 2);

      expect(optionA).toBeDefined();
      expect(optionB).toBeDefined();
      expect(optionA.type).toBeTruthy();
      expect(optionB.type).toBeTruthy();
    });

    it('should generate different option types', () => {
      const bruto = createMockBruto();
      const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, 2);

      expect(optionA.type).not.toBe(optionB.type);
    });

    it('should be deterministic for same bruto + level', () => {
      const bruto = createMockBruto();
      
      const [optionA1, optionB1] = UpgradeGenerator.generateOptions(bruto, 2);
      const [optionA2, optionB2] = UpgradeGenerator.generateOptions(bruto, 2);

      expect(optionA1.type).toBe(optionA2.type);
      expect(optionB1.type).toBe(optionB2.type);
      expect(optionA1.description).toBe(optionA2.description);
      expect(optionB1.description).toBe(optionB2.description);
    });

    it('should generate different options for different levels', () => {
      const bruto = createMockBruto();
      
      const [optionA_lvl2, optionB_lvl2] = UpgradeGenerator.generateOptions(bruto, 2);
      const [optionA_lvl3, optionB_lvl3] = UpgradeGenerator.generateOptions(bruto, 3);

      // At least one option should be different
      const isDifferent = 
        optionA_lvl2.type !== optionA_lvl3.type ||
        optionB_lvl2.type !== optionB_lvl3.type;

      expect(isDifferent).toBe(true);
    });

    it('should include stat boosts in available types', () => {
      const bruto = createMockBruto();
      const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, 1);

      const types = [optionA.type, optionB.type];
      const hasStatBoost = types.includes('FULL_STAT') || types.includes('SPLIT_STAT');

      expect(hasStatBoost).toBe(true);
    });
  });

  describe('FULL_STAT options', () => {
    it('should grant +2 to STR, Speed, Agility OR +12 HP', () => {
      const bruto = createMockBruto();

      // Generate many options to test all possibilities
      const samples: any[] = [];
      for (let level = 1; level <= 20; level++) {
        const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, level);
        if (optionA.type === 'FULL_STAT') samples.push(optionA);
        if (optionB.type === 'FULL_STAT') samples.push(optionB);
      }

      // Should have at least one FULL_STAT option
      expect(samples.length).toBeGreaterThan(0);

      // All FULL_STAT options should follow formula
      samples.forEach(option => {
        expect(option.stats).toBeDefined();

        const statCount = Object.keys(option.stats).length;
        expect(statCount).toBe(1); // Only one stat boosted

        if (option.stats.str) expect(option.stats.str).toBe(2);
        if (option.stats.speed) expect(option.stats.speed).toBe(2);
        if (option.stats.agility) expect(option.stats.agility).toBe(2);
        if (option.stats.hp) expect(option.stats.hp).toBe(12);
      });
    });
  });

  describe('SPLIT_STAT options', () => {
    it('should grant +1/+1 to two stats OR +6 HP + 1 stat', () => {
      const bruto = createMockBruto();

      // Generate many options
      const samples: any[] = [];
      for (let level = 1; level <= 20; level++) {
        const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, level);
        if (optionA.type === 'SPLIT_STAT') samples.push(optionA);
        if (optionB.type === 'SPLIT_STAT') samples.push(optionB);
      }

      expect(samples.length).toBeGreaterThan(0);

      samples.forEach(option => {
        expect(option.stats).toBeDefined();

        const statCount = Object.keys(option.stats).length;
        expect(statCount).toBeGreaterThanOrEqual(2); // Two stats boosted

        // Check valid formulas
        if (option.stats.hp) {
          // HP + stat variant
          expect(option.stats.hp).toBe(6);
          const otherStatCount = Object.keys(option.stats).filter(k => k !== 'hp').length;
          expect(otherStatCount).toBe(1);

          if (option.stats.str) expect(option.stats.str).toBe(1);
          if (option.stats.speed) expect(option.stats.speed).toBe(1);
          if (option.stats.agility) expect(option.stats.agility).toBe(1);
        } else {
          // Two stats variant
          expect(statCount).toBe(2);
          Object.values(option.stats).forEach(value => {
            expect(value).toBe(1);
          });
        }
      });
    });
  });

  describe('WEAPON options', () => {
    it('should generate weapon option with weaponId', () => {
      const bruto = createMockBruto();

      const samples: any[] = [];
      for (let level = 2; level <= 10; level++) {
        const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, level);
        if (optionA.type === 'WEAPON') samples.push(optionA);
        if (optionB.type === 'WEAPON') samples.push(optionB);
      }

      if (samples.length > 0) {
        samples.forEach(option => {
          expect(option.weaponId).toBeDefined();
          expect(typeof option.weaponId).toBe('string');
          expect(option.description).toContain('Arma:');
          expect(option.description).toContain('Próximamente');
        });
      }
    });
  });

  describe('SKILL options', () => {
    it('should generate skill option with skillId', () => {
      const bruto = createMockBruto();

      const samples: any[] = [];
      for (let level = 2; level <= 10; level++) {
        const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, level);
        if (optionA.type === 'SKILL') samples.push(optionA);
        if (optionB.type === 'SKILL') samples.push(optionB);
      }

      if (samples.length > 0) {
        samples.forEach(option => {
          expect(option.skillId).toBeDefined();
          expect(typeof option.skillId).toBe('string');
          expect(option.description).toContain('Habilidad:');
          expect(option.description).toContain('Próximamente');
        });
      }
    });
  });

  describe('PET options', () => {
    it('should generate pet option with petType', () => {
      const bruto = createMockBruto({ skills: [] });

      const samples: any[] = [];
      for (let level = 3; level <= 10; level++) {
        const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, level);
        if (optionA.type === 'PET') samples.push(optionA);
        if (optionB.type === 'PET') samples.push(optionB);
      }

      if (samples.length > 0) {
        samples.forEach(option => {
          expect(option.petType).toBeDefined();
          expect(typeof option.petType).toBe('string');
          expect(option.description).toContain('Mascota:');
          expect(option.description).toContain('Próximamente');
        });
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle high level brutos', () => {
      const bruto = createMockBruto({ level: 100 });
      const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, 101);

      expect(optionA).toBeDefined();
      expect(optionB).toBeDefined();
      expect(optionA.type).not.toBe(optionB.type);
    });

    it('should always include description', () => {
      const bruto = createMockBruto();
      
      for (let level = 1; level <= 10; level++) {
        const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, level);

        expect(optionA.description).toBeTruthy();
        expect(optionB.description).toBeTruthy();
        expect(optionA.description.length).toBeGreaterThan(0);
        expect(optionB.description.length).toBeGreaterThan(0);
      }
    });

    it('should generate valid upgrade types', () => {
      const bruto = createMockBruto();
      const validTypes = ['FULL_STAT', 'SPLIT_STAT', 'WEAPON', 'SKILL', 'PET'];

      for (let level = 1; level <= 10; level++) {
        const [optionA, optionB] = UpgradeGenerator.generateOptions(bruto, level);

        expect(validTypes).toContain(optionA.type);
        expect(validTypes).toContain(optionB.type);
      }
    });
  });
});
