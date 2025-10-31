/**
 * PetRewardService - Story 7.7
 * Manages pet reward distribution from battle victories
 * 
 * Responsibilities:
 * - Select random pets based on configured odds
 * - Filter available pets based on bruto's current pets (stacking rules)
 * - Return null if no valid pets can be acquired
 * 
 * Odds (configurable):
 * - Perro: 60%
 * - Pantera: 25%
 * - Oso: 15%
 */

import { PetType } from './PetType';
import { BrutoPet } from './Pet';
import { PetStackingValidator } from './PetStackingValidator';
import { SeededRandom } from '../../utils/SeededRandom';

export interface PetRewardOdds {
  [PetType.PERRO]: number;
  [PetType.PANTERA]: number;
  [PetType.OSO]: number;
}

export const DEFAULT_PET_REWARD_ODDS: PetRewardOdds = {
  [PetType.PERRO]: 0.60,    // 60%
  [PetType.PANTERA]: 0.25,  // 25%
  [PetType.OSO]: 0.15       // 15%
};

export class PetRewardService {
  private validator: PetStackingValidator;
  private odds: PetRewardOdds;

  constructor(odds: PetRewardOdds = DEFAULT_PET_REWARD_ODDS) {
    this.validator = new PetStackingValidator();
    this.odds = odds;
  }

  /**
   * Select a random pet reward based on configured odds
   * Filters out pets that cannot be acquired due to stacking rules
   * 
   * @param currentPets Current pets owned by the bruto
   * @param rng Seeded random generator for deterministic results
   * @returns Pet type to reward, or null if no valid pets available
   */
  public selectRandomPet(
    currentPets: BrutoPet[],
    rng: SeededRandom
  ): PetType | null {
    // Build list of valid pets (those that pass stacking validation)
    const validPets = this.getValidPetTypes(currentPets);

    if (validPets.length === 0) {
      return null; // No pets can be acquired
    }

    // Calculate cumulative odds only for valid pets
    const validOdds = this.calculateValidOdds(validPets);
    
    // Select pet based on weighted odds
    const roll = rng.next();
    let cumulative = 0;

    for (const petType of validPets) {
      cumulative += validOdds[petType];
      if (roll <= cumulative) {
        return petType;
      }
    }

    // Fallback (should never reach due to cumulative odds = 1.0)
    return validPets[validPets.length - 1];
  }

  /**
   * Get list of pet types that can be acquired based on stacking rules
   * @param currentPets Current pets owned by bruto
   * @returns Array of valid pet types
   */
  private getValidPetTypes(currentPets: BrutoPet[]): PetType[] {
    const allPetTypes = [PetType.PERRO, PetType.PANTERA, PetType.OSO];
    
    return allPetTypes.filter(petType => {
      const validation = this.validator.canAcquirePet(currentPets, petType);
      return validation.valid;
    });
  }

  /**
   * Calculate normalized odds for valid pets only
   * Re-distributes odds proportionally when some pets are excluded
   * 
   * Example: If Oso is excluded (15%), remaining pets get proportional boost:
   * - Perro: 60% / 85% = 70.6%
   * - Pantera: 25% / 85% = 29.4%
   * 
   * @param validPets List of valid pet types
   * @returns Normalized odds map
   */
  private calculateValidOdds(validPets: PetType[]): Record<PetType, number> {
    const validOddsMap: Partial<Record<PetType, number>> = {};
    
    // Sum odds of valid pets
    const totalValidOdds = validPets.reduce((sum, petType) => {
      return sum + this.odds[petType];
    }, 0);

    // Normalize odds to sum to 1.0
    validPets.forEach(petType => {
      validOddsMap[petType] = this.odds[petType] / totalValidOdds;
    });

    return validOddsMap as Record<PetType, number>;
  }

  /**
   * Get configured odds for a pet type
   * @param petType Pet type
   * @returns Configured odds (0.0 - 1.0)
   */
  public getOdds(petType: PetType): number {
    return this.odds[petType];
  }
}
