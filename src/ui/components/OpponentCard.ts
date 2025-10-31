/**
 * OpponentCard - Displays opponent info for selection (Story 9.2)
 * 
 * Visual card showing opponent stats, appearance, and selection state.
 * Used in OpponentSelectionScene for matchmaking UI.
 */

import Phaser from 'phaser';
import { IBruto } from '../../models/Bruto';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/theme';

export interface OpponentCardConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  opponent: IBruto;
  onSelect: (opponent: IBruto) => void;
  selected?: boolean;
}

export class OpponentCard extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private selectedBorder?: Phaser.GameObjects.Rectangle;
  private opponent: IBruto;
  private config: OpponentCardConfig;
  private nameText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;
  private statsContainer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, config: OpponentCardConfig) {
    super(scene, config.x, config.y);
    this.config = config;
    this.opponent = config.opponent;

    const { width, height } = config;

    // Background
    this.bg = scene.add.rectangle(
      0,
      0,
      width,
      height,
      parseInt(COLORS.background.replace('#', '0x'))
    );
    this.add(this.bg);

    // Selected border (initially hidden)
    this.selectedBorder = scene.add.rectangle(
      0,
      0,
      width + 4,
      height + 4,
      parseInt(COLORS.primary.replace('#', '0x'))
    );
    this.selectedBorder.setStrokeStyle(4, parseInt(COLORS.primary.replace('#', '0x')));
    this.selectedBorder.setVisible(config.selected || false);
    this.add(this.selectedBorder);

    // Appearance sprite (placeholder circle for now)
    const sprite = scene.add.circle(0, -height / 4, 30, 0x888888);
    this.add(sprite);

    // Name
    this.nameText = scene.add.text(
      -width / 2 + SPACING.sm,
      -height / 2 + SPACING.sm,
      this.opponent.name,
      {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    this.nameText.setOrigin(0, 0);
    this.add(this.nameText);

    // Level badge
    this.levelText = scene.add.text(
      width / 2 - SPACING.sm,
      -height / 2 + SPACING.sm,
      `Lv${this.opponent.level}`,
      {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    );
    this.levelText.setOrigin(1, 0);
    this.add(this.levelText);

    // Stats display
    this.statsContainer = this.createStatsDisplay(width, height);
    this.add(this.statsContainer);

    // Make interactive
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });

    // Click handler
    this.on('pointerdown', () => {
      this.config.onSelect(this.opponent);
    });

    // Hover effects
    this.on('pointerover', () => {
      this.bg.setFillStyle(parseInt(COLORS.surface.replace('#', '0x')));
    });

    this.on('pointerout', () => {
      this.bg.setFillStyle(parseInt(COLORS.background.replace('#', '0x')));
    });

    scene.add.existing(this);
  }

  private createStatsDisplay(width: number, height: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, height / 4);

    const stats = [
      { label: 'HP', value: this.opponent.hp, color: COLORS.success },
      { label: 'STR', value: this.opponent.str, color: COLORS.error },
      { label: 'SPD', value: this.opponent.speed, color: COLORS.info },
      { label: 'AGI', value: this.opponent.agility, color: COLORS.warning },
    ];

    const startX = -width / 2 + SPACING.sm;
    const spacing = (width - SPACING.md) / stats.length;

    stats.forEach((stat, index) => {
      const x = startX + index * spacing;

      // Label
      const label = this.scene.add.text(x, 0, stat.label, {
        fontSize: `${TYPOGRAPHY.fontSize.xs}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      });
      label.setOrigin(0, 0);
      container.add(label);

      // Value
      const value = this.scene.add.text(x, SPACING.xs, `${stat.value}`, {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      });
      value.setOrigin(0, 0);
      container.add(value);
    });

    return container;
  }

  public setSelected(selected: boolean): void {
    if (this.selectedBorder) {
      this.selectedBorder.setVisible(selected);
    }
  }

  public getOpponent(): IBruto {
    return this.opponent;
  }

  public destroy(fromScene?: boolean): void {
    this.removeAllListeners();
    super.destroy(fromScene);
  }
}
