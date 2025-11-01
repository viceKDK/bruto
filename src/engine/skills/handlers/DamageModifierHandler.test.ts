/**
 * DamageModifierHandler Tests
 * Validates Strategy Pattern implementation for damage modifier effects
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DamageModifierHandler } from './DamageModifierHandler';
import { SkillEffectType } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';
import { IBruto } from '../../../models/Bruto';

describe('DamageModifierHandler', () => {
  let handler: DamageModifierHandler;
  let modifiers: CombatModifiers;
  const mockBruto = { maxHp: 100 } as IBruto;
  const mockSkill = { id: 'test', name: 'Test', effects: [] } as any;

  beforeEach(() => {
    handler = new DamageModifierHandler();
    modifiers = {
      damageBonus: 0,
      damageReduction: 0,
      evasionBonus: 0,
      criticalBonus: 0,
      armorBonus: 0,
      multiHitBonus: 0,
      bluntDamageBonus: 0,
      slashDamageBonus: 0,
      pierceDamageBonus: 0,
      bluntDamageReduction: 0
    };
  });

  it('should handle DAMAGE_MODIFIER effect type', () => {
    const effect = { 
      type: SkillEffectType.DAMAGE_MODIFIER, 
      timing: 'passive' as any, 
      value: 10 
    };
    expect(handler.canHandle(effect)).toBe(true);
  });

  it('should not handle other effect types', () => {
    const effect = { 
      type: SkillEffectType.ARMOR_BONUS, 
      timing: 'passive' as any, 
      value: 10 
    };
    expect(handler.canHandle(effect)).toBe(false);
  });

  it('should apply general damage bonus', () => {
    const effect = { 
      type: SkillEffectType.DAMAGE_MODIFIER, 
      timing: 'passive' as any, 
      value: 15 
    };
    handler.applyCombatEffect(effect, mockSkill, mockBruto, modifiers);
    expect(modifiers.damageBonus).toBe(15);
  });

  it('should apply blunt damage bonus', () => {
    const effect = { 
      type: SkillEffectType.DAMAGE_MODIFIER, 
      timing: 'passive' as any, 
      value: 20,
      damageType: 'blunt' as any
    };
    handler.applyCombatEffect(effect, mockSkill, mockBruto, modifiers);
    expect(modifiers.bluntDamageBonus).toBe(20);
  });

  it('should apply slash damage bonus', () => {
    const effect = { 
      type: SkillEffectType.DAMAGE_MODIFIER, 
      timing: 'passive' as any, 
      value: 12,
      damageType: 'slash' as any
    };
    handler.applyCombatEffect(effect, mockSkill, mockBruto, modifiers);
    expect(modifiers.slashDamageBonus).toBe(12);
  });

  it('should apply pierce damage bonus', () => {
    const effect = { 
      type: SkillEffectType.DAMAGE_MODIFIER, 
      timing: 'passive' as any, 
      value: 18,
      damageType: 'pierce' as any
    };
    handler.applyCombatEffect(effect, mockSkill, mockBruto, modifiers);
    expect(modifiers.pierceDamageBonus).toBe(18);
  });

  it('should apply blunt damage reduction when target is self', () => {
    const effect = { 
      type: SkillEffectType.DAMAGE_MODIFIER, 
      timing: 'passive' as any, 
      value: -15,
      damageType: 'blunt' as any,
      target: 'self' as any
    };
    handler.applyCombatEffect(effect, mockSkill, mockBruto, modifiers);
    expect(modifiers.bluntDamageReduction).toBe(15); // Absolute value
  });

  it('should set max damage cap when description contains 20%', () => {
    const effect = { 
      type: SkillEffectType.DAMAGE_MODIFIER, 
      timing: 'passive' as any, 
      value: 0,
      description: 'Reduce incoming damage to max 20% of HP'
    };
    handler.applyCombatEffect(effect, mockSkill, mockBruto, modifiers);
    expect(modifiers.maxDamagePerHit).toBe(20); // 100 * 0.2
  });
});
