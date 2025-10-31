/**
 * OpponentSelectionScene - Opponent Selection UI (Story 9.2)
 * 
 * Shows 5 random opponents for player to choose before battle.
 * Implements matchmaking UI with selection, refresh, and fight initiation.
 */

import Phaser from 'phaser';
import { IBruto } from '../models/Bruto';
import { MatchmakingService, IOpponentPool } from '../services/MatchmakingService';
import { OpponentCard } from '../ui/components/OpponentCard';
import { Button } from '../ui/components/Button';
import { Panel } from '../ui/components/Panel';
import { COLORS, TYPOGRAPHY, SPACING } from '../utils/theme';
import { useStore } from '../state/store';

export interface OpponentSelectionSceneData {
  brutoId: string;
}

export class OpponentSelectionScene extends Phaser.Scene {
  private playerBruto!: IBruto;
  private opponentCards: OpponentCard[] = [];
  private selectedOpponent: IBruto | null = null;
  private fightButton?: Button;
  private refreshButton?: Button;
  private titleText?: Phaser.GameObjects.Text;
  private emptyStateText?: Phaser.GameObjects.Text;
  private opponentPool?: IOpponentPool;

  constructor() {
    super({ key: 'OpponentSelectionScene' });
  }

  async create(data: OpponentSelectionSceneData): Promise<void> {
    const { width, height } = this.cameras.main;

    // Load player bruto from state
    const state = useStore.getState();
    const bruto = state.brutos.find((b) => b.id === data.brutoId);

    if (!bruto) {
      console.error('[OpponentSelectionScene] Bruto not found:', data.brutoId);
      this.scene.start('CasilleroScene');
      return;
    }

    this.playerBruto = bruto;

    // Background
    this.cameras.main.setBackgroundColor(parseInt(COLORS.background.replace('#', '0x')));

    // Title
    this.titleText = this.add.text(
      width / 2,
      SPACING.xl,
      `Choose Opponent for ${this.playerBruto.name}`,
      {
        fontSize: `${TYPOGRAPHY.fontSize.xl}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontStyle: 'bold',
      }
    );
    this.titleText.setOrigin(0.5, 0);

    // Load opponents
    await this.loadOpponents();

    // Render UI
    if (this.opponentPool && this.opponentPool.opponents.length > 0) {
      this.renderOpponentCards(width, height);
      this.renderActionButtons(width, height);
    } else {
      this.renderEmptyState(width, height);
    }

    // Back button
    this.renderBackButton(width, height);
  }

  private async loadOpponents(): Promise<void> {
    const state = useStore.getState();
    const userId = state.user?.id;

    if (!userId) {
      console.error('[OpponentSelectionScene] No user ID found');
      return;
    }

    // AC #1: Fetch opponents from MatchmakingService
    const result = await MatchmakingService.findOpponents(
      this.playerBruto.level,
      userId,
      5
    );

    if (result.ok) {
      this.opponentPool = result.data;
      console.log('[OpponentSelectionScene] Loaded opponents:', this.opponentPool);
    } else {
      console.error('[OpponentSelectionScene] Failed to load opponents:', result.error);
    }
  }

  private renderOpponentCards(width: number, height: number): void {
    if (!this.opponentPool || this.opponentPool.opponents.length === 0) {
      return;
    }

    // AC #1: Show 5 opponent cards in grid layout
    const cardWidth = 200;
    const cardHeight = 180;
    const cardsPerRow = 3;
    const spacing = SPACING.lg;
    const startY = height / 2 - 50;

    this.opponentPool.opponents.forEach((opponent, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      const totalWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * spacing;
      const startX = (width - totalWidth) / 2 + cardWidth / 2;

      const x = startX + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);

      const card = new OpponentCard(this, {
        x,
        y,
        width: cardWidth,
        height: cardHeight,
        opponent,
        onSelect: (selectedOpponent) => this.onOpponentSelected(selectedOpponent),
        selected: false,
      });

      this.opponentCards.push(card);
    });
  }

  private renderActionButtons(width: number, height: number): void {
    // AC #2: "Fight!" button (disabled until selection)
    this.fightButton = new Button(this, {
      x: width / 2,
      y: height - SPACING.xl - 25,
      text: 'Fight!',
      width: 250,
      height: 60,
      style: 'primary',
      disabled: true,
      onClick: () => this.startBattle(),
    });

    // AC #4: "Refresh Opponents" button
    this.refreshButton = new Button(this, {
      x: width / 2,
      y: height - SPACING.xl - 100,
      text: 'Refresh Opponents',
      width: 250,
      height: 50,
      style: 'secondary',
      disabled: false,
      onClick: () => this.refreshOpponents(),
    });
  }

  private renderEmptyState(width: number, height: number): void {
    // AC #6: Empty state when no opponents available
    const panel = new Panel(this, {
      x: width / 2,
      y: height / 2,
      width: 500,
      height: 300,
      title: 'No Opponents Available',
      backgroundColor: COLORS.surface,
      borderColor: COLORS.border,
    });

    this.emptyStateText = this.add.text(
      width / 2,
      height / 2 + SPACING.sm,
      'No brutos found at your level.\n\nCreate more brutos or wait for other players!',
      {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        align: 'center',
      }
    );
    this.emptyStateText.setOrigin(0.5, 0);
  }

  private renderBackButton(width: number, height: number): void {
    // AC #6: Option to return to Casillero
    const backButton = new Button(this, {
      x: SPACING.xl,
      y: SPACING.xl,
      text: '← Back',
      width: 120,
      height: 40,
      style: 'secondary',
      onClick: () => {
        this.scene.start('CasilleroScene');
      },
    });
  }

  private onOpponentSelected(opponent: IBruto): void {
    // AC #2: Highlight selected opponent, enable fight button
    this.selectedOpponent = opponent;

    // Unhighlight all cards
    this.opponentCards.forEach((card) => {
      card.setSelected(false);
    });

    // Highlight selected card
    const selectedCard = this.opponentCards.find(
      (card) => card.getOpponent().id === opponent.id
    );

    if (selectedCard) {
      selectedCard.setSelected(true);
    }

    // Enable fight button
    if (this.fightButton) {
      this.fightButton.setDisabled(false);
    }

    console.log('[OpponentSelectionScene] Selected opponent:', opponent.name);
  }

  private startBattle(): void {
    if (!this.selectedOpponent) {
      console.error('[OpponentSelectionScene] No opponent selected');
      return;
    }

    // AC #5: Transition to CombatScene with opponent data
    console.log('[OpponentSelectionScene] Starting battle with:', this.selectedOpponent.name);

    // Convert IBruto to IBrutoCombatant
    const playerCombatant = {
      id: this.playerBruto.id,
      name: this.playerBruto.name,
      stats: {
        hp: this.playerBruto.hp,
        maxHp: this.playerBruto.maxHp,
        str: this.playerBruto.str,
        speed: this.playerBruto.speed,
        agility: this.playerBruto.agility,
        resistance: this.playerBruto.resistance,
      },
    };

    const opponentCombatant = {
      id: this.selectedOpponent.id,
      name: this.selectedOpponent.name,
      stats: {
        hp: this.selectedOpponent.hp,
        maxHp: this.selectedOpponent.maxHp,
        str: this.selectedOpponent.str,
        speed: this.selectedOpponent.speed,
        agility: this.selectedOpponent.agility,
        resistance: this.selectedOpponent.resistance,
      },
    };

    this.scene.start('CombatScene', {
      player: playerCombatant,
      opponent: opponentCombatant,
      playerBrutoId: this.playerBruto.id,
    });
  }

  private async refreshOpponents(): Promise<void> {
    // AC #4: Refresh opponent pool (re-fetch from database)
    console.log('[OpponentSelectionScene] Refreshing opponents...');

    // Clear current cards
    this.opponentCards.forEach((card) => card.destroy());
    this.opponentCards = [];
    this.selectedOpponent = null;

    // Disable fight button
    if (this.fightButton) {
      this.fightButton.setDisabled(true);
    }

    // Reload opponents
    await this.loadOpponents();

    // Re-render
    if (this.opponentPool && this.opponentPool.opponents.length > 0) {
      const { width, height } = this.cameras.main;
      this.renderOpponentCards(width, height);
    } else {
      // Show empty state if no opponents
      if (this.emptyStateText) {
        this.emptyStateText.setVisible(true);
      }
    }
  }

  public shutdown(): void {
    // Cleanup
    this.opponentCards.forEach((card) => card.destroy());
    this.opponentCards = [];
    this.selectedOpponent = null;
  }
}
