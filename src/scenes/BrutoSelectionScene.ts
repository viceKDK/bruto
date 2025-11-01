/**
 * BrutoSelectionScene - Choose bruto from 3-4 slots (Epic 2 Story 2.2)
 * MyBrute-inspired UI with HTML/CSS styling
 */

import Phaser from 'phaser';
import { DatabaseManager } from '../database/DatabaseManager';
import { UserRepository } from '../database/repositories/UserRepository';
import { BrutoRepository } from '../database/repositories/BrutoRepository';
import { BattleRepository } from '../database/repositories/BattleRepository';
import { DailyFightsRepository } from '../database/repositories/DailyFightsRepository';
import { DailyFightsService } from '../engine/DailyFightsService';
import { AppearanceGenerator } from '../engine/AppearanceGenerator';
import { BrutoFactory } from '../engine/BrutoFactory';
import { BrutoNameValidator } from '../engine/BrutoNameValidator';
import { ProgressionService } from '../engine/progression/ProgressionService';
import { ProgressionService as XPProgressionService } from '../services/ProgressionService';
import { SlotPurchaseService } from '../services/SlotPurchaseService';
import { useStore } from '../state/store';
import { IUser } from '../models/User';
import { IBruto } from '../models/Bruto';
import { IBattle } from '../models/Battle';
import skillsData from '../data/skills.json';
import weaponsData from '../data/weapons.json';

export class BrutoSelectionScene extends Phaser.Scene {
  private userRepo!: UserRepository;
  private brutoRepo!: BrutoRepository;
  private battleRepo!: BattleRepository;
  private dailyFightsRepo!: DailyFightsRepository;
  private dailyFightsService!: DailyFightsService;
  private appearanceGenerator!: AppearanceGenerator;
  private brutoFactory!: BrutoFactory;
  private progressionService!: ProgressionService;
  private currentUser: IUser | null = null;
  private currentBrutos: IBruto[] = [];
  private brutoBattles: Map<string, IBattle[]> = new Map();
  private brutoNames: Map<string, string> = new Map(); // Map bruto IDs to names
  private brutoRecords: Map<string, { wins: number; losses: number }> = new Map(); // Win/Loss records
  private readonly SLOT_COST = SlotPurchaseService.SLOT_PRICE;
  private readonly MAX_SLOTS = SlotPurchaseService.MAX_SLOTS;

