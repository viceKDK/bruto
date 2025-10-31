/**
 * SkillStackingValidator - Story 6.6
 * Validates skill stacking rules and enforces limits
 * 
 * Responsibilities:
 * - Prevent duplicate unique skills
 * - Enforce mutual exclusions
 * - Validate stacking limits
 * - Provide error messages for invalid operations
 */

import { IBruto } from '../../models/Bruto';
import { Skill } from '../../models/Skill';
import { SkillCatalog } from './SkillCatalog';

export interface StackingValidationResult {
  valid: boolean;
  error?: string;
  canAcquire: boolean;
}

export interface StackingInfo {
  currentStacks: number;
  maxStacks: number;
  atLimit: boolean;
}

export class SkillStackingValidator {
  private static instance: SkillStackingValidator;
  private catalog: SkillCatalog;

  private constructor() {
    this.catalog = SkillCatalog.getInstance();
  }

  public static getInstance(): SkillStackingValidator {
    if (!SkillStackingValidator.instance) {
      SkillStackingValidator.instance = new SkillStackingValidator();
    }
    return SkillStackingValidator.instance;
  }

  /**
   * AC3: Validate if a skill can be acquired by a bruto
   * Checks uniqueness, mutual exclusions, and stacking limits
   */
  public canAcquireSkill(bruto: IBruto, skillId: string): StackingValidationResult {
    const skill = this.catalog.getSkillById(skillId);
    if (!skill) {
      return {
        valid: false,
        error: `Skill ${skillId} not found in catalog`,
        canAcquire: false,
      };
    }

    // Check if bruto already owns this skill
    const ownsSkill = bruto.skills?.includes(skillId) ?? false;

    // AC3: Unique skills cannot be acquired twice
    if (ownsSkill && !skill.stackable) {
      return {
        valid: false,
        error: `Skill ${skill.name} is unique and already owned`,
        canAcquire: false,
      };
    }

    // Check stacking limit if skill is stackable
    if (ownsSkill && skill.stackable) {
      const stackInfo = this.getStackingInfo(bruto, skillId);
      if (stackInfo.atLimit) {
        return {
          valid: false,
          error: `Skill ${skill.name} is at max stacks (${stackInfo.maxStacks})`,
          canAcquire: false,
        };
      }
    }

    // AC4: Check mutual exclusions
    const exclusionError = this.checkMutualExclusions(bruto, skill);
    if (exclusionError) {
      return {
        valid: false,
        error: exclusionError,
        canAcquire: false,
      };
    }

    return {
      valid: true,
      canAcquire: true,
    };
  }

  /**
   * AC4: Check if acquiring this skill would violate mutual exclusions
   */
  private checkMutualExclusions(bruto: IBruto, skill: Skill): string | null {
    if (!skill.mutuallyExclusiveWith || skill.mutuallyExclusiveWith.length === 0) {
      return null;
    }

    const ownedSkills = bruto.skills ?? [];
    
    for (const excludedId of skill.mutuallyExclusiveWith) {
      if (ownedSkills.includes(excludedId)) {
        const excludedSkill = this.catalog.getSkillById(excludedId);
        const excludedName = excludedSkill?.name ?? excludedId;
        return `Cannot acquire ${skill.name} - mutually exclusive with owned skill: ${excludedName}`;
      }
    }

    return null;
  }

  /**
   * Get stacking information for a skill
   */
  public getStackingInfo(bruto: IBruto, skillId: string): StackingInfo {
    const skill = this.catalog.getSkillById(skillId);
    if (!skill || !skill.stackable) {
      return {
        currentStacks: 0,
        maxStacks: 1,
        atLimit: true,
      };
    }

    const ownedSkills = bruto.skills ?? [];
    const currentStacks = ownedSkills.filter(id => id === skillId).length;
    const maxStacks = skill.maxStacks ?? 1;

    return {
      currentStacks,
      maxStacks,
      atLimit: currentStacks >= maxStacks,
    };
  }

  /**
   * AC1: Calculate total armor from all skills
   * Used for validation but enforcement happens in SkillEffectEngine
   */
  public calculateTotalArmor(bruto: IBruto): number {
    const ownedSkills = bruto.skills ?? [];
    let totalArmor = 0;

    for (const skillId of ownedSkills) {
      const skill = this.catalog.getSkillById(skillId);
      if (!skill) continue;

      for (const effect of skill.effects) {
        if (effect.type === 'armor_bonus' && effect.value !== undefined) {
          totalArmor += effect.value;
        }
      }
    }

    return totalArmor;
  }

  /**
   * AC2: Validate if total armor would exceed cap after acquiring skill
   */
  public wouldExceedArmorCap(bruto: IBruto, skillId: string): boolean {
    const skill = this.catalog.getSkillById(skillId);
    if (!skill) return false;

    const currentArmor = this.calculateTotalArmor(bruto);
    let additionalArmor = 0;

    for (const effect of skill.effects) {
      if (effect.type === 'armor_bonus' && effect.value !== undefined) {
        additionalArmor += effect.value;
      }
    }

    return (currentArmor + additionalArmor) > 75;
  }

  /**
   * AC5: Get debug info about current stacking state
   */
  public getStackingDebugInfo(bruto: IBruto): string {
    const ownedSkills = bruto.skills ?? [];
    const armor = this.calculateTotalArmor(bruto);
    const lines: string[] = [
      `=== Skill Stacking Debug Info for ${bruto.name} ===`,
      `Total Skills: ${ownedSkills.length}`,
      `Total Armor: ${armor}% ${armor > 75 ? '⚠️ EXCEEDS CAP (75%)' : '✓'}`,
      '',
      'Skills:',
    ];

    const skillCounts = new Map<string, number>();
    for (const skillId of ownedSkills) {
      skillCounts.set(skillId, (skillCounts.get(skillId) ?? 0) + 1);
    }

    for (const [skillId, count] of skillCounts) {
      const skill = this.catalog.getSkillById(skillId);
      const name = skill?.name ?? skillId;
      const stackable = skill?.stackable ? `(stackable, max ${skill.maxStacks})` : '(unique)';
      lines.push(`  - ${name} x${count} ${stackable}`);
    }

    return lines.join('\n');
  }
}
