import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { BattleService } from '../services/BattleService';
import { db } from '../database/connection';

const router = Router();

// Get battles for a specific bruto
router.get('/bruto/:brutoId', verifyToken, (req: Request, res: Response) => {
  try {
    const { brutoId } = req.params;
    const userId = (req as any).userId;

    // Verify bruto belongs to user
    const bruto = db.prepare('SELECT id FROM brutos WHERE id = ? AND user_id = ?').get(brutoId, userId);
    if (!bruto) {
      return res.status(404).json({ error: 'Bruto not found' });
    }

    const battles = BattleService.getBattlesForBruto(brutoId);
    res.json(battles);
  } catch (error) {
    console.error('[Battles] Get battles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get battle count for a bruto
router.get('/bruto/:brutoId/count', verifyToken, (req: Request, res: Response) => {
  try {
    const { brutoId } = req.params;
    const userId = (req as any).userId;

    // Verify bruto belongs to user
    const bruto = db.prepare('SELECT id FROM brutos WHERE id = ? AND user_id = ?').get(brutoId, userId);
    if (!bruto) {
      return res.status(404).json({ error: 'Bruto not found' });
    }

    const count = BattleService.getBattleCount(brutoId);
    res.json({ count });
  } catch (error) {
    console.error('[Battles] Get count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save a battle (called after combat)
router.post('/', verifyToken, (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { bruto1_id, bruto2_id, winner_id, turn_count, battle_log } = req.body;

    // Verify at least one bruto belongs to user
    const bruto1 = db.prepare('SELECT id FROM brutos WHERE id = ?').get(bruto1_id);
    const bruto2 = db.prepare('SELECT id FROM brutos WHERE id = ?').get(bruto2_id);

    if (!bruto1 || !bruto2) {
      return res.status(404).json({ error: 'Bruto not found' });
    }

    // Verify user owns at least one of the brutos
    const userBruto = db.prepare('SELECT id FROM brutos WHERE id IN (?, ?) AND user_id = ?')
      .get(bruto1_id, bruto2_id, userId);

    if (!userBruto) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Save battle (automatically cleans old battles)
    const battleId = BattleService.saveBattle({
      bruto1_id,
      bruto2_id,
      winner_id,
      turn_count,
      battle_log
    });

    res.status(201).json({ 
      id: battleId,
      message: 'Battle saved. Old battles automatically cleaned.',
      maxBattlesPerBruto: 7
    });
  } catch (error) {
    console.error('[Battles] Save battle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
