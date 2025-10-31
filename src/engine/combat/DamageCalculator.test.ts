import { describe, expect, it, beforeEach } from 'vitest';
import { DamageCalculator, DamageModifiers } from './DamageCalculator';
import { IBrutoCombatant } from '../../models/Bruto';

const createCombatant = (overrides: Partial<IBrutoCombatant> = {}): IBrutoCombatant => ({
  id: 'bruto-1',
  name: 'TestBruto',
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

describe('DamageCalculator', () => {
  let calculator: DamageCalculator;

  beforeEach(() => {
    calculator = new DamageCalculator();
  });

  describe('calculateBaseDamage', () => {
    it('returns STR value as base damage per GDD', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 15, speed: 5, agility: 3, resistance: 2 } });
      const damage = calculator.calculateBaseDamage(attacker);
      expect(damage).toBe(15);
    });

    it('handles STR = 0 edge case', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 0, speed: 5, agility: 3, resistance: 2 } });
      const damage = calculator.calculateBaseDamage(attacker);
      expect(damage).toBe(0);
    });

    it('applies weapon damage modifier when provided', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 2 } });
      const modifiers: DamageModifiers = { weaponDamage: 5 };
      const damage = calculator.calculateBaseDamage(attacker, modifiers);
      expect(damage).toBe(15); // 10 STR + 5 weapon
    });

    it('applies skill damage bonus when provided', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 2 } });
      const modifiers: DamageModifiers = { skillDamageBonus: 3 };
      const damage = calculator.calculateBaseDamage(attacker, modifiers);
      expect(damage).toBe(13); // 10 STR + 3 skill
    });

    it('applies both weapon and skill modifiers', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 2 } });
      const modifiers: DamageModifiers = { weaponDamage: 5, skillDamageBonus: 3 };
      const damage = calculator.calculateBaseDamage(attacker, modifiers);
      expect(damage).toBe(18); // 10 + 5 + 3
    });

    it('never returns negative damage', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 0, speed: 5, agility: 3, resistance: 2 } });
      const damage = calculator.calculateBaseDamage(attacker);
      expect(damage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculatePhysicalDamage', () => {
    it('calculates damage with resistance reduction', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 20, speed: 5, agility: 3, resistance: 2 } });
      const defender = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 10 } }); // 10% reduction

      const result = calculator.calculatePhysicalDamage(attacker, defender);

      expect(result.raw).toBe(20);
      expect(result.final).toBeLessThan(20); // Reduced by resistance
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    it('caps resistance reduction at 75%', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 100, speed: 5, agility: 3, resistance: 2 } });
      const defender = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 100 } }); // Would be 100% without cap

      const result = calculator.calculatePhysicalDamage(attacker, defender);

      // Maximum 75% reduction means 25% damage gets through
      expect(result.final).toBeGreaterThan(0);
      expect(result.final).toBe(Math.floor(100 * 0.25)); // 25 damage
    });

    it('handles zero resistance', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 50, speed: 5, agility: 3, resistance: 2 } });
      const defender = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 0 } });

      const result = calculator.calculatePhysicalDamage(attacker, defender);

      expect(result.raw).toBe(50);
      expect(result.final).toBe(50); // No reduction
    });

    it('provides detailed breakdown', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 30, speed: 5, agility: 3, resistance: 2 } });
      const defender = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 3, resistance: 20 } });

      const result = calculator.calculatePhysicalDamage(attacker, defender);

      expect(result.breakdown.join(' ')).toContain('Base');
      expect(result.breakdown.join(' ')).toContain('Resistance');
      expect(result.breakdown.join(' ')).toContain('Final');
      expect(result.breakdown.length).toBeGreaterThan(0);
    });
  });

  describe('applyCriticalMultiplier', () => {
    it('doubles damage for critical hit per GDD', () => {
      const damage = 50;
      const critDamage = calculator.applyCriticalMultiplier(damage);
      expect(critDamage).toBe(100);
    });

    it('floors fractional results', () => {
      const damage = 15;
      const critDamage = calculator.applyCriticalMultiplier(damage);
      expect(critDamage).toBe(30);
    });

    it('handles zero damage', () => {
      const damage = 0;
      const critDamage = calculator.applyCriticalMultiplier(damage);
      expect(critDamage).toBe(0);
    });
  });

  describe('calculateCritChance', () => {
    it('returns 10% base crit chance', () => {
      const attacker = createCombatant();
      const critChance = calculator.calculateCritChance(attacker);
      expect(critChance).toBe(0.1);
    });

    it('applies crit chance bonus from modifiers', () => {
      const attacker = createCombatant();
      const modifiers: DamageModifiers = { critChanceBonus: 0.15 }; // +15%
      const critChance = calculator.calculateCritChance(attacker, modifiers);
      expect(critChance).toBe(0.25); // 10% + 15%
    });

    it('caps crit chance at 95%', () => {
      const attacker = createCombatant();
      const modifiers: DamageModifiers = { critChanceBonus: 1.0 }; // +100%
      const critChance = calculator.calculateCritChance(attacker, modifiers);
      expect(critChance).toBe(0.95); // Capped
    });
  });

  describe('calculateCritMultiplier', () => {
    it('returns 2x base multiplier', () => {
      const attacker = createCombatant();
      const multiplier = calculator.calculateCritMultiplier(attacker);
      expect(multiplier).toBe(2.0);
    });
  });

  describe('getDodgeChance', () => {
    it('calculates dodge as Agility × 0.1 per GDD', () => {
      const defender: IBrutoCombatant = {
        id: 'def-1',
        name: 'Defender',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 10, resistance: 2 },
      };
      const dodgeChance = calculator.getDodgeChance(defender);
      // 10 agility would be 100% but caps at 95%
      expect(dodgeChance).toBe(0.95);
    });

    it('handles high agility', () => {
      const defender: IBrutoCombatant = {
        id: 'def-1',
        name: 'Defender',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 5, resistance: 2 },
      };
      const dodgeChance = calculator.getDodgeChance(defender);
      expect(dodgeChance).toBeCloseTo(0.5, 2); // 5 agility = 50%
    });

    it('caps dodge at 95%', () => {
      const defender: IBrutoCombatant = {
        id: 'def-1',
        name: 'Defender',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 100, resistance: 2 },
      };
      const dodgeChance = calculator.getDodgeChance(defender);
      expect(dodgeChance).toBe(0.95); // Capped at 95%
    });

    it('handles zero agility', () => {
      const defender: IBrutoCombatant = {
        id: 'def-1',
        name: 'Defender',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 0, resistance: 2 },
      };
      const dodgeChance = calculator.getDodgeChance(defender);
      expect(dodgeChance).toBe(0);
    });
  });

  describe('calculateMultiHitChance', () => {
    it('calculates multi-hit from Speed stat', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 10, agility: 3, resistance: 2 } });
      const multiHitChance = calculator.calculateMultiHitChance(attacker);
      expect(multiHitChance).toBe(0.2); // 10 speed × 0.02 = 20%
    });

    it('applies multi-hit bonus from modifiers', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 10, agility: 3, resistance: 2 } });
      const modifiers: DamageModifiers = { multiHitChance: 0.1 }; // +10%
      const multiHitChance = calculator.calculateMultiHitChance(attacker, modifiers);
      expect(multiHitChance).toBeCloseTo(0.3, 5); // 20% + 10%
    });

    it('caps multi-hit at 50%', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 50, agility: 3, resistance: 2 } });
      const multiHitChance = calculator.calculateMultiHitChance(attacker);
      expect(multiHitChance).toBe(0.5); // Capped at 50%
    });

    it('handles zero speed', () => {
      const attacker = createCombatant({ stats: { hp: 100, maxHp: 100, str: 10, speed: 0, agility: 3, resistance: 2 } });
      const multiHitChance = calculator.calculateMultiHitChance(attacker);
      expect(multiHitChance).toBe(0);
    });
  });

  describe('calculateWeaponTriggerChance', () => {
    it('returns 0% for Epic 5 stub', () => {
      const attacker = createCombatant();
      const triggerChance = calculator.calculateWeaponTriggerChance(attacker);
      expect(triggerChance).toBe(0);
    });
  });

  describe('calculateSkillActivationChance', () => {
    it('returns 0% for Epic 6 stub', () => {
      const attacker = createCombatant();
      const activationChance = calculator.calculateSkillActivationChance(attacker);
      expect(activationChance).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('calculates complete attack sequence', () => {
      const attacker = createCombatant({
        name: 'Attacker',
        stats: { hp: 100, maxHp: 100, str: 25, speed: 8, agility: 3, resistance: 2 },
      });
      const defender = createCombatant({
        name: 'Defender',
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 6, resistance: 15 },
      });

      const damageResult = calculator.calculatePhysicalDamage(attacker, defender);
      const critChance = calculator.calculateCritChance(attacker);
      const dodgeChance = calculator.getDodgeChance(defender);

      expect(damageResult.raw).toBe(25);
      expect(damageResult.final).toBeLessThan(25); // Reduced by resistance
      expect(critChance).toBe(0.1); // Base 10%
      expect(dodgeChance).toBeCloseTo(0.6, 1); // 6 agility = 60%
    });

    it('handles high-damage low-resistance scenario', () => {
      const attacker = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 100, speed: 5, agility: 3, resistance: 2 },
      });
      const defender = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 10, speed: 5, agility: 0, resistance: 0 },
      });

      const damageResult = calculator.calculatePhysicalDamage(attacker, defender);
      expect(damageResult.final).toBe(100); // No mitigation
    });

    it('handles balanced combatants', () => {
      const attacker = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 20, speed: 8, agility: 5, resistance: 10 },
      });
      const defender = createCombatant({
        stats: { hp: 100, maxHp: 100, str: 20, speed: 8, agility: 5, resistance: 10 },
      });

      const damageResult = calculator.calculatePhysicalDamage(attacker, defender);
      expect(damageResult.final).toBeGreaterThan(0);
      expect(damageResult.final).toBeLessThan(20);
    });
  });
});
