"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  bootstrapSession,
  getServerSessionSnapshot,
  getSessionSnapshot,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  retrySessionBootstrap,
  subscribeSession,
  type PublicUser,
  type SessionSnapshot,
} from "@/src/lib/api-client";

type AuthContextValue = SessionSnapshot & {
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<PublicUser>;
  logout: () => Promise<void>;
  retryBootstrap: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribeSession, getSessionSnapshot, getServerSessionSnapshot);

  useEffect(() => {
    void bootstrapSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...snapshot,
        login: loginRequest,
        register: registerRequest,
        logout: logoutRequest,
        retryBootstrap: retrySessionBootstrap,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}