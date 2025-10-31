/**
 * PetCatalog - Story 7.1
 * Singleton service to load and query pet definitions
 * 
 * Responsibilities:
 * - Load pets.json catalog on initialization
 * - Provide pet lookup by type
 * - Cache pet definitions for performance
 */

import { Pet } from './Pet';
import { PetType } from './PetType';
import petsData from '../../data/pets.json';

interface PetCatalogData {
  pets: Pet[];
}

export class PetCatalog {
  private static instance: PetCatalog;
  private pets: Map<PetType, Pet>;

  private constructor() {
    this.pets = new Map();
    this.loadPets();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PetCatalog {
    if (!PetCatalog.instance) {
      PetCatalog.instance = new PetCatalog();
    }
    return PetCatalog.instance;
  }

  /**
   * Load pets from JSON catalog
   */
  private loadPets(): void {
    const data = petsData as PetCatalogData;
    
    data.pets.forEach(pet => {
      this.pets.set(pet.type, pet);
    });
  }

  /**
   * Get pet definition by type
   * @param type Pet type
   * @returns Pet definition or null if not found
   */
  public getPetByType(type: PetType): Pet | null {
    return this.pets.get(type) || null;
  }

  /**
   * Get all pet definitions
   * @returns Array of all pets
   */
  public getAllPets(): Pet[] {
    return Array.from(this.pets.values());
  }

  /**
   * Get stackable pets (only Perro)
   * @returns Array of stackable pets
   */
  public getStackablePets(): Pet[] {
    return this.getAllPets().filter(pet => pet.stackable);
  }

  /**
   * Check if pet exists in catalog
   * @param type Pet type
   * @returns True if pet exists
   */
  public hasPet(type: PetType): boolean {
    return this.pets.has(type);
  }

  /**
   * Reset catalog (for testing)
   */
  public reset(): void {
    this.pets.clear();
    this.loadPets();
  }
}
