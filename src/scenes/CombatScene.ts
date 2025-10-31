/**
 * CombatScene - Auto-battle presentation layer
 *
 * Orchestrates combat visualization using CombatEngine for logic and
 * CombatAnimator for presentation. Pure watch-only combat per GDD.
 *
 * Architecture: Presentation layer consumes engine results (Story 4.1-4.2).
 */

import Phaser from 'phaser';
import { COLORS } from '../utils/theme';
import { CombatEngine, BattleResult } from '../engine/combat/CombatEngine';
import { CombatAnimator, CombatSprite } from '../engine/combat/CombatAnimator';
import { HealthBar } from '../components/HealthBar';
import { DamageNumberPool } from '../components/DamageNumber';
import { IBrutoCombatant } from '../models/Bruto';
import { ProgressionService, IProgressionResult } from '../services/ProgressionService';
import { useStore } from '../state/store';

interface CombatSceneData {
  player: IBrutoCombatant;
  opponent: IBrutoCombatant;
  playerBrutoId?: string; // Need bruto ID for XP award
}

export class CombatScene extends Phaser.Scene {
  private playerSprite!: CombatSprite;
  private opponentSprite!: CombatSprite;
  private damageNumberPool!: DamageNumberPool;
  private animator!: CombatAnimator;
  private battleResult?: BattleResult;
  private playerBrutoId?: string; // For XP award
  private progressionResult?: IProgressionResult; // Store progression result

