/**
 * PetStackingValidator.test.ts - Story 7.1
 * Tests for pet stacking rules and validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PetStackingValidator } from './PetStackingValidator';
import { PetType } from './PetType';
import { BrutoPet } from './Pet';

describe('PetStackingValidator - Story 7.1', () => {
  let validator: PetStackingValidator;
  const MOCK_BRUTO_ID = 1;

  beforeEach(() => {
    validator = new PetStackingValidator();
  });

  describe('AC4: Pet stacking validation rules', () => {
    describe('Perro stacking (up to 3, slots A/B/C)', () => {
      it('should allow first Perro in empty roster', () => {
        const result = validator.canAcquirePet([], PetType.PERRO);
        expect(result.valid).toBe(true);
        
        // Check slot assignment separately
        const slot = validator.getNextPerroSlot([]);
        expect(slot).toBe('A');
      });

      it('should allow second Perro when 1 exists', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PERRO);
        expect(result.valid).toBe(true);
        
        const slot = validator.getNextPerroSlot(currentPets);
        expect(slot).toBe('B');
      });

      it('should allow third Perro when 2 exist', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PERRO);
        expect(result.valid).toBe(true);
        
        const slot = validator.getNextPerroSlot(currentPets);
        expect(slot).toBe('C');
      });

      it('should reject fourth Perro (max 3)', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 3 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PERRO);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Maximum 3 perro');
      });

      it('should fill gap in slots (A missing)', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 1 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 2 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PERRO);
        expect(result.valid).toBe(true);
        
        const slot = validator.getNextPerroSlot(currentPets);
        expect(slot).toBe('A');
      });

      it('should fill gap in slots (B missing)', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 2 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PERRO);
        expect(result.valid).toBe(true);
        
        const slot = validator.getNextPerroSlot(currentPets);
        expect(slot).toBe('B');
      });
    });

    describe('Pantera and Oso mutual exclusion', () => {
      it('should allow Pantera in empty roster', () => {
        const result = validator.canAcquirePet([], PetType.PANTERA);
        expect(result.valid).toBe(true);
      });

      it('should allow Oso in empty roster', () => {
        const result = validator.canAcquirePet([], PetType.OSO);
        expect(result.valid).toBe(true);
      });

      it('should reject Pantera if Oso exists', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 5 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PANTERA);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('pantera and oso');
      });

      it('should reject Oso if Pantera exists', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 3 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.OSO);
        expect(result.valid).toBe(false);
        expect(result.reason).toMatch(/pantera and oso|oso and pantera/i);
      });

      it('should reject duplicate Pantera', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 2 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PANTERA);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Maximum 1 pantera');
      });

      it('should reject duplicate Oso', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 4 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.OSO);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Maximum 1 oso');
      });
    });

    describe('Mixed roster validation (Perros + exclusive pet)', () => {
      it('should allow Pantera with 2 Perros', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PANTERA);
        expect(result.valid).toBe(true);
      });

      it('should allow Oso with 3 Perros', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 3 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.OSO);
        expect(result.valid).toBe(true);
      });

      it('should allow Perro with Pantera', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 4 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PERRO);
        expect(result.valid).toBe(true);
        
        const slot = validator.getNextPerroSlot(currentPets);
        expect(slot).toBe('A');
      });

      it('should allow Perro with Oso', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 5 }
        ];
        
        const result = validator.canAcquirePet(currentPets, PetType.PERRO);
        expect(result.valid).toBe(true);
        
        const slot = validator.getNextPerroSlot(currentPets);
        expect(slot).toBe('A');
      });

      it('should reject 4th Perro when roster is 3 Perros + Pantera', () => {
        const currentPets: BrutoPet[] = [
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 3 },
          { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 4 }
        ];
        
        const perroResult = validator.canAcquirePet(currentPets, PetType.PERRO);
        const osoResult = validator.canAcquirePet(currentPets, PetType.OSO);
        
        expect(perroResult.valid).toBe(false);
        expect(osoResult.valid).toBe(false);
      });
    });
  });

  describe('getNextPerroSlot utility', () => {
    it('should return A for empty roster', () => {
      const slot = validator.getNextPerroSlot([]);
      expect(slot).toBe('A');
    });

    it('should return B when A occupied', () => {
      const currentPets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 }
      ];
      
      const slot = validator.getNextPerroSlot(currentPets);
      expect(slot).toBe('B');
    });

    it('should return C when A and B occupied', () => {
      const currentPets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 }
      ];
      
      const slot = validator.getNextPerroSlot(currentPets);
      expect(slot).toBe('C');
    });

    it('should return null when all slots occupied', () => {
      const currentPets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 3 }
      ];
      
      const slot = validator.getNextPerroSlot(currentPets);
      expect(slot).toBeNull();
    });

    it('should ignore non-Perro pets', () => {
      const currentPets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 3 }
      ];
      
      const slot = validator.getNextPerroSlot(currentPets);
      expect(slot).toBe('A'); // Pantera doesn't occupy slots A/B/C
    });
  });

  describe('validateRoster integrity', () => {
    it('should validate correct roster (3 Perros + Oso)', () => {
      const roster: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 3 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 5 }
      ];
      
      const result = validator.validateRoster(roster);
      expect(result.valid).toBe(true);
    });

    it('should validate correct roster (2 Perros + Pantera)', () => {
      const roster: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 4 }
      ];
      
      const result = validator.validateRoster(roster);
      expect(result.valid).toBe(true);
    });

    it('should reject roster with both Pantera and Oso', () => {
      const roster: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 3 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.OSO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 5 }
      ];
      
      const result = validator.validateRoster(roster);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Cannot have both Pantera and Oso');
    });

    it('should reject roster with 4 Perros (duplicate slot)', () => {
      const roster: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 1 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'B', acquiredAt: new Date(), acquiredLevel: 2 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'C', acquiredAt: new Date(), acquiredLevel: 3 },
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: 'A', acquiredAt: new Date(), acquiredLevel: 4 } // Invalid duplicate slot
      ];
      
      const result = validator.validateRoster(roster);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Duplicate Perro slots');
    });

    it('should validate empty roster', () => {
      const result = validator.validateRoster([]);
      expect(result.valid).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle Perro with undefined slot', () => {
      const currentPets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PERRO, petSlot: null, acquiredAt: new Date(), acquiredLevel: 1 }
      ];
      
      // Validator should still work - treats null slot as no slot occupied
      const slot = validator.getNextPerroSlot(currentPets);
      expect(slot).toBe('A');
    });

    it('should handle exclusive pets with null slots correctly', () => {
      const currentPets: BrutoPet[] = [
        { brutoId: MOCK_BRUTO_ID, petType: PetType.PANTERA, petSlot: null, acquiredAt: new Date(), acquiredLevel: 2 }
      ];
      
      const result = validator.canAcquirePet(currentPets, PetType.OSO);
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/pantera and oso|oso and pantera/i);
    });
  });
});
