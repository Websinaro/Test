import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// CSRF secret token generator
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// XSS Sanitizer: recursively removes dangerous HTML tags and script protocols from objects/strings
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove <iframe> tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, '') // Remove data:text/html
    .replace(/on\w+\s*=/gi, '') // Remove inline event handlers like onerror=, onload=
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .trim();
}

export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const cleanKey = sanitizeString(key);
    sanitized[cleanKey] = sanitizeObject(obj[key]);
  }
  return sanitized;
}

// XSS Sanitization Middleware
export function xssProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}

// Security Headers Middleware
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Protection Filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Frame Options (Allow self / preview iframe)
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}

// CSRF Double-Submit Cookie & Header Validation
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  // Safe HTTP methods don't mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt specific public webhook or auth exchange if needed, but enforce on ecommerce actions
  const exemptPaths = ['/api/security/csrf-token'];
  if (exemptPaths.includes(req.path)) {
    return next();
  }

  const headerToken = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies ? req.cookies['nexus_csrf'] : null;

  // If token is provided in header, allow it (double submit verification or bearer-backed protection)
  if (headerToken && headerToken.length >= 32) {
    if (cookieToken && cookieToken !== headerToken) {
      return res.status(403).json({
        error: 'CSRF token mismatch. Potential cross-site request forgery detected.',
        code: 'CSRF_TOKEN_MISMATCH'
      });
    }
    return next();
  }

  // Fallback: If request has valid JWT bearer token, it is already resistant to traditional cookie-based CSRF
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  return res.status(403).json({
    error: 'Missing CSRF protection token. Please refresh or provide X-CSRF-Token header.',
    code: 'CSRF_TOKEN_MISSING'
  });
}

// In-memory rate limiter for brute-force protection on authentication
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

export function authRateLimiter(maxAttempts = 15, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = rateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxAttempts) {
      return res.status(429).json({
        error: 'Too many authentication attempts. Please wait 1 minute before trying again.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }

    record.count++;
    next();
  };
}
