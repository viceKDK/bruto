/**
 * PetCombatService.test.ts - Story 7.3
 * Tests for pet combat AI, attacks, and special abilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PetCombatService } from './PetCombatService';
import { IPetCombatant, createPetCombatant, getPetDisplayName, getPetAbility, PetAbility } from './PetCombatant';
import { PetType } from './PetType';
import { PetStats } from './Pet';
import { SeededRandom } from '../../utils/SeededRandom';

describe('PetCombatService - Story 7.3', () => {
  let service: PetCombatService;
  let rng: SeededRandom;

  beforeEach(() => {
    rng = new SeededRandom(12345); // Deterministic tests
    service = new PetCombatService(rng);
  });

  // Helper to create test pets
  const createTestPet = (petType: PetType, stats: Partial<PetStats> = {}): IPetCombatant => {
    const defaultStats: PetStats = {
      hp: 14,
      damage: 'low',
      agility: 5,
      speed: 3,
      multiHitChance: 10,
      evasionChance: 0,
      initiative: -10,
      ...stats
    };

    return createPetCombatant(petType, null, 'player', 'bruto-1', defaultStats);
  };

  describe('AC1: Pets scheduled in turn order based on initiative', () => {
    it('should calculate Perro initiative (-10)', () => {
      const initiative = service.calculatePetInitiative(PetType.PERRO, 10);
      // baseInitiative (1000) + speedModifier (10 * -10 = -100) + petModifier (-10)
      expect(initiative).toBe(890); // 1000 - 100 - 10
    });

    it('should calculate Pantera initiative (-60)', () => {
      const initiative = service.calculatePetInitiative(PetType.PANTERA, 24);
      // baseInitiative (1000) + speedModifier (24 * -10 = -240) + petModifier (-60)
      expect(initiative).toBe(700); // 1000 - 240 - 60
    });

    it('should calculate Oso initiative (-360)', () => {
      const initiative = service.calculatePetInitiative(PetType.OSO, 1);
      // baseInitiative (1000) + speedModifier (1 * -10 = -10) + petModifier (-360)
      expect(initiative).toBe(630); // 1000 - 10 - 360
    });

    it('should order pets correctly: Oso < Pantera < Perro (lower initiative = faster)', () => {
      const perroInit = service.calculatePetInitiative(PetType.PERRO, 3);
      const panteraInit = service.calculatePetInitiative(PetType.PANTERA, 24);
      const osoInit = service.calculatePetInitiative(PetType.OSO, 1);

      // Oso is fastest (lowest initiative 630), then Pantera (700), then Perro (970)
      expect(osoInit).toBeLessThan(panteraInit);
      expect(panteraInit).toBeLessThan(perroInit);
    });
  });

  describe('AC2: Pet attacks use pet agility and damage tier', () => {
    it('should execute Perro attack with low damage tier (3-7)', () => {
      const perro = createTestPet(PetType.PERRO, { agility: 5 });
      const result = service.executePetAttack(perro, 'opponent', 10);

      if (result.hit) {
        expect(result.damage).toBeGreaterThanOrEqual(3);
        expect(result.damage).toBeLessThanOrEqual(11); // Max 7 * 1.5 if crit
      }
    });

    it('should execute Pantera attack with medium damage tier (8-15)', () => {
      const pantera = createTestPet(PetType.PANTERA, {
        agility: 16,
        multiHitChance: 60,
        hp: 26
      });

      const result = service.executePetAttack(pantera, 'opponent', 10);

      if (result.hit) {
        expect(result.damage).toBeGreaterThanOrEqual(8);
        expect(result.damage).toBeLessThanOrEqual(23); // Max 15 * 1.5 if crit
      }
    });

    it('should execute Oso attack with high damage tier (18-30)', () => {
      const oso = createTestPet(PetType.OSO, {
        agility: 2,
        multiHitChance: -20,
        hp: 110
      });

      const result = service.executePetAttack(oso, 'opponent', 10);

      if (result.hit) {
        expect(result.damage).toBeGreaterThanOrEqual(18);
        expect(result.damage).toBeLessThanOrEqual(45); // Max 30 * 1.5 if crit
      }
    });

    it('should use pet agility for hit chance calculation', () => {
      const highAgilityPet = createTestPet(PetType.PANTERA, { agility: 20 });
      const lowAgilityPet = createTestPet(PetType.OSO, { agility: 2 });

      // Run multiple attacks to verify tendency
      let highAgilityHits = 0;
      let lowAgilityHits = 0;

      for (let i = 0; i < 50; i++) {
        const rng1 = new SeededRandom(i);
        const service1 = new PetCombatService(rng1);
        if (service1.executePetAttack(highAgilityPet, 'opponent', 10).hit) {
          highAgilityHits++;
        }

        const rng2 = new SeededRandom(i + 1000);
        const service2 = new PetCombatService(rng2);
        if (service2.executePetAttack(lowAgilityPet, 'opponent', 10).hit) {
          lowAgilityHits++;
        }
      }

      // High agility should hit more often
      expect(highAgilityHits).toBeGreaterThan(lowAgilityHits);
    });

    it('should apply critical hit bonus (1.5x) on multi-hit proc', () => {
      // Use fixed RNG to force crit
      const fixedRng = new SeededRandom(99999);
      const fixedService = new PetCombatService(fixedRng);

      const perro = createTestPet(PetType.PERRO, {
        agility: 50, // High agility to ensure hit
        multiHitChance: 100 // 100% crit for testing
      });

      const result = fixedService.executePetAttack(perro, 'opponent', 5);

      if (result.hit && result.isCritical) {
        // Damage should be in range of tier * 1.5
        expect(result.damage).toBeGreaterThanOrEqual(4); // floor(3 * 1.5)
        expect(result.damage).toBeLessThanOrEqual(11); // floor(7 * 1.5)
      }
    });
  });

  describe('AC3: Oso disarm ability', () => {
    it('should identify Oso as having disarm ability', () => {
      expect(getPetAbility(PetType.OSO)).toBe(PetAbility.DISARM);
    });

    it('should identify non-Oso pets as having no special ability', () => {
      expect(getPetAbility(PetType.PERRO)).toBe(PetAbility.NONE);
      expect(getPetAbility(PetType.PANTERA)).toBe(PetAbility.NONE);
    });

    it('should attempt disarm when Oso attacks target with weapon', () => {
      const oso = createTestPet(PetType.OSO, {
        agility: 50, // High to ensure hit
        hp: 110
      });

      // Run multiple attacks to check disarm attempts
      let disarmAttempts = 0;
      let disarmSuccesses = 0;

      for (let i = 0; i < 100; i++) {
        const testRng = new SeededRandom(i);
        const testService = new PetCombatService(testRng);
        const result = testService.executePetAttack(oso, 'opponent', 5, true);

        if (result.hit && result.disarmEvent) {
          disarmAttempts++;
          if (result.disarmEvent.success) {
            disarmSuccesses++;
          }
        }
      }

      // Should have disarm attempts
      expect(disarmAttempts).toBeGreaterThan(0);

      // Disarm success rate should be around 15% (OSO_DISARM_CHANCE)
      // With 100 attacks and ~70% hit rate, expect ~10 successes (15% of ~70)
      expect(disarmSuccesses).toBeGreaterThan(0);
      expect(disarmSuccesses).toBeLessThan(30); // Should not exceed reasonable threshold
    });

    it('should not disarm when target has no weapon', () => {
      const oso = createTestPet(PetType.OSO, { agility: 50 });

      const result = service.executePetAttack(oso, 'opponent', 5, false);

      expect(result.disarmEvent).toBeUndefined();
    });

    it('should not disarm when using non-Oso pet', () => {
      const perro = createTestPet(PetType.PERRO, { agility: 50 });

      const result = service.executePetAttack(perro, 'opponent', 5, true);

      expect(result.disarmEvent).toBeUndefined();
    });
  });

  describe('AC4: Pets can receive damage and be defeated', () => {
    it('should reduce pet HP when taking damage', () => {
      const perro = createTestPet(PetType.PERRO, { hp: 14 });

      const damaged = service.applyDamageToPet(perro, 5);

      expect(damaged.currentHp).toBe(9);
      expect(damaged.isDefeated).toBe(false);
    });

    it('should knock out pet when HP reaches 0', () => {
      const perro = createTestPet(PetType.PERRO, { hp: 14 });

      const defeated = service.applyDamageToPet(perro, 14);

      expect(defeated.currentHp).toBe(0);
      expect(defeated.isDefeated).toBe(true);
    });

    it('should knock out pet when damage exceeds HP', () => {
      const perro = createTestPet(PetType.PERRO, { hp: 14 });

      const defeated = service.applyDamageToPet(perro, 50);

      expect(defeated.currentHp).toBe(0);
      expect(defeated.isDefeated).toBe(true);
    });

    it('should not allow negative HP', () => {
      const perro = createTestPet(PetType.PERRO, { hp: 10 });

      const overkilled = service.applyDamageToPet(perro, 100);

      expect(overkilled.currentHp).toBe(0);
      expect(overkilled.currentHp).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AC5: Combat log shows pet actions distinctly', () => {
    it('should format Perro display name with slot', () => {
      const perroA = createPetCombatant(PetType.PERRO, 'A', 'player', 'bruto-1', {} as PetStats);
      expect(getPetDisplayName(perroA)).toBe('Perro A');
    });

    it('should format Pantera display name without slot', () => {
      const pantera = createPetCombatant(PetType.PANTERA, null, 'player', 'bruto-1', {} as PetStats);
      expect(getPetDisplayName(pantera)).toBe('Pantera');
    });

    it('should format Oso display name without slot', () => {
      const oso = createPetCombatant(PetType.OSO, null, 'opponent', 'bruto-2', {} as PetStats);
      expect(getPetDisplayName(oso)).toBe('Oso');
    });

    it('should include owner side in pet data', () => {
      const playerPet = createPetCombatant(PetType.PERRO, 'A', 'player', 'bruto-1', {} as PetStats);
      const opponentPet = createPetCombatant(PetType.PANTERA, null, 'opponent', 'bruto-2', {} as PetStats);

      expect(playerPet.ownerSide).toBe('player');
      expect(opponentPet.ownerSide).toBe('opponent');
    });

    it('should include target side in attack result', () => {
      const pet = createTestPet(PetType.PERRO);

      const result = service.executePetAttack(pet, 'opponent', 10);

      expect(result.targetSide).toBe('opponent');
      expect(result.attacker.ownerSide).toBe('player');
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle miss attacks (no damage)', () => {
      const lowAgilityPet = createTestPet(PetType.OSO, { agility: 1 });

      // With low agility vs high target agility, should miss sometimes
      const result = service.executePetAttack(lowAgilityPet, 'opponent', 50);

      if (!result.hit) {
        expect(result.damage).toBe(0);
        expect(result.isCritical).toBe(false);
        expect(result.disarmEvent).toBeUndefined();
      }
    });

    it('should handle multiple pets in sequence', () => {
      const perroA = createTestPet(PetType.PERRO, { hp: 14 });
      const perroB = createTestPet(PetType.PERRO, { hp: 14 });
      const pantera = createTestPet(PetType.PANTERA, { hp: 26 });

      // All pets attack
      const result1 = service.executePetAttack(perroA, 'opponent', 10);
      const result2 = service.executePetAttack(perroB, 'opponent', 10);
      const result3 = service.executePetAttack(pantera, 'opponent', 10);

      expect(result1.attacker.petType).toBe(PetType.PERRO);
      expect(result2.attacker.petType).toBe(PetType.PERRO);
      expect(result3.attacker.petType).toBe(PetType.PANTERA);
    });

    it('should maintain pet state across damage applications', () => {
      let pet = createTestPet(PetType.PANTERA, { hp: 26 });

      pet = service.applyDamageToPet(pet, 10);
      expect(pet.currentHp).toBe(16);

      pet = service.applyDamageToPet(pet, 8);
      expect(pet.currentHp).toBe(8);

      pet = service.applyDamageToPet(pet, 8);
      expect(pet.currentHp).toBe(0);
      expect(pet.isDefeated).toBe(true);
    });
  });
});
