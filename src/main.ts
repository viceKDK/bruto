/**
 * Main entry point for El Bruto
 * Initializes Phaser game with configured scenes
 */

import Phaser from 'phaser';
import { gameConfig } from './config';
import { mountLanding } from './landing';
// Import landing CSS to ensure preloader styles are available
import './landing/landing.css';

let game: Phaser.Game | null = null;

const showGameCanvas = () => {
  const app = document.getElementById('app');

  if (app) {
    app.classList.remove('is-hidden');
  }
};

const startGame = () => {
  if (game) {
    return;
  }

  console.log('[Main] Initializing El Bruto...');
  console.log('[Main] Game Config:', gameConfig);

  // Ensure viewport is reset to the top so auth UI positions correctly
  try {
    window.scrollTo(0, 0);
    // Safari fallback
    (document.documentElement || document.body).scrollTop = 0;
  } catch {}

  showGameCanvas();
  document.body.classList.add('game-active');
  game = new Phaser.Game(gameConfig);

  console.log('[Main] Phaser game initialized successfully');

  if (import.meta.env.DEV) {
    (window as any).game = game;
    console.log('[Main] Game instance exposed as window.game (dev mode)');
  }
};

try {
  mountLanding('landing-root', {
    onStart: startGame,
    onShowTrailer: () => {
      console.log('[Landing] Trailer CTA pressed');
      window.location.hash = 'trailer';
    },
  });
} catch (error) {
  console.error('[Landing] Error mounting landing screen. Booting game directly.', error);
  startGame();
}

export default game;
