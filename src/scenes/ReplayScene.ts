/**
 * ReplayScene - Battle Replay Viewer (Story 12.2)
 *
 * Plays back recorded battles with speed controls.
 * Uses saved RNG seed and combat events for deterministic replay.
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY } from '../utils/theme';
import { BattleLoggerService, IBattleLog } from '../services/BattleLoggerService';
import { Button } from '../ui/components/Button';

export class ReplayScene extends Phaser.Scene {
  private battleLog?: IBattleLog;
  private playbackSpeed: number = 1;
  private isPaused: boolean = false;
  private currentEventIndex: number = 0;
  private eventText?: Phaser.GameObjects.Text;
  private playerNameText?: Phaser.GameObjects.Text;
  private opponentNameText?: Phaser.GameObjects.Text;
  private playerHPText?: Phaser.GameObjects.Text;
  private opponentHPText?: Phaser.GameObjects.Text;
  private speedButton?: Button;
  private playPauseButton?: Button;
  private replayBanner?: Phaser.GameObjects.Text;
  private currentPlayerHP: number = 0;
  private currentOpponentHP: number = 0;

  constructor() {
    super({ key: 'ReplayScene' });
  }

  init(data: { battleId: string }): void {
    console.log('[ReplayScene] Initializing with battle:', data.battleId);
    this.playbackSpeed = 1;
    this.isPaused = false;
    this.currentEventIndex = 0;
  }

  async create(data: { battleId: string }): Promise<void> {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const { width, height } = this.cameras.main;

    // Load battle log
    try {
      const battle = await BattleLoggerService.getBattleById(data.battleId);
      if (!battle) {
        this.showError('Battle not found');
        return;
      }
      this.battleLog = battle;
      this.currentPlayerHP = battle.playerBrutoSnapshot.hp;
      this.currentOpponentHP = battle.opponentBrutoSnapshot.hp;
    } catch (error) {
      this.showError('Failed to load battle');
      return;
    }

    // REPLAY banner
    this.replayBanner = this.add.text(
      width / 2,
      30,
      '🎬 REPLAY MODE',
      {
        fontSize: `${TYPOGRAPHY.fontSize.xl}px`,
        color: COLORS.warning,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    this.replayBanner.setOrigin(0.5);
    this.replayBanner.setAlpha(0.9);

    // Battle date
    const dateText = this.add.text(
      width / 2,
      70,
      `Fought: ${new Date(this.battleLog.foughtAt).toLocaleString()}`,
      {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    );
    dateText.setOrigin(0.5);

    // Fighter info
    this.playerNameText = this.add.text(
      100,
      150,
      this.battleLog.playerBrutoSnapshot.name,
      {
        fontSize: `${TYPOGRAPHY.fontSize.lg}px`,
        color: COLORS.success,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );

    this.playerHPText = this.add.text(
      100,
      185,
      `HP: ${this.currentPlayerHP}/${this.battleLog.playerBrutoSnapshot.maxHp}`,
      {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    );

    this.opponentNameText = this.add.text(
      width - 100,
      150,
      this.battleLog.opponentBrutoSnapshot.name,
      {
        fontSize: `${TYPOGRAPHY.fontSize.lg}px`,
        color: COLORS.error,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    this.opponentNameText.setOrigin(1, 0);

    this.opponentHPText = this.add.text(
      width - 100,
      185,
      `HP: ${this.currentOpponentHP}/${this.battleLog.opponentBrutoSnapshot.maxHp}`,
      {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    );
    this.opponentHPText.setOrigin(1, 0);

    // Event log display
    this.eventText = this.add.text(
      width / 2,
      height / 2,
      'Press PLAY to start replay',
      {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        align: 'center',
        wordWrap: { width: width - 200 },
      }
    );
    this.eventText.setOrigin(0.5);

    // Controls
    this.createControls();

    console.log('[ReplayScene] Ready to replay:', {
      player: this.battleLog.playerBrutoSnapshot.name,
      opponent: this.battleLog.opponentBrutoSnapshot.name,
      events: this.battleLog.combatLog.length,
    });
  }

  private createControls(): void {
    const { width, height } = this.cameras.main;
    const controlY = height - 100;

    // Play/Pause button
    this.playPauseButton = new Button(this, {
      x: width / 2 - 150,
      y: controlY,
      text: 'Play',
      onClick: () => this.togglePlayPause(),
      width: 120,
    });

    // Speed button
    this.speedButton = new Button(this, {
      x: width / 2,
      y: controlY,
      text: `Speed: ${this.playbackSpeed}x`,
      onClick: () => this.cycleSpeed(),
      width: 120,
      style: 'secondary',
    });

    // Skip to end button
    new Button(this, {
      x: width / 2 + 150,
      y: controlY,
      text: 'Skip to End',
      onClick: () => this.skipToEnd(),
      width: 120,
      style: 'secondary',
    });

    // Exit button
    new Button(this, {
      x: width - 100,
      y: 30,
      text: 'Exit',
      onClick: () => this.exitReplay(),
      width: 100,
      style: 'danger',
    });
  }

  private togglePlayPause(): void {
    this.isPaused = !this.isPaused;
    this.playPauseButton?.updateText(this.isPaused ? 'Resume' : 'Pause');

    if (!this.isPaused && this.currentEventIndex === 0) {
      this.startPlayback();
    }
  }

  private cycleSpeed(): void {
    const speeds = [1, 2, 4];
    const currentIndex = speeds.indexOf(this.playbackSpeed);
    this.playbackSpeed = speeds[(currentIndex + 1) % speeds.length];
    this.speedButton?.updateText(`Speed: ${this.playbackSpeed}x`);
  }

  private async startPlayback(): Promise<void> {
    if (!this.battleLog) return;

    for (let i = this.currentEventIndex; i < this.battleLog.combatLog.length; i++) {
      if (this.isPaused) {
        this.currentEventIndex = i;
        return;
      }

      const event = this.battleLog.combatLog[i];
      this.displayEvent(event);

      // Update HP if damage event
      if (event.type === 'damage' && event.damage) {
        if (event.defender === this.battleLog.opponentBrutoId) {
          this.currentOpponentHP = Math.max(0, this.currentOpponentHP - event.damage);
        } else if (event.defender === this.battleLog.playerBrutoId) {
          this.currentPlayerHP = Math.max(0, this.currentPlayerHP - event.damage);
        }
        this.updateHP();
      }

      // Wait based on speed
      await this.waitForDelay();
    }

    this.currentEventIndex = this.battleLog.combatLog.length;
    this.showResult();
  }

  private displayEvent(event: any): void {
    if (!this.eventText) return;

    let displayText = event.message;

    if (event.type === 'damage') {
      displayText += event.isCrit ? ' 💥 CRITICAL!' : '';
    } else if (event.type === 'dodge') {
      displayText += ' ⚡ Dodged!';
    }

    this.eventText.setText(displayText);
  }

  private updateHP(): void {
    if (!this.playerHPText || !this.opponentHPText || !this.battleLog) return;

    this.playerHPText.setText(
      `HP: ${this.currentPlayerHP}/${this.battleLog.playerBrutoSnapshot.maxHp}`
    );
    this.opponentHPText.setText(
      `HP: ${this.currentOpponentHP}/${this.battleLog.opponentBrutoSnapshot.maxHp}`
    );
  }

  private waitForDelay(): Promise<void> {
    return new Promise(resolve => {
      const delay = 1000 / this.playbackSpeed;
      this.time.delayedCall(delay, () => resolve());
    });
  }

  private skipToEnd(): void {
    if (!this.battleLog) return;

    this.currentEventIndex = this.battleLog.combatLog.length;
    this.currentPlayerHP = this.battleLog.playerHpRemaining;
    this.currentOpponentHP = this.battleLog.opponentHpRemaining;
    this.updateHP();
    this.showResult();
  }

  private showResult(): void {
    if (!this.battleLog || !this.eventText) return;

    const isWin = this.battleLog.winnerId === this.battleLog.playerBrutoId;
    const resultText = isWin
      ? `🏆 ${this.battleLog.playerBrutoSnapshot.name} WINS!`
      : `💀 ${this.battleLog.opponentBrutoSnapshot.name} WINS!`;

    this.eventText.setText(resultText);
    this.eventText.setColor(isWin ? COLORS.success : COLORS.error);
    this.eventText.setFontSize(TYPOGRAPHY.fontSize.xl);

    this.isPaused = true;
    this.playPauseButton?.updateText('Replay Again');
  }

  private exitReplay(): void {
    this.scene.start('BrutoSelectionScene');
  }

  private showError(message: string): void {
    const { width, height } = this.cameras.main;

    this.add.text(
      width / 2,
      height / 2,
      `❌ ${message}`,
      {
        fontSize: `${TYPOGRAPHY.fontSize.lg}px`,
        color: COLORS.error,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      }
    ).setOrigin(0.5);

    new Button(this, {
      x: width / 2,
      y: height / 2 + 50,
      text: 'Back',
      onClick: () => this.scene.start('BrutoSelectionScene'),
      width: 120,
    });
  }
}
