/**
 * UpgradeGenerator - Level-Up Upgrade Options (Story 8.2)
 * 
 * Generates random upgrade options for bruto level-ups.
 * Supports stat boosts, weapons, skills, and pets with seeded randomness.
 */

import { IBruto } from '../models/Bruto';
import { SeededRandom } from '../utils/SeededRandom';

export type UpgradeType = 'FULL_STAT' | 'SPLIT_STAT' | 'WEAPON' | 'SKILL' | 'PET';

export interface UpgradeOption {
  type: UpgradeType;
  description: string;
  stats?: {
    str?: number;
    speed?: number;
    agility?: number;
    hp?: number;
  };
  weaponId?: string;
  skillId?: string;
  petType?: string;
}

export class UpgradeGenerator {
  /**
   * Generate 2 random upgrade options for level-up
   * Options are deterministic based on bruto ID + level for fairness
   */
  static generateOptions(bruto: IBruto, newLevel: number): [UpgradeOption, UpgradeOption] {
    // Seed based on bruto ID + level for deterministic results
    const seed = this.hashString(`${bruto.id}-${newLevel}`);
    const rng = new SeededRandom(seed);

    // Generate pool of available option types
    const availableTypes = this.getAvailableTypes(bruto, newLevel);

    // Pick 2 different types
    const type1 = availableTypes[Math.floor(rng.next() * availableTypes.length)];
    const remainingTypes = availableTypes.filter(t => t !== type1);
    const type2 = remainingTypes[Math.floor(rng.next() * remainingTypes.length)];

    const option1 = this.generateOption(type1, bruto, rng);
    const option2 = this.generateOption(type2, bruto, rng);

    return [option1, option2];
  }

  /**
   * Get available upgrade types based on bruto state
   */
  private static getAvailableTypes(bruto: IBruto, level: number): UpgradeType[] {
    const types: UpgradeType[] = [];

    // Stat boosts always available
    types.push('FULL_STAT', 'SPLIT_STAT');

    // Weapons/Skills/Pets available based on level and current state
    if (level >= 2) {
      // Stub for now - will integrate with Epics 5, 6, 7
      types.push('WEAPON', 'SKILL');
    }

    if (level >= 3 && (!bruto.skills || bruto.skills.length < 10)) {
      types.push('PET');
    }

    return types;
  }

  /**
   * Generate specific upgrade option
   */
  private static generateOption(
    type: UpgradeType,
    bruto: IBruto,
    rng: SeededRandom
  ): UpgradeOption {
    switch (type) {
      case 'FULL_STAT':
        return this.generateFullStatBoost(rng);
      
      case 'SPLIT_STAT':
        return this.generateSplitStatBoost(rng);
      
      case 'WEAPON':
        return this.generateWeaponOption(rng);
      
      case 'SKILL':
        return this.generateSkillOption(rng);
      
      case 'PET':
        return this.generatePetOption(rng);
      
      default:
        // Fallback to full stat boost
        return this.generateFullStatBoost(rng);
    }
  }

  /**
   * Generate Full Stat Boost option
   * +2 STR OR +2 Speed OR +2 Agility OR +12 HP
   */
  private static generateFullStatBoost(rng: SeededRandom): UpgradeOption {
    const options = [
      { stat: 'str', value: 2, desc: '+2 STR (Fuerza)' },
      { stat: 'speed', value: 2, desc: '+2 Speed (Velocidad)' },
      { stat: 'agility', value: 2, desc: '+2 Agility (Agilidad)' },
      { stat: 'hp', value: 12, desc: '+12 HP (Vida)' },
    ];

    const chosen = options[Math.floor(rng.next() * options.length)];

    return {
      type: 'FULL_STAT',
      description: `💪 ${chosen.desc}`,
      stats: { [chosen.stat]: chosen.value },
    };
  }

  /**
   * Generate Split Stat Boost option
   * +1/+1 in two different stats OR +6 HP + 1 stat
   */
  private static generateSplitStatBoost(rng: SeededRandom): UpgradeOption {
    const statOptions = ['str', 'speed', 'agility'];
    
    // 50% chance of HP + stat, 50% chance of stat + stat
    if (rng.next() < 0.5) {
      // HP + stat
      const stat = statOptions[Math.floor(rng.next() * statOptions.length)];
      const statNames: Record<string, string> = {
        str: 'STR',
        speed: 'Speed',
        agility: 'Agility',
      };
      
      return {
        type: 'SPLIT_STAT',
        description: `⚡ +6 HP + 1 ${statNames[stat]}`,
        stats: { hp: 6, [stat]: 1 },
      };
    } else {
      // Two different stats
      const stat1 = statOptions[Math.floor(rng.next() * statOptions.length)];
      const remainingStats = statOptions.filter(s => s !== stat1);
      const stat2 = remainingStats[Math.floor(rng.next() * remainingStats.length)];
      
      const statNames: Record<string, string> = {
        str: 'STR',
        speed: 'Speed',
        agility: 'Agility',
      };
      
      return {
        type: 'SPLIT_STAT',
        description: `⚡ +1 ${statNames[stat1]} + 1 ${statNames[stat2]}`,
        stats: { [stat1]: 1, [stat2]: 1 },
      };
    }
  }

  /**
   * Generate Weapon option (stubbed for Epic 5)
   */
  private static generateWeaponOption(rng: SeededRandom): UpgradeOption {
    const weapons = [
      { id: 'knife', name: 'Cuchillo' },
      { id: 'hammer', name: 'Martillo' },
      { id: 'sword', name: 'Espada' },
      { id: 'axe', name: 'Hacha' },
    ];

    const weapon = weapons[Math.floor(rng.next() * weapons.length)];

    return {
      type: 'WEAPON',
      description: `🗡️ Arma: ${weapon.name} (Próximamente)`,
      weaponId: weapon.id,
    };
  }

  /**
   * Generate Skill option (stubbed for Epic 6)
   */
  private static generateSkillOption(rng: SeededRandom): UpgradeOption {
    const skills = [
      { id: 'counter', name: 'Contraataque' },
      { id: 'dodge', name: 'Esquiva Mejorada' },
      { id: 'critical', name: 'Golpe Crítico' },
      { id: 'shield', name: 'Escudo' },
    ];

    const skill = skills[Math.floor(rng.next() * skills.length)];

    return {
      type: 'SKILL',
      description: `✨ Habilidad: ${skill.name} (Próximamente)`,
      skillId: skill.id,
    };
  }

  /**
   * Generate Pet option (stubbed for Epic 7)
   */
  private static generatePetOption(rng: SeededRandom): UpgradeOption {
    const pets = [
      { type: 'dog_a', name: 'Perro Guardián' },
      { type: 'dog_b', name: 'Perro Rastreador' },
      { type: 'dog_c', name: 'Perro Feroz' },
      { type: 'panther', name: 'Pantera' },
      { type: 'bear', name: 'Oso' },
    ];

    const pet = pets[Math.floor(rng.next() * pets.length)];

    return {
      type: 'PET',
      description: `🐾 Mascota: ${pet.name} (Próximamente)`,
      petType: pet.type,
    };
  }

  /**
   * Simple string hash function for seeding
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
