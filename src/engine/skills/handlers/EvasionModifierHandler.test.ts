/**
 * EvasionModifierHandler Tests
 * Validates Strategy Pattern implementation for evasion modifier effects
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EvasionModifierHandler } from './EvasionModifierHandler';
import { SkillEffectType } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';
import { IBruto } from '../../../models/Bruto';

describe('EvasionModifierHandler', () => {
  let handler: EvasionModifierHandler;
  let modifiers: CombatModifiers;
  const mockBruto = {} as IBruto;
  const mockSkill = { id: 'test', name: 'Test', effects: [] } as any;

  beforeEach(() => {
    handler = new EvasionModifierHandler();
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

  it('should handle EVASION_MODIFIER effect type', () => {
    const effect = { 
      type: SkillEffectType.EVASION_MODIFIER, 
      timing: 'passive' as any, 
      value: -10 
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

  it('should apply evasion modifier to modifiers', () => {
    const effect = { 
      type: SkillEffectType.EVASION_MODIFIER, 
      timing: 'passive' as any, 
      value: -15 
    };
    handler.applyCombatEffect(effect, mockSkill, mockBruto, modifiers);
    expect(modifiers.evasionBonus).toBe(-15);
  });
});
