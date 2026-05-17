"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { AuthSession } from "@/lib/auth-shared";

type AuthSessionContextValue = {
  apiBase: string | null;
  session: AuthSession | null;
  setSession: Dispatch<SetStateAction<AuthSession | null>>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({
  apiBase,
  initialSession,
  children,
}: {
  apiBase: string | null;
  initialSession: AuthSession | null;
  children: ReactNode;
}) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const value = useMemo(
    () => ({ apiBase, session, setSession }),
    [apiBase, session],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const value = useContext(AuthSessionContext);
  if (!value) {
    return {
      apiBase: null,
      session: null,
      setSession: (() => undefined) as Dispatch<SetStateAction<AuthSession | null>>,
    };
  }
  return value;
}
