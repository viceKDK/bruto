/**
 * SkillCatalog
 * Centralized repository for all skill definitions
 * Provides type-safe lookup and filtering methods
 */

import { Skill, SkillCategory } from '../../models/Skill';
import skillsData from '../../data/skills.json';

export class SkillCatalog {
  private static instance: SkillCatalog;
  private skills: Map<string, Skill>;
  private skillsByCategory: Map<SkillCategory, Skill[]>;

  private constructor() {
    this.skills = new Map();
    this.skillsByCategory = new Map();
    this.loadSkills();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SkillCatalog {
    if (!SkillCatalog.instance) {
      SkillCatalog.instance = new SkillCatalog();
    }
    return SkillCatalog.instance;
  }

  /**
   * Load skills from JSON catalog and build indexes
   */
  private loadSkills(): void {
    const rawSkills = skillsData.skills as Skill[];

    // Build main index by ID
    rawSkills.forEach(skill => {
      this.skills.set(skill.id, skill);
    });

    // Build category index
    this.buildCategoryIndex();

    console.log(`✅ Skill Catalog loaded: ${this.skills.size} skills`);
  }

  /**
   * Build category index for fast category-based queries
   */
  private buildCategoryIndex(): void {
    this.skills.forEach(skill => {
      const category = skill.category as SkillCategory;
      if (!this.skillsByCategory.has(category)) {
        this.skillsByCategory.set(category, []);
      }
      this.skillsByCategory.get(category)!.push(skill);
    });
  }

  /**
   * Get skill by ID
   */
  public getSkillById(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  /**
   * Get skill by name (case-insensitive)
   */
  public getSkillByName(name: string): Skill | undefined {
    const normalizedName = name.toLowerCase();
    return Array.from(this.skills.values()).find(
      skill => skill.name.toLowerCase() === normalizedName
    );
  }

  /**
   * Get all skills in a category
   */
  public getSkillsByCategory(category: SkillCategory): Skill[] {
    return this.skillsByCategory.get(category) || [];
  }

  /**
   * Get skills by rarity/odds range
   * Useful for creating reward pools
   */
  public getSkillsByRarity(minOdds: number, maxOdds: number): Skill[] {
    return Array.from(this.skills.values()).filter(
      skill => skill.odds >= minOdds && skill.odds <= maxOdds
    );
  }

  /**
   * Get all skills with acquisition odds > 0
   * (excludes skills that can't be randomly acquired)
   */
  public getAcquirableSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(skill => skill.odds > 0);
  }

  /**
   * Get all skills
   */
  public getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Check if skill exists
   */
  public hasSkill(id: string): boolean {
    return this.skills.has(id);
  }

  /**
   * Get skills that are mutually exclusive with given skill
   */
  public getMutuallyExclusiveSkills(skillId: string): Skill[] {
    const skill = this.skills.get(skillId);
    if (!skill || !skill.mutuallyExclusiveWith) {
      return [];
    }

    return skill.mutuallyExclusiveWith
      .map(id => this.skills.get(id))
      .filter((s): s is Skill => s !== undefined);
  }

  /**
   * Get skill count by category
   */
  public getSkillCountByCategory(category: SkillCategory): number {
    return this.skillsByCategory.get(category)?.length || 0;
  }

  /**
   * Get total skill count
   */
  public getTotalSkillCount(): number {
    return this.skills.size;
  }

  /**
   * Validate skill catalog integrity
   * Checks for broken references in mutual exclusions
   */
  public validateCatalog(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.skills.forEach((skill, id) => {
      // Check mutual exclusions reference valid skills
      if (skill.mutuallyExclusiveWith) {
        skill.mutuallyExclusiveWith.forEach(exclusiveId => {
          if (!this.skills.has(exclusiveId)) {
            errors.push(
              `Skill ${id} references non-existent exclusive skill: ${exclusiveId}`
            );
          }
        });
      }

      // Check odds are valid percentages
      if (skill.odds < 0 || skill.odds > 100) {
        errors.push(`Skill ${id} has invalid odds: ${skill.odds}`);
      }

      // Check effects array is not empty
      if (!skill.effects || skill.effects.length === 0) {
        errors.push(`Skill ${id} has no effects defined`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const skillCatalog = SkillCatalog.getInstance();
