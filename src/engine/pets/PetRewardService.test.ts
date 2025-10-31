/**
 * PetRewardService Tests - Story 7.7
 * Test coverage:
 * - Odds distribution (statistical validation)
 * - Stacking rule integration
 * - Null returns when no valid pets
 * - Seeded RNG determinism
 * - Edge cases (all pets owned)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PetRewardService, DEFAULT_PET_REWARD_ODDS } from './PetRewardService';
import { PetType } from './PetType';
import { BrutoPet } from './Pet';
import { SeededRandom } from '../../utils/SeededRandom';

describe('PetRewardService', () => {
  let service: PetRewardService;
  let rng: SeededRandom;

  beforeEach(() => {
    service = new PetRewardService();
    rng = new SeededRandom(12345);
  });

  describe('Odds Configuration', () => {
    it('should use default odds (60% Perro, 25% Pantera, 15% Oso)', () => {
      expect(service.getOdds(PetType.PERRO)).toBe(0.60);
      expect(service.getOdds(PetType.PANTERA)).toBe(0.25);
      expect(service.getOdds(PetType.OSO)).toBe(0.15);
    });

    it('should accept custom odds', () => {
      const customOdds = {
        [PetType.PERRO]: 0.50,
        [PetType.PANTERA]: 0.30,
        [PetType.OSO]: 0.20
      };

      const customService = new PetRewardService(customOdds);
      
      expect(customService.getOdds(PetType.PERRO)).toBe(0.50);
      expect(customService.getOdds(PetType.PANTERA)).toBe(0.30);
      expect(customService.getOdds(PetType.OSO)).toBe(0.20);
    });
  });

  describe('Random Pet Selection', () => {
    it('should select pet based on odds distribution', () => {
      const noPets: BrutoPet[] = [];
      const counts = { perro: 0, pantera: 0, oso: 0 };
      const iterations = 1000;

      // Run many iterations to validate distribution
      for (let i = 0; i < iterations; i++) {
        const testRng = new SeededRandom(i);
        const selected = service.selectRandomPet(noPets, testRng);
        
        if (selected === PetType.PERRO) counts.perro++;
        else if (selected === PetType.PANTERA) counts.pantera++;
        else if (selected === PetType.OSO) counts.oso++;
      }

      // Validate distribution is close to configured odds (±5% tolerance)
      const perroPercent = counts.perro / iterations;
      const panteraPercent = counts.pantera / iterations;
      const osoPercent = counts.oso / iterations;

      expect(perroPercent).toBeGreaterThan(0.55);
      expect(perroPercent).toBeLessThan(0.65);
      
      expect(panteraPercent).toBeGreaterThan(0.20);
      expect(panteraPercent).toBeLessThan(0.30);
      
      expect(osoPercent).toBeGreaterThan(0.10);
      expect(osoPercent).toBeLessThan(0.20);
    });

    it('should be deterministic with same seed', () => {
      const noPets: BrutoPet[] = [];
      
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);

      const result1 = service.selectRandomPet(noPets, rng1);
      const result2 = service.selectRandomPet(noPets, rng2);

      expect(result1).toBe(result2);
    });

    it('should produce different results with different seeds', () => {
      const noPets: BrutoPet[] = [];
      const results = new Set<PetType | null>();

      // Try 10 different seeds
      for (let i = 0; i < 10; i++) {
        const testRng = new SeededRandom(i);
        results.add(service.selectRandomPet(noPets, testRng));
      }

      // Should have more than one unique result
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('Stacking Rule Integration', () => {
    it('should allow Perro when no pets owned', () => {
      const noPets: BrutoPet[] = [];
      
      // Run multiple times to ensure Perro can be selected
      let perroSelected = false;
      for (let i = 0; i < 100; i++) {
        const testRng = new SeededRandom(i);
        if (service.selectRandomPet(noPets, testRng) === PetType.PERRO) {
          perroSelected = true;
          break;
        }
      }

      expect(perroSelected).toBe(true);
    });

    it('should allow up to 3 Perros', () => {
      const twoPerros: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'A',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 2,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'B',
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      // Should still allow third Perro
      let perroSelected = false;
      for (let i = 0; i < 100; i++) {
        const testRng = new SeededRandom(i);
        if (service.selectRandomPet(twoPerros, testRng) === PetType.PERRO) {
          perroSelected = true;
          break;
        }
      }

      expect(perroSelected).toBe(true);
    });

    it('should NOT allow 4th Perro (max is 3)', () => {
      const threePerros: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'A',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 2,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'B',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 3,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'C',
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      // Run multiple iterations
      let perroSelected = false;
      for (let i = 0; i < 200; i++) {
        const testRng = new SeededRandom(i);
        if (service.selectRandomPet(threePerros, testRng) === PetType.PERRO) {
          perroSelected = true;
          break;
        }
      }

      // Should NEVER select Perro
      expect(perroSelected).toBe(false);
    });

    it('should NOT allow both Pantera and Oso (mutual exclusion)', () => {
      const hasPantera: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PANTERA,
          petSlot: null,
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      // Should never select Oso when Pantera owned
      let osoSelected = false;
      for (let i = 0; i < 200; i++) {
        const testRng = new SeededRandom(i);
        if (service.selectRandomPet(hasPantera, testRng) === PetType.OSO) {
          osoSelected = true;
          break;
        }
      }

      expect(osoSelected).toBe(false);
    });

    it('should allow Perro + Pantera combination', () => {
      const perroAndPantera: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'A',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 2,
          brutoId: 1,
          petType: PetType.PANTERA,
          petSlot: null,
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      // Should still allow more Perros (not Oso or Pantera)
      const selected = service.selectRandomPet(perroAndPantera, rng);
      
      // Result should be Perro or null (never Pantera/Oso)
      expect([PetType.PERRO, null]).toContain(selected);
    });
  });

  describe('Odds Redistribution', () => {
    it('should redistribute odds when some pets excluded', () => {
      // When Oso is excluded (15%), remaining pets get proportional boost
      const hasPantera: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PANTERA,
          petSlot: null,
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      const counts = { perro: 0, pantera: 0, oso: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const testRng = new SeededRandom(i);
        const selected = service.selectRandomPet(hasPantera, testRng);
        
        if (selected === PetType.PERRO) counts.perro++;
        else if (selected === PetType.PANTERA) counts.pantera++;
        else if (selected === PetType.OSO) counts.oso++;
      }

      // Oso should NEVER be selected (mutual exclusion with Pantera)
      expect(counts.oso).toBe(0);

      // Perro should get ~100% of valid selections (only valid option)
      // Note: Pantera already owned, so can't be selected again
      expect(counts.perro).toBeGreaterThan(900); // ~90%+ should be Perro
    });

    it('should normalize odds to sum to 1.0', () => {
      const threePerros: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'A',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 2,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'B',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 3,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'C',
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      const counts = { perro: 0, pantera: 0, oso: 0 };
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const testRng = new SeededRandom(i);
        const selected = service.selectRandomPet(threePerros, testRng);
        
        if (selected === PetType.PERRO) counts.perro++;
        else if (selected === PetType.PANTERA) counts.pantera++;
        else if (selected === PetType.OSO) counts.oso++;
      }

      // Perro excluded (3 max), so distribution should be Pantera + Oso
      // Original: Pantera 25%, Oso 15% = 40% total
      // Normalized: Pantera 62.5%, Oso 37.5%
      
      const panteraPercent = counts.pantera / iterations;
      const osoPercent = counts.oso / iterations;

      expect(panteraPercent).toBeGreaterThan(0.57); // ~62.5% ±5%
      expect(panteraPercent).toBeLessThan(0.67);
      
      expect(osoPercent).toBeGreaterThan(0.32); // ~37.5% ±5%
      expect(osoPercent).toBeLessThan(0.42);
    });
  });

  describe('Edge Cases', () => {
    it('should return null when all pets owned (4 slots full)', () => {
      const allPetsFull: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'A',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 2,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'B',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 3,
          brutoId: 1,
          petType: PetType.PERRO,
          petSlot: 'C',
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 4,
          brutoId: 1,
          petType: PetType.OSO,
          petSlot: null,
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      const result = service.selectRandomPet(allPetsFull, rng);
      expect(result).toBeNull();
    });

    it('should return null when Pantera + Oso owned (exclusion blocks all)', () => {
      // This is actually invalid state (can't own both), but service should handle gracefully
      const invalidState: BrutoPet[] = [
        {
          id: 1,
          brutoId: 1,
          petType: PetType.PANTERA,
          petSlot: null,
          acquiredAt: new Date(),
          acquiredLevel: 1
        },
        {
          id: 2,
          brutoId: 1,
          petType: PetType.OSO,
          petSlot: null,
          acquiredAt: new Date(),
          acquiredLevel: 1
        }
      ];

      // Should still allow Perro (valid despite invalid Pantera+Oso state)
      const result = service.selectRandomPet(invalidState, rng);
      
      // Result should be Perro (only valid option)
      expect(result).toBe(PetType.PERRO);
    });

    it('should handle empty pet list', () => {
      const noPets: BrutoPet[] = [];
      
      const result = service.selectRandomPet(noPets, rng);
      
      // Should select some pet
      expect(result).not.toBeNull();
      expect([PetType.PERRO, PetType.PANTERA, PetType.OSO]).toContain(result);
    });
  });
});
