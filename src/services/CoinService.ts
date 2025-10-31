/**
 * CoinService - Manages coin economy (Story 11.1)
 *
 * Handles coin rewards, spending, and transaction tracking.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/DatabaseManager';
import { useStore } from '../state/store';

export interface ICoinTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  brutoId?: string;
  createdAt: Date;
}

export type CoinTransactionReason =
  | 'LEVEL_10_REWARD'
  | 'SLOT_PURCHASE'
  | 'ADMIN_ADJUSTMENT';

export class CoinService {
  /**
   * Get user's current coin balance
   */
  static async getUserCoins(userId: string): Promise<number> {
    try {
      const result = db.query<{ coins: number }>(
        'SELECT coins FROM users WHERE id = ?',
        [userId]
      );

      if (!result.success) {
        throw new Error('Failed to query user coins');
      }

      if (result.data.length === 0) {
        throw new Error('User not found');
      }

      return result.data[0].coins;
    } catch (error) {
      console.error('[CoinService] Error getting user coins:', error);
      throw error;
    }
  }

  /**
   * Award coins to user and log transaction
   * @param userId - User receiving coins
   * @param amount - Positive number of coins to award
   * @param reason - Reason for awarding coins
   * @param brutoId - Optional bruto ID if reward is bruto-specific
   * @returns New coin balance
   */
  static async awardCoins(
    userId: string,
    amount: number,
    reason: CoinTransactionReason,
    brutoId?: string
  ): Promise<number> {
    if (amount <= 0) {
      throw new Error('Award amount must be positive');
    }

    try {
      // Get current balance
      const currentCoins = await this.getUserCoins(userId);
      const newBalance = currentCoins + amount;

      // Update user coins
      const updateResult = db.run(
        'UPDATE users SET coins = ? WHERE id = ?',
        [newBalance, userId]
      );

      if (!updateResult.success) {
        throw new Error('Failed to update user coins');
      }

      // Log transaction
      await this.logTransaction(userId, amount, reason, brutoId);

      // Update store if this is the current user
      const currentUser = useStore.getState().currentUser;
      if (currentUser && currentUser.id === userId) {
        useStore.getState().updateUserCoins(newBalance);
      }

      console.log('[CoinService] Coins awarded:', {
        userId,
        amount,
        reason,
        brutoId,
        newBalance
      });

      return newBalance;
    } catch (error) {
      console.error('[CoinService] Error awarding coins:', error);
      throw error;
    }
  }

  /**
   * Spend coins from user account
   * @param userId - User spending coins
   * @param amount - Positive number of coins to spend
   * @param reason - Reason for spending coins
   * @returns true if successful, false if insufficient funds
   */
  static async spendCoins(
    userId: string,
    amount: number,
    reason: CoinTransactionReason
  ): Promise<boolean> {
    if (amount <= 0) {
      throw new Error('Spend amount must be positive');
    }

    try {
      // Get current balance
      const currentCoins = await this.getUserCoins(userId);

      // Check if user has enough coins
      if (currentCoins < amount) {
        console.warn('[CoinService] Insufficient coins:', {
          userId,
          required: amount,
          available: currentCoins
        });
        return false;
      }

      const newBalance = currentCoins - amount;

      // Update user coins
      const updateResult = db.run(
        'UPDATE users SET coins = ? WHERE id = ?',
        [newBalance, userId]
      );

      if (!updateResult.success) {
        throw new Error('Failed to update user coins');
      }

      // Log transaction (negative amount for spending)
      await this.logTransaction(userId, -amount, reason);

      // Update store if this is the current user
      const currentUser = useStore.getState().currentUser;
      if (currentUser && currentUser.id === userId) {
        useStore.getState().updateUserCoins(newBalance);
      }

      console.log('[CoinService] Coins spent:', {
        userId,
        amount,
        reason,
        newBalance
      });

      return true;
    } catch (error) {
      console.error('[CoinService] Error spending coins:', error);
      throw error;
    }
  }

  /**
   * Check if bruto has already received level 10 coin reward
   */
  static async hasReceivedLevel10Reward(brutoId: string): Promise<boolean> {
    try {
      const result = db.query<{ level_10_coin_rewarded: number }>(
        'SELECT level_10_coin_rewarded FROM brutos WHERE id = ?',
        [brutoId]
      );

      if (!result.success || result.data.length === 0) {
        throw new Error('Bruto not found');
      }

      return result.data[0].level_10_coin_rewarded === 1;
    } catch (error) {
      console.error('[CoinService] Error checking level 10 reward:', error);
      throw error;
    }
  }

  /**
   * Mark bruto as having received level 10 reward
   */
  static async markLevel10RewardGiven(brutoId: string): Promise<void> {
    try {
      const result = db.run(
        'UPDATE brutos SET level_10_coin_rewarded = 1 WHERE id = ?',
        [brutoId]
      );

      if (!result.success) {
        throw new Error('Failed to mark level 10 reward');
      }

      console.log('[CoinService] Level 10 reward marked for bruto:', brutoId);
    } catch (error) {
      console.error('[CoinService] Error marking level 10 reward:', error);
      throw error;
    }
  }

  /**
   * Log a coin transaction to history
   */
  private static async logTransaction(
    userId: string,
    amount: number,
    reason: string,
    brutoId?: string
  ): Promise<void> {
    try {
      const transaction: ICoinTransaction = {
        id: uuidv4(),
        userId,
        amount,
        reason,
        brutoId,
        createdAt: new Date()
      };

      const result = db.run(
        `INSERT INTO coin_transactions (id, user_id, amount, reason, bruto_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          transaction.id,
          transaction.userId,
          transaction.amount,
          transaction.reason,
          transaction.brutoId || null,
          transaction.createdAt.getTime()
        ]
      );

      if (!result.success) {
        console.warn('[CoinService] Failed to log transaction:', result.error);
        // Don't throw - transaction logging failure shouldn't block coin operations
      }
    } catch (error) {
      console.warn('[CoinService] Error logging transaction:', error);
      // Don't throw - transaction logging failure shouldn't block coin operations
    }
  }

  /**
   * Get transaction history for user
   */
  static async getTransactionHistory(userId: string, limit = 50): Promise<ICoinTransaction[]> {
    try {
      const result = db.query<any>(
        `SELECT * FROM coin_transactions
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      if (!result.success) {
        throw new Error('Failed to query transactions');
      }

      return result.data.map(row => ({
        id: row.id,
        userId: row.user_id,
        amount: row.amount,
        reason: row.reason,
        brutoId: row.bruto_id,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('[CoinService] Error getting transaction history:', error);
      throw error;
    }
  }
}
