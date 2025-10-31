/**
 * WeaponCombatService.test.ts
 * Tests for weapon integration in combat system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WeaponCombatService } from './WeaponCombatService';

describe('WeaponCombatService - Story 5 Combat Integration', () => {
  let service: WeaponCombatService;

  beforeEach(() => {
    service = new WeaponCombatService();
  });

  describe('Weapon Catalog Loading', () => {
    it('should load weapon catalog from JSON', () => {
      const sword = service.getWeapon('sword');
      expect(sword).toBeDefined();
      expect(sword?.name).toBe('Sword');
      expect(sword?.damage).toBe(28);
    });

    it('should return null for invalid weapon ID', () => {
      const invalid = service.getWeapon('invalid-weapon-99');
      expect(invalid).toBeNull();
    });

    it('should have all 10 weapons loaded', () => {
      const weaponIds = ['bare-hands', 'sword', 'spear', 'axe', 'dagger', 'mace', 'katana', 'sai', 'nunchaku', 'shuriken'];
      
      weaponIds.forEach(id => {
        const weapon = service.getWeapon(id);
        expect(weapon).toBeDefined();
      });
    });
  });

  describe('AC1: Weapon Damage Calculation', () => {
    it('should calculate damage from single weapon', () => {
      const damage = service.calculateWeaponDamage(['sword']);
      expect(damage).toBe(28); // Sword damage
    });

    it('should stack damage from multiple weapons', () => {
      const damage = service.calculateWeaponDamage(['sword', 'spear', 'mace']);
      expect(damage).toBe(28 + 12 + 30); // 70 total
    });

    it('should return 0 damage when no weapons equipped', () => {
      const damage = service.calculateWeaponDamage([]);
      expect(damage).toBe(0);
    });

    it('should ignore invalid weapon IDs', () => {
      const damage = service.calculateWeaponDamage(['sword', 'invalid-99', 'spear']);
      expect(damage).toBe(28 + 12); // Only valid weapons count
    });

    it('should handle max 3 weapons', () => {
      const damage = service.calculateWeaponDamage(['sword', 'spear', 'mace']);
      expect(damage).toBe(28 + 12 + 30); // 70 total
    });
  });

  describe('AC2: Combat Modifiers Aggregation', () => {
    it('should calculate crit chance bonus from weapons', () => {
      // Sword: +5% crit
      const modifiers = service.calculateCombatModifiers(['sword']);
      expect(modifiers.critChanceBonus).toBe(0.05); // 5% as decimal
    });

    it('should calculate evasion bonus from weapons', () => {
      // Sword: +20% evasion
      const modifiers = service.calculateCombatModifiers(['sword']);
      expect(modifiers.evasionBonus).toBe(0.20); // 20% as decimal
    });

    it('should stack modifiers from multiple weapons', () => {
      // Sword: +5% crit +20% evasion, Mace: +20% crit -30% evasion
      const modifiers = service.calculateCombatModifiers(['sword', 'mace']);
      expect(modifiers.critChanceBonus).toBe(0.25); // 5% + 20% = 25%
      expect(modifiers.evasionBonus).toBeCloseTo(-0.10, 2); // 20% + (-30%) = -10%
    });

    it('should include weapon damage in modifiers', () => {
      const modifiers = service.calculateCombatModifiers(['sword', 'spear']);
      expect(modifiers.weaponDamage).toBe(40); // 28 + 12
    });

    it('should return empty modifiers when no weapons', () => {
      const modifiers = service.calculateCombatModifiers([]);
      expect(modifiers.weaponDamage).toBe(0);
      expect(modifiers.critChanceBonus).toBeUndefined();
      expect(modifiers.evasionBonus).toBeUndefined();
    });
  });

  describe('AC3: Disarm Mechanics Integration', () => {
    it('should exclude disarmed weapons from damage calculation', () => {
      const damage = service.calculateWeaponDamage(['sword', 'spear', 'mace']);
      expect(damage).toBe(70); // 28 + 12 + 30

      // Now with spear disarmed
      const modifiers = service.calculateCombatModifiers(['sword', 'spear', 'mace'], ['spear']);
      expect(modifiers.weaponDamage).toBe(58); // 28 + 30 (spear excluded)
    });

    it('should exclude disarmed weapons from modifiers', () => {
      // Sword has +5% crit
      const withSword = service.calculateCombatModifiers(['sword']);
      expect(withSword.critChanceBonus).toBe(0.05);

      // Sword disarmed
      const withoutSword = service.calculateCombatModifiers(['sword'], ['sword']);
      expect(withoutSword.critChanceBonus).toBeUndefined();
      expect(withoutSword.weaponDamage).toBe(0);
    });

    it('should handle partial disarm (some weapons active)', () => {
      const modifiers = service.calculateCombatModifiers(
        ['sword', 'spear', 'mace'],
        ['sword'] // Only sword disarmed
      );
      expect(modifiers.weaponDamage).toBe(42); // 12 + 30 (sword excluded)
    });

    it('should get disarm chance modifier from weapons', () => {
      // Sai: +75% disarm
      const disarmBonus = service.getDisarmChanceModifier(['sai']);
      expect(disarmBonus).toBe(75);
    });

    it('should exclude disarmed weapons from disarm modifier', () => {
      const withSai = service.getDisarmChanceModifier(['sai']);
      expect(withSai).toBe(75);

      const withoutSai = service.getDisarmChanceModifier(['sai'], ['sai']);
      expect(withoutSai).toBe(0);
    });
  });

  describe('Helpers', () => {
    it('should check if bruto has weapons', () => {
      expect(service.hasWeapons(['sword'])).toBe(true);
      expect(service.hasWeapons([])).toBe(false);
      expect(service.hasWeapons(undefined)).toBe(false);
    });

    it('should get equipped weapon names for UI', () => {
      const names = service.getEquippedWeaponNames(['sword', 'spear', 'mace']);
      expect(names).toEqual(['Sword', 'Spear', 'Mace']);
    });

    it('should handle invalid IDs in weapon names', () => {
      const names = service.getEquippedWeaponNames(['sword', 'invalid-99', 'spear']);
      expect(names).toEqual(['Sword', 'Spear']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty weapon arrays', () => {
      const modifiers = service.calculateCombatModifiers([]);
      expect(modifiers).toEqual({ weaponDamage: 0 });
    });

    it('should handle all weapons disarmed', () => {
      const weapons = ['sword', 'spear', 'mace'];
      const modifiers = service.calculateCombatModifiers(weapons, weapons);
      expect(modifiers.weaponDamage).toBe(0);
    });

    it('should not crash with duplicate weapon IDs', () => {
      // In case of data corruption
      const modifiers = service.calculateCombatModifiers(['sword', 'sword', 'sword']);
      expect(modifiers.weaponDamage).toBe(84); // 28 + 28 + 28
    });
  });
});
