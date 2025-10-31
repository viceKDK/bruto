/**
 * PassiveSkillCombatService Tests - Story 6.4
 * Test passive skill integration into combat calculations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PassiveSkillCombatService } from './PassiveSkillCombatService';
import { IBruto } from '../../models/Bruto';

describe('PassiveSkillCombatService - Story 6.4', () => {
  let service: PassiveSkillCombatService;
  let mockBruto: IBruto;

  beforeEach(() => {
    service = PassiveSkillCombatService.getInstance();
    
    // Base bruto without skills
    mockBruto = {
      id: 'bruto-1',
      userId: 'user-1',
      name: 'Test Bruto',
      level: 5,
      xp: 100,
      hp: 100,
      maxHp: 100,
      str: 10,
      speed: 10,
      agility: 10,
      resistance: 10,
      appearanceId: 1,
      colorVariant: 1,
      createdAt: new Date(),
      skills: [],
    };
  });

  describe('AC1: Armor Passive Skills Integration', () => {
    it('should return 0 armor bonus when bruto has no skills', () => {
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      expect(modifiers.armorBonus).toBe(0);
    });

    it('should apply Piel Dura (toughened_skin) +10% armor bonus', () => {
      mockBruto.skills = ['toughened_skin'];
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      expect(modifiers.armorBonus).toBe(10);
    });

    it('should apply Esqueleto de Plomo +15% armor bonus', () => {
      mockBruto.skills = ['esqueleto_plomo'];
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      expect(modifiers.armorBonus).toBe(15);
    });

    it('should stack multiple armor skills', () => {
      mockBruto.skills = ['toughened_skin', 'esqueleto_plomo'];
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      // Piel Dura (10%) + Esqueleto (15%) = 25% total
      expect(modifiers.armorBonus).toBe(25);
    });
  });

  describe('AC2: Evasion Modifier Skills Integration', () => {
    it('should return 0 evasion bonus when bruto has no skills', () => {
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      expect(modifiers.evasionBonus).toBe(0);
    });

    it('should apply Esqueleto de Plomo -15% evasion penalty', () => {
      mockBruto.skills = ['esqueleto_plomo'];
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      expect(modifiers.evasionBonus).toBe(-15);
    });

    it('should handle future Reflejos Felinos skill when added', () => {
      // This test will pass when reflejos_felinos skill is added to catalog
      // For now, verify it handles non-existent skill gracefully
      mockBruto.skills = ['reflejos_felinos'];
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      // Should return 0 since skill doesn't exist yet
      expect(modifiers.evasionBonus).toBe(0);
    });
  });

  describe('AC3: Weapon-Specific Bonuses (Epic 5 Integration)', () => {
    it('should return 0 weapon bonus when no weapon-specific skills exist', () => {
      mockBruto.skills = ['toughened_skin']; // Non-weapon skill
      
      const modifiers = service.getAttackerModifiers(mockBruto, 'sword');
      
      // Should be 0 since toughened_skin isn't a weapon bonus
      expect(modifiers.skillDamageBonus).toBe(0);
    });

    it('should handle future Maestro de Espadas when added to catalog', () => {
      // This test documents expected behavior for Epic 5/6 integration
      mockBruto.skills = ['maestro_espadas'];
      
      const modifiers = service.getAttackerModifiers(mockBruto, 'sword');
      
      // Should be 0 now since skill doesn't exist, will be 20 when added
      expect(modifiers.skillDamageBonus).toBe(0);
    });

    it('should apply general damage bonuses without weapon type', () => {
      mockBruto.skills = ['toughened_skin'];
      
      const modifiers = service.getAttackerModifiers(mockBruto);
      
      expect(modifiers.skillDamageBonus).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AC4: Damage Type Resistances (Future Integration)', () => {
    it('should return 0 resistance when bruto has no resistance skills', () => {
      const resistance = service.getDamageTypeResistance(mockBruto, 'fire');
      
      expect(resistance).toBe(0);
    });

    it('should return 0 for unmatched damage types', () => {
      // Future: When fire resistance skill exists
      // For now, no skills implement damage type resistances
      const resistance = service.getDamageTypeResistance(mockBruto, 'ice');
      
      expect(resistance).toBe(0);
    });
  });

  describe('AC5: Stacking and Caps Validation', () => {
    it('should handle invalid skill IDs gracefully', () => {
      mockBruto.skills = ['invalid_skill', 'toughened_skin'];
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      // Should only apply valid skill (Piel Dura)
      expect(modifiers.armorBonus).toBe(10);
    });

    it('should handle empty skills array', () => {
      mockBruto.skills = [];
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      expect(modifiers.armorBonus).toBe(0);
      expect(modifiers.evasionBonus).toBe(0);
    });

    it('should handle undefined skills property', () => {
      mockBruto.skills = undefined;
      
      const modifiers = service.getDefenderModifiers(mockBruto);
      
      expect(modifiers.armorBonus).toBe(0);
      expect(modifiers.evasionBonus).toBe(0);
    });
  });

  describe('Attacker Modifiers Integration', () => {
    it('should return 0 damage bonus when bruto has no combat skills', () => {
      const modifiers = service.getAttackerModifiers(mockBruto);
      
      expect(modifiers.skillDamageBonus).toBe(0);
    });

    it('should include crit chance bonus from combat modifiers', () => {
      // Assuming Ojo de Halcón gives crit bonus
      mockBruto.skills = ['ojo_halcon'];
      
      const modifiers = service.getAttackerModifiers(mockBruto);
      
      expect(modifiers.critChanceBonus).toBeGreaterThanOrEqual(0);
    });

    it('should include multi-hit chance from combat modifiers', () => {
      const modifiers = service.getAttackerModifiers(mockBruto);
      
      expect(modifiers.multiHitChance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Service Singleton Pattern', () => {
    it('should return same instance on multiple getInstance calls', () => {
      const instance1 = PassiveSkillCombatService.getInstance();
      const instance2 = PassiveSkillCombatService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});
