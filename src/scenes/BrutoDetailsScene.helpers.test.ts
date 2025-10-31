import { describe, expect, it } from 'vitest';
import {
  formatWeaponName,
  formatSkillName,
  formatTimestamp,
  generateStubBattleLogEntries,
  mapAugmenterSkills,
  mapPetRecords,
} from './BrutoDetailsScene.helpers';
import type { BrutoPetWithCost } from '../database/repositories/BrutoPetRepository';

describe('BrutoDetailsScene helpers', () => {
  it('formats weapon names by replacing separators and capitalizing words', () => {
    expect(formatWeaponName('martillo_pesado')).toBe('Martillo Pesado');
    expect(formatWeaponName('lanza-larga')).toBe('Lanza Larga');
  });

  it('formats skill names and falls back for empty inputs', () => {
    expect(formatSkillName('frenzy_strike')).toBe('Frenzy Strike');
    expect(formatSkillName('')).toBe('Habilidad desconocida');
  });

  it('formats timestamps using 24-hour notation', () => {
    const sample = new Date(Date.UTC(2025, 0, 2, 3, 4));
    expect(formatTimestamp(sample)).toBe('2025-01-02 03:04');
  });

  it('creates eight stub battle log entries tied to the provided bruto name', () => {
    const entries = generateStubBattleLogEntries('Rex');
    expect(entries).toHaveLength(8);
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    expect(entries[0].summary).toContain('Rex');
    expect(entries[0].result).toBe('loss');
    expect(entries[1].result).toBe('win');
  });

  it('maps augmenter skills into rich display metadata', () => {
    const augmenters = mapAugmenterSkills([
      'herculean_strength',
      'feline_agility',
      'lightning_strike',
      'herculean_strength', // duplicate should be ignored
      'unknown_skill',
    ]);

    expect(augmenters).toHaveLength(3);
    expect(augmenters.map((item) => item.id)).toEqual([
      'herculean_strength',
      'feline_agility',
      'lightning_strike',
    ]);
    expect(augmenters[0]).toMatchObject({
      name: 'Herculean Strength',
      bonus: '+50% STR',
    });
    expect(augmenters[1].description).toContain('Agilidad');
  });

  it('maps pet records while dropping unknown types', () => {
    const pets: BrutoPetWithCost[] = [
      {
        id: 'pet-1',
        brutoId: 'bruto-1',
        petType: 'dog_a',
        acquiredAtLevel: 3,
        resistanceCost: 2,
      },
      {
        id: 'pet-2',
        brutoId: 'bruto-1',
        petType: 'bear',
        acquiredAtLevel: 9,
        resistanceCost: 8,
      },
      {
        id: 'pet-3',
        brutoId: 'bruto-1',
        petType: 'unknown',
        acquiredAtLevel: 5,
        resistanceCost: 0,
      },
    ];

    const result = mapPetRecords(pets);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      name: 'Perro A',
      resistanceCost: 2,
      acquiredAtLevel: 3,
    });
    expect(result[1]).toMatchObject({
      name: 'Oso',
      resistanceCost: 8,
    });
  });
});
