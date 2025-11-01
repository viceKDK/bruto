/**
 * DamageModifierHandler - Handles DAMAGE_MODIFIER skill effects
 *
 * Strategy Pattern implementation for damage modifier effects.
 * Supports general damage modifiers and specific damage type modifiers
 * (blunt, slash, pierce).
 *
 * Example skills: Fuerza, Debilidad, Resistencia skills
 */

import { IBruto } from '../../../models/Bruto';
import { Skill, SkillEffect, SkillEffectType } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';
import { ISkillEffectHandler } from './ISkillEffectHandler';

export class DamageModifierHandler implements ISkillEffectHandler {
  canHandle(effect: SkillEffect): boolean {
    return effect.type === SkillEffectType.DAMAGE_MODIFIER;
  }

  applyCombatEffect(
    effect: SkillEffect,
    _skill: Skill,
    bruto: IBruto,
    modifiers: CombatModifiers
  ): void {
    if (effect.value === undefined) {
      return;
    }

    // Check if this is a specific damage type modifier
    if (effect.damageType === 'blunt') {
      if (effect.target === 'self') {
        // Damage reduction against blunt (e.g., Resistente skill)
        modifiers.bluntDamageReduction += Math.abs(effect.value);
      } else {
        // Damage bonus with blunt weapons
        modifiers.bluntDamageBonus += effect.value;
      }
    } else if (effect.damageType === 'slash') {
      modifiers.slashDamageBonus += effect.value;
    } else if (effect.damageType === 'pierce') {
      modifiers.pierceDamageBonus += effect.value;
    } else {
      // General damage modifier (applies to all damage types)
      modifiers.damageBonus += effect.value;
    }

    // Check for max damage cap (Resistente skill - 20% max HP)
    if (effect.description?.includes('20%')) {
      modifiers.maxDamagePerHit = bruto.maxHp * 0.2;
    }
  }
}
