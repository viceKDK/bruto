/**
 * DerivedStatsCalculator Tests
 * Validates derived stat calculations (dodge, extra turn)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DerivedStatsCalculator } from './DerivedStatsCalculator';
import { IBruto } from '../models/Bruto';

describe('DerivedStatsCalculator', () => {
  let calculator: DerivedStatsCalculator;

  beforeEach(() => {
    calculator = DerivedStatsCalculator.getInstance();
  });

  describe('calculateDodgeChance', () => {
    it('should calculate dodge chance as agility × 10%', () => {
      expect(calculator.calculateDodgeChance(5)).toBe(50.0);
      expect(calculator.calculateDodgeChance(7)).toBe(70.0);
      expect(calculator.calculateDodgeChance(3)).toBe(30.0);
    });

    it('should cap dodge chance at 95%', () => {
      expect(calculator.calculateDodgeChance(10)).toBe(95.0);
      expect(calculator.calculateDodgeChance(15)).toBe(95.0);
      expect(calculator.calculateDodgeChance(100)).toBe(95.0);
    });

    it('should return 0% for agility 0', () => {
      expect(calculator.calculateDodgeChance(0)).toBe(0.0);
    });

    it('should handle fractional agility values', () => {
      expect(calculator.calculateDodgeChance(2.5)).toBe(25.0);
      expect(calculator.calculateDodgeChance(4.7)).toBe(47.0);
    });
  });

  describe('calculateExtraTurnChance', () => {
    it('should calculate extra turn chance as speed × 5%', () => {
      expect(calculator.calculateExtraTurnChance(4)).toBe(20.0);
      expect(calculator.calculateExtraTurnChance(8)).toBe(40.0);
      expect(calculator.calculateExtraTurnChance(10)).toBe(50.0);
    });

    it('should cap extra turn chance at 60%', () => {
      expect(calculator.calculateExtraTurnChance(12)).toBe(60.0);
      expect(calculator.calculateExtraTurnChance(20)).toBe(60.0);
      expect(calculator.calculateExtraTurnChance(100)).toBe(60.0);
    });

    it('should return 0% for speed 0', () => {
      expect(calculator.calculateExtraTurnChance(0)).toBe(0.0);
    });

    it('should handle fractional speed values', () => {
      expect(calculator.calculateExtraTurnChance(3)).toBe(15.0);
      expect(calculator.calculateExtraTurnChance(7)).toBe(35.0);
    });
  });

  describe('buildDerivedStats', () => {
    it('should build complete derived stats summary', () => {
      const mockBruto: IBruto = {
        agility: 5,
        speed: 4,
      } as IBruto;

      const result = calculator.buildDerivedStats(mockBruto);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        key: 'dodgeChance',
        label: 'Dodge Chance',
        value: 50.0,
        unit: '%',
      });
      expect(result[1]).toMatchObject({
        key: 'extraTurnChance',
        label: 'Extra Turn Chance',
        value: 20.0,
        unit: '%',
      });
    });

    it('should include descriptions for each stat', () => {
      const mockBruto: IBruto = {
        agility: 3,
        speed: 6,
      } as IBruto;

      const result = calculator.buildDerivedStats(mockBruto);

      expect(result[0].description).toContain('Agility');
      expect(result[1].description).toContain('Speed');
    });

    it('should handle bruto at caps', () => {
      const mockBruto: IBruto = {
        agility: 15, // > 95% cap
        speed: 20,   // > 60% cap
      } as IBruto;

      const result = calculator.buildDerivedStats(mockBruto);

      expect(result[0].value).toBe(95.0); // Dodge capped
      expect(result[1].value).toBe(60.0); // Extra turn capped
    });
  });

  describe('Singleton pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = DerivedStatsCalculator.getInstance();
      const instance2 = DerivedStatsCalculator.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});
