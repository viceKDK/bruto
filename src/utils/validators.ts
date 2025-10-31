/**
 * Validators - Input validation utilities
 * Validates usernames, passwords, and other inputs
 */

import { Result, ok, err } from './result';
import { ErrorCodes } from './errors';

export class Validators {
  /**
   * Validate username requirements
   * - Accepts email format or simple username
   * - 3+ characters
   */
  static validateUsername(username: string): Result<true> {
    if (!username || username.trim().length === 0) {
      return err('El email es requerido', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    if (username.length < 3) {
      return err('El email debe tener al menos 3 caracteres', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      return err('Por favor ingresa un email válido', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    return ok(true);
  }

  /**
   * Validate password requirements
   * - 6+ characters
   */
  static validatePassword(password: string): Result<true> {
    if (!password || password.length === 0) {
      return err('Password is required', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    if (password.length < 6) {
      return err('Password must be at least 6 characters', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    return ok(true);
  }

  /**
   * Validate bruto name requirements
   * - 2-20 characters
   * - Letters, numbers, spaces, apostrophes, and hyphens allowed
   */
  static validateBrutoName(name: string): Result<true> {
    if (!name || name.trim().length === 0) {
      return err('Bruto name is required', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return err('Bruto name must be at least 2 characters', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    if (trimmed.length > 20) {
      return err('Bruto name must be at most 20 characters', ErrorCodes.VALIDATION_INVALID_INPUT);
    }

    const nameRegex = /^[a-zA-Z0-9 '\-]+$/;
    if (!nameRegex.test(trimmed)) {
      return err(
        'Bruto name can contain letters, numbers, spaces, apostrophes, and hyphens',
        ErrorCodes.VALIDATION_INVALID_INPUT
      );
    }

    return ok(true);
  }
}
