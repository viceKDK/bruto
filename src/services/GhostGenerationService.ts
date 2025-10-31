/**
 * GhostGenerationService - Story 9.3
 * 
 * Generates AI-controlled opponent brutos with realistic builds.
 * Simulates complete level progression from 1 to target level.
 */

import { IGhostBruto, IUpgradeChoice, IUpgradeOption, IStatBoosts } from '../models/Bruto';
import { SeededRandom } from '../utils/SeededRandom';
import { GHOST_NAMES_POOL } from '../data/ghost-names';
import { UpgradeGenerator, UpgradeOption } from '../engine/UpgradeGenerator';

export class GhostGenerationService {
  /**
   * Generate a single ghost bruto at target level
   * 
   * @param targetLevel - Level to generate ghost at (1-∞)
   * @param seed - Optional seed for deterministic generation
   * @returns Fully leveled ghost bruto
   */
  static generateGhost(targetLevel: number, seed?: string): IGhostBruto {
    if (targetLevel < 1) {
      throw new Error('Target level must be >= 1');
    }

    const finalSeed = seed || this.generateSeed();
    const rng = new SeededRandom(finalSeed);
    
    // 1. Create base level 1 ghost
    const ghost = this.createBaseGhost(rng, finalSeed);
    
    // 2. Simulate level progression
    if (targetLevel > 1) {
      this.simulateLevelProgression(ghost, targetLevel, rng);
    }
    
    // 3. Determine build archetype based on choices
    ghost.buildArchetype = this.detectArchetype(ghost.upgradeHistory);
    
    return ghost;
  }

  /**
   * Generate a pool of unique ghosts for matchmaking
   * 
   * @param level - Level of ghosts to generate
   * @param count - Number of ghosts to generate
   * @param userId - User ID for seed uniqueness
   * @returns Array of unique ghost brutos
   */
  static generateGhostPool(
    level: number,
    count: number,
    userId: string
  ): IGhostBruto[] {
    const timestamp = Date.now();
    const ghosts: IGhostBruto[] = [];
    
    for (let i = 0; i < count; i++) {
      const seed = `ghost-${userId}-${level}-${timestamp}-${i}`;
      const ghost = this.generateGhost(level, seed);
      ghosts.push(ghost);
    }
    
    return ghosts;
  }

  /**
   * Create a base level 1 ghost with random appearance and name
   */
  private static createBaseGhost(
    rng: SeededRandom,
    generationSeed: string
  ): IGhostBruto {
    return {
      id: `ghost-${this.generateRandomId(rng)}`,
      userId: 'ghost',
      name: this.generateName(rng),
      level: 1,
      xp: 0,
      
      // Base stats (same as real brutos)
      hp: 60,
      maxHp: 60,
      str: 2,
      speed: 2,
      agility: 2,
      resistance: 0,
      
      // Random appearance
      appearanceId: rng.nextInt(0, 9), // 10 designs (0-9)
      colorVariant: rng.nextInt(0, 7), // 8 colors (0-7)
      
      // Meta
      createdAt: new Date(),
      
      // Ghost-specific
      isGhost: true,
      generationSeed,
      buildArchetype: 'balanced', // Will be detected after progression
      upgradeHistory: [],
    };
  }

  /**
   * Simulate level progression from current level to target level
   * Applies random upgrades at each level using existing game logic
   */
  private static simulateLevelProgression(
    ghost: IGhostBruto,
    targetLevel: number,
    rng: SeededRandom
  ): void {
    for (let level = 2; level <= targetLevel; level++) {
      // Generate upgrade options using real game logic
      const options = UpgradeGenerator.generateOptions(ghost, level);
      
      // Randomly choose A or B
      const choice = rng.roll(0.5) ? 'A' : 'B';
      const selectedOption = choice === 'A' ? options[0] : options[1];
      
      // Convert UpgradeOption to IUpgradeOption
      const optionA = this.convertUpgradeOption(options[0]);
      const optionB = this.convertUpgradeOption(options[1]);
      
      // Apply stat boosts directly (no database)
      const boosts = this.applyStatBoostsToGhost(ghost, selectedOption);
      
      // Record the decision
      const upgradeChoice: IUpgradeChoice = {
        level,
        choiceSelected: choice,
        optionA,
        optionB,
        statBoostsApplied: boosts,
      };
      
      ghost.upgradeHistory.push(upgradeChoice);
      
      // Level up
      ghost.level = level;
      
      // Award XP (not critical for ghosts but keeps consistency)
      ghost.xp = this.calculateXPForLevel(level);
    }
  }

