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
  private previewBruto: IBruto | null = null;

  constructor() {
    super({ key: 'BrutoCreationScene' });
  }

  create(): void {
    console.log('[BrutoCreationScene] Scene created');

    // Initialize services
    this.appearanceGenerator = new AppearanceGenerator();
    this.brutoFactory = new BrutoFactory(this.appearanceGenerator);

    // Set vintage background color
    this.cameras.main.setBackgroundColor('#E8D4A0');

    // Draw background elements
    this.createBackground();

    // Create HTML overlay
    this.createHTML();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;

    // Title banner
    const banner = this.add.rectangle(width / 2, 100, width, 180, 0xD4B896);
    banner.setStrokeStyle(4, 0x8B7355);

    // Title text - "MY BRUTE"
    const title = this.add.text(width / 2, 70, 'MY BRUTE', {
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
    const body = this.add.ellipse(x, y, 80, 100, 0x8B4513);
    const head = this.add.circle(x, y - 60, 35, 0xD2B48C);
    head.setStrokeStyle(2, 0x8B4513);

    // Add some character details
    const eye1 = this.add.circle(x - 10, y - 65, 3, 0x000000);
    const eye2 = this.add.circle(x + 10, y - 65, 3, 0x000000);

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
    this.container.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin-top: 60px;
      width: 90%;
      max-width: 900px;
      background: linear-gradient(to bottom, #F5E6D3 0%, #E8D4A0 100%);
      border: 4px solid #8B7355;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.3);
      padding: 40px;
      font-family: Arial, sans-serif;
      z-index: 1000;
    `;

    this.container.innerHTML = `
      <div style="display: grid; grid-template-columns: 300px 1fr; gap: 40px;">
        <!-- Left panel: Name input and preview -->
        <div style="background: rgba(255,255,255,0.4); padding: 20px; border: 3px solid #8B7355; border-radius: 12px;">
          <h3 style="margin: 0 0 15px 0; color: #8B4513; font-size: 16px; text-transform: uppercase; border-bottom: 2px solid #8B7355; padding-bottom: 8px;">
            Choose a name ✓
          </h3>
          
          <input 
            type="text" 
            id="brutoNameInput" 
            placeholder="Enter bruto name..."
            maxlength="20"
            style="
              width: 100%;
              padding: 12px;
              font-size: 16px;
              border: 3px solid #8B7355;
              border-radius: 6px;
              background: #FFF;
              font-family: Arial, sans-serif;
              margin-bottom: 20px;
            "
          />

          <!-- Preview silhouette -->
          <div style="text-align: center; margin: 20px 0;">
            <div style="
              width: 120px;
              height: 150px;
              margin: 0 auto;
              background: linear-gradient(135deg, #8B4513 0%, #5C3317 100%);
              border-radius: 50% 50% 40% 40%;
              position: relative;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            ">
              <div style="
                width: 60px;
                height: 60px;
                background: #D2B48C;
                border-radius: 50%;
                position: absolute;
                top: -30px;
                left: 30px;
                border: 3px solid #8B4513;
              ">
                <div style="
                  position: absolute;
                  top: 20px;
                  left: 15px;
                  font-size: 32px;
                ">❓</div>
              </div>
            </div>
            <p style="margin: 15px 0 0 0; color: #8B4513; font-size: 12px; font-style: italic;">
              Your bruto will appear here
            </p>
          </div>

          <!-- Appearance options (locked for now) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
            <div style="
              background: #D4B896;
              border: 2px solid #8B7355;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              opacity: 0.5;
            ">
              <span style="font-size: 24px;">🎨</span>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #8B4513;">Colors</p>
              <div style="
                width: 30px;
                height: 30px;
                background: #8B4513;
                border: 2px solid #FFF;
                border-radius: 50%;
                margin: 8px auto 0;
              "></div>
            </div>
            <div style="
              background: #D4B896;
              border: 2px solid #8B7355;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              opacity: 0.5;
            ">
              <span style="font-size: 24px;">🚀</span>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #8B4513;">Special</p>
              <div style="
                width: 30px;
                height: 30px;
                background: linear-gradient(45deg, #FF6B35, #F7931E);
                border: 2px solid #FFF;
                border-radius: 50%;
                margin: 8px auto 0;
              "></div>
            </div>
          </div>

          <div id="nameError" style="
            color: #D32F2F;
            font-size: 13px;
            min-height: 20px;
            margin: 10px 0;
            font-weight: bold;
            text-align: center;
          "></div>

          <button id="validateBtn" style="
            width: 100%;
            padding: 14px;
            background: linear-gradient(to bottom, #A8E6CF 0%, #7BC8A4 100%);
            border: 3px solid #4A7C59;
            border-radius: 8px;
            color: #FFF;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 4px 0 #3D6647, 0 6px 8px rgba(0,0,0,0.3);
            transition: all 0.1s;
            text-shadow: 0 2px 2px rgba(0,0,0,0.3);
          " onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='0 0 0 #3D6647, 0 2px 4px rgba(0,0,0,0.3)';" onmouseup="this.style.transform=''; this.style.boxShadow='0 4px 0 #3D6647, 0 6px 8px rgba(0,0,0,0.3)';">
            Validate
          </button>

          <button id="connectBtn" style="
            width: 100%;
            padding: 14px;
            margin-top: 10px;
            background: linear-gradient(to bottom, #4CAF50 0%, #388E3C 100%);
            border: 3px solid #2E7D32;
            border-radius: 8px;
            color: #FFF;
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            box-shadow: 0 4px 0 #1B5E20, 0 6px 8px rgba(0,0,0,0.3);
            transition: all 0.1s;
            text-shadow: 0 2px 2px rgba(0,0,0,0.3);
          " onmousedown="this.style.transform='translateY(4px)'; this.style.boxShadow='0 0 0 #1B5E20, 0 2px 4px rgba(0,0,0,0.3)';" onmouseup="this.style.transform=''; this.style.boxShadow='0 4px 0 #1B5E20, 0 6px 8px rgba(0,0,0,0.3)';">
            Connect
          </button>
        </div>

        <!-- Right panel: Instructions -->
        <div>
          <div style="
            background: rgba(255,255,255,0.6);
            border: 3px solid #8B7355;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
          ">
            <h2 style="
              margin: 0 0 15px 0;
              color: #8B4513;
              font-size: 24px;
              font-family: Impact, Arial Black, sans-serif;
            ">TO BE A BRUTE...</h2>
            
            <p style="
              color: #8B4513;
              font-size: 15px;
              line-height: 1.6;
              margin: 0;
            ">
              Insert a name to create your own Brute. You will be able to fight against other Brutes in the arena and recruit new pupils. Gain experience and fight tough in the ranking to become...<br>
              <strong style="font-size: 16px; color: #D32F2F;">THE BRUTE!</strong>
            </p>
          </div>


        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Event listeners
    const nameInput = document.getElementById('brutoNameInput') as HTMLInputElement;
    const validateBtn = document.getElementById('validateBtn') as HTMLButtonElement;
    const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement;

    validateBtn.addEventListener('click', () => this.validateName());
    connectBtn.addEventListener('click', () => this.createBruto());
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
    errorDiv.style.color = '#D32F2F';

    if (!name) {
      errorDiv.textContent = 'Please enter a name';
      return;
    }

    try {
      // Check name availability via API
      const { available } = await apiClient.checkBrutoName(name);
      
      if (!available) {
        errorDiv.textContent = 'Name already taken';
        return;
      }

      errorDiv.style.color = '#4CAF50';
      errorDiv.textContent = '✓ Name available!';
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Error checking name';
    }
  }

  private async createBruto(): Promise<void> {
    const nameInput = document.getElementById('brutoNameInput') as HTMLInputElement;
    const errorDiv = document.getElementById('nameError') as HTMLDivElement;
    const name = nameInput.value.trim();

    errorDiv.textContent = '';
    errorDiv.style.color = '#D32F2F';

    const currentUser = useStore.getState().currentUser;
    if (!currentUser) {
      errorDiv.textContent = 'User not logged in';
      return;
    }

    if (!name) {
      errorDiv.textContent = 'Please enter a name';
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
    }
  }

  private cleanup(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  shutdown(): void {
    this.cleanup();
  }
}
