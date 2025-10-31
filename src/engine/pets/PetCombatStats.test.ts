/**
 * PetCombatStats.test.ts - Story 7.2
 * Tests for pet combat stat calculation functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMultiHitChance,
  calculateEvasionChance,
  calculateInitiative
} from './PetCombatStats';

describe('PetCombatStats - Story 7.2', () => {
  describe('calculateMultiHitChance', () => {
    it('should return base chance when no pet bonus', () => {
      const chance = calculateMultiHitChance(0, 0);
      expect(chance).toBe(0);
    });

    it('should add Perro multi-hit bonus', () => {
      const chance = calculateMultiHitChance(0, 10);
      expect(chance).toBe(10);
    });

    it('should add Pantera multi-hit bonus', () => {
      const chance = calculateMultiHitChance(0, 60);
      expect(chance).toBe(60);
    });

    it('should subtract Oso multi-hit penalty', () => {
      const chance = calculateMultiHitChance(30, -20);
      expect(chance).toBe(10);
    });

    it('should sum multiple pet bonuses', () => {
      // 3 Perros = +30%, Pantera = +60%
      const chance = calculateMultiHitChance(0, 90);
      expect(chance).toBe(90);
    });

    it('should clamp to 0 minimum', () => {
      const chance = calculateMultiHitChance(10, -30);
      expect(chance).toBe(0);
    });

    it('should clamp to 100 maximum', () => {
      const chance = calculateMultiHitChance(50, 80);
      expect(chance).toBe(100);
    });
  });

  describe('calculateEvasionChance', () => {
    it('should return agility evasion when no pet bonus', () => {
      const chance = calculateEvasionChance(25, 0);
      expect(chance).toBe(25);
    });

    it('should add Pantera evasion bonus', () => {
      const chance = calculateEvasionChance(20, 5);
      expect(chance).toBe(25);
    });

    it('should clamp to 95% maximum', () => {
      const chance = calculateEvasionChance(92, 5);
      expect(chance).toBe(95);
    });

    it('should clamp to 0% minimum', () => {
      const chance = calculateEvasionChance(0, -10);
      expect(chance).toBe(0);
    });

    it('should handle high agility with pet bonus', () => {
      // High agility bruto (50% evasion) + Pantera
      const chance = calculateEvasionChance(50, 5);
      expect(chance).toBe(55);
    });
  });

  describe('calculateInitiative', () => {
    it('should return speed when no pet modifier', () => {
      const initiative = calculateInitiative(10, 0);
      expect(initiative).toBe(10);
    });

    it('should add Pantera initiative bonus', () => {
      const initiative = calculateInitiative(10, 15);
      expect(initiative).toBe(25);
    });

    it('should subtract Perro initiative penalty', () => {
      const initiative = calculateInitiative(10, -10);
      expect(initiative).toBe(0);
    });

    it('should subtract Oso initiative penalty', () => {
      const initiative = calculateInitiative(20, -25);
      expect(initiative).toBe(-5); // Can be negative
    });

    it('should handle multiple pets', () => {
      // Pantera +15, Perro -10, Oso -25 = -20 total
      const initiative = calculateInitiative(30, -20);
      expect(initiative).toBe(10);
    });

    it('should allow negative initiative', () => {
      // Very slow bruto with Oso
      const initiative = calculateInitiative(5, -25);
      expect(initiative).toBe(-20);
    });
  });

  describe('Integration scenarios', () => {
    it('should calculate stats for 3 Perros + Pantera', () => {
      // 3 Perros: +30% multi-hit, -30 initiative
      // Pantera: +60% multi-hit, +5% evasion, +15 initiative
      const multiHit = calculateMultiHitChance(0, 90); // 30 + 60
      const evasion = calculateEvasionChance(25, 5);
      const initiative = calculateInitiative(10, -15); // -30 + 15

      expect(multiHit).toBe(90);
      expect(evasion).toBe(30);
      expect(initiative).toBe(-5);
    });

    it('should calculate stats for Oso only', () => {
      const multiHit = calculateMultiHitChance(0, -20);
      const evasion = calculateEvasionChance(15, 0);
      const initiative = calculateInitiative(12, -25);

      expect(multiHit).toBe(0); // Clamped to 0
      expect(evasion).toBe(15);
      expect(initiative).toBe(-13);
    });
  });
});
