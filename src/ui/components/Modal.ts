/**
 * Modal - Reusable modal dialog component
 * Displays content over a semi-transparent backdrop
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/theme';
import { Panel } from './Panel';
import { Button } from './Button';

export interface ModalConfig {
  title: string;
  content: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  width?: number;
  height?: number;
}

export class Modal extends Phaser.GameObjects.Container {
  private backdrop: Phaser.GameObjects.Rectangle;
  private panel: Panel;
  private contentText: Phaser.GameObjects.Text;
  private confirmButton?: Button;
  private cancelButton?: Button;

  constructor(scene: Phaser.Scene, config: ModalConfig) {
    super(scene, 0, 0);

    const width = config.width || 400;
    const height = config.height || 300;

    // Backdrop
    this.backdrop = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
    this.backdrop.setInteractive();
    this.add(this.backdrop);

    // Panel
    this.panel = new Panel(scene, {
      x: 640,
      y: 360,
      width,
      height,
      title: config.title,
    });
    this.add(this.panel);

    // Content
    this.contentText = scene.add.text(640, 340, config.content, {
      fontSize: `${TYPOGRAPHY.fontSize.base}px`,
      color: COLORS.textPrimary,
      fontFamily: TYPOGRAPHY.fontFamily.primary,
      align: 'center',
      wordWrap: { width: width - SPACING.xl * 2 },
    });
    this.contentText.setOrigin(0.5);
    this.add(this.contentText);

    // Buttons
    const buttonY = 360 + height / 2 - 60;

    if (config.onConfirm) {
      const buttonX = config.onCancel ? 640 + 60 : 640;
      this.confirmButton = new Button(scene, {
        x: buttonX,
        y: buttonY,
        text: config.confirmText || 'Confirm',
        onClick: () => {
          config.onConfirm!();
          this.close();
        },
        style: 'primary',
      });
      this.add(this.confirmButton);
    }

    if (config.onCancel) {
      const buttonX = config.onConfirm ? 640 - 60 : 640;
      this.cancelButton = new Button(scene, {
        x: buttonX,
        y: buttonY,
        text: config.cancelText || 'Cancel',
        onClick: () => {
          config.onCancel!();
          this.close();
        },
        style: 'secondary',
      });
      this.add(this.cancelButton);
    }

    this.setDepth(1000);
    scene.add.existing(this);
  }

  public close(): void {
    this.destroy();
  }
}
