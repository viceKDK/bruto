/**
 * BootScene - Initial scene for preloading assets and initializing database
 * First scene in the game flow
 */

import Phaser from 'phaser';
import { DatabaseManager } from '../database/DatabaseManager';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // TODO: Load critical assets (Epic 1 Story 1.3)
    // - UI sprites
    // - Fonts
    // - Core graphics

    console.log('[BootScene] Preloading assets...');
  }

  async create(): Promise<void> {
    console.log('[BootScene] Scene created');

    // Initialize database (Epic 1 Story 1.2)
    const db = DatabaseManager.getInstance();
    const initResult = await db.initialize();

    if (!initResult.success) {
      console.error('[BootScene] Database initialization failed:', initResult.error);
      // Show error screen to user
      this.add.text(640, 360, 'Database initialization failed.\nPlease refresh the page.', {
        fontSize: '24px',
        color: '#ff3333',
        align: 'center',
      }).setOrigin(0.5);
      return;
    }

    console.log('[BootScene] Database initialized successfully');

    // Launch UIScene as persistent overlay
    this.scene.launch('UIScene');

    // Navigate to LoginScene after initialization
    this.scene.start('LoginScene');
  }
}
