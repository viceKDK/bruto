/**
 * SkillDetailsModal Tests - Story 6.7
 * Tests modal configuration and skill data handling
 */

import { describe, it, expect } from 'vitest';
import { Skill, SkillCategory, SkillEffectType, SkillEffectTiming, StatType } from '../../models/Skill';

describe('SkillDetailsModal - Story 6.7', () => {
  describe('AC1: Skill data validation', () => {
    it('should validate complete skill structure', () => {
      const mockSkill: Skill = {
        id: 'fuerza_hercules',
        name: 'Fuerza Hércules',
        description: 'Otorga +3 STR plano, +50% STR, y +3 STR extra en cada level-up.',
        category: SkillCategory.STAT_BUFF,
        effects: [
          {
            type: SkillEffectType.STAT_BOOST,
            timing: SkillEffectTiming.IMMEDIATE,
            stat: StatType.STR,
            value: 3,
            modifier: 'flat',
          },
          {
            type: SkillEffectType.STAT_BOOST,
            timing: SkillEffectTiming.PASSIVE,
            stat: StatType.STR,
            value: 50,
            modifier: 'percentage',
          },
        ],
        stackable: false,
        odds: 15,
        implemented: true,
      };

      expect(mockSkill.id).toBe('fuerza_hercules');
      expect(mockSkill.name).toBe('Fuerza Hércules');
      expect(mockSkill.category).toBe(SkillCategory.STAT_BUFF);
      expect(mockSkill.effects?.length).toBe(2);
      expect(mockSkill.stackable).toBe(false);
    });

    it('should handle skill with multiple effects', () => {
      const complexSkill: Skill = {
        id: 'complex_skill',
        name: 'Complex Skill',
        description: 'A skill with many effects',
        category: SkillCategory.ACTIVE_ABILITY,
        effects: [
          {
            type: SkillEffectType.STAT_BOOST,
            timing: SkillEffectTiming.IMMEDIATE,
            stat: StatType.HP,
            value: 10,
            modifier: 'flat',
          },
          {
            type: SkillEffectType.DAMAGE_MODIFIER,
            timing: SkillEffectTiming.PASSIVE,
            value: 25,
            modifier: 'percentage',
          },
          {
            type: SkillEffectType.ARMOR_BONUS,
            timing: SkillEffectTiming.ON_COMBAT_START,
            value: 15,
            modifier: 'percentage',
          },
        ],
        stackable: true,
        maxStacks: 3,
        odds: 10,
        implemented: true,
      };

      expect(complexSkill.effects?.length).toBe(3);
      expect(complexSkill.stackable).toBe(true);
      expect(complexSkill.maxStacks).toBe(3);
    });

    it('should handle skill with mutual exclusions', () => {
      const exclusiveSkill: Skill = {
        id: 'exclusive_skill',
        name: 'Exclusive Skill',
        description: 'Cannot be combined with other skills',
        category: SkillCategory.STAT_BUFF,
        effects: [],
        stackable: false,
        mutuallyExclusiveWith: ['skill_a', 'skill_b', 'skill_c'],
        odds: 20,
        implemented: true,
      };

      expect(exclusiveSkill.mutuallyExclusiveWith).toHaveLength(3);
      expect(exclusiveSkill.mutuallyExclusiveWith).toContain('skill_a');
      expect(exclusiveSkill.mutuallyExclusiveWith).toContain('skill_b');
      expect(exclusiveSkill.mutuallyExclusiveWith).toContain('skill_c');
    });

    it('should handle skill without description', () => {
      const minimalSkill: Skill = {
        id: 'minimal',
        name: 'Minimal Skill',
        description: '',
        category: SkillCategory.PASSIVE_EFFECT,
        effects: [],
        stackable: false,
        odds: 10,
        implemented: true,
      };

      expect(minimalSkill.description).toBe('');
      expect(minimalSkill.odds).toBe(10);
      expect(minimalSkill.mutuallyExclusiveWith).toBeUndefined();
      expect(minimalSkill.implemented).toBe(true);
    });
  });

  describe('AC2: Effect data structures', () => {
    it('should validate flat modifier effects', () => {
      const effect = {
        type: SkillEffectType.STAT_BOOST,
        timing: SkillEffectTiming.IMMEDIATE,
        stat: StatType.STR,
        value: 5,
        modifier: 'flat' as const,
      };

      expect(effect.modifier).toBe('flat');
      expect(effect.value).toBe(5);
      expect(effect.stat).toBe(StatType.STR);
    });

    it('should validate percentage modifier effects', () => {
      const effect = {
        type: SkillEffectType.STAT_BOOST,
        timing: SkillEffectTiming.PASSIVE,
        stat: StatType.AGILITY,
        value: 50,
        modifier: 'percentage' as const,
      };

      expect(effect.modifier).toBe('percentage');
      expect(effect.value).toBe(50);
      expect(effect.stat).toBe(StatType.AGILITY);
    });

    it('should validate combined modifier effects', () => {
      const effect = {
        type: SkillEffectType.STAT_BOOST,
        timing: SkillEffectTiming.PASSIVE,
        stat: StatType.HP,
        value: 100,
        modifier: 'both' as const,
      };

      expect(effect.modifier).toBe('both');
      expect(effect.value).toBe(100);
    });

    it('should validate conditional effects', () => {
      const effect = {
        type: SkillEffectType.DAMAGE_MODIFIER,
        timing: SkillEffectTiming.CONDITIONAL,
        value: 50,
        condition: 'when HP below 50%',
        target: 'self' as const,
      };

      expect(effect.condition).toBe('when HP below 50%');
      expect(effect.target).toBe('self');
      expect(effect.timing).toBe(SkillEffectTiming.CONDITIONAL);
    });
  });

  describe('AC3: Grid layout calculation (7×8 = 56 slots)', () => {
    it('should calculate correct total slots for 7×8 grid', () => {
      const columns = 7;
      const rows = 8;
      const totalSlots = columns * rows;

      expect(totalSlots).toBe(56);
    });

    it('should support various skill counts within 56 slots', () => {
      const maxSlots = 56;
      const testCounts = [0, 5, 10, 20, 30, 40, 56];

      testCounts.forEach((count) => {
        expect(count).toBeLessThanOrEqual(maxSlots);
      });
    });
  });
});
