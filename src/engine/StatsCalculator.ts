import { IBruto, BrutoStats } from '../models/Bruto';
import { Skill } from '../models/Skill';
import { skillEffectEngine } from './skills/SkillEffectEngine';
import { derivedStatsCalculator, IDerivedStatsCalculator, DerivedStatSummary } from './DerivedStatsCalculator';

export type StatSource = 'skill' | 'weapon' | 'pet' | 'progression' | 'equipment' | 'other';

export interface StatContribution {
  key: keyof BrutoStats;
  amount: number;
  source: StatSource;
  description?: string;
}

export interface StatMultiplier {
  key: keyof BrutoStats;
  factor: number; // e.g. 0.5 == +50%
  source: StatSource;
  description?: string;
}

export interface StatsCalculationContext {
  flatModifiers?: StatContribution[];
  multipliers?: StatMultiplier[];
}

export interface StatValueSummary {
  key: keyof BrutoStats;
  label: string;
  base: number;
  effective: number;
  delta: number;
  breakdown: string[];
}

// Re-export DerivedStatSummary for backward compatibility
export type { DerivedStatSummary } from './DerivedStatsCalculator';

export interface StatsSummary {
  level: number;
  primary: StatValueSummary[];
  derived: DerivedStatSummary[];
}

const STAT_LABELS: Record<keyof BrutoStats, string> = {
  hp: 'HP',
  maxHp: 'HP Max',
  str: 'STR',
  speed: 'Speed',
  agility: 'Agility',
  resistance: 'Resistance',
};

export class StatsCalculator {
  constructor(private derivedCalculator: IDerivedStatsCalculator = derivedStatsCalculator) {}

  /**
   * Build summary with skill modifiers applied
   */
  public buildSummaryWithSkills(bruto: IBruto, skills: Skill[]): StatsSummary {
    const skillModifiers = skillEffectEngine.calculateStatModifiers(bruto, skills);
    return this.buildSummary(bruto, skillModifiers);
  }

  public buildSummary(bruto: IBruto, context: StatsCalculationContext = {}): StatsSummary {
    const primary = this.buildPrimaryStats(bruto, context);
    const derived = this.derivedCalculator.buildDerivedStats(bruto);

    return {
      level: bruto.level,
      primary,
      derived,
    };
  }

  private buildPrimaryStats(bruto: IBruto, context: StatsCalculationContext): StatValueSummary[] {
    const statKeys = Object.keys(STAT_LABELS) as (keyof BrutoStats)[];
    const summaries: StatValueSummary[] = [];

    statKeys.forEach((key) => {
      const baseValue = bruto[key];
      let effective = baseValue;
      const breakdown: string[] = [];

      const flatModifiers = context.flatModifiers?.filter((modifier) => modifier.key === key) ?? [];
      const multipliers = context.multipliers?.filter((modifier) => modifier.key === key) ?? [];

      if (flatModifiers.length > 0) {
        flatModifiers.forEach((modifier) => {
          effective += modifier.amount;
          breakdown.push(this.formatFlatModifier(modifier));
        });
      }

      if (multipliers.length > 0) {
        multipliers.forEach((modifier) => {
          const delta = effective * modifier.factor;
          effective += delta;
          breakdown.push(this.formatMultiplier(modifier));
        });
      }

      const delta = effective - baseValue;
      summaries.push({
        key,
        label: STAT_LABELS[key],
        base: this.roundStatValue(key, baseValue),
        effective: this.roundStatValue(key, effective),
        delta: this.roundStatValue(key, delta),
        breakdown,
      });
    });

    return summaries;
  }

  private roundStatValue(key: keyof BrutoStats, value: number): number {
    if (key === 'resistance') {
      return Number(value.toFixed(2));
    }

    const rounded = Number(value.toFixed(2));
    return Math.abs(rounded - Math.round(rounded)) < 0.001 ? Math.round(rounded) : rounded;
  }

  private formatFlatModifier({ amount, source, description }: StatContribution): string {
    const sign = amount >= 0 ? '+' : '-';
    const value = Math.abs(amount);
    const label = description ? `${source} - ${description}` : source;
    return `${sign}${this.formatNumber(value)} (${label})`;
  }

  private formatMultiplier({ factor, source, description }: StatMultiplier): string {
    const percent = factor * 100;
    const sign = percent >= 0 ? '+' : '-';
    const value = Math.abs(percent);
    const label = description ? `${source} - ${description}` : source;
    return `${sign}${this.formatNumber(value)}% (${label})`;
  }

  private formatNumber(value: number): string {
    if (Math.abs(value - Math.round(value)) < 0.001) {
      return Math.round(value).toString();
    }
    return value.toFixed(2).replace(/\.?0+$/, '');
  }
}
