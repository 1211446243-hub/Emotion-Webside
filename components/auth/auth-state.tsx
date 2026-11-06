"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { authService } from "@/lib/auth/auth-service";
import type { User } from "@/types/user";

const AuthContext = createContext<{ user: User | null; draft: string; setDraft: (text: string) => void } | null>(null);

export function AuthState({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(authService.subscribe, authService.getSessionSnapshot, () => null);
  const [draft, setDraft] = useState("");
  const user = useMemo<User | null>(() => snapshot ? JSON.parse(snapshot) : null, [snapshot]);
  // The draft survives client-side login navigation without storing private text on disk.
  return <AuthContext.Provider value={{ user, draft, setDraft }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthState is required");
  return context;
}
