/**
 * BattleLog - Scrollable list of recent battles
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, LAYOUT } from '../../utils/theme';

export type BattleResult = 'win' | 'loss';

export interface BattleLogEntry {
  id: string;
  opponent: string;
  result: BattleResult;
  timestamp: string;
  summary: string;
}

export interface BattleLogConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  entries: BattleLogEntry[];
}

export class BattleLog extends Phaser.GameObjects.Container {
  private readonly entries: BattleLogEntry[];
  private readonly viewportHeight: number;
  private readonly viewportWidth: number;
  private readonly visibleHeight: number;
  private readonly visibleWidth: number;
  private readonly padding = 16;
  private readonly baseContentY: number;
  private readonly content: Phaser.GameObjects.Container;
  private scrollOffset = 0;
  private maxScroll = 0;
  private maskShape: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: BattleLogConfig) {
    super(scene, config.x, config.y);
    this.entries = config.entries;
    this.viewportHeight = config.height;
    this.viewportWidth = config.width;
    this.visibleHeight = this.viewportHeight - this.padding * 2;
    this.visibleWidth = this.viewportWidth - this.padding * 2;
    this.baseContentY = -this.visibleHeight / 2;

    const background = scene.add.rectangle(
      0,
      0,
      this.viewportWidth,
      this.viewportHeight,
      parseInt(COLORS.surface.replace('#', '0x')),
      0.35
    );
    background.setStrokeStyle(2, parseInt(COLORS.border.replace('#', '0x')), 0.9);
    background.setOrigin(0.5);
    this.add(background);

    this.content = scene.add.container(-this.visibleWidth / 2, this.baseContentY);
    this.add(this.content);

    let currentY = 0;
    const rowSpacing = 8;

    if (this.entries.length === 0) {
      const emptyState = scene.add.text(
        this.visibleWidth / 2,
        this.visibleHeight / 2,
        'Sin combates recientes.\nDesafia a un oponente para llenar el registro!',
        {
          fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
          color: COLORS.textSecondary,
          align: 'center',
          fontFamily: TYPOGRAPHY.fontFamily.primary,
        }
      );
      emptyState.setOrigin(0.5);
      this.content.add(emptyState);
    } else {
      this.entries.forEach((entry, index) => {
        const entryContainer = scene.add.container(0, currentY);

        const resultColor =
          entry.result === 'win'
            ? COLORS.success
            : entry.result === 'loss'
              ? COLORS.error
              : COLORS.info;

        const header = scene.add.text(0, 0, `${index + 1}. vs ${entry.opponent}`, {
          fontSize: `${TYPOGRAPHY.fontSize.base}px`,
          color: COLORS.textPrimary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
        });
        entryContainer.add(header);

        const timestamp = scene.add.text(
          visibleWidth - 4,
          0,
          entry.timestamp,
          {
            fontSize: `${TYPOGRAPHY.fontSize.xs}px`,
            color: COLORS.textSecondary,
            fontFamily: TYPOGRAPHY.fontFamily.primary,
          }
        );
        timestamp.setOrigin(1, 0);
        entryContainer.add(timestamp);

        const summary = scene.add.text(
          0,
          header.height + 4,
          entry.summary,
          {
            fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
            color: COLORS.textSecondary,
          wordWrap: { width: this.visibleWidth },
            fontFamily: TYPOGRAPHY.fontFamily.primary,
          }
        );
        entryContainer.add(summary);

        const resultBadge = scene.add.text(
          0,
          summary.y + summary.height + 4,
          entry.result === 'win' ? 'Victoria' : 'Derrota',
          {
            fontSize: `${TYPOGRAPHY.fontSize.xs}px`,
            color: resultColor,
            fontFamily: TYPOGRAPHY.fontFamily.primary,
            fontStyle: 'bold',
          }
        );
        entryContainer.add(resultBadge);

        const separator = scene.add.rectangle(
          this.visibleWidth / 2,
          resultBadge.y + resultBadge.height + 6,
          this.visibleWidth,
          1,
          parseInt(COLORS.border.replace('#', '0x')),
          0.5
        );
        separator.setOrigin(0.5);
        entryContainer.add(separator);

        this.content.add(entryContainer);
        currentY += separator.y + rowSpacing;
      });
    }

    this.maxScroll = Math.max(0, currentY - this.visibleHeight);
    this.content.y = this.baseContentY;

    this.maskShape = scene.make.graphics({ x: 0, y: 0, add: false });
    this.maskShape.fillStyle(0xffffff);
    this.maskShape.fillRoundedRect(
      -this.visibleWidth / 2,
      -this.visibleHeight / 2,
      this.visibleWidth,
      this.visibleHeight,
      6
    );

    const mask = this.maskShape.createGeometryMask();
    this.content.setMask(mask);

    this.setSize(this.viewportWidth, this.viewportHeight);
    this.setInteractive();

    this.scene.input.on('wheel', this.handleWheel, this);

    scene.add.existing(this);
  }

  override destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
    this.scene.input.off('wheel', this.handleWheel, this);
    if (this.maskShape) {
      this.maskShape.destroy();
    }
  }

  private handleWheel(
    pointer: Phaser.Input.Pointer,
    _over: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number
  ): void {
    if (!pointer.withinGame) {
      return;
    }

    const localPoint = new Phaser.Math.Vector2();
    this.pointToContainer(pointer.worldX, pointer.worldY, localPoint);
    const halfWidth = this.viewportWidth / 2;
    const halfHeight = this.viewportHeight / 2;

    if (Math.abs(localPoint.x) > halfWidth || Math.abs(localPoint.y) > halfHeight) {
      return;
    }

    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + deltaY * 0.3, 0, this.maxScroll);
    this.content.y = this.baseContentY - this.scrollOffset;
  }
}
