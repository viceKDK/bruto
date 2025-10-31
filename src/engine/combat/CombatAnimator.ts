/**
 * CombatAnimator - Animation coordinator for combat events
 *
 * Phaser-specific layer that consumes CombatEngine results and
 * orchestrates sprite animations, damage numbers, and HP updates.
 *
 * Follows architecture.md Section 7: Separation of engine logic from presentation.
 */

import Phaser from 'phaser';
import { CombatAction } from '../../models/Battle';
import { HealthBar } from '../../components/HealthBar';
import { DamageNumberPool, DamageNumberType } from '../../components/DamageNumber';

export interface CombatSprite {
  sprite: Phaser.GameObjects.Sprite;
  healthBar: HealthBar;
  maxHp: number;
  currentHp: number;
}

export interface CombatAnimatorConfig {
  scene: Phaser.Scene;
  playerSprite: CombatSprite;
  opponentSprite: CombatSprite;
  damageNumberPool: DamageNumberPool;
}

/**
 * Coordinates combat animations from CombatAction timeline
 */
export class CombatAnimator {
  private scene: Phaser.Scene;
  private playerSprite: CombatSprite;
  private opponentSprite: CombatSprite;
  private damageNumberPool: DamageNumberPool;

  constructor(config: CombatAnimatorConfig) {
    this.scene = config.scene;
    this.playerSprite = config.playerSprite;
    this.opponentSprite = config.opponentSprite;
    this.damageNumberPool = config.damageNumberPool;
  }

  /**
   * Play complete combat animation sequence from action timeline
   * Returns promise that resolves when all animations complete
   */
  public async playBattle(actions: CombatAction[]): Promise<void> {
    console.log(`[CombatAnimator] Playing ${actions.length} combat actions`);

    // Play each action sequentially
    for (const action of actions) {
      await this.playAction(action);
    }

    console.log('[CombatAnimator] Battle animation complete');
  }

  /**
   * Play single combat action animation
   * Public so CombatScene can call directly for custom playback
   */
  public async playAction(action: CombatAction): Promise<void> {
    const attacker = action.attacker === 'player' ? this.playerSprite : this.opponentSprite;
    const defender = action.attacker === 'player' ? this.opponentSprite : this.playerSprite;

    // Determine animation type
    switch (action.action) {
      case 'attack':
        await this.playAttackAnimation(attacker, defender, action.damage || 0, false);
        break;

      case 'critical':
        await this.playAttackAnimation(attacker, defender, action.damage || 0, true);
        break;

      case 'dodge':
        await this.playDodgeAnimation(attacker, defender);
        break;

      case 'skill':
        // Epic 6: Skills will be animated here
        await this.playAttackAnimation(attacker, defender, action.damage || 0, false);
        break;
    }

    // Update HP bars to match action result
    this.updateHPBars(action);

    // Small delay between actions for readability
    await this.wait(200);
  }

  /**
   * Play attack animation (normal or critical)
   */
  private async playAttackAnimation(
    attacker: CombatSprite,
    defender: CombatSprite,
    damage: number,
    isCritical: boolean
  ): Promise<void> {
    // Attacker: move forward, attack, return
    const attackerOriginalX = attacker.sprite.x;
    const moveDistance = attacker === this.playerSprite ? 50 : -50;

    // Move forward
    await this.tweenPromise({
      targets: attacker.sprite,
      x: attackerOriginalX + moveDistance,
      duration: 200,
      ease: 'Power2',
    });

    // Attack animation (if sprite has attack animation, play it here)
    // For now, just a quick scale animation
    await this.tweenPromise({
      targets: attacker.sprite,
      scaleX: 1.2,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
    });

    // Hit effect on defender
    this.playHitEffect(defender);

    // Show damage number
    const damageType: DamageNumberType = isCritical ? 'critical' : 'normal';
    this.damageNumberPool.spawn({
      x: defender.sprite.x,
      y: defender.sprite.y - 50,
      damage,
      type: damageType,
    });

    // Screen shake for crits
    if (isCritical) {
      this.scene.cameras.main.shake(200, 0.005);
    }

    // Return to original position
    await this.tweenPromise({
      targets: attacker.sprite,
      x: attackerOriginalX,
      duration: 200,
      ease: 'Power2',
    });
  }

