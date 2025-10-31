/**
 * Global State Store - Zustand
 * Manages user session, selected bruto, UI settings
 */

import { create } from 'zustand';
import { IUser } from '../models/User';
import { IBruto } from '../models/Bruto';

export interface AppState {
  // User session
  currentUser: IUser | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: IUser | null) => void;
  updateUserCoins: (coins: number) => void;
  logout: () => void;

  // Selected bruto
  selectedBruto: IBruto | null;
  setSelectedBruto: (bruto: IBruto | null) => void;

  // Daily fights tracking
  dailyFights: {
    fightCount: number;
    maxFights: number;
    remaining: number;
    resetInSeconds: number;
  };
  setDailyFights: (data: {
    fightCount: number;
    maxFights: number;
    remaining: number;
    resetInSeconds: number;
  }) => void;
  clearDailyFights: () => void;

  // Pending level-ups
  pendingLevelUps: string[];
  queueLevelUp: (brutoId: string) => void;
  clearLevelUp: (brutoId: string) => void;

  // UI settings
  audioEnabled: boolean;
  volume: number;
  settingsOpen: boolean;
  toggleAudio: () => void;
  setVolume: (volume: number) => void;
  toggleSettings: () => void;

  // Navigation history
  navigationHistory: string[];
  pushNavigation: (sceneName: string) => void;
  popNavigation: () => string | undefined;
  clearNavigation: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // User session
  currentUser: null,
  isAuthenticated: false,

  setCurrentUser: (user) =>
    set({
      currentUser: user,
      isAuthenticated: user !== null,
    }),

  updateUserCoins: (coins) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, coins }
        : null,
    })),

  logout: () =>
    set({
      currentUser: null,
      isAuthenticated: false,
      selectedBruto: null,
      dailyFights: {
        fightCount: 0,
        maxFights: 6,
        remaining: 6,
        resetInSeconds: 0,
      },
      pendingLevelUps: [],
    }),

  // Selected bruto
  selectedBruto: null,

  setSelectedBruto: (bruto) =>
    set({
      selectedBruto: bruto,
    }),

  // Daily fights tracking
  dailyFights: {
    fightCount: 0,
    maxFights: 6,
    remaining: 6,
    resetInSeconds: 0,
  },

  setDailyFights: (data) =>
    set({
      dailyFights: {
        fightCount: data.fightCount,
        maxFights: data.maxFights,
        remaining: data.remaining,
        resetInSeconds: data.resetInSeconds,
      },
    }),

  clearDailyFights: () =>
    set({
      dailyFights: {
        fightCount: 0,
        maxFights: 6,
        remaining: 6,
        resetInSeconds: 0,
      },
    }),

  // Pending level-ups
  pendingLevelUps: [],

  queueLevelUp: (brutoId) =>
    set((state) => ({
      pendingLevelUps: state.pendingLevelUps.includes(brutoId)
        ? state.pendingLevelUps
        : [...state.pendingLevelUps, brutoId],
    })),

  clearLevelUp: (brutoId) =>
    set((state) => ({
      pendingLevelUps: state.pendingLevelUps.filter((id) => id !== brutoId),
    })),

  // UI settings
  audioEnabled: true,
  volume: 0.7,
  settingsOpen: false,

  toggleAudio: () =>
    set((state) => ({
      audioEnabled: !state.audioEnabled,
    })),

  setVolume: (volume) =>
    set({
      volume: Math.max(0, Math.min(1, volume)),
    }),

  toggleSettings: () =>
    set((state) => ({
      settingsOpen: !state.settingsOpen,
    })),

  // Navigation history
  navigationHistory: [],

  pushNavigation: (sceneName) =>
    set((state) => ({
      navigationHistory: [...state.navigationHistory, sceneName],
    })),

  popNavigation: () => {
    const history = get().navigationHistory;
    if (history.length === 0) return undefined;

    const previous = history[history.length - 1];
    set({
      navigationHistory: history.slice(0, -1),
    });
    return previous;
  },

  clearNavigation: () =>
    set({
      navigationHistory: [],
    }),
}));
