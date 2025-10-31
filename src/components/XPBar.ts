 /**
 * XPBar - Experience progress bar component (Story 8.1)
 * 
 * Displays current XP progress towards next level.
 */

import Phaser from 'phaser';
import { ProgressionService } from '../services/ProgressionService';

export interface XPBarConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  currentXP: number;
  currentLevel: number;
  showText?: boolean;
  barColor?: number;
  bgColor?: number;
  borderColor?: number;
}

export class XPBar extends Phaser.GameObjects.Container {
  private config: XPBarConfig;
  private background: Phaser.GameObjects.Rectangle;
  private bar: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private xpText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: XPBarConfig) {
    super(scene, config.x, config.y);

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

    // XP bar (filled portion)
    const xpInfo = ProgressionService.getXPInfo({
      xp: config.currentXP,
      level: config.currentLevel
    });
    
    const fillWidth = (xpInfo.progressPercentage / 100) * config.width;
    this.bar = scene.add.rectangle(
      0,
      0,
      fillWidth,
      config.height,
      config.barColor ?? 0x4488ff
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
    this.border.setFillStyle(0x000000, 0); // Transparent fill

    // XP Text
    if (config.showText) {
      this.xpText = scene.add.text(
        config.width / 2,
        0,
        `${xpInfo.xpInCurrentLevel} / ${xpInfo.xpForNextLevel} XP`,
        {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }
      );
      this.xpText.setOrigin(0.5);

      // Level label above bar
      this.levelText = scene.add.text(
        config.width / 2,
        -config.height,
        `Level ${config.currentLevel}`,
        {
          fontSize: '16px',
          color: '#FFD700',
          fontStyle: 'bold',
        }
      );
      this.levelText.setOrigin(0.5);
    }

    // Add to container
    this.add([this.background, this.bar, this.border]);
    if (this.xpText) this.add(this.xpText);
    if (this.levelText) this.add(this.levelText);

    scene.add.existing(this);
  }

  /**
   * Update XP bar with new values
   */
  updateXP(currentXP: number, currentLevel: number): void {
    this.config.currentXP = currentXP;
    this.config.currentLevel = currentLevel;

    const xpInfo = ProgressionService.getXPInfo({
      xp: currentXP,
      level: currentLevel
    });

    // Animate bar width change
    const fillWidth = (xpInfo.progressPercentage / 100) * this.config.width;
    this.scene.tweens.add({
      targets: this.bar,
      width: fillWidth,
      duration: 500,
      ease: 'Power2',
    });

    // Update text
    if (this.xpText) {
      this.xpText.setText(`${xpInfo.xpInCurrentLevel} / ${xpInfo.xpForNextLevel} XP`);
    }

    if (this.levelText) {
      this.levelText.setText(`Level ${currentLevel}`);
    }
  }

  /**
   * Show level up animation
   */
  showLevelUp(): void {
    if (!this.levelText) return;

    // Flash animation
    this.scene.tweens.add({
      targets: this.levelText,
      scale: { from: 1, to: 1.3 },
      alpha: { from: 1, to: 0.5 },
      yoyo: true,
      repeat: 3,
      duration: 200,
    });
  }
}
