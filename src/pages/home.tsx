import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Cpu, MapPin, FileText, MessageSquare, Phone, Mail, Star,
  Shield, ChevronRight, Wrench, Package2, BarChart3, Zap,
  Factory, Settings, LogOut, User, Bot, Sparkles, IndianRupee, Search, ThumbsUp, ThumbsDown, Upload, Settings2, ClipboardList
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const featureCategories = [
  {
    title: "🏭 Hamare Products",
    color: "from-violet-600 to-purple-600",
    borderColor: "border-violet-500/30",
    items: [
      { icon: Cpu, label: "Machine Catalog", desc: "PLC, HMI, SCADA, VFD, Servo Motors dekhein", href: "/machines" },
      { icon: Package2, label: "Supplier Network", desc: "Raw material suppliers ki list", href: "/suppliers" },
      { icon: Factory, label: "Roll Forming Machines", desc: "Industrial roll forming solutions", href: "/machines" },
    ],
  },
  {
    title: "📋 Services & Support",
    color: "from-blue-600 to-cyan-600",
    borderColor: "border-blue-500/30",
    items: [
      { icon: Wrench, label: "Service Request", desc: "Machine repair ya maintenance book karein", href: "/service-manager" },
      { icon: FileText, label: "Quotation Maangein", desc: "Price quote ke liye request karein", href: "/quotation-maker" },
      { icon: Settings, label: "Demo Schedule", desc: "Machine demo book karein", href: "/demo-scheduler" },
    ],
  },
  {
    title: "🤖 AI Assistant",
    color: "from-green-600 to-emerald-600",
    borderColor: "border-green-500/30",
    items: [
      { icon: MessageSquare, label: "Buddy AI Chat", desc: "Hinglish mein koi bhi sawaal poochein", href: "/buddy" },
      { icon: Zap, label: "Smart Quotations", desc: "AI se instant price estimate", href: "/quotation-maker" },
      { icon: Star, label: "Lead Intelligence", desc: "Business opportunities track karein", href: "/lead-intelligence" },
    ],
  },
  {
    title: "📍 Location & Contact",
    color: "from-orange-600 to-amber-600",
    borderColor: "border-orange-500/30",
    items: [
      { icon: MapPin, label: "Showroom Map", desc: "Hamare showrooms ka location dekhein", href: "/map-view" },
      { icon: BarChart3, label: "Growth Reports", desc: "Business analytics aur charts", href: "/graphs" },
      { icon: Phone, label: "Contact Us", desc: "+91 98765 43210 · Inquiries", href: "/feedback" },
    ],
  },
];

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/login");
    toast({ title: "Logged out", description: "Aap successfully logout ho gaye hain." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-blue-600/8 blur-3xl" />
      </div>

      <header className="relative border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">SR</span>
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-tight">SAI RoloTech</h1>
              <p className="text-slate-500 text-xs">Industrial Automation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocation("/role-select")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{user?.name?.split(" ")[0] || "Profile"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-violet-300 text-sm">Welcome to SAI RoloTech Portal</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Namaste, {user?.name?.split(" ")[0] || "User"}! 🙏
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            SAI RoloTech ke portal mein aapka swagat hai. Yahan se aap hamare sabhi products, services aur support access kar sakte hain.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setLocation("/buddy")}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25"
            >
              <MessageSquare className="w-4 h-4" />
              Buddy AI se baat karein
            </button>
            <button
              onClick={() => setLocation("/machines")}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-medium transition-all"
            >
              <Cpu className="w-4 h-4" />
              Products dekhein
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => setLocation("/ai-quote")}
            className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-blue-700 hover:from-violet-600 hover:via-purple-600 hover:to-blue-600 border border-violet-500/40 rounded-2xl p-5 text-left transition-all duration-300 group shadow-xl shadow-violet-900/40"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-600/20 via-transparent to-blue-600/20" />
            <div className="absolute top-2 right-3 text-base opacity-50 group-hover:opacity-100 transition-opacity">✨🤖📄</div>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider">New</span>
              </div>
              <h3 className="text-white text-base font-bold leading-tight">AI Quotation Maker</h3>
              <p className="text-violet-200 text-xs mt-1">Requirements batayein — professional quotation instantly taiyar</p>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1 text-white text-xs">
                  <IndianRupee className="w-3 h-3" /> Instant Quote
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setLocation("/quote-analyzer")}
            className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-cyan-800 to-teal-800 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 border border-blue-500/40 rounded-2xl p-5 text-left transition-all duration-300 group shadow-xl shadow-blue-900/40"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-600/20 via-transparent to-cyan-600/20" />
            <div className="absolute top-2 right-3 text-base opacity-50 group-hover:opacity-100 transition-opacity">🔍📊✅</div>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span className="text-cyan-300 text-xs font-semibold uppercase tracking-wider">New</span>
              </div>
              <h3 className="text-white text-base font-bold leading-tight">AI Quotation Analyzer</h3>
              <p className="text-blue-200 text-xs mt-1">Kisi bhi company ki quote paste karein — AI batayega kya sahi hai, kya galat</p>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1 text-white text-xs">
                  <ThumbsUp className="w-3 h-3" /> Pro &amp; Con Analysis
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <button
            onClick={() => setLocation("/machine-guide")}
            className="relative overflow-hidden bg-gradient-to-br from-orange-800 via-red-800 to-rose-800 hover:from-orange-700 hover:via-red-700 hover:to-rose-700 border border-orange-500/40 rounded-2xl p-5 text-left transition-all duration-300 group shadow-xl shadow-orange-900/40"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-600/20 via-transparent to-red-600/20" />
            <div className="absolute top-2 right-3 text-base opacity-50 group-hover:opacity-100 transition-opacity">🔧⚙️🤖</div>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Settings2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3 h-3 text-orange-300" />
                <span className="text-orange-300 text-xs font-semibold uppercase tracking-wider">AI Master</span>
              </div>
              <h3 className="text-white text-base font-bold leading-tight">Machine Troubleshooter</h3>
              <p className="text-orange-100 text-xs mt-1">Strip left/right/upar? Wave? Twist? — AI Master step-by-step fix batayega</p>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1 text-white text-xs">
                  🔧 Instant Fix Guide
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setLocation("/custom-profile")}
            className="relative overflow-hidden bg-gradient-to-br from-green-800 via-emerald-800 to-teal-800 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 border border-green-500/40 rounded-2xl p-5 text-left transition-all duration-300 group shadow-xl shadow-green-900/40"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-green-600/20 via-transparent to-teal-600/20" />
            <div className="absolute top-2 right-3 text-base opacity-50 group-hover:opacity-100 transition-opacity">🏭📐📄</div>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Upload className="w-3 h-3 text-green-300" />
                <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Roll Forming</span>
              </div>
              <h3 className="text-white text-base font-bold leading-tight">Custom Profile Inquiry</h3>
              <p className="text-green-100 text-xs mt-1">DXF/DWG/PDF upload · Thickness, Width, Punching select karein</p>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1 text-white text-xs">
                  📐 Upload Profile
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setLocation("/maintenance-guide")}
            className="relative overflow-hidden bg-gradient-to-br from-yellow-800 via-amber-800 to-orange-800 hover:from-yellow-700 hover:via-amber-700 hover:to-orange-700 border border-yellow-500/40 rounded-2xl p-5 text-left transition-all duration-300 group shadow-xl shadow-yellow-900/40"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-yellow-600/20 via-transparent to-amber-600/20" />
            <div className="absolute top-2 right-3 text-base opacity-50 group-hover:opacity-100 transition-opacity">🔩📋✅</div>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-3 h-3 text-yellow-300" />
                <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider">Maintenance</span>
              </div>
              <h3 className="text-white text-base font-bold leading-tight">Machine Maintenance Guide</h3>
              <p className="text-yellow-100 text-xs mt-1">Daily, Weekly, Monthly schedule · Checklist · Spare parts guide</p>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 bg-white/10 rounded-full px-2.5 py-1 text-white text-xs">
                  📋 Full Schedule
                </span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featureCategories.map((category, catIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 + 0.2 }}
              className={`bg-slate-800/50 backdrop-blur-sm border ${category.borderColor} rounded-2xl p-5`}
            >
              <h3 className="text-white font-semibold text-base mb-4">{category.title}</h3>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setLocation(item.href)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all group text-left"
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4.5 h-4.5 text-white" style={{ width: "18px", height: "18px" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">{item.label}</div>
                        <div className="text-slate-500 text-xs truncate">{item.desc}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold">Admin / Staff hain?</h4>
              <p className="text-slate-400 text-sm">Full CRM access ke liye admin panel mein jayein</p>
            </div>
          </div>
          <button
            onClick={() => {
              setLocation("/select-mode");
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl font-medium transition-all whitespace-nowrap"
          >
            <Shield className="w-4 h-4" />
            CRM Admin Panel
          </button>
        </motion.div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Products", value: "50+", color: "text-violet-400" },
            { label: "Cities", value: "25+", color: "text-blue-400" },
            { label: "Clients", value: "500+", color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-500 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            +91 98765 43210
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            inquirysairolotech@gmail.com
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Pune, Maharashtra
          </div>
        </div>
      </main>
    </div>
  );
}
