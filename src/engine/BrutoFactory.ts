/**
 * BrutoFactory - Creator pattern implementation for building new brutos.
 * Handles stat initialization, appearance assignment, and metadata.
 */

import { IBruto } from '../models/Bruto';
import { AppearanceGenerator, AppearanceOption } from './AppearanceGenerator';
import { ProgressionService } from './progression/ProgressionService';

export interface BrutoFactoryConfig {
  baseHp?: number;
  baseStr?: number;
  baseSpeed?: number;
  baseAgility?: number;
  baseResistance?: number;
}

export class BrutoFactory {
  private readonly appearanceGenerator: AppearanceGenerator;
  private readonly config: Required<BrutoFactoryConfig>;
  private readonly progressionService?: ProgressionService;

  constructor(
    appearanceGenerator: AppearanceGenerator,
    config: BrutoFactoryConfig = {},
    progressionService?: ProgressionService
  ) {
    this.appearanceGenerator = appearanceGenerator;
    this.config = {
      baseHp: config.baseHp ?? 60,
      baseStr: config.baseStr ?? 2,
      baseSpeed: config.baseSpeed ?? 2,
      baseAgility: config.baseAgility ?? 2,
      baseResistance: config.baseResistance ?? 1.67,
    };
    this.progressionService = progressionService;
  }

  public createNewBruto(
    userId: string,
    name: string,
    appearanceOverride?: AppearanceOption
  ): IBruto {
    const appearance = appearanceOverride ?? this.appearanceGenerator.randomAppearance();
    const now = new Date();

    const bruto: IBruto = {
      id: this.generateId(),
      userId,
      name,
      level: 1,
      xp: 0,
      hp: this.config.baseHp,
      maxHp: this.config.baseHp,
      str: this.config.baseStr,
      speed: this.config.baseSpeed,
      agility: this.config.baseAgility,
      resistance: this.config.baseResistance,
      appearanceId: appearance.designId,
      colorVariant: appearance.colorVariant,
      createdAt: now,
      lastBattle: undefined,
      skills: [],
    };

    this.triggerInitialLevelUp(bruto);
    return bruto;
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `bruto_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private triggerInitialLevelUp(bruto: IBruto): void {
    if (this.progressionService) {
      this.progressionService.scheduleInitialLevelUp(bruto);
    }
  }
}
