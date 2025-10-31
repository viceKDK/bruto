/**
 * CombatEngine - Main battle orchestrator (Controller pattern)
 *
 * Manages complete battle flow from initialization to resolution.
 * Pure TypeScript with zero Phaser dependencies for testability.
 */

import { IBrutoCombatant } from '../../models/Bruto';
import { CombatAction } from '../../models/Battle';
import { SeededRandom } from '../../utils/SeededRandom';
import { CombatStateMachine, CombatState, CombatSide, TurnQueueEntry } from './CombatStateMachine';
import { DamageCalculator } from './DamageCalculator';
import { ActiveAbilityManager } from './ActiveAbilityManager';
import { ActiveAbilityEffects } from './ActiveAbilityEffects';
import { POCION_TRAGICA_USE_THRESHOLD } from '../../utils/constants';

export interface BattleConfig {
  player: IBrutoCombatant;
  opponent: IBrutoCombatant;
  rngSeed?: string | number;
}

export interface BattleResult {
  winner: CombatSide;
  actions: CombatAction[];
  playerHpRemaining: number;
  opponentHpRemaining: number;
  rngSeed: number;
}

interface CombatantState {
  combatant: IBrutoCombatant;
  currentHp: number;
}

/**
 * Main combat engine that orchestrates battle logic
 */
export class CombatEngine {
  private stateMachine: CombatStateMachine;
  private rng: SeededRandom;
  private damageCalculator: DamageCalculator;
  private activeAbilityManager: ActiveAbilityManager;
  private activeAbilityEffects: ActiveAbilityEffects;
  private playerState: CombatantState;
  private opponentState: CombatantState;
  private actions: CombatAction[] = [];

  constructor(config: BattleConfig) {
    this.stateMachine = new CombatStateMachine();
    this.rng = config.rngSeed
      ? new SeededRandom(config.rngSeed)
      : new SeededRandom(Date.now());

    this.damageCalculator = new DamageCalculator();
    this.activeAbilityManager = new ActiveAbilityManager();
    this.activeAbilityEffects = new ActiveAbilityEffects(this.rng);

    // Initialize combatant states
    this.playerState = {
      combatant: config.player,
      currentHp: config.player.stats.hp,
    };

    this.opponentState = {
      combatant: config.opponent,
      currentHp: config.opponent.stats.hp,
    };

    // Initialize abilities for battle
    this.activeAbilityManager.initializeBattle(config.player, config.opponent);
  }

  /**
   * Execute complete battle and return result
   */
  public executeBattle(): BattleResult {
    // Initialize turn queue with initiative order
    const initialQueue = this.calculateInitialTurnOrder();
    this.stateMachine.initialize(initialQueue);

    // Battle loop: process turns until winner determined
    while (!this.stateMachine.isBattleOver()) {
      this.processTurn();
    }

    return {
      winner: this.stateMachine.getWinner()!,
      actions: this.actions,
      playerHpRemaining: this.playerState.currentHp,
      opponentHpRemaining: this.opponentState.currentHp,
      rngSeed: this.rng.getSeed(),
    };
  }

  /**
   * Calculate initial turn order based on initiative (Speed + pet modifiers)
   */
  private calculateInitialTurnOrder(): TurnQueueEntry[] {
    const playerInitiative = this.calculateInitiative(this.playerState.combatant);
    const opponentInitiative = this.calculateInitiative(this.opponentState.combatant);

    // Lower initiative goes first (faster)
    const queue: TurnQueueEntry[] = [];

    if (playerInitiative <= opponentInitiative) {
      queue.push({ side: 'player', initiative: playerInitiative, isExtraTurn: false });
      queue.push({ side: 'opponent', initiative: opponentInitiative, isExtraTurn: false });
    } else {
      queue.push({ side: 'opponent', initiative: opponentInitiative, isExtraTurn: false });
      queue.push({ side: 'player', initiative: playerInitiative, isExtraTurn: false });
    }

    return queue;
  }

  /**
   * Calculate initiative value (Speed + pet modifier)
   * Lower values mean faster (pet modifiers are negative for fast pets)
   */
  private calculateInitiative(combatant: IBrutoCombatant): number {
    const baseInitiative = 1000; // Base interval
    const speedModifier = combatant.stats.speed * -10; // Speed reduces initiative interval
    const petModifier = combatant.petInitiativeModifier ?? 0;

    return baseInitiative + speedModifier + petModifier;
  }

  /**
   * Process single turn (attack, check extra turn, check win, enqueue next)
   */
  private processTurn(): void {
    const currentSide = this.stateMachine.getCurrentSide()!;
    const turnNumber = this.stateMachine.getTurnNumber();

    // Check for healing abilities before attack
    this.checkHealingAbilities(currentSide, turnNumber);

    // Execute attack
    this.executeAttack(currentSide, turnNumber);

    // Check win condition
    this.stateMachine.checkWinCondition();
    const loser = this.checkWinCondition();

    if (loser) {
      const winner: CombatSide = loser === 'player' ? 'opponent' : 'player';
      this.stateMachine.endBattle(winner);
      return;
    }

    // Roll for extra turn (Speed-driven mechanic)
    const extraTurnGranted = this.rollExtraTurn(currentSide);

    if (extraTurnGranted) {
      const combatant = this.getCombatantState(currentSide).combatant;
      const initiative = this.calculateInitiative(combatant);
      this.stateMachine.addExtraTurn(currentSide, initiative);
    }

    // Enqueue next regular turn for this combatant
    const combatant = this.getCombatantState(currentSide).combatant;
    const initiative = this.calculateInitiative(combatant);
    this.stateMachine.enqueueTurn(currentSide, initiative);

    // Advance to next turn
    this.stateMachine.nextTurn();
  }

