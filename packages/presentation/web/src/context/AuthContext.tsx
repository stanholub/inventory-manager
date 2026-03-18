import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { SyncConfig } from "../sync/SyncConfig";
import { getSupabaseClient } from "../sync/SupabaseClient";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  authError: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  syncConfig,
}: {
  children: ReactNode;
  syncConfig: SyncConfig | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!syncConfig) {
      setUser(null);
      setSession(null);
      return;
    }
    const client = getSupabaseClient(syncConfig);
    // Load current session
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });
    // Subscribe to auth state changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [syncConfig]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!syncConfig) throw new Error("Sync not configured");
      setAuthLoading(true);
      setAuthError(null);
      try {
        const client = getSupabaseClient(syncConfig);
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setAuthError(msg);
        throw e;
      } finally {
        setAuthLoading(false);
      }
    },
    [syncConfig]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!syncConfig) throw new Error("Sync not configured");
      setAuthLoading(true);
      setAuthError(null);
      try {
        const client = getSupabaseClient(syncConfig);
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setAuthError(msg);
        throw e;
      } finally {
        setAuthLoading(false);
      }
    },
    [syncConfig]
  );

  const signOut = useCallback(async () => {
    if (!syncConfig) return;
    const client = getSupabaseClient(syncConfig);
    await client.auth.signOut();
  }, [syncConfig]);

  return (
    <AuthContext.Provider
      value={{ user, session, authLoading, authError, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
