/**
 * ActionResolver - Resolve combat actions (attacks, skills, items)
 *
 * PLACEHOLDER: Will be implemented in Epic 5 (Skills) and Epic 6 (Items)
 * Currently, CombatEngine handles basic attacks directly.
 */

import { IBrutoCombatant } from '../../models/Bruto';
import { SeededRandom } from '../../utils/SeededRandom';

export interface ActionResult {
  damage: number;
  dodged: boolean;
  critical: boolean;
  skillName?: string;
}

/**
 * Resolves combat actions and calculates outcomes
 * @epic 5-6
 */
export class ActionResolver {
  constructor(private rng: SeededRandom) {}

  /**
   * Resolve basic attack action
   * @future Epic 5 will add skill resolution
   */
  public resolveAttack(
    attacker: IBrutoCombatant,
    defender: IBrutoCombatant
  ): ActionResult {
    // Placeholder implementation
    throw new Error('ActionResolver not yet implemented - see Epic 5/6');
  }
}
