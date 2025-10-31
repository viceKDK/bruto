/**
 * PassiveSkillCombatService - Story 6.4
 * Integrates passive skill effects into combat calculations
 * 
 * Responsibilities:
 * - Query SkillEffectEngine for combat modifiers
 * - Provide DamageModifiers for DamageCalculator
 * - Apply armor bonuses (Piel Dura, Esqueleto de Plomo)
 * - Apply evasion modifiers (Reflejos Felinos, Esqueleto penalties)
 * - Weapon-specific bonuses (Maestro de Espadas) - Epic 5 integration point
 * - Damage type resistances - Future epic integration
 */

import { IBruto } from '../../models/Bruto';
import { SkillEffectEngine } from '../skills/SkillEffectEngine';
import { SkillCatalog } from '../skills/SkillCatalog';
import { DamageModifiers } from './DamageCalculator';

export class PassiveSkillCombatService {
  private static instance: PassiveSkillCombatService;
  private effectEngine: SkillEffectEngine;

  private constructor() {
    this.effectEngine = SkillEffectEngine.getInstance();
  }

  public static getInstance(): PassiveSkillCombatService {
    if (!PassiveSkillCombatService.instance) {
      PassiveSkillCombatService.instance = new PassiveSkillCombatService();
    }
    return PassiveSkillCombatService.instance;
  }

  /**
   * Get combat modifiers for attacker
   * Includes damage bonuses, crit chance, weapon mastery
   */
  public getAttackerModifiers(bruto: IBruto, weaponType?: string): DamageModifiers {
    const skills = this.getOwnedSkills(bruto);
    const combatMods = this.effectEngine.calculateCombatModifiers(bruto, skills);

    const modifiers: DamageModifiers = {
      skillDamageBonus: combatMods.damageBonus,
      critChanceBonus: combatMods.criticalBonus,
      multiHitChance: combatMods.multiHitBonus,
    };

    // Epic 5 integration point: Weapon-specific bonuses
    // Example: Maestro de Espadas (+20% damage with swords)
    if (weaponType) {
      const weaponBonus = this.getWeaponMasteryBonus(skills, weaponType);
      if (weaponBonus > 0) {
        modifiers.skillDamageBonus = (modifiers.skillDamageBonus || 0) + weaponBonus;
      }
    }

    return modifiers;
  }

  /**
   * Get combat modifiers for defender
   * Includes armor bonuses and evasion modifiers
   */
  public getDefenderModifiers(bruto: IBruto): DamageModifiers {
    const skills = this.getOwnedSkills(bruto);
    const combatMods = this.effectEngine.calculateCombatModifiers(bruto, skills);

    return {
      armorBonus: combatMods.armorBonus,
      evasionBonus: combatMods.evasionBonus,
    };
  }

  /**
   * Get owned skills from bruto's skill IDs
   * Filters out null/undefined skills
   */
  private getOwnedSkills(bruto: IBruto) {
    if (!bruto.skills || bruto.skills.length === 0) {
      return [];
    }

    const catalog = SkillCatalog.getInstance();
    const skills = bruto.skills
      .map(id => catalog.getSkillById(id))
      .filter((skill): skill is NonNullable<typeof skill> => skill !== null && skill !== undefined);
    
    return skills;
  }

  /**
   * Calculate weapon mastery bonus for specific weapon type
   * Epic 5 integration point - requires weapon type system
   * 
   * Examples:
   * - Maestro de Espadas: +20% damage with swords
   * - Future: Hacha Mortal (+25% crit with axes)
   */
  private getWeaponMasteryBonus(skills: ReturnType<typeof this.getOwnedSkills>, weaponType: string): number {
    let bonus = 0;

    for (const skill of skills) {
      // Maestro de Espadas: +20% damage only with swords
      if (skill.id === 'maestro_espadas' && weaponType === 'sword') {
        const weaponEffect = skill.effects.find(
          (e) => e.type === 'damage_modifier' && e.weaponType === 'sword'
        );
        if (weaponEffect && weaponEffect.value) {
          bonus += weaponEffect.value;
        }
      }

      // Future weapon mastery skills can be added here
    }

    return bonus;
  }

  /**
   * Check if damage type resistances apply
   * Future epic integration point
   * 
   * Example: "Resistencia al Fuego" reduces fire damage by 50%
   */
  public getDamageTypeResistance(bruto: IBruto, damageType: string): number {
    const skills = this.getOwnedSkills(bruto);
    
    for (const skill of skills) {
      const resistance = skill.effects.find(
        (e) => e.type === 'resistance_change' && e.damageType === damageType
      );
      
      if (resistance && resistance.value) {
        return resistance.value;
      }
    }

    return 0;
  }
}
