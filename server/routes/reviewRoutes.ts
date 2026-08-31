import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateToken, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Add review for product
router.post('/add', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userName = req.user!.name;
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating (1-5), and review comment are required.' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10)));

    const review = await db.addReview({
      productId: parseInt(productId, 10),
      userId,
      userName,
      rating: numericRating,
      title: title?.trim(),
      comment: comment.trim(),
    });

    return res.status(201).json({
      message: 'Review submitted successfully!',
      review,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res: Response) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const reviews = await db.getReviews(productId);
    return res.json({ reviews });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
