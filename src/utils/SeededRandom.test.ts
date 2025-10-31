import { describe, expect, it } from 'vitest';
import { SeededRandom, createBattleRng } from './SeededRandom';

describe('SeededRandom', () => {
  describe('deterministic behavior', () => {
    it('produces same sequence with same numeric seed', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);

      const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
      const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(sequence1).toEqual(sequence2);
    });

    it('produces same sequence with same string seed', () => {
      const rng1 = new SeededRandom('battle-123');
      const rng2 = new SeededRandom('battle-123');

      const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
      const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(sequence1).toEqual(sequence2);
    });

    it('produces different sequences with different seeds', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(43);

      const sequence1 = [rng1.next(), rng1.next(), rng1.next()];
      const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(sequence1).not.toEqual(sequence2);
    });
  });

  describe('next()', () => {
    it('returns values in range [0, 1)', () => {
      const rng = new SeededRandom(123);

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('produces well-distributed values', () => {
      const rng = new SeededRandom(456);
      const buckets = [0, 0, 0, 0]; // [0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0)

      for (let i = 0; i < 1000; i++) {
        const value = rng.next();
        const bucket = Math.floor(value * 4);
        buckets[bucket]++;
      }

      // Each bucket should have roughly 250 values (±50 tolerance)
      buckets.forEach((count) => {
        expect(count).toBeGreaterThan(200);
        expect(count).toBeLessThan(300);
      });
    });
  });

  describe('nextInt()', () => {
    it('returns integers in specified range inclusive', () => {
      const rng = new SeededRandom(789);

      for (let i = 0; i < 50; i++) {
        const value = rng.nextInt(1, 6); // Simulate d6 dice
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(6);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('handles single-value range', () => {
      const rng = new SeededRandom(100);
      const value = rng.nextInt(5, 5);
      expect(value).toBe(5);
    });
  });

  describe('nextFloat()', () => {
    it('returns floats in specified range', () => {
      const rng = new SeededRandom(200);

      for (let i = 0; i < 50; i++) {
        const value = rng.nextFloat(10.0, 20.0);
        expect(value).toBeGreaterThanOrEqual(10.0);
        expect(value).toBeLessThan(20.0);
      }
    });
  });

  describe('roll()', () => {
    it('returns true/false based on probability', () => {
      const rng = new SeededRandom(300);
      let trueCount = 0;

      for (let i = 0; i < 1000; i++) {
        if (rng.roll(0.3)) trueCount++;
      }

      // Should be ~300 trues (±50 tolerance)
      expect(trueCount).toBeGreaterThan(250);
      expect(trueCount).toBeLessThan(350);
    });

    it('always returns false for 0.0 probability', () => {
      const rng = new SeededRandom(400);

      for (let i = 0; i < 100; i++) {
        expect(rng.roll(0.0)).toBe(false);
      }
    });

    it('always returns true for 1.0 probability', () => {
      const rng = new SeededRandom(500);

      for (let i = 0; i < 100; i++) {
        expect(rng.roll(1.0)).toBe(true);
      }
    });
  });

  describe('rollPercent()', () => {
    it('converts percentage to probability correctly', () => {
      const rng = new SeededRandom(600);
      let trueCount = 0;

      for (let i = 0; i < 1000; i++) {
        if (rng.rollPercent(25)) trueCount++; // 25% chance
      }

      // Should be ~250 trues (±50 tolerance)
      expect(trueCount).toBeGreaterThan(200);
      expect(trueCount).toBeLessThan(300);
    });
  });

  describe('getSeed()', () => {
    it('returns the seed value for persistence', () => {
      const rng = new SeededRandom(12345);
      expect(rng.getSeed()).toBeDefined();
      expect(typeof rng.getSeed()).toBe('number');
      expect(rng.getSeed()).toBe(12345);
    });

    it('returns original seed unchanged after multiple next() calls', () => {
      const rng = new SeededRandom(99999);
      const initialSeed = rng.getSeed();

      rng.next();
      rng.next();
      rng.next();

      // Original seed should remain unchanged for battle replay
      const currentSeed = rng.getSeed();
      expect(currentSeed).toBe(initialSeed);
      expect(currentSeed).toBe(99999);
    });
  });

  describe('createBattleRng()', () => {
    it('creates RNG from battle ID', () => {
      const rng1 = createBattleRng('battle-abc-123');
      const rng2 = createBattleRng('battle-abc-123');

      expect(rng1.next()).toBe(rng2.next());
    });

    it('creates RNG from timestamp when no ID provided', () => {
      const rng = createBattleRng();
      expect(rng).toBeDefined();
      expect(rng.next()).toBeGreaterThanOrEqual(0);
      expect(rng.next()).toBeLessThan(1);
    });
  });
});
