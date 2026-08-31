import { Router, Request, Response } from 'express';
import { db } from '../db/index.ts';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// GET all categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    return res.json({ categories });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET featured products
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const products = await db.getProducts({ featured: true });
    return res.json({ products });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

// GET all products with filtering, search, and sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy, featured } = req.query;

    const products = await db.getProducts({
      category: category as string,
      search: search as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      sortBy: sortBy as string,
      featured: featured === 'true',
    });

    return res.json({
      total: products.length,
      products,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product by ID or slug
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const product = await db.getProductByIdOrSlug(idOrSlug);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const reviews = await db.getReviews(product.id);
    const related = (await db.getProducts({ category: product.category_slug }))
      .filter(p => p.id !== product.id)
      .slice(0, 4);

    return res.json({
      product,
      reviews,
      related,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// POST create product (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      original_price,
      discount_percent,
      category_slug,
      brand,
      images,
      features,
      stock_quantity,
      badge,
      is_featured,
    } = req.body;

    if (!title || !description || price === undefined || !category_slug) {
      return res.status(400).json({ error: 'Title, description, price, and category are required.' });
    }

    const created = await db.createProduct({
      title,
      description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : parseFloat(price),
      discount_percent: discount_percent ? parseInt(discount_percent, 10) : 0,
      category_slug,
      brand: brand || 'Nexus',
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'],
      features: Array.isArray(features) ? features : [],
      stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity, 10) : 50,
      badge: badge || null,
      is_featured: is_featured === true || is_featured === 'true',
      in_stock: (stock_quantity || 50) > 0,
    });

    return res.status(201).json({
      message: 'Product created successfully.',
      product: created,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.updateProduct(id, req.body);

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await db.deleteProduct(id);

    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ message: 'Product removed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
