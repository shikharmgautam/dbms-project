import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { API_BASE } from '../lib/api';
// we'll use backend API for profiles/auth exchange

type Profile = {
  id?: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
};

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'student' | 'recruiter' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = localStorage.getItem('userSessionToken');
        if (token) {
          await loadProfile(firebaseUser.uid, token);
        } else {
          // no custom token stored yet
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadProfile = async (userId: string, customTokenOverride?: string) => {
    try {
      const token = customTokenOverride || localStorage.getItem('userSessionToken');
      if (!token) throw new Error('No custom session token found.');

      const res = await fetch(`${API_BASE}/profiles?id=eq.${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        console.error('Profile API Status:', res.status);
        throw new Error('Failed to load profile');
      }
      const json = await res.json();
      setProfile((json.data && json.data[0]) || null);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Exchange Firebase ID token for backend custom JWT
    const firebaseToken = await result.user.getIdToken();
    try {
      const authRes = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: firebaseToken }),
      });
      if (!authRes.ok) throw new Error('Backend auth failed');
      const authData = await authRes.json();
      const customToken = authData.token;
      localStorage.setItem('userSessionToken', customToken);

      // load profile after authentication, passing the customToken
      await loadProfile(result.user.uid, customToken);
    } catch (err) {
      console.warn('Error calling backend auth endpoint, falling back to Firebase ID token', err);
      // fallback: store firebase token so middleware accepting Firebase token still works
      localStorage.setItem('userSessionToken', firebaseToken);
      await loadProfile(result.user.uid, firebaseToken);
    }
  };

  const updateUserRole = async (role: 'student' | 'recruiter' | 'admin') => {
    if (!user) throw new Error('No user logged in');

    const token = localStorage.getItem('userSessionToken') || await user.getIdToken();
    const res = await fetch(`${API_BASE}/profiles/${user.uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error('Failed to update role');
    await loadProfile(user.uid);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem('userSessionToken');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
