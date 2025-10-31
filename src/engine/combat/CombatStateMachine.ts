/**
 * CombatStateMachine - Manages combat turn flow and state transitions
 *
 * States: PlayerTurn → OpponentTurn → PetTurn → CheckWin → [next turn | BattleEnd]
 * Handles initiative-based turn ordering and extra turn mechanics.
 * Story 7.3: Extended to support pet combatants
 */

export enum CombatState {
  Initializing = 'initializing',
  PlayerTurn = 'player_turn',
  OpponentTurn = 'opponent_turn',
  PetTurn = 'pet_turn',                    // Story 7.3: Pet actions
  CheckWinCondition = 'check_win',
  BattleEnd = 'battle_end',
}

export type CombatSide = 'player' | 'opponent';
export type CombatantType = 'bruto' | 'pet';   // Story 7.3

export interface TurnQueueEntry {
  side: CombatSide;
  initiative: number;
  isExtraTurn: boolean;
  // Story 7.3: Pet combat support
  combatantType: CombatantType;           // 'bruto' or 'pet'
  petId?: string;                          // Unique identifier for pet (petType + slot)
}

export interface CombatStateContext {
  currentState: CombatState;
  turnNumber: number;
  currentSide: CombatSide | null;
  turnQueue: TurnQueueEntry[];
  winner: CombatSide | null;
}

/**
 * State machine managing combat flow and turn ordering
 */
export class CombatStateMachine {
  private context: CombatStateContext;

  constructor() {
    this.context = {
      currentState: CombatState.Initializing,
      turnNumber: 0,
      currentSide: null,
      turnQueue: [],
      winner: null,
    };
  }

  /**
   * Initialize battle with starting turn queue
   */
  public initialize(initialQueue: TurnQueueEntry[]): void {
    this.context.turnQueue = [...initialQueue];
    this.context.currentState = CombatState.Initializing;
    this.context.turnNumber = 0;
    this.context.currentSide = null;
    this.context.winner = null;

    // Transition to first turn
    this.nextTurn();
  }

  /**
   * Advance to next turn in queue
   */
  public nextTurn(): void {
    if (this.context.currentState === CombatState.BattleEnd) {
      return; // Battle is over, no more turns
    }

    if (this.context.turnQueue.length === 0) {
      throw new Error('CombatStateMachine: Turn queue is empty');
    }

    // Dequeue next turn
    const nextTurn = this.context.turnQueue.shift()!;
    this.context.currentSide = nextTurn.side;
    this.context.turnNumber++;

    // Transition to appropriate turn state
    // Story 7.3: Support pet turns
    if (nextTurn.combatantType === 'pet') {
      this.context.currentState = CombatState.PetTurn;
    } else if (nextTurn.side === 'player') {
      this.context.currentState = CombatState.PlayerTurn;
    } else {
      this.context.currentState = CombatState.OpponentTurn;
    }
  }

  /**
   * Add an extra turn for a combatant (triggered by Speed stat)
   */
  public addExtraTurn(side: CombatSide, initiative: number, combatantType: CombatantType = 'bruto'): void {
    // Insert extra turn at front of queue
    this.context.turnQueue.unshift({
      side,
      initiative,
      isExtraTurn: true,
      combatantType,
    });
  }

  /**
   * Enqueue a regular turn
   */
  public enqueueTurn(
    side: CombatSide,
    initiative: number,
    combatantType: CombatantType = 'bruto',
    petId?: string
  ): void {
    this.context.turnQueue.push({
      side,
      initiative,
      isExtraTurn: false,
      combatantType,
      petId,
    });
  }

  /**
   * Transition to win condition check
   */
  public checkWinCondition(): void {
    this.context.currentState = CombatState.CheckWinCondition;
  }

  /**
   * End battle with winner
   */
  public endBattle(winner: CombatSide): void {
    this.context.winner = winner;
    this.context.currentState = CombatState.BattleEnd;
    this.context.turnQueue = []; // Clear remaining turns
  }

  /**
   * Get current state
   */
  public getState(): CombatState {
    return this.context.currentState;
  }

  /**
   * Get current turn side
   */
  public getCurrentSide(): CombatSide | null {
    return this.context.currentSide;
  }

  /**
   * Get turn number
   */
  public getTurnNumber(): number {
    return this.context.turnNumber;
  }

  /**
   * Get winner (null if battle not ended)
   */
  public getWinner(): CombatSide | null {
    return this.context.winner;
  }

  /**
   * Check if battle is over
   */
  public isBattleOver(): boolean {
    return this.context.currentState === CombatState.BattleEnd;
  }

  /**
   * Get remaining turns in queue (for debugging)
   */
  public getTurnQueueLength(): number {
    return this.context.turnQueue.length;
  }

  /**
   * Get full context snapshot (for testing/debugging)
   */
  public getContext(): Readonly<CombatStateContext> {
    return { ...this.context };
  }
}
