import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Backend imports
import { initializeDatabase } from './server/db/index.ts';
import {
  securityHeadersMiddleware,
  xssProtectionMiddleware,
  csrfProtectionMiddleware,
} from './server/middleware/security.ts';

import authRoutes from './server/routes/authRoutes.ts';
import productRoutes from './server/routes/productRoutes.ts';
import cartRoutes from './server/routes/cartRoutes.ts';
import orderRoutes from './server/routes/orderRoutes.ts';
import wishlistRoutes from './server/routes/wishlistRoutes.ts';
import reviewRoutes from './server/routes/reviewRoutes.ts';
import couponRoutes from './server/routes/couponRoutes.ts';
import securityRoutes from './server/routes/securityRoutes.ts';
import dbRoutes from './server/routes/dbRoutes.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database (PostgreSQL if DATABASE_URL configured, or structured relational engine)
  await initializeDatabase();

  // Basic Middlewares
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Security Middlewares (XSS, CSRF, HTTP Headers)
  app.use(securityHeadersMiddleware);
  app.use(xssProtectionMiddleware);
  app.use('/api', csrfProtectionMiddleware);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/security', securityRoutes);
  app.use('/api/db', dbRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'NexusCart E-Commerce API',
      timestamp: new Date().toISOString(),
      security: {
        jwt: 'active',
        csrf: 'enforced',
        xss: 'sanitized',
      },
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NexusCart] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[NexusCart] Fatal server startup error:', err);
});
