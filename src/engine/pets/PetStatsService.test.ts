/**
 * PetStatsService.test.ts - Story 7.2
 * Tests for pet stat calculations and resistance costs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PetStatsService } from './PetStatsService';
import { BrutoPet } from './Pet';
import { PetType } from './PetType';

describe('PetStatsService - Story 7.2', () => {
  let service: PetStatsService;
  const MOCK_BRUTO_ID = 1;

  beforeEach(() => {
    service = new PetStatsService();
  });

  describe('AC1: Pet HP adds to bruto total HP', () => {
    it('should add Perro HP bonus (+14)', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.hpBonus).toBe(14);
    });

    it('should add Pantera HP bonus (+26)', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.hpBonus).toBe(26);
    });

    it('should add Oso HP bonus (+110)', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.hpBonus).toBe(110);
    });

    it('should sum HP from multiple pets', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 3 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.hpBonus).toBe(54); // 14 + 14 + 26
    });
  });

  describe('AC2: Agility/Speed/Evasion bonuses apply', () => {
    it('should apply Perro agility and speed', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.agilityBonus).toBe(5);
      expect(stats.speedBonus).toBe(3);
      expect(stats.evasionBonus).toBe(0);
    });

    it('should apply Pantera agility and speed', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.agilityBonus).toBe(16);
      expect(stats.speedBonus).toBe(24);
      expect(stats.evasionBonus).toBe(20); // From pets.json evasionChance
    });

    it('should apply Oso stats (negative speed)', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.agilityBonus).toBe(2); // Oso has agility: 2
      expect(stats.speedBonus).toBe(1); // Oso has speed: 1
      expect(stats.evasionBonus).toBe(0);
    });

    it('should sum agility/speed from multiple pets', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 2 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.agilityBonus).toBe(21); // 5 (Perro) + 16 (Pantera)
      expect(stats.speedBonus).toBe(27); // 3 (Perro) + 24 (Pantera)
      expect(stats.evasionBonus).toBe(20); // 0 (Perro) + 20 (Pantera)
    });
  });

  describe('AC3: Resistance reduced on acquisition', () => {
    it('should calculate base resistance cost for Perro', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, false, false);
      expect(stats.resistanceCost).toBe(2);
    });

    it('should calculate base resistance cost for Pantera', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, false, false);
      expect(stats.resistanceCost).toBe(6);
    });

    it('should calculate base resistance cost for Oso', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, false, false);
      expect(stats.resistanceCost).toBe(8);
    });

    it('should sum resistance costs for multiple pets', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 3 }
      ];

      const stats = service.calculatePetStats(pets, false, false);
      expect(stats.resistanceCost).toBe(10); // 2 + 2 + 6
    });
  });

  describe('AC3: Resistance costs with Vitalidad/Inmortal', () => {
    it('should apply Vitalidad modifier to Perro cost', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, true, false);
      expect(stats.resistanceCost).toBe(3);
    });

    it('should apply Inmortal modifier to Perro cost', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, false, true);
      expect(stats.resistanceCost).toBe(7);
    });

    it('should apply both modifiers to Perro cost', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, true, true);
      expect(stats.resistanceCost).toBe(8);
    });

    it('should apply Vitalidad to Pantera cost', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, true, false);
      expect(stats.resistanceCost).toBe(9);
    });

    it('should apply both skills to Oso cost', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets, true, true);
      expect(stats.resistanceCost).toBe(42);
    });
  });

  describe('AC4: Multi-hit chance modified by pets', () => {
    it('should apply Perro multi-hit bonus (+10%)', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.multiHitBonus).toBe(10);
    });

    it('should apply Pantera multi-hit bonus (+60%)', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.multiHitBonus).toBe(60);
    });

    it('should apply Oso multi-hit penalty (-20%)', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.multiHitBonus).toBe(-20);
    });

    it('should sum multi-hit modifiers from multiple pets', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 3 }
      ];

      const stats = service.calculatePetStats(pets);
      expect(stats.multiHitBonus).toBe(80); // 10 + 10 + 60
    });
  });

  describe('Resistance calculation after acquisition', () => {
    it('should subtract cost from current resistance', () => {
      const newResistance = service.calculateResistanceAfterAcquisition(
        10,
        PetType.PERRO,
        false,
        false
      );
      
      expect(newResistance).toBe(8); // 10 - 2
    });

    it('should clamp to 0 minimum', () => {
      const newResistance = service.calculateResistanceAfterAcquisition(
        5,
        PetType.OSO,
        false,
        false
      );
      
      expect(newResistance).toBe(0); // 5 - 8 = -3, clamped to 0
    });

    it('should apply Vitalidad modifier', () => {
      const newResistance = service.calculateResistanceAfterAcquisition(
        10,
        PetType.PERRO,
        true,
        false
      );
      
      expect(newResistance).toBe(7); // 10 - 3
    });

    it('should apply both skill modifiers', () => {
      const newResistance = service.calculateResistanceAfterAcquisition(
        50,
        PetType.OSO,
        true,
        true
      );
      
      expect(newResistance).toBe(8); // 50 - 42
    });
  });

  describe('Stat contributions for StatsCalculator', () => {
    it('should generate contributions for single pet', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const contributions = service.getPetStatContributions(pets);
      
      expect(contributions).toHaveLength(4); // hp, maxHp, agility, speed
      expect(contributions.find(c => c.key === 'hp')?.amount).toBe(14);
      expect(contributions.find(c => c.key === 'maxHp')?.amount).toBe(14);
      expect(contributions.find(c => c.key === 'agility')?.amount).toBe(5);
      expect(contributions.find(c => c.key === 'speed')?.amount).toBe(3);
    });

    it('should generate contributions for multiple pets', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 2 }
      ];

      const contributions = service.getPetStatContributions(pets);
      
      // Should have 4 contributions per pet = 8 total
      expect(contributions.length).toBeGreaterThanOrEqual(6);
      
      const hpContributions = contributions.filter(c => c.key === 'hp');
      expect(hpContributions).toHaveLength(2);
    });

    it('should include pet name in description', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const contributions = service.getPetStatContributions(pets);
      
      const hpContribution = contributions.find(c => c.key === 'hp');
      expect(hpContribution?.description).toBe('Pantera');
      expect(hpContribution?.source).toBe('pet');
    });
  });

  describe('Pet stats breakdown for UI', () => {
    it('should generate breakdown for single pet', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const breakdown = service.getPetStatsBreakdown(pets);
      
      expect(breakdown).toContain('HP: +14 from pets');
      expect(breakdown).toContain('Agility: +5 from pets');
      expect(breakdown).toContain('Speed: +3 from pets');
      expect(breakdown).toContain('Multi-hit: +10% from pets');
      expect(breakdown).toContain('Resistance cost: -2.00');
    });

    it('should handle negative modifiers', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const breakdown = service.getPetStatsBreakdown(pets);
      
      // Oso has negative multiHitChance
      expect(breakdown).toContain('Multi-hit: -20% from pets');
    });

    it('should not include zero values', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const breakdown = service.getPetStatsBreakdown(pets);
      
      // Oso has 0 evasion
      expect(breakdown.some(line => line.includes('Evasion'))).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty pet list', () => {
      const stats = service.calculatePetStats([]);
      
      expect(stats.hpBonus).toBe(0);
      expect(stats.agilityBonus).toBe(0);
      expect(stats.speedBonus).toBe(0);
      expect(stats.multiHitBonus).toBe(0);
      expect(stats.resistanceCost).toBe(0);
      expect(stats.petCount).toBe(0);
    });

    it('should handle invalid pet type gracefully', () => {
      const pets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: 'invalid' as any, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];

      const stats = service.calculatePetStats(pets);
      
      expect(stats.hpBonus).toBe(0);
      expect(stats.petCount).toBe(1); // Count includes invalid pet
    });
  });
});
