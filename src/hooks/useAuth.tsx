import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

interface User {
  id: string;
  username: string;
  created_at: number;
  last_login: number | null;
}

interface Session {
  token: string;
  user_id: string;
  created_at: number;
  expires_at: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session token
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateSession(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateSession = async (token: string) => {
    try {
      const user = await invoke<User>('validate_session', { token });
      setUser(user);
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const session = await invoke<Session>('login', { username, password });
      localStorage.setItem('auth_token', session.token);
      const user = await invoke<User>('validate_session', { token: session.token });
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      await invoke<User>('register', { username, password });
      // Auto-login after registration
      await login(username, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await invoke('logout', { token });
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
