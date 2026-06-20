import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { setAccessToken } from "@/lib/auth-session";
import type { AuthSession, AuthUser } from "@/types/auth";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  signIn: (session?: AuthSession) => void;
  signOut: () => void;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function authUsersEqual(a: AuthUser, b: AuthUser): boolean {
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.fullName === b.fullName &&
    a.phone === b.phone &&
    a.role === b.role &&
    a.roleExpiresAt === b.roleExpiresAt &&
    a.avatarUrl === b.avatarUrl
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback((session?: AuthSession) => {
    if (session) {
      setUser(session.user);
      setAccessToken(session.accessToken);
    } else {
      setAccessToken(null);
    }
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser((prev) => {
      if (prev && authUsersEqual(prev, nextUser)) return prev;
      return nextUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      signIn,
      signOut,
      updateUser,
    }),
    [isAuthenticated, user, signIn, signOut, updateUser],
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
