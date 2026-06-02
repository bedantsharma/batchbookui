import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app and exposes the Supabase session to any child
 * component via the useAuth() hook.
 *
 * Usage:
 *   const { session, user, loading, signOut } = useAuth();
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session on first render
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Session expired or revoked — clear role and student ID
        localStorage.removeItem('bb_role');
        localStorage.removeItem('bb_student_id');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('bb_role');
    localStorage.removeItem('bb_student_id');
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — returns the current auth state.
 * Must be used inside an <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
