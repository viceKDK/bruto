import './auth-styles2.css';
/**
 * LoginScene - User authentication (Epic 2)
 * Enhanced UI with fire effects and atmospheric particles
 */

import Phaser from 'phaser';
import { useStore } from '../../state/store';
import { apiClient } from '../../services/ApiClient';

export class LoginScene extends Phaser.Scene {
  private container: HTMLDivElement | null = null;
  private warriorImage: HTMLDivElement | null = null;
  private brutoLeftImage: HTMLDivElement | null = null;
  private fireGlow: HTMLDivElement | null = null;

  constructor() {
    super({ key: 'LoginScene' });
  }

  create(data?: { startTab?: 'login' | 'register' }): void {
    console.log('[LoginScene] Scene created');

    // Set dark background
    this.cameras.main.setBackgroundColor('#0a0300');

    // Check if already logged in (check for token)
    const token = apiClient.getToken();
    if (token) {
      this.scene.start('BrutoSelectionScene');
      return;
    }

    if (data?.startTab === 'register') {
      this.showRegisterForm();
    } else {
      this.showLoginForm();
    }
  }

  private createFireGlow(): void {
    // Create fire glow effect
    this.fireGlow = document.createElement('div');
    this.fireGlow.className = 'auth-fire-glow';
    document.body.appendChild(this.fireGlow);
  }

