/**
 * TurnProcessor Tests
 *
 * Tests for extra turn mechanics service (SRP improvement)
 * Validates speed-based extra turn calculation logic
 */

import { describe, it, expect } from 'vitest';
import { TurnProcessor } from './TurnProcessor';
import { SeededRandom } from '../../utils/SeededRandom';
import { IBrutoCombatant } from '../../models/Bruto';

describe('TurnProcessor', () => {
  const createCombatant = (speed: number): IBrutoCombatant => ({
    id: 'test-bruto',
    name: 'TestBruto',
    stats: {
      hp: 100,
      maxHp: 100,
      str: 5,
      speed,
      agility: 5,
      resistance: 1,
    },
  });

  describe('rollExtraTurn', () => {
    it('should return true or false based on speed stat', () => {
      const rng = new SeededRandom(123);
      const processor = new TurnProcessor(rng);
      const combatant = createCombatant(10); // 50% chance

      const result = processor.rollExtraTurn(combatant);
      expect(typeof result).toBe('boolean');
    });

    it('should have 0% chance with speed 0', () => {
      const rng = new SeededRandom(456);
      const processor = new TurnProcessor(rng);
      const combatant = createCombatant(0); // 0% chance

      // Roll many times to verify it's always false
      let anyTrue = false;
      for (let i = 0; i < 100; i++) {
        if (processor.rollExtraTurn(combatant)) {
          anyTrue = true;
          break;
        }
      }
      expect(anyTrue).toBe(false);
    });

    it('should cap at 60% with high speed', () => {
      const rng = new SeededRandom(789);
      const processor = new TurnProcessor(rng);
      const combatant = createCombatant(20); // Would be 100%, but capped at 60%

      // Roll many times and count successes
      let successes = 0;
      const trials = 1000;
      for (let i = 0; i < trials; i++) {
        if (processor.rollExtraTurn(combatant)) {
          successes++;
        }
      }

      // Should be around 60% (allow ±10% variance for RNG)
      const successRate = successes / trials;
      expect(successRate).toBeGreaterThan(0.50);
      expect(successRate).toBeLessThan(0.70);
    });

    it('should scale with speed stat (5% per speed)', () => {
      const rng = new SeededRandom(321);
      const processor = new TurnProcessor(rng);

      const lowSpeed = createCombatant(2); // 10% chance
      const highSpeed = createCombatant(6); // 30% chance

      // Roll many times for each
      const trials = 1000;
      let lowSuccesses = 0;
      let highSuccesses = 0;

      for (let i = 0; i < trials; i++) {
        if (processor.rollExtraTurn(lowSpeed)) lowSuccesses++;
        if (processor.rollExtraTurn(highSpeed)) highSuccesses++;
      }

      const lowRate = lowSuccesses / trials;
      const highRate = highSuccesses / trials;

      // High speed should grant more extra turns than low speed
      expect(highRate).toBeGreaterThan(lowRate);

      // Low speed should be around 10% (±5% variance)
      expect(lowRate).toBeGreaterThan(0.05);
      expect(lowRate).toBeLessThan(0.15);

      // High speed should be around 30% (±5% variance)
      expect(highRate).toBeGreaterThan(0.25);
      expect(highRate).toBeLessThan(0.35);
    });

    it('should be deterministic with same seed', () => {
      const combatant = createCombatant(5); // 25% chance

      const processor1 = new TurnProcessor(new SeededRandom(555));
      const processor2 = new TurnProcessor(new SeededRandom(555));

      const result1 = processor1.rollExtraTurn(combatant);
      const result2 = processor2.rollExtraTurn(combatant);

      expect(result1).toBe(result2);
    });
  });
});
