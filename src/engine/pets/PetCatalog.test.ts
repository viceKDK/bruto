/**
 * PetCatalog.test.ts - Story 7.1
 * Tests for pet catalog loading and queries
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PetCatalog } from './PetCatalog';
import { PetType } from './PetType';

describe('PetCatalog - Story 7.1', () => {
  let catalog: PetCatalog;

  beforeEach(() => {
    catalog = PetCatalog.getInstance();
    catalog.reset(); // Ensure clean state
  });

  describe('AC1: Pets catalog JSON contains all 3 pet types with complete stats', () => {
    it('should load all 3 pet types from catalog', () => {
      const allPets = catalog.getAllPets();
      
      expect(allPets).toHaveLength(3);
      
      const petTypes = allPets.map(p => p.type);
      expect(petTypes).toContain(PetType.PERRO);
      expect(petTypes).toContain(PetType.PANTERA);
      expect(petTypes).toContain(PetType.OSO);
    });

    it('should load Perro with correct stats', () => {
      const perro = catalog.getPetByType(PetType.PERRO);
      
      expect(perro).not.toBeNull();
      expect(perro!.stats.hp).toBe(14);
      expect(perro!.stats.damage).toBe('low');
      expect(perro!.stats.agility).toBe(5);
      expect(perro!.stats.speed).toBe(3);
      expect(perro!.stats.multiHitChance).toBe(10);
      expect(perro!.stats.evasionChance).toBe(0);
      expect(perro!.stats.initiative).toBe(-10);
    });

    it('should load Pantera with correct stats', () => {
      const pantera = catalog.getPetByType(PetType.PANTERA);
      
      expect(pantera).not.toBeNull();
      expect(pantera!.stats.hp).toBe(26);
      expect(pantera!.stats.damage).toBe('medium');
      expect(pantera!.stats.agility).toBe(16);
      expect(pantera!.stats.speed).toBe(24);
      expect(pantera!.stats.multiHitChance).toBe(60);
      expect(pantera!.stats.evasionChance).toBe(20);
      expect(pantera!.stats.initiative).toBe(-60);
    });

    it('should load Oso with correct stats', () => {
      const oso = catalog.getPetByType(PetType.OSO);
      
      expect(oso).not.toBeNull();
      expect(oso!.stats.hp).toBe(110);
      expect(oso!.stats.damage).toBe('high');
      expect(oso!.stats.agility).toBe(2);
      expect(oso!.stats.speed).toBe(1);
      expect(oso!.stats.multiHitChance).toBe(-20);
      expect(oso!.stats.evasionChance).toBe(0);
      expect(oso!.stats.initiative).toBe(-360);
    });
  });

  describe('AC4: Pet stacking rules documented', () => {
    it('should mark Perro as stackable with max 3', () => {
      const perro = catalog.getPetByType(PetType.PERRO);
      
      expect(perro!.stackable).toBe(true);
      expect(perro!.maxStacks).toBe(3);
      expect(perro!.mutuallyExclusiveWith).toHaveLength(0);
    });

    it('should mark Pantera as non-stackable with Oso exclusion', () => {
      const pantera = catalog.getPetByType(PetType.PANTERA);
      
      expect(pantera!.stackable).toBe(false);
      expect(pantera!.maxStacks).toBe(1);
      expect(pantera!.mutuallyExclusiveWith).toContain(PetType.OSO);
    });

    it('should mark Oso as non-stackable with Pantera exclusion', () => {
      const oso = catalog.getPetByType(PetType.OSO);
      
      expect(oso!.stackable).toBe(false);
      expect(oso!.maxStacks).toBe(1);
      expect(oso!.mutuallyExclusiveWith).toContain(PetType.PANTERA);
    });
  });

  describe('AC5: Resistance cost calculations', () => {
    it('should have correct resistance costs for Perro', () => {
      const perro = catalog.getPetByType(PetType.PERRO);
      
      expect(perro!.resistanceCost.base).toBe(2);
      expect(perro!.resistanceCost.withVitalidad).toBe(3);
      expect(perro!.resistanceCost.withInmortal).toBe(7);
      expect(perro!.resistanceCost.withBoth).toBe(8);
    });

    it('should have correct resistance costs for Pantera', () => {
      const pantera = catalog.getPetByType(PetType.PANTERA);
      
      expect(pantera!.resistanceCost.base).toBe(6);
      expect(pantera!.resistanceCost.withVitalidad).toBe(9);
      expect(pantera!.resistanceCost.withInmortal).toBe(15);
      expect(pantera!.resistanceCost.withBoth).toBe(22);
    });

    it('should have correct resistance costs for Oso', () => {
      const oso = catalog.getPetByType(PetType.OSO);
      
      expect(oso!.resistanceCost.base).toBe(8);
      expect(oso!.resistanceCost.withVitalidad).toBe(12);
      expect(oso!.resistanceCost.withInmortal).toBe(28);
      expect(oso!.resistanceCost.withBoth).toBe(42);
    });
  });

  describe('Catalog queries', () => {
    it('should return pet by type', () => {
      const perro = catalog.getPetByType(PetType.PERRO);
      expect(perro).not.toBeNull();
      expect(perro!.type).toBe(PetType.PERRO);
    });

    it('should return null for invalid pet type', () => {
      const invalid = catalog.getPetByType('invalid' as PetType);
      expect(invalid).toBeNull();
    });

    it('should check if pet exists', () => {
      expect(catalog.hasPet(PetType.PERRO)).toBe(true);
      expect(catalog.hasPet(PetType.PANTERA)).toBe(true);
      expect(catalog.hasPet(PetType.OSO)).toBe(true);
      expect(catalog.hasPet('invalid' as PetType)).toBe(false);
    });

    it('should return only stackable pets (Perro)', () => {
      const stackable = catalog.getStackablePets();
      
      expect(stackable).toHaveLength(1);
      expect(stackable[0].type).toBe(PetType.PERRO);
    });
  });

  describe('Singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = PetCatalog.getInstance();
      const instance2 = PetCatalog.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Special abilities', () => {
    it('should have disarm ability for Oso', () => {
      const oso = catalog.getPetByType(PetType.OSO);
      
      expect(oso!.specialAbilities).toBeDefined();
      expect(oso!.specialAbilities).toContain('disarm');
    });

    it('should have no special abilities for Perro and Pantera', () => {
      const perro = catalog.getPetByType(PetType.PERRO);
      const pantera = catalog.getPetByType(PetType.PANTERA);
      
      expect(perro!.specialAbilities).toHaveLength(0);
      expect(pantera!.specialAbilities).toHaveLength(0);
    });
  });
});
