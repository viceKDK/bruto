import landingTemplate from './landing.html?raw';
import './landing.css';

type LandingOptions = {
  onStart: () => void;
  onShowTrailer?: () => void;
};

type CleanupFn = () => void;

export interface LandingHandle {
  destroy: () => void;
}

const CHARACTER_IMAGES = [
  new URL('../assets/sprites/warrior-hero.png', import.meta.url).href,
  new URL('../assets/sprites/warrior-woman.webp', import.meta.url).href,
  new URL('../assets/sprites/bruto-left.png', import.meta.url).href,
  new URL('../assets/sprites/20251031_0113_Guerrero Sin Fondo_remix_01k8w7eyqae73abe4p2f1d0kt4.png', import.meta.url).href,
  new URL('../assets/sprites/20251031_0115_Guerrero con Calavera_remix_01k8w7j7dtej5vyrd59nvp8hjc.png', import.meta.url).href,
];

const EMBER_COUNT = 80;
const PARTICLE_COUNT = 50;

export function mountLanding(rootId: string, options: LandingOptions): LandingHandle {
  const root = document.getElementById(rootId);

  if (!root) {
    throw new Error(`[landing] Unable to find element with id "${rootId}"`);
  }

  const cleanupFns: CleanupFn[] = [];
  let destroyed = false;

  const cleanup = () => {
    if (destroyed) {
      return;
    }
    destroyed = true;
    cleanupFns.forEach((fn) => fn());
    document.body.classList.remove('landing-active', 'landing-konami');
    root.innerHTML = '';
  };

  document.body.classList.add('landing-active');
  root.innerHTML = landingTemplate;

  const screen = root.querySelector<HTMLElement>('[data-landing-screen]');
  const preloader = root.querySelector<HTMLElement>('[data-landing-preloader]');
  const charactersContainer = root.querySelector<HTMLElement>('[data-landing-characters]');
  const particlesContainer = root.querySelector<HTMLElement>('[data-landing-particles]');
  const heroContent = root.querySelector<HTMLElement>('.landing-hero__content');
  const fireOverlay = root.querySelector<HTMLElement>('.landing-hero__fire');
  const glowElement = root.querySelector<HTMLElement>('.glow-bottom');
  const characterGrid = root.querySelector<HTMLElement>('.landing-hero__characters');
  const playButton = root.querySelector<HTMLButtonElement>('[data-action="play"]');
  const trailerButton = root.querySelector<HTMLButtonElement>('[data-action="trailer"]');
  const logo = root.querySelector<HTMLElement>('[data-landing-logo]');

  window.setTimeout(() => {
    preloader?.classList.add('is-hidden');
  }, 1200);

  if (charactersContainer) {
    const tiles = CHARACTER_IMAGES.slice(0, 4);

    tiles.forEach((src, index) => {
      const tile = document.createElement('div');
      tile.className = 'landing-character-tile';

      const image = new Image();
      image.src = src;
      image.alt = `Personaje ${index + 1}`;

      tile.appendChild(image);
      charactersContainer.appendChild(tile);
    });
  }

  if (particlesContainer) {
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const particle = document.createElement('div');
      particle.className = 'landing-particle particle-ember';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = `${-(Math.random() * 10 + 5)}px`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${Math.random() * 4 + 6}s`;
      particlesContainer.appendChild(particle);
    }

    for (let i = 0; i < EMBER_COUNT; i += 1) {
      const ember = document.createElement('div');
      ember.className = 'landing-ember ember';
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.bottom = `${-(Math.random() * 20 + 10)}px`;
      ember.style.animationDelay = `${Math.random() * 10}s`;
      ember.style.animationDuration = `${Math.random() * 6 + 8}s`;
      particlesContainer.appendChild(ember);
    }
  }

  const registerRipple = (button: HTMLButtonElement | null) => {
    if (!button) {
      return;
    }

    const handleRipple = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.className = 'landing-ripple';
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        animation: rippleEffect 0.6s ease-out;
      `;

      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    };

    button.addEventListener('click', handleRipple);
    cleanupFns.push(() => button.removeEventListener('click', handleRipple));
  };

  registerRipple(playButton ?? null);
  registerRipple(trailerButton ?? null);

  const rippleStyleId = 'landing-ripple-style';
  let rippleStyleElement = document.getElementById(rippleStyleId) as HTMLStyleElement | null;

  if (!rippleStyleElement) {
    rippleStyleElement = document.createElement('style');
    rippleStyleElement.id = rippleStyleId;
    rippleStyleElement.textContent = `
      @keyframes rippleEffect {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(rippleStyleElement);
    const styleEl = rippleStyleElement;
    cleanupFns.push(() => styleEl.remove());
  }

  const startGame = () => {
    if (!screen) {
      cleanup();
      options.onStart();
      return;
    }

    screen.classList.add('landing-screen--leaving');
    window.setTimeout(() => {
      cleanup();
      options.onStart();
    }, 450);
  };

  if (playButton) {
    const handleStart = (event: MouseEvent) => {
      event.preventDefault();
      startGame();
    };
    playButton.addEventListener('click', handleStart);
    cleanupFns.push(() => playButton.removeEventListener('click', handleStart));
  }

  if (trailerButton) {
    const handleTrailer = (event: MouseEvent) => {
      event.preventDefault();
      if (options.onShowTrailer) {
        options.onShowTrailer();
      } else {
        window.location.hash = 'trailer';
      }
    };
    trailerButton.addEventListener('click', handleTrailer);
    cleanupFns.push(() => trailerButton.removeEventListener('click', handleTrailer));
  }

  if (logo) {
    const handleDoubleClick = () => {
      logo.classList.add('landing-logo--shake');
      window.setTimeout(() => logo.classList.remove('landing-logo--shake'), 600);
    };
    logo.addEventListener('dblclick', handleDoubleClick);
    cleanupFns.push(() => logo.removeEventListener('dblclick', handleDoubleClick));
  }

  let lastScroll = 0;
  let ticking = false;

  const handleScroll = () => {
    lastScroll = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const clamped = Math.min(lastScroll, 600);

        if (fireOverlay) {
          fireOverlay.style.transform = `translateY(${clamped * 0.25}px)`;
        }

        if (glowElement) {
          glowElement.style.transform = `translateY(${clamped * 0.5}px)`;
        }

        if (heroContent) {
          heroContent.style.opacity = `${Math.max(1 - clamped / 420, 0.15)}`;
          heroContent.style.transform = `translateY(${clamped * 0.35}px)`;
        }

        if (characterGrid) {
          characterGrid.style.transform = `translateY(${clamped * 0.18}px)`;
        }

        ticking = false;
      });

      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  cleanupFns.push(() => window.removeEventListener('scroll', handleScroll));

  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiBuffer: string[] = [];

  const handleKeydown = (event: KeyboardEvent) => {
    konamiBuffer.push(event.key);
    konamiBuffer = konamiBuffer.slice(-konamiSequence.length);

    if (konamiBuffer.join(',') === konamiSequence.join(',')) {
      document.body.classList.add('landing-konami');
      window.setTimeout(() => document.body.classList.remove('landing-konami'), 5000);
    }
  };

  document.addEventListener('keydown', handleKeydown);
  cleanupFns.push(() => document.removeEventListener('keydown', handleKeydown));

  return {
    destroy: cleanup,
  };
}