  private container: HTMLDivElement | null = null;
  private preloader: HTMLDivElement | null = null;
  private toastContainer: HTMLDivElement | null = null;
  private isProcessing = false;
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    super({ key: 'BrutoSelectionScene' });
  }

  create(): void {
    console.log('[BrutoSelectionScene] Scene created');

    // Add body class for styling
    document.body.classList.add('profile-active');

    // Set background color
    this.cameras.main.setBackgroundColor('#D4B896');

    // Clean up any existing preloaders from previous scenes
    this.cleanupExistingPreloaders();

    // Show preloader immediately
    this.showPreloader();

    // Repository setup
    const db = DatabaseManager.getInstance();
    this.userRepo = new UserRepository(db);
    this.brutoRepo = new BrutoRepository(db);
    this.battleRepo = new BattleRepository(db);
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
      alert('No active session found. Redirecting to login...');
      this.time.delayedCall(1500, () => this.scene.start('LoginScene'));
      return;
    }

    this.currentUser = store.currentUser;
    await this.refreshState();
    this.createHTML();
    
    // Hide preloader after content is ready
    this.hidePreloader();
  }

  private showPreloader(): void {
    this.preloader = document.createElement('div');
    this.preloader.className = 'landing-preloader';
    this.preloader.setAttribute('data-preloader', 'true');
    
    this.preloader.innerHTML = `
      <div class="landing-loader"></div>
      <div class="landing-loader-text">Cargando...</div>
    `;
    
    document.body.appendChild(this.preloader);
  }

  private cleanupExistingPreloaders(): void {
    // Remove any existing preloaders from landing or previous scenes
    const existingPreloaders = document.querySelectorAll('[data-landing-preloader], [data-preloader]');
    existingPreloaders.forEach(preloader => {
      preloader.remove();
    });
  }

  private hidePreloader(): void {
    if (this.preloader) {
      this.preloader.classList.add('is-hidden');
      
      // Remove from DOM after transition
      setTimeout(() => {
        if (this.preloader) {
          this.preloader.remove();
          this.preloader = null;
        }
      }, 500); // Match CSS transition duration
    }
  }

  private async refreshState(): Promise<void> {
    if (!this.currentUser) return;

    const userResult = await this.userRepo.findById(this.currentUser.id);
    if (!userResult.success || !userResult.data) {
      alert('Failed to load user profile');
      this.time.delayedCall(1500, () => this.scene.start('LoginScene'));
      return;
    }

    const syncedUser = userResult.data;
    useStore.getState().setCurrentUser(syncedUser);
    this.currentUser = syncedUser;

    const brutosResult = await this.brutoRepo.findByUserId(syncedUser.id);
    if (!brutosResult.success) {
      alert('Failed to load bruto slots');
      return;
    }

    this.currentBrutos = brutosResult.data;
    
    // Load battles for each bruto
    this.brutoBattles.clear();
    this.brutoNames.clear();
    this.brutoRecords.clear();
    
    // Build name map
    for (const bruto of this.currentBrutos) {
      this.brutoNames.set(bruto.id, bruto.name);
    }
    
    // Load battles and records
    for (const bruto of this.currentBrutos) {
      const battlesResult = await this.battleRepo.getLastBattles(bruto.id, 10);
      if (battlesResult.success) {
        this.brutoBattles.set(bruto.id, battlesResult.data);
      }
      
      // Get win/loss record
      const recordResult = await this.battleRepo.getRecord(bruto.id);
      if (recordResult.success) {
        this.brutoRecords.set(bruto.id, {
          wins: recordResult.data.wins,
          losses: recordResult.data.losses
        });
      }
    }
    
    await this.syncDailyFights();
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

  private createHTML(): void {
    this.container = document.createElement('div');
    this.container.className = 'profile-container';

    // Determine selected bruto (first one with data, or null)
    const selectedBruto = this.currentBrutos.length > 0 ? this.currentBrutos[0] : null;
    const store = useStore.getState();
    const dailyFights = store.dailyFights;

    this.container.innerHTML = `
      <!-- Header Banner -->
      <div class="profile-header">
        <div>
          <h1 class="profile-title">⚔️ CASILLERO ⚔️</h1>
        </div>
        <div class="profile-user-info">
          <div class="profile-username">👤 ${this.currentUser?.username || 'Unknown'}</div>
          <div class="profile-coins">
            <span class="profile-coin-icon">🪙</span>
            <strong>${this.currentUser?.coins || 0}</strong> Coins
            <span style="margin-left: 20px;">Slots: ${this.currentUser?.brutoSlots || 0}/${this.MAX_SLOTS}</span>
            <span style="margin-left: 20px; color: ${dailyFights.remaining > 0 ? '#4CAF50' : '#D32F2F'};">
              ⚔️ ${dailyFights.remaining}/${dailyFights.maxFights} Fights
            </span>
          </div>
          <button class="profile-btn profile-btn-secondary" data-action="logout" style="margin-top: 10px;">
            🚪 Logout
          </button>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="profile-grid">
        <!-- Left Panel: Selected Bruto -->
        <div class="profile-bruto-card">
          ${selectedBruto ? this.renderBrutoCard(selectedBruto) : this.renderEmptyBrutoCard()}
        </div>

        <!-- Right Panel: Slots List -->
        <div class="profile-right-panel">
          ${this.renderSlotsSection()}
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.attachEventListeners();
    this.createToastContainer();
    this.setupKeyboardShortcuts();
  }

  private createToastContainer(): void {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'toast-container';
    this.toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(this.toastContainer);
  }

  private setupKeyboardShortcuts(): void {
    this.keyboardHandler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const selectedBruto = this.currentBrutos.length > 0 ? this.currentBrutos[0] : null;

      switch(e.key.toLowerCase()) {
        case 'f':
          // F - Fight with current bruto
          if (selectedBruto && !this.isProcessing) {
            e.preventDefault();
            this.navigateToFight(selectedBruto);
          }
          break;
        
        case 'c':
          // C - Create new bruto
          if (!this.isProcessing) {
            e.preventDefault();
            void this.handleCreateBruto();
          }
          break;
        
        case '1':
        case '2':
        case '3':
        case '4':
          // Number keys - Select bruto slot
          const slotIndex = parseInt(e.key) - 1;
          if (slotIndex < this.currentBrutos.length && !this.isProcessing) {
            e.preventDefault();
            const bruto = this.currentBrutos[slotIndex];
            useStore.getState().setSelectedBruto(bruto);
            this.cleanup();
            this.createHTML();
          }
          break;
        
        case 'escape':
          // ESC - Cancel/Back (could add menu later)
          e.preventDefault();
          break;
      }
    };

    document.addEventListener('keydown', this.keyboardHandler);
    
    // Show keyboard hints toast on first load
    setTimeout(() => {
      this.showToast('⌨️ Shortcuts: F=Fight | C=Create | 1-4=Select Slot', 'info');
    }, 1000);
  }

  private showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    const bgColors = {
      success: '#4CAF50',
      error: '#D32F2F',
      info: '#ff7b1c'
    };
    
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️'
    };

    toast.style.cssText = `
      background: ${bgColors[type]};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 1rem;
      font-weight: 600;
      min-width: 250px;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
      cursor: pointer;
    `;
    
    toast.innerHTML = `${icons[type]} ${message}`;
    
    // Auto remove after 3 seconds
    const removeToast = () => {
      toast.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    };
    
    toast.addEventListener('click', removeToast);
    setTimeout(removeToast, 3000);
    
    this.toastContainer.appendChild(toast);
  }

  private showConfirmDialog(message: string, onConfirm: () => void): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: linear-gradient(to bottom, #F5E6D3 0%, #E8D4A0 100%);
      border: 4px solid #8B7355;
      border-radius: 16px;
      padding: 40px;
      max-width: 500px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      animation: scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      text-align: center;
    `;

    dialog.innerHTML = `
      <div style="font-size: 1.5rem; font-weight: 700; color: #8B4513; margin-bottom: 30px; line-height: 1.6;">
        ${message}
      </div>
      <div style="display: flex; gap: 20px; justify-content: center;">
        <button class="dialog-btn confirm" style="
          background: linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%);
          color: white;
          border: 3px solid #8B1A1A;
          padding: 12px 30px;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.2s;
        ">
          ✓ Confirm
        </button>
        <button class="dialog-btn cancel" style="
          background: linear-gradient(135deg, #757575 0%, #616161 100%);
          color: white;
          border: 3px solid #424242;
          padding: 12px 30px;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.2s;
        ">
          ✗ Cancel
        </button>
      </div>
    `;

    const closeDialog = () => {
      overlay.style.animation = 'fadeOut 0.2s ease-out';
      setTimeout(() => overlay.remove(), 200);
    };

    const confirmBtn = dialog.querySelector('.confirm');
    const cancelBtn = dialog.querySelector('.cancel');

    confirmBtn?.addEventListener('click', () => {
      closeDialog();
      onConfirm();
    });

    cancelBtn?.addEventListener('click', closeDialog);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDialog();
    });

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Add hover effects
    [confirmBtn, cancelBtn].forEach(btn => {
      btn?.addEventListener('mouseenter', () => {
        (btn as HTMLElement).style.transform = 'scale(1.05)';
        (btn as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
      });
      btn?.addEventListener('mouseleave', () => {
        (btn as HTMLElement).style.transform = 'scale(1)';
        (btn as HTMLElement).style.boxShadow = 'none';
      });
    });
  }

  private renderBrutoCard(bruto: IBruto): string {
    const hpPercent = (bruto.hp / bruto.maxHp) * 100;
    const xpPercent = this.calculateXPPercent(bruto);
    const spriteUrl = this.getBrutoSprite(bruto.appearanceId);
    const record = this.brutoRecords.get(bruto.id) || { wins: 0, losses: 0 };
    const winRate = record.wins + record.losses > 0 
      ? Math.round((record.wins / (record.wins + record.losses)) * 100) 
      : 0;
    
    return `
      <h2 class="profile-bruto-name">${bruto.name}</h2>
      <div class="profile-bruto-level">
        Level ${bruto.level} 
        <span style="font-size: 0.9rem; color: #D2691E; margin-left: 10px;">
          ${record.wins}W - ${record.losses}L (${winRate}%)
        </span>
      </div>

      <div class="profile-bruto-display">
        <div class="profile-bruto-sprite">
          <img src="${spriteUrl}" alt="${bruto.name}" style="max-width: 100%; height: auto; image-rendering: pixelated;" />
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="profile-stats-grid">
        <div class="profile-stat-item" title="Strength: Increases damage dealt in combat">
          <div class="profile-stat-label">💪 STR</div>
          <div class="profile-stat-value">${bruto.str}</div>
        </div>
        <div class="profile-stat-item" title="Speed: Determines attack order and initiative">
          <div class="profile-stat-label">🏃 SPD</div>
          <div class="profile-stat-value">${bruto.speed}</div>
        </div>
        <div class="profile-stat-item" title="Agility: Improves dodge and critical hit chance">
          <div class="profile-stat-label">🤸 AGI</div>
          <div class="profile-stat-value">${bruto.agility}</div>
        </div>
        <div class="profile-stat-item" title="Resistance: Reduces damage taken from attacks">
          <div class="profile-stat-label">🛡️ RES</div>
          <div class="profile-stat-value">${bruto.resistance || 0}</div>
        </div>
      </div>

      <!-- HP Bar -->
      <div class="profile-hp-bar-container">
        <div class="profile-hp-label">Health Points</div>
        <div class="profile-hp-bar">
          <div class="profile-hp-fill" style="width: ${hpPercent}%"></div>
          <div class="profile-hp-text">${bruto.hp} / ${bruto.maxHp}</div>
        </div>
      </div>

      <!-- XP Bar -->
      <div class="profile-xp-bar-container">
        <div class="profile-xp-label">Experience</div>
        <div class="profile-xp-bar">
          <div class="profile-xp-fill" style="width: ${xpPercent}%"></div>
          <div class="profile-xp-text">${bruto.xp || 0} XP</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="profile-actions">
        <button class="profile-btn profile-btn-primary" data-action="fight" data-bruto-id="${bruto.id}">
          ⚔️ Fight Now
        </button>
        <button class="profile-btn profile-btn-primary" data-action="view-details" data-bruto-id="${bruto.id}">
          👁️ View Details
        </button>
        <button class="profile-btn profile-btn-danger" data-action="delete" data-bruto-id="${bruto.id}">
          🗑️ Delete
        </button>
      </div>
    `;
  }

  private calculateXPPercent(bruto: IBruto): number {
    // Use static method from ProgressionService
    return XPProgressionService.getXPProgress(bruto.xp, bruto.level);
  }

  private getBrutoSprite(appearanceId: number): string {
    // Map appearance IDs to sprite files
    const spriteMap: Record<number, string> = {
      1: '/src/assets/sprites/warrior-hero.png',
      2: '/src/assets/sprites/warrior-woman.webp',
      3: '/src/assets/sprites/chef.png',
      4: '/src/assets/sprites/zombie.png',
      5: '/src/assets/sprites/bruto-left.png',
    };
    
    return spriteMap[appearanceId] || spriteMap[1];
  }

  private renderEmptyBrutoCard(): string {
    return `
      <div class="profile-empty-state">
        <h2 style="font-size: 2rem; margin-bottom: 20px;">No Bruto Selected</h2>
        <p style="font-size: 1.2rem; margin-bottom: 30px;">
          Create your first warrior to begin your journey!
        </p>
        <div style="font-size: 6rem; margin: 40px 0;">⚔️</div>
        <button class="profile-btn profile-btn-primary" data-action="create-bruto" style="max-width: 300px; margin: 0 auto;">
          ⚡ Create New Bruto
        </button>
      </div>
    `;
  }

  private renderSlotsSection(): string {
    const slots = [];
    
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const isUnlocked = i < (this.currentUser?.brutoSlots || 0);
      const bruto = this.currentBrutos[i];
      
      if (isUnlocked) {
        if (bruto) {
          slots.push(this.renderFilledSlot(bruto, i + 1));
        } else {
          slots.push(this.renderEmptySlot(i + 1));
        }
      } else {
        slots.push(this.renderLockedSlot(i + 1));
      }
    }

    return `
      <div class="profile-section">
        <h3 class="profile-section-title">🎖️ Bruto Roster</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${slots.join('')}
        </div>
      </div>

      <!-- Example: Skills Section (can add later) -->
      <div class="profile-section">
        <h3 class="profile-section-title">⚔️ Skills & Weapons</h3>
        <div class="profile-icon-grid">
          ${this.renderSkillsAndWeapons()}
        </div>
      </div>

      <!-- Battle History -->
      <div class="profile-section">
        <h3 class="profile-section-title">🏆 Battle History</h3>
        <div class="profile-battle-history">
          ${this.renderBattleHistory()}
        </div>
      </div>
    `;
  }

  private renderFilledSlot(bruto: IBruto, slotNumber: number): string {
    const record = this.brutoRecords.get(bruto.id) || { wins: 0, losses: 0 };
    const hpPercent = (bruto.hp / bruto.maxHp) * 100;
    const hpStatus = hpPercent > 75 ? '🟢' : hpPercent > 25 ? '🟡' : '🔴';
    
    return `
      <div class="profile-battle-item" style="cursor: pointer; border-left: 4px solid #ff7b1c;" data-action="select-bruto" data-bruto-id="${bruto.id}">
        <div>
          <div class="profile-battle-opponent">
            ${hpStatus} Slot ${slotNumber}: ${bruto.name}
          </div>
          <div class="profile-battle-date">
            Lvl ${bruto.level} • HP ${bruto.hp}/${bruto.maxHp} • ${record.wins}W-${record.losses}L
          </div>
        </div>
        <div class="profile-battle-result" style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);">
          ACTIVE
        </div>
      </div>
    `;
  }

  private renderEmptySlot(slotNumber: number): string {
    return `
      <div class="profile-battle-item" style="opacity: 0.6; border-left: 4px solid #8B7355;">
        <div>
          <div class="profile-battle-opponent">Slot ${slotNumber}: Empty</div>
          <div class="profile-battle-date">Create a new bruto</div>
        </div>
        <button class="profile-btn profile-btn-primary" style="padding: 8px 16px; font-size: 0.9rem;" data-action="create-bruto">
          ➕ Create
        </button>
      </div>
    `;
  }

  private renderLockedSlot(slotNumber: number): string {
    const canAfford = (this.currentUser?.coins || 0) >= this.SLOT_COST;
    return `
      <div class="profile-battle-item" style="opacity: 0.5; border-left: 4px solid #D32F2F;">
        <div>
          <div class="profile-battle-opponent">Slot ${slotNumber}: 🔒 Locked</div>
          <div class="profile-battle-date">Unlock for ${this.SLOT_COST} coins</div>
        </div>
        <button 
          class="profile-btn profile-btn-secondary" 
          style="padding: 8px 16px; font-size: 0.9rem;" 
          data-action="unlock-slot"
          ${!canAfford ? 'disabled' : ''}
        >
          🔓 Unlock
        </button>
      </div>
    `;
  }

  private renderSkillsAndWeapons(): string {
    const selectedBruto = this.currentBrutos.length > 0 ? this.currentBrutos[0] : null;
    
    if (!selectedBruto) {
      // Show empty slots
      const slots = [];
      for (let i = 0; i < 12; i++) {
        slots.push('<div class="profile-icon-slot empty">❓</div>');
      }
      return slots.join('');
    }

    const items: string[] = [];
    
    // Add weapons
    if (selectedBruto.equippedWeapons && selectedBruto.equippedWeapons.length > 0) {
      selectedBruto.equippedWeapons.forEach((weaponId: string) => {
        const weapon = weaponsData.find(w => w.id === weaponId);
        if (weapon) {
          const icon = this.getWeaponIcon(weapon.id);
          items.push(`
            <div class="profile-icon-slot weapon" title="${weapon.name}\nDamage: ${weapon.damage}\nSpeed: ${weapon.hitSpeed}%">
              ${icon}
            </div>
          `);
        }
      });
    }
    
    // Add skills
    if (selectedBruto.skills && selectedBruto.skills.length > 0) {
      selectedBruto.skills.forEach((skillId: string) => {
        const skill = skillsData.skills.find(s => s.id === skillId);
        if (skill) {
          const icon = this.getSkillIcon(skill.id);
          items.push(`
            <div class="profile-icon-slot skill" title="${skill.name}\n${skill.description}">
              ${icon}
            </div>
          `);
        }
      });
    }
    
    // Fill remaining slots with empty
    while (items.length < 12) {
      items.push('<div class="profile-icon-slot empty">❓</div>');
    }
    
    return items.join('');
  }

  private getWeaponIcon(weaponId: string): string {
    const iconMap: Record<string, string> = {
      'bare-hands': '👊',
      'sword': '⚔️',
      'spear': '🔱',
      'axe': '🪓',
      'hammer': '🔨',
      'mace': '🏏',
      'club': '🏒',
      'staff': '🥢',
      'whip': '🪢',
      'knife': '🔪',
      'dagger': '🗡️',
      'scimitar': '🗡️',
      'broadsword': '⚔️',
      'hatchet': '🪓',
      'nunchaku': '⛓️',
      'shield': '🛡️',
    };
    return iconMap[weaponId] || '⚔️';
  }

  private getSkillIcon(skillId: string): string {
    const iconMap: Record<string, string> = {
      'fuerza_hercules': '💪',
      'agilidad_felina': '🐱',
      'velocidad_relampago': '⚡',
      'resistencia_titanes': '🛡️',
      'regeneration': '❤️‍🩹',
      'counter': '🔄',
      'sixth_sense': '👁️',
      'armor': '🛡️',
      'iron_head': '🗿',
      'survival': '🌟',
      'trategy': '🧠',
      'sabotage': '🔧',
      'backup': '🐕',
      'martial_arts': '🥋',
      'hammer_master': '🔨',
      'axe_master': '🪓',
    };
    return iconMap[skillId] || '✨';
  }

  private renderBattleHistory(): string {
    const selectedBruto = this.currentBrutos.length > 0 ? this.currentBrutos[0] : null;
    
    if (!selectedBruto) {
      return '<div class="profile-empty-state">No battles yet</div>';
    }

    const battles = this.brutoBattles.get(selectedBruto.id) || [];
    
    if (battles.length === 0) {
      return '<div class="profile-empty-state">No battles yet. Start fighting to build your history!</div>';
    }

    // Show last 5 battles
    const recentBattles = battles.slice(0, 5); // Already sorted DESC by date
    
    return recentBattles.map(battle => {
      const isWinner = battle.winnerId === selectedBruto.id;
      const opponentId = battle.opponentBrutoId;
      const opponentName = this.brutoNames.get(opponentId) || 'Unknown Opponent';
      
      const timeAgo = this.getTimeAgo(battle.foughtAt);
      
      return `
        <div class="profile-battle-item ${isWinner ? 'victory' : 'defeat'}">
          <div>
            <div class="profile-battle-opponent">vs. ${opponentName}</div>
            <div class="profile-battle-date">${timeAgo}</div>
          </div>
          <div class="profile-battle-result ${isWinner ? 'victory' : 'defeat'}">
            ${isWinner ? 'Victory' : 'Defeat'}
          </div>
        </div>
      `;
    }).join('');
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    // Fight button
    this.container.querySelectorAll('[data-action="fight"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const brutoId = (e.currentTarget as HTMLElement).dataset.brutoId;
        if (brutoId) {
          const bruto = this.currentBrutos.find((b) => b.id === brutoId);
          if (bruto) this.navigateToFight(bruto);
        }
      });
    });

    // View details button
    this.container.querySelectorAll('[data-action="view-details"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const brutoId = (e.currentTarget as HTMLElement).dataset.brutoId;
        if (brutoId) {
          const bruto = this.currentBrutos.find((b) => b.id === brutoId);
          if (bruto) this.navigateToDetails(bruto);
        }
      });
    });

    // Delete button
    this.container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const brutoId = (e.currentTarget as HTMLElement).dataset.brutoId;
        if (brutoId) {
          const bruto = this.currentBrutos.find((b) => b.id === brutoId);
          if (bruto) this.confirmDelete(bruto);
        }
      });
    });

    // Create bruto buttons
    this.container.querySelectorAll('[data-action="create-bruto"]').forEach((btn) => {
      btn.addEventListener('click', () => void this.handleCreateBruto());
    });

    // Select bruto from slots
    this.container.querySelectorAll('[data-action="select-bruto"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const brutoId = (e.currentTarget as HTMLElement).dataset.brutoId;
        if (brutoId) {
          const bruto = this.currentBrutos.find((b) => b.id === brutoId);
          if (bruto) {
            useStore.getState().setSelectedBruto(bruto);
            this.cleanup();
            this.createHTML();
            
            // Add highlight animation to the new card
            setTimeout(() => {
              const brutoCard = document.querySelector('.profile-bruto-card');
              if (brutoCard) {
                brutoCard.classList.add('highlighted');
                // Scroll smoothly to the card
                brutoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
        }
      });
    });

    // Unlock slot button
    this.container.querySelectorAll('[data-action="unlock-slot"]').forEach((btn) => {
      btn.addEventListener('click', () => void this.handleUnlockSlot());
    });

    // Logout button
    this.container.querySelectorAll('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener('click', () => this.handleLogout());
    });
  }
  private confirmDelete(bruto: IBruto): void {
    this.showConfirmDialog(
      `⚠️ Delete ${bruto.name}?\n\nThis removes stats, weapons, skills, pets, and battle history.\n\nThis action cannot be undone!`,
      () => void this.handleDelete(bruto)
    );
  }

  private async handleDelete(bruto: IBruto): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    // Show loading state
    this.setButtonsDisabled(true);

    const deleteResult = await this.brutoRepo.delete(bruto.id);
    if (!deleteResult.success) {
      this.showToast('Failed to delete bruto. Please retry.', 'error');
      this.setButtonsDisabled(false);
      this.isProcessing = false;
      return;
    }

    const store = useStore.getState();
    if (store.selectedBruto?.id === bruto.id) {
      store.setSelectedBruto(null);
    }

    this.showToast(`${bruto.name} removed from roster.`, 'success');
    await this.refreshState();
    this.cleanup();
    this.createHTML();
    this.isProcessing = false;
  }

  private setButtonsDisabled(disabled: boolean): void {
    if (!this.container) return;
    
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(btn => {
      if (disabled) {
        btn.setAttribute('disabled', 'true');
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.removeAttribute('disabled');
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  private async handleUnlockSlot(): Promise<void> {
    if (this.isProcessing) return;
    if (!this.currentUser) return;

    // Check eligibility
    const validation = await SlotPurchaseService.canPurchaseSlot(this.currentUser.id);
    if (!validation.canPurchase) {
      this.showToast(validation.reason || 'Cannot purchase slot', 'error');
      return;
    }

    this.isProcessing = true;
    this.setButtonsDisabled(true);

    // Purchase slot
    const newSlotCount = await SlotPurchaseService.purchaseSlot(this.currentUser.id);
    if (newSlotCount === -1) {
      this.showToast('Failed to unlock slot. Please retry.', 'error');
      this.setButtonsDisabled(false);
      this.isProcessing = false;
      return;
    }

    const slotNumber = newSlotCount;
    const message = slotNumber === this.MAX_SLOTS
      ? `Maximum slots unlocked! (${this.MAX_SLOTS}/${this.MAX_SLOTS})`
      : `Slot ${slotNumber} unlocked! (${newSlotCount}/${this.MAX_SLOTS})`;

    this.showToast(message, 'success');
    await this.refreshState();
    this.cleanup();
    this.createHTML();
    this.isProcessing = false;
  }

  private navigateToDetails(bruto: IBruto): void {
    const store = useStore.getState();
    store.setSelectedBruto(bruto);
    this.cleanup();
    this.scene.start('BrutoDetailsScene');
  }

  private navigateToFight(bruto: IBruto): void {
    const store = useStore.getState();
    store.setSelectedBruto(bruto);
    
    // TODO: Add sound effect here
    // this.sound.play('button_click');
    
    this.cleanup();
    this.scene.start('OpponentSelectionScene');
  }

  private handleLogout(): void {
    this.showConfirmDialog(
      '🚪 Are you sure you want to logout?\n\nYour progress is saved automatically.',
      () => {
        const store = useStore.getState();
        store.setCurrentUser(null);
        store.setSelectedBruto(null);
        this.cleanup();
        this.scene.start('LoginScene');
      }
    );
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
      this.showToast('Session unavailable. Please log in again.', 'error');
      return;
    }

    if (this.currentBrutos.length >= this.currentUser.brutoSlots) {
      this.showToast('No available slots to create a new Bruto.', 'error');
      return;
    }

    const rawName = window.prompt('Enter a name for your new Bruto:');
    if (!rawName) {
      return;
    }

    const name = rawName.trim();
    const nameValidator = new BrutoNameValidator(this.brutoRepo);
    const validation = await nameValidator.validate(name, this.currentUser.id);
    if (!validation.success) {
      this.showToast(validation.error, 'error');
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
          return;
        }
        chosenAppearance = this.appearanceGenerator.randomAppearance();
      }
    }

    const bruto = this.brutoFactory.createNewBruto(this.currentUser.id, name, chosenAppearance);
    const createResult = await this.brutoRepo.create(bruto);
    if (!createResult.success) {
      this.showToast('Failed to create bruto. Please retry.', 'error');
      return;
    }

    this.showToast(`${bruto.name} joined your roster!`, 'success');
    await this.refreshState();

    const store = useStore.getState();
    const created = this.currentBrutos.find((entry) => entry.id === bruto.id) ?? bruto;
    store.setSelectedBruto(created);
    
    this.cleanup();
    this.scene.start('BrutoDetailsScene');
  }

  private cleanup(): void {
    if (this.preloader) {
      this.preloader.remove();
      this.preloader = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    if (this.toastContainer) {
      this.toastContainer.remove();
      this.toastContainer = null;
    }
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    document.body.classList.remove('profile-active');
  }

  shutdown(): void {
    this.cleanup();
  }
}
