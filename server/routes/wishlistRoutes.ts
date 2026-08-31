import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get wishlist
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const wishlist = await db.getWishlist(userId);
    return res.json({ wishlist });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Toggle wishlist item
router.post('/toggle', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await db.toggleWishlist(userId, parseInt(productId, 10));
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

export default router;
