/**
 * ActiveAbilityEffects - Story 6.5
 * Apply effects of active abilities during combat
 * 
 * Responsibilities:
 * - Apply Fuerza Bruta (x2 damage multiplier)
 * - Apply Poción Trágica (heal 25-50% HP)
 * - Calculate ability effect results
 */

import { SeededRandom } from '../../utils/SeededRandom';

export interface AbilityEffectResult {
  effectApplied: boolean;
  damageMultiplier?: number;
  healAmount?: number;
  message: string;
}

export class ActiveAbilityEffects {
  private rng: SeededRandom;

  constructor(rng: SeededRandom) {
    this.rng = rng;
  }

  /**
   * Apply Fuerza Bruta effect (double damage)
   */
  public applyFuerzaBruta(): AbilityEffectResult {
    return {
      effectApplied: true,
      damageMultiplier: 2.0,
      message: 'Fuerza Bruta! Damage doubled!',
    };
  }

  /**
   * Apply Poción Trágica effect (heal 25-50% HP)
   */
  public applyPocionTragica(currentHp: number, maxHp: number): AbilityEffectResult {
    // Random heal between 25% and 50% of max HP
    const healPercent = 0.25 + (this.rng.next() * 0.25);
    const healAmount = Math.floor(maxHp * healPercent);
    const newHp = Math.min(currentHp + healAmount, maxHp);
    const actualHeal = newHp - currentHp;

    return {
      effectApplied: true,
      healAmount: actualHeal,
      message: `Poción Trágica! Healed ${actualHeal} HP!`,
    };
  }

  /**
   * Calculate damage with ability multiplier
   */
  public calculateAbilityDamage(baseDamage: number, multiplier: number): number {
    return Math.floor(baseDamage * multiplier);
  }
}
