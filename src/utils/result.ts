/**
 * Result Pattern
 * Type-safe error handling for async operations
 * Following architecture specifications from Section 9
 */

export type Result<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Create a successful result
 */
export function ok<T>(data: T): Result<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Create a failed result
 */
export function err<T>(error: string, code?: string): Result<T> {
  return {
    success: false,
    error,
    code,
  };
}

/**
 * Helper to unwrap Result or throw
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error);
}