  /**
   * Play dodge animation
   */
  private async playDodgeAnimation(
    attacker: CombatSprite,
    defender: CombatSprite
  ): Promise<void> {
    // Attacker: quick move forward
    const attackerOriginalX = attacker.sprite.x;
    const moveDistance = attacker === this.playerSprite ? 30 : -30;

    await this.tweenPromise({
      targets: attacker.sprite,
      x: attackerOriginalX + moveDistance,
      duration: 150,
      ease: 'Power2',
    });

    // Defender: dodge animation (quick back and forth)
    const defenderOriginalX = defender.sprite.x;
    const dodgeDistance = defender === this.playerSprite ? -20 : 20;

    await Promise.all([
      this.tweenPromise({
        targets: defender.sprite,
        x: defenderOriginalX + dodgeDistance,
        alpha: 0.5,
        duration: 100,
        yoyo: true,
      }),
      // Show MISS text
      new Promise<void>((resolve) => {
        this.damageNumberPool.spawn({
          x: defender.sprite.x,
          y: defender.sprite.y - 50,
          damage: 0,
          type: 'miss',
        });
        resolve();
      }),
    ]);

    // Return attacker
    await this.tweenPromise({
      targets: attacker.sprite,
      x: attackerOriginalX,
      duration: 150,
      ease: 'Power2',
    });
  }

  /**
   * Play hit effect on defender
   */
  private playHitEffect(defender: CombatSprite): void {
    // Flash red
    this.scene.tweens.add({
      targets: defender.sprite,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        defender.sprite.clearTint();
      },
    });

    // Shake sprite
    this.scene.tweens.add({
      targets: defender.sprite,
      x: defender.sprite.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });

    // Flash HP bar
    defender.healthBar.flash();
  }

  /**
   * Update HP bars based on action result
   */
  private updateHPBars(action: CombatAction): void {
    // Update player HP
    if (this.playerSprite.currentHp !== action.hpRemaining.player) {
      this.playerSprite.currentHp = action.hpRemaining.player;
      this.playerSprite.healthBar.setHP(action.hpRemaining.player, true);
    }

    // Update opponent HP
    if (this.opponentSprite.currentHp !== action.hpRemaining.opponent) {
      this.opponentSprite.currentHp = action.hpRemaining.opponent;
      this.opponentSprite.healthBar.setHP(action.hpRemaining.opponent, true);
    }
  }

  /**
   * Play defeat animation when combatant's HP reaches 0
   */
  public async playDefeatAnimation(side: 'player' | 'opponent'): Promise<void> {
    const sprite = side === 'player' ? this.playerSprite : this.opponentSprite;

    // Fade out and fall
    await this.tweenPromise({
      targets: sprite.sprite,
      alpha: 0.3,
      y: sprite.sprite.y + 30,
      angle: 90,
      duration: 800,
      ease: 'Power2',
    });
  }

  /**
   * Play victory animation for winner
   */
  public async playVictoryAnimation(side: 'player' | 'opponent'): Promise<void> {
    const sprite = side === 'player' ? this.playerSprite : this.opponentSprite;

    // Jump and celebrate
    await this.tweenPromise({
      targets: sprite.sprite,
      y: sprite.sprite.y - 30,
      duration: 300,
      yoyo: true,
      ease: 'Power2',
    });
  }

  /**
   * Helper: Convert Phaser tween to Promise
   */
  private tweenPromise(config: Phaser.Types.Tweens.TweenBuilderConfig): Promise<void> {
    return new Promise((resolve) => {
      this.scene.tweens.add({
        ...config,
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  /**
   * Helper: Wait for specified milliseconds
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.scene.time.delayedCall(ms, () => resolve());
    });
  }
}
