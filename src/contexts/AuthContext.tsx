import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api, setToken } from '@/lib/api';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, meta?: { first_name?: string; last_name?: string }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = useMemo(() => String((user as any)?.role || '') === 'admin', [user]);

  useEffect(() => {
    api.get('/auth/me')
      .then((data: any) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, meta?: { first_name?: string; last_name?: string }) => {
    const data = await api.post('/auth/signup', {
      email,
      password,
      first_name: meta?.first_name,
      last_name: meta?.last_name,
    });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const data = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signInWithGoogle = async () => {
    throw new Error('Google login will be added after Hostinger deploy (needs OAuth redirect URL).');
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
