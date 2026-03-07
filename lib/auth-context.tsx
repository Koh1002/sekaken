"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "./supabase";
import { syncLocalToSupabase, syncSupabaseToLocal } from "./study-storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabaseEnabled) return "Supabase is not configured";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;

    // ログイン後にデータ同期
    await syncLocalToSupabase();
    await syncSupabaseToLocal();
    return null;
  };

  const signUp = async (email: string, password: string): Promise<string | null> => {
    if (!supabaseEnabled) return "Supabase is not configured";
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;

    // サインアップ後にローカルデータをアップロード
    await syncLocalToSupabase();
    return null;
  };

  const signOut = async () => {
    if (supabaseEnabled) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
