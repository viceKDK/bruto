/**
 * Main entry point for El Bruto
 * Initializes Phaser game with configured scenes
 */

import Phaser from 'phaser';
import { gameConfig } from './config';

console.log('[Main] Initializing El Bruto...');
console.log('[Main] Game Config:', gameConfig);

// Initialize Phaser game
const game = new Phaser.Game(gameConfig);

// Log successful initialization
console.log('[Main] Phaser game initialized successfully');

// Expose game instance for debugging (dev mode only)
if (import.meta.env.DEV) {
  (window as any).game = game;
  console.log('[Main] Game instance exposed as window.game (dev mode)');
}

export default game;
