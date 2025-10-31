/**
 * PetCostCalculator.test.ts - Story 7.1
 * Tests for resistance cost calculations with skill modifiers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PetCostCalculator } from './PetCostCalculator';
import { PetType } from './PetType';

describe('PetCostCalculator - Story 7.1', () => {
  let calculator: PetCostCalculator;

  beforeEach(() => {
    calculator = new PetCostCalculator();
  });

  describe('AC5: Resistance cost calculations with skill modifiers', () => {
    describe('Perro costs', () => {
      it('should return base cost without skills', () => {
        const cost = calculator.getResistanceCost(PetType.PERRO, false, false);
        expect(cost).toBe(2);
      });

      it('should return cost with Vitalidad', () => {
        const cost = calculator.getResistanceCost(PetType.PERRO, true, false);
        expect(cost).toBe(3);
      });

      it('should return cost with Inmortal', () => {
        const cost = calculator.getResistanceCost(PetType.PERRO, false, true);
        expect(cost).toBe(7);
      });

      it('should return cost with both Vitalidad and Inmortal', () => {
        const cost = calculator.getResistanceCost(PetType.PERRO, true, true);
        expect(cost).toBe(8);
      });
    });

    describe('Pantera costs', () => {
      it('should return base cost without skills', () => {
        const cost = calculator.getResistanceCost(PetType.PANTERA, false, false);
        expect(cost).toBe(6);
      });

      it('should return cost with Vitalidad', () => {
        const cost = calculator.getResistanceCost(PetType.PANTERA, true, false);
        expect(cost).toBe(9);
      });

      it('should return cost with Inmortal', () => {
        const cost = calculator.getResistanceCost(PetType.PANTERA, false, true);
        expect(cost).toBe(15);
      });

      it('should return cost with both skills', () => {
        const cost = calculator.getResistanceCost(PetType.PANTERA, true, true);
        expect(cost).toBe(22);
      });
    });

    describe('Oso costs', () => {
      it('should return base cost without skills', () => {
        const cost = calculator.getResistanceCost(PetType.OSO, false, false);
        expect(cost).toBe(8);
      });

      it('should return cost with Vitalidad', () => {
        const cost = calculator.getResistanceCost(PetType.OSO, true, false);
        expect(cost).toBe(12);
      });

      it('should return cost with Inmortal', () => {
        const cost = calculator.getResistanceCost(PetType.OSO, false, true);
        expect(cost).toBe(28);
      });

      it('should return cost with both skills', () => {
        const cost = calculator.getResistanceCost(PetType.OSO, true, true);
        expect(cost).toBe(42);
      });
    });
  });

  describe('Total resistance cost for multiple pets', () => {
    it('should calculate cost for single pet', () => {
      const cost = calculator.getTotalResistanceCost([PetType.PERRO], false, false);
      expect(cost).toBe(2);
    });

    it('should calculate cost for 3 Perros without skills', () => {
      const cost = calculator.getTotalResistanceCost(
        [PetType.PERRO, PetType.PERRO, PetType.PERRO],
        false,
        false
      );
      expect(cost).toBe(6); // 2 + 2 + 2
    });

    it('should calculate cost for 3 Perros with Vitalidad', () => {
      const cost = calculator.getTotalResistanceCost(
        [PetType.PERRO, PetType.PERRO, PetType.PERRO],
        true,
        false
      );
      expect(cost).toBe(9); // 3 + 3 + 3
    });

    it('should calculate cost for Perro + Pantera without skills', () => {
      const cost = calculator.getTotalResistanceCost(
        [PetType.PERRO, PetType.PANTERA],
        false,
        false
      );
      expect(cost).toBe(8); // 2 + 6
    });

    it('should calculate cost for 3 Perros + Oso with both skills', () => {
      const cost = calculator.getTotalResistanceCost(
        [PetType.PERRO, PetType.PERRO, PetType.PERRO, PetType.OSO],
        true,
        true
      );
      expect(cost).toBe(66); // (8 + 8 + 8) + 42
    });

    it('should return 0 for empty pet array', () => {
      const cost = calculator.getTotalResistanceCost([], false, false);
      expect(cost).toBe(0);
    });
  });

  describe('Calculate new resistance after acquisition', () => {
    it('should subtract cost from current resistance', () => {
      const newResistance = calculator.calculateNewResistance(
        10,
        PetType.PERRO,
        false,
        false
      );
      expect(newResistance).toBe(8); // 10 - 2
    });

    it('should clamp to 0 minimum (no negative resistance)', () => {
      const newResistance = calculator.calculateNewResistance(
        5,
        PetType.OSO,
        false,
        false
      );
      expect(newResistance).toBe(0); // 5 - 8 would be -3, clamped to 0
    });

    it('should handle high cost with Inmortal skill', () => {
      const newResistance = calculator.calculateNewResistance(
        50,
        PetType.OSO,
        true,
        true
      );
      expect(newResistance).toBe(8); // 50 - 42
    });

    it('should return 0 when cost exceeds current resistance', () => {
      const newResistance = calculator.calculateNewResistance(
        10,
        PetType.PANTERA,
        true,
        true
      );
      expect(newResistance).toBe(0); // 10 - 22 would be negative, clamped to 0
    });

    it('should handle exact match (resistance = cost)', () => {
      const newResistance = calculator.calculateNewResistance(
        6,
        PetType.PANTERA,
        false,
        false
      );
      expect(newResistance).toBe(0); // 6 - 6 = 0
    });
  });

  describe('Edge cases and validation', () => {
    it('should throw error for invalid pet type', () => {
      expect(() => {
        calculator.getResistanceCost('invalid' as PetType, false, false);
      }).toThrow('Pet type not found');
    });

    it('should handle undefined skill flags as false', () => {
      const cost1 = calculator.getResistanceCost(PetType.PERRO);
      const cost2 = calculator.getResistanceCost(PetType.PERRO, false, false);
      
      expect(cost1).toBe(cost2);
      expect(cost1).toBe(2);
    });
  });
});