  private playerHealthBar!: HealthBar;
  private opponentHealthBar!: HealthBar;
  private turnText!: Phaser.GameObjects.Text;
  private outcomeContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: CombatSceneData): void {
    console.log('[CombatScene] Initializing combat', data);
    this.playerBrutoId = data.playerBrutoId;
  }

  create(data: CombatSceneData): void {
    const { width, height } = this.cameras.main;

    // MyBrute-style arena background
    this.createArenaBackground(width, height);

    // Health bars at top with character names
    this.createTopHealthBars(data, width);

    // Initialize damage number pool
    this.damageNumberPool = new DamageNumberPool(this, 15);

    // Create combatant sprites and UI
    this.createCombatants(data, width, height);

    // Execute battle with delay for scene setup
    this.time.delayedCall(500, () => {
      this.executeBattle(data);
    });
  }

  /**
   * Create MyBrute-style arena background
   */
  private createArenaBackground(width: number, height: number): void {
    // Golden/yellow gradient background
    const background = this.add.graphics();
    
    // Top decorative section (darker brown)
    background.fillStyle(0x8B7355, 1);
    background.fillRect(0, 0, width, 150);

    // Main arena area (golden/beige)
    background.fillStyle(0xD4A574, 1);
    background.fillRect(0, 150, width, height - 150);

    // Arena floor tiles pattern
    const tileSize = 80;
    const arenaFloorY = height - 250;
    
    for (let x = 0; x < width; x += tileSize) {
      for (let y = arenaFloorY; y < height; y += tileSize) {
        const shade = ((x / tileSize) + (y / tileSize)) % 2 === 0 ? 0xE8D4A0 : 0xD4A574;
        background.fillStyle(shade, 1);
        background.fillRect(x, y, tileSize, tileSize);
        
        // Tile border
        background.lineStyle(2, 0xC4A464, 0.5);
        background.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Decorative side columns (temple style)
    this.createTempleColumns(width, height);

    // Top decorative border
    background.fillStyle(0x6B5345, 1);
    background.fillRect(0, 140, width, 10);
  }

  /**
   * Create decorative temple columns on sides
   */
  private createTempleColumns(width: number, height: number): void {
    const columnWidth = 120;
    const columnHeight = 200;
    const columnY = 200;

    // Left column
    const leftCol = this.add.graphics();
    leftCol.fillStyle(0x8B7355, 1);
    leftCol.fillRoundedRect(20, columnY, columnWidth, columnHeight, 8);
    leftCol.fillStyle(0xA0826D, 0.5);
    leftCol.fillCircle(80, columnY + 100, 40);

    // Right column
    const rightCol = this.add.graphics();
    rightCol.fillStyle(0x8B7355, 1);
    rightCol.fillRoundedRect(width - 140, columnY, columnWidth, columnHeight, 8);
    rightCol.fillStyle(0xA0826D, 0.5);
    rightCol.fillCircle(width - 80, columnY + 100, 40);
  }

  /**
   * Create health bars at top with character names (MyBrute style)
   */
  private createTopHealthBars(data: CombatSceneData, width: number): void {
    const barWidth = 300;
    const barHeight = 24;
    const topY = 50;

    // Left player section
    const leftPanel = this.add.graphics();
    leftPanel.fillStyle(0x000000, 0.6);
    leftPanel.fillRoundedRect(20, 20, barWidth + 40, 80, 8);

    // Player name (left aligned)
    this.add.text(40, 30, data.player.name.toUpperCase(), {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontStyle: 'bold'
    });

    // Player health bar
    this.playerHealthBar = new HealthBar(this, {
      x: 40,
      y: topY,
      width: barWidth,
      height: barHeight,
      maxHp: data.player.stats.hp,
      currentHp: data.player.stats.hp,
      showText: true,
      barColor: 0x00FF00,
      bgColor: 0x8B0000
    });

    // Right opponent section
    const rightPanel = this.add.graphics();
    rightPanel.fillStyle(0x000000, 0.6);
    rightPanel.fillRoundedRect(width - barWidth - 60, 20, barWidth + 40, 80, 8);

    // Opponent name (right aligned)
    this.add.text(width - 40, 30, data.opponent.name.toUpperCase(), {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // Opponent health bar
    this.opponentHealthBar = new HealthBar(this, {
      x: width - barWidth - 40,
      y: topY,
      width: barWidth,
      height: barHeight,
      maxHp: data.opponent.stats.hp,
      currentHp: data.opponent.stats.hp,
      showText: true,
      barColor: 0xFF0000,
      bgColor: 0x8B0000
    });

    // Center "VS" text
    this.add.text(width / 2, 40, 'VS', {
      fontSize: '32px',
      color: '#FFD700',
      fontFamily: 'Impact, Arial Black, sans-serif',
      fontStyle: 'bold',
      stroke: '#8B4513',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  /**
   * Create sprite representations for both combatants
   */
  private createCombatants(data: CombatSceneData, width: number, height: number): void {
    const arenaY = height - 200; // Position on arena floor

    // Player sprite (left side)
    const playerSpr = this.add.rectangle(
      width * 0.35,
      arenaY,
      100,
      140,
      0x4488ff
    );

    // Player name below sprite
    this.add
      .text(playerSpr.x, playerSpr.y + 90, data.player.name, {
        fontSize: '18px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5);

    this.playerSprite = {
      sprite: playerSpr as any,
      healthBar: this.playerHealthBar, // Use top health bar
      maxHp: data.player.stats.hp,
      currentHp: data.player.stats.hp,
    };

    // Opponent sprite (right side)
    const opponentSpr = this.add.rectangle(
      width * 0.65,
      arenaY,
      100,
      140,
      0xff4444
    );

    // Opponent name below sprite
    this.add
      .text(opponentSpr.x, opponentSpr.y + 90, data.opponent.name, {
        fontSize: '18px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5);

    this.opponentSprite = {
      sprite: opponentSpr as any,
      healthBar: this.opponentHealthBar, // Use top health bar
      maxHp: data.opponent.stats.hp,
      currentHp: data.opponent.stats.hp,
    };

    // Turn indicator (updated position)
    this.turnText = this.add
      .text(width / 2, 120, 'Preparando batalla...', {
        fontSize: '20px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#8B4513',
        strokeThickness: 3
      })
      .setOrigin(0.5);
  }

  /**
   * Execute combat using CombatEngine and animate with CombatAnimator
   */
  private async executeBattle(data: CombatSceneData): Promise<void> {
    this.turnText.setText('Battle starting...');

    // Initialize combat engine
    const engine = new CombatEngine({
      player: data.player,
      opponent: data.opponent,
      // Use timestamp seed for now (Epic 12 will use battle ID)
      rngSeed: Date.now(),
    });

    // Execute battle logic (pure computation)
    this.battleResult = engine.executeBattle();

    console.log('[CombatScene] Battle computed', {
      winner: this.battleResult.winner,
      actions: this.battleResult.actions.length,
      seed: this.battleResult.rngSeed,
    });

    // Initialize animator
    this.animator = new CombatAnimator({
      scene: this,
      playerSprite: this.playerSprite,
      opponentSprite: this.opponentSprite,
      damageNumberPool: this.damageNumberPool,
    });

    // Animate battle
    this.turnText.setText(`Turn 1 / ${this.battleResult.actions.length}`);

    // Play each action with turn counter
    let turnIndex = 0;
    for (const action of this.battleResult.actions) {
      turnIndex++;
      this.turnText.setText(`Turn ${turnIndex} / ${this.battleResult.actions.length}`);
      await this.animator.playAction(action as any);
    }

    // Play victory/defeat animations
    if (this.battleResult.winner === 'player') {
      await this.animator.playVictoryAnimation('player');
      await this.animator.playDefeatAnimation('opponent');
    } else {
      await this.animator.playVictoryAnimation('opponent');
      await this.animator.playDefeatAnimation('player');
    }

    // Show outcome
    this.showOutcome();
  }

  /**
   * Display battle outcome banner
   */
  /**
   * Show battle outcome and award XP
   */
  private async showOutcome(): Promise<void> {
    const { width, height } = this.cameras.main;

    if (!this.battleResult) return;

    const isVictory = this.battleResult.winner === 'player';

    // Award XP to player's bruto
    if (this.playerBrutoId) {
      try {
        this.progressionResult = await ProgressionService.awardXP(this.playerBrutoId, isVictory);
        console.log('[CombatScene] XP Awarded:', this.progressionResult);
      } catch (error) {
        console.error('[CombatScene] Failed to award XP:', error);
      }
    }

    // Outcome container
    this.outcomeContainer = this.add.container(width / 2, height / 2);

    // Background panel
    const panel = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
    panel.setStrokeStyle(4, isVictory ? 0x00ff00 : 0xff0000);

    // Outcome text
    const outcomeText = this.add
      .text(0, -80, isVictory ? 'VICTORY!' : 'DEFEAT', {
        fontSize: '48px',
        color: isVictory ? COLORS.success : COLORS.error,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // XP info with level up notification and animated XP gain
    const xpGained = isVictory ? 2 : 1;
    const xpInfoText = this.progressionResult 
      ? `+${xpGained} XP\nLevel ${this.progressionResult.newLevel} (${this.progressionResult.newXP} XP)`
      : `+${xpGained} XP`;
    
    const xpText = this.add
      .text(0, -10, xpInfoText, {
        fontSize: '20px',
        color: COLORS.info,
        align: 'center',
      })
      .setOrigin(0.5);

    // Add pulsing animation to XP text
    this.tweens.add({
      targets: xpText,
      scale: 1.2,
      duration: 400,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });

    // Level up banner (if leveled up)
    let levelUpText;
    if (this.progressionResult?.leveledUp) {
      levelUpText = this.add
        .text(0, 30, '🎉 LEVEL UP! 🎉', {
          fontSize: '28px',
          color: '#FFD700',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      
      // Add glowing animation to level up text
      this.tweens.add({
        targets: levelUpText,
        scale: 1.15,
        alpha: 0.8,
        duration: 600,
        yoyo: true,
        repeat: -1, // Infinite loop
        ease: 'Sine.easeInOut',
      });
    }

    // Stats
    const statsText = this.add
      .text(
        0,
        70,
        `Turns: ${this.battleResult.actions.length}\nHP Remaining: ${
          isVictory ? this.battleResult.playerHpRemaining : this.battleResult.opponentHpRemaining
        }`,
        {
          fontSize: '16px',
          color: COLORS.textSecondary,
          align: 'center',
        }
      )
      .setOrigin(0.5);

    // Continue button
    const continueBtn = this.add
      .text(0, 120, this.progressionResult?.leveledUp ? 'Choose Upgrade' : 'Back to Casillero', {
        fontSize: '18px',
        color: COLORS.textPrimary,
        backgroundColor: COLORS.primary,
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.progressionResult?.leveledUp) {
          // Navigate to LevelUpScene with bruto and new level (Story 8.2)
          const bruto = useStore.getState().selectedBruto;
          if (bruto) {
            this.scene.start('LevelUpScene', { 
              bruto, 
              newLevel: this.progressionResult.newLevel 
            });
          } else {
            console.warn('[CombatScene] No selected bruto for level up');
            this.scene.start('BrutoSelectionScene');
          }
        } else {
          this.scene.start('BrutoSelectionScene');
        }
      })
      .on('pointerover', () => {
        continueBtn.setScale(1.05);
      })
      .on('pointerout', () => {
        continueBtn.setScale(1);
      });

    const containerItems = [panel, outcomeText, xpText, statsText, continueBtn];
    if (levelUpText) containerItems.push(levelUpText);
    
    this.outcomeContainer.add(containerItems);

    // Fade in outcome
    this.outcomeContainer.setAlpha(0);
    this.tweens.add({
      targets: this.outcomeContainer,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
    });
  }

  /**
   * Cleanup when scene shuts down
   */
  shutdown(): void {
    if (this.damageNumberPool) {
      this.damageNumberPool.destroy();
    }
  }
}
