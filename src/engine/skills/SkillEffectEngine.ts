/**
 * SkillEffectEngine
 * Interprets and applies skill effects to bruto stats, combat, and progression
 */

import { IBruto } from '../../models/Bruto';
import { Skill, SkillEffect, SkillEffectType, SkillEffectTiming, StatType } from '../../models/Skill';
import { StatContribution, StatMultiplier } from '../StatsCalculator';

export interface SkillStatModifiers {
  flatModifiers: StatContribution[];
  multipliers: StatMultiplier[];
}

export interface ActiveAbility {
  skillId: string;
  skillName: string;
  description: string;
  usesPerCombat: number;
  usesRemaining: number;
  effectType: 'double_damage' | 'guaranteed_crit' | 'heal' | 'special';
  effect: SkillEffect;
}

export interface CombatModifiers {
  damageBonus: number;          // Percentage bonus to damage
  damageReduction: number;      // Percentage damage reduction
  evasionBonus: number;         // Percentage bonus to evasion
  criticalBonus: number;        // Percentage bonus to critical chance
  armorBonus: number;           // Percentage armor bonus
  multiHitBonus: number;        // Percentage bonus to multi-hit chance
  
  // Weapon-specific bonuses
  bluntDamageBonus: number;
  slashDamageBonus: number;
  pierceDamageBonus: number;
  
  // Conditional modifiers
  bluntDamageReduction: number;  // Reduction against blunt weapons
  maxDamagePerHit?: number;      // Cap on damage per hit (e.g., Resistente 20% max HP)
}

export class SkillEffectEngine {
  private static instance: SkillEffectEngine;

  private constructor() {}

  public static getInstance(): SkillEffectEngine {
    if (!SkillEffectEngine.instance) {
      SkillEffectEngine.instance = new SkillEffectEngine();
    }
    return SkillEffectEngine.instance;
  }

  /**
   * Calculate stat modifiers from skills for stat display
   * Returns flat bonuses and percentage multipliers
   */
  public calculateStatModifiers(bruto: IBruto, skills: Skill[]): SkillStatModifiers {
    const flatModifiers: StatContribution[] = [];
    const multipliers: StatMultiplier[] = [];

    skills.forEach(skill => {
      skill.effects.forEach(effect => {
        // Only apply passive effects for stat display
        if (effect.timing === SkillEffectTiming.PASSIVE || effect.timing === SkillEffectTiming.IMMEDIATE) {
          this.applyStatEffect(effect, skill, flatModifiers, multipliers);
        }
      });
    });

    return { flatModifiers, multipliers };
  }

  /**
   * Apply a single stat effect to modifier arrays
   */
  private applyStatEffect(
    effect: SkillEffect,
    skill: Skill,
    flatModifiers: StatContribution[],
    multipliers: StatMultiplier[]
  ): void {
    if (effect.type !== SkillEffectType.STAT_BOOST) {
      return;
    }

    if (!effect.stat || effect.value === undefined) {
      return;
    }

    const statKey = this.mapStatTypeToKey(effect.stat);

    // Flat bonuses
    if (effect.modifier === 'flat') {
      flatModifiers.push({
        key: statKey,
        amount: effect.value,
        source: 'skill',
        description: `${skill.name}: +${effect.value} ${effect.stat.toUpperCase()}`
      });
    }

    // Percentage multipliers
    if (effect.modifier === 'percentage') {
      multipliers.push({
        key: statKey,
        factor: effect.value / 100, // Convert percentage to decimal (50 → 0.5)
        source: 'skill',
        description: `${skill.name}: +${effect.value}% ${effect.stat.toUpperCase()}`
      });
    }

    // Both flat and percentage (apply in correct order)
    if (effect.modifier === 'both') {
      // This shouldn't happen based on current skill design, but handle it
      console.warn(`Skill ${skill.id} has 'both' modifier - should split into separate effects`);
    }
  }

