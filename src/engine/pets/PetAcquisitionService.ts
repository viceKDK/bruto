/**
 * PetAcquisitionService - Story 7.7
 * Orchestrates complete pet acquisition flow from victory reward
 * 
 * Responsibilities:
 * 1. Select random pet based on odds
 * 2. Validate stacking rules
 * 3. Calculate and apply resistance cost
 * 4. Update bruto HP based on resistance loss
 * 5. Persist pet ownership to database
 * 6. Return acquisition result with stat changes
 * 
 * Integration:
 * - PetRewardService: Random selection
 * - PetStackingValidator: Stacking rules
 * - PetCostCalculator: Resistance costs
 * - PetRepository: Database persistence
 * - StatsCalculator: HP recalculation (via resistance change)
 */

import { PetType } from './PetType';
import { BrutoPet, PetSlot } from './Pet';
import { PetRewardService } from './PetRewardService';
import { PetStackingValidator } from './PetStackingValidator';
import { PetCostCalculator } from './PetCostCalculator';
import { PetRepository } from '../../database/repositories/PetRepository';
import { BrutoRepository } from '../../database/repositories/BrutoRepository';
import { SeededRandom } from '../../utils/SeededRandom';
import { Result, ok, err } from '../../utils/result';
import { IBruto } from '../../models/Bruto';

export interface PetAcquisitionResult {
  success: boolean;
  petAcquired?: PetType;
  petSlot?: PetSlot;
  resistanceCost?: number;
  newResistance?: number;
  newMaxHp?: number;
  hpLost?: number;
  reason?: string;
}

export interface AcquisitionContext {
  bruto: IBruto;
  hasVitalidad: boolean;
  hasInmortal: boolean;
  rng: SeededRandom;
}

export class PetAcquisitionService {
  private rewardService: PetRewardService;
  private validator: PetStackingValidator;
  private costCalculator: PetCostCalculator;
  private petRepository: PetRepository;
  private brutoRepository: BrutoRepository;

  constructor(
    petRepository: PetRepository,
    brutoRepository: BrutoRepository,
    rewardService?: PetRewardService
  ) {
    this.rewardService = rewardService || new PetRewardService();
    this.validator = new PetStackingValidator();
    this.costCalculator = new PetCostCalculator();
    this.petRepository = petRepository;
    this.brutoRepository = brutoRepository;
  }

  /**
   * Attempt to acquire a pet as victory reward
   * Complete flow: select → validate → cost → persist → update stats
   * 
   * @param context Acquisition context with bruto, skills, and RNG
   * @returns Result with acquisition details or failure reason
   */
  public async acquirePetReward(
    context: AcquisitionContext
  ): Promise<Result<PetAcquisitionResult>> {
    const { bruto, hasVitalidad, hasInmortal, rng } = context;

    // Step 1: Get current pets
    const petsResult = await this.petRepository.getBrutoPets(parseInt(bruto.id));
    if (!petsResult.success) {
      return err(petsResult.error);
    }
    const currentPets = petsResult.data;

    // Step 2: Select random pet based on odds and stacking rules
    const selectedPet = this.rewardService.selectRandomPet(currentPets, rng);
    
    if (!selectedPet) {
      // No valid pets available (all slots full or exclusions)
      return ok({
        success: false,
        reason: 'No valid pets available to acquire'
      });
    }

    // Step 3: Determine pet slot
    const petSlot = this.determinePetSlot(currentPets, selectedPet);

    // Step 4: Calculate resistance cost
    const resistanceCost = this.costCalculator.getResistanceCost(
      selectedPet,
      hasVitalidad,
      hasInmortal
    );

    // Validate bruto has enough resistance
    if (bruto.resistance < resistanceCost) {
      return ok({
        success: false,
        reason: `Insufficient resistance (need ${resistanceCost}, have ${bruto.resistance})`
      });
    }

    // Step 5: Calculate new stats
    const newResistance = bruto.resistance - resistanceCost;
    const newMaxHp = this.calculateNewMaxHp(bruto.maxHp, resistanceCost);
    const hpLost = bruto.maxHp - newMaxHp;

    // Step 6: Persist pet to database
    const addPetResult = await this.petRepository.addPetToBruto(
      parseInt(bruto.id),
      selectedPet,
      petSlot,
      bruto.level
    );

    if (!addPetResult.success) {
      return err(addPetResult.error);
    }

    // Step 7: Update bruto stats (resistance and HP)
    const updateResult = await this.updateBrutoStats(
      bruto.id,
      newResistance,
      newMaxHp
    );

    if (!updateResult.success) {
      return err(updateResult.error);
    }

    // Success!
    return ok({
      success: true,
      petAcquired: selectedPet,
      petSlot,
      resistanceCost,
      newResistance,
      newMaxHp,
      hpLost
    });
  }

  /**
   * Determine appropriate slot for pet
   * - Perro: Next available slot (A, B, C)
   * - Pantera/Oso: null (no slot system)
   * 
   * @param currentPets Current pets owned
   * @param petType Pet type to acquire
   * @returns Pet slot or null
   */
  private determinePetSlot(
    currentPets: BrutoPet[],
    petType: PetType
  ): PetSlot {
    if (petType === PetType.PERRO) {
      return this.validator.getNextPerroSlot(currentPets);
    }
    return null;
  }

  /**
   * Calculate new max HP after resistance cost
   * Each point of resistance = 1 HP (documented in stast.md)
   * 
   * @param currentMaxHp Current max HP
   * @param resistanceLost Resistance points lost
   * @returns New max HP
   */
  private calculateNewMaxHp(
    currentMaxHp: number,
    resistanceLost: number
  ): number {
    // 1 resistance = 1 HP
    return currentMaxHp - resistanceLost;
  }

  /**
   * Update bruto's resistance and max HP in database
   * @param brutoId Bruto ID
   * @param newResistance New resistance value
   * @param newMaxHp New max HP value
   * @returns Result
   */
  private async updateBrutoStats(
    brutoId: string,
    newResistance: number,
    newMaxHp: number
  ): Promise<Result<void>> {
    return this.brutoRepository.updateStats(brutoId, {
      resistance: newResistance,
      maxHp: newMaxHp
    });
  }
}
