/**
 * Game Error Handling
 * Centralized error class and error codes following architecture specifications
 */

export class GameError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'GameError';
  }
}

// Error codes format: COMPONENT_ERROR_TYPE
export const ErrorCodes = {
  // Database errors
  DB_INIT_FAILED: 'DB_INIT_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_NOT_FOUND: 'DB_NOT_FOUND',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  DB_MIGRATION_FAILED: 'DB_MIGRATION_FAILED',

  // Combat errors
  COMBAT_INVALID_TARGET: 'COMBAT_INVALID_TARGET',
  COMBAT_BRUTO_DEFEATED: 'COMBAT_BRUTO_DEFEATED',

  // Validation errors
  VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',

  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_EXISTS: 'AUTH_USER_EXISTS',
  AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
  AUTH_HASH_FAILED: 'AUTH_HASH_FAILED',
  AUTH_VERIFICATION_FAILED: 'AUTH_VERIFICATION_FAILED',

  // Gameplay
  GAMEPLAY_DAILY_LIMIT_REACHED: 'GAMEPLAY_DAILY_LIMIT_REACHED',

  // Skills
  SKILL_NOT_FOUND: 'SKILL_NOT_FOUND',
  SKILL_DUPLICATE: 'SKILL_DUPLICATE',
  SKILL_CONFLICT: 'SKILL_CONFLICT',
  SKILL_LIMIT_EXCEEDED: 'SKILL_LIMIT_EXCEEDED',
  SKILL_NOT_STACKABLE: 'SKILL_NOT_STACKABLE',
} as const;
