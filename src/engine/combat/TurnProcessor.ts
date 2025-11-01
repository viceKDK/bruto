/**
 * TurnProcessor - Handles extra turn mechanics (SRP improvement)
 *
 * Extracted from CombatEngine to follow Single Responsibility Principle.
 * Manages speed-based extra turn calculation logic.
 */

import { IBrutoCombatant } from '../../models/Bruto';
import { SeededRandom } from '../../utils/SeededRandom';

export interface ITurnProcessor {
  /**
   * Roll for extra turn based on Speed stat
   * @param combatant - The combatant attempting extra turn
   * @returns true if extra turn granted, false otherwise
   */
  rollExtraTurn(combatant: IBrutoCombatant): boolean;
}

/**
 * Processes extra turn mechanics based on Speed stat
 * Formula: Speed × 5% chance, capped at 60%
 */
export class TurnProcessor implements ITurnProcessor {
  private static readonly EXTRA_TURN_SPEED_MULTIPLIER = 0.05;
  private static readonly EXTRA_TURN_MAX_CHANCE = 0.6;

  constructor(private rng: SeededRandom) {}

  /**
   * Roll for extra turn based on Speed stat
   * Speed × 5% chance, capped at 60%
   */
  public rollExtraTurn(combatant: IBrutoCombatant): boolean {
    const extraTurnChance = Math.min(
      TurnProcessor.EXTRA_TURN_MAX_CHANCE,
      combatant.stats.speed * TurnProcessor.EXTRA_TURN_SPEED_MULTIPLIER
    );
    return this.rng.roll(extraTurnChance);
  }
}
