/**
 * Tooltip - Lightweight hover tooltip component
 * Displays contextual information above the target position
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, LAYOUT } from '../../utils/theme';

export interface TooltipConfig {
  maxWidth?: number;
  padding?: number;
}

export class Tooltip extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private textObject: Phaser.GameObjects.Text;
  private readonly maxWidth: number;
  private readonly padding: number;

  constructor(scene: Phaser.Scene, config?: TooltipConfig) {
    super(scene, 0, 0);

    this.maxWidth = config?.maxWidth ?? 260;
    this.padding = config?.padding ?? 12;

    this.background = scene.add.rectangle(
      0,
      0,
      this.maxWidth,
      TYPOGRAPHY.fontSize.base + this.padding * 2,
      parseInt(COLORS.surface.replace('#', '0x')),
      0.94
    );
    this.background.setStrokeStyle(2, parseInt(COLORS.border.replace('#', '0x')), 0.9);
    this.background.setOrigin(0.5);
    this.add(this.background);

    this.textObject = scene.add.text(0, 0, '', {
      fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      wordWrap: { width: this.maxWidth - this.padding * 2 },
      align: 'left',
    });
    this.textObject.setOrigin(0.5);
    this.add(this.textObject);

    this.setVisible(false);
    this.setDepth(LAYOUT.zIndex.tooltip);
    scene.add.existing(this);
  }

  public showAt(x: number, y: number, content: string): void {
    this.textObject.setWordWrapWidth(this.maxWidth - this.padding * 2);
    this.textObject.setText(content);

    const bounds = this.textObject.getBounds();
    const backgroundWidth = Math.min(
      Math.max(bounds.width + this.padding * 2, 120),
      this.maxWidth
    );
    const backgroundHeight = bounds.height + this.padding * 2;

    this.background.setDisplaySize(backgroundWidth, backgroundHeight);
    this.setPosition(x, y - backgroundHeight / 2 - 12);
    this.setVisible(true);
    this.scene.children.bringToTop(this);
  }

  public moveTo(x: number, y: number): void {
    if (!this.visible) return;
    const backgroundHeight = this.background.displayHeight;
    this.setPosition(x, y - backgroundHeight / 2 - 12);
  }

  public hide(): void {
    this.setVisible(false);
  }
}
