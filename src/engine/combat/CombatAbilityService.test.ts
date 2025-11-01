/**
 * CombatAbilityService Tests
 *
 * Tests for ability processing service (SRP improvement)
 * Validates healing and damage ability logic extracted from CombatEngine
 */

import { describe, it, expect } from 'vitest';
import { CombatAbilityService } from './CombatAbilityService';
import { ActiveAbilityManager } from './ActiveAbilityManager';
import { ActiveAbilityEffects } from './ActiveAbilityEffects';
import { SeededRandom } from '../../utils/SeededRandom';
import { IBrutoCombatant } from '../../models/Bruto';

describe('CombatAbilityService', () => {
  const createCombatant = (hp: number, maxHp: number = 100): IBrutoCombatant => ({
    id: 'test-bruto',
    name: 'TestBruto',
    stats: {
      hp,
      maxHp,
      str: 5,
      speed: 5,
      agility: 5,
      resistance: 1,
    },
    skills: ['pocion_tragica', 'fuerza_bruta'],
  });

  describe('checkHealingAbility', () => {
    it('should not heal if ability not available', () => {
      const rng = new SeededRandom(123);
      const manager = new ActiveAbilityManager();
      const effects = new ActiveAbilityEffects(rng);
      const service = new CombatAbilityService(manager, effects);

      const combatant = createCombatant(50, 100);
      // Don't initialize battle - ability not available

      const result = service.checkHealingAbility('player', combatant, 50, 1, 50, 100);

      expect(result.healed).toBe(false);
      expect(result.healAmount).toBe(0);
      expect(result.action).toBeUndefined();
    });

    it('should not heal if HP above threshold (70%)', () => {
      const rng = new SeededRandom(456);
      const manager = new ActiveAbilityManager();
      const effects = new ActiveAbilityEffects(rng);
      const service = new CombatAbilityService(manager, effects);

      const player = createCombatant(80, 100); // 80% HP
      const opponent = createCombatant(100, 100);

      manager.initializeBattle(player, opponent);

      const result = service.checkHealingAbility('player', player, 80, 1, 80, 100);

      expect(result.healed).toBe(false);
      expect(result.healAmount).toBe(0);
    });

    it('should heal when HP below threshold and ability available', () => {
      const rng = new SeededRandom(789);
      const manager = new ActiveAbilityManager();
      const effects = new ActiveAbilityEffects(rng);
      const service = new CombatAbilityService(manager, effects);

      const player = createCombatant(30, 100); // 30% HP
      const opponent = createCombatant(100, 100);

      manager.initializeBattle(player, opponent);

      const result = service.checkHealingAbility('player', player, 30, 5, 30, 100);

      expect(result.healed).toBe(true);
      expect(result.healAmount).toBeGreaterThan(0);
      expect(result.action).toBeDefined();
      expect(result.action?.action).toBe('heal');
      expect(result.action?.abilityUsed).toBe('pocion_tragica');
    });

    it('should consume ability after use', () => {
      const rng = new SeededRandom(321);
      const manager = new ActiveAbilityManager();
      const effects = new ActiveAbilityEffects(rng);
      const service = new CombatAbilityService(manager, effects);

      const player = createCombatant(20, 100);
      const opponent = createCombatant(100, 100);

      manager.initializeBattle(player, opponent);

      // First use should succeed
      const result1 = service.checkHealingAbility('player', player, 20, 1, 20, 100);
      expect(result1.healed).toBe(true);

      // Second use should fail (already used)
      const result2 = service.checkHealingAbility('player', player, 20, 2, 20, 100);
      expect(result2.healed).toBe(false);
    });
  });

  describe('checkDamageAbility', () => {
    it('should not activate if ability not available', () => {
      const rng = new SeededRandom(555);
      const manager = new ActiveAbilityManager();
      const effects = new ActiveAbilityEffects(rng);
      const service = new CombatAbilityService(manager, effects);

      const result = service.checkDamageAbility('player', 1, 100, 100);

      expect(result.abilityUsed).toBe(false);
      expect(result.damageMultiplier).toBe(1.0);
      expect(result.action).toBeUndefined();
    });

    it('should activate Fuerza Bruta when available', () => {
      const rng = new SeededRandom(666);
      const manager = new ActiveAbilityManager();
      const effects = new ActiveAbilityEffects(rng);
      const service = new CombatAbilityService(manager, effects);

      const player = createCombatant(100, 100);
      const opponent = createCombatant(100, 100);

      manager.initializeBattle(player, opponent);

      const result = service.checkDamageAbility('player', 3, 100, 100);

      expect(result.abilityUsed).toBe(true);
      expect(result.damageMultiplier).toBeGreaterThan(1.0);
      expect(result.action).toBeDefined();
      expect(result.action?.abilityUsed).toBe('fuerza_bruta');
    });

    it('should consume ability after use', () => {
      const rng = new SeededRandom(777);
      const manager = new ActiveAbilityManager();
      const effects = new ActiveAbilityEffects(rng);
      const service = new CombatAbilityService(manager, effects);

      const player = createCombatant(100, 100);
      const opponent = createCombatant(100, 100);

      manager.initializeBattle(player, opponent);

      // First use should succeed
      const result1 = service.checkDamageAbility('player', 1, 100, 100);
      expect(result1.abilityUsed).toBe(true);

      // Second use should fail (already used)
      const result2 = service.checkDamageAbility('player', 2, 100, 100);
      expect(result2.abilityUsed).toBe(false);
    });
  });
});
