import type { BattleLogEntry } from '../ui/components/BattleLog';
import type { AugmenterChipData, PetChipData } from '../ui/components/StatsPanel';
import type { BrutoPetWithCost } from '../database/repositories/BrutoPetRepository';

const STUB_BATTLE_OPPONENTS = [
  'Clan Lobos',
  'Dojo Crimson',
  'Hermandad Sombria',
  'Arrastracadenas',
  'Capitan Furia',
  'Orden de Hielo',
  'Martillo Carmesi',
  'Legion Arena',
] as const;

const AUGMENTER_SKILL_MAP: Record<
  string,
  { name: string; bonus: string; description: string }
> = {
  herculean_strength: {
    name: 'Herculean Strength',
    bonus: '+50% STR',
    description: 'Potencia las ganancias de Fuerza a +3 por nivel en lugar de +2.',
  },
  feline_agility: {
    name: 'Feline Agility',
    bonus: '+50% Agilidad',
    description: 'Incrementa las subidas de Agilidad a +3 por nivel en lugar de +2.',
  },
  lightning_strike: {
    name: 'Lightning Strike',
    bonus: '+50% Speed',
    description: 'Acelera las ganancias de Velocidad a +3 por nivel en lugar de +2.',
  },
  vitality: {
    name: 'Vitality',
    bonus: '+50% HP/RES',
    description: 'Mejora los aumentos de HP a +18 (en lugar de +12) e incrementa la resistencia.',
  },
  immortality: {
    name: 'Immortality',
    bonus: '+250% RES',
    description:
      'Transforma la resistencia en un escudo masivo (+250%) a costa de reducir otras estadisticas.',
  },
};

const PET_TYPE_INFO: Record<
  string,
  { name: string; description: string; resistanceCost: number }
> = {
  dog_a: {
    name: 'Perro A',
    description: 'Mascota basica: +14 HP, dano bajo, combo 10%, iniciativa -10.',
    resistanceCost: 2,
  },
  dog_b: {
    name: 'Perro B',
    description: 'Mascota basica: +14 HP, dano bajo, combo 10%, iniciativa -10.',
    resistanceCost: 2,
  },
  dog_c: {
    name: 'Perro C',
    description: 'Mascota basica: +14 HP, dano bajo, combo 10%, iniciativa -10.',
    resistanceCost: 2,
  },
  panther: {
    name: 'Pantera',
    description: 'Mascota ofensiva: 26 HP, velocidad 24, combo 60%, evasion 20%, iniciativa -60.',
    resistanceCost: 6,
  },
  bear: {
    name: 'Oso',
    description: 'Tanque: 110 HP, dano alto, velocidad 1, iniciativa -360.',
    resistanceCost: 8,
  },
};

export function formatWeaponName(weaponId: string): string {
  return weaponId
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function formatSkillName(skillId: string): string {
  if (!skillId) return 'Habilidad desconocida';

  return skillId
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function formatTimestamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function generateStubBattleLogEntries(brutoName: string): BattleLogEntry[] {
  return STUB_BATTLE_OPPONENTS.map((opponent, index) => {
    const result: BattleLogEntry['result'] = index % 3 === 0 ? 'loss' : 'win';
    const timestamp = formatTimestamp(new Date(Date.now() - index * 60 * 60 * 1000));
    const summary =
      result === 'win'
        ? `${brutoName} gano en ${Math.max(3, index + 2)} turnos con ventaja de ${2 + index} HP.`
        : `${brutoName} cayo tras ${Math.max(3, index + 2)} turnos, rival presiono con combos rapidos.`;

    return {
      id: `battle-${index}`,
      opponent,
      result,
      timestamp,
      summary,
    };
  });
}

export function mapAugmenterSkills(skills: string[] = []): AugmenterChipData[] {
  const unique = new Set<string>();
  const result: AugmenterChipData[] = [];

  skills.forEach((skillIdRaw) => {
    const skillId = skillIdRaw.toLowerCase();
    if (unique.has(skillId)) {
      return;
    }
    const entry = AUGMENTER_SKILL_MAP[skillId];
    if (!entry) {
      return;
    }
    unique.add(skillId);
    result.push({
      id: skillId,
      name: entry.name,
      bonus: entry.bonus,
      description: entry.description,
    });
  });

  return result;
}

export function mapPetRecords(pets: BrutoPetWithCost[]): PetChipData[] {
  return pets
    .map((pet) => {
      const info = PET_TYPE_INFO[pet.petType];
      if (!info) {
        return null;
      }

      return {
        id: pet.id,
        name: info.name,
        resistanceCost: pet.resistanceCost,
        description: info.description,
        acquiredAtLevel: pet.acquiredAtLevel,
      };
    })
    .filter((entry): entry is PetChipData => entry !== null);
}
