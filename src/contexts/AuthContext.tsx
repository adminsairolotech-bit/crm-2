import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserType = "admin" | "machine_user" | "supplier" | "new_user" | "operator";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  company?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUserType: (userType: UserType) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "sai_crm_auth_user";

const DEMO_ADMIN = {
  id: "admin-001",
  name: "SAI Admin",
  email: "admin@sairolotech.com",
  userType: "admin" as UserType,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const persistUser = (u: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));

      if (email === "admin@sairolotech.com" && password === "admin123") {
        persistUser(DEMO_ADMIN);
        setIsLoading(false);
        return { success: true };
      }

      const stored = localStorage.getItem("sai_crm_users");
      const users: (AuthUser & { password: string })[] = stored ? JSON.parse(stored) : [];
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (found) {
        const { password: _pw, ...rest } = found;
        persistUser(rest);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Email ya password galat hai. Dobara try karein." };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Login mein problem aayi. Internet check karein." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));

      const stored = localStorage.getItem("sai_crm_users");
      const users: (AuthUser & { password: string })[] = stored ? JSON.parse(stored) : [];

      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setIsLoading(false);
        return { success: false, error: "Yeh email already registered hai." };
      }

      const newUser: AuthUser & { password: string } = {
        id: `user-${Date.now()}`,
        name,
        email,
        password,
        userType: "new_user",
      };

      users.push(newUser);
      localStorage.setItem("sai_crm_users", JSON.stringify(users));

      const { password: _pw, ...rest } = newUser;
      persistUser(rest);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Registration mein problem aayi. Dobara try karein." };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const setUserType = (userType: UserType) => {
    if (!user) return;
    const updated = { ...user, userType };
    persistUser(updated);
    const stored = localStorage.getItem("sai_crm_users");
    if (stored) {
      const users: (AuthUser & { password: string })[] = JSON.parse(stored);
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], userType };
        localStorage.setItem("sai_crm_users", JSON.stringify(users));
      }
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    const stored = localStorage.getItem("sai_crm_users");
    const users: (AuthUser & { password: string })[] = stored ? JSON.parse(stored) : [];
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found && email !== "admin@sairolotech.com") {
      return { success: false, error: "Yeh email registered nahi hai." };
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, setUserType, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
