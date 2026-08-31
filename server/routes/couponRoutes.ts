import { Router, Request, Response } from 'express';
import { db } from '../db/index.ts';

const router = Router();

// Validate coupon code
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = await db.getCouponByCode(code);
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid or expired promotional code.' });
    }

    const sub = subtotal ? parseFloat(subtotal) : 0;
    if (sub < Number(coupon.min_purchase)) {
      return res.status(400).json({
        error: `Coupon "${coupon.code}" requires a minimum purchase of $${Number(coupon.min_purchase).toFixed(2)}.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (sub * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
        discountAmount = Number(coupon.max_discount);
      }
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    return res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        description: coupon.description,
        calculatedDiscount: parseFloat(discountAmount.toFixed(2)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// List available public promotions
router.get('/public', async (req: Request, res: Response) => {
  res.json({
    promotions: [
      { code: 'WELCOME20', label: '20% Off', description: '20% off orders over $50' },
      { code: 'SAVE10', label: '10% Off', description: '10% off site-wide' },
      { code: 'PROMO50', label: '$50 Flat', description: '$50 off orders over $250' },
      { code: 'FREESHIP', label: 'Free Shipping', description: 'Free express delivery on orders over $40' },
    ],
  });
});

export default router;
