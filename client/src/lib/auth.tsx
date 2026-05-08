"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { authApi } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue { user: User | null; loading: boolean; signIn: (idToken: string) => Promise<void>; signOut: () => Promise<void>; refetch: () => Promise<void>; }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try { setUser(await authApi.me()); } catch { setUser(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const signIn = useCallback(async (idToken: string) => { setUser(await authApi.google(idToken)); }, []);
  const signOut = useCallback(async () => { await authApi.logout(); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, loading, signIn, signOut, refetch }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
