# 🔐 Password Security Documentation

## Overview

El Bruto utiliza **bcrypt** para hashing de contraseñas con las mejores prácticas de seguridad de 2025.

---

## 🛡️ Security Features

### 1. Bcrypt Hashing
- **Algoritmo**: bcrypt (industry standard)
- **Salt Rounds**: 12 (más seguro que el default de 10)
- **Hash Length**: 60 caracteres
- **Formato**: `$2b$12$...` (bcrypt v2b, 12 rounds)

### 2. Password Requirements
| Requirement | Value | Enforced |
|-------------|-------|----------|
| **Minimum Length** | 8 characters | ✅ Yes |
| **Maximum Length** | 72 characters | ✅ Yes (bcrypt limit) |
| **Lowercase Letter** | Required | ✅ Yes |
| **Uppercase Letter** | Required | ✅ Yes |
| **Number** | Required | ✅ Yes |
| **Special Character** | Recommended | ⚠️ Optional (bonus points) |

### 3. Protection Against Attacks

#### ✅ Brute Force Protection
- **Salt Rounds**: 12 = ~250ms per hash attempt
- **Rate Limiting**: Recommended (implement in middleware)
- **Account Lockout**: TODO (after N failed attempts)

#### ✅ Timing Attack Protection
- **Constant-Time Comparison**: bcrypt.compare() uses constant time
- **No early returns**: Same execution time for correct/incorrect passwords

#### ✅ Rainbow Table Protection
- **Unique Salts**: Every password gets unique salt
- **Bcrypt auto-salting**: Salt embedded in hash

#### ✅ Common Password Protection
- **Weak Pattern Detection**: Rejects `123456`, `password`, `qwerty`, etc.
- **Repeated Character Detection**: Rejects `aaa`, `111`, etc.

---

## 📚 Usage Examples

### Register User
```typescript
// routes/auth.ts
const hashedPassword = await PasswordService.hash(password);
db.prepare(`INSERT INTO users (..., password) VALUES (..., ?)`).run(hashedPassword);
```

### Login User
```typescript
// routes/auth.ts
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
const isValid = await PasswordService.verify(password, user.password);
if (!isValid) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

### Validate Password Strength
```typescript
const strength = PasswordService.validateStrength('MyPass123!');
if (!strength.isValid) {
  return res.status(400).json({ 
    error: 'Weak password',
    details: strength.errors 
  });
}
// strength.score: 0-5 (5 = very strong)
```

### Generate Random Password
```typescript
const tempPassword = PasswordService.generateRandom(16);
// Returns: "A7x!mK2pQ9r@Ls4T" (random)
```

---

## 🔬 Password Strength Scoring

| Score | Criteria | Example |
|-------|----------|---------|
| **0** | Too short or missing requirements | `short` |
| **1** | Minimum length only | `12345678` |
| **2** | Length + lowercase + uppercase | `Abcdefgh` |
| **3** | Length + lowercase + uppercase + numbers | `Abcd1234` |
| **4** | All requirements + 12+ chars | `Abcd12345678` |
| **5** | All requirements + special chars + 12+ chars | `Abcd1234!@#$` |

---

## ⚡ Performance

### Hash Time (bcrypt with 12 rounds)
```
Intel i5-12400F @ 2.5GHz:
- Hash:   ~250ms per password
- Verify: ~250ms per attempt

This is INTENTIONAL - slows down brute force attacks.
```

### Recommendations
- ✅ **DO**: Cache user sessions (JWT tokens)
- ✅ **DO**: Use rate limiting on login endpoint
- ❌ **DON'T**: Hash passwords on every request
- ❌ **DON'T**: Increase salt rounds above 12 (diminishing returns)

---

## 🧪 Testing

### Run Password Tests
```bash
cd backend
npm test PasswordService
```

### Test Coverage
- ✅ Hash generation (unique salts)
- ✅ Verification (correct/incorrect passwords)
- ✅ Strength validation (all rules)
- ✅ Edge cases (empty, too long, invalid format)
- ✅ Integration (full lifecycle)

---

## 🔧 Configuration

### Environment Variables
```env
# .env
JWT_SECRET=your-super-secret-key-here-change-in-production
```

### Adjust Salt Rounds (if needed)
```typescript
// backend/src/services/PasswordService.ts
private static readonly SALT_ROUNDS = 12; // Change here
```

**Warning**: Higher = slower but more secure. 12 is recommended for 2025.

---

## 🚨 Security Checklist

### ✅ Implemented
- [x] Bcrypt hashing with salt rounds = 12
- [x] Password strength validation
- [x] Constant-time verification
- [x] Unique salts per password
- [x] Maximum length protection (DoS prevention)
- [x] Common password rejection
- [x] Comprehensive test coverage

### ⏳ TODO (Recommended)
- [ ] Rate limiting on `/api/auth/login` (max 5 attempts per minute)
- [ ] Account lockout after 10 failed attempts
- [ ] Password history (prevent reusing last 5 passwords)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Password reset flow (email verification)
- [ ] Session invalidation on password change
- [ ] HTTPS enforcement in production

---

## 📖 Best Practices

### For Developers

1. **Never log passwords**
   ```typescript
   // ❌ BAD
   console.log('User password:', password);
   
   // ✅ GOOD
   console.log('User authenticated:', user.id);
   ```

2. **Always use PasswordService**
   ```typescript
   // ❌ BAD
   const hash = await bcrypt.hash(password, 10);
   
   // ✅ GOOD
   const hash = await PasswordService.hash(password);
   ```

3. **Validate strength before hashing**
   ```typescript
   const strength = PasswordService.validateStrength(password);
   if (!strength.isValid) {
     return res.status(400).json({ errors: strength.errors });
   }
   ```

### For Users

1. **Strong Password Example**: `MyDog@2024!Blue`
2. **Weak Password Examples**: `password123`, `qwerty`, `123456`
3. **Use different passwords** for different accounts
4. **Use a password manager** (1Password, Bitwarden, LastPass)

---

## 🔗 References

- [Bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

## 📊 Comparison with Other Methods

| Method | Security | Speed | Recommended |
|--------|----------|-------|-------------|
| **Plain Text** | 🔴 None | ⚡ Instant | ❌ NEVER |
| **MD5** | 🔴 Broken | ⚡ Fast | ❌ NO |
| **SHA-256** | 🟡 Fast (brute-forceable) | ⚡ Fast | ❌ NO |
| **bcrypt** | 🟢 Strong | 🐢 Slow (good!) | ✅ YES |
| **argon2** | 🟢 Stronger | 🐢 Slow | ✅ Alternative |
| **scrypt** | 🟢 Strong | 🐢 Slow | ✅ Alternative |

**Why bcrypt?**
- ✅ Industry standard since 1999
- ✅ Battle-tested in production
- ✅ Auto-salting (no separate salt storage)
- ✅ Adaptive (can increase rounds over time)
- ✅ Wide library support

---

**Last Updated**: October 31, 2025  
**Security Audit**: Pending  
**Next Review**: January 2026
