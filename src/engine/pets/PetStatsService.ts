/**
 * PetStatsService - Story 7.2
 * Calculates pet stat contributions and resistance costs for brutos
 * 
 * Responsibilities:
 * - Calculate total HP bonus from pets
 * - Calculate agility/speed/evasion bonuses
 * - Calculate multi-hit chance modifiers
 * - Calculate total resistance cost
 * - Provide stat breakdown for UI
 */

import { BrutoPet, Pet } from './Pet';
import { PetCatalog } from './PetCatalog';
import { StatContribution } from '../StatsCalculator';

export interface PetStatsSummary {
  hpBonus: number;
  agilityBonus: number;
  speedBonus: number;
  multiHitBonus: number;          // Percentage points
  evasionBonus: number;           // Percentage points
  initiativeBonus: number;        // Turn order modifier
  resistanceCost: number;
  petCount: number;
  contributions: StatContribution[];
}

export class PetStatsService {
  private catalog: PetCatalog;

  constructor() {
    this.catalog = PetCatalog.getInstance();
  }

  /**
   * Calculate all stat bonuses from bruto's pets
   * @param brutoPets List of pets owned by bruto
   * @param hasVitalidad Whether bruto has Vitalidad skill
   * @param hasInmortal Whether bruto has Inmortal skill
   * @returns Summary of all pet stat contributions
   */
  public calculatePetStats(
    brutoPets: BrutoPet[],
    hasVitalidad: boolean = false,
    hasInmortal: boolean = false
  ): PetStatsSummary {
    let hpBonus = 0;
    let agilityBonus = 0;
    let speedBonus = 0;
    let multiHitBonus = 0;
    let evasionBonus = 0;
    let initiativeBonus = 0;
    let resistanceCost = 0;

    const contributions: StatContribution[] = [];

    for (const brutoPet of brutoPets) {
      const petDef = this.catalog.getPetByType(brutoPet.petType);
      
      if (!petDef) {
        console.warn(`Pet type ${brutoPet.petType} not found in catalog`);
        continue;
      }

      // Accumulate stats
      hpBonus += petDef.stats.hp;
      agilityBonus += petDef.stats.agility;
      speedBonus += petDef.stats.speed;
      multiHitBonus += petDef.stats.multiHitChance;
      evasionBonus += petDef.stats.evasionChance;
      initiativeBonus += petDef.stats.initiative;

      // Calculate resistance cost for this pet
      const cost = this.getPetResistanceCost(petDef, hasVitalidad, hasInmortal);
      resistanceCost += cost;

      // Add contributions for breakdown
      contributions.push({
        key: 'hp',
        amount: petDef.stats.hp,
        source: 'pet',
        description: `${petDef.name} (+${petDef.stats.hp} HP)`
      });

      if (petDef.stats.agility !== 0) {
        contributions.push({
          key: 'agility',
          amount: petDef.stats.agility,
          source: 'pet',
          description: `${petDef.name}`
        });
      }

      if (petDef.stats.speed !== 0) {
        contributions.push({
          key: 'speed',
          amount: petDef.stats.speed,
          source: 'pet',
          description: `${petDef.name}`
        });
      }
    }

    return {
      hpBonus,
      agilityBonus,
      speedBonus,
      multiHitBonus,
      evasionBonus,
      initiativeBonus,
      resistanceCost,
      petCount: brutoPets.length,
      contributions
    };
  }

  /**
   * Get resistance cost for a single pet
   * @param pet Pet definition
   * @param hasVitalidad Whether bruto has Vitalidad
   * @param hasInmortal Whether bruto has Inmortal
   * @returns Resistance cost
   */
  private getPetResistanceCost(
    pet: Pet,
    hasVitalidad: boolean,
    hasInmortal: boolean
  ): number {
    const costs = pet.resistanceCost;

    if (hasVitalidad && hasInmortal) {
      return costs.withBoth;
    } else if (hasVitalidad) {
      return costs.withVitalidad;
    } else if (hasInmortal) {
      return costs.withInmortal;
    } else {
      return costs.base;
    }
  }