  /**
   * Execute attack using DamageCalculator
   * Story 4.2: Full damage formula implementation with dodge, crit, and resistance
   */
  private executeAttack(attacker: CombatSide, turnNumber: number): void {
    const attackerState = this.getCombatantState(attacker);
    const defenderState = this.getCombatantState(attacker === 'player' ? 'opponent' : 'player');

    // Check dodge using DamageCalculator
    const dodgeChance = this.damageCalculator.getDodgeChance(defenderState.combatant);
    const dodged = this.rng.roll(dodgeChance);

    if (dodged) {
      // Attack dodged
      this.actions.push({
        turn: turnNumber,
        attacker,
        action: 'dodge',
        damage: 0,
        hpRemaining: {
          player: this.playerState.currentHp,
          opponent: this.opponentState.currentHp,
        },
      });
      return;
    }

    // Calculate damage using DamageCalculator
    let damage = this.damageCalculator.calculatePhysicalDamage(
      attackerState.combatant,
      defenderState.combatant
    );

    // Check for Fuerza Bruta active ability
    const fuerzaBrutaId = 'fuerza_bruta';
    if (this.activeAbilityManager.isAbilityAvailable(attacker, fuerzaBrutaId)) {
      const abilityEffect = this.activeAbilityEffects.applyFuerzaBruta();
      if (abilityEffect.damageMultiplier !== undefined) {
        damage = this.activeAbilityEffects.calculateAbilityDamage(damage, abilityEffect.damageMultiplier);
      }
      this.activeAbilityManager.useAbility(attacker, fuerzaBrutaId);
      
      this.actions.push({
        turn: turnNumber,
        attacker,
        action: 'ability',
        damage: 0,
        abilityUsed: 'fuerza_bruta',
        hpRemaining: {
          player: this.playerState.currentHp,
          opponent: this.opponentState.currentHp,
        },
      });
    }

    // Check critical hit using DamageCalculator
    const critChance = this.damageCalculator.calculateCritChance(attackerState.combatant);
    const isCrit = this.rng.roll(critChance);

    if (isCrit) {
      damage = this.damageCalculator.applyCriticalMultiplier(damage);
      this.actions.push({
        turn: turnNumber,
        attacker,
        action: 'critical',
        damage,
        hpRemaining: {
          player: this.playerState.currentHp,
          opponent: this.opponentState.currentHp,
        },
      });
    } else {
      this.actions.push({
        turn: turnNumber,
        attacker,
        action: 'attack',
        damage,
        hpRemaining: {
          player: this.playerState.currentHp,
          opponent: this.opponentState.currentHp,
        },
      });
    }

    // Apply damage
    defenderState.currentHp = Math.max(0, defenderState.currentHp - damage);
  }

  /**
   * Check if battle has winner (HP reached 0)
   * Returns losing side if battle over, null otherwise
   */
  private checkWinCondition(): CombatSide | null {
    if (this.playerState.currentHp <= 0) {
      return 'player';
    }
    if (this.opponentState.currentHp <= 0) {
      return 'opponent';
    }
    return null;
  }

  /**
   * Check and apply healing abilities (Poción Trágica)
   * Story 6.5: Active ability integration
   */
  private checkHealingAbilities(side: CombatSide, turnNumber: number): void {
    const pocionTragicaId = 'pocion_tragica';
    
    if (!this.activeAbilityManager.isAbilityAvailable(side, pocionTragicaId)) {
      return;
    }

    const combatantState = this.getCombatantState(side);
    const maxHp = combatantState.combatant.stats.maxHp || combatantState.combatant.stats.hp;
    
    // Only use if HP is below threshold (strategic AI decision)
    const hpPercent = combatantState.currentHp / maxHp;
    if (hpPercent > POCION_TRAGICA_USE_THRESHOLD) {
      return; // Don't waste heal at high HP
    }

    // Apply healing
    const healResult = this.activeAbilityEffects.applyPocionTragica(
      combatantState.currentHp,
      maxHp
    );

    if (healResult.healAmount && healResult.healAmount > 0) {
      combatantState.currentHp = Math.min(
        combatantState.currentHp + healResult.healAmount,
        maxHp
      );

      this.activeAbilityManager.useAbility(side, pocionTragicaId);

      this.actions.push({
        turn: turnNumber,
        attacker: side,
        action: 'heal',
        healAmount: healResult.healAmount,
        abilityUsed: 'pocion_tragica',
        hpRemaining: {
          player: this.playerState.currentHp,
          opponent: this.opponentState.currentHp,
        },
      });
    }
  }

  /**
   * Roll for extra turn based on Speed stat
   * Speed × 5% chance, capped at 60%
   */
  private rollExtraTurn(side: CombatSide): boolean {
    const combatant = this.getCombatantState(side).combatant;
    const extraTurnChance = Math.min(0.6, combatant.stats.speed * 0.05);
    return this.rng.roll(extraTurnChance);
  }

  /**
   * Get combatant state by side
   */
  private getCombatantState(side: CombatSide): CombatantState {
    return side === 'player' ? this.playerState : this.opponentState;
  }
}
