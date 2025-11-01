/**
 * ISkillEffectHandler - Strategy Pattern Interface
 *
 * Base interface for skill effect handlers (OCP improvement).
 * Each handler implements logic for a specific SkillEffectType.
 */

import { IBruto } from '../../../models/Bruto';
import { Skill, SkillEffect } from '../../../models/Skill';
import { CombatModifiers } from '../SkillEffectEngine';

/**
 * Strategy interface for handling skill effects
 */
export interface ISkillEffectHandler {
  /**
   * Check if this handler can process the given effect
   * @param effect - The skill effect to check
   * @returns true if this handler can process the effect
   */
  canHandle(effect: SkillEffect): boolean;

  /**
   * Apply the effect to combat modifiers
   * @param effect - The skill effect to apply
   * @param skill - The skill containing the effect
   * @param bruto - The bruto receiving the effect
   * @param modifiers - The combat modifiers to update (mutated in-place)
   */
  applyCombatEffect(
    effect: SkillEffect,
    skill: Skill,
    bruto: IBruto,
    modifiers: CombatModifiers
  ): void;
}
