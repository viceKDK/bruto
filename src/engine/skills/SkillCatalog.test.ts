/**
 * SkillCatalog Tests
 * Validates skill catalog loading and lookup operations
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SkillCatalog } from './SkillCatalog';
import { SkillCategory } from '../../models/Skill';

describe('SkillCatalog', () => {
  let catalog: SkillCatalog;

  beforeAll(() => {
    catalog = SkillCatalog.getInstance();
  });

  describe('Catalog Loading', () => {
    it('should load skills from JSON catalog', () => {
      const totalSkills = catalog.getTotalSkillCount();
      expect(totalSkills).toBeGreaterThan(0);
    });

    it('should load Fuerza Hércules skill', () => {
      const skill = catalog.getSkillById('fuerza_hercules');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('Fuerza Hércules');
      expect(skill?.category).toBe('stat_buff');
    });

    it('should load Vitalidad skill', () => {
      const skill = catalog.getSkillById('vitalidad');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('Vitalidad');
      expect(skill?.odds).toBe(5.83);
    });

    it('should load Inmortalidad skill with correct rarity', () => {
      const skill = catalog.getSkillById('inmortalidad');
      expect(skill).toBeDefined();
      expect(skill?.odds).toBe(0.01); // Rarest skill
    });
  });

  describe('Skill Lookup', () => {
    it('should find skill by ID', () => {
      const skill = catalog.getSkillById('agilidad_felina');
      expect(skill).toBeDefined();
      expect(skill?.name).toBe('Agilidad Felina');
    });

    it('should find skill by name (case-insensitive)', () => {
      const skill = catalog.getSkillByName('golpe de trueno');
      expect(skill).toBeDefined();
      expect(skill?.id).toBe('golpe_trueno');
    });

    it('should return undefined for non-existent skill', () => {
      const skill = catalog.getSkillById('non_existent');
      expect(skill).toBeUndefined();
    });

    it('should check if skill exists', () => {
      expect(catalog.hasSkill('fuerza_hercules')).toBe(true);
      expect(catalog.hasSkill('fake_skill')).toBe(false);
    });
  });

  describe('Category Filtering', () => {
    it('should filter skills by stat_buff category', () => {
      const statBuffs = catalog.getSkillsByCategory(SkillCategory.STAT_BUFF);
      expect(statBuffs.length).toBeGreaterThan(0);
      
      const fuerzaHercules = statBuffs.find(s => s.id === 'fuerza_hercules');
      expect(fuerzaHercules).toBeDefined();
    });

    it('should filter skills by passive_effect category', () => {
      const passives = catalog.getSkillsByCategory(SkillCategory.PASSIVE_EFFECT);
      expect(passives.length).toBeGreaterThan(0);
    });

    it('should filter skills by active_ability category', () => {
      const actives = catalog.getSkillsByCategory(SkillCategory.ACTIVE_ABILITY);
      expect(actives.length).toBeGreaterThan(0);
      
      const fuerzaBruta = actives.find(s => s.id === 'fuerza_bruta');
      expect(fuerzaBruta).toBeDefined();
    });

    it('should return empty array for category with no skills', () => {
      const resistance = catalog.getSkillsByCategory(SkillCategory.RESISTANCE_MODIFIER);
      expect(resistance).toEqual([]);
    });
  });

  describe('Rarity Filtering', () => {
    it('should get skills by rarity range', () => {
      // Get common skills (5-10% odds)
      const commonSkills = catalog.getSkillsByRarity(5, 10);
      expect(commonSkills.length).toBeGreaterThan(0);
    });

    it('should get rare skills (< 1% odds)', () => {
      const rareSkills = catalog.getSkillsByRarity(0, 1);
      expect(rareSkills.length).toBeGreaterThan(0);
      
      const inmortalidad = rareSkills.find(s => s.id === 'inmortalidad');
      expect(inmortalidad).toBeDefined();
    });

    it('should get all acquirable skills (odds > 0)', () => {
      const acquirable = catalog.getAcquirableSkills();
      expect(acquirable.length).toBeGreaterThan(0);
      
      // All should have odds > 0
      acquirable.forEach(skill => {
        expect(skill.odds).toBeGreaterThan(0);
      });
    });
  });

  describe('Skill Effects', () => {
    it('should have effects for Fuerza Hércules', () => {
      const skill = catalog.getSkillById('fuerza_hercules');
      expect(skill?.effects).toBeDefined();
      expect(skill?.effects.length).toBeGreaterThan(0);
      
      // Should have immediate +3 STR effect
      const flatBoost = skill?.effects.find(e => 
        e.type === 'stat_boost' && 
        e.modifier === 'flat' && 
        e.value === 3
      );
      expect(flatBoost).toBeDefined();
      
      // Should have +50% STR effect
      const percentBoost = skill?.effects.find(e => 
        e.type === 'stat_boost' && 
        e.modifier === 'percentage' && 
        e.value === 50
      );
      expect(percentBoost).toBeDefined();
    });

    it('should have level-up bonuses for stat buffs', () => {
      const skill = catalog.getSkillById('vitalidad');
      const levelUpBonus = skill?.effects.find(e => 
        e.type === 'level_up_bonus'
      );
      expect(levelUpBonus).toBeDefined();
    });

    it('should have multiple effects for Inmortalidad', () => {
      const skill = catalog.getSkillById('inmortalidad');
      expect(skill?.effects.length).toBeGreaterThanOrEqual(5);
      
      // Should boost resistance
      const resBoost = skill?.effects.find(e => 
        e.stat === 'resistance' && e.value === 250
      );
      expect(resBoost).toBeDefined();
      
      // Should penalize STR
      const strPenalty = skill?.effects.find(e => 
        e.stat === 'str' && e.value === -25
      );
      expect(strPenalty).toBeDefined();
    });
  });

  describe('Catalog Validation', () => {
    it('should validate catalog integrity', () => {
      const validation = catalog.validateCatalog();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should have no broken mutual exclusion references', () => {
      const allSkills = catalog.getAllSkills();
      allSkills.forEach(skill => {
        if (skill.mutuallyExclusiveWith) {
          skill.mutuallyExclusiveWith.forEach(exclusiveId => {
            const exclusiveSkill = catalog.getSkillById(exclusiveId);
            expect(exclusiveSkill).toBeDefined();
          });
        }
      });
    });
  });

  describe('Stacking Rules', () => {
    it('should mark stat buffs as non-stackable', () => {
      const fuerzaHercules = catalog.getSkillById('fuerza_hercules');
      expect(fuerzaHercules?.stackable).toBe(false);
    });

    it('should allow some skills to stack', () => {
      const toughenedSkin = catalog.getSkillById('toughened_skin');
      expect(toughenedSkin?.stackable).toBe(true);
      expect(toughenedSkin?.maxStacks).toBe(1);
    });
  });
});
