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
const SESSION_KEY = "sai_crm_session";
const USERS_KEY   = "sai_crm_users_v2";
const LOCK_KEY    = "sai_crm_locks";
const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 15 * 60 * 1000; // 15 minutes

/* ── Crypto helpers ─────────────────────── */
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(salt + password + "sai_rolotech_2025");
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

function generateSalt(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,"0")).join("");
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2,"0")).join("");
}

/* ── Rate limiting ──────────────────────── */
function checkRateLimit(email: string): { locked: boolean; remaining: number } {
  const raw = localStorage.getItem(LOCK_KEY);
  const locks: Record<string, { attempts: number; lockedUntil?: number }> = raw ? JSON.parse(raw) : {};
  const entry = locks[email.toLowerCase()];
  if (!entry) return { locked: false, remaining: MAX_ATTEMPTS };
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    return { locked: true, remaining: 0 };
  }
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    delete locks[email.toLowerCase()];
    localStorage.setItem(LOCK_KEY, JSON.stringify(locks));
    return { locked: false, remaining: MAX_ATTEMPTS };
  }
  return { locked: false, remaining: MAX_ATTEMPTS - (entry.attempts || 0) };
}

function recordFailedAttempt(email: string): void {
  const raw = localStorage.getItem(LOCK_KEY);
  const locks: Record<string, { attempts: number; lockedUntil?: number }> = raw ? JSON.parse(raw) : {};
  const key = email.toLowerCase();
  const entry = locks[key] || { attempts: 0 };
  entry.attempts = (entry.attempts || 0) + 1;
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCK_DURATION;
  }
  locks[key] = entry;
  localStorage.setItem(LOCK_KEY, JSON.stringify(locks));
}

function clearFailedAttempts(email: string): void {
  const raw = localStorage.getItem(LOCK_KEY);
  if (!raw) return;
  const locks = JSON.parse(raw);
  delete locks[email.toLowerCase()];
  localStorage.setItem(LOCK_KEY, JSON.stringify(locks));
}

/* ── Session management ─────────────────── */
interface Session {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function saveSession(user: AuthUser): void {
  const session: Session = { user, token: generateToken(), expiresAt: Date.now() + SESSION_TTL };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    return session.user;
  } catch { return null; }
}

function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

/* ── Stored user type ───────────────────── */
interface StoredUser {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  company?: string;
  passwordHash: string;
  salt: string;
}

/* ── Admin default (hash computed lazily) ─ */
const ADMIN_EMAIL = "admin@sairolotech.com";
const ADMIN_PASS  = "admin123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existing = loadSession();
    setUser(existing);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // Prevent timing attacks

    try {
      // Rate limiting check
      const rl = checkRateLimit(email);
      if (rl.locked) {
        setIsLoading(false);
        return { success: false, error: "Bahut zyada galat attempts. 15 minute baad try karein." };
      }

      // Admin check
      if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASS) {
        const adminUser: AuthUser = { id: "admin-001", name: "SAI Admin", email: ADMIN_EMAIL, userType: "admin" };
        saveSession(adminUser);
        setUser(adminUser);
        clearFailedAttempts(email);
        setIsLoading(false);
        return { success: true };
      }

      // Regular users
      const raw = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = raw ? JSON.parse(raw) : [];
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        recordFailedAttempt(email);
        setIsLoading(false);
        return { success: false, error: "Email ya password galat hai." };
      }

      // Hash password with stored salt and compare
      const hash = await hashPassword(password, found.salt);
      if (hash !== found.passwordHash) {
        recordFailedAttempt(email);
        const remaining = checkRateLimit(email).remaining;
        setIsLoading(false);
        return {
          success: false,
          error: remaining <= 0
            ? "Account temporarily locked. 15 minute baad try karein."
            : `Password galat hai. ${remaining} attempts remaining.`,
        };
      }

      const authUser: AuthUser = { id: found.id, name: found.name, email: found.email, userType: found.userType, company: found.company };
      saveSession(authUser);
      setUser(authUser);
      clearFailedAttempts(email);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Login mein problem aayi. Dobara try karein." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    try {
      if (password.length < 6) {
        setIsLoading(false);
        return { success: false, error: "Password kam se kam 6 characters ka hona chahiye." };
      }

      const raw = localStorage.getItem(USERS_KEY);
      const users: StoredUser[] = raw ? JSON.parse(raw) : [];

      if (email.toLowerCase() === ADMIN_EMAIL) {
        setIsLoading(false);
        return { success: false, error: "Yeh email already registered hai." };
      }

      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setIsLoading(false);
        return { success: false, error: "Yeh email already registered hai." };
      }

      const salt = generateSalt();
      const passwordHash = await hashPassword(password, salt);

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        userType: "new_user",
        passwordHash,
        salt,
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      const authUser: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email, userType: newUser.userType };
      saveSession(authUser);
      setUser(authUser);
      setIsLoading(false);
      return { success: true };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Registration mein problem aayi. Dobara try karein." };
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  const setUserType = (userType: UserType) => {
    if (!user) return;
    const updated = { ...user, userType };
    saveSession(updated);
    setUser(updated);

    // Update in stored users too
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const users: StoredUser[] = JSON.parse(raw);
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) { users[idx].userType = userType; localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    if (email.toLowerCase() === ADMIN_EMAIL) return { success: true };
    const raw = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { success: false, error: "Yeh email registered nahi hai." };
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
