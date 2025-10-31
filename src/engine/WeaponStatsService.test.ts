import { describe, it, expect } from 'vitest';
import { WeaponStatsService, CombatStats } from './WeaponStatsService';
import { Weapon, WeaponType } from '../models/Weapon';
import { IBruto } from '../models/Bruto';

describe('WeaponStatsService', () => {
  // Mock bruto for testing
  const mockBruto: IBruto = {
    id: '1',
    userId: 'user1',
    name: 'Test Bruto',
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    str: 10,
    speed: 10,
    agility: 10,
    resistance: 10,
    appearanceId: 1,
    colorVariant: 1,
    createdAt: new Date(),
  };

  // Mock sword weapon
  const mockSword: Weapon = {
    id: 'sword',
    name: 'Sword',
    nameEs: 'Espada',
    types: [WeaponType.Sharp],
    odds: 0.39,
    hitSpeed: 67,
    damage: 28,
    drawChance: 33,
    reach: 2,
    modifiers: {
      criticalChance: 5,
      evasion: 20,
      dexterity: 10,
      accuracy: 20,
      disarm: 10,
    },
  };

  // Mock hammer weapon (heavy penalties)
  const mockHammer: Weapon = {
    id: 'hammer',
    name: 'Hammer',
    nameEs: 'Martillo',
    types: [WeaponType.Heavy, WeaponType.Blunt],
    odds: 0.29,
    hitSpeed: 52,
    damage: 55,
    drawChance: 33,
    reach: 1,
    modifiers: {
      reversal: -20,
      evasion: -40,
      dexterity: -80,
      block: -40,
      accuracy: 50,
      disarm: 10,
      combo: -40,
    },
  };

  describe('calculateTotalDamage', () => {
    it('should calculate damage with weapon', () => {
      const damage = WeaponStatsService.calculateTotalDamage(mockBruto, mockSword);
      expect(damage).toBe(38); // 10 STR + 28 weapon damage
    });

    it('should calculate damage without weapon (bare hands)', () => {
      const damage = WeaponStatsService.calculateTotalDamage(mockBruto, null);
      expect(damage).toBe(10); // Just STR
    });

    it('should handle high damage weapon (Hammer)', () => {
      const damage = WeaponStatsService.calculateTotalDamage(mockBruto, mockHammer);
      expect(damage).toBe(65); // 10 STR + 55 weapon damage
    });
  });

  describe('applyWeaponModifiers', () => {
    const baseStats: CombatStats = {
      criticalChance: 10,
      evasion: 50,
      dexterity: 50,
      accuracy: 80,
      block: 30,
      disarm: 5,
      combo: 20,
      deflect: 10,
      reversal: 15,
    };

    it('should apply positive modifiers correctly', () => {
      const modifiedStats = WeaponStatsService.applyWeaponModifiers(baseStats, mockSword);
      
      // Sword modifiers: +5% crit, +20% evasion, +10% dex, +20% accuracy, +10% disarm
      expect(modifiedStats.criticalChance).toBe(10.5); // 10 + (10 * 5 / 100)
      expect(modifiedStats.evasion).toBe(60); // 50 + (50 * 20 / 100)
      expect(modifiedStats.dexterity).toBe(55); // 50 + (50 * 10 / 100)
      expect(modifiedStats.accuracy).toBe(96); // 80 + (80 * 20 / 100)
      expect(modifiedStats.disarm).toBe(5.5); // 5 + (5 * 10 / 100)
    });

    it('should apply negative modifiers correctly', () => {
      const modifiedStats = WeaponStatsService.applyWeaponModifiers(baseStats, mockHammer);
      
      // Hammer: -20% reversal, -40% evasion, -80% dex, -40% block, +50% accuracy, -40% combo
      expect(modifiedStats.reversal).toBe(12); // 15 + (15 * -20 / 100) = 15 - 3
      expect(modifiedStats.evasion).toBe(30); // 50 + (50 * -40 / 100) = 50 - 20
      expect(modifiedStats.dexterity).toBe(10); // 50 + (50 * -80 / 100) = 50 - 40
      expect(modifiedStats.block).toBe(18); // 30 + (30 * -40 / 100) = 30 - 12
      expect(modifiedStats.accuracy).toBe(120); // 80 + (80 * 50 / 100) = 80 + 40
      expect(modifiedStats.combo).toBe(12); // 20 + (20 * -40 / 100) = 20 - 8
    });

    it('should return unchanged stats for no weapon', () => {
      const modifiedStats = WeaponStatsService.applyWeaponModifiers(baseStats, null);
      expect(modifiedStats).toEqual(baseStats);
    });
  });

  describe('getHitSpeedMultiplier', () => {
    it('should return correct multiplier for weapon', () => {
      const multiplier = WeaponStatsService.getHitSpeedMultiplier(mockSword);
      expect(multiplier).toBe(0.67); // 67 / 100
    });

    it('should return 1.0 for no weapon', () => {
      const multiplier = WeaponStatsService.getHitSpeedMultiplier(null);
      expect(multiplier).toBe(1.0);
    });

    it('should handle fast weapon (200% speed)', () => {
      const fastWeapon: Weapon = {
        ...mockSword,
        hitSpeed: 200,
      };
      const multiplier = WeaponStatsService.getHitSpeedMultiplier(fastWeapon);
      expect(multiplier).toBe(2.0);
    });
  });

  describe('getWeaponReach', () => {
    it('should return weapon reach', () => {
      const reach = WeaponStatsService.getWeaponReach(mockSword);
      expect(reach).toBe(2);
    });

    it('should return 1 for no weapon (bare hands)', () => {
      const reach = WeaponStatsService.getWeaponReach(null);
      expect(reach).toBe(1);
    });

    it('should handle long reach weapon (whip)', () => {
      const whip: Weapon = {
        ...mockSword,
        reach: 5,
      };
      const reach = WeaponStatsService.getWeaponReach(whip);
      expect(reach).toBe(5);
    });
  });

  describe('shouldDrawWeapon', () => {
    it('should always draw weapon with 100% draw chance', () => {
      const alwaysDrawWeapon: Weapon = {
        ...mockSword,
        drawChance: 100,
      };
      
      // Test multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        expect(WeaponStatsService.shouldDrawWeapon(alwaysDrawWeapon)).toBe(true);
      }
    });

    it('should never draw weapon with 0% draw chance', () => {
      const neverDrawWeapon: Weapon = {
        ...mockSword,
        drawChance: 0,
      };
      
      // Test multiple times to ensure consistency
      for (let i = 0; i < 10; i++) {
        expect(WeaponStatsService.shouldDrawWeapon(neverDrawWeapon)).toBe(false);
      }
    });

    it('should always draw null weapon (bare hands)', () => {
      expect(WeaponStatsService.shouldDrawWeapon(null)).toBe(true);
    });
  });

  describe('combineWeaponModifiers', () => {
    it('should combine modifiers from multiple weapons', () => {
      const weapon1: Weapon = {
        ...mockSword,
        modifiers: { criticalChance: 10, evasion: 20 },
      };
      
      const weapon2: Weapon = {
        ...mockSword,
        modifiers: { criticalChance: 5, accuracy: 15 },
      };

      const combined = WeaponStatsService.combineWeaponModifiers([weapon1, weapon2]);
      
      expect(combined.criticalChance).toBe(15); // 10 + 5
      expect(combined.evasion).toBe(20); // 20 + 0
      expect(combined.accuracy).toBe(15); // 0 + 15
    });

    it('should handle empty weapons array', () => {
      const combined = WeaponStatsService.combineWeaponModifiers([]);
      expect(combined).toEqual({});
    });

    it('should handle negative modifiers in combination', () => {
      const weapon1: Weapon = {
        ...mockSword,
        modifiers: { dexterity: 20 },
      };
      
      const weapon2: Weapon = {
        ...mockHammer,
        modifiers: { dexterity: -40 },
      };

      const combined = WeaponStatsService.combineWeaponModifiers([weapon1, weapon2]);
      expect(combined.dexterity).toBe(-20); // 20 + (-40)
    });
  });

  describe('selectActiveWeapon', () => {
    it('should return null for empty weapons array', () => {
      const weapon = WeaponStatsService.selectActiveWeapon([]);
      expect(weapon).toBeNull();
    });

    it('should select from available weapons based on draw chance', () => {
      const weapon1: Weapon = { ...mockSword, drawChance: 100 };
      const weapon2: Weapon = { ...mockHammer, drawChance: 0 };

      const selected = WeaponStatsService.selectActiveWeapon([weapon1, weapon2]);
      
      // Should select weapon1 since weapon2 has 0% draw chance
      expect(selected).toBe(weapon1);
    });

    it('should return null if no weapons can be drawn', () => {
      const weapon1: Weapon = { ...mockSword, drawChance: 0 };
      const weapon2: Weapon = { ...mockHammer, drawChance: 0 };

      const selected = WeaponStatsService.selectActiveWeapon([weapon1, weapon2]);
      expect(selected).toBeNull();
    });
  });
});
