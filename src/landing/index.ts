import landingTemplate from './landing.html?raw';
import './landing.css';
import { apiClient } from '../services/ApiClient';
import { useStore } from '../state/store';

type LandingOptions = {
  onStart: () => void;
  onShowTrailer?: () => void;
};

type CleanupFn = () => void;

export interface LandingHandle {
  destroy: () => void;
}

const CHARACTER_IMAGES = [
  {
    src: new URL('../assets/sprites/bruto-left.png', import.meta.url).href,
    position: 'left',
  },
  {
    src: new URL('../assets/sprites/warrior-hero.png', import.meta.url).href,
    position: 'right',
  },
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
    document.body.classList.add('game-active');
    root.innerHTML = '';
  };

  document.body.classList.remove('game-active');
  document.body.classList.add('landing-active');

  // Logout when showing landing (temporary behavior requested)
  try {
    apiClient.logout();
    useStore.getState().logout();
  } catch {}

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
  const scrollIndicator = root.querySelector<HTMLElement>('[data-landing-scroll]');

  window.setTimeout(() => {
    preloader?.classList.add('is-hidden');
  }, 1200);

  if (charactersContainer) {
    CHARACTER_IMAGES.forEach(({ src, position }, index) => {
      const tile = document.createElement('div');
      tile.className = `landing-character-tile landing-character-tile--${position}`;

      const image = new Image();
      image.src = src;
      image.alt = `Personaje ${index + 1}`;
      image.loading = 'lazy';

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

  // Scroll indicator: desplazar hacia abajo y luego iniciar cuando se alcanza el final del hero
  if (scrollIndicator) {
    const handleScrollIndicator = (event: MouseEvent) => {
      event.preventDefault();
      const heroEl = heroSection;
      if (!heroEl) return startGame();
      const rect = heroEl.getBoundingClientRect();
      const heroTop = rect.top + window.scrollY;
      const heroHeight = heroEl.offsetHeight || window.innerHeight;
      // Scroll hasta casi el final del hero, el handler de scroll se encargará de disparar
      const target = Math.max(0, heroTop + heroHeight - window.innerHeight + 40);
      window.scrollTo({ top: target, behavior: 'smooth' });
    };
    scrollIndicator.addEventListener('click', handleScrollIndicator);
    cleanupFns.push(() => scrollIndicator.removeEventListener('click', handleScrollIndicator));
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
  let startTriggered = false;
  const heroSection = root.querySelector<HTMLElement>('.landing-hero');
  let wheelDownAccum = 0; // acumula desplazamiento hacia abajo con rueda
  let touchDownAccum = 0; // acumula desplazamiento hacia abajo con touch
  let lastTouchY = 0;

  const checkScrollProgress = () => {
    if (startTriggered) return;

    const heroEl = heroSection;
    if (!heroEl) return;

    const heroRect = heroEl.getBoundingClientRect();
    const heroTop = heroRect.top + window.scrollY;
    const heroHeight = heroEl.offsetHeight || window.innerHeight;

    const viewportBottom = window.scrollY + window.innerHeight;
    const nearHeroBottom = viewportBottom >= heroTop + heroHeight - 50; // ~bottom of hero
    const scrolledEnough = window.scrollY >= Math.max(400, heroHeight * 0.3); // avoid instant trigger

    if (nearHeroBottom && scrolledEnough) {
      startTriggered = true;
      startGame();
    }
  };

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

    // Trigger start only when near the bottom of the hero
    checkScrollProgress();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  cleanupFns.push(() => window.removeEventListener('scroll', handleScroll));

  // Also listen to wheel/touch and check progress (no immediate trigger)
  const handleWheel = (e: WheelEvent) => {
    // Acumular desplazamiento hacia abajo incluso si la página no puede scrollear más
    if (e.deltaY > 0 && !startTriggered) {
      wheelDownAccum += e.deltaY;
      if (wheelDownAccum >= 500) {
        startTriggered = true;
        startGame();
        return;
      }
    }
    checkScrollProgress();
  };
  window.addEventListener('wheel', handleWheel, { passive: true });
  cleanupFns.push(() => window.removeEventListener('wheel', handleWheel));

  const onTouchStart = (e: TouchEvent) => {
    lastTouchY = e.touches[0]?.clientY ?? 0;
  };
  const onTouchMove = (e: TouchEvent) => {
    const y = e.touches[0]?.clientY ?? lastTouchY;
    const dy = lastTouchY - y; // positivo cuando se desplaza hacia arriba (contenido baja)
    if (dy > 0 && !startTriggered) {
      touchDownAccum += dy;
      if (touchDownAccum >= 150) {
        startTriggered = true;
        startGame();
        return;
      }
    }
    lastTouchY = y;
    checkScrollProgress();
  };
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  cleanupFns.push(() => window.removeEventListener('touchstart', onTouchStart));
  cleanupFns.push(() => window.removeEventListener('touchmove', onTouchMove));

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
