/**
 * PetStackingValidator - Story 7.1
 * Validates pet stacking rules and mutual exclusions
 * 
 * Rules:
 * - Perro: Up to 3 (slots A, B, C)
 * - Pantera XOR Oso: Cannot have both simultaneously
 * - Other pets: Max 1 each
 */

import { PetType } from './PetType';
import { BrutoPet, PetSlot } from './Pet';
import { PetCatalog } from './PetCatalog';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export class PetStackingValidator {
  private catalog: PetCatalog;

  constructor() {
    this.catalog = PetCatalog.getInstance();
  }

  /**
   * Validate if bruto can acquire a new pet
   * @param currentPets Current pets owned by bruto
   * @param newPetType Type of pet to acquire
   * @returns Validation result
   */
  public canAcquirePet(
    currentPets: BrutoPet[],
    newPetType: PetType
  ): ValidationResult {
    const petDef = this.catalog.getPetByType(newPetType);
    
    if (!petDef) {
      return {
        valid: false,
        reason: `Pet type not found: ${newPetType}`
      };
    }

    // Check if pet is mutually exclusive with owned pets
    const exclusionViolation = this.checkMutualExclusion(currentPets, newPetType);
    if (!exclusionViolation.valid) {
      return exclusionViolation;
    }

    // Check stacking limits
    const stackingViolation = this.checkStackingLimit(currentPets, newPetType);
    if (!stackingViolation.valid) {
      return stackingViolation;
    }

    return { valid: true };
  }

  /**
   * Check mutual exclusion rules (Pantera XOR Oso)
   */
  private checkMutualExclusion(
    currentPets: BrutoPet[],
    newPetType: PetType
  ): ValidationResult {
    const petDef = this.catalog.getPetByType(newPetType);
    if (!petDef) {
      return { valid: false, reason: 'Pet not found in catalog' };
    }

    // Check if any owned pet is mutually exclusive with new pet
    for (const ownedPet of currentPets) {
      if (petDef.mutuallyExclusiveWith.includes(ownedPet.petType)) {
        return {
          valid: false,
          reason: `Cannot have ${newPetType} and ${ownedPet.petType} simultaneously`
        };
      }

      // Check reverse: if new pet excludes owned pet
      const ownedPetDef = this.catalog.getPetByType(ownedPet.petType);
      if (ownedPetDef?.mutuallyExclusiveWith.includes(newPetType)) {
        return {
          valid: false,
          reason: `Cannot have ${ownedPet.petType} and ${newPetType} simultaneously`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Check stacking limits (max 3 Perros, max 1 for others)
   */
  private checkStackingLimit(
    currentPets: BrutoPet[],
    newPetType: PetType
  ): ValidationResult {
    const petDef = this.catalog.getPetByType(newPetType);
    if (!petDef) {
      return { valid: false, reason: 'Pet not found in catalog' };
    }

    // Count how many of this pet type are already owned
    const count = currentPets.filter(p => p.petType === newPetType).length;

    if (count >= petDef.maxStacks) {
      return {
        valid: false,
        reason: `Maximum ${petDef.maxStacks} ${newPetType}(s) allowed`
      };
    }

    return { valid: true };
  }

  /**
   * Get next available slot for Perro (A, B, C)
   * @param currentPets Current pets owned
   * @returns Next available slot or null if all slots taken
   */
  public getNextPerroSlot(currentPets: BrutoPet[]): PetSlot {
    const perros = currentPets.filter(p => p.petType === PetType.PERRO);
    const usedSlots = perros
      .map(p => p.petSlot)
      .filter((s): s is 'A' | 'B' | 'C' => s !== null);

    const availableSlots: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
    
    for (const slot of availableSlots) {
      if (!usedSlots.includes(slot)) {
        return slot;
      }
    }

    return null; // All slots taken
  }

  /**
   * Validate entire pet roster for consistency
   * @param pets Pet roster to validate
   * @returns Validation result
   */
  public validateRoster(pets: BrutoPet[]): ValidationResult {
    // Check for duplicate slots
    const perros = pets.filter(p => p.petType === PetType.PERRO);
    const slots = perros.map(p => p.petSlot).filter(s => s !== null);
    const uniqueSlots = new Set(slots);
    
    if (slots.length !== uniqueSlots.size) {
      return {
        valid: false,
        reason: 'Duplicate Perro slots detected'
      };
    }

    // Check max stacks for each pet type
    const petTypeCounts = new Map<PetType, number>();
    pets.forEach(pet => {
      const count = petTypeCounts.get(pet.petType) || 0;
      petTypeCounts.set(pet.petType, count + 1);
    });

    for (const [petType, count] of petTypeCounts) {
      const petDef = this.catalog.getPetByType(petType);
      if (petDef && count > petDef.maxStacks) {
        return {
          valid: false,
          reason: `Too many ${petType}s: ${count} (max ${petDef.maxStacks})`
        };
      }
    }

    // Check mutual exclusions
    const petTypes = pets.map(p => p.petType);
    if (petTypes.includes(PetType.PANTERA) && petTypes.includes(PetType.OSO)) {
      return {
        valid: false,
        reason: 'Cannot have both Pantera and Oso'
      };
    }

    return { valid: true };
  }
}
