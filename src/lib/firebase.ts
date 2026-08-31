import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const hasValidFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (hasValidFirebaseConfig) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
}

export interface GoogleAuthResult {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

/**
 * Opens the real Firebase Google Sign-In popup and returns the authenticated
 * profile. Throws if Firebase isn't configured or the user cancels/denies
 * the popup — callers are expected to surface the error to the user.
 */
export async function triggerGoogleAuth(): Promise<GoogleAuthResult> {
  if (!auth || !googleProvider) {
    throw new Error(
      'Google Sign-In is not configured. Add your Firebase web app credentials to the environment variables.'
    );
  }

  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  if (!user.email) {
    throw new Error('Your Google account does not have an email address associated with it.');
  }

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || '',
    photoURL: user.photoURL,
  };
}

export { auth };
