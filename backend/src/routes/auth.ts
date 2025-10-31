import { Router, Request, Response } from 'express';
import { db } from '../database/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, hashedPassword, now, now);

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' });

    // Return user data (without password)
    const user = {
      id: userId,
      name,
      email,
      createdAt: now,
      updatedAt: now
    };

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    // Return user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
