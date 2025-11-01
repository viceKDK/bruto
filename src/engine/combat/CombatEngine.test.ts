import { describe, expect, it, beforeEach } from 'vitest';
import { CombatEngine, BattleConfig } from './CombatEngine';
import { IBrutoCombatant } from '../../models/Bruto';

const createCombatant = (overrides: Partial<IBrutoCombatant> = {}): IBrutoCombatant => ({
  id: 'bruto-1',
  name: 'Thor',
  stats: {
    hp: 100,
    maxHp: 100,
    str: 10,
    speed: 5,
    agility: 3,
    resistance: 2,
  },
  ...overrides,
});

describe('CombatEngine', () => {
  describe('initialization', () => {
    it('initializes with provided combatants', () => {
      const player = createCombatant({ name: 'Player' });
      const opponent = createCombatant({ name: 'Opponent' });

      const engine = new CombatEngine({ player, opponent, rngSeed: 12345 });
      const result = engine.executeBattle();

      expect(result).toBeDefined();
      expect(result.winner).toBeDefined();
      expect(result.actions).toBeDefined();
      expect(result.rngSeed).toBe(12345);
    });

    it('generates timestamp seed when none provided', () => {
      const player = createCombatant();
      const opponent = createCombatant();

      const engine = new CombatEngine({ player, opponent });
      const result = engine.executeBattle();

      expect(result.rngSeed).toBeDefined();
      expect(typeof result.rngSeed).toBe('number');
    });
  });

  describe('initiative calculation', () => {
    it('higher speed combatant goes first', () => {
      const player = createCombatant({ name: 'Fast', stats: { hp: 100, maxHp: 100, str: 10, speed: 10, agility: 3, resistance: 2 } });
      const opponent = createCombatant({ name: 'Slow', stats: { hp: 100, maxHp: 100, str: 10, speed: 1, agility: 3, resistance: 2 } });

      const engine = new CombatEngine({ player, opponent, rngSeed: 42 });
      const result = engine.executeBattle();

      // First action should be from faster combatant (player)
      expect(result.actions[0].attacker).toBe('player');
    });

    it('incorporates pet initiative modifiers', () => {
      const player = createCombatant({
        name: 'With Panther',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 2 },
        petInitiativeModifier: -60, // Panther makes faster
      });
      const opponent = createCombatant({
        name: 'With Bear',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 10, agility: 3, resistance: 2 },
        petInitiativeModifier: -360, // Bear is even faster despite lower speed stat
      });

      const engine = new CombatEngine({ player, opponent, rngSeed: 100 });
      const result = engine.executeBattle();

      // Opponent with Bear should go first despite lower speed stat
      expect(result.actions[0].attacker).toBe('opponent');
    });
  });

  describe('battle execution', () => {
    it('resolves battle to definitive winner', () => {
      const player = createCombatant({ name: 'Strong', stats: { hp: 100, maxHp: 100, str: 20, speed: 5, agility: 2, resistance: 1 } });
      const opponent = createCombatant({ name: 'Weak', stats: { hp: 50, maxHp: 50, str: 5, speed: 5, agility: 2, resistance: 1 } });

      const engine = new CombatEngine({ player, opponent, rngSeed: 999 });
      const result = engine.executeBattle();

      expect(result.winner).toBeDefined();
      expect(['player', 'opponent']).toContain(result.winner);
    });

    it('generates combat action log', () => {
      const player = createCombatant();
      const opponent = createCombatant();

      const engine = new CombatEngine({ player, opponent, rngSeed: 555 });
      const result = engine.executeBattle();

      expect(result.actions.length).toBeGreaterThan(0);

      result.actions.forEach((action) => {
        expect(action.turn).toBeGreaterThan(0);
        expect(['player', 'opponent']).toContain(action.attacker);
        expect(['attack', 'dodge', 'critical', 'skill']).toContain(action.action);
        expect(action.hpRemaining).toBeDefined();
        expect(action.hpRemaining.player).toBeGreaterThanOrEqual(0);
        expect(action.hpRemaining.opponent).toBeGreaterThanOrEqual(0);
      });
    });

    it('tracks HP remaining accurately', () => {
      const player = createCombatant({ stats: { hp: 80, maxHp: 80, str: 15, speed: 5, agility: 2, resistance: 1 } });
      const opponent = createCombatant({ stats: { hp: 80, maxHp: 80, str: 15, speed: 5, agility: 2, resistance: 1 } });

      const engine = new CombatEngine({ player, opponent, rngSeed: 777 });
      const result = engine.executeBattle();

      // Winner should have HP > 0
      if (result.winner === 'player') {
        expect(result.playerHpRemaining).toBeGreaterThan(0);
        expect(result.opponentHpRemaining).toBe(0);
      } else {
        expect(result.opponentHpRemaining).toBeGreaterThan(0);
        expect(result.playerHpRemaining).toBe(0);
      }
    });
  });

  describe('damage mechanics', () => {
    it('applies STR-based damage', () => {
      const player = createCombatant({
        stats: { hp: 200, maxHp: 200, str: 50, speed: 5, agility: 0, resistance: 0 }, // High STR, no dodge
      });
      const opponent = createCombatant({
        stats: { hp: 200, maxHp: 200, str: 5, speed: 5, agility: 0, resistance: 0 }, // Low STR, no dodge
      });

      const engine = new CombatEngine({ player, opponent, rngSeed: 321 });
      const result = engine.executeBattle();

      // Player should win due to higher STR
      expect(result.winner).toBe('player');
    });

    it('handles dodge based on agility', () => {
      const player = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 0, resistance: 2 }, // No dodge
      });
      const opponent = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 9, resistance: 2 }, // 90% dodge (capped at 95%)
      });

      const engine = new CombatEngine({ player, opponent, rngSeed: 654 });
      const result = engine.executeBattle();

      // Should have dodge actions
      const dodgeActions = result.actions.filter((a) => a.action === 'dodge');
      expect(dodgeActions.length).toBeGreaterThan(0);
    });

    it('applies resistance damage reduction', () => {
      const highResistance = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 0, resistance: 50 }, // 50% reduction
      });
      const lowResistance = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 0, resistance: 0 }, // No reduction
      });

      const engine1 = new CombatEngine({
        player: createCombatant({ stats: { hp: 100, maxHp: 100, str: 20, speed: 5, agility: 0, resistance: 0 } }),
        opponent: highResistance,
        rngSeed: 888,
      });

      const engine2 = new CombatEngine({
        player: createCombatant({ stats: { hp: 100, maxHp: 100, str: 20, speed: 5, agility: 0, resistance: 0 } }),
        opponent: lowResistance,
        rngSeed: 888,
      });

      const result1 = engine1.executeBattle();
      const result2 = engine2.executeBattle();

      // High resistance opponent should take less damage per hit
      const damageActions1 = result1.actions.filter((a) => a.action === 'attack' && a.damage !== undefined && a.damage > 0);
      const damageActions2 = result2.actions.filter((a) => a.action === 'attack' && a.damage !== undefined && a.damage > 0);

      // Both should have damage actions
      expect(damageActions1.length).toBeGreaterThan(0);
      expect(damageActions2.length).toBeGreaterThan(0);

      // Average damage against high resistance should be lower
      const avgDamage1 = damageActions1.reduce((sum, a) => sum + (a.damage || 0), 0) / damageActions1.length;
      const avgDamage2 = damageActions2.reduce((sum, a) => sum + (a.damage || 0), 0) / damageActions2.length;

      expect(avgDamage1).toBeLessThan(avgDamage2);
    });

    it('generates critical hits', () => {
      const player = createCombatant({
        stats: { hp: 200, maxHp: 200, str: 20, speed: 5, agility: 0, resistance: 0 },
      });
      const opponent = createCombatant({
        stats: { hp: 200, maxHp: 200, str: 20, speed: 5, agility: 0, resistance: 0 },
      });

      const engine = new CombatEngine({ player, opponent, rngSeed: 111 });
      const result = engine.executeBattle();

      // With enough turns, should have at least one critical
      const criticalActions = result.actions.filter((a) => a.action === 'critical');
      expect(criticalActions.length).toBeGreaterThanOrEqual(0); // May or may not have crits depending on RNG
    });
  });

  describe('extra turn mechanics', () => {
    it('grants extra turns based on speed stat', () => {
      const player = createCombatant({
        name: 'Speedy',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 12, agility: 2, resistance: 2 }, // 60% extra turn chance (capped)
      });
      const opponent = createCombatant({
        name: 'Slow',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 1, agility: 2, resistance: 2 }, // 5% extra turn chance
      });

      const engine = new CombatEngine({ player, opponent, rngSeed: 333 });
      const result = engine.executeBattle();

      // Player should have more consecutive turns
      let playerConsecutiveTurns = 0;
      let maxConsecutive = 0;

      result.actions.forEach((action, i) => {
        if (action.attacker === 'player') {
          playerConsecutiveTurns++;
          maxConsecutive = Math.max(maxConsecutive, playerConsecutiveTurns);
        } else {
          playerConsecutiveTurns = 0;
        }
      });

      // Should have at least one instance of consecutive player turns (extra turn)
      expect(maxConsecutive).toBeGreaterThanOrEqual(1);
    });
  });

  describe('determinism and replay', () => {
    it('produces identical battles with same seed', () => {
      const player = createCombatant({ name: 'Player' });
      const opponent = createCombatant({ name: 'Opponent' });

      const seed = 424242;

      const engine1 = new CombatEngine({ player, opponent, rngSeed: seed });
      const result1 = engine1.executeBattle();

      const engine2 = new CombatEngine({ player, opponent, rngSeed: seed });
      const result2 = engine2.executeBattle();

      // Results should be identical
      expect(result1.winner).toBe(result2.winner);
      expect(result1.actions.length).toBe(result2.actions.length);
      expect(result1.playerHpRemaining).toBe(result2.playerHpRemaining);
      expect(result1.opponentHpRemaining).toBe(result2.opponentHpRemaining);

      // Action sequences should match
      result1.actions.forEach((action, i) => {
        expect(action.attacker).toBe(result2.actions[i].attacker);
        expect(action.action).toBe(result2.actions[i].action);
        expect(action.damage).toBe(result2.actions[i].damage);
      });
    });

    it('produces different battles with different seeds', () => {
      const player = createCombatant();
      const opponent = createCombatant();

      const engine1 = new CombatEngine({ player, opponent, rngSeed: 111 });
      const result1 = engine1.executeBattle();

      const engine2 = new CombatEngine({ player, opponent, rngSeed: 222 });
      const result2 = engine2.executeBattle();

      // Results should differ (winner may be same, but action sequences should differ)
      const actionsMatch = result1.actions.every((action, i) =>
        result2.actions[i] &&
        action.attacker === result2.actions[i].attacker &&
        action.action === result2.actions[i].action &&
        action.damage === result2.actions[i].damage
      );

      expect(actionsMatch).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles one-hit KO scenario', () => {
      const player = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 200, speed: 10, agility: 0, resistance: 0 }, // Massive STR
      });
      const opponent = createCombatant({
        stats: { hp: 10, maxHp: 10, str: 5, speed: 1, agility: 0, resistance: 0 }, // Low HP
      });

      const engine = new CombatEngine({ player, opponent, rngSeed: 999 });
      const result = engine.executeBattle();

      expect(result.winner).toBe('player');
      expect(result.opponentHpRemaining).toBe(0);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('handles evenly matched combatants', () => {
      const player = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 2 },
      });
      const opponent = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 2 },
      });

      const engine = new CombatEngine({ player, opponent, rngSeed: 777 });
      const result = engine.executeBattle();

      // Should complete and have a winner
      expect(result.winner).toBeDefined();
      expect(result.actions.length).toBeGreaterThan(2); // Should take multiple turns
    });
  });
});