  /**
   * Get stat contributions for StatsCalculator integration
   * @param brutoPets List of pets owned by bruto
   * @returns Array of stat contributions
   */
  public getPetStatContributions(brutoPets: BrutoPet[]): StatContribution[] {
    const contributions: StatContribution[] = [];

    for (const brutoPet of brutoPets) {
      const petDef = this.catalog.getPetByType(brutoPet.petType);
      
      if (!petDef) continue;

      // HP contribution
      contributions.push({
        key: 'hp',
        amount: petDef.stats.hp,
        source: 'pet',
        description: petDef.name
      });

      contributions.push({
        key: 'maxHp',
        amount: petDef.stats.hp,
        source: 'pet',
        description: petDef.name
      });

      // Agility contribution
      if (petDef.stats.agility !== 0) {
        contributions.push({
          key: 'agility',
          amount: petDef.stats.agility,
          source: 'pet',
          description: petDef.name
        });
      }

      // Speed contribution
      if (petDef.stats.speed !== 0) {
        contributions.push({
          key: 'speed',
          amount: petDef.stats.speed,
          source: 'pet',
          description: petDef.name
        });
      }
    }

    return contributions;
  }

  /**
   * Calculate resistance deduction when acquiring a pet
   * @param currentResistance Bruto's current resistance
   * @param petType Type of pet being acquired
   * @param hasVitalidad Whether bruto has Vitalidad
   * @param hasInmortal Whether bruto has Inmortal
   * @returns New resistance value (clamped to 0 minimum)
   */
  public calculateResistanceAfterAcquisition(
    currentResistance: number,
    petType: string,
    hasVitalidad: boolean = false,
    hasInmortal: boolean = false
  ): number {
    const petDef = this.catalog.getPetByType(petType as any);
    
    if (!petDef) {
      throw new Error(`Pet type ${petType} not found in catalog`);
    }

    const cost = this.getPetResistanceCost(petDef, hasVitalidad, hasInmortal);
    const newResistance = currentResistance - cost;

    // Clamp to 0 minimum (cannot have negative resistance)
    return Math.max(0, newResistance);
  }

  /**
   * Get detailed breakdown for UI display
   * @param brutoPets List of pets owned by bruto
   * @param hasVitalidad Whether bruto has Vitalidad
   * @param hasInmortal Whether bruto has Inmortal
   * @returns Human-readable breakdown
   */
  public getPetStatsBreakdown(
    brutoPets: BrutoPet[],
    hasVitalidad: boolean = false,
    hasInmortal: boolean = false
  ): string[] {
    const breakdown: string[] = [];
    const summary = this.calculatePetStats(brutoPets, hasVitalidad, hasInmortal);

    if (summary.hpBonus > 0) {
      breakdown.push(`HP: +${summary.hpBonus} from pets`);
    }

    if (summary.agilityBonus !== 0) {
      const sign = summary.agilityBonus > 0 ? '+' : '';
      breakdown.push(`Agility: ${sign}${summary.agilityBonus} from pets`);
    }

    if (summary.speedBonus !== 0) {
      const sign = summary.speedBonus > 0 ? '+' : '';
      breakdown.push(`Speed: ${sign}${summary.speedBonus} from pets`);
    }

    if (summary.multiHitBonus !== 0) {
      const sign = summary.multiHitBonus > 0 ? '+' : '';
      breakdown.push(`Multi-hit: ${sign}${summary.multiHitBonus}% from pets`);
    }

    if (summary.evasionBonus !== 0) {
      const sign = summary.evasionBonus > 0 ? '+' : '';
      breakdown.push(`Evasion: ${sign}${summary.evasionBonus}% from pets`);
    }

    if (summary.resistanceCost > 0) {
      breakdown.push(`Resistance cost: -${summary.resistanceCost.toFixed(2)}`);
    }

    return breakdown;
  }
}
