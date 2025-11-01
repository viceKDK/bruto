/**
 * CombatEngine - Main battle orchestrator (Controller pattern)
 *
 * Manages complete battle flow from initialization to resolution.
 * Pure TypeScript with zero Phaser dependencies for testability.
 */

import { IBrutoCombatant } from '../../models/Bruto';
import { CombatAction } from '../../models/Battle';
import { SeededRandom } from '../../utils/SeededRandom';
import { CombatStateMachine, CombatSide, TurnQueueEntry } from './CombatStateMachine';
import { DamageCalculator, DamageModifiers, IDamageCalculator } from './DamageCalculator';
import { ActiveAbilityManager } from './ActiveAbilityManager';
import { ActiveAbilityEffects } from './ActiveAbilityEffects';
import { WeaponCombatService, IWeaponCombatService } from './WeaponCombatService';
import { TurnProcessor, ITurnProcessor } from './TurnProcessor';
import { CombatAbilityService, ICombatAbilityService } from './CombatAbilityService';
import { DisarmedWeapon } from '../weapons/DisarmService';

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
  disarmedWeapons: DisarmedWeapon[]; // Story 5.4: Track disarmed weapons
}

/**
 * Main combat engine that orchestrates battle logic
 */
export class CombatEngine {
  private stateMachine: CombatStateMachine;
  private rng: SeededRandom;
  private damageCalculator: IDamageCalculator;
  private activeAbilityManager: ActiveAbilityManager;
  private activeAbilityEffects: ActiveAbilityEffects;
  private weaponCombatService: IWeaponCombatService;
  private turnProcessor: ITurnProcessor;
  private abilityService: ICombatAbilityService;
  private playerState: CombatantState;
  private opponentState: CombatantState;
  private actions: CombatAction[] = [];

