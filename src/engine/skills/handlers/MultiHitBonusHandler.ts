/**
 * MultiHitBonusHandler - Handles MULTI_HIT_BONUS skill effects
 *
 * Strategy Pattern implementation for multi-hit bonus effects.
 * Example skills: Golpe Múltiple, Torbellino
 */

import { IBruto } from '../../../models/Bruto';
import { Skill, SkillEffect, SkillEffectType } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';
import { ISkillEffectHandler } from './ISkillEffectHandler';

export class MultiHitBonusHandler implements ISkillEffectHandler {
  canHandle(effect: SkillEffect): boolean {
    return effect.type === SkillEffectType.MULTI_HIT_BONUS;
  }

  applyCombatEffect(
    effect: SkillEffect,
    _skill: Skill,
    _bruto: IBruto,
    modifiers: CombatModifiers
  ): void {
    if (effect.value !== undefined) {
      modifiers.multiHitBonus += effect.value;
    }
  }
}
