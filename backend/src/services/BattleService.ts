import { db } from '../database/connection';
import { randomUUID } from 'crypto';

const MAX_BATTLES_PER_BRUTO = 7;

export class BattleService {
  /**
   * Save a battle and automatically clean old battles
   */
  static saveBattle(battle: {
    bruto1_id: string;
    bruto2_id: string;
    winner_id: string | null;
    turn_count: number;
    battle_log: any;
  }): string {
    const battleId = randomUUID();
    const now = new Date().toISOString();

    // Save new battle
    db.prepare(`
      INSERT INTO battles (id, bruto1_id, bruto2_id, winner_id, turn_count, battle_log, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      battleId,
      battle.bruto1_id,
      battle.bruto2_id,
      battle.winner_id,
      battle.turn_count,
      JSON.stringify(battle.battle_log),
      now
    );

    // Clean old battles for both brutos
    this.cleanOldBattles(battle.bruto1_id);
    this.cleanOldBattles(battle.bruto2_id);

    return battleId;
  }

  /**
   * Delete battles older than the last 7 for a specific bruto
   */
  private static cleanOldBattles(brutoId: string): void {
    // Get battles for this bruto, ordered by date (newest first)
    const battles = db.prepare(`
      SELECT id FROM battles 
      WHERE bruto1_id = ? OR bruto2_id = ?
      ORDER BY created_at DESC
    `).all(brutoId, brutoId) as { id: string }[];

    // If more than 7 battles, delete the oldest ones
    if (battles.length > MAX_BATTLES_PER_BRUTO) {
      const battlesToDelete = battles.slice(MAX_BATTLES_PER_BRUTO);
      const idsToDelete = battlesToDelete.map(b => b.id);

      if (idsToDelete.length > 0) {
        const placeholders = idsToDelete.map(() => '?').join(',');
        db.prepare(`DELETE FROM battles WHERE id IN (${placeholders})`).run(...idsToDelete);
        
        console.log(`[BattleService] Deleted ${idsToDelete.length} old battles for bruto ${brutoId}`);
      }
    }
  }

  /**
   * Get last N battles for a bruto
   */
  static getBattlesForBruto(brutoId: string, limit: number = MAX_BATTLES_PER_BRUTO): any[] {
    const battles = db.prepare(`
      SELECT * FROM battles 
      WHERE bruto1_id = ? OR bruto2_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(brutoId, brutoId, limit);

    return battles.map((b: any) => ({
      id: b.id,
      bruto1Id: b.bruto1_id,
      bruto2Id: b.bruto2_id,
      winnerId: b.winner_id,
      turnCount: b.turn_count,
      battleLog: b.battle_log ? JSON.parse(b.battle_log) : null,
      createdAt: b.created_at
    }));
  }

  /**
   * Get battle count for a bruto
   */
  static getBattleCount(brutoId: string): number {
    const result = db.prepare(`
      SELECT COUNT(*) as count FROM battles 
      WHERE bruto1_id = ? OR bruto2_id = ?
    `).get(brutoId, brutoId) as { count: number };

    return result.count;
  }
}
