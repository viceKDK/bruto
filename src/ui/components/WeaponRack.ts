/**
 * WeaponRack - Displays weapon slots in a 7-wide grid with tooltip overlays
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, LAYOUT } from '../../utils/theme';
import { Tooltip } from './Tooltip';

export interface WeaponSlot {
  id: string;
  name?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
  acquiredAtLevel?: number;
}

export interface WeaponRackConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  slots: WeaponSlot[];
  columns?: number;
  tooltip?: (slot: WeaponSlot) => string;
}

export class WeaponRack extends Phaser.GameObjects.Container {
  private readonly slots: WeaponSlot[];
  private readonly columns: number;
  private readonly tooltip?: Tooltip;
  private readonly tooltipProvider?: (slot: WeaponSlot) => string;

  constructor(scene: Phaser.Scene, config: WeaponRackConfig) {
    super(scene, config.x, config.y);
    this.slots = config.slots;
    this.columns = config.columns ?? 7;
    this.tooltipProvider = config.tooltip;

    const slotPadding = 12;
    const usableWidth = config.width - slotPadding * 2;
    const usableHeight = config.height - slotPadding * 2;
    const rows = Math.max(1, Math.ceil(this.slots.length / this.columns));

    const slotWidth = usableWidth / this.columns;
    const slotHeight = usableHeight / Math.max(rows, 2);
    const startX = -usableWidth / 2 + slotWidth / 2;
    const startY = -usableHeight / 2 + slotHeight / 2;

    if (this.tooltipProvider) {
      this.tooltip = new Tooltip(scene, {
        maxWidth: Math.min(config.width * 0.9, 320),
      });
      this.tooltip.setDepth(LAYOUT.zIndex.tooltip);
      this.tooltip.hide();
    }

    this.slots.forEach((slot, index) => {
      const col = index % this.columns;
      const row = Math.floor(index / this.columns);

      const slotX = startX + col * slotWidth;
      const slotY = startY + row * slotHeight;

      const slotContainer = scene.add.container(slotX, slotY);

      const slotBackground = scene.add.rectangle(
        0,
        0,
        slotWidth * 0.82,
        slotHeight * 0.8,
        parseInt(COLORS.surface.replace('#', '0x')),
        0.45
      );
      slotBackground.setStrokeStyle(2, parseInt(COLORS.border.replace('#', '0x')), 0.8);
      slotContainer.add(slotBackground);

      const label = scene.add.text(0, slotHeight * 0.25, slot.name ?? 'Libre', {
        fontSize: `${Math.max(TYPOGRAPHY.fontSize.xs, slotHeight * 0.18)}px`,
        color: slot.name ? COLORS.textPrimary : COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        wordWrap: { width: slotWidth * 0.7 },
        align: 'center',
      });
      label.setOrigin(0.5, 0);
      slotContainer.add(label);

      const interactionZone = scene.add.zone(
        0,
        0,
        slotWidth * 0.82,
        slotHeight * 0.8
      );
      interactionZone.setOrigin(0.5);
      interactionZone.setInteractive({ useHandCursor: true });
      slotContainer.add(interactionZone);

      interactionZone.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        slotBackground.setFillStyle(parseInt(COLORS.surface.replace('#', '0x')), 0.7);
        label.setColor(COLORS.textPrimary);

        if (this.tooltip && this.tooltipProvider) {
          const content = this.tooltipProvider(slot);
          if (content) {
            this.tooltip.showAt(pointer.worldX + 16, pointer.worldY, content);
          }
        }
      });

      interactionZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.tooltip?.visible) {
          this.tooltip.moveTo(pointer.worldX + 16, pointer.worldY);
        }
      });

      interactionZone.on('pointerout', () => {
        slotBackground.setFillStyle(parseInt(COLORS.surface.replace('#', '0x')), 0.45);
        label.setColor(slot.name ? COLORS.textPrimary : COLORS.textSecondary);
        this.tooltip?.hide();
      });

      slotContainer.setDepth(1);
      this.add(slotContainer);
    });

    if (this.slots.every((slot) => !slot.name)) {
      const emptyState = scene.add.text(
        0,
        usableHeight / 2 + slotPadding,
        'Sin armas equipadas.\nCompleta la Epic 5 para desbloquear arsenal.',
        {
          fontSize: `${Math.max(TYPOGRAPHY.fontSize.sm, 16)}px`,
          color: COLORS.textSecondary,
          align: 'center',
          fontFamily: TYPOGRAPHY.fontFamily.primary,
        }
      );
      emptyState.setOrigin(0.5);
      emptyState.setDepth(0);
      this.add(emptyState);
    }

    scene.add.existing(this);
  }

  override destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
    this.tooltip?.destroy();
  }
}
