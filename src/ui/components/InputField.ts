/**
 * InputField - Reusable text input component
 * Handles text input with placeholder and validation
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/theme';

export interface InputFieldConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  placeholder?: string;
  maxLength?: number;
  type?: 'text' | 'password';
  onChange?: (value: string) => void;
}

export class InputField extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;
  private value: string = '';
  private config: InputFieldConfig;
  private isFocused: boolean = false;

  constructor(scene: Phaser.Scene, config: InputFieldConfig) {
    super(scene, config.x, config.y);
    this.config = config;

    const width = config.width || 300;
    const height = config.height || 40;

    // Background
    this.bg = scene.add.rectangle(0, 0, width, height, parseInt(COLORS.inputBg.replace('#', '0x')));
    this.add(this.bg);

    // Label/Text
    this.label = scene.add.text(-width / 2 + SPACING.sm, 0, config.placeholder || '', {
      fontSize: `${TYPOGRAPHY.fontSize.base}px`,
      color: COLORS.textSecondary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
    });
    this.label.setOrigin(0, 0.5);
    this.add(this.label);

    // Make interactive
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });

    this.on('pointerdown', () => {
      this.focus();
    });

    scene.add.existing(this);
  }

  private focus(): void {
    if (this.isFocused) return;

    this.isFocused = true;
    this.bg.setStrokeStyle(2, parseInt(COLORS.primary.replace('#', '0x')));

    // Clear placeholder if empty
    if (this.value === '') {
      this.label.setText('');
      this.label.setColor(COLORS.textPrimary);
    }

    // Listen for keyboard input (simplified - real implementation would use DOM input)
    // In production, this should overlay a DOM input element
    console.log('[InputField] Focused - DOM input overlay should be created here');
  }

  public setValue(value: string): void {
    this.value = value;

    if (this.config.type === 'password') {
      this.label.setText('•'.repeat(value.length));
    } else {
      this.label.setText(value);
    }

    if (this.config.onChange) {
      this.config.onChange(value);
    }
  }

  public getValue(): string {
    return this.value;
  }

  public blur(): void {
    this.isFocused = false;
    this.bg.setStrokeStyle(0);

    if (this.value === '') {
      this.label.setText(this.config.placeholder || '');
      this.label.setColor(COLORS.textSecondary);
    }
  }
}
