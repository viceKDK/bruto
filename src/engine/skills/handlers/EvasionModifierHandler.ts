/**
 * EvasionModifierHandler - Handles EVASION_MODIFIER skill effects
 *
 * Strategy Pattern implementation for evasion modifier effects.
 * Example skills: Esquiva, Agilidad skills
 */

import { IBruto } from '../../../models/Bruto';
import { Skill, SkillEffect, SkillEffectType } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';
import { ISkillEffectHandler } from './ISkillEffectHandler';

export class EvasionModifierHandler implements ISkillEffectHandler {
  canHandle(effect: SkillEffect): boolean {
    return effect.type === SkillEffectType.EVASION_MODIFIER;
  }

  applyCombatEffect(
    effect: SkillEffect,
    _skill: Skill,
    _bruto: IBruto,
    modifiers: CombatModifiers
  ): void {
    if (effect.value !== undefined) {
      modifiers.evasionBonus += effect.value;
    }
  }
}