  /**
   * Apply stat boosts directly to ghost (in-memory, no database)
   */
  private static applyStatBoostsToGhost(
    ghost: IGhostBruto,
    option: UpgradeOption
  ): IStatBoosts {
    const boosts: IStatBoosts = {};
    
    // Apply boosts if stats present
    if (!option.stats) return boosts;
    
    if (option.stats.hp) {
      ghost.hp += option.stats.hp;
      ghost.maxHp += option.stats.hp;
      boosts.hp = option.stats.hp;
    }
    if (option.stats.str) {
      ghost.str += option.stats.str;
      boosts.str = option.stats.str;
    }
    if (option.stats.speed) {
      ghost.speed += option.stats.speed;
      boosts.speed = option.stats.speed;
    }
    if (option.stats.agility) {
      ghost.agility += option.stats.agility;
      boosts.agility = option.stats.agility;
    }
    
    return boosts;
  }

  /**
   * Convert UpgradeOption to IUpgradeOption
   */
  private static convertUpgradeOption(option: UpgradeOption): IUpgradeOption {
    const statBoosts: IStatBoosts = {};
    
    if (option.stats) {
      if (option.stats.hp) statBoosts.hp = option.stats.hp;
      if (option.stats.str) statBoosts.str = option.stats.str;
      if (option.stats.speed) statBoosts.speed = option.stats.speed;
      if (option.stats.agility) statBoosts.agility = option.stats.agility;
    }
    
    return {
      type: option.type,
      description: option.description,
      statBoosts,
    };
  }

  /**
   * Analyze upgrade history to determine build archetype
   */
  private static detectArchetype(
    history: IUpgradeChoice[]
  ): 'tank' | 'agile' | 'balanced' | 'hybrid' {
    if (history.length === 0) {
      return 'balanced';
    }

    // Count total boosts per stat category
    const counts = {
      hp: 0,
      str: 0,
      speed: 0,
      agility: 0,
    };
    
    history.forEach(choice => {
      const boosts = choice.statBoostsApplied;
      if (boosts.hp) counts.hp++;
      if (boosts.str) counts.str++;
      if (boosts.speed) counts.speed++;
      if (boosts.agility) counts.agility++;
    });
    
    const total = history.length;
    
    // Calculate percentages for tank and agile builds
    const tankBoosts = counts.hp + counts.str;
    const agileBoosts = counts.speed + counts.agility;
    const maxPossibleBoosts = total * 2; // Each level can boost 2 stats max
    
    const tankPercent = tankBoosts / maxPossibleBoosts;
    const agilePercent = agileBoosts / maxPossibleBoosts;
    
    // Classification thresholds
    if (tankPercent > 0.6) return 'tank';
    if (agilePercent > 0.6) return 'agile';
    if (Math.abs(tankPercent - agilePercent) < 0.15) return 'balanced';
    return 'hybrid';
  }

  /**
   * Select a random name from the pool
   */
  private static generateName(rng: SeededRandom): string {
    const index = rng.nextInt(0, GHOST_NAMES_POOL.length - 1);
    return GHOST_NAMES_POOL[index];
  }

  /**
   * Generate a random ID for ghost
   */
  private static generateRandomId(rng: SeededRandom): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
      id += chars[rng.nextInt(0, chars.length - 1)];
    }
    return id;
  }

  /**
   * Generate a unique seed for ghost generation
   */
  private static generateSeed(): string {
    return `ghost-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Calculate XP for a given level (matches progression formulas)
   */
  private static calculateXPForLevel(level: number): number {
    // Simple XP formula: each level needs 100 * level XP
    let totalXP = 0;
    for (let l = 2; l <= level; l++) {
      totalXP += 100 * (l - 1);
    }
    return totalXP;
  }
}
