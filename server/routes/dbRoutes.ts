import { Router, Request, Response } from 'express';
import { getDbStatus, initializeDatabase } from '../db/index.ts';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Admin-only: check database connection status and record counts.
// No credentials or connection strings are ever returned here.
router.get('/status', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const status = getDbStatus();
  res.json({ status });
});

// Admin-only: trigger a manual database re-connection / seed refresh
router.post('/reconnect', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await initializeDatabase();
    const status = getDbStatus();
    res.json({ message: 'Database reconnected successfully.', status });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reconnect to database' });
  }
});

export default router;
