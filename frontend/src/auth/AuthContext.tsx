import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  token: string;
  userId: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  async function authRequest(url: string, body: object) {
    setError(null);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  async function login(email: string, password: string) {
    try {
      const data = await authRequest('/api/v1/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (e: any) { setError(e.message); }
  }

  async function register(email: string, username: string, password: string) {
    try {
      const data = await authRequest('/api/v1/auth/register', { email, username, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (e: any) { setError(e.message); }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}
