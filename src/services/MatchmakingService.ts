/**
 * MatchmakingService - Opponent Matchmaking Pool (Story 9.1)
 * 
 * Finds eligible opponents for battle from local database.
 * Implements ghost battle system with same-level matching.
 */

import { IBruto } from '../models/Bruto';
import { BrutoRepository } from '../database/repositories/BrutoRepository';
import { DatabaseManager } from '../database/DatabaseManager';
import { Result, ok, err } from '../utils/result';
import { ErrorCodes } from '../utils/errors';

export interface IOpponentPool {
  opponents: IBruto[];
  totalAvailable: number;
  requestedCount: number;
}

export class MatchmakingService {
  /**
   * Find opponents for battle at same level
   * AC #1: Only show opponents with exact same level, exclude own brutos
   * AC #2: Return up to 5 random opponents
   * AC #4: Query database with filtering
   * 
   * @param brutoLevel - Level of player's bruto
   * @param currentUserId - Current user ID to exclude their brutos
   * @param count - Number of opponents to return (default 5)
   * @returns Opponent pool with randomized selection
   */
  static async findOpponents(
    brutoLevel: number,
    currentUserId: string,
    count: number = 5
  ): Promise<Result<IOpponentPool>> {
    try {
      const db = DatabaseManager.getInstance();
      const repo = new BrutoRepository(db);

      // AC #4: Database query filtering by level and excluding current user
      const query = `
        SELECT * FROM brutos 
        WHERE level = ? 
          AND user_id != ?
        ORDER BY RANDOM()
      `;

      const result = await repo['queryMany'](query, [brutoLevel, currentUserId]);

      if (!result.success) {
        return err(result.error, result.code);
      }

      const allEligible = result.data;

      // AC #5: Handle case when no opponents available
      if (allEligible.length === 0) {
        console.log(`[MatchmakingService] No opponents found at level ${brutoLevel}`);
        return ok({
          opponents: [],
          totalAvailable: 0,
          requestedCount: count,
        });
      }

      // AC #2: Return up to 'count' opponents (default 5)
      // If less than count available, return all
      const selectedOpponents = allEligible.slice(0, Math.min(count, allEligible.length));

      // AC #3: Attach skills to create complete snapshot (ghost battle system)
      const opponentsWithSkills = await this.attachSkillsToOpponents(repo, selectedOpponents);

      if (!opponentsWithSkills.success) {
        return err(opponentsWithSkills.error, opponentsWithSkills.code);
      }

      console.log(`[MatchmakingService] Found ${allEligible.length} eligible opponents, returning ${selectedOpponents.length}`);

      return ok({
        opponents: opponentsWithSkills.data,
        totalAvailable: allEligible.length,
        requestedCount: count,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[MatchmakingService] Error finding opponents:', message);
      return err(`Failed to find opponents: ${message}`, ErrorCodes.DB_QUERY_FAILED);
    }
  }

  /**
   * Attach skills to opponent brutos for complete snapshot
   * AC #3: Ghost battle system with frozen stats/skills
   */
  private static async attachSkillsToOpponents(
    repo: BrutoRepository,
    brutos: IBruto[]
  ): Promise<Result<IBruto[]>> {
    try {
      // Use repository's attachSkills method
      const result = await repo['attachSkills'](brutos);
      
      if (!result.success) {
        return err(result.error, result.code);
      }

      return ok(result.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(`Failed to attach skills: ${message}`, ErrorCodes.DB_QUERY_FAILED);
    }
  }

  /**
   * Count total eligible opponents at level (for UI display)
   */
  static async countOpponentsAtLevel(
    brutoLevel: number,
    currentUserId: string
  ): Promise<Result<number>> {
    try {
      const db = DatabaseManager.getInstance();
      const repo = new BrutoRepository(db);

      const query = `
        SELECT COUNT(*) as count FROM brutos 
        WHERE level = ? 
          AND user_id != ?
      `;

      const result = await repo['queryOne'](query, [brutoLevel, currentUserId]);

      if (!result.success) {
        return err(result.error, result.code);
      }

      const count = (result.data as any)?.count || 0;
      return ok(count);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(`Failed to count opponents: ${message}`, ErrorCodes.DB_QUERY_FAILED);
    }
  }
}
