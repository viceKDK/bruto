/**
 * UpgradeGenerator - Level-Up Upgrade Options (Story 8.2)
 * Story 6.8: Now calculates skill-enhanced stat bonuses dynamically
 * 
 * Generates random upgrade options for bruto level-ups.
 * Supports stat boosts, weapons, skills, and pets with seeded randomness.
 */

import { IBruto } from '../models/Bruto';
import { SeededRandom } from '../utils/SeededRandom';
import { SkillCatalog } from './skills/SkillCatalog';
import { SkillEffectEngine } from './skills/SkillEffectEngine';
import { StatType as SkillStatType } from '../models/Skill';

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
        return this.generateFullStatBoost(bruto, rng);
      
      case 'SPLIT_STAT':
        return this.generateSplitStatBoost(bruto, rng);
      
      case 'WEAPON':
        return this.generateWeaponOption(rng);
      
      case 'SKILL':
        return this.generateSkillOption(rng);
      
      case 'PET':
        return this.generatePetOption(rng);
      
      default:
        // Fallback to full stat boost
        return this.generateFullStatBoost(bruto, rng);
    }
  }

  /**
   * Generate Full Stat Boost option
   * Story 6.8: Calculates skill-enhanced bonuses dynamically
   * Base: +2 STR/Speed/Agility OR +12 HP
   * Enhanced: +3 with skill bonuses (e.g., Fuerza Hércules)
   */
  private static generateFullStatBoost(bruto: IBruto, rng: SeededRandom): UpgradeOption {
    const statOptions = [
      { stat: 'str' as const, skillStat: SkillStatType.STR, name: 'STR (Fuerza)' },
      { stat: 'speed' as const, skillStat: SkillStatType.SPEED, name: 'Speed (Velocidad)' },
      { stat: 'agility' as const, skillStat: SkillStatType.AGILITY, name: 'Agility (Agilidad)' },
      { stat: 'hp' as const, skillStat: SkillStatType.HP, name: 'HP (Vida)' },
    ];

    const chosen = statOptions[Math.floor(rng.next() * statOptions.length)];
    
    // Story 6.8: Calculate actual bonus with skills
    const bonus = this.calculateStatBonus(bruto, chosen.skillStat, false); // false = full upgrade

    return {
      type: 'FULL_STAT',
      description: `💪 +${bonus} ${chosen.name}`,
      stats: { [chosen.stat]: bonus },
    };
  }

  /**
   * Generate Split Stat Boost option
   * Story 6.8: Calculates skill-enhanced bonuses dynamically
   * Base: +1/+1 in two stats OR +6 HP + 1 stat
   * Enhanced: +2/+2 or +7 HP + 2 stat with skill bonuses
   */
  private static generateSplitStatBoost(bruto: IBruto, rng: SeededRandom): UpgradeOption {
    const statOptions = [
      { stat: 'str' as const, skillStat: SkillStatType.STR, name: 'STR' },
      { stat: 'speed' as const, skillStat: SkillStatType.SPEED, name: 'Speed' },
      { stat: 'agility' as const, skillStat: SkillStatType.AGILITY, name: 'Agility' },
    ];
    
    // 50% chance of HP + stat, 50% chance of stat + stat
    if (rng.next() < 0.5) {
      // HP + stat
      const chosen = statOptions[Math.floor(rng.next() * statOptions.length)];
      
      // Story 6.8: Calculate actual bonuses with skills
      const hpBonus = this.calculateStatBonus(bruto, SkillStatType.HP, true); // true = split
      const statBonus = this.calculateStatBonus(bruto, chosen.skillStat, true);
      
      return {
        type: 'SPLIT_STAT',
        description: `⚡ +${hpBonus} HP + ${statBonus} ${chosen.name}`,
        stats: { hp: hpBonus, [chosen.stat]: statBonus },
      };
    } else {
      // Two different stats
      const chosen1 = statOptions[Math.floor(rng.next() * statOptions.length)];
      const remainingStats = statOptions.filter(s => s.stat !== chosen1.stat);
      const chosen2 = remainingStats[Math.floor(rng.next() * remainingStats.length)];
      
      // Story 6.8: Calculate actual bonuses with skills
      const bonus1 = this.calculateStatBonus(bruto, chosen1.skillStat, true);
      const bonus2 = this.calculateStatBonus(bruto, chosen2.skillStat, true);
      
      return {
        type: 'SPLIT_STAT',
        description: `⚡ +${bonus1} ${chosen1.name} + ${bonus2} ${chosen2.name}`,
        stats: { [chosen1.stat]: bonus1, [chosen2.stat]: bonus2 },
      };
    }
  }

  /**
   * Story 6.8: Calculate skill-enhanced stat bonus for level-up
   * Mirrors logic from StatBoostService.getSkillLevelUpBonuses()
   * @param bruto The bruto gaining levels
   * @param statType The stat being increased (Skill.StatType enum)
   * @param isSplit Whether this is a split upgrade (affects base values)
   * @returns Enhanced bonus value (base 2/12 or 1/6, modified by skills)
   */
  private static calculateStatBonus(bruto: IBruto, statType: SkillStatType, isSplit: boolean): number {
    // Get bruto's skills
    const skillIds = bruto.skills || [];
    if (skillIds.length === 0) {
      // No skills, return base values
      const isHP = statType === SkillStatType.HP;
      return isSplit ? (isHP ? 6 : 1) : (isHP ? 12 : 2);
    }

    // Load skill objects from catalog
    const catalog = SkillCatalog.getInstance();
    const skills = skillIds
      .map(id => catalog.getSkillById(id))
      .filter((skill): skill is NonNullable<typeof skill> => skill !== null);

    // Calculate bonus using SkillEffectEngine
    const engine = SkillEffectEngine.getInstance();
    const bonus = engine.getLevelUpBonus(skills, statType, isSplit);

    return bonus;
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
