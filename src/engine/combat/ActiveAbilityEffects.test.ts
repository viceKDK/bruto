/**
 * ActiveAbilityEffects Tests - Story 6.5
 * Test ability effect application
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ActiveAbilityEffects } from './ActiveAbilityEffects';
import { SeededRandom } from '../../utils/SeededRandom';

describe('ActiveAbilityEffects - Story 6.5', () => {
  let effects: ActiveAbilityEffects;
  let rng: SeededRandom;

  beforeEach(() => {
    rng = new SeededRandom(12345); // Fixed seed for deterministic tests
    effects = new ActiveAbilityEffects(rng);
  });

  describe('Fuerza Bruta - Double Damage', () => {
    it('should return 2x damage multiplier', () => {
      const result = effects.applyFuerzaBruta();

      expect(result.effectApplied).toBe(true);
      expect(result.damageMultiplier).toBe(2.0);
      expect(result.message).toContain('Fuerza Bruta');
    });

    it('should double base damage correctly', () => {
      const baseDamage = 50;
      const result = effects.applyFuerzaBruta();
      
      const finalDamage = effects.calculateAbilityDamage(baseDamage, result.damageMultiplier!);

      expect(finalDamage).toBe(100);
    });

    it('should floor damage after multiplier', () => {
      const baseDamage = 33;
      const result = effects.applyFuerzaBruta();
      
      const finalDamage = effects.calculateAbilityDamage(baseDamage, result.damageMultiplier!);

      expect(finalDamage).toBe(66); // 33 * 2 = 66
    });
  });

  describe('Poción Trágica - Healing', () => {
    it('should heal between 25% and 50% of max HP', () => {
      const currentHp = 50;
      const maxHp = 200;

      const result = effects.applyPocionTragica(currentHp, maxHp);

      expect(result.effectApplied).toBe(true);
      expect(result.healAmount).toBeGreaterThanOrEqual(50); // 25% of 200
      expect(result.healAmount).toBeLessThanOrEqual(100); // 50% of 200
      expect(result.message).toContain('Poción Trágica');
    });

    it('should not exceed max HP', () => {
      const currentHp = 180;
      const maxHp = 200;

      const result = effects.applyPocionTragica(currentHp, maxHp);

      expect(result.healAmount).toBeLessThanOrEqual(20); // Can't heal more than 20
    });

    it('should heal full amount when HP is very low', () => {
      const currentHp = 10;
      const maxHp = 100;

      const result = effects.applyPocionTragica(currentHp, maxHp);

      // Should heal between 25-50 HP
      expect(result.healAmount).toBeGreaterThanOrEqual(25);
      expect(result.healAmount).toBeLessThanOrEqual(50);
    });

    it('should return 0 heal when already at max HP', () => {
      const currentHp = 200;
      const maxHp = 200;

      const result = effects.applyPocionTragica(currentHp, maxHp);

      expect(result.healAmount).toBe(0);
    });

    it('should use seeded randomness for deterministic healing', () => {
      const rng1 = new SeededRandom(999);
      const effects1 = new ActiveAbilityEffects(rng1);
      
      const result1 = effects1.applyPocionTragica(50, 200);

      const rng2 = new SeededRandom(999); // Same seed
      const effects2 = new ActiveAbilityEffects(rng2);
      
      const result2 = effects2.applyPocionTragica(50, 200);

      expect(result1.healAmount).toBe(result2.healAmount);
    });
  });

  describe('Ability Damage Calculation', () => {
    it('should calculate damage with custom multiplier', () => {
      const baseDamage = 60;
      const multiplier = 1.5;

      const finalDamage = effects.calculateAbilityDamage(baseDamage, multiplier);

      expect(finalDamage).toBe(90);
    });

    it('should handle 1x multiplier (no change)', () => {
      const baseDamage = 50;
      const multiplier = 1.0;

      const finalDamage = effects.calculateAbilityDamage(baseDamage, multiplier);

      expect(finalDamage).toBe(50);
    });

    it('should floor fractional damage', () => {
      const baseDamage = 25;
      const multiplier = 1.7;

      const finalDamage = effects.calculateAbilityDamage(baseDamage, multiplier);

      expect(finalDamage).toBe(42); // 25 * 1.7 = 42.5 → 42
    });
  });
});
