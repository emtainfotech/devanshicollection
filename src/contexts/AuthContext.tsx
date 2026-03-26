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
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = useMemo(() => String((user as any)?.role || '') === 'admin', [user]);

  const fetchUser = async () => {
    try {
      const data: any = await api.get('/auth/me');
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const signUp = async (email: string, password: string, meta?: { first_name?: string; last_name?: string; phone?: string }) => {
    const data = await api.post('/auth/signup', {
      email,
      password,
      first_name: meta?.first_name,
      last_name: meta?.last_name,
      phone: meta?.phone,
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
    window.location.href = `${api.BASE}/auth/google`;
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
  };

  const handleSetToken = (token: string | null) => {
    setToken(token);
    if (token) {
      fetchUser();
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signInWithGoogle, signOut, setToken: handleSetToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
