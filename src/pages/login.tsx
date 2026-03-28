import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Fields required", description: "Email aur password dono bharen.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      const stored = localStorage.getItem("sai_crm_auth_user");
      const user = stored ? JSON.parse(stored) : null;
      if (user?.userType === "admin") {
        setLocation("/select-mode");
      } else if (user?.userType === "new_user") {
        setLocation("/role-select");
      } else if (user?.userType === "machine_user" || user?.userType === "operator") {
        setLocation("/");
      } else if (user?.userType === "supplier") {
        setLocation("/map-view");
      } else {
        setLocation("/home");
      }
      toast({ title: "Welcome!", description: `Namaste, ${user?.name}` });
    } else {
      toast({ title: "Login Failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-white text-2xl font-bold">SR</span>
          </div>
          <h1 className="text-3xl font-bold text-white">SAI RoloTech</h1>
          <p className="text-slate-400 mt-1 text-sm">Industrial Automation CRM Portal</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-violet-400" />
            Login karein
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aapka@email.com"
                autoComplete="email"
                className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-slate-900/70 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setLocation("/forgot-password")}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Password bhool gaye?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-center text-slate-400 text-sm mb-4">Naya account chahiye?</p>
            <button
              onClick={() => setLocation("/register")}
              className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-200 font-medium rounded-xl py-3 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5 text-green-400" />
              Naya Account Banayein
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-amber-400/80 text-xs">
              Admin ke liye: apna registered admin email aur password use karein
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © 2025 SAI RoloTech · Industrial Automation Solutions
        </p>
      </motion.div>
    </div>
  );
}