  constructor(
    config: BattleConfig,
    damageCalculator?: IDamageCalculator,
    weaponService?: IWeaponCombatService,
    turnProcessor?: ITurnProcessor,
    abilityService?: ICombatAbilityService
  ) {
    this.stateMachine = new CombatStateMachine();
    this.rng = config.rngSeed
      ? new SeededRandom(config.rngSeed)
      : new SeededRandom(Date.now());

    // Dependency Injection: Use provided instances or create defaults
    this.damageCalculator = damageCalculator || new DamageCalculator();
    this.activeAbilityManager = new ActiveAbilityManager();
    this.activeAbilityEffects = new ActiveAbilityEffects(this.rng);
    this.weaponCombatService = weaponService || new WeaponCombatService();
    this.turnProcessor = turnProcessor || new TurnProcessor(this.rng);
    this.abilityService = abilityService || new CombatAbilityService(
      this.activeAbilityManager,
      this.activeAbilityEffects
    );

    // Initialize combatant states
    this.playerState = {
      combatant: config.player,
      currentHp: config.player.stats.hp,
      disarmedWeapons: [], // Story 5.4: No weapons disarmed at start
    };

    this.opponentState = {
      combatant: config.opponent,
      currentHp: config.opponent.stats.hp,
      disarmedWeapons: [], // Story 5.4: No weapons disarmed at start
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
      queue.push({ side: 'player', initiative: playerInitiative, isExtraTurn: false, combatantType: 'bruto' });
      queue.push({ side: 'opponent', initiative: opponentInitiative, isExtraTurn: false, combatantType: 'bruto' });
    } else {
      queue.push({ side: 'opponent', initiative: opponentInitiative, isExtraTurn: false, combatantType: 'bruto' });
      queue.push({ side: 'player', initiative: playerInitiative, isExtraTurn: false, combatantType: 'bruto' });
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

    // Story 5.4: Update disarm timers for both combatants
    this.updateDisarmTimers();

    // Advance to next turn
    this.stateMachine.nextTurn();
  }

  /**
   * Execute attack using DamageCalculator
   * Story 4.2: Full damage formula implementation with dodge, crit, and resistance
   * Story 5: Weapon modifiers integration
   */
  private executeAttack(attacker: CombatSide, turnNumber: number): void {
    const attackerState = this.getCombatantState(attacker);
    const defenderState = this.getCombatantState(attacker === 'player' ? 'opponent' : 'player');

    // Story 5: Calculate weapon modifiers for attacker and defender (considering disarmed weapons)
    const attackerModifiers = this.getWeaponModifiers(attackerState.combatant, attackerState.disarmedWeapons);
    const defenderModifiers = this.getWeaponModifiers(defenderState.combatant, defenderState.disarmedWeapons);

    // Check dodge using DamageCalculator with weapon modifiers
    const dodgeChance = this.damageCalculator.getDodgeChance(defenderState.combatant, defenderModifiers);
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

    // Calculate damage using DamageCalculator with weapon modifiers
    let damage = this.damageCalculator.calculatePhysicalDamage(
      attackerState.combatant,
      defenderState.combatant,
      attackerModifiers
    );

    // Check for Fuerza Bruta active ability using CombatAbilityService
    const abilityResult = this.abilityService.checkDamageAbility(
      attacker,
      turnNumber,
      this.playerState.currentHp,
      this.opponentState.currentHp
    );

    if (abilityResult.abilityUsed) {
      damage = this.activeAbilityEffects.calculateAbilityDamage(
        damage,
        abilityResult.damageMultiplier
      );
      if (abilityResult.action) {
        this.actions.push(abilityResult.action);
      }
    }

    // Check critical hit using DamageCalculator with weapon modifiers
    const critChance = this.damageCalculator.calculateCritChance(attackerState.combatant, attackerModifiers);
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

    // Story 5.4: Check for disarm after successful attack
    this.checkDisarm(attacker, attackerState, defenderState, turnNumber);
  }

  /**
   * Story 5.4: Check and apply disarm mechanics after attack
   * Disarm chance is ONLY based on weapon modifiers (no base, no agility)
   * Can reach 100% with the right weapon
   * Uses "bare-hands" weapon stats when no weapon equipped
   */
  private checkDisarm(
    attacker: CombatSide,
    attackerState: CombatantState,
    defenderState: CombatantState,
    turnNumber: number
  ): void {
    // Defender must have weapons to disarm (bare-hands cannot be disarmed)
    if (!defenderState.combatant.equippedWeapons || defenderState.combatant.equippedWeapons.length === 0) {
      return;
    }

    // Get attacker's weapons (use bare-hands if none equipped)
    const attackerWeapons = attackerState.combatant.equippedWeapons && attackerState.combatant.equippedWeapons.length > 0
      ? attackerState.combatant.equippedWeapons
      : ['bare-hands']; // Default to bare-hands (5% disarm)

    // Get disarm chance ONLY from attacker's weapons (no base, no agility)
    const disarmChanceModifier = this.weaponCombatService.getDisarmChanceModifier(
      attackerWeapons,
      attackerState.disarmedWeapons.map(d => d.weaponId)
    );

    // Disarm chance is purely weapon-based (can be 0% to 100%)
    const disarmChance = Math.max(0, Math.min(100, disarmChanceModifier));

    // Roll for disarm
    const disarmSucceeds = this.rng.roll(disarmChance / 100);

    if (disarmSucceeds) {
      // Select random weapon from defender's equipped weapons
      const equippedWeapons = defenderState.combatant.equippedWeapons;
      const randomIndex = Math.floor(this.rng.next() * equippedWeapons.length);
      const weaponToDisarm = equippedWeapons[randomIndex];

      // Add to disarmed weapons list
      defenderState.disarmedWeapons.push({
        weaponId: weaponToDisarm,
        turnsRemaining: 3, // Story 5.4: Weapons return after 3 turns
        originallyEquipped: true,
      });

      // Log disarm action
      this.actions.push({
        turn: turnNumber,
        attacker,
        action: 'disarm',
        weaponDisarmed: weaponToDisarm,
        hpRemaining: {
          player: this.playerState.currentHp,
          opponent: this.opponentState.currentHp,
        },
      });
    }
  }

  /**
   * Story 5.4: Update disarm timers for both combatants
   * Decrements turn counters and recovers weapons that reached 0
   */
  private updateDisarmTimers(): void {
    // Update player disarm timers
    this.playerState.disarmedWeapons = this.playerState.disarmedWeapons
      .map(weapon => ({
        ...weapon,
        turnsRemaining: weapon.turnsRemaining - 1,
      }))
      .filter(weapon => weapon.turnsRemaining > 0);

    // Update opponent disarm timers
    this.opponentState.disarmedWeapons = this.opponentState.disarmedWeapons
      .map(weapon => ({
        ...weapon,
        turnsRemaining: weapon.turnsRemaining - 1,
      }))
      .filter(weapon => weapon.turnsRemaining > 0);
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
   * Story 6.5: Active ability integration using CombatAbilityService
   */
  private checkHealingAbilities(side: CombatSide, turnNumber: number): void {
    const combatantState = this.getCombatantState(side);
    
    const healResult = this.abilityService.checkHealingAbility(
      side,
      combatantState.combatant,
      combatantState.currentHp,
      turnNumber,
      this.playerState.currentHp,
      this.opponentState.currentHp
    );

    if (healResult.healed && healResult.action) {
      combatantState.currentHp += healResult.healAmount;
      this.actions.push(healResult.action);
    }
  }

  /**
   * Roll for extra turn based on Speed stat using TurnProcessor
   * Speed × 5% chance, capped at 60%
   */
  private rollExtraTurn(side: CombatSide): boolean {
    const combatant = this.getCombatantState(side).combatant;
    return this.turnProcessor.rollExtraTurn(combatant);
  }

  /**
   * Get combatant state by side
   */
  private getCombatantState(side: CombatSide): CombatantState {
    return side === 'player' ? this.playerState : this.opponentState;
  }

  /**
   * Calculate weapon modifiers for combatant
   * Story 5: Weapon integration with Story 5.4 disarm mechanics
   * Uses "bare-hands" as default weapon when no weapons equipped
   */
  private getWeaponModifiers(combatant: IBrutoCombatant, disarmedWeapons: DisarmedWeapon[]): DamageModifiers {
    // If no weapons equipped, use bare-hands (default weapon)
    const equippedWeapons = combatant.equippedWeapons && combatant.equippedWeapons.length > 0
      ? combatant.equippedWeapons
      : ['bare-hands']; // Default to bare-hands

    // Story 5.4: Exclude disarmed weapons from modifiers
    const disarmedWeaponIds = disarmedWeapons.map(d => d.weaponId);

    return this.weaponCombatService.calculateCombatModifiers(
      equippedWeapons,
      disarmedWeaponIds
    );
  }
}
