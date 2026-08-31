import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Get cart for logged in user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cart = await db.getCart(userId);
    return res.json({ cart });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const cart = await db.addToCart(userId, parseInt(productId, 10), quantity ? parseInt(quantity, 10) : 1);
    return res.json({ message: 'Item added to cart', cart });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update item quantity
router.put('/update', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const cart = await db.updateCartItem(userId, parseInt(productId, 10), parseInt(quantity, 10));
    return res.json({ message: 'Cart updated', cart });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const productId = parseInt(req.params.productId, 10);

    const cart = await db.removeFromCart(userId, productId);
    return res.json({ message: 'Item removed from cart', cart });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to remove item' });
  }
});

// Clear entire cart
router.delete('/clear', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const cart = await db.clearCart(userId);
    return res.json({ message: 'Cart cleared', cart });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
