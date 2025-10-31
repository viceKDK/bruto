/**
 * Panel - Reusable panel component
 * Container with background and optional title
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/theme';

export interface PanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}

export class Panel extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private border?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;
  private readonly panelWidth: number;
  private readonly panelHeight: number;
  private readonly borderWidth: number;

  constructor(scene: Phaser.Scene, config: PanelConfig) {
    super(scene, config.x, config.y);

    const bgColor = config.backgroundColor || COLORS.background;
    const borderColor = config.borderColor || COLORS.border;
    this.borderWidth = config.borderWidth || 2;
    this.panelWidth = config.width;
    this.panelHeight = config.height;

    // Border
    if (this.borderWidth > 0) {
      this.border = scene.add.rectangle(
        0,
        0,
        this.panelWidth,
        this.panelHeight,
        parseInt(borderColor.replace('#', '0x'))
      );
      this.add(this.border);
    }

    // Background
    this.bg = scene.add.rectangle(
      0,
      0,
      this.panelWidth - this.borderWidth * 2,
      this.panelHeight - this.borderWidth * 2,
      parseInt(bgColor.replace('#', '0x'))
    );
    this.add(this.bg);

    // Title
    if (config.title) {
      this.titleText = scene.add.text(
        -config.width / 2 + SPACING.md,
        -config.height / 2 + SPACING.md,
        config.title,
        {
          fontSize: `${TYPOGRAPHY.fontSize.lg}px`,
          color: COLORS.textPrimary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          fontStyle: 'bold',
        }
      );
      this.titleText.setOrigin(0, 0);
      this.add(this.titleText);
    }

    scene.add.existing(this);
  }

  public setTitle(title: string): void {
    if (this.titleText) {
      this.titleText.setText(title);
    }
  }

  public getWidth(): number {
    return this.panelWidth;
  }

  public getHeight(): number {
    return this.panelHeight;
  }

  public getContentWidth(): number {
    return this.panelWidth - this.borderWidth * 2;
  }

  public getContentHeight(): number {
    return this.panelHeight - this.borderWidth * 2;
  }

  public getBorderWidth(): number {
    return this.borderWidth;
  }
}
