import type { BattleLogEntry } from '../ui/components/BattleLog';
import type { AugmenterChipData, PetChipData } from '../ui/components/StatsPanel';
import type { BrutoPetWithCost } from '../database/repositories/BrutoPetRepository';
import { PetCatalog } from '../engine/pets/PetCatalog'; // Story 7.6: Enhanced pet display
import { PetType } from '../engine/pets/PetType'; // Story 7.6: Proper pet type handling

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

// Story 7.6: Removed old PET_TYPE_INFO - now using PetCatalog

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

/**
 * Story 7.6: Enhanced pet mapping with stats and slot info
 * Maps database pet records to UI display format using PetCatalog
 */
export function mapPetRecords(pets: BrutoPetWithCost[]): PetChipData[] {
  const catalog = PetCatalog.getInstance();

  const mapped: PetChipData[] = [];

  for (const pet of pets) {
    // Try mapping old format (dog_a, panther, bear) to new format (perro, pantera, oso)
    let petType: PetType | null = null;
    let petSlot: 'A' | 'B' | 'C' | null = null;

    if (pet.petType === 'dog_a') {
      petType = PetType.PERRO;
      petSlot = 'A';
    } else if (pet.petType === 'dog_b') {
      petType = PetType.PERRO;
      petSlot = 'B';
    } else if (pet.petType === 'dog_c') {
      petType = PetType.PERRO;
      petSlot = 'C';
    } else if (pet.petType === 'panther' || pet.petType === PetType.PANTERA) {
      petType = PetType.PANTERA;
    } else if (pet.petType === 'bear' || pet.petType === PetType.OSO) {
      petType = PetType.OSO;
    } else if (pet.petType === PetType.PERRO) {
      petType = PetType.PERRO;
      petSlot = null; // Slot should come from database but old format doesn't have it
    }

    if (!petType) {
      console.warn(`[mapPetRecords] Unknown pet type: ${pet.petType}`);
      continue;
    }

    const petInfo = catalog.getPetByType(petType);
    if (!petInfo) {
      console.warn(`[mapPetRecords] Pet not found in catalog: ${petType}`);
      continue;
    }

    // Extract name with slot (e.g., "Perro A")
    let displayName = petInfo.name;
    if (petType === PetType.PERRO && petSlot) {
      displayName = `${petInfo.name} ${petSlot}`;
    }

    // Build description from stats
    const description = `${petInfo.name}: +${petInfo.stats.hp} HP, Agilidad ${petInfo.stats.agility}, Velocidad ${petInfo.stats.speed}`;

    mapped.push({
      id: pet.id,
      name: displayName,
      resistanceCost: pet.resistanceCost,
      description,
      acquiredAtLevel: pet.acquiredAtLevel,
      petSlot,
      stats: {
        hp: petInfo.stats.hp,
        agility: petInfo.stats.agility,
        speed: petInfo.stats.speed,
        multiHitChance: petInfo.stats.multiHitChance,
        evasionChance: petInfo.stats.evasionChance,
      },
    });
  }

  return mapped;
}
