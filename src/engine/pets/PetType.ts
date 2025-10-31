/**
 * PetType - Story 7.1
 * Enum for pet types in El Bruto
 * 
 * Three pet types available:
 * - PERRO: Can have up to 3 (slots A, B, C)
 * - PANTERA: Mutually exclusive with OSO
 * - OSO: Mutually exclusive with PANTERA
 */

export enum PetType {
  PERRO = 'perro',
  PANTERA = 'pantera',
  OSO = 'oso'
}
