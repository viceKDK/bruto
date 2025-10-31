/**
 * HealthBar - HP bar component with smooth transitions
 *
 * Displays current/max HP with animated bar fill and color coding.
 * Uses Phaser tweens for smooth damage animation.
 */

import Phaser from 'phaser';
import { COLORS } from '../utils/theme';

export interface HealthBarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  maxHp: number;
  currentHp: number;
  showText?: boolean;
  barColor?: number;
  bgColor?: number;
  borderColor?: number;
}

export class HealthBar extends Phaser.GameObjects.Container {
  private maxHp: number;
  private currentHp: number;
  private config: HealthBarConfig;

  private background: Phaser.GameObjects.Rectangle;
  private bar: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private hpText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: HealthBarConfig) {
    super(scene, config.x, config.y);

    this.maxHp = config.maxHp;
    this.currentHp = config.currentHp;
    this.config = config;

    // Background (empty bar)
    this.background = scene.add.rectangle(
      0,
      0,
      config.width,
      config.height,
      config.bgColor ?? 0x222222
    );
    this.background.setOrigin(0, 0.5);

    // HP bar (fill)
    this.bar = scene.add.rectangle(
      0,
      0,
      config.width,
      config.height,
      config.barColor ?? this.getBarColor(this.currentHp / this.maxHp)
    );
    this.bar.setOrigin(0, 0.5);

    // Border
    this.border = scene.add.rectangle(
      0,
      0,
      config.width,
      config.height
    );
    this.border.setOrigin(0, 0.5);
    this.border.setStrokeStyle(2, config.borderColor ?? 0x666666);
    this.border.isFilled = false;

    // HP text (optional)
    if (config.showText) {
      this.hpText = scene.add.text(
        config.width / 2,
        0,
        `${this.currentHp} / ${this.maxHp}`,
        {
          fontSize: '14px',
          color: COLORS.textPrimary,
          fontStyle: 'bold',
        }
      );
      this.hpText.setOrigin(0.5, 0.5);
      this.add(this.hpText);
    }

    this.add([this.background, this.bar, this.border]);
    scene.add.existing(this);

    this.updateBarWidth();
  }

  /**
   * Update HP with smooth tween animation
   */
  public setHP(newHp: number, animate: boolean = true): void {
    const previousHp = this.currentHp;
    this.currentHp = Math.max(0, Math.min(newHp, this.maxHp));

    if (animate && previousHp !== this.currentHp) {
      // Animate bar width change
      const targetWidth = this.calculateBarWidth();

      this.scene.tweens.add({
        targets: this.bar,
        displayWidth: targetWidth,
        duration: 300,
        ease: 'Power2',
        onUpdate: () => {
          // Update color during animation
          const hpPercent = this.currentHp / this.maxHp;
          this.bar.setFillStyle(this.config.barColor ?? this.getBarColor(hpPercent));
        },
      });

      // Update text
      if (this.hpText) {
        this.scene.tweens.add({
          targets: { hp: previousHp },
          hp: this.currentHp,
          duration: 300,
          onUpdate: (tween) => {
            const tweenValue = tween.getValue();
            const value = Math.floor(typeof tweenValue === 'number' ? tweenValue : previousHp);
            this.hpText!.setText(`${value} / ${this.maxHp}`);
          },
        });
      }
    } else {
      // Instant update
      this.updateBarWidth();
      if (this.hpText) {
        this.hpText.setText(`${this.currentHp} / ${this.maxHp}`);
      }
    }
  }

  /**
   * Get current HP value
   */
  public getHP(): number {
    return this.currentHp;
  }

  /**
   * Get HP percentage (0.0 - 1.0)
   */
  public getHPPercent(): number {
    return this.currentHp / this.maxHp;
  }

  /**
   * Update bar width based on current HP
   */
  private updateBarWidth(): void {
    const width = this.calculateBarWidth();
    this.bar.displayWidth = width;

    const hpPercent = this.currentHp / this.maxHp;
    this.bar.setFillStyle(this.config.barColor ?? this.getBarColor(hpPercent));
  }

  /**
   * Calculate bar width based on HP percentage
   */
  private calculateBarWidth(): number {
    const hpPercent = this.currentHp / this.maxHp;
    return this.config.width * hpPercent;
  }

  /**
   * Get bar color based on HP percentage
   * Green (high HP) → Yellow (medium) → Red (low)
   */
  private getBarColor(hpPercent: number): number {
    if (hpPercent > 0.6) {
      return 0x00ff00; // Green
    } else if (hpPercent > 0.3) {
      return 0xffaa00; // Yellow/Orange
    } else {
      return 0xff0000; // Red
    }
  }

  /**
   * Flash bar for damage indication
   */
  public flash(): void {
    this.scene.tweens.add({
      targets: this.bar,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1,
    });
  }
}
