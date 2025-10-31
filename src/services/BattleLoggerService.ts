/**
 * BattleLoggerService - Battle Log Persistence (Story 12.1)
 *
 * Saves and manages battle history with automatic cleanup.
 * Keeps last 8 battles per bruto for replay viewing.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/DatabaseManager';
import { IBruto } from '../models/Bruto';

export interface IBrutoSnapshot {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  str: number;
  speed: number;
  agility: number;
  resistance: number;
  appearanceId: number;
  colorVariant: number;
  skills?: string[];
}

export interface ICombatEvent {
  type: 'attack' | 'dodge' | 'crit' | 'damage' | 'ko' | 'start' | 'end';
  turn: number;
  attacker?: string;
  defender?: string;
  damage?: number;
  isCrit?: boolean;
  isDodge?: boolean;
  message: string;
  timestamp?: number;
}

export interface IBattleLog {
  id?: string;
  playerBrutoId: string;
  opponentBrutoId: string;
  winnerId: string | null;
  turnCount: number;
  playerXpGained: number;
  playerHpRemaining: number;
  opponentHpRemaining: number;
  playerBrutoSnapshot: IBrutoSnapshot;
  opponentBrutoSnapshot: IBrutoSnapshot;
  combatLog: ICombatEvent[];
  rngSeed: string;
  foughtAt: Date;
}

export class BattleLoggerService {
  static readonly MAX_BATTLES_PER_BRUTO = 8;

  /**
   * Create bruto snapshot for battle logging
   */
  static createBrutoSnapshot(bruto: IBruto): IBrutoSnapshot {
    return {
      id: bruto.id,
      name: bruto.name,
      level: bruto.level,
      hp: bruto.hp,
      maxHp: bruto.maxHp,
      str: bruto.str,
      speed: bruto.speed,
      agility: bruto.agility,
      resistance: bruto.resistance,
      appearanceId: bruto.appearanceId,
      colorVariant: bruto.colorVariant,
      skills: bruto.skills || [],
    };
  }

  /**
   * Save battle to database and cleanup old battles
   */
  static async saveBattle(battleLog: IBattleLog): Promise<string> {
    try {
      const battleId = battleLog.id || uuidv4();

      const result = db.run(
        `INSERT INTO battles (
          id, player_bruto_id, opponent_bruto_id, winner_id,
          turn_count, player_xp_gained,
          player_hp_remaining, opponent_hp_remaining,
          player_bruto_snapshot, opponent_bruto_snapshot,
          combat_log, rng_seed, fought_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          battleId,
          battleLog.playerBrutoId,
          battleLog.opponentBrutoId,
          battleLog.winnerId,
          battleLog.turnCount,
          battleLog.playerXpGained,
          battleLog.playerHpRemaining,
          battleLog.opponentHpRemaining,
          JSON.stringify(battleLog.playerBrutoSnapshot),
          JSON.stringify(battleLog.opponentBrutoSnapshot),
          JSON.stringify(battleLog.combatLog),
          battleLog.rngSeed,
          battleLog.foughtAt.getTime(),
        ]
      );

      if (!result.success) {
        throw new Error('Failed to save battle');
      }

      // Cleanup old battles for this bruto
      await this.cleanupOldBattles(battleLog.playerBrutoId);

      console.log('[BattleLoggerService] Battle saved:', {
        battleId,
        playerBruto: battleLog.playerBrutoSnapshot.name,
        opponentBruto: battleLog.opponentBrutoSnapshot.name,
        winner: battleLog.winnerId,
      });

      return battleId;
    } catch (error) {
      console.error('[BattleLoggerService] Error saving battle:', error);
      throw error;
    }
  }

  /**
   * Keep only last 8 battles for a bruto
   */
  static async cleanupOldBattles(brutoId: string): Promise<number> {
    try {
      // Get all battles for this bruto, ordered by most recent first
      const battlesResult = db.query<{ id: string; fought_at: number }>(
        `SELECT id, fought_at FROM battles
         WHERE player_bruto_id = ?
         ORDER BY fought_at DESC`,
        [brutoId]
      );

      if (!battlesResult.success) {
        throw new Error('Failed to query battles for cleanup');
      }

      const battles = battlesResult.data;

      // If more than 8, delete the excess
      if (battles.length > this.MAX_BATTLES_PER_BRUTO) {
        const toDelete = battles.slice(this.MAX_BATTLES_PER_BRUTO);
        const deleteIds = toDelete.map(b => b.id);

        const placeholders = deleteIds.map(() => '?').join(',');
        const deleteResult = db.run(
          `DELETE FROM battles WHERE id IN (${placeholders})`,
          deleteIds
        );

        if (!deleteResult.success) {
          console.warn('[BattleLoggerService] Failed to delete old battles:', deleteResult.error);
          return 0;
        }

        console.log('[BattleLoggerService] Cleaned up old battles:', {
          brutoId,
          deleted: deleteIds.length,
          kept: this.MAX_BATTLES_PER_BRUTO,
        });

        return deleteIds.length;
      }

      return 0;
    } catch (error) {
      console.error('[BattleLoggerService] Error during cleanup:', error);
      return 0;
    }
  }

  /**
   * Get battle history for a bruto
   */
  static async getBattlesForBruto(
    brutoId: string,
    limit: number = MAX_BATTLES_PER_BRUTO
  ): Promise<IBattleLog[]> {
    try {
      const result = db.query<any>(
        `SELECT * FROM battles
         WHERE player_bruto_id = ?
         ORDER BY fought_at DESC
         LIMIT ?`,
        [brutoId, limit]
      );

      if (!result.success) {
        throw new Error('Failed to query battles');
      }

      return result.data.map(row => this.mapRowToBattleLog(row));
    } catch (error) {
      console.error('[BattleLoggerService] Error getting battles:', error);
      throw error;
    }
  }

  /**
   * Get a specific battle by ID
   */
  static async getBattleById(battleId: string): Promise<IBattleLog | null> {
    try {
      const result = db.query<any>(
        `SELECT * FROM battles WHERE id = ?`,
        [battleId]
      );

      if (!result.success || result.data.length === 0) {
        return null;
      }

      return this.mapRowToBattleLog(result.data[0]);
    } catch (error) {
      console.error('[BattleLoggerService] Error getting battle:', error);
      throw error;
    }
  }

  /**
   * Map database row to battle log
   */
  private static mapRowToBattleLog(row: any): IBattleLog {
    return {
      id: row.id,
      playerBrutoId: row.player_bruto_id,
      opponentBrutoId: row.opponent_bruto_id,
      winnerId: row.winner_id,
      turnCount: row.turn_count || 0,
      playerXpGained: row.player_xp_gained,
      playerHpRemaining: row.player_hp_remaining,
      opponentHpRemaining: row.opponent_hp_remaining,
      playerBrutoSnapshot: JSON.parse(row.player_bruto_snapshot || '{}'),
      opponentBrutoSnapshot: JSON.parse(row.opponent_bruto_snapshot || '{}'),
      combatLog: JSON.parse(row.combat_log || '[]'),
      rngSeed: row.rng_seed,
      foughtAt: new Date(row.fought_at),
    };
  }

  /**
   * Get battle count for a bruto
   */
  static async getBattleCount(brutoId: string): Promise<number> {
    try {
      const result = db.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM battles WHERE player_bruto_id = ?`,
        [brutoId]
      );

      if (!result.success || result.data.length === 0) {
        return 0;
      }

      return result.data[0].count;
    } catch (error) {
      console.error('[BattleLoggerService] Error getting battle count:', error);
      return 0;
    }
  }
}

// Export constant for use in other files
export const MAX_BATTLES_PER_BRUTO = BattleLoggerService.MAX_BATTLES_PER_BRUTO;
