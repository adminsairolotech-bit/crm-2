import { ReactNode, useState, useCallback, useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { SearchProvider, useSearch } from "./SearchContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { getAdaptiveAnimations } from "@/lib/animations";
import { Bell, Search, Menu, Eye, LayoutDashboard, LogOut } from "lucide-react";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { useAdminMode } from "@/contexts/AdminModeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";
import { BuddyToggleButton, BuddyPanel } from "@/components/BuddyPanel";
import { AIProviderBadge } from "@/components/AIProviderBadge";
import { toast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Super Admin",
  supplier: "Supplier",
  machine_user: "Machine User",
};

const ROLE_INITIALS: Record<UserRole, string> = {
  admin: "AD",
  supplier: "SP",
  machine_user: "MU",
};

interface LayoutProps {
  children: ReactNode;
}

function ModeSwitcher() {
  const { mode, setMode } = useAdminMode();
  const { role } = useRole();

  if (role !== "admin") return null;

  return (
    <button
      onClick={() => setMode(mode === "editor" ? "visitor" : "editor")}
      title={mode === "editor" ? "Switch to Visitor Preview" : "Switch to CRM Editor"}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground"
    >
      {mode === "editor" ? (
        <>
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </>
      ) : (
        <>
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Editor</span>
        </>
      )}
    </button>
  );
}

function Header({
  mobileOpen,
  onMenuToggle,
  onBuddyToggle,
  buddyOpen,
}: {
  mobileOpen: boolean;
  onMenuToggle: () => void;
  onBuddyToggle: () => void;
  buddyOpen: boolean;
}) {
  const { query, setQuery } = useSearch();
  const { role } = useRole();
  const { isEditor } = useAdminMode();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
    toast({ title: "Logged out", description: "Aap successfully logout ho gaye." });
  };

  return (
    <header className="h-14 md:h-16 glass-header flex items-center px-4 md:px-6 lg:px-8 sticky top-0 z-20 gap-3">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 -ml-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-drawer"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative w-full max-w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything..."
            aria-label="Search"
            className="w-full glass-input rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        {role === "admin" && <AIProviderBadge />}
        <ModeSwitcher />
        {isEditor && role === "admin" && (
          <BuddyToggleButton onClick={onBuddyToggle} isOpen={buddyOpen} />
        )}
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
        </button>
        <div className="h-8 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs bg-[hsl(var(--primary))]">
              {user?.name ? user.name.charAt(0).toUpperCase() : ROLE_INITIALS[role]}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-foreground leading-tight">
                {user?.name || ROLE_LABELS[role]}
              </p>
              <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [buddyOpen, setBuddyOpen] = useState(false);
  const device = useDeviceCapability();
  const anim = useMemo(
    () => getAdaptiveAnimations(device.tier, device.prefersReducedMotion),
    [device.tier, device.prefersReducedMotion]
  );

  const handleMenuToggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const handleMobileOpen = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const handleBuddyToggle = useCallback(() => {
    setBuddyOpen((prev) => !prev);
  }, []);

  const handleBuddyClose = useCallback(() => {
    setBuddyOpen(false);
  }, []);

  useSwipeNavigation({
    onSwipeRight: handleMobileOpen,
    onSwipeLeft: handleMobileClose,
    enabled: device.touchDevice && device.screenType !== "desktop",
    edgeWidth: 30,
    threshold: 50,
  });

  return (
    <SearchProvider>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="flex min-h-screen bg-background text-foreground font-sans">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 w-0">
          <Header mobileOpen={mobileOpen} onMenuToggle={handleMenuToggle} onBuddyToggle={handleBuddyToggle} buddyOpen={buddyOpen} />
          <div id="main-content" className="flex-1 overflow-auto scroll-optimized p-4 sm:p-6 lg:p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                variants={anim.pageTransition}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={anim.smoothTransition}
                className="max-w-6xl mx-auto w-full h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        <BuddyPanel isOpen={buddyOpen} onClose={handleBuddyClose} />
      </div>
    </SearchProvider>
  );
}
