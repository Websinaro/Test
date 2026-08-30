"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncProfile = useCallback(async (user, extra = {}) => {
    const token = await user.getIdToken();
    const { user: dbUser } = await api.syncUser(token, extra);
    setProfile(dbUser);
    return dbUser;
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          await syncProfile(user);
        } catch (err) {
          console.error("Profile sync failed:", err.message);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [syncProfile]);

  async function getToken() {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }

  async function signup({ name, email, phone, password }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await syncProfile(cred.user, { name, phone });
    return cred.user;
  }

  async function login({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await syncProfile(cred.user);
    return cred.user;
  }

  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    await syncProfile(cred.user);
    return cred.user;
  }

  async function logout() {
    await signOut(auth);
  }

  async function refreshProfile() {
    if (!auth.currentUser) return null;
    return syncProfile(auth.currentUser);
  }

  const value = {
    firebaseUser,
    profile,
    loading,
    getToken,
    signup,
    login,
    loginWithGoogle,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
