/**
 * PetCostCalculator - Story 7.1
 * Calculates resistance cost for acquiring pets
 * 
 * Costs vary based on skills owned (Vitalidad, Inmortal)
 * Source: docs/stast.md - Resistance cost formulas
 */

import { PetType } from './PetType';
import { PetCatalog } from './PetCatalog';

export class PetCostCalculator {
  private catalog: PetCatalog;

  constructor() {
    this.catalog = PetCatalog.getInstance();
  }

  /**
   * Calculate resistance cost for acquiring a pet
   * @param petType Pet type to acquire
   * @param hasVitalidad True if bruto has Vitalidad skill
   * @param hasInmortal True if bruto has Inmortal skill
   * @returns Resistance cost (always positive, will be subtracted from bruto)
   */
  public getResistanceCost(
    petType: PetType,
    hasVitalidad: boolean = false,
    hasInmortal: boolean = false
  ): number {
    const pet = this.catalog.getPetByType(petType);
    
    if (!pet) {
      throw new Error(`Pet type not found: ${petType}`);
    }

    // Determine which cost to use based on skills
    if (hasVitalidad && hasInmortal) {
      return pet.resistanceCost.withBoth;
    } else if (hasInmortal) {
      return pet.resistanceCost.withInmortal;
    } else if (hasVitalidad) {
      return pet.resistanceCost.withVitalidad;
    } else {
      return pet.resistanceCost.base;
    }
  }

  /**
   * Calculate total resistance cost for multiple pets
   * @param petTypes Array of pet types owned
   * @param hasVitalidad True if bruto has Vitalidad skill
   * @param hasInmortal True if bruto has Inmortal skill
   * @returns Total resistance cost
   */
  public getTotalResistanceCost(
    petTypes: PetType[],
    hasVitalidad: boolean = false,
    hasInmortal: boolean = false
  ): number {
    return petTypes.reduce((total, petType) => {
      return total + this.getResistanceCost(petType, hasVitalidad, hasInmortal);
    }, 0);
  }

  /**
   * Calculate new resistance after acquiring pet
   * Ensures resistance doesn't go below 0
   * @param currentResistance Current resistance value
   * @param petType Pet type to acquire
   * @param hasVitalidad True if bruto has Vitalidad skill
   * @param hasInmortal True if bruto has Inmortal skill
   * @returns New resistance value (clamped to 0 minimum)
   */
  public calculateNewResistance(
    currentResistance: number,
    petType: PetType,
    hasVitalidad: boolean = false,
    hasInmortal: boolean = false
  ): number {
    const cost = this.getResistanceCost(petType, hasVitalidad, hasInmortal);
    const newResistance = currentResistance - cost;
    
    // Clamp to 0 minimum
    return Math.max(0, newResistance);
  }
}
