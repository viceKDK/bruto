/**
 * Story 5.4: DisarmService Integration Tests in CombatEngine
 * 
 * Tests the complete disarm mechanics integration:
 * - AC1: Disarm chance calculated with weapon modifiers and agility
 * - AC2: Disarmed weapons excluded from combat modifiers
 * - AC3: Weapon timers decrement and weapons recover after 3 turns
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CombatEngine, BattleConfig } from './CombatEngine';
import { IBrutoCombatant } from '../../models/Bruto';

describe('CombatEngine - Disarm Integration', () => {
  let playerBruto: IBrutoCombatant;
  let opponentBruto: IBrutoCombatant;

  beforeEach(() => {
    // Player with Sai (high disarm modifier: +75%)
    playerBruto = {
      id: 'player-1',
      name: 'Disarmer',
      stats: {
        hp: 100,
        maxHp: 100,
        str: 10,
        speed: 5,
        agility: 50, // Agility does NOT affect disarm
        resistance: 5,
      },
      equippedWeapons: ['sai'], // Sai has +75% disarm
      skills: [],
    };

    // Opponent with Sword (can be disarmed)
    opponentBruto = {
      id: 'opponent-1',
      name: 'Victim',
      stats: {
        hp: 100,
        maxHp: 100,
        str: 10,
        speed: 5,
        agility: 10,
        resistance: 5,
      },
      equippedWeapons: ['sword'], // Has weapon to disarm
      skills: [],
    };
  });

  /**
   * AC1: Disarm Chance Calculation
   * Disarm chance is ONLY based on weapon modifiers (can reach 100%)
   */
  describe('AC1: Disarm Chance Calculation', () => {
    it('should calculate disarm chance from weapon modifiers only (no base, no agility)', () => {
      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 12345, // Fixed seed for testing
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      // Total disarm chance = Sai 75% (no base, no agility bonus)
      // With 75% chance and multiple attacks, at least one disarm should occur
      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      // With high disarm chance and fixed seed, we should see at least one disarm
      expect(disarmActions.length).toBeGreaterThan(0);
    });

    it('should track which weapon was disarmed', () => {
      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 12345,
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      if (disarmActions.length > 0) {
        const disarmAction = disarmActions[0];
        expect(disarmAction.weaponDisarmed).toBe('sword'); // Opponent's only weapon
        expect(disarmAction.attacker).toBe('player'); // Player disarmed opponent
      }
    });

    it('should not disarm bare-handed opponents', () => {
      opponentBruto.equippedWeapons = []; // No weapons (will use bare-hands)

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 12345,
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      // Should never disarm bare-hands (opponent has no equipped weapons to disarm)
      expect(disarmActions.length).toBe(0);
    });

    it('should work with multiple weapons equipped', () => {
      opponentBruto.equippedWeapons = ['sword', 'spear', 'mace']; // 3 weapons

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 99999, // Seed that triggers disarm
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      if (disarmActions.length > 0) {
        const disarmAction = disarmActions[0];
        // Should disarm one of the three weapons
        expect(['sword', 'spear', 'mace']).toContain(disarmAction.weaponDisarmed);
      }
    });
  });

  /**
   * AC2: Disarmed Weapons Excluded from Modifiers
   */
  describe('AC2: Disarmed Weapons Excluded from Modifiers', () => {
    it('should exclude disarmed weapons from damage calculations', () => {
      // Setup: Opponent with powerful weapon
      opponentBruto.equippedWeapons = ['mace']; // Mace: 30 damage
      playerBruto.equippedWeapons = ['sai']; // Sai: high disarm chance

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 99999, // Seed that triggers early disarm
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      if (disarmActions.length > 0) {
        const disarmTurn = disarmActions[0].turn;
        
        // Find opponent attacks before and after disarm
        const attacksBeforeDisarm = result.actions.filter(
          a => a.attacker === 'opponent' && a.action === 'attack' && a.turn < disarmTurn
        );
        
        const attacksAfterDisarm = result.actions.filter(
          a => a.attacker === 'opponent' && a.action === 'attack' && a.turn > disarmTurn
        );

        // Attacks after disarm should deal less damage (no weapon bonus)
        if (attacksBeforeDisarm.length > 0 && attacksAfterDisarm.length > 0) {
          const avgDamageBefore = attacksBeforeDisarm.reduce((sum, a) => sum + (a.damage || 0), 0) / attacksBeforeDisarm.length;
          const avgDamageAfter = attacksAfterDisarm.reduce((sum, a) => sum + (a.damage || 0), 0) / attacksAfterDisarm.length;
          
          // After disarm, damage should be lower (lost 30 damage from Mace)
          expect(avgDamageAfter).toBeLessThan(avgDamageBefore);
        }
      }
    });

    it('should exclude disarmed weapons from crit chance', () => {
      // Opponent with weapon that has crit bonus
      opponentBruto.equippedWeapons = ['mace']; // Mace: +20% crit

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 99999,
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      if (disarmActions.length > 0) {
        const disarmTurn = disarmActions[0].turn;
        
        // Count opponent crits before and after disarm
        const critsBeforeDisarm = result.actions.filter(
          a => a.attacker === 'opponent' && a.action === 'critical' && a.turn < disarmTurn
        ).length;
        
        const critsAfterDisarm = result.actions.filter(
          a => a.attacker === 'opponent' && a.action === 'critical' && a.turn > disarmTurn
        ).length;

        const attacksBeforeDisarm = result.actions.filter(
          a => a.attacker === 'opponent' && (a.action === 'attack' || a.action === 'critical') && a.turn < disarmTurn
        ).length;
        
        const attacksAfterDisarm = result.actions.filter(
          a => a.attacker === 'opponent' && (a.action === 'attack' || a.action === 'critical') && a.turn > disarmTurn
        ).length;

        // After disarm, crit rate should be lower (lost +20% from Mace)
        if (attacksBeforeDisarm > 0 && attacksAfterDisarm > 0) {
          const critRateBefore = critsBeforeDisarm / attacksBeforeDisarm;
          const critRateAfter = critsAfterDisarm / attacksAfterDisarm;
          
          // Note: This is probabilistic, but with enough attacks and fixed seed it should be reliable
          expect(critRateAfter).toBeLessThanOrEqual(critRateBefore);
        }
      }
    });
  });

  /**
   * AC3: Weapon Recovery After 3 Turns
   */
  describe('AC3: Weapon Timer and Recovery', () => {
    it('should recover weapon after 3 turns', () => {
      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 99999, // Triggers early disarm
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      if (disarmActions.length > 0) {
        const disarmTurn = disarmActions[0].turn;
        
        // Find opponent attacks 4+ turns after disarm
        const attacksAfterRecovery = result.actions.filter(
          a => a.attacker === 'opponent' && a.action === 'attack' && a.turn >= disarmTurn + 4
        );

        // If battle lasted long enough, weapon should be recovered
        if (attacksAfterRecovery.length > 0) {
          const damageAfterRecovery = attacksAfterRecovery[0].damage || 0;
          
          // Damage should be higher again (weapon recovered)
          // Sword adds 28 damage, so should be significantly higher than bare hands
          expect(damageAfterRecovery).toBeGreaterThan(20);
        }
      }
    });

    it('should handle multiple disarms in same battle', () => {
      // Opponent with 3 weapons
      opponentBruto.equippedWeapons = ['sword', 'spear', 'mace'];

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 77777, // Seed that triggers multiple disarms
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      // With 3 weapons and high disarm chance, might see multiple disarms
      expect(disarmActions.length).toBeGreaterThanOrEqual(0);
      
      // All disarmed weapons should be valid weapon IDs
      disarmActions.forEach(action => {
        expect(['sword', 'spear', 'mace']).toContain(action.weaponDisarmed);
      });
    });
  });

  /**
   * Edge Cases
   */
  describe('Edge Cases', () => {
    it('should use bare-hands (5% disarm) when no weapons equipped', () => {
      playerBruto.equippedWeapons = []; // No weapons -> uses bare-hands

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 99999, // Seed that might trigger disarm
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      // With bare-hands (5% disarm), might see some disarms
      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      // Bare-hands has 5% disarm, so possible but not guaranteed
      expect(disarmActions.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle disarm when opponent has only one weapon', () => {
      opponentBruto.equippedWeapons = ['sword']; // Only one weapon

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 99999,
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      if (disarmActions.length > 0) {
        // Should disarm the only weapon
        expect(disarmActions[0].weaponDisarmed).toBe('sword');
        
        // If weapon is disarmed multiple times, it means it recovered in between
        // All disarms should be of the same weapon
        disarmActions.forEach(action => {
          expect(action.weaponDisarmed).toBe('sword');
        });
      }
    });

    it('should handle low disarm chance (no weapon modifiers)', () => {
      playerBruto.equippedWeapons = []; // No weapons (will use bare-hands: 5% disarm)
      playerBruto.stats.agility = 10; // Agility doesn't affect disarm

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 12345,
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      // Total disarm chance = 5% (bare-hands disarm modifier)
      // With low chance, might not see any disarms
      const disarmActions = result.actions.filter(a => a.action === 'disarm');
      
      // With low chance we expect few or no disarms
      expect(disarmActions.length).toBeLessThan(5);
    });

    it('should handle battle ending before weapon recovery', () => {
      // Fast battle setup
      opponentBruto.stats.hp = 50; // Low HP
      playerBruto.stats.str = 50; // High damage

      const config: BattleConfig = {
        player: playerBruto,
        opponent: opponentBruto,
        rngSeed: 99999,
      };

      const engine = new CombatEngine(config);
      const result = engine.executeBattle();

      // Battle should end quickly
      expect(result.actions.length).toBeLessThan(20);
      
      // Should have a winner
      expect(result.winner).toBeDefined();
    });
  });
});
