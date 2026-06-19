"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  createContext,
  useEffect,
  useEffectEvent,
  useState,
  startTransition,
} from "react";
import { firebaseAuth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { fetchCurrentUser } from "@/services/user-service";
import type { User } from "@/types/domain";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  profile: User | null;
  profileLoading: boolean;
  profileError: string | null;
  authLoading: boolean;
  isFirebaseReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

function firebaseUnavailableError() {
  return new Error(
    "Sign-in is temporarily unavailable right now. Please try again shortly.",
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const loadProfile = useEffectEvent(async () => {
    if (!firebaseAuth?.currentUser) {
      setProfile(null);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const response = await fetchCurrentUser();
      startTransition(() => {
        setProfile(response.databaseUser);
      });
    } catch (error) {
      startTransition(() => {
        setProfile(null);
        setProfileError(
          error instanceof Error
            ? error.message
            : "We couldn't load your account details right now.",
        );
      });
    } finally {
      setProfileLoading(false);
    }
  });

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      setStatus("unauthenticated");
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user);
      setStatus(user ? "authenticated" : "unauthenticated");

      if (user) {
        await loadProfile();
      } else {
        setProfile(null);
        setProfileError(null);
      }
    });

    return unsubscribe;
  }, []);

  async function signIn(email: string, password: string) {
    if (!firebaseAuth) {
      throw firebaseUnavailableError();
    }

    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } finally {
      setAuthLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!firebaseAuth) {
      throw firebaseUnavailableError();
    }

    setAuthLoading(true);
    try {
      const credentials = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );

      if (fullName.trim()) {
        await updateProfile(credentials.user, { displayName: fullName.trim() });
      }
    } finally {
      setAuthLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!firebaseAuth || !googleProvider) {
      throw firebaseUnavailableError();
    }

    setAuthLoading(true);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
    } finally {
      setAuthLoading(false);
    }
  }

  async function signOutUser() {
    if (!firebaseAuth) {
      throw firebaseUnavailableError();
    }

    await signOut(firebaseAuth);
  }

  return (
    <AuthContext.Provider
      value={{
        status,
        firebaseUser,
        profile,
        profileLoading,
        profileError,
        authLoading,
        isFirebaseReady: isFirebaseConfigured,
        signIn,
        signUp,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
