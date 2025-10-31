import { describe, expect, it } from 'vitest';
import { ProgressionService } from './ProgressionService';
import { useStore } from '../../state/store';

describe('ProgressionService', () => {
  it('queues and clears initial level-up', () => {
    const service = new ProgressionService();
    const brutoId = 'bruto_test_1';

    service.scheduleInitialLevelUp({
      id: brutoId,
      userId: 'user_1',
      name: 'Alpha',
      level: 1,
      xp: 0,
      hp: 60,
      maxHp: 60,
      str: 2,
      speed: 2,
      agility: 2,
      resistance: 1.67,
      appearanceId: 1,
      colorVariant: 0,
      createdAt: new Date(),
      skills: [],
    });

    expect(useStore.getState().pendingLevelUps).toContain(brutoId);

    service.resolveLevelUp(brutoId);
    expect(useStore.getState().pendingLevelUps).not.toContain(brutoId);
  });
});
