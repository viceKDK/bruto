 /**
 * ProgressionService - XP and Level Progression System (Story 8.1)
 * Enhanced with coin rewards at level 10 (Story 11.1)
 *
 * Handles XP rewards, level-up logic, and infinite progression.
 */

import { apiClient } from './ApiClient';
import { CoinService } from './CoinService';
import { db } from '../database/DatabaseManager';

export interface IProgressionResult {
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  xpForNextLevel: number;
}

export class ProgressionService {
  /**
   * Calculate XP needed for next level
   * Formula: current_level * 10 (simple linear scaling)
   */
  static getXPForNextLevel(currentLevel: number): number {
    return currentLevel * 10;
  }

  /**
   * Calculate XP progress percentage for UI bar
   */
  static getXPProgress(currentXP: number, currentLevel: number): number {
    const xpForNext = this.getXPForNextLevel(currentLevel);
    const xpInCurrentLevel = currentXP % xpForNext;
    return (xpInCurrentLevel / xpForNext) * 100;
  }

  /**
   * Award XP to bruto after battle and check for level up
   * @param brutoId - Bruto receiving XP
   * @param isWin - true for win (+2 XP), false for loss (+1 XP)
   */
  static async awardXP(brutoId: string, isWin: boolean): Promise<IProgressionResult> {
    const xpGained = isWin ? 2 : 1;

    try {
      // Get current bruto data
      const bruto = await apiClient.getBruto(brutoId);
      if (!bruto) {
        throw new Error('Bruto not found');
      }

      const currentXP = bruto.xp || 0;
      const currentLevel = bruto.level || 1;
      const newXP = currentXP + xpGained;

      // Calculate XP needed for next level
      const xpForNextLevel = this.getXPForNextLevel(currentLevel);

      // Check if leveled up
      let newLevel = currentLevel;
      let leveledUp = false;

      if (newXP >= xpForNextLevel) {
        newLevel = currentLevel + 1;
        leveledUp = true;
      }

      // Update bruto in database via API
      await apiClient.updateBrutoXP(brutoId, newXP, newLevel);

      // Check for level 10 coin reward (Story 11.1)
      if (newLevel === 10 && leveledUp) {
        await this.checkAndAwardLevel10Coins(brutoId, bruto.userId);
      }

      console.log('[ProgressionService] XP Awarded:', {
        brutoId,
        xpGained,
        newXP,
        newLevel,
        leveledUp
      });

      return {
        newXP,
        newLevel,
        leveledUp,
        xpForNextLevel: this.getXPForNextLevel(newLevel)
      };
    } catch (error) {
      console.error('[ProgressionService] Error awarding XP:', error);
      throw error;
    }
  }

  /**
   * Get XP info for display in UI
   */
  static getXPInfo(bruto: { xp: number; level: number }): {
    currentXP: number;
    currentLevel: number;
    xpForNextLevel: number;
    progressPercentage: number;
    xpInCurrentLevel: number;
  } {
    const xpForNextLevel = this.getXPForNextLevel(bruto.level);
    const xpInCurrentLevel = bruto.xp % xpForNextLevel;
    const progressPercentage = (xpInCurrentLevel / xpForNextLevel) * 100;

    return {
      currentXP: bruto.xp,
      currentLevel: bruto.level,
      xpForNextLevel,
      progressPercentage,
      xpInCurrentLevel
    };
  }

  /**
   * Check if bruto has reached level 10 and award 100 coins if not yet rewarded
   * (Story 11.1 - Coin Economy System)
   */
  private static async checkAndAwardLevel10Coins(brutoId: string, userId: string): Promise<void> {
    try {
      // Check if this bruto has already received the level 10 reward
      const hasRewarded = await CoinService.hasReceivedLevel10Reward(brutoId);

      if (!hasRewarded) {
        // Award 100 coins for reaching level 10
        const newBalance = await CoinService.awardCoins(
          userId,
          100,
          'LEVEL_10_REWARD',
          brutoId
        );

        // Mark bruto as having received the reward
        await CoinService.markLevel10RewardGiven(brutoId);

        console.log('[ProgressionService] Level 10 coin reward awarded:', {
          brutoId,
          userId,
          newBalance
        });
      } else {
        console.log('[ProgressionService] Level 10 reward already given for bruto:', brutoId);
      }
    } catch (error) {
      console.error('[ProgressionService] Error awarding level 10 coins:', error);
      // Don't throw - coin reward failure shouldn't block level-up
    }
  }
}
