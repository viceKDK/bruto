/**
 * CombatAbilityService - Handles active ability processing (SRP improvement)
 *
 * Extracted from CombatEngine to follow Single Responsibility Principle.
 * Manages healing abilities, damage abilities, and ability availability checks.
 */

import { IBrutoCombatant } from '../../models/Bruto';
import { CombatAction } from '../../models/Battle';
import { CombatSide } from './CombatStateMachine';
import { ActiveAbilityManager } from './ActiveAbilityManager';
import { ActiveAbilityEffects } from './ActiveAbilityEffects';
import { POCION_TRAGICA_USE_THRESHOLD } from '../../utils/constants';

export interface HealingResult {
  healed: boolean;
  healAmount: number;
  action?: CombatAction;
}

export interface DamageAbilityResult {
  abilityUsed: boolean;
  damageMultiplier: number;
  action?: CombatAction;
}

export interface ICombatAbilityService {
  /**
   * Check and apply healing abilities if conditions are met
   * @param side - The combatant's side (player or opponent)
   * @param combatant - The combatant to heal
   * @param currentHp - Current HP of the combatant
   * @param turnNumber - Current turn number for logging
   * @param playerHp - Current player HP for action log
   * @param opponentHp - Current opponent HP for action log
   * @returns Healing result with updated HP and action log
   */
  checkHealingAbility(
    side: CombatSide,
    combatant: IBrutoCombatant,
    currentHp: number,
    turnNumber: number,
    playerHp: number,
    opponentHp: number
  ): HealingResult;

  /**
   * Check and apply damage abilities (Fuerza Bruta)
   * @param side - The attacker's side
   * @param turnNumber - Current turn number for logging
   * @param playerHp - Current player HP for action log
   * @param opponentHp - Current opponent HP for action log
   * @returns Damage ability result with multiplier and action log
   */
  checkDamageAbility(
    side: CombatSide,
    turnNumber: number,
    playerHp: number,
    opponentHp: number
  ): DamageAbilityResult;
}

/**
 * Manages active abilities during combat (healing, damage boosts)
 */
export class CombatAbilityService implements ICombatAbilityService {
  constructor(
    private abilityManager: ActiveAbilityManager,
    private abilityEffects: ActiveAbilityEffects
  ) {}

  /**
   * Check and apply healing abilities (Poción Trágica)
   * Story 6.5: Active ability integration
   */
  public checkHealingAbility(
    side: CombatSide,
    combatant: IBrutoCombatant,
    currentHp: number,
    turnNumber: number,
    playerHp: number,
    opponentHp: number
  ): HealingResult {
    const pocionTragicaId = 'pocion_tragica';

    if (!this.abilityManager.isAbilityAvailable(side, pocionTragicaId)) {
      return { healed: false, healAmount: 0 };
    }

    const maxHp = combatant.stats.maxHp || combatant.stats.hp;

    // Only use if HP is below threshold (strategic AI decision)
    const hpPercent = currentHp / maxHp;
    if (hpPercent > POCION_TRAGICA_USE_THRESHOLD) {
      return { healed: false, healAmount: 0 }; // Don't waste heal at high HP
    }

    // Apply healing
    const healResult = this.abilityEffects.applyPocionTragica(currentHp, maxHp);

    if (healResult.healAmount && healResult.healAmount > 0) {
      const newHp = Math.min(currentHp + healResult.healAmount, maxHp);

      this.abilityManager.useAbility(side, pocionTragicaId);

      const action: CombatAction = {
        turn: turnNumber,
        attacker: side,
        action: 'heal',
        healAmount: healResult.healAmount,
        abilityUsed: 'pocion_tragica',
        hpRemaining: {
          player: side === 'player' ? newHp : playerHp,
          opponent: side === 'opponent' ? newHp : opponentHp,
        },
      };

      return {
        healed: true,
        healAmount: healResult.healAmount,
        action,
      };
    }

    return { healed: false, healAmount: 0 };
  }

  /**
   * Check and apply damage abilities (Fuerza Bruta)
   * Story 6.5: Active ability integration
   */
  public checkDamageAbility(
    side: CombatSide,
    turnNumber: number,
    playerHp: number,
    opponentHp: number
  ): DamageAbilityResult {
    const fuerzaBrutaId = 'fuerza_bruta';

    if (!this.abilityManager.isAbilityAvailable(side, fuerzaBrutaId)) {
      return { abilityUsed: false, damageMultiplier: 1.0 };
    }

    const abilityEffect = this.abilityEffects.applyFuerzaBruta();
    const multiplier = abilityEffect.damageMultiplier || 1.0;

    this.abilityManager.useAbility(side, fuerzaBrutaId);

    const action: CombatAction = {
      turn: turnNumber,
      attacker: side,
      action: 'ability',
      damage: 0,
      abilityUsed: 'fuerza_bruta',
      hpRemaining: {
        player: playerHp,
        opponent: opponentHp,
      },
    };

    return {
      abilityUsed: true,
      damageMultiplier: multiplier,
      action,
    };
  }
}
