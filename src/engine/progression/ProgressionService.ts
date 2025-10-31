/**
 * ProgressionService - Handles level progression scheduling and triggers.
 * Currently queues pending level-ups in the global store. Future implementations
 * can replace this with a full ProgressionEngine without touching callers.
 */

import { IBruto } from '../../models/Bruto';
import { useStore } from '../../state/store';

export class ProgressionService {
  /**
   * Queue initial level-up for a newly created bruto.
   * Adds the bruto to the pending level-up queue so UI/engines can handle it.
   */
  scheduleInitialLevelUp(bruto: IBruto): void {
    useStore.getState().queueLevelUp(bruto.id);
  }

  /**
   * Mark a level-up as processed, removing it from the queue.
   */
  resolveLevelUp(brutoId: string): void {
    useStore.getState().clearLevelUp(brutoId);
  }
}
