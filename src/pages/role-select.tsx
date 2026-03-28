import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Cpu, Package2, Wrench, Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth, type UserType } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const roles = [
  {
    id: "new_user" as UserType,
    icon: Star,
    emoji: "🌟",
    title: "New SAI RoloTech User",
    hindiTitle: "Naya SAI RoloTech User",
    description: "Hum SAI RoloTech ke baare mein jaanna chahte hain – machines, products aur services explore karein.",
    color: "from-violet-600 to-purple-600",
    borderColor: "border-violet-500/50",
    bgColor: "bg-violet-500/10",
    destination: "/home",
  },
  {
    id: "machine_user" as UserType,
    icon: Cpu,
    emoji: "⚙️",
    title: "SAI RoloTech Machine User",
    hindiTitle: "Machine Operator / Employee",
    description: "Main SAI RoloTech mein kaam karta hoon ya humare machines use karta hoon.",
    color: "from-blue-600 to-cyan-600",
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-500/10",
    destination: "/",
  },
  {
    id: "supplier" as UserType,
    icon: Package2,
    emoji: "📦",
    title: "G.P Raw Material Supplier",
    hindiTitle: "Kaccha Maal Supplier",
    description: "Main SAI RoloTech ko raw material supply karta hoon – Gauge Plates, Steel, etc.",
    color: "from-green-600 to-emerald-600",
    borderColor: "border-green-500/50",
    bgColor: "bg-green-500/10",
    destination: "/map-view",
  },
  {
    id: "operator" as UserType,
    icon: Wrench,
    emoji: "🔧",
    title: "Roll Forming Machine Operator",
    hindiTitle: "Roll Forming Operator",
    description: "Main Roll Forming Machine operate karta hoon aur operations manage karta hoon.",
    color: "from-orange-600 to-amber-600",
    borderColor: "border-orange-500/50",
    bgColor: "bg-orange-500/10",
    destination: "/home",
  },
];

export default function RoleSelectPage() {
  const [, setLocation] = useLocation();
  const { user, setUserType } = useAuth();
  const [selected, setSelected] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selected) {
      toast({ title: "Role chunein", description: "Aage badhne ke liye ek option select karein.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setUserType(selected);
    await new Promise((r) => setTimeout(r, 400));
    const role = roles.find((r) => r.id === selected);
    setLoading(false);
    toast({ title: "Profile set ho gaya!", description: `Welcome ${user?.name}! Aapka account ready hai.` });
    setLocation(role?.destination || "/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 rounded-full bg-green-600/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 mb-4 shadow-lg shadow-violet-500/30">
            <span className="text-white text-2xl font-bold">SR</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Namaste, {user?.name?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-slate-400 mt-2">
            Aap kaun hain? Apna role chunein taki hum aapko sahi experience de sakein.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selected === role.id;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelected(role.id)}
                className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? `${role.borderColor} ${role.bgColor} shadow-lg`
                    : "border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/60"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} mb-3 shadow-md`}>
                  <span className="text-xl">{role.emoji}</span>
                </div>
                <h3 className="text-white font-semibold text-base mb-0.5">{role.title}</h3>
                <p className="text-slate-400 text-xs mb-2">{role.hindiTitle}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{role.description}</p>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleContinue}
          disabled={!selected || loading}
          className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-4 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 text-lg"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Aage Badhein
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
