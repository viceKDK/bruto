import { describe, expect, it } from 'vitest';
import { StatsCalculator, StatsCalculationContext } from './StatsCalculator';
import { IBruto } from '../models/Bruto';

const createBruto = (overrides: Partial<IBruto> = {}): IBruto => ({
  id: 'bruto-1',
  userId: 'user-1',
  name: 'Thor',
  level: 12,
  xp: 120,
  hp: 120,
  maxHp: 120,
  str: 8,
  speed: 6,
  agility: 5,
  resistance: 2.1,
  appearanceId: 1,
  colorVariant: 0,
  createdAt: new Date(),
  lastBattle: new Date(),
  skills: [],
  ...overrides,
});

describe('StatsCalculator', () => {
  it('returns base stats when no modifiers are provided', () => {
    const bruto = createBruto();
    const calculator = new StatsCalculator();

    const summary = calculator.buildSummary(bruto);
    const strStat = summary.primary.find((entry) => entry.key === 'str');
    const hpStat = summary.primary.find((entry) => entry.key === 'hp');

    expect(strStat).toBeDefined();
    expect(strStat?.base).toBe(8);
    expect(strStat?.effective).toBe(8);
    expect(strStat?.delta).toBe(0);
    expect(strStat?.breakdown).toHaveLength(0);

    expect(hpStat).toBeDefined();
    expect(hpStat?.base).toBe(120);
    expect(hpStat?.effective).toBe(120);
  });

  it('applies flat and multiplier modifiers with descriptive breakdown', () => {
    const bruto = createBruto();
    const calculator = new StatsCalculator();
    const context: StatsCalculationContext = {
      flatModifiers: [
        {
          key: 'hp',
          amount: 18,
          source: 'progression',
          description: 'Vitality level-up',
        },
        {
          key: 'str',
          amount: 3,
          source: 'skill',
          description: 'Herculean Strength bonus',
        },
      ],
      multipliers: [
        {
          key: 'speed',
          factor: 0.5,
          source: 'skill',
          description: 'Lightning Strike',
        },
      ],
    };

    const summary = calculator.buildSummary(bruto, context);

    const hpStat = summary.primary.find((entry) => entry.key === 'hp');
    expect(hpStat?.effective).toBe(138);
    expect(hpStat?.delta).toBe(18);
    expect(hpStat?.breakdown).toContain('+18 (progression - Vitality level-up)');

    const strStat = summary.primary.find((entry) => entry.key === 'str');
    expect(strStat?.effective).toBe(11);
    expect(strStat?.delta).toBe(3);
    expect(strStat?.breakdown).toContain('+3 (skill - Herculean Strength bonus)');

    const speedStat = summary.primary.find((entry) => entry.key === 'speed');
    expect(speedStat?.effective).toBe(9);
    expect(speedStat?.delta).toBe(3);
    expect(speedStat?.breakdown).toContain('+50% (skill - Lightning Strike)');
  });

  it('computes derived stats for dodge and extra turn chance', () => {
    const bruto = createBruto({
      agility: 4,
      speed: 7,
    });
    const calculator = new StatsCalculator();

    const summary = calculator.buildSummary(bruto);
    const dodge = summary.derived.find((entry) => entry.key === 'dodgeChance');
    const extraTurn = summary.derived.find((entry) => entry.key === 'extraTurnChance');

    expect(dodge?.value).toBeCloseTo(40);
    expect(extraTurn?.value).toBeCloseTo(35);
    expect(dodge?.description).toContain('Agility × 0.1');
  });
});
