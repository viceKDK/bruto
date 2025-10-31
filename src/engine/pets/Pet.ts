/**
 * Pet - Story 7.1
 * Pet data model and interfaces for El Bruto
 * 
 * Source: docs/stast.md - Pet stats and resistance costs
 */

import { PetType } from './PetType';

/**
 * Pet stats that affect combat
 */
export interface PetStats {
  hp: number;                    // Pet's health points
  damage: 'low' | 'medium' | 'high';  // Damage category
  agility: number;               // Affects evasion and accuracy
  speed: number;                 // Affects turn frequency
  multiHitChance: number;        // Percentage chance for multi-hit (can be negative)
  evasionChance: number;         // Percentage chance to evade
  initiative: number;            // Turn order modifier (negative = slower)
}

/**
 * Resistance cost based on skills owned
 */
export interface ResistanceCost {
  base: number;                  // Base resistance cost
  withVitalidad: number;         // Cost with Vitalidad skill
  withInmortal: number;          // Cost with Inmortal skill
  withBoth: number;              // Cost with both skills
}

/**
 * Complete pet definition
 */
export interface Pet {
  id: string;                    // Unique identifier (e.g., 'perro', 'pantera', 'oso')
  name: string;                  // Display name
  type: PetType;                 // Pet type enum
  stats: PetStats;               // Combat stats
  stackable: boolean;            // Can have multiple (only Perro)
  maxStacks: number;             // Maximum number allowed (3 for Perro, 1 for others)
  mutuallyExclusiveWith: PetType[];  // Cannot coexist with these pets
  resistanceCost: ResistanceCost;    // Resistance penalty for owning this pet
  specialAbilities?: string[];   // Special abilities (e.g., Oso can disarm)
}

/**
 * Pet slot identifier (A, B, C for multiple Perros)
 */
export type PetSlot = 'A' | 'B' | 'C' | null;

/**
 * Pet ownership record (database entity)
 */
export interface BrutoPet {
  id?: number;                   // Database ID
  brutoId: number;               // Owner bruto ID
  petType: PetType;              // Type of pet
  petSlot: PetSlot;              // Slot identifier (for Perros)
  acquiredAt: Date;              // When pet was acquired
  acquiredLevel: number;         // Bruto's level when pet was acquired
}
