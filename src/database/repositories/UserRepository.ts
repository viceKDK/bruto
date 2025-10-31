/**
 * UserRepository - CRUD for users
 * Handles user authentication and profile management
 */

import { BaseRepository } from './BaseRepository';
import { IUser } from '../../models/User';
import { Result, ok, err } from '../../utils/result';
import { ErrorCodes } from '../../utils/errors';
import { DatabaseManager } from '../DatabaseManager';

export class UserRepository extends BaseRepository<IUser> {
  constructor(db: DatabaseManager) {
    super(db);
  }

  protected getTableName(): string {
    return 'users';
  }

  protected mapRowToEntity(row: any): IUser {
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      coins: row.coins,
      brutoSlots: row.bruto_slots,
      createdAt: new Date(row.created_at),
      lastLogin: row.last_login ? new Date(row.last_login) : undefined,
    };
  }

  protected mapEntityToRow(user: IUser): any {
    return {
      id: user.id,
      username: user.username,
      password_hash: user.passwordHash,
      coins: user.coins,
      bruto_slots: user.brutoSlots,
      created_at: user.createdAt.getTime(),
      last_login: user.lastLogin?.getTime() || null,
    };
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<Result<IUser | null>> {
    return this.queryOne(`SELECT * FROM users WHERE id = ?`, [id]);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<Result<IUser | null>> {
    return this.queryOne(`SELECT * FROM users WHERE username = ?`, [username]);
  }

  /**
   * Create new user
   */
  async create(user: IUser): Promise<Result<void>> {
    const row = this.mapEntityToRow(user);

    const result = await this.execute(
      `INSERT INTO users (id, username, password_hash, coins, bruto_slots, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [row.id, row.username, row.password_hash, row.coins, row.bruto_slots, row.created_at, row.last_login]
    );

    if (!result.success) {
      if (result.error.includes('UNIQUE constraint')) {
        return err('Username already exists', ErrorCodes.AUTH_USER_EXISTS);
      }
      return result;
    }

    console.log(`[UserRepository] User created: ${user.username}`);
    return ok(undefined);
  }

  /**
   * Update user
   */
  async update(user: IUser): Promise<Result<void>> {
    const row = this.mapEntityToRow(user);

    const result = await this.execute(
      `UPDATE users
       SET username = ?, password_hash = ?, coins = ?, bruto_slots = ?, last_login = ?
       WHERE id = ?`,
      [row.username, row.password_hash, row.coins, row.bruto_slots, row.last_login, row.id]
    );

    if (!result.success) return result;

    console.log(`[UserRepository] User updated: ${user.id}`);
    return ok(undefined);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<Result<void>> {
    return this.execute(`UPDATE users SET last_login = ? WHERE id = ?`, [Date.now(), userId]);
  }

  /**
   * Update coins
   */
  async updateCoins(userId: string, coins: number): Promise<Result<void>> {
    return this.execute(`UPDATE users SET coins = ? WHERE id = ?`, [coins, userId]);
  }

  /**
   * Update bruto slots
   */
  async updateBrutoSlots(userId: string, slots: number): Promise<Result<void>> {
    return this.execute(`UPDATE users SET bruto_slots = ? WHERE id = ?`, [slots, userId]);
  }

  /**
   * Delete user
   */
  async delete(userId: string): Promise<Result<void>> {
    const result = await this.execute(`DELETE FROM users WHERE id = ?`, [userId]);

    if (!result.success) return result;

    console.log(`[UserRepository] User deleted: ${userId}`);
    return ok(undefined);
  }
}
