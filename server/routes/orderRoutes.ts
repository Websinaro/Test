import { Router, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateToken, optionalAuth, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Create Order / Checkout
router.post('/checkout', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      items,
      couponCode,
      userEmail,
      userName,
      userPhone,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ error: 'Complete shipping address is required.' });
    }

    const email = req.user?.email || userEmail;
    const name = req.user?.name || userName || shippingAddress.fullName || 'Guest Customer';
    const phone = req.user?.phone || userPhone || shippingAddress.phone || '';

    if (!email) {
      return res.status(400).json({ error: 'Customer email is required for receipt and order confirmation.' });
    }

    // Calculate totals server-side
    let subtotal = 0;
    const validatedItems: Array<{ productId: number; title: string; image: string; price: number; quantity: number }> = [];

    for (const item of items) {
      const product = await db.getProductByIdOrSlug(item.productId || item.id);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${item.title || item.productId}` });
      }

      if (product.stock_quantity < (item.quantity || 1)) {
        return res.status(400).json({
          error: `Insufficient stock for "${product.title}". Only ${product.stock_quantity} remaining.`,
        });
      }

      const itemPrice = Number(product.price);
      const qty = parseInt(item.quantity || 1, 10);
      subtotal += itemPrice * qty;

      validatedItems.push({
        productId: product.id,
        title: product.title,
        image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
        price: itemPrice,
        quantity: qty,
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await db.getCouponByCode(couponCode);
      if (coupon && subtotal >= Number(coupon.min_purchase)) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
          if (coupon.max_discount && discountAmount > Number(coupon.max_discount)) {
            discountAmount = Number(coupon.max_discount);
          }
        } else {
          discountAmount = Number(coupon.discount_value);
        }
      }
    }

    // Tax (6%) and Shipping (Free over $100 or standard $9.99)
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = parseFloat((discountedSubtotal * 0.06).toFixed(2));
    const shippingFee = subtotal >= 100 ? 0 : 9.99;
    const totalAmount = parseFloat((discountedSubtotal + taxAmount + shippingFee).toFixed(2));

    const order = await db.createOrder({
      userId: req.user?.id || null,
      userEmail: email,
      userName: name,
      userPhone: phone,
      totalAmount,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxAmount,
      shippingFee,
      paymentMethod: paymentMethod || 'card',
      shippingAddress,
      couponCode: couponCode || null,
      items: validatedItems,
    });

    return res.status(201).json({
      message: 'Order placed successfully!',
      order,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Failed to process checkout and create order.' });
  }
});

// Get User's Orders
router.get('/my-orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await db.getOrders(req.user!.id, req.user!.email);
    return res.json({ orders });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Get all orders
router.get('/admin/all', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await db.getAllOrdersForAdmin();
    return res.json({ orders });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// Admin: Update order status
router.put('/admin/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const order = await db.updateOrderStatus(orderId, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ message: 'Order status updated', order });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
