import { Router, Request, Response } from 'express';
import { generateCsrfToken } from '../middleware/security.ts';

const router = Router();

// Endpoint to obtain a fresh CSRF token
router.get('/csrf-token', (req: Request, res: Response) => {
  const token = generateCsrfToken();
  res.cookie('nexus_csrf', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ csrfToken: token });
});

export default router;
