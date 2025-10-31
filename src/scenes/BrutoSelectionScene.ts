/**
 * BrutoSelectionScene - Choose bruto from 3-4 slots (Epic 2 Story 2.2)
 * Manages bruto slots, unlock flow, and deletion with confirmation
 */

import Phaser from 'phaser';
import { COLORS, TYPOGRAPHY } from '../utils/theme';
import { Panel } from '../ui/components/Panel';
import { Button } from '../ui/components/Button';
import { Modal } from '../ui/components/Modal';
import { DatabaseManager } from '../database/DatabaseManager';
import { UserRepository } from '../database/repositories/UserRepository';
import { BrutoRepository } from '../database/repositories/BrutoRepository';
import { DailyFightsRepository } from '../database/repositories/DailyFightsRepository';
import { DailyFightsService } from '../engine/DailyFightsService';
import { AppearanceGenerator } from '../engine/AppearanceGenerator';
import { BrutoFactory } from '../engine/BrutoFactory';
import { BrutoNameValidator } from '../engine/BrutoNameValidator';
import { ProgressionService } from '../engine/progression/ProgressionService';
import { SlotPurchaseService } from '../services/SlotPurchaseService';
import { useStore } from '../state/store';
import { IUser } from '../models/User';
import { IBruto } from '../models/Bruto';

export class BrutoSelectionScene extends Phaser.Scene {
  private userRepo!: UserRepository;
  private brutoRepo!: BrutoRepository;
  private dailyFightsRepo!: DailyFightsRepository;
  private dailyFightsService!: DailyFightsService;
  private appearanceGenerator!: AppearanceGenerator;
  private brutoFactory!: BrutoFactory;
  private progressionService!: ProgressionService;
  private currentUser: IUser | null = null;
  private currentBrutos: IBruto[] = [];
  private readonly SLOT_COST = SlotPurchaseService.SLOT_PRICE;
  private readonly MAX_SLOTS = SlotPurchaseService.MAX_SLOTS;

  private coinText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private slotElements: Phaser.GameObjects.GameObject[] = [];
  private activeModal?: Modal;
  private isProcessing = false;

  constructor() {
    super({ key: 'BrutoSelectionScene' });
  }

