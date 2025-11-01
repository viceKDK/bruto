/**
 * SkillEffectEngine Tests
 * Validates skill effect application for stats, combat, and abilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SkillEffectEngine } from './SkillEffectEngine';
import { skillCatalog } from './SkillCatalog';
import { IBruto } from '../../models/Bruto';
import { StatType } from '../../models/Skill';

describe('SkillEffectEngine', () => {
  let engine: SkillEffectEngine;
  let mockBruto: IBruto;

  beforeEach(() => {
    engine = SkillEffectEngine.getInstance();
    
    // Create a mock bruto with base stats
    mockBruto = {
      id: 'test-bruto',
      userId: 'test-user',
      name: 'Test Fighter',
      level: 5,
      xp: 0,
      hp: 60,
      maxHp: 60,
      str: 10,
      speed: 8,
      agility: 7,
      resistance: 10,
      appearanceId: 1,
      colorVariant: 1,
      createdAt: new Date()
    };
  });

  describe('Stat Modifiers Calculation', () => {
    it('should calculate flat stat bonuses from Fuerza Hércules', () => {
      const skill = skillCatalog.getSkillById('fuerza_hercules');
      expect(skill).toBeDefined();

      const modifiers = engine.calculateStatModifiers(mockBruto, [skill!]);

      // Should have +3 STR flat bonus
      const flatBonus = modifiers.flatModifiers.find(m => 
        m.key === 'str' && m.amount === 3
      );
      expect(flatBonus).toBeDefined();
      expect(flatBonus?.source).toBe('skill');
    });

    it('should calculate percentage stat bonuses from Fuerza Hércules', () => {
      const skill = skillCatalog.getSkillById('fuerza_hercules');
      expect(skill).toBeDefined();

      const modifiers = engine.calculateStatModifiers(mockBruto, [skill!]);

      // Should have +50% STR multiplier (0.5 factor)
      const percentBonus = modifiers.multipliers.find(m => 
        m.key === 'str' && m.factor === 0.5
      );
      expect(percentBonus).toBeDefined();
      expect(percentBonus?.source).toBe('skill');
    });

    it('should calculate multiple skill modifiers', () => {
      const fuerzaHercules = skillCatalog.getSkillById('fuerza_hercules');
      const agilidadFelina = skillCatalog.getSkillById('agilidad_felina');
      
      const modifiers = engine.calculateStatModifiers(mockBruto, [fuerzaHercules!, agilidadFelina!]);

      // Should have modifiers for both STR and Agility
      const strFlat = modifiers.flatModifiers.find(m => m.key === 'str');
      const agilityFlat = modifiers.flatModifiers.find(m => m.key === 'agility');
      
      expect(strFlat).toBeDefined();
      expect(agilityFlat).toBeDefined();
    });

    it('should handle Vitalidad resistance bonuses', () => {
      const skill = skillCatalog.getSkillById('vitalidad');
      expect(skill).toBeDefined();

      const modifiers = engine.calculateStatModifiers(mockBruto, [skill!]);

      // Should have +3 resistance flat
      const flatBonus = modifiers.flatModifiers.find(m => 
        m.key === 'resistance' && m.amount === 3
      );
      expect(flatBonus).toBeDefined();

      // Should have +50% resistance multiplier
      const percentBonus = modifiers.multipliers.find(m => 
        m.key === 'resistance' && m.factor === 0.5
      );
      expect(percentBonus).toBeDefined();
    });
  });

  describe('Combat Modifiers Calculation', () => {
    it('should calculate armor bonus from Piel Dura', () => {
      const skill = skillCatalog.getSkillById('toughened_skin');
      expect(skill).toBeDefined();

      const modifiers = engine.calculateCombatModifiers(mockBruto, [skill!]);

      expect(modifiers.armorBonus).toBe(10);
    });

    it('should calculate critical bonus from Fuerza Bruta', () => {
      const skill = skillCatalog.getSkillById('fuerza_bruta');
      expect(skill).toBeDefined();

      const modifiers = engine.calculateCombatModifiers(mockBruto, [skill!]);

      expect(modifiers.criticalBonus).toBe(10);
    });

    it('should calculate evasion penalty from Esqueleto de Plomo', () => {
      const skill = skillCatalog.getSkillById('esqueleto_plomo');
      expect(skill).toBeDefined();

      const modifiers = engine.calculateCombatModifiers(mockBruto, [skill!]);

      expect(modifiers.evasionBonus).toBe(-15);
      expect(modifiers.armorBonus).toBe(15);
      expect(modifiers.bluntDamageReduction).toBe(15);
    });

    it('should stack multiple armor bonuses', () => {
      const pielDura = skillCatalog.getSkillById('toughened_skin');
      const esqueletoPlomo = skillCatalog.getSkillById('esqueleto_plomo');
      
      const modifiers = engine.calculateCombatModifiers(mockBruto, [pielDura!, esqueletoPlomo!]);

      // 10% + 15% = 25% armor
      expect(modifiers.armorBonus).toBe(25);
    });

    it('should calculate max damage cap from Resistente', () => {
      const skill = skillCatalog.getSkillById('resistente');
      expect(skill).toBeDefined();

      const modifiers = engine.calculateCombatModifiers(mockBruto, [skill!]);

      // Should cap at 20% of max HP (60 * 0.2 = 12)
      expect(modifiers.maxDamagePerHit).toBe(12);
    });
  });

  describe('Active Abilities', () => {
    it('should detect Fuerza Bruta as active ability', () => {
      const skill = skillCatalog.getSkillById('fuerza_bruta');
      expect(skill).toBeDefined();

      const abilities = engine.getActiveAbilities(mockBruto, [skill!]);

      expect(abilities.length).toBe(1);
      expect(abilities[0].skillName).toBe('Fuerza Bruta');
      expect(abilities[0].effectType).toBe('double_damage');
      expect(abilities[0].usesPerCombat).toBeGreaterThan(0);
    });

    it('should scale Fuerza Bruta uses with STR stat', () => {
      const skill = skillCatalog.getSkillById('fuerza_bruta');
      expect(skill).toBeDefined();

      // Bruto with 35 STR should get 2 uses (base 1 + 1 for 30+ STR)
      mockBruto.str = 35;
      const abilities = engine.getActiveAbilities(mockBruto, [skill!]);

      expect(abilities[0].usesPerCombat).toBe(2);

      // Bruto with 65 STR should get 3 uses
      mockBruto.str = 65;
      const abilitiesHighSTR = engine.getActiveAbilities(mockBruto, [skill!]);

      expect(abilitiesHighSTR[0].usesPerCombat).toBe(3);
    });

    it('should detect Poción Trágica as heal ability', () => {
      const skill = skillCatalog.getSkillById('pocion_tragica');
      expect(skill).toBeDefined();

      const abilities = engine.getActiveAbilities(mockBruto, [skill!]);

      expect(abilities.length).toBe(1);
      expect(abilities[0].skillName).toBe('Poción Trágica');
      expect(abilities[0].effectType).toBe('heal');
      expect(abilities[0].usesPerCombat).toBe(1);
    });

    it('should track multiple active abilities', () => {
      const fuerzaBruta = skillCatalog.getSkillById('fuerza_bruta');
      const pocionTragica = skillCatalog.getSkillById('pocion_tragica');
      
      const abilities = engine.getActiveAbilities(mockBruto, [fuerzaBruta!, pocionTragica!]);

      expect(abilities.length).toBe(2);
      expect(abilities.map(a => a.skillName)).toContain('Fuerza Bruta');
      expect(abilities.map(a => a.skillName)).toContain('Poción Trágica');
    });
  });

  describe('Level-Up Bonuses', () => {
    it('should apply level-up bonus from Fuerza Hércules', () => {
      const skill = skillCatalog.getSkillById('fuerza_hercules');
      expect(skill).toBeDefined();

      // Normal level-up gives 2 STR
      const normalBonus = engine.getLevelUpBonus([], StatType.STR, false);
      expect(normalBonus).toBe(2);

      // With Fuerza Hércules, should give 3 STR
      const bonusWithSkill = engine.getLevelUpBonus([skill!], StatType.STR, false);
      expect(bonusWithSkill).toBe(3);
    });

    it('should apply level-up bonus for split upgrades', () => {
      const skill = skillCatalog.getSkillById('vitalidad');
      expect(skill).toBeDefined();

      // Normal split gives 6 HP (base for resistance/HP stats)
      const normalBonus = engine.getLevelUpBonus([], StatType.RESISTANCE, true);
      expect(normalBonus).toBe(6);

      // With Vitalidad, split should give 9 HP
      const bonusWithSkill = engine.getLevelUpBonus([skill!], StatType.RESISTANCE, true);
      expect(bonusWithSkill).toBe(9);
    });

    it('should apply Meditación speed bonus (+150%)', () => {
      const skill = skillCatalog.getSkillById('meditacion');
      expect(skill).toBeDefined();

      // Normal level-up gives 2 Speed
      // With Meditación +150%, should give 5 Speed (2 * 2.5 = 5)
      const bonusWithSkill = engine.getLevelUpBonus([skill!], StatType.SPEED, false);
      expect(bonusWithSkill).toBe(5);
    });
  });

  describe('Immediate Effects Application', () => {
    it('should apply immediate stat boosts from Fuerza Hércules', () => {
      const skill = skillCatalog.getSkillById('fuerza_hercules');
      expect(skill).toBeDefined();

      const originalSTR = mockBruto.str;
      const modifiedBruto = engine.applyImmediateEffects(mockBruto, skill!);

      // Should have +3 STR and +50% STR
      // 10 + 3 = 13, then 13 * 1.5 = 19.5
      expect(modifiedBruto.str).toBeGreaterThan(originalSTR);
      expect(modifiedBruto.str).toBeCloseTo(19.5, 1);
    });

    it('should apply immediate effects for Inmortalidad', () => {
      const skill = skillCatalog.getSkillById('inmortalidad');
      expect(skill).toBeDefined();

      const originalStats = {
        str: mockBruto.str,
        agility: mockBruto.agility,
        speed: mockBruto.speed,
        resistance: mockBruto.resistance
      };

      const modifiedBruto = engine.applyImmediateEffects(mockBruto, skill!);

      // Resistance should increase by 250%
      expect(modifiedBruto.resistance).toBeGreaterThan(originalStats.resistance);

      // STR, Agility, Speed should decrease by 25%
      expect(modifiedBruto.str).toBeLessThan(originalStats.str);
      expect(modifiedBruto.agility).toBeLessThan(originalStats.agility);
      expect(modifiedBruto.speed).toBeLessThan(originalStats.speed);
    });

    it('should not modify bruto if no immediate effects', () => {
      const skill = skillCatalog.getSkillById('toughened_skin');
      expect(skill).toBeDefined();

      const modifiedBruto = engine.applyImmediateEffects(mockBruto, skill!);

      // Passive skill should not change stats immediately
      expect(modifiedBruto.str).toBe(mockBruto.str);
      expect(modifiedBruto.hp).toBe(mockBruto.hp);
    });
  });

  describe('Complex Skill Interactions', () => {
    it('should handle multiple stat buffs correctly', () => {
      const fuerzaHercules = skillCatalog.getSkillById('fuerza_hercules');
      const agilidadFelina = skillCatalog.getSkillById('agilidad_felina');
      const golpeTrueno = skillCatalog.getSkillById('golpe_trueno');

      const skills = [fuerzaHercules!, agilidadFelina!, golpeTrueno!];
      const modifiers = engine.calculateStatModifiers(mockBruto, skills);

      // Should have flat bonuses for all three stats
      expect(modifiers.flatModifiers.filter(m => m.key === 'str').length).toBeGreaterThan(0);
      expect(modifiers.flatModifiers.filter(m => m.key === 'agility').length).toBeGreaterThan(0);
      expect(modifiers.flatModifiers.filter(m => m.key === 'speed').length).toBeGreaterThan(0);

      // Should have percentage bonuses for all three stats
      expect(modifiers.multipliers.filter(m => m.key === 'str').length).toBeGreaterThan(0);
      expect(modifiers.multipliers.filter(m => m.key === 'agility').length).toBeGreaterThan(0);
      expect(modifiers.multipliers.filter(m => m.key === 'speed').length).toBeGreaterThan(0);
    });

    it('should combine combat modifiers from multiple skills', () => {
      const pielDura = skillCatalog.getSkillById('toughened_skin');
      const fuerzaBruta = skillCatalog.getSkillById('fuerza_bruta');
      
      const modifiers = engine.calculateCombatModifiers(mockBruto, [pielDura!, fuerzaBruta!]);

      expect(modifiers.armorBonus).toBe(10); // From Piel Dura
      expect(modifiers.criticalBonus).toBe(10); // From Fuerza Bruta
    });
  });
});
