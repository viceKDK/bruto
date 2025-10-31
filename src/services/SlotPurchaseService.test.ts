/**
 * SlotPurchaseService Tests (Story 11.2)
 *
 * Tests bruto slot purchasing system with 500 coin price and 10 slot maximum.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SlotPurchaseService } from './SlotPurchaseService';
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

// Mock CoinService
vi.mock('./CoinService', () => ({
  CoinService: {
    spendCoins: vi.fn(),
    awardCoins: vi.fn(),
  },
}));

// Mock store
vi.mock('../state/store', () => ({
  useStore: {
    getState: vi.fn(),
  },
}));

describe('SlotPurchaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default store mock
    vi.mocked(useStore.getState).mockReturnValue({
      currentUser: null,
      setCurrentUser: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should have correct slot configuration', () => {
      expect(SlotPurchaseService.SLOT_PRICE).toBe(500);
      expect(SlotPurchaseService.DEFAULT_SLOTS).toBe(3);
      expect(SlotPurchaseService.MAX_SLOTS).toBe(10);
    });
  });

  describe('canPurchaseSlot', () => {
    it('should allow purchase when user has enough coins and room for more slots', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 600 }],
      } as any);

      const result = await SlotPurchaseService.canPurchaseSlot('user-1');

      expect(result.canPurchase).toBe(true);
      expect(result.currentSlots).toBe(3);
      expect(result.maxSlots).toBe(10);
      expect(result.price).toBe(500);
      expect(result.userCoins).toBe(600);
    });

    it('should deny purchase when user has insufficient coins', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 300 }],
      } as any);

      const result = await SlotPurchaseService.canPurchaseSlot('user-1');

      expect(result.canPurchase).toBe(false);
      expect(result.reason).toContain('Insufficient coins');
      expect(result.reason).toContain('need 500');
      expect(result.reason).toContain('have 300');
    });

    it('should deny purchase when user already has max slots', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 10, coins: 1000 }],
      } as any);

      const result = await SlotPurchaseService.canPurchaseSlot('user-1');

      expect(result.canPurchase).toBe(false);
      expect(result.reason).toContain('Already have maximum slots');
      expect(result.reason).toContain('10');
    });

    it('should deny purchase when user not found', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      const result = await SlotPurchaseService.canPurchaseSlot('user-1');

      expect(result.canPurchase).toBe(false);
      expect(result.reason).toBe('User not found');
    });

    it('should deny purchase when database query fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: false,
        error: 'Database error',
      } as any);

      const result = await SlotPurchaseService.canPurchaseSlot('user-1');

      expect(result.canPurchase).toBe(false);
      expect(result.reason).toBe('User not found');
    });

    it('should handle user with exactly 500 coins (edge case)', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 500 }],
      } as any);

      const result = await SlotPurchaseService.canPurchaseSlot('user-1');

      expect(result.canPurchase).toBe(true);
      expect(result.userCoins).toBe(500);
    });

    it('should handle user with 9 slots (one away from max)', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 9, coins: 600 }],
      } as any);

      const result = await SlotPurchaseService.canPurchaseSlot('user-1');

      expect(result.canPurchase).toBe(true);
      expect(result.currentSlots).toBe(9);
    });
  });

  describe('purchaseSlot', () => {
    it('should successfully purchase slot when eligible', async () => {
      // Mock validation check
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 600 }],
      } as any);

      // Mock successful coin spend
      vi.mocked(CoinService.spendCoins).mockResolvedValue(true);

      // Mock successful slot update
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      const newSlots = await SlotPurchaseService.purchaseSlot('user-1');

      expect(newSlots).toBe(4);
      expect(CoinService.spendCoins).toHaveBeenCalledWith('user-1', 500, 'SLOT_PURCHASE');
      expect(db.run).toHaveBeenCalledWith(
        'UPDATE users SET bruto_slots = ? WHERE id = ?',
        [4, 'user-1']
      );
    });

    it('should return -1 when user cannot purchase', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 10, coins: 1000 }], // Already at max
      } as any);

      const newSlots = await SlotPurchaseService.purchaseSlot('user-1');

      expect(newSlots).toBe(-1);
      expect(CoinService.spendCoins).not.toHaveBeenCalled();
    });

    it('should return -1 when coin spending fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 600 }],
      } as any);

      // Mock failed coin spend (insufficient funds at transaction time)
      vi.mocked(CoinService.spendCoins).mockResolvedValue(false);

      const newSlots = await SlotPurchaseService.purchaseSlot('user-1');

      expect(newSlots).toBe(-1);
      expect(db.run).not.toHaveBeenCalled();
    });

    it('should refund coins when database update fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 600 }],
      } as any);

      vi.mocked(CoinService.spendCoins).mockResolvedValue(true);

      // Mock failed database update
      vi.mocked(db.run).mockReturnValue({
        success: false,
        error: 'Update failed',
      } as any);

      const newSlots = await SlotPurchaseService.purchaseSlot('user-1');

      expect(newSlots).toBe(-1);
      // Should refund coins
      expect(CoinService.awardCoins).toHaveBeenCalledWith('user-1', 500, 'ADMIN_ADJUSTMENT');
    });

    it('should update store when purchasing for current user', async () => {
      const setCurrentUserMock = vi.fn();

      vi.mocked(useStore.getState).mockReturnValue({
        currentUser: { id: 'user-1', username: 'test', brutoSlots: 3 },
        setCurrentUser: setCurrentUserMock,
      } as any);

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 600 }],
      } as any);

      vi.mocked(CoinService.spendCoins).mockResolvedValue(true);
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await SlotPurchaseService.purchaseSlot('user-1');

      expect(setCurrentUserMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          brutoSlots: 4,
        })
      );
    });

    it('should not update store when purchasing for different user', async () => {
      const setCurrentUserMock = vi.fn();

      vi.mocked(useStore.getState).mockReturnValue({
        currentUser: { id: 'user-2', username: 'other', brutoSlots: 3 },
        setCurrentUser: setCurrentUserMock,
      } as any);

      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 3, coins: 600 }],
      } as any);

      vi.mocked(CoinService.spendCoins).mockResolvedValue(true);
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      await SlotPurchaseService.purchaseSlot('user-1');

      expect(setCurrentUserMock).not.toHaveBeenCalled();
    });

    it('should handle purchasing multiple slots sequentially', async () => {
      // First purchase (3 -> 4)
      vi.mocked(db.query).mockReturnValueOnce({
        success: true,
        data: [{ bruto_slots: 3, coins: 1500 }],
      } as any);

      vi.mocked(CoinService.spendCoins).mockResolvedValue(true);
      vi.mocked(db.run).mockReturnValue({
        success: true,
      } as any);

      const slots1 = await SlotPurchaseService.purchaseSlot('user-1');
      expect(slots1).toBe(4);

      // Second purchase (4 -> 5)
      vi.mocked(db.query).mockReturnValueOnce({
        success: true,
        data: [{ bruto_slots: 4, coins: 1000 }],
      } as any);

      const slots2 = await SlotPurchaseService.purchaseSlot('user-1');
      expect(slots2).toBe(5);

      // Third purchase (5 -> 6)
      vi.mocked(db.query).mockReturnValueOnce({
        success: true,
        data: [{ bruto_slots: 5, coins: 500 }],
      } as any);

      const slots3 = await SlotPurchaseService.purchaseSlot('user-1');
      expect(slots3).toBe(6);

      expect(CoinService.spendCoins).toHaveBeenCalledTimes(3);
    });
  });

  describe('getSlotInfo', () => {
    it('should return current slot information', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 5 }],
      } as any);

      const info = await SlotPurchaseService.getSlotInfo('user-1');

      expect(info).toEqual({
        currentSlots: 5,
        maxSlots: 10,
        canPurchaseMore: true,
        nextSlotPrice: 500,
      });
    });

    it('should indicate when user is at max slots', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [{ bruto_slots: 10 }],
      } as any);

      const info = await SlotPurchaseService.getSlotInfo('user-1');

      expect(info?.canPurchaseMore).toBe(false);
      expect(info?.currentSlots).toBe(10);
    });

    it('should return null when user not found', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: true,
        data: [],
      } as any);

      const info = await SlotPurchaseService.getSlotInfo('user-1');

      expect(info).toBeNull();
    });

    it('should return null when database query fails', async () => {
      vi.mocked(db.query).mockReturnValue({
        success: false,
        error: 'Database error',
      } as any);

      const info = await SlotPurchaseService.getSlotInfo('user-1');

      expect(info).toBeNull();
    });
  });

  describe('Integration: Full Slot Purchase Flow', () => {
    it('should complete full purchase flow from 3 to 10 slots', async () => {
      // User starts with 3 slots and 3500 coins (enough for 7 purchases)
      for (let currentSlots = 3; currentSlots < 10; currentSlots++) {
        vi.mocked(db.query).mockReturnValueOnce({
          success: true,
          data: [{ bruto_slots: currentSlots, coins: (10 - currentSlots) * 500 }],
        } as any);

        vi.mocked(CoinService.spendCoins).mockResolvedValue(true);
        vi.mocked(db.run).mockReturnValue({
          success: true,
        } as any);

        const newSlots = await SlotPurchaseService.purchaseSlot('user-1');
        expect(newSlots).toBe(currentSlots + 1);
      }

      // Now at max, should not be able to purchase
      vi.mocked(db.query).mockReturnValueOnce({
        success: true,
        data: [{ bruto_slots: 10, coins: 1000 }],
      } as any);

      const validation = await SlotPurchaseService.canPurchaseSlot('user-1');
      expect(validation.canPurchase).toBe(false);
      expect(validation.reason).toContain('maximum slots');
    });
  });
});
