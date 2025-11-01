/**
 * PasswordService Tests
 * 
 * Tests for secure password hashing and validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PasswordService } from './PasswordService';

describe('PasswordService', () => {
  describe('hash', () => {
    it('should hash a valid password', async () => {
      const password = 'MySecurePass123!';
      const hash = await PasswordService.hash(password);
      
      expect(hash).toBeDefined();
      expect(hash.length).toBe(60); // Bcrypt hash is always 60 characters
      expect(hash).not.toBe(password); // Hash should not equal plain text
      expect(hash.startsWith('$2b$')).toBe(true); // Bcrypt format
    });

    it('should generate different hashes for same password (salted)', async () => {
      const password = 'SamePassword123!';
      const hash1 = await PasswordService.hash(password);
      const hash2 = await PasswordService.hash(password);
      
      expect(hash1).not.toBe(hash2); // Different salts = different hashes
    });

    it('should throw error for empty password', async () => {
      await expect(PasswordService.hash('')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for password exceeding max length', async () => {
      const longPassword = 'a'.repeat(73); // 73 characters (max is 72)
      await expect(PasswordService.hash(longPassword)).rejects.toThrow('cannot exceed 72 characters');
    });
  });

  describe('verify', () => {
    it('should verify correct password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await PasswordService.hash(password);
      
      const isValid = await PasswordService.verify(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await PasswordService.hash(password);
      
      const isValid = await PasswordService.verify('WrongPassword456!', hash);
      expect(isValid).toBe(false);
    });

    it('should reject case-sensitive password', async () => {
      const password = 'CaseSensitive123!';
      const hash = await PasswordService.hash(password);
      
      const isValid = await PasswordService.verify('casesensitive123!', hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await PasswordService.hash('ValidPassword123!');
      const isValid = await PasswordService.verify('', hash);
      expect(isValid).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const isValid = await PasswordService.verify('ValidPassword123!', '');
      expect(isValid).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const isValid = await PasswordService.verify('ValidPassword123!', 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('validateStrength', () => {
    it('should accept strong password (score 5)', () => {
      const result = PasswordService.validateStrength('StrongPass123!@#');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThanOrEqual(5);
    });

    it('should reject password too short', () => {
      const result = PasswordService.validateStrength('Short1!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should reject password without lowercase', () => {
      const result = PasswordService.validateStrength('UPPERCASE123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without uppercase', () => {
      const result = PasswordService.validateStrength('lowercase123!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without number', () => {
      const result = PasswordService.validateStrength('NoNumbersHere!');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should accept password without special characters (optional)', () => {
      const result = PasswordService.validateStrength('ValidPass123');
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeLessThan(5); // Lower score without special chars
    });

    it('should reject common weak passwords', () => {
      const weakPasswords = [
        '12345678Aa',
        'Password123',
        'Qwerty123',
        'Admin1234',
      ];

      weakPasswords.forEach(password => {
        const result = PasswordService.validateStrength(password);
        expect(result.errors.some(e => e.includes('common patterns'))).toBe(true);
      });
    });

    it('should reject password with repeated characters', () => {
      const result = PasswordService.validateStrength('Aaaa1111!');
      
      expect(result.errors.some(e => e.includes('repeated characters'))).toBe(true);
    });

    it('should reject password exceeding max length', () => {
      const longPassword = 'A1a!' + 'a'.repeat(70); // 74 characters
      const result = PasswordService.validateStrength(longPassword);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot exceed 72 characters');
    });

    it('should give higher score for longer passwords', () => {
      const shortPassword = 'Short1Aa!';
      const longPassword = 'VeryLongPassword123!@#';
      
      const shortResult = PasswordService.validateStrength(shortPassword);
      const longResult = PasswordService.validateStrength(longPassword);
      
      expect(longResult.score).toBeGreaterThan(shortResult.score);
    });
  });

  describe('needsRehash', () => {
    it('should return false for hash with current salt rounds', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordService.hash(password);
      
      const needsRehash = PasswordService.needsRehash(hash);
      expect(needsRehash).toBe(false);
    });

    it('should return false for invalid hash', () => {
      const needsRehash = PasswordService.needsRehash('invalid-hash');
      expect(needsRehash).toBe(false);
    });
  });

  describe('generateRandom', () => {
    it('should generate password of specified length', () => {
      const password = PasswordService.generateRandom(16);
      expect(password.length).toBe(16);
    });

    it('should generate password with default length 16', () => {
      const password = PasswordService.generateRandom();
      expect(password.length).toBe(16);
    });

    it('should generate strong passwords', () => {
      const password = PasswordService.generateRandom(20);
      const strength = PasswordService.validateStrength(password);
      
      expect(strength.isValid).toBe(true);
      expect(strength.score).toBeGreaterThanOrEqual(4);
    });

    it('should generate different passwords each time', () => {
      const password1 = PasswordService.generateRandom(16);
      const password2 = PasswordService.generateRandom(16);
      
      expect(password1).not.toBe(password2);
    });

    it('should generate password with lowercase, uppercase, numbers, and special chars', () => {
      const password = PasswordService.generateRandom(20);
      
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/\d/.test(password)).toBe(true);
      expect(/[!@#$%^&*()_+\-=\[\]{}]/.test(password)).toBe(true);
    });
  });

  describe('Integration: Full Password Lifecycle', () => {
    it('should handle complete password flow: generate -> hash -> verify', async () => {
      // 1. Generate random password
      const password = PasswordService.generateRandom(16);
      
      // 2. Validate it's strong
      const strength = PasswordService.validateStrength(password);
      expect(strength.isValid).toBe(true);
      
      // 3. Hash it
      const hash = await PasswordService.hash(password);
      expect(hash).toBeDefined();
      
      // 4. Verify correct password
      const isValid = await PasswordService.verify(password, hash);
      expect(isValid).toBe(true);
      
      // 5. Verify wrong password fails
      const isInvalid = await PasswordService.verify('WrongPassword123!', hash);
      expect(isInvalid).toBe(false);
    });
  });
});
