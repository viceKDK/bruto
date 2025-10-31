/**
 * DamageNumber - Floating damage text with color coding
 *
 * Shows damage/miss text with tween animations (float up, fade out).
 * Color-coded: Red (crit), White (normal), Gray (miss/dodge).
 */

import Phaser from 'phaser';

export type DamageNumberType = 'normal' | 'critical' | 'miss';

export interface DamageNumberConfig {
  x: number;
  y: number;
  damage: number;
  type: DamageNumberType;
}

export class DamageNumber extends Phaser.GameObjects.Text {
  private isActive: boolean = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, '', {
      fontSize: '24px',
      fontStyle: 'bold',
    });

    this.setOrigin(0.5);
    this.setVisible(false);
    scene.add.existing(this);
  }

  /**
   * Activate and show damage number with animation
   */
  public show(config: DamageNumberConfig): void {
    this.isActive = true;
    this.setPosition(config.x, config.y);
    this.setVisible(true);
    this.setAlpha(1);
    this.setScale(1);

    // Set text and color based on type
    if (config.type === 'miss') {
      this.setText('MISS');
      this.setColor('#888888'); // Gray
      this.setFontSize('20px');
    } else if (config.type === 'critical') {
      this.setText(config.damage.toString());
      this.setColor('#ff0000'); // Red
      this.setFontSize('32px'); // Larger for crits
    } else {
      this.setText(config.damage.toString());
      this.setColor('#ffffff'); // White
      this.setFontSize('24px');
    }

    // Animation: float up and fade out
    this.scene.tweens.add({
      targets: this,
      y: config.y - 80, // Float up 80 pixels
      alpha: 0,
      scale: config.type === 'critical' ? 1.3 : 1, // Scale up crits
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        this.deactivate();
      },
    });
  }

  /**
   * Deactivate and return to pool
   */
  public deactivate(): void {
    this.isActive = false;
    this.setVisible(false);
    // Pool will handle this
  }

  /**
   * Check if currently active
   */
  public getIsActive(): boolean {
    return this.isActive;
  }
}

/**
 * DamageNumberPool - Object pool for damage numbers
 *
 * Reuses DamageNumber instances for performance (60 FPS target).
 * Automatically grows pool when needed.
 */
export class DamageNumberPool {
  private scene: Phaser.Scene;
  private pool: DamageNumber[] = [];

  constructor(scene: Phaser.Scene, initialSize: number = 10) {
    this.scene = scene;

    // Pre-create pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new DamageNumber(scene));
    }
  }

  /**
   * Get damage number from pool (or create new if needed)
   */
  public spawn(config: DamageNumberConfig): DamageNumber {
    // Find inactive damage number
    let damageNumber = this.pool.find((dn) => !dn.getIsActive());

    // If none available, create new one (pool grows)
    if (!damageNumber) {
      damageNumber = new DamageNumber(this.scene);
      this.pool.push(damageNumber);
      console.log(`[DamageNumberPool] Pool expanded to ${this.pool.length}`);
    }

    damageNumber.show(config);
    return damageNumber;
  }

  /**
   * Get pool size info
   */
  public getPoolInfo(): { total: number; active: number; inactive: number } {
    const active = this.pool.filter((dn) => dn.getIsActive()).length;
    return {
      total: this.pool.length,
      active,
      inactive: this.pool.length - active,
    };
  }

  /**
   * Cleanup pool (destroy all objects)
   */
  public destroy(): void {
    this.pool.forEach((dn) => dn.destroy());
    this.pool = [];
  }
}
