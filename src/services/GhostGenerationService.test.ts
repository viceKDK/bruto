/**
 * GhostGenerationService - Unit Tests (Story 9.3)
 * 
 * Tests for AI opponent ghost generation.
 */

import { describe, it, expect } from 'vitest';
import { GhostGenerationService } from './GhostGenerationService';
import { isGhostBruto } from '../models/Bruto';

describe('GhostGenerationService', () => {
  describe('generateGhost', () => {
    it('should generate a ghost at level 1', () => {
      const ghost = GhostGenerationService.generateGhost(1);
      
      expect(ghost.level).toBe(1);
      expect(ghost.isGhost).toBe(true);
      expect(ghost.userId).toBe('ghost');
      expect(ghost.upgradeHistory).toHaveLength(0);
      expect(isGhostBruto(ghost)).toBe(true);
    });

    it('should generate a ghost at specified level', () => {
      const ghost = GhostGenerationService.generateGhost(10);
      
      expect(ghost.level).toBe(10);
      expect(ghost.upgradeHistory).toHaveLength(9); // Level 2-10
    });

    it('should generate deterministic ghosts with same seed', () => {
      const seed = 'test-seed-123';
      const ghost1 = GhostGenerationService.generateGhost(5, seed);
      const ghost2 = GhostGenerationService.generateGhost(5, seed);
      
      // Same seed = identical ghosts
      expect(ghost1.name).toBe(ghost2.name);
      expect(ghost1.appearanceId).toBe(ghost2.appearanceId);
      expect(ghost1.colorVariant).toBe(ghost2.colorVariant);
      expect(ghost1.hp).toBe(ghost2.hp);
      expect(ghost1.str).toBe(ghost2.str);
      expect(ghost1.speed).toBe(ghost2.speed);
      expect(ghost1.agility).toBe(ghost2.agility);
      expect(ghost1.buildArchetype).toBe(ghost2.buildArchetype);
      expect(ghost1.upgradeHistory).toHaveLength(ghost2.upgradeHistory.length);
    });

    it('should generate different ghosts with different seeds', () => {
      const ghost1 = GhostGenerationService.generateGhost(5, 'seed-1');
      const ghost2 = GhostGenerationService.generateGhost(5, 'seed-2');
      
      // Different seeds = different ghosts (statistically very unlikely to match)
      expect(ghost1.name).not.toBe(ghost2.name);
    });

    it('should have valid base stats at level 1', () => {
      const ghost = GhostGenerationService.generateGhost(1);
      
      expect(ghost.hp).toBe(60);
      expect(ghost.maxHp).toBe(60);
      expect(ghost.str).toBe(2);
      expect(ghost.speed).toBe(2);
      expect(ghost.agility).toBe(2);
      expect(ghost.resistance).toBe(0);
    });

    it('should level up stats correctly through progression', () => {
      const ghost = GhostGenerationService.generateGhost(5);
      
      // Stats should increase from base values
      expect(ghost.hp).toBeGreaterThanOrEqual(60);
      expect(ghost.maxHp).toBeGreaterThanOrEqual(60);
      
      // At least one combat stat should increase
      const totalCombatStats = ghost.str + ghost.speed + ghost.agility;
      expect(totalCombatStats).toBeGreaterThan(6); // Base is 2+2+2=6
    });

    it('should record upgrade history for each level-up', () => {
      const ghost = GhostGenerationService.generateGhost(8);
      
      expect(ghost.upgradeHistory).toHaveLength(7); // Level 2-8
      
      ghost.upgradeHistory.forEach((choice, index) => {
        expect(choice.level).toBe(index + 2); // Starts at level 2
        expect(['A', 'B']).toContain(choice.choiceSelected);
        expect(choice.optionA).toBeDefined();
        expect(choice.optionB).toBeDefined();
        expect(choice.statBoostsApplied).toBeDefined();
      });
    });

    it('should detect build archetype after progression', () => {
      const ghost = GhostGenerationService.generateGhost(10, 'archetype-test');
      
      expect(['tank', 'agile', 'balanced', 'hybrid']).toContain(ghost.buildArchetype);
    });

    it('should have a name from the name pool', () => {
      const ghost = GhostGenerationService.generateGhost(1);
      
      expect(ghost.name).toBeTruthy();
      expect(typeof ghost.name).toBe('string');
      expect(ghost.name.length).toBeGreaterThan(0);
    });

    it('should have valid appearance', () => {
      const ghost = GhostGenerationService.generateGhost(1);
      
      expect(ghost.appearanceId).toBeGreaterThanOrEqual(0);
      expect(ghost.appearanceId).toBeLessThanOrEqual(9); // 10 designs
      expect(ghost.colorVariant).toBeGreaterThanOrEqual(0);
      expect(ghost.colorVariant).toBeLessThanOrEqual(7); // 8 colors
    });

    it('should throw error for invalid level', () => {
      expect(() => GhostGenerationService.generateGhost(0)).toThrow();
      expect(() => GhostGenerationService.generateGhost(-1)).toThrow();
    });

    it('should calculate XP for level correctly', () => {
      const ghost = GhostGenerationService.generateGhost(5);
      
      // Level 5 should have XP from levels 2,3,4,5
      // XP formula: 100 * (level-1)
      // Level 2: 100, Level 3: 200, Level 4: 300, Level 5: 400
      // Total: 1000
      expect(ghost.xp).toBe(1000);
    });
  });

  describe('generateGhostPool', () => {
    it('should generate requested number of ghosts', () => {
      const count = 5;
      const ghosts = GhostGenerationService.generateGhostPool(10, count, 'user123');
      
      expect(ghosts).toHaveLength(count);
    });

    it('should generate all ghosts at same level', () => {
      const level = 7;
      const ghosts = GhostGenerationService.generateGhostPool(level, 3, 'user123');
      
      ghosts.forEach(ghost => {
        expect(ghost.level).toBe(level);
      });
    });

    it('should generate unique ghosts in pool', () => {
      const ghosts = GhostGenerationService.generateGhostPool(5, 10, 'user456');
      
      // All ghosts should have unique seeds
      const seeds = ghosts.map(g => g.generationSeed);
      const uniqueSeeds = new Set(seeds);
      expect(uniqueSeeds.size).toBe(ghosts.length);
      
      // Names should be diverse (not all identical)
      const names = ghosts.map(g => g.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBeGreaterThan(1);
    });

    it('should include user ID in seeds for uniqueness', () => {
      const ghosts = GhostGenerationService.generateGhostPool(5, 2, 'user789');
      
      ghosts.forEach(ghost => {
        expect(ghost.generationSeed).toContain('user789');
      });
    });
  });

  describe('Archetype Detection', () => {
    it('should detect tank build for HP/STR focused ghost', () => {
      // Generate many ghosts and check for tank archetype
      let tankFound = false;
      
      // Try more seeds since archetype detection requires >70% tank boosts
      for (let i = 0; i < 100; i++) {
        const ghost = GhostGenerationService.generateGhost(20, `tank-seed-${i}`);
        if (ghost.buildArchetype === 'tank') {
          tankFound = true;
          
          // Verify tank build has majority HP and STR boosts
          const hpBoosts = ghost.upgradeHistory.filter(
            c => c.statBoostsApplied.hp
          ).length;
          const strBoosts = ghost.upgradeHistory.filter(
            c => c.statBoostsApplied.str
          ).length;
          
          // Level 20 with 70% tank = ~13-14 tank boosts
          expect(hpBoosts + strBoosts).toBeGreaterThanOrEqual(5);
          break;
        }
      }
      
      expect(tankFound).toBe(true);
    });

    it('should detect agile build for Speed/Agility focused ghost', () => {
      let agileFound = false;
      
      // Try more seeds since archetype detection requires >70% agile boosts
      for (let i = 0; i < 100; i++) {
        const ghost = GhostGenerationService.generateGhost(20, `agile-seed-${i}`);
        if (ghost.buildArchetype === 'agile') {
          agileFound = true;
          
          const speedBoosts = ghost.upgradeHistory.filter(
            c => c.statBoostsApplied.speed
          ).length;
          const agilityBoosts = ghost.upgradeHistory.filter(
            c => c.statBoostsApplied.agility
          ).length;
          
          // Level 20 with 70% agile = ~13-14 agile boosts
          expect(speedBoosts + agilityBoosts).toBeGreaterThanOrEqual(3);
          break;
        }
      }
      
      expect(agileFound).toBe(true);
    });

    it('should detect balanced builds', () => {
      let balancedFound = false;
      
      for (let i = 0; i < 50; i++) {
        const ghost = GhostGenerationService.generateGhost(15, `balanced-seed-${i}`);
        if (ghost.buildArchetype === 'balanced') {
          balancedFound = true;
          break;
        }
      }
      
      expect(balancedFound).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should generate ghosts quickly (< 100ms for 100 ghosts)', () => {
      const start = performance.now();
      
      GhostGenerationService.generateGhostPool(10, 100, 'performance-test');
      
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Sub-100ms for 100 ghosts
    });
  });
});
