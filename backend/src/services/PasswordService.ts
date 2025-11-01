/**
 * PasswordService - Secure password hashing and verification using bcrypt
 * 
 * Security Features:
 * - Bcrypt with salt rounds = 12 (stronger than default 10)
 * - Constant-time comparison to prevent timing attacks
 * - Password strength validation
 * - Rate limiting recommendations (to be implemented in middleware)
 * 
 * @example
 * const hashedPassword = await PasswordService.hash('myPassword123');
 * const isValid = await PasswordService.verify('myPassword123', hashedPassword);
 */

import bcrypt from 'bcrypt';

export interface PasswordStrength {
  isValid: boolean;
  errors: string[];
  score: number; // 0-5 (0=very weak, 5=very strong)
}

export class PasswordService {
  // Salt rounds: Higher = more secure but slower (12 is recommended for 2025)
  private static readonly SALT_ROUNDS = 12;
  
  // Minimum password length
  private static readonly MIN_LENGTH = 8;
  
  // Maximum password length (prevent DoS attacks)
  private static readonly MAX_LENGTH = 72; // Bcrypt limitation

  /**
   * Hash a password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password (60 characters)
   */
  public static async hash(password: string): Promise<string> {
    if (!password || password.length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (password.length > this.MAX_LENGTH) {
      throw new Error(`Password cannot exceed ${this.MAX_LENGTH} characters`);
    }

    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash (constant-time comparison)
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns True if password matches hash
   */
  public static async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('[PasswordService] Verification error:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Validation result with errors and strength score
   */
  public static validateStrength(password: string): PasswordStrength {
    const errors: string[] = [];
    let score = 0;

    // Check length
    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters`);
    } else {
      score += 1;
      if (password.length >= 12) score += 1; // Bonus for longer passwords
    }

    if (password && password.length > this.MAX_LENGTH) {
      errors.push(`Password cannot exceed ${this.MAX_LENGTH} characters`);
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Check for special characters (optional but recommended)
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1; // Bonus for special characters
    }

    // Check for common patterns (weak passwords)
    const weakPatterns = [
      /^123456/,
      /^password/i,
      /^qwerty/i,
      /^admin/i,
      /^letmein/i,
      /(.)\1{2,}/, // Repeated characters (aaa, 111, etc.)
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains common patterns or repeated characters');
        score = Math.max(0, score - 2); // Penalty
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(5, Math.max(0, score)),
    };
  }

  /**
   * Check if password needs rehashing (if salt rounds changed)
   * @param hash - Existing password hash
   * @returns True if password should be rehashed
   */
  public static needsRehash(hash: string): boolean {
    try {
      const rounds = bcrypt.getRounds(hash);
      return rounds < this.SALT_ROUNDS;
    } catch (error) {
      console.error('[PasswordService] Rehash check error:', error);
      return false;
    }
  }

  /**
   * Generate a random password (for testing/temporary passwords)
   * @param length - Password length (default 16)
   * @returns Random secure password
   */
  public static generateRandom(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}';
    const all = lowercase + uppercase + numbers + special;

    let password = '';
    
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
