import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  recoverPassword: (userId: string) => { success: boolean; message?: string; error?: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS = [
  { id: 'admin001', password: 'admin@123', name: 'Admin User', role: 'Admin' },
  { id: 'user001', password: 'user@123', name: 'Sales User', role: 'Sales' },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = await SecureStore.getItemAsync('crm_user');
        if (saved) setUser(JSON.parse(saved));
      } catch {}
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (userId: string, password: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId && u.password === password);
    if (found) {
      const userData = { id: found.id, name: found.name, role: found.role };
      setUser(userData);
      await SecureStore.setItemAsync('crm_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Galat User ID ya Password hai.' };
  };

  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('crm_user');
  };

  const recoverPassword = (userId: string) => {
    const found = DEMO_USERS.find((u) => u.id === userId);
    if (found) {
      return { success: true, message: 'Password recovery link aapke registered email par bhej diya gaya hai.' };
    }
    return { success: false, error: 'Yeh User ID register nahi hai.' };
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, recoverPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
