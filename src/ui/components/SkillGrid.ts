/**
 * SkillGrid - Displays a 7x7 grid of skills with optional tooltips
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY, LAYOUT } from '../../utils/theme';
import { Tooltip } from './Tooltip';

export type SkillCellState = 'known' | 'empty';

export interface SkillCell {
  id: string;
  name?: string;
  state: SkillCellState;
  description?: string;
}

export interface SkillGridConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  cells: SkillCell[];
  columns?: number;
  tooltip?: (cell: SkillCell) => string;
  onClick?: (cell: SkillCell) => void; // Story 6.7: Click handler for skill details
}

export class SkillGrid extends Phaser.GameObjects.Container {
  private readonly cells: SkillCell[];
  private readonly columns: number;
  private readonly tooltip?: Tooltip;
  private readonly tooltipProvider?: (cell: SkillCell) => string;

  constructor(scene: Phaser.Scene, config: SkillGridConfig) {
    super(scene, config.x, config.y);
    this.cells = config.cells;
    this.columns = config.columns ?? 7;
    this.tooltipProvider = config.tooltip;

    const padding = 12;
    const usableWidth = config.width - padding * 2;
    const usableHeight = config.height - padding * 2;
    const rows = Math.max(1, Math.ceil(this.cells.length / this.columns));

    const cellWidth = usableWidth / this.columns;
    const cellHeight = usableHeight / rows;
    const startX = -usableWidth / 2 + cellWidth / 2;
    const startY = -usableHeight / 2 + cellHeight / 2;

    if (this.tooltipProvider) {
      this.tooltip = new Tooltip(scene, {
        maxWidth: Math.min(config.width * 0.9, 320),
      });
      this.tooltip.setDepth(LAYOUT.zIndex.tooltip);
      this.tooltip.hide();
    }

    this.cells.forEach((cell, index) => {
      const col = index % this.columns;
      const row = Math.floor(index / this.columns);

      const cellX = startX + col * cellWidth;
      const cellY = startY + row * cellHeight;

      const cellContainer = scene.add.container(cellX, cellY);

      const background = scene.add.rectangle(
        0,
        0,
        cellWidth * 0.82,
        cellHeight * 0.82,
        parseInt((cell.state === 'known' ? COLORS.primary : COLORS.surface).replace('#', '0x')),
        cell.state === 'known' ? 0.35 : 0.4
      );
      background.setStrokeStyle(
        2,
        parseInt((cell.state === 'known' ? COLORS.primaryLight : COLORS.border).replace('#', '0x')),
        0.9
      );
      cellContainer.add(background);

      const label = scene.add.text(0, 0, cell.name ?? 'Pendiente', {
        fontSize: `${Math.max(TYPOGRAPHY.fontSize.xs, cellHeight * 0.2)}px`,
        color: cell.state === 'known' ? COLORS.textPrimary : COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        wordWrap: { width: cellWidth * 0.75 },
        align: 'center',
      });
      label.setOrigin(0.5);
      cellContainer.add(label);

      const interactionZone = scene.add.zone(
        0,
        0,
        cellWidth * 0.82,
        cellHeight * 0.82
      );
      interactionZone.setOrigin(0.5);
      interactionZone.setInteractive({ useHandCursor: true });
      cellContainer.add(interactionZone);

      interactionZone.on('pointerover', (pointer: Phaser.Input.Pointer) => {
        background.setFillStyle(
          parseInt((cell.state === 'known' ? COLORS.primaryLight : COLORS.surface).replace('#', '0x')),
          0.6
        );
        label.setColor(COLORS.textPrimary);

        if (this.tooltip && this.tooltipProvider) {
          const content = this.tooltipProvider(cell);
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
        background.setFillStyle(
          parseInt((cell.state === 'known' ? COLORS.primary : COLORS.surface).replace('#', '0x')),
          cell.state === 'known' ? 0.35 : 0.4
        );
        label.setColor(cell.state === 'known' ? COLORS.textPrimary : COLORS.textSecondary);
        this.tooltip?.hide();
      });

      // Story 6.7: Click handler for skill details modal
      interactionZone.on('pointerdown', () => {
        if (cell.state === 'known' && config.onClick) {
          config.onClick(cell);
        }
      });

      this.add(cellContainer);
    });

    if (this.cells.every((cell) => cell.state === 'empty')) {
      const emptyState = scene.add.text(
        0,
        usableHeight / 2 + padding,
        'Sin habilidades aprendidas.\nDesbloquea habilidades en futuras epicas.',
        {
          fontSize: `${Math.max(TYPOGRAPHY.fontSize.sm, 16)}px`,
          color: COLORS.textSecondary,
          align: 'center',
          fontFamily: TYPOGRAPHY.fontFamily.primary,
        }
      );
      emptyState.setOrigin(0.5);
      this.add(emptyState);
    }

    scene.add.existing(this);
  }

  override destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
    this.tooltip?.destroy();
  }
}
