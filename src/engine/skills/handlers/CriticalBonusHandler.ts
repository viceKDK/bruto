/**
 * CriticalBonusHandler - Handles CRITICAL_BONUS skill effects
 *
 * Strategy Pattern implementation for critical chance bonus effects.
 * Example skills: Golpe Crítico, Instinto Asesino
 */

import { IBruto } from '../../../models/Bruto';
import { Skill, SkillEffect, SkillEffectType } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';
import { ISkillEffectHandler } from './ISkillEffectHandler';

export class CriticalBonusHandler implements ISkillEffectHandler {
  canHandle(effect: SkillEffect): boolean {
    return effect.type === SkillEffectType.CRITICAL_BONUS;
  }

  applyCombatEffect(
    effect: SkillEffect,
    _skill: Skill,
    _bruto: IBruto,
    modifiers: CombatModifiers
  ): void {
    if (effect.value !== undefined) {
      modifiers.criticalBonus += effect.value;
    }
  }
}
