import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nexus_super_secure_jwt_secret_key_prod_2026_x89f';
const JWT_EXPIRES_IN = '7d';

export interface UserPayload {
  id: number;
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  phone?: string | null;
  avatar_url?: string | null;
  auth_provider?: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}

// Generate JWT token
export function signJwtToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyJwtToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (err) {
    return null;
  }
}

// Mandatory Authentication Middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies['nexus_jwt']) {
    token = req.cookies['nexus_jwt'];
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please login to continue.',
      code: 'AUTH_REQUIRED',
    });
  }

  const decoded = verifyJwtToken(token);
  if (!decoded) {
    return res.status(401).json({
      error: 'Invalid or expired session token. Please login again.',
      code: 'INVALID_TOKEN',
    });
  }

  req.user = decoded;
  next();
}

// Optional Authentication Middleware (for cart/checkout where guests are allowed)
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies['nexus_jwt']) {
    token = req.cookies['nexus_jwt'];
  }

  if (token) {
    const decoded = verifyJwtToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

// Admin Authorization Middleware
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied: Admin privileges required.',
      code: 'FORBIDDEN_ADMIN_ONLY',
    });
  }

  next();
}
