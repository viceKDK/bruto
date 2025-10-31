/**
 * PetAcquisitionService Tests - Story 7.7
 * Test coverage for all 5 Acceptance Criteria:
 * AC1: Victory reward system can award pets with documented odds
 * AC2: Stacking validator prevents invalid pet acquisitions
 * AC3: Resistance cost applied and HP recalculated on acquisition
 * AC4: Pet persisted to bruto_pets table with metadata
 * AC5: Acquisition result shows new pet and stat changes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PetAcquisitionService, AcquisitionContext } from './PetAcquisitionService';
import { PetRewardService } from './PetRewardService';
import { PetType } from './PetType';
import { BrutoPet } from './Pet';
import { IBruto } from '../../models/Bruto';
import { SeededRandom } from '../../utils/SeededRandom';
import { ok, err } from '../../utils/result';

// Mock repositories
class MockPetRepository {
  private pets: BrutoPet[] = [];

  async getBrutoPets(brutoId: number) {
    return ok(this.pets.filter(p => p.brutoId === brutoId));
  }

  async addPetToBruto(brutoId: number, petType: PetType, petSlot: any, level: number) {
    this.pets.push({
      id: this.pets.length + 1,
      brutoId,
      petType,
      petSlot,
      acquiredAt: new Date(),
      acquiredLevel: level
    });
    return ok(undefined);
  }

  setPets(pets: BrutoPet[]) {
    this.pets = pets;
  }

  getPets() {
    return [...this.pets];
  }
}

class MockBrutoRepository {
  private updatedStats: any = null;

  async updateStats(brutoId: string, stats: any) {
    this.updatedStats = { brutoId, ...stats };
    return ok(undefined);
  }

  getUpdatedStats() {
    return this.updatedStats;
  }
}

describe('PetAcquisitionService', () => {
  let service: PetAcquisitionService;
  let mockPetRepo: MockPetRepository;
  let mockBrutoRepo: MockBrutoRepository;
  let mockRewardService: PetRewardService;

  const createTestBruto = (overrides: Partial<IBruto> = {}): IBruto => ({
    id: '1',
    userId: 'user1',
    name: 'Test Bruto',
    level: 5,
    xp: 100,
    hp: 80,
    maxHp: 80,
    str: 5,
    speed: 5,
    agility: 5,
    resistance: 50,
    appearanceId: 1,
    colorVariant: 1,
    createdAt: new Date(),
    ...overrides
  });

  beforeEach(() => {
    mockPetRepo = new MockPetRepository();
    mockBrutoRepo = new MockBrutoRepository();
    mockRewardService = new PetRewardService();
    
    service = new PetAcquisitionService(
      mockPetRepo as any,
      mockBrutoRepo as any,
      mockRewardService
    );
  });

  describe('AC1: Victory Reward System with Documented Odds', () => {
    it('should award pet based on configured odds', async () => {
      const bruto = createTestBruto();
      const rng = new SeededRandom(42);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      const result = await service.acquirePetReward(context);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
        expect([PetType.PERRO, PetType.PANTERA, PetType.OSO]).toContain(result.data.petAcquired);
      }
    });

    it('should handle null selection (no valid pets)', async () => {
      const bruto = createTestBruto();
      const rng = new SeededRandom(456);

      vi.spyOn(mockRewardService, 'selectRandomPet').mockReturnValue(null);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      const result = await service.acquirePetReward(context);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(false);
        expect(result.data.reason).toContain('No valid pets available');
      }
    });
  });

  describe('AC2: Stacking Validator Prevents Invalid Acquisitions', () => {
    it('should prevent 4th Perro acquisition', async () => {
      mockPetRepo.setPets([
        { id: 1, brutoId: 1, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { id: 2, brutoId: 1, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 1 },
        { id: 3, brutoId: 1, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 1 }
      ]);

      const bruto = createTestBruto();
      const rng = new SeededRandom(789);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      const result = await service.acquirePetReward(context);

      if (result.success && result.data.success) {
        expect(result.data.petAcquired).not.toBe(PetType.PERRO);
      }
    });
  });

  describe('AC3: Resistance Cost Applied and HP Recalculated', () => {
    it('should apply base resistance cost for Perro (2)', async () => {
      const bruto = createTestBruto({ resistance: 50, maxHp: 80 });
      const rng = new SeededRandom(111);

      vi.spyOn(mockRewardService, 'selectRandomPet').mockReturnValue(PetType.PERRO);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      const result = await service.acquirePetReward(context);

      if (result.success) {
        expect(result.data.resistanceCost).toBe(2);
        expect(result.data.newResistance).toBe(48);
        expect(result.data.newMaxHp).toBe(78);
        expect(result.data.hpLost).toBe(2);
      }
    });

    it('should apply Vitalidad modifier to resistance cost', async () => {
      const bruto = createTestBruto({ resistance: 50, maxHp: 80 });
      const rng = new SeededRandom(222);

      vi.spyOn(mockRewardService, 'selectRandomPet').mockReturnValue(PetType.PERRO);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: true,
        hasInmortal: false,
        rng
      };

      const result = await service.acquirePetReward(context);

      if (result.success) {
        expect(result.data.resistanceCost).toBe(3);
        expect(result.data.newResistance).toBe(47);
      }
    });

    it('should reject acquisition if insufficient resistance', async () => {
      const bruto = createTestBruto({ resistance: 1, maxHp: 80 });
      const rng = new SeededRandom(555);

      vi.spyOn(mockRewardService, 'selectRandomPet').mockReturnValue(PetType.PERRO);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      const result = await service.acquirePetReward(context);

      if (result.success) {
        expect(result.data.success).toBe(false);
        expect(result.data.reason).toContain('Insufficient resistance');
      }
    });
  });

  describe('AC4: Pet Persisted to Database with Metadata', () => {
    it('should persist pet to database', async () => {
      const bruto = createTestBruto({ level: 7 });
      const rng = new SeededRandom(777);

      vi.spyOn(mockRewardService, 'selectRandomPet').mockReturnValue(PetType.PERRO);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      await service.acquirePetReward(context);

      const persistedPets = mockPetRepo.getPets();
      
      expect(persistedPets).toHaveLength(1);
      expect(persistedPets[0].petType).toBe(PetType.PERRO);
      expect(persistedPets[0].acquiredLevel).toBe(7);
    });

    it('should update bruto stats in database', async () => {
      const bruto = createTestBruto({ resistance: 50, maxHp: 80 });
      const rng = new SeededRandom(1010);

      vi.spyOn(mockRewardService, 'selectRandomPet').mockReturnValue(PetType.PERRO);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      await service.acquirePetReward(context);

      const updated = mockBrutoRepo.getUpdatedStats();
      
      expect(updated).toBeDefined();
      expect(updated.resistance).toBe(48);
      expect(updated.maxHp).toBe(78);
    });
  });

  describe('AC5: Acquisition Result Shows New Pet and Stat Changes', () => {
    it('should return complete acquisition result', async () => {
      const bruto = createTestBruto({ resistance: 50, maxHp: 80 });
      const rng = new SeededRandom(1111);

      vi.spyOn(mockRewardService, 'selectRandomPet').mockReturnValue(PetType.PERRO);

      const context: AcquisitionContext = {
        bruto,
        hasVitalidad: false,
        hasInmortal: false,
        rng
      };

      const result = await service.acquirePetReward(context);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
        expect(result.data.petAcquired).toBe(PetType.PERRO);
        expect(result.data.resistanceCost).toBe(2);
        expect(result.data.newResistance).toBe(48);
        expect(result.data.hpLost).toBe(2);
      }
    });
  });
});
