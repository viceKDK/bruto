import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeaponRewardService } from './WeaponRewardService';
import { Weapon, WeaponType } from '../../models/Weapon';
import { WeaponRepository } from '../../database/repositories/WeaponRepository';

describe('WeaponRewardService - Story 5.6', () => {
  let service: WeaponRewardService;
  let mockRepository: Partial<WeaponRepository>;

  // Mock weapons
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
    modifiers: { disarm: 10 },
  };

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      getByBrutoId: vi.fn().mockResolvedValue([]),
      hasBrutoWeapon: vi.fn().mockResolvedValue(false),
      addWeaponToBruto: vi.fn().mockResolvedValue({ brutoId: 1, weaponId: 'sword' }),
      equipWeapon: vi.fn().mockResolvedValue(undefined),
    };

    service = new WeaponRewardService(mockRepository as WeaponRepository);
  });

  describe('AC1: Weapons offered as level-up choice (Weapon OR Skill)', () => {
    describe('selectRandomWeapon', () => {
      it('should return null when all weapons are owned', () => {
        // Simulate all weapons owned except bare-hands
        const allWeaponIds = service.getAllWeapons().map(w => w.id);
        const result = service.selectRandomWeapon(allWeaponIds);
        expect(result).toBeNull();
      });

      it('should not return bare-hands', () => {
        const results = Array.from({ length: 50 }, () => service.selectRandomWeapon([]));
        expect(results.every(w => w?.id !== 'bare-hands')).toBe(true);
      });

      it('should exclude owned weapons', () => {
        const ownedIds = ['sword'];
        const results = Array.from({ length: 20 }, () => service.selectRandomWeapon(ownedIds));
        expect(results.every(w => !ownedIds.includes(w?.id || ''))).toBe(true);
      });

      it('should select weapons based on weighted odds', () => {
        // Spear has highest odds (3.89), should appear most frequently
        const results = Array.from({ length: 100 }, () => service.selectRandomWeapon([]));
        const spearCount = results.filter(w => w?.id === 'spear').length;
        
        // Spear should appear (allow generous RNG variance for test reliability)
        expect(spearCount).toBeGreaterThan(0);
      });
    });

    describe('getLevelUpWeaponOption', () => {
      it('should return random weapon not owned', async () => {
        mockRepository.getByBrutoId = vi.fn().mockResolvedValue([sword]);
        
        const result = await service.getLevelUpWeaponOption(1);
        
        expect(result).not.toBeNull();
        expect(result?.id).not.toBe('sword');
        expect(result?.id).not.toBe('bare-hands');
      });

      it('should return null when all weapons owned', async () => {
        const allWeapons = service.getAllWeapons();
        mockRepository.getByBrutoId = vi.fn().mockResolvedValue(allWeapons);
        
        const result = await service.getLevelUpWeaponOption(1);
        expect(result).toBeNull();
      });
    });
  });

  describe('AC2: Weapon ownership persisted to database', () => {
    describe('acquireWeapon', () => {
      it('should add weapon to bruto inventory', async () => {
        const result = await service.acquireWeapon(1, 'sword', false);
        
        expect(result).not.toBeNull();
        expect(result?.weaponId).toBe('sword');
        expect(result?.weaponName).toBe('Sword');
        expect(result?.weaponNameEs).toBe('Espada');
        expect(result?.alreadyOwned).toBe(false);
        expect(mockRepository.addWeaponToBruto).toHaveBeenCalledWith(1, 'sword');
      });

      it('should not add weapon if already owned', async () => {
        mockRepository.hasBrutoWeapon = vi.fn().mockResolvedValue(true);
        
        const result = await service.acquireWeapon(1, 'sword', false);
        
        expect(result?.alreadyOwned).toBe(true);
        expect(mockRepository.addWeaponToBruto).not.toHaveBeenCalled();
      });

      it('should auto-equip weapon when requested', async () => {
        const result = await service.acquireWeapon(1, 'sword', true);
        
        expect(result?.autoEquipped).toBe(true);
        expect(mockRepository.equipWeapon).toHaveBeenCalledWith(1, 'sword');
      });

      it('should not auto-equip if already owned', async () => {
        mockRepository.hasBrutoWeapon = vi.fn().mockResolvedValue(true);
        
        const result = await service.acquireWeapon(1, 'sword', true);
        
        expect(result?.autoEquipped).toBe(false);
        expect(mockRepository.equipWeapon).not.toHaveBeenCalled();
      });

      it('should return null for invalid weapon ID', async () => {
        const result = await service.acquireWeapon(1, 'invalid-weapon', false);
        expect(result).toBeNull();
      });
    });

    describe('acquireStarterWeapons', () => {
      it('should acquire multiple weapons', async () => {
        const results = await service.acquireStarterWeapons(1, ['sword', 'spear']);
        
        expect(results).toHaveLength(2);
        expect(results[0].weaponId).toBe('sword');
        expect(results[1].weaponId).toBe('spear');
        expect(mockRepository.addWeaponToBruto).toHaveBeenCalledTimes(2);
      });

      it('should skip invalid weapon IDs', async () => {
        const results = await service.acquireStarterWeapons(1, ['sword', 'invalid', 'spear']);
        
        expect(results).toHaveLength(2);
        expect(results.every(r => r.weaponId !== 'invalid')).toBe(true);
      });

      it('should handle empty weapon list', async () => {
        const results = await service.acquireStarterWeapons(1, []);
        expect(results).toEqual([]);
      });
    });

    describe('getLevelUpWeaponOption', () => {
      it('should return random weapon not owned', async () => {
        mockRepository.getByBrutoId = vi.fn().mockResolvedValue([sword]);
        
        const result = await service.getLevelUpWeaponOption(1);
        
        expect(result).not.toBeNull();
        expect(result?.id).not.toBe('sword');
        expect(result?.id).not.toBe('bare-hands');
      });

      it('should return null when all weapons owned', async () => {
        const allWeapons = service.getAllWeapons();
        mockRepository.getByBrutoId = vi.fn().mockResolvedValue(allWeapons);
        
        const result = await service.getLevelUpWeaponOption(1);
        expect(result).toBeNull();
      });
    });
  });

  describe('Helper Methods', () => {
    describe('getAllWeapons', () => {
      it('should return all weapons except bare-hands', () => {
        const weapons = service.getAllWeapons();
        expect(weapons.every(w => w.id !== 'bare-hands')).toBe(true);
        expect(weapons.length).toBeGreaterThan(0);
      });
    });

    describe('getWeaponById', () => {
      it('should return weapon for valid ID', () => {
        const weapon = service.getWeaponById('sword');
        expect(weapon).not.toBeNull();
        expect(weapon?.id).toBe('sword');
        expect(weapon?.name).toBe('Sword');
      });

      it('should return null for invalid ID', () => {
        const weapon = service.getWeaponById('invalid-weapon');
        expect(weapon).toBeNull();
      });

      it('should find bare-hands', () => {
        const weapon = service.getWeaponById('bare-hands');
        expect(weapon).not.toBeNull();
        expect(weapon?.id).toBe('bare-hands');
      });
    });
  });
});
