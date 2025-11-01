/**
 * BrutoCreationScene - Create your first Bruto
 * MyBrute-style character creation with name input and appearance preview
 */

import Phaser from 'phaser';
import { BrutoFactory } from '../engine/BrutoFactory';
import { AppearanceGenerator } from '../engine/AppearanceGenerator';
import { useStore } from '../state/store';
import { apiClient } from '../services/ApiClient';
import { IBruto } from '../models/Bruto';

export class BrutoCreationScene extends Phaser.Scene {
  private brutoFactory!: BrutoFactory;
  private appearanceGenerator!: AppearanceGenerator;
  private container: HTMLDivElement | null = null;
  private _previewBruto: IBruto | null = null;

  constructor() {
    super({ key: 'BrutoCreationScene' });
  }

  create(): void {
    console.log('[BrutoCreationScene] Scene created');

    // Initialize services
    this.appearanceGenerator = new AppearanceGenerator();
    this.brutoFactory = new BrutoFactory(this.appearanceGenerator);

    // Add body class for styling
    document.body.classList.add('creation-active');

    // Set dark background color
    this.cameras.main.setBackgroundColor('#050100');

    // Create HTML overlay with new epic design
    this.createHTML();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;

    // Title banner
    const banner = this.add.rectangle(width / 2, 100, width, 180, 0xD4B896);
    banner.setStrokeStyle(4, 0x8B7355);

    // Title text - "MY BRUTE"
    const _title = this.add.text(width / 2, 70, 'MY BRUTE', {
      fontSize: '72px',
      fontFamily: 'Impact, Arial Black, sans-serif',
      color: '#8B4513',
      stroke: '#4A2511',
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#00000066',
        blur: 0,
        fill: true,
      },
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 140, 'SETTLE YOUR DIFFERENCES IN THE ARENA!', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#8B4513',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Timer (cosmetic)
    const timerBg = this.add.ellipse(width / 2, 190, 100, 35, 0xFFFFFF, 0.8);
    timerBg.setStrokeStyle(2, 0x8B7355);
    this.add.text(width / 2, 190, '⏱ 03:06', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#8B4513',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Left character decoration
    this.createCharacterDecoration(200, height - 150, true);

    // Right character decoration
    this.createCharacterDecoration(width - 200, height - 150, false);
  }

  private createCharacterDecoration(x: number, y: number, isLeft: boolean): void {
    // Simple brute silhouette decoration
    const _body = this.add.ellipse(x, y, 80, 100, 0x8B4513);
    const head = this.add.circle(x, y - 60, 35, 0xD2B48C);
    head.setStrokeStyle(2, 0x8B4513);

    // Add some character details
    const _eye1 = this.add.circle(x - 10, y - 65, 3, 0x000000);
    const _eye2 = this.add.circle(x + 10, y - 65, 3, 0x000000);

    // Weapon or shield
    if (isLeft) {
      const shield = this.add.rectangle(x - 50, y, 40, 50, 0xC0C0C0);
      shield.setStrokeStyle(3, 0x808080);
    } else {
      const sword = this.add.rectangle(x + 60, y - 40, 10, 80, 0xC0C0C0);
      sword.setStrokeStyle(2, 0x808080);
    }
  }

  private createHTML(): void {
    this.container = document.createElement('div');
    this.container.className = 'creation-container';

    this.container.innerHTML = `
      <!-- Fire glow effect -->
      <div class="creation-fire-glow"></div>
      
      <!-- Main card -->
      <div class="creation-card">
        <h1 class="creation-title">⚔️ CREATE YOUR BRUTO ⚔️</h1>
        
        <div class="creation-grid">
          <!-- Left Panel: Character Preview & Name -->
          <div class="creation-preview-panel">
            <h3 class="creation-preview-title">🔥 Your Warrior</h3>
            
            <div class="creation-preview-display">
              <div class="creation-bruto-silhouette">
                <div class="creation-bruto-head">❓</div>
              </div>
              <p class="creation-preview-text">Your mighty bruto will appear here</p>
            </div>

            <div class="creation-input-group">
              <input 
                type="text" 
                id="brutoNameInput" 
                class="creation-input"
                placeholder="Enter warrior name..."
                maxlength="20"
                autocomplete="off"
              />
            </div>

            <div id="nameError" class="creation-message"></div>

            <button id="validateBtn" class="creation-btn creation-btn-primary">
              🔍 Validate Name
            </button>

            <button id="createBtn" class="creation-btn creation-btn-success">
              ⚔️ Create Bruto
            </button>
          </div>

          <!-- Right Panel: Instructions -->
          <div class="creation-info-panel">
            <h2 class="creation-info-title">🔥 TO BE A BRUTO...</h2>
            
            <p class="creation-info-text">
              Choose a legendary name for your warrior. You will enter the arena to fight against other fierce Brutos, 
              recruit pupils, and climb the ranks through blood and glory.
            </p>

            <p class="creation-info-text">
              Gain experience in brutal combat, unlock devastating skills, and prove your worth in the arena. 
              Only the strongest will rise to become...
            </p>

            <p class="creation-info-highlight" style="text-align: center; font-size: 1.8rem; margin: 30px 0;">
              🏆 THE ULTIMATE BRUTO! 🏆
            </p>

            <ul class="creation-features">
              <li class="creation-feature-item">Fight in the legendary arena</li>
              <li class="creation-feature-item">Recruit and train pupils</li>
              <li class="creation-feature-item">Unlock powerful weapons & skills</li>
              <li class="creation-feature-item">Dominate the global rankings</li>
              <li class="creation-feature-item">Forge your warrior legacy</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Event listeners
    const nameInput = document.getElementById('brutoNameInput') as HTMLInputElement;
    const validateBtn = document.getElementById('validateBtn') as HTMLButtonElement;
    const createBtn = document.getElementById('createBtn') as HTMLButtonElement;

    validateBtn.addEventListener('click', () => this.validateName());
    createBtn.addEventListener('click', () => this.createBruto());
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.createBruto();
      }
    });

    // Focus input
    nameInput.focus();
  }

  private async validateName(): Promise<void> {
    const nameInput = document.getElementById('brutoNameInput') as HTMLInputElement;
    const errorDiv = document.getElementById('nameError') as HTMLDivElement;
    const name = nameInput.value.trim();

    errorDiv.textContent = '';
    errorDiv.className = 'creation-message';

    if (!name) {
      errorDiv.textContent = '⚠️ Please enter a name';
      errorDiv.classList.add('error');
      return;
    }

    try {
      // Check name availability via API
      const { available } = await apiClient.checkBrutoName(name);
      
      if (!available) {
        errorDiv.textContent = '❌ Name already taken';
        errorDiv.classList.add('error');
        return;
      }

      errorDiv.textContent = '✅ Name available!';
      errorDiv.classList.add('success');
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Error checking name';
      errorDiv.classList.add('error');
    }
  }

  private async createBruto(): Promise<void> {
    const nameInput = document.getElementById('brutoNameInput') as HTMLInputElement;
    const errorDiv = document.getElementById('nameError') as HTMLDivElement;
    const name = nameInput.value.trim();

    errorDiv.textContent = '';
    errorDiv.className = 'creation-message';

    const currentUser = useStore.getState().currentUser;
    if (!currentUser) {
      errorDiv.textContent = '❌ User not logged in';
      errorDiv.classList.add('error');
      return;
    }

    if (!name) {
      errorDiv.textContent = '⚠️ Please enter a name';
      errorDiv.classList.add('error');
      return;
    }

    try {
      // Generate appearance and create bruto locally first
      const bruto = this.brutoFactory.createNewBruto(currentUser.id, name);

      // Save to backend via API (convert to API format)
      const savedBruto = await apiClient.createBruto({
        name: bruto.name,
        strength: bruto.str,
        agility: bruto.agility,
        speed: bruto.speed,
        hp: bruto.maxHp,
        appearance: {
          appearanceId: bruto.appearanceId,
          colorVariant: bruto.colorVariant
        }
      });

      console.log('[BrutoCreationScene] Bruto created:', name);

      // Set as selected bruto (convert from API format to IBruto)
      const brutoForStore: IBruto = {
        id: savedBruto.id,
        userId: savedBruto.userId,
        name: savedBruto.name,
        level: savedBruto.level,
        xp: savedBruto.xp,
        hp: savedBruto.hp,
        maxHp: savedBruto.hp,
        str: savedBruto.strength,
        agility: savedBruto.agility,
        speed: savedBruto.speed,
        resistance: 0,
        appearanceId: savedBruto.appearance.appearanceId,
        colorVariant: savedBruto.appearance.colorVariant,
        createdAt: new Date(savedBruto.createdAt)
      };
      useStore.getState().setSelectedBruto(brutoForStore);

      // Navigate to Bruto Selection
      this.cleanup();
      this.scene.start('BrutoSelectionScene');
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Error creating bruto';
      errorDiv.classList.add('error');
    }
  }

  private cleanup(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    // Remove body class
    document.body.classList.remove('creation-active');
  }

  shutdown(): void {
    this.cleanup();
  }
}
