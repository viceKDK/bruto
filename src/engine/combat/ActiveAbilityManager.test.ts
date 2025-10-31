/**
 * ActiveAbilityManager Tests - Story 6.5
 * Test active ability state management during combat
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ActiveAbilityManager } from './ActiveAbilityManager';
import { IBruto } from '../../models/Bruto';

describe('ActiveAbilityManager - Story 6.5', () => {
  let manager: ActiveAbilityManager;
  let mockPlayer: IBruto;
  let mockOpponent: IBruto;

  beforeEach(() => {
    manager = new ActiveAbilityManager();

    mockPlayer = {
      id: 'player-1',
      userId: 'user-1',
      name: 'Player Bruto',
      level: 5,
      xp: 100,
      hp: 100,
      maxHp: 100,
      str: 30,
      speed: 10,
      agility: 10,
      resistance: 10,
      appearanceId: 1,
      colorVariant: 1,
      createdAt: new Date(),
      skills: [],
    };

    mockOpponent = {
      id: 'opponent-1',
      userId: 'user-2',
      name: 'Opponent Bruto',
      level: 5,
      xp: 100,
      hp: 100,
      maxHp: 100,
      str: 15,
      speed: 10,
      agility: 10,
      resistance: 10,
      appearanceId: 2,
      colorVariant: 1,
      createdAt: new Date(),
      skills: [],
    };
  });

  describe('AC1: Fuerza Bruta Damage Multiplier', () => {
    it('should initialize Fuerza Bruta with STR-based uses', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 30; // Should give 2 uses

      manager.initializeBattle(mockPlayer, mockOpponent);

      const abilities = manager.getAvailableAbilities('player');
      expect(abilities.length).toBe(1);
      expect(abilities[0].skillId).toBe('fuerza_bruta');
      expect(abilities[0].maxUses).toBe(2);
      expect(abilities[0].usesRemaining).toBe(2);
    });

    it('should calculate 1 use for STR 0-29', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 15;

      manager.initializeBattle(mockPlayer, mockOpponent);

      const ability = manager.getAbility('player', 'fuerza_bruta');
      expect(ability?.maxUses).toBe(1);
    });

    it('should calculate 2 uses for STR 30-59', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 45;

      manager.initializeBattle(mockPlayer, mockOpponent);

      const ability = manager.getAbility('player', 'fuerza_bruta');
      expect(ability?.maxUses).toBe(2);
    });

    it('should calculate 3 uses for STR 60-89', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 75;

      manager.initializeBattle(mockPlayer, mockOpponent);

      const ability = manager.getAbility('player', 'fuerza_bruta');
      expect(ability?.maxUses).toBe(3);
    });

    it('should decrement uses when ability used', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 30;

      manager.initializeBattle(mockPlayer, mockOpponent);

      expect(manager.useAbility('player', 'fuerza_bruta')).toBe(true);
      
      const ability = manager.getAbility('player', 'fuerza_bruta');
      expect(ability?.usesRemaining).toBe(1);
    });

    it('should return false when trying to use exhausted ability', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 15; // 1 use

      manager.initializeBattle(mockPlayer, mockOpponent);

      manager.useAbility('player', 'fuerza_bruta');
      expect(manager.useAbility('player', 'fuerza_bruta')).toBe(false);
    });

    it('should remove ability from available when uses exhausted', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 15; // 1 use

      manager.initializeBattle(mockPlayer, mockOpponent);

      manager.useAbility('player', 'fuerza_bruta');
      
      const available = manager.getAvailableAbilities('player');
      expect(available.length).toBe(0);
    });
  });

  describe('AC2: Poción Trágica Healing', () => {
    it('should initialize Poción Trágica with 1 use', () => {
      mockPlayer.skills = ['pocion_tragica'];

      manager.initializeBattle(mockPlayer, mockOpponent);

      const ability = manager.getAbility('player', 'pocion_tragica');
      expect(ability?.maxUses).toBe(1);
      expect(ability?.usesRemaining).toBe(1);
      expect(ability?.effectType).toBe('heal');
    });

    it('should mark Poción Trágica as used after activation', () => {
      mockPlayer.skills = ['pocion_tragica'];

      manager.initializeBattle(mockPlayer, mockOpponent);

      manager.useAbility('player', 'pocion_tragica');

      const ability = manager.getAbility('player', 'pocion_tragica');
      expect(ability?.usesRemaining).toBe(0);
    });

    it('should not allow using Poción Trágica twice', () => {
      mockPlayer.skills = ['pocion_tragica'];

      manager.initializeBattle(mockPlayer, mockOpponent);

      expect(manager.useAbility('player', 'pocion_tragica')).toBe(true);
      expect(manager.useAbility('player', 'pocion_tragica')).toBe(false);
    });
  });

  describe('AC3: Battle Lifecycle Management', () => {
    it('should initialize abilities for both player and opponent', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockOpponent.skills = ['pocion_tragica'];

      manager.initializeBattle(mockPlayer, mockOpponent);

      expect(manager.getAvailableAbilities('player').length).toBe(1);
      expect(manager.getAvailableAbilities('opponent').length).toBe(1);
    });

    it('should reset abilities to full uses at new battle start', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockPlayer.str = 30; // 2 uses

      // First battle
      manager.initializeBattle(mockPlayer, mockOpponent);
      manager.useAbility('player', 'fuerza_bruta');
      manager.useAbility('player', 'fuerza_bruta');

      // New battle - should reset
      manager.initializeBattle(mockPlayer, mockOpponent);

      const ability = manager.getAbility('player', 'fuerza_bruta');
      expect(ability?.usesRemaining).toBe(2);
    });

    it('should clear all state on reset', () => {
      mockPlayer.skills = ['fuerza_bruta'];
      mockOpponent.skills = ['pocion_tragica'];

      manager.initializeBattle(mockPlayer, mockOpponent);
      manager.reset();

      expect(manager.getAvailableAbilities('player').length).toBe(0);
      expect(manager.getAvailableAbilities('opponent').length).toBe(0);
    });
  });

  describe('AC4: Dynamic Use Calculation', () => {
    it('should handle edge case STR values correctly', () => {
      const testCases = [
        { str: 1, expectedUses: 1 },
        { str: 29, expectedUses: 1 },
        { str: 30, expectedUses: 2 },
        { str: 59, expectedUses: 2 },
        { str: 60, expectedUses: 3 },
        { str: 89, expectedUses: 3 },
        { str: 90, expectedUses: 4 },
      ];

      testCases.forEach(({ str, expectedUses }) => {
        mockPlayer.skills = ['fuerza_bruta'];
        mockPlayer.str = str;

        manager.initializeBattle(mockPlayer, mockOpponent);

        const ability = manager.getAbility('player', 'fuerza_bruta');
        expect(ability?.maxUses).toBe(expectedUses);
      });
    });
  });

  describe('AC5: Ability Availability Checks', () => {
    it('should return true for available ability', () => {
      mockPlayer.skills = ['fuerza_bruta'];

      manager.initializeBattle(mockPlayer, mockOpponent);

      expect(manager.isAbilityAvailable('player', 'fuerza_bruta')).toBe(true);
    });

    it('should return false for exhausted ability', () => {
      mockPlayer.skills = ['pocion_tragica'];

      manager.initializeBattle(mockPlayer, mockOpponent);
      manager.useAbility('player', 'pocion_tragica');

      expect(manager.isAbilityAvailable('player', 'pocion_tragica')).toBe(false);
    });

    it('should return false for non-existent ability', () => {
      manager.initializeBattle(mockPlayer, mockOpponent);

      expect(manager.isAbilityAvailable('player', 'invalid_skill')).toBe(false);
    });

    it('should handle bruto with no skills', () => {
      mockPlayer.skills = [];

      manager.initializeBattle(mockPlayer, mockOpponent);

      expect(manager.getAvailableAbilities('player').length).toBe(0);
    });

    it('should handle bruto with undefined skills', () => {
      mockPlayer.skills = undefined;

      manager.initializeBattle(mockPlayer, mockOpponent);

      expect(manager.getAvailableAbilities('player').length).toBe(0);
    });
  });

  describe('Multiple Abilities Integration', () => {
    it('should handle bruto with multiple active abilities', () => {
      mockPlayer.skills = ['fuerza_bruta', 'pocion_tragica'];
      mockPlayer.str = 30;

      manager.initializeBattle(mockPlayer, mockOpponent);

      const abilities = manager.getAvailableAbilities('player');
      expect(abilities.length).toBe(2);
      expect(abilities.map(a => a.skillId)).toContain('fuerza_bruta');
      expect(abilities.map(a => a.skillId)).toContain('pocion_tragica');
    });

    it('should track uses independently for each ability', () => {
      mockPlayer.skills = ['fuerza_bruta', 'pocion_tragica'];
      mockPlayer.str = 15; // 1 use for Fuerza Bruta

      manager.initializeBattle(mockPlayer, mockOpponent);

      manager.useAbility('player', 'fuerza_bruta');
      
      expect(manager.isAbilityAvailable('player', 'fuerza_bruta')).toBe(false);
      expect(manager.isAbilityAvailable('player', 'pocion_tragica')).toBe(true);
    });
  });
});
