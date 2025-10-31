import { Router, Request, Response } from 'express';
import { db } from '../database/connection';
import { randomUUID } from 'crypto';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Get all brutos for a user
router.get('/', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const brutos = db.prepare(`
      SELECT * FROM brutos WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId);

    const formatted = brutos.map((b: any) => ({
      id: b.id,
      userId: b.user_id,
      name: b.name,
      level: b.level,
      xp: b.xp,
      wins: b.wins,
      losses: b.losses,
      strength: b.strength,
      agility: b.agility,
      speed: b.speed,
      hp: b.hp,
      appearance: JSON.parse(b.appearance),
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[Brutos] Get all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single bruto by ID
router.get('/:id', verifyToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const bruto = db.prepare('SELECT * FROM brutos WHERE id = ? AND user_id = ?').get(id, userId) as any;

    if (!bruto) {
      return res.status(404).json({ error: 'Bruto not found' });
    }

    const formatted = {
      id: bruto.id,
      userId: bruto.user_id,
      name: bruto.name,
      level: bruto.level,
      xp: bruto.xp,
      wins: bruto.wins,
      losses: bruto.losses,
      strength: bruto.strength,
      agility: bruto.agility,
      speed: bruto.speed,
      hp: bruto.hp,
      appearance: JSON.parse(bruto.appearance),
      createdAt: bruto.created_at,
      updatedAt: bruto.updated_at
    };

    res.json(formatted);
  } catch (error) {
    console.error('[Brutos] Get one error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new bruto
router.post('/', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, strength, agility, speed, hp, appearance } = req.body;

    // Validation
    if (!name || !strength || !agility || !speed || !hp || !appearance) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if name is already taken
    const existing = db.prepare('SELECT id FROM brutos WHERE name = ?').get(name);
    if (existing) {
      return res.status(409).json({ error: 'Bruto name already taken' });
    }

    // Create bruto
    const brutoId = randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO brutos (id, user_id, name, strength, agility, speed, hp, appearance, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(brutoId, userId, name, strength, agility, speed, hp, JSON.stringify(appearance), now, now);

    const bruto = {
      id: brutoId,
      userId,
      name,
      level: 1,
      xp: 0,
      wins: 0,
      losses: 0,
      strength,
      agility,
      speed,
      hp,
      appearance,
      createdAt: now,
      updatedAt: now
    };

    res.status(201).json(bruto);
  } catch (error) {
    console.error('[Brutos] Create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bruto (for battles, leveling up, etc.)
router.put('/:id', verifyToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { level, xp, wins, losses, strength, agility, speed, hp } = req.body;

    // Verify ownership
    const existing = db.prepare('SELECT id FROM brutos WHERE id = ? AND user_id = ?').get(id, userId);
    if (!existing) {
      return res.status(404).json({ error: 'Bruto not found' });
    }

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE brutos 
      SET level = ?, xp = ?, wins = ?, losses = ?, strength = ?, agility = ?, speed = ?, hp = ?, updated_at = ?
      WHERE id = ?
    `).run(level, xp, wins, losses, strength, agility, speed, hp, now, id);

    const updated = db.prepare('SELECT * FROM brutos WHERE id = ?').get(id) as any;

    const formatted = {
      id: updated.id,
      userId: updated.user_id,
      name: updated.name,
      level: updated.level,
      xp: updated.xp,
      wins: updated.wins,
      losses: updated.losses,
      strength: updated.strength,
      agility: updated.agility,
      speed: updated.speed,
      hp: updated.hp,
      appearance: JSON.parse(updated.appearance),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    };

    res.json(formatted);
  } catch (error) {
    console.error('[Brutos] Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if bruto name is available
router.post('/check-name', verifyToken, (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const existing = db.prepare('SELECT id FROM brutos WHERE name = ?').get(name);
    
    res.json({ available: !existing });
  } catch (error) {
    console.error('[Brutos] Check name error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bruto XP and level (Story 8.1)
router.patch('/:id/xp', verifyToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { xp, level } = req.body;

    // Validation
    if (typeof xp !== 'number' || typeof level !== 'number') {
      return res.status(400).json({ error: 'XP and level must be numbers' });
    }

    // Check ownership
    const bruto = db.prepare('SELECT id FROM brutos WHERE id = ? AND user_id = ?').get(id, userId);
    if (!bruto) {
      return res.status(404).json({ error: 'Bruto not found' });
    }

    // Update XP and level
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE brutos 
      SET xp = ?, level = ?, updated_at = ?
      WHERE id = ?
    `).run(xp, level, now, id);

    const updated = db.prepare('SELECT * FROM brutos WHERE id = ?').get(id) as any;

    const formatted = {
      id: updated.id,
      userId: updated.user_id,
      name: updated.name,
      level: updated.level,
      xp: updated.xp,
      wins: updated.wins,
      losses: updated.losses,
      strength: updated.strength,
      agility: updated.agility,
      speed: updated.speed,
      hp: updated.hp,
      appearance: JSON.parse(updated.appearance),
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    };

    res.json(formatted);
  } catch (error) {
    console.error('[Brutos] Update XP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save level upgrade choice (Story 8.2)
router.post('/:id/upgrades', verifyToken, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { 
      levelNumber, 
      optionA, 
      optionB, 
      chosenOption 
    } = req.body;

    // Validation
    if (!levelNumber || !optionA || !optionB || !chosenOption) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (chosenOption !== 'A' && chosenOption !== 'B') {
      return res.status(400).json({ error: 'chosenOption must be "A" or "B"' });
    }

    // Check ownership
    const bruto = db.prepare('SELECT id FROM brutos WHERE id = ? AND user_id = ?').get(id, userId);
    if (!bruto) {
      return res.status(404).json({ error: 'Bruto not found' });
    }

    // Save upgrade choice
    const upgradeId = randomUUID();
    db.prepare(`
      INSERT INTO level_upgrades (
        id, bruto_id, level_number,
        option_a_type, option_a_description, option_a_stats,
        option_b_type, option_b_description, option_b_stats,
        chosen_option
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      upgradeId,
      id,
      levelNumber,
      optionA.type,
      optionA.description,
      JSON.stringify(optionA.stats || {}),
      optionB.type,
      optionB.description,
      JSON.stringify(optionB.stats || {}),
      chosenOption
    );

    res.json({ 
      success: true, 
      upgradeId,
      message: 'Upgrade choice saved successfully' 
    });
  } catch (error) {
    console.error('[Brutos] Save upgrade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
