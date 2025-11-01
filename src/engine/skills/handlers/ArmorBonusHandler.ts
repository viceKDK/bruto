/**
 * ArmorBonusHandler - Handles ARMOR_BONUS skill effects
 *
 * Strategy Pattern implementation for armor bonus effects.
 * Example skills: Escudo, Armadura skills
 */

import { IBruto } from '../../../models/Bruto';
import { Skill, SkillEffect, SkillEffectType } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';
import { ISkillEffectHandler } from './ISkillEffectHandler';

export class ArmorBonusHandler implements ISkillEffectHandler {
  canHandle(effect: SkillEffect): boolean {
    return effect.type === SkillEffectType.ARMOR_BONUS;
  }

  applyCombatEffect(
    effect: SkillEffect,
    _skill: Skill,
    _bruto: IBruto,
    modifiers: CombatModifiers
  ): void {
    if (effect.value !== undefined) {
      modifiers.armorBonus += effect.value;
    }
  }
}
