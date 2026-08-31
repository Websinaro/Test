import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';
import { api, setJwtToken, getJwtToken } from '../services/api.ts';
import { triggerGoogleAuth, GoogleAuthResult } from '../lib/firebase.ts';

// Result of starting a Google sign-in: either the user is already registered
// and has been logged in, or this is a brand-new Google account that still
// needs a name and phone number before the account can be created.
export type GoogleSignInOutcome =
  | { status: 'logged_in' }
  | { status: 'needs_profile'; profile: GoogleAuthResult };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  startGoogleSignIn: () => Promise<GoogleSignInOutcome>;
  completeGoogleSignUp: (profile: GoogleAuthResult, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatar_url?: string }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        await api.initSecurity();
        const savedToken = getJwtToken();
        if (savedToken) {
          const res = await api.getMe();
          setUser(res.user);
        }
      } catch (err: any) {
        console.warn('Session restore failed or expired:', err);
        setJwtToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.login({ email, password });
      setJwtToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    setError(null);
    try {
      const res = await api.register({ name, email, password, phone });
      setJwtToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Step 1: open the real Google popup. If the Google account is already
  // linked to a NexusCart account, log straight in. Otherwise, signal that a
  // name and phone number are still needed before the account can be created.
  const startGoogleSignIn = async (): Promise<GoogleSignInOutcome> => {
    setError(null);
    try {
      const profile = await triggerGoogleAuth();
      const { exists } = await api.checkEmailExists(profile.email);

      if (exists) {
        const res = await api.firebaseGoogleLogin({
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName,
          photoURL: profile.photoURL || undefined,
        });
        setJwtToken(res.token);
        setUser(res.user);
        return { status: 'logged_in' };
      }

      return { status: 'needs_profile', profile };
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      throw err;
    }
  };

  // Step 2 (new accounts only): finish creating the account with the name and
  // phone number collected from the user, then save everything to the database.
  const completeGoogleSignUp = async (profile: GoogleAuthResult, name: string, phone: string) => {
    setError(null);
    try {
      const res = await api.firebaseGoogleLogin({
        uid: profile.uid,
        email: profile.email,
        displayName: name,
        photoURL: profile.photoURL || undefined,
        phoneNumber: phone,
      });
      setJwtToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Could not finish creating your account');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API failed:', err);
    } finally {
      setJwtToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar_url?: string }) => {
    try {
      const res = await api.updateProfile(data);
      if (res.token) setJwtToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Update profile failed');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        startGoogleSignIn,
        completeGoogleSignUp,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