  private showLoginForm(): void {
    this.cleanup();
    
    document.body.classList.add('auth-active');
    
    // Add fire glow effect
    this.createFireGlow();

    this.container = document.createElement('div');
    this.container.className = 'auth-container';
    this.container.innerHTML = `
      <div class="auth-card">
        <h1 class="auth-title fire-title">EL BRUTO</h1>
        <h2 class="auth-subtitle">Iniciar Sesión</h2>
        
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <input 
              type="email" 
              id="loginEmail" 
              class="game-input" 
              placeholder="Email" 
              autocomplete="email"
              required 
            />
          </div>
          <div class="form-group">
            <input 
              type="password" 
              id="loginPassword" 
              class="game-input" 
              placeholder="Contraseña" 
              autocomplete="current-password"
              required 
            />
          </div>
          <div id="loginError" class="error-message"></div>
          <button type="submit" class="game-button game-button-primary">
            Entrar al Combate
          </button>
        </form>
        
        <p class="auth-link">
          ¿No tienes cuenta? <a href="#" id="showRegister">Únete a la batalla</a>
        </p>
      </div>
    `;
    document.body.appendChild(this.container);

    // Add warrior image on the right
    this.warriorImage = document.createElement('div');
    this.warriorImage.className = 'warrior-hero';
    this.warriorImage.innerHTML = `<img src="/src/assets/sprites/warrior-hero.png" alt="Guerrero Héroe" />`;
    document.body.appendChild(this.warriorImage);

    // Add bruto image on the left
    this.brutoLeftImage = document.createElement('div');
    this.brutoLeftImage.className = 'bruto-left';
    this.brutoLeftImage.innerHTML = `<img src="/src/assets/sprites/bruto-left.png" alt="Bruto" />`;
    document.body.appendChild(this.brutoLeftImage);

    // Event listeners
    const form = document.getElementById('loginForm') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    const registerLink = document.getElementById('showRegister');
    registerLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterForm();
    });

    // Add entrance animation
    requestAnimationFrame(() => {
      this.container?.classList.add('active');
    });
  }

  private showRegisterForm(): void {
    this.cleanup();
    
    document.body.classList.add('auth-active');
    
    // Add fire glow effect
    this.createFireGlow();

    this.container = document.createElement('div');
    this.container.className = 'auth-container';
    this.container.innerHTML = `
      <div class="auth-card">
        <h1 class="auth-title fire-title">EL BRUTO</h1>
        <h2 class="auth-subtitle">Crear Cuenta</h2>
        
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <input 
              type="text" 
              id="registerName" 
              class="game-input" 
              placeholder="Nombre de Guerrero" 
              autocomplete="name"
              required 
            />
          </div>
          <div class="form-group">
            <input 
              type="email" 
              id="registerEmail" 
              class="game-input" 
              placeholder="Email" 
              autocomplete="email"
              required 
            />
          </div>
          <div class="form-group">
            <input 
              type="password" 
              id="registerPassword" 
              class="game-input" 
              placeholder="Contraseña (mínimo 6 caracteres)" 
              autocomplete="new-password"
              required 
            />
          </div>
          <div id="registerError" class="error-message"></div>
          <button type="submit" class="game-button game-button-success">
            Comenzar Aventura
          </button>
        </form>
        
        <p class="auth-link">
          ¿Ya tienes cuenta? <a href="#" id="showLogin">Inicia sesión</a>
        </p>
      </div>
    `;
    document.body.appendChild(this.container);

    // Add zombie image on the right (for register)
    this.warriorImage = document.createElement('div');
    this.warriorImage.className = 'warrior-hero zombie';
    this.warriorImage.innerHTML = `<img src="/src/assets/sprites/zombie.png" alt="Zombie" />`;
    document.body.appendChild(this.warriorImage);

    // Add chef image on the left (for register)
    this.brutoLeftImage = document.createElement('div');
    this.brutoLeftImage.className = 'bruto-left chef';
    this.brutoLeftImage.innerHTML = `<img src="/src/assets/sprites/chef.png" alt="Chef" />`;
    document.body.appendChild(this.brutoLeftImage);

    // Event listeners
    const form = document.getElementById('registerForm') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    const loginLink = document.getElementById('showLogin');
    loginLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginForm();
    });

    // Add entrance animation
    requestAnimationFrame(() => {
      this.container?.classList.add('active');
    });
  }

  private async handleLogin(): Promise<void> {
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = document.querySelector('.game-button-primary') as HTMLButtonElement;

    if (!errorDiv || !submitBtn) return;
    
    errorDiv.textContent = '';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // Call API
      const { user } = await apiClient.login(email, password);

      // Set user in store
      useStore.getState().setCurrentUser({
        id: user.id,
        username: user.email,
        passwordHash: '', // Not needed from backend
        coins: 0,
        brutoSlots: 3,
        createdAt: new Date(user.createdAt),
      });

      console.log(`[LoginScene] User logged in: ${email}`);

      // Success animation
      const card = document.querySelector('.auth-card');
      card?.classList.add('success');

      // Navigate to Bruto Selection
      setTimeout(() => {
        this.cleanup();
        this.scene.start('BrutoSelectionScene');
      }, 400);
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Error al iniciar sesión';
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  private async handleRegister(): Promise<void> {
    const name = (document.getElementById('registerName') as HTMLInputElement).value.trim();
    const email = (document.getElementById('registerEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('registerPassword') as HTMLInputElement).value;
    const errorDiv = document.getElementById('registerError');
    const submitBtn = document.querySelector('.game-button-success') as HTMLButtonElement;

    if (!errorDiv || !submitBtn) return;
    
    errorDiv.textContent = '';

    // Basic validation
    if (!name || name.length < 2) {
      errorDiv.textContent = 'Por favor ingresa tu nombre de guerrero';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorDiv.textContent = 'Por favor ingresa un email válido';
      return;
    }

    if (password.length < 6) {
      errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // Call API
      const { user } = await apiClient.register(name, email, password);

      // Set user in store
      useStore.getState().setCurrentUser({
        id: user.id,
        username: user.email,
        passwordHash: '', // Not needed from backend
        coins: 0,
        brutoSlots: 3,
        createdAt: new Date(user.createdAt),
      });

      console.log(`[LoginScene] User registered: ${email}`);

      // Success animation
      const card = document.querySelector('.auth-card');
      card?.classList.add('success');

      // Navigate to Bruto Creation
      setTimeout(() => {
        this.cleanup();
        this.scene.start('BrutoCreationScene');
      }, 400);
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Error al crear la cuenta';
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }

  private cleanup(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    if (this.warriorImage) {
      this.warriorImage.remove();
      this.warriorImage = null;
    }
    if (this.brutoLeftImage) {
      this.brutoLeftImage.remove();
      this.brutoLeftImage = null;
    }
    if (this.fireGlow) {
      this.fireGlow.remove();
      this.fireGlow = null;
    }
    document.body.classList.remove('auth-active');
  }

  shutdown(): void {
    this.cleanup();
  }
}
