/**
 * CoinService Tests (Story 11.1)
 *
 * Tests coin economy: awarding, spending, transaction tracking, and level 10 rewards.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CoinService } from './CoinService';
import { db } from '../database/DatabaseManager';
import { useStore } from '../state/store';

// Mock DatabaseManager
vi.mock('../database/DatabaseManager', () => ({
  db: {
    query: vi.fn(),
    run: vi.fn(),
  },
}));

// Mock store
vi.mock('../state/store', () => ({
  useStore: {
    getState: vi.fn(),
  },
}));

describe('CoinService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mock
    vi.mocked(useStore.getState).mockReturnValue({
      currentUser: null,
      updateUserCoins: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserCoins', () => {
    it('should return user coin balance from database', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 150 }],
      } as any);

      const coins = await CoinService.getUserCoins('user-1');

      expect(coins).toBe(150);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT coins FROM users WHERE id = ?',
        ['user-1']
      );
    });

    it('should throw error when user not found', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      await expect(CoinService.getUserCoins('user-1')).rejects.toThrow('User not found');
    });

    it('should throw error when database query fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: false,
        error: 'Database error',
      } as any);

      await expect(CoinService.getUserCoins('user-1')).rejects.toThrow('Failed to query user coins');
    });
  });

  describe('awardCoins', () => {
    it('should award coins and return new balance', async () => {
      // Mock current balance
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 100 }],
      } as any);

      // Mock update success
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      const newBalance = await CoinService.awardCoins('user-1', 50, 'LEVEL_10_REWARD', 'bruto-1');

      expect(newBalance).toBe(150);
      expect(db.run).toHaveBeenCalledWith(
        'UPDATE users SET coins = ? WHERE id = ?',
        [150, 'user-1']
      );
    });

    it('should log transaction when awarding coins', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 100 }],
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await CoinService.awardCoins('user-1', 100, 'LEVEL_10_REWARD', 'bruto-1');

      // Check that run was called twice: once for update, once for transaction log
      expect(db.run).toHaveBeenCalledTimes(2);

      // Second call should be transaction insert
      const transactionCall = vi.mocked(db.run).mock.calls[1];
      expect(transactionCall[0]).toContain('INSERT INTO coin_transactions');
      expect(transactionCall[1]).toEqual(
        expect.arrayContaining([
          expect.any(String), // id
          'user-1',
          100,
          'LEVEL_10_REWARD',
          'bruto-1',
          expect.any(Number) // timestamp
        ])
      );
    });

    it('should update store when awarding coins to current user', async () => {
      const updateCoinsMock = vi.fn();

      vi.mocked(useStore.getState).mockReturnValue({
        currentUser: { id: 'user-1', username: 'test', coins: 100 },
        updateUserCoins: updateCoinsMock,
      } as any);

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 100 }],
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await CoinService.awardCoins('user-1', 50, 'LEVEL_10_REWARD');

      expect(updateCoinsMock).toHaveBeenCalledWith(150);
    });

    it('should not update store when awarding coins to different user', async () => {
      const updateCoinsMock = vi.fn();

      vi.mocked(useStore.getState).mockReturnValue({
        currentUser: { id: 'user-2', username: 'other', coins: 200 },
        updateUserCoins: updateCoinsMock,
      } as any);

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 100 }],
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await CoinService.awardCoins('user-1', 50, 'LEVEL_10_REWARD');

      expect(updateCoinsMock).not.toHaveBeenCalled();
    });

    it('should throw error when amount is not positive', async () => {
      await expect(CoinService.awardCoins('user-1', 0, 'LEVEL_10_REWARD')).rejects.toThrow(
        'Award amount must be positive'
      );

      await expect(CoinService.awardCoins('user-1', -10, 'LEVEL_10_REWARD')).rejects.toThrow(
        'Award amount must be positive'
      );
    });

    it('should throw error when database update fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 100 }],
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: false,
        error: 'Update failed',
      } as any);

      await expect(CoinService.awardCoins('user-1', 50, 'LEVEL_10_REWARD')).rejects.toThrow(
        'Failed to update user coins'
      );
    });
  });

  describe('spendCoins', () => {
    it('should spend coins when user has sufficient balance', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 500 }],
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      const success = await CoinService.spendCoins('user-1', 100, 'SLOT_PURCHASE');

      expect(success).toBe(true);
      expect(db.run).toHaveBeenCalledWith(
        'UPDATE users SET coins = ? WHERE id = ?',
        [400, 'user-1']
      );
    });

    it('should return false when user has insufficient balance', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 50 }],
      } as any);

      const success = await CoinService.spendCoins('user-1', 100, 'SLOT_PURCHASE');

      expect(success).toBe(false);
      expect(db.run).not.toHaveBeenCalled();
    });

    it('should log negative transaction when spending coins', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 500 }],
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await CoinService.spendCoins('user-1', 100, 'SLOT_PURCHASE');

      // Second call should be transaction insert with negative amount
      const transactionCall = vi.mocked(db.run).mock.calls[1];
      expect(transactionCall[1]).toEqual(
        expect.arrayContaining([
          expect.any(String), // id
          'user-1',
          -100, // Negative for spending
          'SLOT_PURCHASE',
          null,
          expect.any(Number) // timestamp
        ])
      );
    });

    it('should update store when spending coins for current user', async () => {
      const updateCoinsMock = vi.fn();

      vi.mocked(useStore.getState).mockReturnValue({
        currentUser: { id: 'user-1', username: 'test', coins: 500 },
        updateUserCoins: updateCoinsMock,
      } as any);

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ coins: 500 }],
      } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await CoinService.spendCoins('user-1', 100, 'SLOT_PURCHASE');

      expect(updateCoinsMock).toHaveBeenCalledWith(400);
    });

    it('should throw error when amount is not positive', async () => {
      await expect(CoinService.spendCoins('user-1', 0, 'SLOT_PURCHASE')).rejects.toThrow(
        'Spend amount must be positive'
      );

      await expect(CoinService.spendCoins('user-1', -10, 'SLOT_PURCHASE')).rejects.toThrow(
        'Spend amount must be positive'
      );
    });
  });

  describe('hasReceivedLevel10Reward', () => {
    it('should return true when bruto has received reward', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ level_10_coin_rewarded: 1 }],
      } as any);

      const hasReceived = await CoinService.hasReceivedLevel10Reward('bruto-1');

      expect(hasReceived).toBe(true);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT level_10_coin_rewarded FROM brutos WHERE id = ?',
        ['bruto-1']
      );
    });

    it('should return false when bruto has not received reward', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ level_10_coin_rewarded: 0 }],
      } as any);

      const hasReceived = await CoinService.hasReceivedLevel10Reward('bruto-1');

      expect(hasReceived).toBe(false);
    });

    it('should throw error when bruto not found', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      await expect(CoinService.hasReceivedLevel10Reward('bruto-1')).rejects.toThrow('Bruto not found');
    });
  });

  describe('markLevel10RewardGiven', () => {
    it('should mark bruto as having received level 10 reward', async () => {
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await CoinService.markLevel10RewardGiven('bruto-1');

      expect(db.run).toHaveBeenCalledWith(
        'UPDATE brutos SET level_10_coin_rewarded = 1 WHERE id = ?',
        ['bruto-1']
      );
    });

    it('should throw error when update fails', async () => {
      vi.mocked(db.run).mockReturnValue({
        success: false,
        error: 'Update failed',
      } as any);

      await expect(CoinService.markLevel10RewardGiven('bruto-1')).rejects.toThrow(
        'Failed to mark level 10 reward'
      );
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history for user', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          user_id: 'user-1',
          amount: 100,
          reason: 'LEVEL_10_REWARD',
          bruto_id: 'bruto-1',
          created_at: Date.now(),
        },
        {
          id: 'tx-2',
          user_id: 'user-1',
          amount: -500,
          reason: 'SLOT_PURCHASE',
          bruto_id: null,
          created_at: Date.now(),
        },
      ];

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: mockTransactions,
      } as any);

      const history = await CoinService.getTransactionHistory('user-1');

      expect(history).toHaveLength(2);
      expect(history[0].amount).toBe(100);
      expect(history[1].amount).toBe(-500);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM coin_transactions'),
        ['user-1', 50]
      );
    });

    it('should respect custom limit parameter', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      await CoinService.getTransactionHistory('user-1', 10);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT ?'),
        ['user-1', 10]
      );
    });

    it('should throw error when query fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: false,
        error: 'Query failed',
      } as any);

      await expect(CoinService.getTransactionHistory('user-1')).rejects.toThrow(
        'Failed to query transactions'
      );
    });
  });

  describe('Integration: Level 10 Reward Flow', () => {
    it('should complete full level 10 reward flow', async () => {
      // Initial state: bruto hasn't received reward
      vi.mocked(db.query)
        .mockReturnValueOnce({
          success: true,
          data: [{ level_10_coin_rewarded: 0 }],
        } as any)
        // User has 0 coins
        .mockReturnValueOnce({
          success: true,
          data: [{ coins: 0 }],
        } as any);

      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      // Check reward status
      const hasReceived = await CoinService.hasReceivedLevel10Reward('bruto-1');
      expect(hasReceived).toBe(false);

      // Award coins
      const newBalance = await CoinService.awardCoins('user-1', 100, 'LEVEL_10_REWARD', 'bruto-1');
      expect(newBalance).toBe(100);

      // Mark reward given
      await CoinService.markLevel10RewardGiven('bruto-1');

      // Verify all operations completed
      expect(db.run).toHaveBeenCalledWith(
        'UPDATE users SET coins = ? WHERE id = ?',
        [100, 'user-1']
      );
      expect(db.run).toHaveBeenCalledWith(
        'UPDATE brutos SET level_10_coin_rewarded = 1 WHERE id = ?',
        ['bruto-1']
      );
    });
  });
});
