/**
 * AuthService - Password hashing and verification
 * Uses bcryptjs for client-side password security
 */

import bcrypt from 'bcryptjs';
import { Result, ok, err } from './result';
import { ErrorCodes } from './errors';

export class AuthService {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a password using bcryptjs
   */
  static async hashPassword(password: string): Promise<Result<string>> {
    try {
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      return ok(hash);
    } catch (error) {
      return err('Failed to hash password', ErrorCodes.AUTH_HASH_FAILED);
    }
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<Result<boolean>> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      return ok(isValid);
    } catch (error) {
      return err('Failed to verify password', ErrorCodes.AUTH_VERIFICATION_FAILED);
    }
  }
}
