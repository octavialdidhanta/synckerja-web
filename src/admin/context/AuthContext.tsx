import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/share/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isCmsAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function verifyCmsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_cms_admin");
  if (error) return false;
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isCmsAdmin, setIsCmsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const syncAdminStatus = useCallback(async (activeSession: Session | null) => {
    if (!activeSession) {
      setIsCmsAdmin(false);
      return;
    }
    setIsCmsAdmin(await verifyCmsAdmin());
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      await syncAdminStatus(data.session);
      if (mounted) setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      await syncAdminStatus(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncAdminStatus]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const admin = await verifyCmsAdmin();
    if (!admin) {
      await supabase.auth.signOut();
      throw new Error("Akses ditolak: bukan CMS admin");
    }
    setIsCmsAdmin(true);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setIsCmsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({ session, user, isCmsAdmin, loading, signIn, signOut }),
    [session, user, isCmsAdmin, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
