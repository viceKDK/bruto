/**
 * SlotPurchaseService - Bruto Slot Purchase System (Story 11.2)
 *
 * Handles purchasing additional bruto slots with coins.
 * Default: 3 slots, Maximum: 10 slots, Cost: 500 coins per slot
 */

import { CoinService } from './CoinService';
import { db } from '../database/DatabaseManager';
import { useStore } from '../state/store';

export interface ISlotPurchaseValidation {
  canPurchase: boolean;
  reason?: string;
  currentSlots?: number;
  maxSlots?: number;
  price?: number;
  userCoins?: number;
}

export class SlotPurchaseService {
  static readonly SLOT_PRICE = 500;
  static readonly DEFAULT_SLOTS = 3;
  static readonly MAX_SLOTS = 10;

  /**
   * Check if user can purchase an additional bruto slot
   */
  static async canPurchaseSlot(userId: string): Promise<ISlotPurchaseValidation> {
    try {
      // Get user data
      const userResult = db.query<{ bruto_slots: number; coins: number }>(
        'SELECT bruto_slots, coins FROM users WHERE id = ?',
        [userId]
      );

      if (!userResult.success || userResult.data.length === 0) {
        return {
          canPurchase: false,
          reason: 'User not found',
        };
      }

      const user = userResult.data[0];
      const currentSlots = user.bruto_slots;
      const userCoins = user.coins;

      // Check if already at max slots
      if (currentSlots >= this.MAX_SLOTS) {
        return {
          canPurchase: false,
          reason: `Already have maximum slots (${this.MAX_SLOTS})`,
          currentSlots,
          maxSlots: this.MAX_SLOTS,
          userCoins,
        };
      }

      // Check if user has enough coins
      if (userCoins < this.SLOT_PRICE) {
        return {
          canPurchase: false,
          reason: `Insufficient coins (need ${this.SLOT_PRICE}, have ${userCoins})`,
          currentSlots,
          maxSlots: this.MAX_SLOTS,
          price: this.SLOT_PRICE,
          userCoins,
        };
      }

      // Can purchase
      return {
        canPurchase: true,
        currentSlots,
        maxSlots: this.MAX_SLOTS,
        price: this.SLOT_PRICE,
        userCoins,
      };
    } catch (error) {
      console.error('[SlotPurchaseService] Error checking purchase eligibility:', error);
      return {
        canPurchase: false,
        reason: 'Error checking eligibility',
      };
    }
  }

  /**
   * Purchase an additional bruto slot
   * @returns New slot count, or -1 if purchase failed
   */
  static async purchaseSlot(userId: string): Promise<number> {
    try {
      // Validate purchase
      const validation = await this.canPurchaseSlot(userId);

      if (!validation.canPurchase) {
        console.warn('[SlotPurchaseService] Cannot purchase slot:', validation.reason);
        return -1;
      }

      const currentSlots = validation.currentSlots!;
      const newSlots = currentSlots + 1;

      // Spend coins
      const spendSuccess = await CoinService.spendCoins(
        userId,
        this.SLOT_PRICE,
        'SLOT_PURCHASE'
      );

      if (!spendSuccess) {
        console.error('[SlotPurchaseService] Failed to spend coins');
        return -1;
      }

      // Update user slots
      const updateResult = db.run(
        'UPDATE users SET bruto_slots = ? WHERE id = ?',
        [newSlots, userId]
      );

      if (!updateResult.success) {
        console.error('[SlotPurchaseService] Failed to update slots:', updateResult.error);
        // Refund coins (though this shouldn't happen in practice)
        await CoinService.awardCoins(userId, this.SLOT_PRICE, 'ADMIN_ADJUSTMENT');
        return -1;
      }

      // Update store if this is the current user
      const currentUser = useStore.getState().currentUser;
      if (currentUser && currentUser.id === userId) {
        useStore.getState().setCurrentUser({
          ...currentUser,
          brutoSlots: newSlots,
        });
      }

      console.log('[SlotPurchaseService] Slot purchased successfully:', {
        userId,
        oldSlots: currentSlots,
        newSlots,
        coinsSpent: this.SLOT_PRICE,
      });

      return newSlots;
    } catch (error) {
      console.error('[SlotPurchaseService] Error purchasing slot:', error);
      return -1;
    }
  }

  /**
   * Get current slot info for user
   */
  static async getSlotInfo(userId: string): Promise<{
    currentSlots: number;
    maxSlots: number;
    canPurchaseMore: boolean;
    nextSlotPrice: number;
  } | null> {
    try {
      const userResult = db.query<{ bruto_slots: number }>(
        'SELECT bruto_slots FROM users WHERE id = ?',
        [userId]
      );

      if (!userResult.success || userResult.data.length === 0) {
        return null;
      }

      const currentSlots = userResult.data[0].bruto_slots;

      return {
        currentSlots,
        maxSlots: this.MAX_SLOTS,
        canPurchaseMore: currentSlots < this.MAX_SLOTS,
        nextSlotPrice: this.SLOT_PRICE,
      };
    } catch (error) {
      console.error('[SlotPurchaseService] Error getting slot info:', error);
      return null;
    }
  }
}