  create(): void {
    console.log('[BrutoSelectionScene] Scene created');

    this.cameras.main.setBackgroundColor(COLORS.background);
    const { width } = this.cameras.main;

    // Title
    this.add
      .text(width / 2, 90, 'CASILLERO - Bruto Slots', {
        fontSize: `${TYPOGRAPHY.fontSize.xl}px`,
        color: COLORS.textPrimary,
        fontStyle: 'bold',
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      })
      .setOrigin(0.5);

    // Coin + slot header (updated after data loads)
    this.coinText = this.add
      .text(width / 2, 150, '', {
        fontSize: `${TYPOGRAPHY.fontSize.lg}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      })
      .setOrigin(0.5);

    // Feedback / error banner
    this.feedbackText = this.add
      .text(width / 2, 190, '', {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      })
      .setOrigin(0.5);

    // Repository setup
    const db = DatabaseManager.getInstance();
    this.userRepo = new UserRepository(db);
    this.brutoRepo = new BrutoRepository(db);
    this.dailyFightsRepo = new DailyFightsRepository(db);
    this.dailyFightsService = new DailyFightsService(this.dailyFightsRepo);
    this.appearanceGenerator = new AppearanceGenerator();
    this.progressionService = new ProgressionService();
    this.brutoFactory = new BrutoFactory(this.appearanceGenerator, {}, this.progressionService);

    void this.initializeScene();
  }

  private async initializeScene(): Promise<void> {
    const store = useStore.getState();

    if (!store.currentUser) {
      this.showFeedback('No active session found. Redirecting to login...', true);
      this.time.delayedCall(1500, () => this.scene.start('LoginScene'));
      return;
    }

    this.currentUser = store.currentUser;

    await this.refreshState();
  }

  private async refreshState(): Promise<void> {
    if (!this.currentUser) return;

    const userResult = await this.userRepo.findById(this.currentUser.id);
    if (!userResult.success) {
      this.showFeedback('Failed to load user profile. Please retry.', true);
      return;
    }

    if (!userResult.data) {
      this.showFeedback('User record not found. Returning to login.', true);
      this.time.delayedCall(1500, () => this.scene.start('LoginScene'));
      return;
    }

    const syncedUser = userResult.data;
    useStore.getState().setCurrentUser(syncedUser);
    this.currentUser = syncedUser;

    const brutosResult = await this.brutoRepo.findByUserId(syncedUser.id);
    if (!brutosResult.success) {
      this.showFeedback('Failed to load bruto slots. Please retry.', true);
      return;
    }

    this.currentBrutos = brutosResult.data;
    await this.syncDailyFights();
    this.updateCoinDisplay();
    this.renderSlots();
    if (this.currentBrutos.length === 0) {
      this.showFeedback('No brutos yet. Unlock slots or create new fighters.', false);
    } else {
      this.showFeedback('', false);
    }
  }

  private async syncDailyFights(): Promise<void> {
    if (!this.currentUser) return;

    const statusResult = await this.dailyFightsService.getStatus(this.currentUser.id, {
      hasRegeneration: this.hasRegenerationSkill(),
    });

    if (!statusResult.success) {
      console.error('[BrutoSelectionScene] Daily fights sync failed:', statusResult.error);
      return;
    }

    const store = useStore.getState();
    store.setDailyFights(statusResult.data);
  }

  private updateCoinDisplay(): void {
    if (!this.currentUser) {
      this.coinText.setText('');
      return;
    }

    this.coinText.setText(
      `Coins: ${this.currentUser.coins} | Slots: ${this.currentUser.brutoSlots}/${this.MAX_SLOTS}`
    );
  }

  private renderSlots(): void {
    this.slotElements.forEach((element) => element.destroy());
    this.slotElements = [];

    if (!this.currentUser) return;

    const totalSlots = this.MAX_SLOTS;
    const slotSpacing = 260;
    const baseX = this.cameras.main.width / 2 - ((totalSlots - 1) * slotSpacing) / 2;
    const slotY = 360;

    for (let index = 0; index < totalSlots; index++) {
      const slotX = baseX + index * slotSpacing;
      const slotNumber = index + 1;
      const isUnlocked = slotNumber <= this.currentUser.brutoSlots;
      const panel = new Panel(this, {
        x: slotX,
        y: slotY,
        width: 240,
        height: 280,
        title: `Slot ${slotNumber}`,
      });
      this.slotElements.push(panel);

      if (isUnlocked) {
        this.renderUnlockedSlot(slotX, slotY, index);
      } else {
        this.renderLockedSlot(slotX, slotY);
      }
    }
  }

  private renderUnlockedSlot(slotX: number, slotY: number, index: number): void {
    const bruto = this.currentBrutos[index];

    if (bruto) {
      const nameText = this.add
        .text(slotX, slotY - 70, bruto.name, {
          fontSize: `${TYPOGRAPHY.fontSize.lg}px`,
          color: COLORS.textPrimary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      const statsText = this.add
        .text(
          slotX,
          slotY - 10,
          `Level ${bruto.level}\nHP ${bruto.hp}/${bruto.maxHp}\nSTR ${bruto.str} | SPD ${bruto.speed}`,
          {
            fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
            color: COLORS.textSecondary,
            fontFamily: TYPOGRAPHY.fontFamily.primary,
            align: 'center',
          }
        )
        .setOrigin(0.5);
      const deleteButton = new Button(this, {
        x: slotX,
        y: slotY + 80,
        text: 'Delete Bruto',
        style: 'danger',
        onClick: () => this.confirmDelete(bruto),
        width: 180,
      });
      const detailsButton = new Button(this, {
        x: slotX,
        y: slotY + 130,
        text: 'View Details',
        style: 'secondary',
        onClick: () => this.navigateToDetails(bruto),
        width: 180,
      });

      this.slotElements.push(nameText, statsText, deleteButton, detailsButton);
    } else {
      const emptyText = this.add
        .text(slotX, slotY - 30, 'Empty Slot', {
          fontSize: `${TYPOGRAPHY.fontSize.base}px`,
          color: COLORS.textSecondary,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          align: 'center',
        })
        .setOrigin(0.5);
      this.slotElements.push(emptyText);

      const createButton = new Button(this, {
        x: slotX,
        y: slotY + 10,
        text: 'Create Bruto',
        style: 'primary',
        width: 180,
        onClick: () => void this.handleCreateBruto(),
      });
      this.slotElements.push(createButton);

      const viewDetailsHint = this.add
        .text(slotX, slotY + 80, 'Appearances previewed before creation', {
          fontSize: `${TYPOGRAPHY.fontSize.xs}px`,
          color: COLORS.textDisabled,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
          align: 'center',
        })
        .setOrigin(0.5);
      this.slotElements.push(viewDetailsHint);
    }
  }

  private renderLockedSlot(slotX: number, slotY: number): void {
    const lockedLabel = this.add
      .text(slotX, slotY - 40, 'Locked Slot', {
        fontSize: `${TYPOGRAPHY.fontSize.base}px`,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
      })
      .setOrigin(0.5);
    const costText = this.add
      .text(slotX, slotY + 10, `Unlock for ${this.SLOT_COST} coins`, {
        fontSize: `${TYPOGRAPHY.fontSize.sm}px`,
        color: COLORS.textPrimary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        align: 'center',
      })
      .setOrigin(0.5);

    const canAfford = !!this.currentUser && this.currentUser.coins >= this.SLOT_COST;
    const unlockButton = new Button(this, {
      x: slotX,
      y: slotY + 80,
      text: 'Unlock Slot',
      onClick: () => this.handleUnlockSlot(),
      width: 180,
      style: 'primary',
      disabled: !canAfford,
    });

    if (!canAfford) {
      const warningText = this.add
        .text(slotX, slotY + 120, 'Earn more coins to unlock.', {
          fontSize: `${TYPOGRAPHY.fontSize.xs}px`,
          color: COLORS.warning,
          fontFamily: TYPOGRAPHY.fontFamily.primary,
        })
        .setOrigin(0.5);
      this.slotElements.push(warningText);
    }

    this.slotElements.push(lockedLabel, costText, unlockButton);
  }

  private confirmDelete(bruto: IBruto): void {
    if (this.activeModal) {
      this.activeModal.close();
    }

    this.activeModal = new Modal(this, {
      title: 'Delete Bruto?',
      content: `Delete ${bruto.name}? This removes stats, weapons, skills, pets, and battle history.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        this.activeModal = undefined;
        void this.handleDelete(bruto);
      },
      onCancel: () => {
        this.activeModal = undefined;
        this.showFeedback('Deletion cancelled.', false);
      },
    });
  }

  private async handleDelete(bruto: IBruto): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const deleteResult = await this.brutoRepo.delete(bruto.id);
    if (!deleteResult.success) {
      this.showFeedback('Failed to delete bruto. Please retry.', true);
      this.isProcessing = false;
      return;
    }

    const store = useStore.getState();
    if (store.selectedBruto?.id === bruto.id) {
      store.setSelectedBruto(null);
    }

    this.showFeedback(`${bruto.name} removed from roster.`, false);
    await this.refreshState();
    this.isProcessing = false;
  }

  private async handleUnlockSlot(): Promise<void> {
    if (this.isProcessing) return;
    if (!this.currentUser) return;

    // Check eligibility
    const validation = await SlotPurchaseService.canPurchaseSlot(this.currentUser.id);
    if (!validation.canPurchase) {
      this.showFeedback(validation.reason || 'Cannot purchase slot', true);
      return;
    }

    this.isProcessing = true;

    // Purchase slot
    const newSlotCount = await SlotPurchaseService.purchaseSlot(this.currentUser.id);
    if (newSlotCount === -1) {
      this.showFeedback('Failed to unlock slot. Please retry.', true);
      this.isProcessing = false;
      return;
    }

    const slotNumber = newSlotCount;
    const message = slotNumber === this.MAX_SLOTS
      ? `Maximum slots unlocked! (${this.MAX_SLOTS}/${this.MAX_SLOTS})`
      : `Slot ${slotNumber} unlocked! (${newSlotCount}/${this.MAX_SLOTS})`;

    this.showFeedback(message, false);
    await this.refreshState();
    this.isProcessing = false;
  }

  private navigateToDetails(bruto: IBruto): void {
    const store = useStore.getState();
    store.setSelectedBruto(bruto);
    this.scene.start('BrutoDetailsScene');
  }

  private showFeedback(message: string, isError: boolean): void {
    if (!this.feedbackText) return;
    this.feedbackText.setText(message);
    this.feedbackText.setColor(isError ? COLORS.error : COLORS.textSecondary);
  }

  private hasRegenerationSkill(): boolean {
    const store = useStore.getState();
    const selected = store.selectedBruto;
    if (selected?.skills?.includes('regeneration')) {
      return true;
    }

    if (this.currentBrutos.some((bruto) => bruto.skills?.includes('regeneration'))) {
      return true;
    }

    return store.dailyFights.maxFights > 6;
  }

  private async handleCreateBruto(): Promise<void> {
    if (!this.currentUser) {
      this.showFeedback('Session unavailable. Please log in again.', true);
      return;
    }

    if (this.currentBrutos.length >= this.currentUser.brutoSlots) {
      this.showFeedback('No available slots to create a new Bruto.', true);
      return;
    }

    const rawName = window.prompt('Enter a name for your new Bruto:');
    if (!rawName) {
      this.showFeedback('Bruto creation cancelled.', false);
      return;
    }

    const name = rawName.trim();
    const nameValidator = new BrutoNameValidator(this.brutoRepo);
    const validation = await nameValidator.validate(name, this.currentUser.id);
    if (!validation.success) {
      this.showFeedback(validation.error, true);
      return;
    }

    let appearanceAccepted = false;
    let chosenAppearance = this.appearanceGenerator.randomAppearance();

    while (!appearanceAccepted) {
      const accepted = window.confirm(
        `Appearance Preview:\n${chosenAppearance.displayName}\nDesign #${chosenAppearance.designId}\n\nClick OK to accept, Cancel to reroll.`
      );
      if (accepted) {
        appearanceAccepted = true;
      } else {
        const continueCreation = window.confirm('Reroll appearance? OK to continue, Cancel to abort creation.');
        if (!continueCreation) {
          this.showFeedback('Bruto creation cancelled.', false);
          return;
        }
        chosenAppearance = this.appearanceGenerator.randomAppearance();
      }
    }

    const bruto = this.brutoFactory.createNewBruto(this.currentUser.id, name, chosenAppearance);
    const createResult = await this.brutoRepo.create(bruto);
    if (!createResult.success) {
      this.showFeedback('Failed to create bruto. Please retry.', true);
      return;
    }

    this.showFeedback(`${bruto.name} joined your roster!`, false);
    await this.refreshState();

    const store = useStore.getState();
    const created = this.currentBrutos.find((entry) => entry.id === bruto.id) ?? bruto;
    store.setSelectedBruto(created);
    this.scene.start('BrutoDetailsScene');
  }
}
