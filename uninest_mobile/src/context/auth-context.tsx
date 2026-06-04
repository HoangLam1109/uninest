import { createContext, useContext, useMemo, useState } from "react";

import { setAccessToken } from "@/lib/auth-session";
import type { AuthSession, AuthUser } from "@/types/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: (session?: AuthSession) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      signIn: (session?: AuthSession) => {
        if (session) {
          setUser(session.user);
          setAccessToken(session.accessToken);
        } else {
          setAccessToken(null);
        }
        setIsAuthenticated(true);
      },
      signOut: () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthenticated(false);
      },
    }),
    [isAuthenticated, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
