/**
 * Phaser Game Configuration
 * Central configuration for Phaser game initialization
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from './utils/theme';

// Import scenes (will be created next)
import { BootScene } from './scenes/BootScene';
import { LoginScene as LoginScene2 } from './scenes/auth/LoginScene2';
import { BrutoCreationScene } from './scenes/BrutoCreationScene';
import { BrutoSelectionScene } from './scenes/BrutoSelectionScene';
import { BrutoDetailsScene } from './scenes/BrutoDetailsScene';
import { OpponentSelectionScene } from './scenes/OpponentSelectionScene';
import { CombatScene } from './scenes/CombatScene';
import { LevelUpScene } from './scenes/LevelUpScene';
import { UIScene } from './scenes/UIScene';
import { ReplayScene } from './scenes/ReplayScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent: 'app',
  backgroundColor: '#1a1a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    LoginScene2,
    BrutoCreationScene,
    BrutoSelectionScene,
    BrutoDetailsScene,
    OpponentSelectionScene,
    CombatScene,
    LevelUpScene,
    UIScene,
    ReplayScene,
  ],
  fps: {
    target: GAME_CONFIG.fps,
    forceSetTimeOut: false,
  },
};
