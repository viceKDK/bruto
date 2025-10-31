/**
 * Button - Reusable button component
 * Handles hover states, click events, and styling
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY } from '../../utils/theme';

export interface ButtonConfig {
  x: number;
  y: number;
  text: string;
  onClick: () => void;
  width?: number;
  height?: number;
  style?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private config: ButtonConfig;

  constructor(scene: Phaser.Scene, config: ButtonConfig) {
    super(scene, config.x, config.y);
    this.config = config;

    const width = config.width || 200;
    const height = config.height || 50;
    const style = config.style || 'primary';

    // Background
    this.bg = scene.add.rectangle(0, 0, width, height, this.getColor(style));
    this.add(this.bg);

    // Label
    this.label = scene.add.text(0, 0, config.text, {
      fontSize: `${TYPOGRAPHY.fontSize.base}px`,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    // Make interactive
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: !config.disabled });

    if (!config.disabled) {
      this.setupInteractivity();
    } else {
      this.setAlpha(0.5);
    }

    scene.add.existing(this);
  }

  private getColor(style: 'primary' | 'secondary' | 'danger'): number {
    switch (style) {
      case 'primary':
        return parseInt(COLORS.primary.replace('#', '0x'));
      case 'secondary':
        return parseInt(COLORS.secondary.replace('#', '0x'));
      case 'danger':
        return parseInt(COLORS.damage.replace('#', '0x'));
      default:
        return parseInt(COLORS.primary.replace('#', '0x'));
    }
  }

  private setupInteractivity(): void {
    this.on('pointerover', () => {
      this.bg.setFillStyle(this.getColor(this.config.style || 'primary'), 0.8);
      this.setScale(1.05);
    });

    this.on('pointerout', () => {
      this.bg.setFillStyle(this.getColor(this.config.style || 'primary'), 1);
      this.setScale(1);
    });

    this.on('pointerdown', () => {
      this.setScale(0.95);
    });

    this.on('pointerup', () => {
      this.setScale(1.05);
      this.config.onClick();
    });
  }

  public setText(text: string): void {
    this.label.setText(text);
  }

  public setDisabled(disabled: boolean): void {
    this.config.disabled = disabled;
    this.setAlpha(disabled ? 0.5 : 1);
    this.setInteractive({ useHandCursor: !disabled });

    if (!disabled) {
      this.setupInteractivity();
    } else {
      this.removeAllListeners();
    }
  }
}
