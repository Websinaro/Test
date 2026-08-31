import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/index.ts';
import { signJwtToken, authenticateToken, AuthRequest } from '../middleware/auth.ts';
import { authRateLimiter, generateCsrfToken } from '../middleware/security.ts';

const router = Router();

// Check whether an account already exists for a given email.
// Used by the client before showing the Google Sign-In profile-completion step.
router.get('/check-email', authRateLimiter(30, 60000), async (req, res: Response) => {
  try {
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const existing = await db.findUserByEmail(email);
    return res.json({ exists: Boolean(existing) });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to check account.' });
  }
});

// Register with Name, Email, Password, Phone
router.post('/register', authRateLimiter(10, 60000), async (req, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address format.' });
    }

    // Check if email already registered
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const uid = `user_${crypto.randomBytes(8).toString('hex')}`;

    const newUser = await db.createUser({
      uid,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      role: 'customer',
      auth_provider: 'local',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    const userPayload = {
      id: newUser.id,
      uid: newUser.uid,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role as 'admin' | 'customer',
      avatar_url: newUser.avatar_url,
      auth_provider: newUser.auth_provider,
    };

    const token = signJwtToken(userPayload);
    const csrfToken = generateCsrfToken();

    res.cookie('nexus_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('nexus_csrf', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      user: userPayload,
      token,
      csrfToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login with Email or Phone + Password
router.post('/login', authRateLimiter(20, 60000), async (req, res: Response) => {
  try {
    const { identifier, email, password } = req.body;
    const loginTarget = identifier || email;

    if (!loginTarget || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    const user = await db.findUserByEmail(loginTarget);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.password_hash) {
      return res.status(400).json({
        error: 'This account was registered via Google Sign-In. Please click Continue with Google.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userPayload = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role as 'admin' | 'customer',
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider,
    };

    const token = signJwtToken(userPayload);
    const csrfToken = generateCsrfToken();

    res.cookie('nexus_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('nexus_csrf', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Login successful.',
      user: userPayload,
      token,
      csrfToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Firebase Google Authentication Exchange
router.post('/firebase-google', async (req, res: Response) => {
  try {
    const { uid, email, displayName, photoURL, phoneNumber } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Google account email is required.' });
    }

    let user = await db.findUserByEmail(email);

    if (!user) {
      // New Google accounts must provide a name and phone number, collected
      // client-side via the profile-completion step shown after Google sign-in.
      if (!displayName || !String(displayName).trim()) {
        return res.status(400).json({ error: 'Name is required to finish creating your account.' });
      }
      if (!phoneNumber || !String(phoneNumber).trim()) {
        return res.status(400).json({ error: 'Phone number is required to finish creating your account.' });
      }

      const generatedUid = uid || `google_${crypto.randomBytes(8).toString('hex')}`;
      user = await db.createUser({
        uid: generatedUid,
        email: email.toLowerCase().trim(),
        name: String(displayName).trim(),
        phone: String(phoneNumber).trim(),
        role: 'customer',
        auth_provider: 'google',
        avatar_url: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      });
    } else {
      // If user exists, sync avatar or Google provider if needed
      if (!user.avatar_url && photoURL) {
        user = await db.updateUser(user.id, { avatar_url: photoURL }) || user;
      }
    }

    const userPayload = {
      id: user.id,
      uid: user.uid,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role as 'admin' | 'customer',
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider,
    };

    const token = signJwtToken(userPayload);
    const csrfToken = generateCsrfToken();

    res.cookie('nexus_jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('nexus_csrf', csrfToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Google authentication successful.',
      user: userPayload,
      token,
      csrfToken,
    });
  } catch (error: any) {
    console.error('Firebase Google auth error:', error);
    return res.status(500).json({ error: 'Failed to process Google sign in.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const freshUser = await db.findUserById(req.user.id);
    if (!freshUser) {
      return res.status(404).json({ error: 'User record not found.' });
    }

    return res.json({
      user: {
        id: freshUser.id,
        uid: freshUser.uid,
        email: freshUser.email,
        name: freshUser.name,
        phone: freshUser.phone,
        role: freshUser.role,
        avatar_url: freshUser.avatar_url,
        auth_provider: freshUser.auth_provider,
        created_at: freshUser.created_at,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, phone, avatar_url } = req.body;

    const updated = await db.updateUser(req.user.id, {
      name: name?.trim(),
      phone: phone?.trim(),
      avatar_url: avatar_url?.trim(),
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedPayload = {
      id: updated.id,
      uid: updated.uid,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role as 'admin' | 'customer',
      avatar_url: updated.avatar_url,
      auth_provider: updated.auth_provider,
    };

    const newToken = signJwtToken(updatedPayload);

    return res.json({
      message: 'Profile updated successfully.',
      user: updatedPayload,
      token: newToken,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('nexus_jwt');
  res.clearCookie('nexus_csrf');
  res.json({ message: 'Logged out successfully.' });
});

export default router;
