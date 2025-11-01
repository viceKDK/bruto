import { describe, it, expect } from 'vitest';
import { DisarmService, DisarmedWeapon } from './DisarmService';
import { Weapon, WeaponType } from '../../models/Weapon';

describe('DisarmService - Story 5.4', () => {
  // Mock weapons
  const sai: Weapon = {
    id: 'sai',
    name: 'Sai',
    nameEs: 'Sai',
    types: [WeaponType.Fast],
    odds: 0.58,
    hitSpeed: 200,
    damage: 8,
    drawChance: 8,
    reach: 0,
    modifiers: {
      disarm: 75, // Highest disarm in catalog
    },
  };

  const sword: Weapon = {
    id: 'sword',
    name: 'Sword',
    nameEs: 'Espada',
    types: [WeaponType.Sharp],
    odds: 0.39,
    hitSpeed: 67,
    damage: 28,
    drawChance: 33,
    reach: 2,
    modifiers: {
      disarm: 10,
    },
  };

  const noDisarmWeapon: Weapon = {
    id: 'spear',
    name: 'Spear',
    nameEs: 'Lanza',
    types: [WeaponType.Long],
    odds: 3.89,
    hitSpeed: 100,
    damage: 12,
    drawChance: 17,
    reach: 3,
    modifiers: {}, // No disarm modifier
  };

  describe('AC1: Disarm chance is ONLY weapon-based (no base, no dexterity)', () => {
    describe('calculateDisarmChance', () => {
      it('should return 0% with no weapon (no base disarm chance)', () => {
        const chance = DisarmService.calculateDisarmChance(null);
        expect(chance).toBe(0); // NO base disarm chance
      });

      it('should return ONLY weapon disarm modifier', () => {
        const chance = DisarmService.calculateDisarmChance(sword);
        expect(chance).toBe(10); // Only sword modifier (no base)
      });

      it('should calculate high disarm chance with Sai (75%)', () => {
        const chance = DisarmService.calculateDisarmChance(sai);
        expect(chance).toBe(75); // Only sai modifier (no base)
      });

      it('should return 0% for weapons without disarm modifier', () => {
        const chance = DisarmService.calculateDisarmChance(noDisarmWeapon);
        expect(chance).toBe(0); // Weapon has no disarm modifier
      });

      it('should allow 100% disarm chance with the right weapon', () => {
        const superDisarmWeapon: Weapon = {
          id: 'super-disarm',
          name: 'Super Disarm Weapon',
          nameEs: 'Arma Super Desarme',
          types: [WeaponType.Fast],
          odds: 1,
          hitSpeed: 100,
          damage: 1,
          drawChance: 1,
          reach: 1,
          modifiers: { disarm: 100 }, // 100% disarm
        };
        
        const chance = DisarmService.calculateDisarmChance(superDisarmWeapon);
        expect(chance).toBe(100); // Can reach 100%
      });

      it('should handle negative disarm modifiers (clamped to 0)', () => {
        const negativeWeapon: Weapon = {
          ...sword,
          modifiers: { disarm: -20 },
        };
        const chance = DisarmService.calculateDisarmChance(negativeWeapon);
        expect(chance).toBe(0); // -20 clamped to 0
      });

      it('should never go below 0%', () => {
        const veryNegativeWeapon: Weapon = {
          ...sword,
          modifiers: { disarm: -50 },
        };
        const chance = DisarmService.calculateDisarmChance(veryNegativeWeapon);
        expect(chance).toBe(0);
      });
    });

    describe('attemptDisarm', () => {
      it('should always succeed with 100% chance', () => {
        const results = Array.from({ length: 10 }, () => 
          DisarmService.attemptDisarm(100)
        );
        expect(results.every(r => r === true)).toBe(true);
      });

      it('should never succeed with 0% chance', () => {
        const results = Array.from({ length: 10 }, () => 
          DisarmService.attemptDisarm(0)
        );
        expect(results.every(r => r === false)).toBe(true);
      });

      it('should sometimes succeed with 50% chance', () => {
        const results = Array.from({ length: 100 }, () => 
          DisarmService.attemptDisarm(50)
        );
        const successCount = results.filter(r => r).length;
        // Should be roughly 50%, allow 30-70% range for randomness
        expect(successCount).toBeGreaterThan(30);
        expect(successCount).toBeLessThan(70);
      });
    });
  });

  describe('AC2: Disarmed opponent deals reduced damage', () => {
    describe('applyDisarm', () => {
      it('should return null when no weapons equipped', () => {
        const result = DisarmService.applyDisarm([]);
        expect(result).toBeNull();
      });

      it('should disarm a weapon from equipped list', () => {
        const result = DisarmService.applyDisarm([sword]);
        expect(result).not.toBeNull();
        expect(result?.weaponId).toBe('sword');
        expect(result?.turnsRemaining).toBe(3);
        expect(result?.originallyEquipped).toBe(true);
      });

      it('should randomly select from multiple equipped weapons', () => {
        const weapons = [sword, sai, noDisarmWeapon];
        const results = Array.from({ length: 30 }, () => 
          DisarmService.applyDisarm(weapons)
        );
        
        const disarmedIds = new Set(results.map(r => r?.weaponId));
        // Should have disarmed different weapons across attempts
        expect(disarmedIds.size).toBeGreaterThan(1);
      });
    });

    describe('getAvailableWeapons', () => {
      it('should return all weapons when none disarmed', () => {
        const weapons = [sword, sai];
        const available = DisarmService.getAvailableWeapons(weapons, []);
        expect(available).toEqual(weapons);
      });

      it('should exclude disarmed weapons', () => {
        const weapons = [sword, sai];
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 2,
          originallyEquipped: true,
        }];
        const available = DisarmService.getAvailableWeapons(weapons, disarmed);
        expect(available).toEqual([sai]);
      });

      it('should return empty array when all weapons disarmed', () => {
        const weapons = [sword];
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 2,
          originallyEquipped: true,
        }];
        const available = DisarmService.getAvailableWeapons(weapons, disarmed);
        expect(available).toEqual([]);
      });
    });
  });

  describe('AC3: Weapon returns after combat or after X turns', () => {
    describe('updateDisarmTimers', () => {
      it('should decrement turns remaining', () => {
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 3,
          originallyEquipped: true,
        }];
        const updated = DisarmService.updateDisarmTimers(disarmed);
        expect(updated[0].turnsRemaining).toBe(2);
      });

      it('should remove weapons with 0 turns remaining', () => {
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 1,
          originallyEquipped: true,
        }];
        const updated = DisarmService.updateDisarmTimers(disarmed);
        expect(updated).toEqual([]);
      });

      it('should handle multiple disarmed weapons', () => {
        const disarmed: DisarmedWeapon[] = [
          { weaponId: 'sword', turnsRemaining: 3, originallyEquipped: true },
          { weaponId: 'sai', turnsRemaining: 1, originallyEquipped: true },
          { weaponId: 'spear', turnsRemaining: 2, originallyEquipped: true },
        ];
        const updated = DisarmService.updateDisarmTimers(disarmed);
        expect(updated).toHaveLength(2); // sai recovered
        expect(updated.find(w => w.weaponId === 'sword')?.turnsRemaining).toBe(2);
        expect(updated.find(w => w.weaponId === 'spear')?.turnsRemaining).toBe(1);
      });

      it('should return empty array when all weapons recovered', () => {
        const disarmed: DisarmedWeapon[] = [
          { weaponId: 'sword', turnsRemaining: 1, originallyEquipped: true },
          { weaponId: 'sai', turnsRemaining: 1, originallyEquipped: true },
        ];
        const updated = DisarmService.updateDisarmTimers(disarmed);
        expect(updated).toEqual([]);
      });
    });

    describe('recoverAllWeapons', () => {
      it('should return empty array (all weapons recovered)', () => {
        const recovered = DisarmService.recoverAllWeapons();
        expect(recovered).toEqual([]);
      });
    });
  });

  describe('Helper Methods', () => {
    describe('initializeDisarmState', () => {
      it('should create empty disarm state', () => {
        const state = DisarmService.initializeDisarmState();
        expect(state.attackerDisarmedWeapons).toEqual([]);
        expect(state.defenderDisarmedWeapons).toEqual([]);
      });
    });

    describe('isWeaponDisarmed', () => {
      it('should return true for disarmed weapon', () => {
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 2,
          originallyEquipped: true,
        }];
        expect(DisarmService.isWeaponDisarmed('sword', disarmed)).toBe(true);
      });

      it('should return false for available weapon', () => {
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 2,
          originallyEquipped: true,
        }];
        expect(DisarmService.isWeaponDisarmed('sai', disarmed)).toBe(false);
      });

      it('should return false when no weapons disarmed', () => {
        expect(DisarmService.isWeaponDisarmed('sword', [])).toBe(false);
      });
    });

    describe('getTurnsUntilRecovery', () => {
      it('should return turns remaining for disarmed weapon', () => {
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 2,
          originallyEquipped: true,
        }];
        expect(DisarmService.getTurnsUntilRecovery('sword', disarmed)).toBe(2);
      });

      it('should return 0 for available weapon', () => {
        const disarmed: DisarmedWeapon[] = [{
          weaponId: 'sword',
          turnsRemaining: 2,
          originallyEquipped: true,
        }];
        expect(DisarmService.getTurnsUntilRecovery('sai', disarmed)).toBe(0);
      });

      it('should return 0 when no weapons disarmed', () => {
        expect(DisarmService.getTurnsUntilRecovery('sword', [])).toBe(0);
      });
    });
  });
});