  /**
   * Map StatType enum to actual bruto stat key
   */
  private mapStatTypeToKey(stat: StatType): 'hp' | 'str' | 'speed' | 'agility' | 'resistance' {
    switch (stat) {
      case StatType.HP:
        return 'hp';
      case StatType.STR:
        return 'str';
      case StatType.SPEED:
        return 'speed';
      case StatType.AGILITY:
        return 'agility';
      case StatType.RESISTANCE:
        return 'resistance';
      default:
        return 'str'; // Fallback
    }
  }

  /**
   * Calculate combat modifiers from skills
   * Returns damage bonuses, resistances, evasion bonuses, etc.
   */
  public calculateCombatModifiers(bruto: IBruto, skills: Skill[]): CombatModifiers {
    const modifiers: CombatModifiers = {
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

    skills.forEach(skill => {
      skill.effects.forEach(effect => {
        this.applyCombatEffect(effect, skill, bruto, modifiers);
      });
    });

    return modifiers;
  }

  /**
   * Apply a single combat effect to modifiers
   */
  private applyCombatEffect(
    effect: SkillEffect,
    skill: Skill,
    bruto: IBruto,
    modifiers: CombatModifiers
  ): void {
    switch (effect.type) {
      case SkillEffectType.ARMOR_BONUS:
        if (effect.value !== undefined) {
          modifiers.armorBonus += effect.value;
        }
        break;

      case SkillEffectType.EVASION_MODIFIER:
        if (effect.value !== undefined) {
          modifiers.evasionBonus += effect.value;
        }
        break;

      case SkillEffectType.CRITICAL_BONUS:
        if (effect.value !== undefined) {
          modifiers.criticalBonus += effect.value;
        }
        break;

      case SkillEffectType.DAMAGE_MODIFIER:
        if (effect.value !== undefined) {
          // Check if it's a damage type modifier
          if (effect.damageType === 'blunt') {
            if (effect.target === 'self') {
              // Damage reduction against blunt
              modifiers.bluntDamageReduction += Math.abs(effect.value);
            } else {
              // Damage bonus with blunt
              modifiers.bluntDamageBonus += effect.value;
            }
          } else if (effect.damageType === 'slash') {
            modifiers.slashDamageBonus += effect.value;
          } else if (effect.damageType === 'pierce') {
            modifiers.pierceDamageBonus += effect.value;
          } else {
            // General damage modifier
            modifiers.damageBonus += effect.value;
          }

          // Check for max damage cap (Resistente skill)
          if (effect.description?.includes('20%')) {
            modifiers.maxDamagePerHit = bruto.maxHp * 0.2;
          }
        }
        break;

      case SkillEffectType.MULTI_HIT_BONUS:
        if (effect.value !== undefined) {
          modifiers.multiHitBonus += effect.value;
        }
        break;
    }
  }

  /**
   * Get active abilities available in combat
   */
  public getActiveAbilities(bruto: IBruto, skills: Skill[]): ActiveAbility[] {
    const abilities: ActiveAbility[] = [];

    skills.forEach(skill => {
      skill.effects.forEach(effect => {
        if (effect.type === SkillEffectType.SPECIAL_ABILITY && effect.usesPerCombat) {
          let usesPerCombat = effect.usesPerCombat;

          // Calculate scaling uses (e.g., Fuerza Bruta: +1 use per 30 STR)
          if (effect.scalesWithStat && effect.scalingThreshold) {
            const statValue = this.getBrutoStatValue(bruto, effect.scalesWithStat);
            const bonusUses = Math.floor(statValue / effect.scalingThreshold);
            usesPerCombat += bonusUses;
          }

          abilities.push({
            skillId: skill.id,
            skillName: skill.name,
            description: effect.description || skill.description,
            usesPerCombat,
            usesRemaining: usesPerCombat,
            effectType: this.determineEffectType(effect, skill),
            effect
          });
        }
      });
    });

    return abilities;
  }

  /**
   * Get bruto stat value by StatType
   */
  private getBrutoStatValue(bruto: IBruto, stat: StatType): number {
    switch (stat) {
      case StatType.STR:
        return bruto.str;
      case StatType.SPEED:
        return bruto.speed;
      case StatType.AGILITY:
        return bruto.agility;
      case StatType.RESISTANCE:
        return bruto.resistance;
      case StatType.HP:
        return bruto.hp;
      default:
        return 0;
    }
  }

  /**
   * Determine ability effect type from effect data
   */
  private determineEffectType(effect: SkillEffect, skill: Skill): ActiveAbility['effectType'] {
    if (skill.id === 'fuerza_bruta') {
      return 'double_damage';
    }
    if (skill.id === 'pocion_tragica') {
      return 'heal';
    }
    if (effect.description?.toLowerCase().includes('crítico') || 
        effect.description?.toLowerCase().includes('critical')) {
      return 'guaranteed_crit';
    }
    return 'special';
  }

  /**
   * Calculate level-up bonuses from skills
   * Returns the bonus amount for a specific stat when leveling up
   */
  public getLevelUpBonus(skills: Skill[], stat: StatType, isSplit: boolean = false): number {
    let baseBonus = isSplit ? 1 : 2; // Default: 2 for full, 1 for split
    let totalBonus = baseBonus;

    skills.forEach(skill => {
      skill.effects.forEach(effect => {
        if (effect.type === SkillEffectType.LEVEL_UP_BONUS && effect.stat === stat) {
          // Check condition matches
          const conditionMatch = this.checkLevelUpCondition(effect.condition, stat, isSplit);
          if (conditionMatch && effect.value !== undefined) {
            if (effect.modifier === 'percentage') {
              // Percentage bonus (e.g., +150% means 2 → 5)
              totalBonus = baseBonus * (1 + effect.value / 100);
            } else {
              // Flat bonus (e.g., 2 → 3)
              totalBonus = effect.value;
            }
          }
        }
      });
    });

    return Math.round(totalBonus);
  }

  /**
   * Check if level-up condition matches
   */
  private checkLevelUpCondition(condition: string | undefined, stat: StatType, isSplit: boolean): boolean {
    if (!condition) {
      return true;
    }

    const conditionLower = condition.toLowerCase();
    const statName = stat.toLowerCase();
    
    if (conditionLower.includes('full') || conditionLower.includes('completo')) {
      return !isSplit;
    }
    if (conditionLower.includes('split') || conditionLower.includes('dividido')) {
      return isSplit;
    }
    
    // Check if condition mentions the stat (e.g., "when_choosing_STR" matches StatType.STR)
    if (conditionLower.includes(statName) || conditionLower.includes('choosing')) {
      return true;
    }

    return false;
  }

  /**
   * Apply immediate effects when skill is acquired
   * Modifies bruto stats directly (should be persisted to DB)
   */
  public applyImmediateEffects(bruto: IBruto, skill: Skill): IBruto {
    const modifiedBruto = { ...bruto };

    skill.effects.forEach(effect => {
      if (effect.timing === SkillEffectTiming.IMMEDIATE && effect.type === SkillEffectType.STAT_BOOST) {
        if (!effect.stat || effect.value === undefined) {
          return;
        }

        const statKey = this.mapStatTypeToKey(effect.stat);
        
        if (effect.modifier === 'flat') {
          // Apply flat bonus
          modifiedBruto[statKey] = (modifiedBruto[statKey] as number) + effect.value;
        } else if (effect.modifier === 'percentage') {
          // Apply percentage bonus
          modifiedBruto[statKey] = (modifiedBruto[statKey] as number) * (1 + effect.value / 100);
        }

        // Special case for resistance → HP conversion (1 resistance = 6 HP)
        if (statKey === 'resistance') {
          const hpBonus = effect.value * 6;
          modifiedBruto.hp += hpBonus;
          modifiedBruto.maxHp += hpBonus;
        }
      }
    });

    return modifiedBruto;
  }
}

// Export singleton instance
export const skillEffectEngine = SkillEffectEngine.getInstance();
