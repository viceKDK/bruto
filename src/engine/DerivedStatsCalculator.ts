/**
 * DerivedStatsCalculator
 * Calculates derived combat statistics from base stats
 * 
 * Extracted from StatsCalculator to follow SRP (Single Responsibility Principle).
 * Focuses exclusively on derived stats (dodge, extra turn, crit) computation.
 */

import { IBruto } from '../models/Bruto';
import { CombatModifiers } from './skills/SkillEffectEngine';

export interface DerivedStatSummary {
  key: 'dodgeChance' | 'extraTurnChance';
  label: string;
  value: number;
  unit: '%';
  description: string;
}

/**
 * Interface for DerivedStatsCalculator
 * Enables Dependency Inversion and easier testing
 */
export interface IDerivedStatsCalculator {
  /**
   * Calculate dodge chance percentage from agility
   * Formula: agility × 10%, capped at 95%
   */
  calculateDodgeChance(agility: number): number;

  /**
   * Calculate extra turn chance percentage from speed
   * Formula: speed × 5%, capped at 60%
   */
  calculateExtraTurnChance(speed: number): number;

  /**
   * Build summary of all derived stats for UI display
   */
  buildDerivedStats(bruto: IBruto): DerivedStatSummary[];
}

export class DerivedStatsCalculator implements IDerivedStatsCalculator {
  private static instance: DerivedStatsCalculator;

  // Singleton pattern for consistency with other calculators
  public static getInstance(): DerivedStatsCalculator {
    if (!DerivedStatsCalculator.instance) {
      DerivedStatsCalculator.instance = new DerivedStatsCalculator();
    }
    return DerivedStatsCalculator.instance;
  }

  /**
   * Calculate dodge chance from agility
   * @param agility - Bruto agility stat
   * @returns Dodge chance as percentage (0-95)
   */
  public calculateDodgeChance(agility: number): number {
    const rawChance = agility * 0.1; // 10% per agility point
    const cappedChance = Math.min(0.95, rawChance); // Cap at 95%
    return Number((cappedChance * 100).toFixed(1));
  }

  /**
   * Calculate extra turn chance from speed
   * @param speed - Bruto speed stat
   * @returns Extra turn chance as percentage (0-60)
   */
  public calculateExtraTurnChance(speed: number): number {
    const rawChance = speed * 0.05; // 5% per speed point
    const cappedChance = Math.min(0.6, rawChance); // Cap at 60%
    return Number((cappedChance * 100).toFixed(1));
  }

  /**
   * Build all derived stats for display
   * @param bruto - Bruto with base stats
   * @returns Array of derived stat summaries
   */
  public buildDerivedStats(bruto: IBruto): DerivedStatSummary[] {
    return [
      {
        key: 'dodgeChance',
        label: 'Dodge Chance',
        value: this.calculateDodgeChance(bruto.agility),
        unit: '%',
        description: 'Computed as Agility × 0.1 per architecture guidelines.',
      },
      {
        key: 'extraTurnChance',
        label: 'Extra Turn Chance',
        value: this.calculateExtraTurnChance(bruto.speed),
        unit: '%',
        description:
          'Approximation based on Speed × 0.05. Capped at 60% until combat engine defines exact curve.',
      },
    ];
  }
}

// Export singleton instance
export const derivedStatsCalculator = DerivedStatsCalculator.getInstance();
