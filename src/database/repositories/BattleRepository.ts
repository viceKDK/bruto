/**
 * BattleRepository - CRUD for battles
 * Handles combat history and replay data
 */

import { BaseRepository } from './BaseRepository';
import { IBattle } from '../../models/Battle';
import { Result, ok } from '../../utils/result';
import { DatabaseManager } from '../DatabaseManager';

export class BattleRepository extends BaseRepository<IBattle> {
  constructor(db: DatabaseManager) {
    super(db);
  }

  protected getTableName(): string {
    return 'battles';
  }

  protected mapRowToEntity(row: any): IBattle {
    return {
      id: row.id,
      playerBrutoId: row.player_bruto_id,
      opponentBrutoId: row.opponent_bruto_id,
      winnerId: row.winner_id,
      playerXpGained: row.player_xp_gained,
      playerHpRemaining: row.player_hp_remaining,
      opponentHpRemaining: row.opponent_hp_remaining,
      combatLog: row.combat_log,
      rngSeed: row.rng_seed,
      foughtAt: new Date(row.fought_at),
    };
  }

  protected mapEntityToRow(battle: IBattle): any {
    return {
      id: battle.id,
      player_bruto_id: battle.playerBrutoId,
      opponent_bruto_id: battle.opponentBrutoId,
      winner_id: battle.winnerId,
      player_xp_gained: battle.playerXpGained,
      player_hp_remaining: battle.playerHpRemaining,
      opponent_hp_remaining: battle.opponentHpRemaining,
      combat_log: battle.combatLog,
      rng_seed: battle.rngSeed,
      fought_at: battle.foughtAt.getTime(),
    };
  }

  /**
   * Record a new battle
   */
  async recordBattle(battle: IBattle): Promise<Result<void>> {
    const row = this.mapEntityToRow(battle);

    const result = await this.execute(
      `INSERT INTO battles (
        id, player_bruto_id, opponent_bruto_id, winner_id,
        player_xp_gained, player_hp_remaining, opponent_hp_remaining,
        combat_log, rng_seed, fought_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        row.id,
        row.player_bruto_id,
        row.opponent_bruto_id,
        row.winner_id,
        row.player_xp_gained,
        row.player_hp_remaining,
        row.opponent_hp_remaining,
        row.combat_log,
        row.rng_seed,
        row.fought_at,
      ]
    );

    if (!result.success) return result;

    console.log(`[BattleRepository] Battle recorded: ${battle.id}`);
    return ok(undefined);
  }

  /**
   * Get last N battles for a bruto
   */
  async getLastBattles(brutoId: string, limit: number = 8): Promise<Result<IBattle[]>> {
    return this.queryMany(
      `SELECT * FROM battles
       WHERE player_bruto_id = ?
       ORDER BY fought_at DESC
       LIMIT ?`,
      [brutoId, limit]
    );
  }

  /**
   * Get battle by ID (for replay)
   */
  async findById(id: string): Promise<Result<IBattle | null>> {
    return this.queryOne(`SELECT * FROM battles WHERE id = ?`, [id]);
  }

  /**
   * Get battle count for a bruto
   */
  async countByBrutoId(brutoId: string): Promise<Result<number>> {
    const result = this.db.getOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM battles WHERE player_bruto_id = ?`,
      [brutoId]
    );

    if (!result.success) {
      return { success: false, error: result.error, code: result.code };
    }

    return ok(result.data?.count || 0);
  }

  /**
   * Get win/loss record for a bruto
   */
  async getRecord(
    brutoId: string
  ): Promise<Result<{ wins: number; losses: number; total: number }>> {
    const result = this.db.query<{ wins: number; losses: number; total: number }>(
      `SELECT
        SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN winner_id != ? OR winner_id IS NULL THEN 1 ELSE 0 END) as losses,
        COUNT(*) as total
       FROM battles
       WHERE player_bruto_id = ?`,
      [brutoId, brutoId, brutoId]
    );

    if (!result.success) {
      return { success: false, error: result.error, code: result.code };
    }

    const data = result.data[0] || { wins: 0, losses: 0, total: 0 };
    return ok(data);
  }
}
