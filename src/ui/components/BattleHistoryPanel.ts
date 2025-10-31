/**
 * BattleHistoryPanel - Shows list of last 8 battles (Story 12.2)
 *
 * Displays battle history with results and allows viewing replays.
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY } from '../../utils/theme';
import { IBattleLog } from '../../services/BattleLoggerService';

export interface BattleHistoryPanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  battles: IBattleLog[];
  onReplayClick: (battleId: string) => void;
}

export class BattleHistoryPanel extends Phaser.GameObjects.Container {
  private config: BattleHistoryPanelConfig;
  private scrollY: number = 0;
  private readonly ROW_HEIGHT = 60;
  private readonly MAX_VISIBLE = 4;

  constructor(scene: Phaser.Scene, config: BattleHistoryPanelConfig) {
    super(scene, config.x, config.y);
    this.config = config;

    scene.add.existing(this);
    this.createPanel();
  }

  private createPanel(): void {
    // Background
    const bg = this.scene.add.rectangle(
      0,
      0,
      this.config.width,
      this.config.height,
      COLORS.panelBg,
      0.95
    );
    bg.setStrokeStyle(2, COLORS.border);
    bg.setOrigin(0);
    this.add(bg);

    // Title
    const title = this.scene.add.text(
      this.config.width / 2,
      20,
      'Battle History',
      {
        fontSize: `${TYPOGRAPHY.fontSize.lg}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    title.setOrigin(0.5, 0);
    this.add(title);

    // Empty state
    if (this.config.battles.length === 0) {
      const emptyText = this.scene.add.text(
        this.config.width / 2,
        this.config.height / 2,
        'No battles yet\nFight to see history here',
        {
          fontSize: `${TYPOGRAPHY.fontSize.base}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          align: 'center',
        }
      );
      emptyText.setOrigin(0.5);
      this.add(emptyText);
      return;
    }

    // Battle rows
    const startY = 60;
    const visibleBattles = this.config.battles.slice(0, this.MAX_VISIBLE);

    visibleBattles.forEach((battle, index) => {
      this.createBattleRow(battle, startY + index * this.ROW_HEIGHT, index);
    });

    // Show count if more than max visible
    if (this.config.battles.length > this.MAX_VISIBLE) {
      const moreText = this.scene.add.text(
        this.config.width / 2,
        startY + this.MAX_VISIBLE * this.ROW_HEIGHT + 10,
        `+${this.config.battles.length - this.MAX_VISIBLE} more battles`,
        {
          fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          fontStyle: 'italic',
        }
      );
      moreText.setOrigin(0.5, 0);
      this.add(moreText);
    }
  }

  private createBattleRow(battle: IBattleLog, y: number, index: number): void {
    const rowBg = this.scene.add.rectangle(
      10,
      y,
      this.config.width - 20,
      this.ROW_HEIGHT - 10,
      index % 2 === 0 ? 0x2a2a2a : 0x333333,
      1
    );
    rowBg.setOrigin(0);
    rowBg.setInteractive({ useHandCursor: true });
    this.add(rowBg);

    // Result indicator
    const isWin = battle.winnerId === battle.playerBrutoId;
    const resultColor = isWin ? COLORS.success : COLORS.error;
    const resultText = isWin ? 'WIN' : 'LOSS';

    const result = this.scene.add.text(
      25,
      y + 10,
      resultText,
      {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: resultColor,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    result.setOrigin(0);
    this.add(result);

    // Opponent name
    const opponent = this.scene.add.text(
      25,
      y + 30,
      `vs ${battle.opponentBrutoSnapshot.name}`,
      {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    );
    opponent.setOrigin(0);
    this.add(opponent);

    // Date
    const date = new Date(battle.foughtAt);
    const dateStr = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const dateText = this.scene.add.text(
      this.config.width - 100,
      y + 10,
      dateStr,
      {
        fontSize: `${TYPOGRAPHY.fontSize.xs}px`,
        color: COLORS.textDisabled,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    );
    dateText.setOrigin(0);
    this.add(dateText);

    // Replay button
    const replayBtn = this.scene.add.text(
      this.config.width - 100,
      y + 30,
      '▶ Replay',
      {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    replayBtn.setOrigin(0);
    replayBtn.setInteractive({ useHandCursor: true });
    this.add(replayBtn);

    // Hover effects
    rowBg.on('pointerover', () => {
      rowBg.setFillStyle(0x404040);
      replayBtn.setColor(COLORS.primaryLight);
    });

    rowBg.on('pointerout', () => {
      rowBg.setFillStyle(index % 2 === 0 ? 0x2a2a2a : 0x333333);
      replayBtn.setColor(COLORS.primary);
    });

    // Click handlers
    const handleClick = () => {
      if (battle.id) {
        this.config.onReplayClick(battle.id);
      }
    };

    rowBg.on('pointerdown', handleClick);
    replayBtn.on('pointerdown', (event: Phaser.Input.Pointer) => {
      event.stopPropagation();
      handleClick();
    });
  }

  public updateBattles(battles: IBattleLog[]): void {
    this.removeAll(true);
    this.config.battles = battles;
    this.createPanel();
  }
}
