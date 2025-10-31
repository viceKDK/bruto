/**
 * BaseRepository - Shared repository logic
 * Implements common CRUD operations with Result<T> pattern
 */

import { DatabaseManager } from '../DatabaseManager';
import { Result, ok, err } from '../../utils/result';
import { ErrorCodes } from '../../utils/errors';

export abstract class BaseRepository<T> {
  constructor(protected db: DatabaseManager) {}

  /**
   * Map database row to entity
   */
  protected abstract mapRowToEntity(row: any): T;

  /**
   * Map entity to database row
   */
  protected abstract mapEntityToRow(entity: T): any;

  /**
   * Get table name
   */
  protected abstract getTableName(): string;

  /**
   * Query one row
   */
  protected async queryOne(sql: string, params: any[] = []): Promise<Result<T | null>> {
    const result = this.db.getOne(sql, params);

    if (!result.success) {
      return err(result.error, result.code);
    }

    if (!result.data) {
      return ok(null);
    }

    try {
      const entity = this.mapRowToEntity(result.data);
      return ok(entity);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return err(`Failed to map row to entity: ${message}`, ErrorCodes.DB_QUERY_FAILED);
    }
  }

  /**
   * Query many rows
   */
  protected async queryMany(sql: string, params: any[] = []): Promise<Result<T[]>> {
    const result = this.db.query(sql, params);

    if (!result.success) {
      return err(result.error, result.code);
    }

    try {
      const entities = result.data.map((row) => this.mapRowToEntity(row));
      return ok(entities);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return err(`Failed to map rows to entities: ${message}`, ErrorCodes.DB_QUERY_FAILED);
    }
  }

  /**
   * Execute command (INSERT, UPDATE, DELETE)
   */
  protected async execute(sql: string, params: any[] = []): Promise<Result<void>> {
    return this.db.run(sql, params);
  }
}
