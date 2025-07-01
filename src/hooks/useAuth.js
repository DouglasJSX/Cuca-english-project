"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { authHelpers, supabase } from "@/lib/supabase";

// Auth Context
const AuthContext = createContext({});

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await authHelpers.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    const result = await authHelpers.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authHelpers.signOut();
    setLoading(false);
    return result;
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
