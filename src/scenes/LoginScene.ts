/**
 * LoginScene - User authentication (Epic 2)
 * Modern UI with HTML overlay - API version
 */

import Phaser from 'phaser';
import { useStore } from '../state/store';
import { apiClient } from '../services/ApiClient';

export class LoginScene extends Phaser.Scene {
  private container: HTMLDivElement | null = null;
  private warriorImage: HTMLDivElement | null = null;
  private brutoLeftImage: HTMLDivElement | null = null;

  constructor() {
    super({ key: 'LoginScene' });
  }

  create(): void {
    console.log('[LoginScene] Scene created');

    // Set light background
    this.cameras.main.setBackgroundColor('#f5f5f5');

    // Check if already logged in (check for token)
    const token = apiClient.getToken();
    if (token) {
      this.scene.start('BrutoSelectionScene');
      return;
    }

    this.showLoginForm();
  }

  private showLoginForm(): void {
    if (this.container) {
      this.container.remove();
    }
    if (this.warriorImage) {
      this.warriorImage.remove();
    }
    if (this.brutoLeftImage) {
      this.brutoLeftImage.remove();
    }

    document.body.classList.add('auth-active');

    this.container = document.createElement('div');
    this.container.className = 'auth-container';
    this.container.innerHTML = `
      <div class="auth-card">
        <h1 class="auth-title">EL BRUTO</h1>
        <h2 class="auth-subtitle">Iniciar Sesión</h2>
        
        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <input type="email" id="loginEmail" class="game-input" placeholder="Email" required />
          </div>
          <div class="form-group">
            <input type="password" id="loginPassword" class="game-input" placeholder="Contraseña" required />
          </div>
          <div id="loginError" class="error-message"></div>
          <button type="submit" class="game-button game-button-primary">Entrar</button>
        </form>
        
        <p class="auth-link">
          ¿No tienes cuenta? <a href="#" id="showRegister">Regístrate</a>
        </p>
      </div>
    `;
    document.body.appendChild(this.container);

    // Agregar imagen del guerrero a la derecha
    this.warriorImage = document.createElement('div');
    this.warriorImage.className = 'warrior-hero';
    this.warriorImage.innerHTML = `<img src="/src/assets/sprites/warrior-hero.png" alt="Guerrero Héroe" />`;
    document.body.appendChild(this.warriorImage);

    // Agregar imagen del bruto a la izquierda
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
  }

  private showRegisterForm(): void {
    if (this.container) {
      this.container.remove();
    }
    if (this.warriorImage) {
      this.warriorImage.remove();
    }
    if (this.brutoLeftImage) {
      this.brutoLeftImage.remove();
    }

    document.body.classList.add('auth-active');

    this.container = document.createElement('div');
    this.container.className = 'auth-container';
    this.container.innerHTML = `
      <div class="auth-card">
        <h1 class="auth-title">EL BRUTO</h1>
        <h2 class="auth-subtitle">Crear Cuenta</h2>
        
        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <input type="text" id="registerName" class="game-input" placeholder="Nombre" required />
          </div>
          <div class="form-group">
            <input type="email" id="registerEmail" class="game-input" placeholder="Email" required />
          </div>
          <div class="form-group">
            <input type="password" id="registerPassword" class="game-input" placeholder="Contraseña (mínimo 6 caracteres)" required />
          </div>
          <div id="registerError" class="error-message"></div>
          <button type="submit" class="game-button game-button-success">Crear Cuenta</button>
        </form>
        
        <p class="auth-link">
          ¿Ya tienes cuenta? <a href="#" id="showLogin">Inicia sesión</a>
        </p>
      </div>
    `;
    document.body.appendChild(this.container);

    // Agregar imagen del guerrero a la derecha
    this.warriorImage = document.createElement('div');
    this.warriorImage.className = 'warrior-hero zombie';
    this.warriorImage.innerHTML = `<img src="/src/assets/sprites/zombie.png" alt="zombie" />`;
    document.body.appendChild(this.warriorImage);

    // Agregar imagen de la mujer guerrera a la izquierda (solo en registro)
    this.brutoLeftImage = document.createElement('div');
    this.brutoLeftImage.className = 'bruto-left chef';
    this.brutoLeftImage.innerHTML = `<img src="/src/assets/sprites/chef.png" alt="Cheft" />`;
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
  }

  private async handleLogin(): Promise<void> {
    const email = (document.getElementById('loginEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('loginPassword') as HTMLInputElement).value;
    const errorDiv = document.getElementById('loginError');

    if (!errorDiv) return;
    errorDiv.textContent = '';

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

      // Navigate to Bruto Selection
      this.cleanup();
      this.scene.start('BrutoSelectionScene');
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Error al iniciar sesión';
    }
  }

  private async handleRegister(): Promise<void> {
    const name = (document.getElementById('registerName') as HTMLInputElement).value.trim();
    const email = (document.getElementById('registerEmail') as HTMLInputElement).value.trim();
    const password = (document.getElementById('registerPassword') as HTMLInputElement).value;
    const errorDiv = document.getElementById('registerError');

    if (!errorDiv) return;
    errorDiv.textContent = '';

    // Basic validation
    if (!name || name.length < 2) {
      errorDiv.textContent = 'Por favor ingresa tu nombre';
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

      // Navigate to Bruto Creation
      this.cleanup();
      this.scene.start('BrutoCreationScene');
    } catch (error) {
      errorDiv.textContent = error instanceof Error ? error.message : 'Error al crear la cuenta';
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
    document.body.classList.remove('auth-active');
  }

  shutdown(): void {
    this.cleanup();
  }
}











