/**
 * ActiveAbilityManager - Story 6.5
 * Manages active ability state during combat (uses, cooldowns, availability)
 * 
 * Responsibilities:
 * - Initialize ability uses at battle start
 * - Track ability state (uses remaining)
 * - Calculate dynamic uses (Fuerza Bruta scales with STR)
 * - Reset abilities between battles
 * - Validate ability availability
 */

import { IBruto, IBrutoCombatant } from '../../models/Bruto';
import { SkillCatalog } from '../skills/SkillCatalog';

/**
 * Active ability with usage tracking
 */
export interface ActiveAbility {
  skillId: string;
  name: string;
  maxUses: number;
  usesRemaining: number;
  effectType: 'damage_multiplier' | 'heal' | 'buff' | 'special';
  description: string;
}

/**
 * Ability state for one combatant during battle
 */
export interface AbilityState {
  abilities: ActiveAbility[];
}

export class ActiveAbilityManager {
  private playerAbilities: AbilityState = { abilities: [] };
  private opponentAbilities: AbilityState = { abilities: [] };

  /**
   * Initialize abilities for both combatants at battle start
   * Accepts both IBruto and IBrutoCombatant for flexibility
   */
  public initializeBattle(player: IBruto | IBrutoCombatant, opponent: IBruto | IBrutoCombatant): void {
    this.playerAbilities = this.initializeAbilitiesForBruto(player);
    this.opponentAbilities = this.initializeAbilitiesForBruto(opponent);
  }

  /**
   * Initialize abilities for a single bruto based on owned skills
   */
  private initializeAbilitiesForBruto(bruto: IBruto | IBrutoCombatant): AbilityState {
    const abilities: ActiveAbility[] = [];
    
    if (!bruto.skills || bruto.skills.length === 0) {
      return { abilities };
    }

    const catalog = SkillCatalog.getInstance();

    // Check for Fuerza Bruta (STR-scaling damage multiplier)
    if (bruto.skills.includes('fuerza_bruta')) {
      const skill = catalog.getSkillById('fuerza_bruta');
      if (skill) {
        const maxUses = this.calculateFuerzaBrutaUses(bruto.str);
        abilities.push({
          skillId: 'fuerza_bruta',
          name: skill.name,
          maxUses,
          usesRemaining: maxUses,
          effectType: 'damage_multiplier',
          description: 'Double damage on next attack',
        });
      }
    }

    // Check for Poción Trágica (one-time heal)
    if (bruto.skills.includes('pocion_tragica')) {
      const skill = catalog.getSkillById('pocion_tragica');
      if (skill) {
        abilities.push({
          skillId: 'pocion_tragica',
          name: skill.name,
          maxUses: 1,
          usesRemaining: 1,
          effectType: 'heal',
          description: 'Heal 25-50% max HP once',
        });
      }
    }

    return { abilities };
  }

  /**
   * Calculate Fuerza Bruta uses based on STR
   * Formula: Math.floor(STR / 30) + 1
   * 
   * Examples:
   * - STR 0-29: 1 use
   * - STR 30-59: 2 uses
   * - STR 60-89: 3 uses
   */
  private calculateFuerzaBrutaUses(str: number): number {
    return Math.floor(str / 30) + 1;
  }

  /**
   * Get available abilities for a side (player or opponent)
   */
  public getAvailableAbilities(side: 'player' | 'opponent'): ActiveAbility[] {
    const state = side === 'player' ? this.playerAbilities : this.opponentAbilities;
    return state.abilities.filter(ability => ability.usesRemaining > 0);
  }

  /**
   * Use an ability (decrement uses)
   */
  public useAbility(side: 'player' | 'opponent', skillId: string): boolean {
    const state = side === 'player' ? this.playerAbilities : this.opponentAbilities;
    const ability = state.abilities.find(a => a.skillId === skillId);

    if (!ability || ability.usesRemaining <= 0) {
      return false;
    }

    ability.usesRemaining--;
    return true;
  }

  /**
   * Check if ability is available
   */
  public isAbilityAvailable(side: 'player' | 'opponent', skillId: string): boolean {
    const state = side === 'player' ? this.playerAbilities : this.opponentAbilities;
    const ability = state.abilities.find(a => a.skillId === skillId);
    return ability ? ability.usesRemaining > 0 : false;
  }

  /**
   * Get specific ability by skill ID
   */
  public getAbility(side: 'player' | 'opponent', skillId: string): ActiveAbility | undefined {
    const state = side === 'player' ? this.playerAbilities : this.opponentAbilities;
    return state.abilities.find(a => a.skillId === skillId);
  }

  /**
   * Reset all abilities (for new battle)
   */
  public reset(): void {
    this.playerAbilities = { abilities: [] };
    this.opponentAbilities = { abilities: [] };
  }

  /**
   * Get ability state for debugging/testing
   */
  public getAbilityState(side: 'player' | 'opponent'): AbilityState {
    return side === 'player' ? this.playerAbilities : this.opponentAbilities;
  }
}
