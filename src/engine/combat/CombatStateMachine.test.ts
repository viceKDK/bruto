import { describe, expect, it, beforeEach } from 'vitest';
import { CombatStateMachine, CombatState, TurnQueueEntry } from './CombatStateMachine';

describe('CombatStateMachine', () => {
  let stateMachine: CombatStateMachine;

  beforeEach(() => {
    stateMachine = new CombatStateMachine();
  });

  describe('initialization', () => {
    it('starts in Initializing state', () => {
      expect(stateMachine.getState()).toBe(CombatState.Initializing);
      expect(stateMachine.getTurnNumber()).toBe(0);
      expect(stateMachine.getCurrentSide()).toBeNull();
    });

    it('transitions to first turn when initialized with queue', () => {
      const queue: TurnQueueEntry[] = [
        { side: 'player', initiative: 100, isExtraTurn: false },
        { side: 'opponent', initiative: 150, isExtraTurn: false },
      ];

      stateMachine.initialize(queue);

      expect(stateMachine.getState()).toBe(CombatState.PlayerTurn);
      expect(stateMachine.getCurrentSide()).toBe('player');
      expect(stateMachine.getTurnNumber()).toBe(1);
    });
  });

  describe('turn advancement', () => {
    beforeEach(() => {
      const queue: TurnQueueEntry[] = [
        { side: 'player', initiative: 100, isExtraTurn: false },
        { side: 'opponent', initiative: 150, isExtraTurn: false },
        { side: 'player', initiative: 200, isExtraTurn: false },
      ];
      stateMachine.initialize(queue);
    });

    it('advances through turn queue correctly', () => {
      // Turn 1: Player
      expect(stateMachine.getCurrentSide()).toBe('player');
      expect(stateMachine.getTurnNumber()).toBe(1);

      // Turn 2: Opponent
      stateMachine.nextTurn();
      expect(stateMachine.getState()).toBe(CombatState.OpponentTurn);
      expect(stateMachine.getCurrentSide()).toBe('opponent');
      expect(stateMachine.getTurnNumber()).toBe(2);

      // Turn 3: Player again
      stateMachine.nextTurn();
      expect(stateMachine.getState()).toBe(CombatState.PlayerTurn);
      expect(stateMachine.getCurrentSide()).toBe('player');
      expect(stateMachine.getTurnNumber()).toBe(3);
    });

    it('throws error when trying to advance with empty queue', () => {
      // Exhaust queue
      stateMachine.nextTurn(); // Turn 2
      stateMachine.nextTurn(); // Turn 3

      // Queue is now empty
      expect(() => stateMachine.nextTurn()).toThrow('Turn queue is empty');
    });
  });

  describe('extra turns', () => {
    beforeEach(() => {
      const queue: TurnQueueEntry[] = [
        { side: 'player', initiative: 100, isExtraTurn: false },
        { side: 'opponent', initiative: 150, isExtraTurn: false },
      ];
      stateMachine.initialize(queue);
    });

    it('inserts extra turn at front of queue', () => {
      // Currently on turn 1 (player)
      expect(stateMachine.getCurrentSide()).toBe('player');

      // Player gets extra turn
      stateMachine.addExtraTurn('player', 100);
      stateMachine.nextTurn();

      // Next turn should still be player (extra turn)
      expect(stateMachine.getCurrentSide()).toBe('player');
      expect(stateMachine.getTurnNumber()).toBe(2);

      // Then opponent
      stateMachine.nextTurn();
      expect(stateMachine.getCurrentSide()).toBe('opponent');
    });

    it('handles multiple extra turns correctly', () => {
      stateMachine.addExtraTurn('player', 100);
      stateMachine.addExtraTurn('player', 100);

      expect(stateMachine.getTurnQueueLength()).toBe(3); // 2 extra + 1 original opponent turn
    });
  });

  describe('turn enqueueing', () => {
    beforeEach(() => {
      const queue: TurnQueueEntry[] = [
        { side: 'player', initiative: 100, isExtraTurn: false },
      ];
      stateMachine.initialize(queue);
    });

    it('adds turns to end of queue', () => {
      expect(stateMachine.getTurnQueueLength()).toBe(0); // First turn dequeued

      stateMachine.enqueueTurn('opponent', 150);
      stateMachine.enqueueTurn('player', 200);

      expect(stateMachine.getTurnQueueLength()).toBe(2);
    });
  });

  describe('win condition checking', () => {
    beforeEach(() => {
      const queue: TurnQueueEntry[] = [
        { side: 'player', initiative: 100, isExtraTurn: false },
      ];
      stateMachine.initialize(queue);
    });

    it('transitions to CheckWinCondition state', () => {
      stateMachine.checkWinCondition();
      expect(stateMachine.getState()).toBe(CombatState.CheckWinCondition);
    });
  });

  describe('battle end', () => {
    beforeEach(() => {
      const queue: TurnQueueEntry[] = [
        { side: 'player', initiative: 100, isExtraTurn: false },
        { side: 'opponent', initiative: 150, isExtraTurn: false },
        { side: 'player', initiative: 200, isExtraTurn: false },
      ];
      stateMachine.initialize(queue);
    });

    it('ends battle with winner and clears queue', () => {
      stateMachine.endBattle('player');

      expect(stateMachine.getState()).toBe(CombatState.BattleEnd);
      expect(stateMachine.getWinner()).toBe('player');
      expect(stateMachine.isBattleOver()).toBe(true);
      expect(stateMachine.getTurnQueueLength()).toBe(0);
    });

    it('prevents turn advancement after battle end', () => {
      stateMachine.endBattle('opponent');

      const turnBefore = stateMachine.getTurnNumber();
      stateMachine.nextTurn();
      const turnAfter = stateMachine.getTurnNumber();

      expect(turnBefore).toBe(turnAfter); // Turn didn't advance
      expect(stateMachine.isBattleOver()).toBe(true);
    });
  });

  describe('state queries', () => {
    it('returns null winner before battle ends', () => {
      expect(stateMachine.getWinner()).toBeNull();
    });

    it('returns false for isBattleOver before battle ends', () => {
      expect(stateMachine.isBattleOver()).toBe(false);
    });

    it('provides full context snapshot', () => {
      const queue: TurnQueueEntry[] = [
        { side: 'player', initiative: 100, isExtraTurn: false },
      ];
      stateMachine.initialize(queue);

      const context = stateMachine.getContext();

      expect(context.currentState).toBe(CombatState.PlayerTurn);
      expect(context.turnNumber).toBe(1);
      expect(context.currentSide).toBe('player');
      expect(context.winner).toBeNull();
    });
  });
});
