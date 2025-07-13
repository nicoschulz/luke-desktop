import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { invoke } from '@tauri-apps/api';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface Session {
  token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // const user = await invoke<User>('validate_session', { token });
          const user = await Promise.resolve({ id: '1', username: 'dummy' } as User);
          setUser(user);
        }
      } catch (err) {
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (username: string, _password: string) => {
    try {
      setError(null);
      // const session = await invoke<Session>('login', { username, password });
      const session = await Promise.resolve({ 
        token: 'dummy-token', 
        user: { id: '1', username } 
      } as Session);
      // const user = await invoke<User>('validate_session', { token: session.token });
      const user = await Promise.resolve({ id: '1', username } as User);
      
      localStorage.setItem('auth_token', session.token);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      // await invoke<User>('register', { username, password });
      await Promise.resolve();
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    }
  };

  const register = async (_username: string, _password: string) => {
    try {
      setError(null);
      // await invoke<User>('register', { username, password });
      await Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
