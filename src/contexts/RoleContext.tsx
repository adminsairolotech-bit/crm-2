import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "admin" | "supplier" | "machine_user";

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

function resolveRoleFromAuth(): UserRole {
  try {
    const stored = localStorage.getItem("sai_crm_auth_user");
    if (stored) {
      const user = JSON.parse(stored);
      if (user.userType === "admin") return "admin";
      if (user.userType === "supplier") return "supplier";
      if (user.userType === "machine_user" || user.userType === "operator") return "machine_user";
    }
  } catch {
    // ignore
  }
  return "admin";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(resolveRoleFromAuth);

  useEffect(() => {
    const resolved = resolveRoleFromAuth();
    setRole(resolved);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}
