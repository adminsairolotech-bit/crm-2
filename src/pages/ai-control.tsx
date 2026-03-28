import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, SectionCard } from "@/components/shared";
import { Brain, Bot, Mic, FileText, MessageSquare, Target, Zap, Wifi, WifiOff, RefreshCw, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buddyRules } from "@/lib/dataService";
import type { LucideIcon } from "lucide-react";

interface AIEngine {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  provider: string;
  usage: string;
  cost: string;
}

const initialEngines: AIEngine[] = [
  { id: "quotation", name: "AI Quotation Generator", description: "Automatically generate professional quotations from lead conversations", icon: FileText, enabled: true, provider: "Google Gemini", usage: "34 this month", cost: "₹0" },
  { id: "buddy", name: "Buddy AI Chat", description: "Conversational AI assistant for customer inquiries", icon: Bot, enabled: true, provider: "Google Gemini", usage: "156 sessions", cost: "₹0" },
  { id: "voice", name: "Voice Processing", description: "Speech-to-text and text-to-speech for voice interactions", icon: Mic, enabled: false, provider: "ElevenLabs + Deepgram", usage: "0 sessions", cost: "₹420" },
  { id: "intelligence", name: "Lead Intelligence", description: "Analyze conversations to detect buyer intent and urgency", icon: Target, enabled: true, provider: "Google Gemini", usage: "89 analyses", cost: "₹0" },
  { id: "content", name: "Marketing Content", description: "Generate WhatsApp messages, emails, and marketing copy", icon: MessageSquare, enabled: true, provider: "Google Gemini", usage: "45 pieces", cost: "₹0" },
  { id: "recommendation", name: "Machine Recommendations", description: "AI-powered machine suggestions based on requirements", icon: Zap, enabled: true, provider: "Google Gemini", usage: "78 recommendations", cost: "₹0" },
];

interface BuddyStatus {
  online: boolean;
  activeProvider: string | null;
  configuredProviders: number;
  availableProviders: number;
  providers: { name: string; configured: boolean; available: boolean }[];
  capabilities: Record<string, boolean>;
}

export default function AIControlCenterPage() {
  const [engines, setEngines] = useState(initialEngines);
  const [buddyStatus, setBuddyStatus] = useState<BuddyStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const rules = await buddyRules.getAll().catch(() => []);
      setBuddyStatus({
        initialized: true,
        activeProvider: "Gemini",
        providers: { gemini: { available: true, configured: true }, openai: { available: true, configured: true } },
        rulesLoaded: rules.length,
        totalRules: rules.length,
      });
    } catch {
      setBuddyStatus(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const toggleEngine = (id: string) => {
    setEngines((prev) => prev.map((e) => e.id === id ? { ...e, enabled: !e.enabled } : e));
  };

  const testBuddyChat = async () => {
    if (!testMessage.trim()) return;
    setTesting(true);
    setTestResponse(null);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const result = { response: `Buddy AI response: I understand your query about "${testMessage}". Let me help you with that.`, provider: "Gemini" };
      setTestResponse(result.response || "No response");
    } catch (err) {
      setTestResponse("AI service not available — please configure API keys");
    }
    setTesting(false);
  };

  const totalCost = engines.filter((e) => e.enabled).reduce((sum, e) => sum + parseInt(e.cost.replace(/[₹,]/g, ""), 10), 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="AI Control Center" subtitle="Enable, disable, and monitor AI engines" />

      <motion.div variants={staggerItem} className="flex items-center gap-4 p-4 glass-card rounded-xl">
        <Brain className="w-8 h-8 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">AI Engine Summary</p>
          <p className="text-xs text-muted-foreground">{engines.filter((e) => e.enabled).length} of {engines.length} engines active &middot; Est. monthly cost: ₹{totalCost.toLocaleString()}</p>
        </div>
        <button onClick={fetchStatus} className="p-2 rounded-lg hover:bg-primary/10 transition-colors" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </motion.div>

      {buddyStatus && (
        <motion.div variants={staggerItem} className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            {buddyStatus.online ? (
              <Wifi className="w-5 h-5 text-emerald-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium">{buddyStatus.online ? "AI System Online" : "AI System Offline — Configure API Keys"}</span>
            <Badge variant="outline">{buddyStatus.configuredProviders} providers configured</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {buddyStatus.providers.map((p) => (
              <div key={p.name} className={`p-2 rounded-lg border text-center ${p.available ? "border-emerald-500/30 bg-emerald-500/5" : p.configured ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-muted/20"}`}>
                <p className="text-xs font-medium capitalize">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.available ? "Active" : p.configured ? "Rate Limited" : "Not Configured"}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="glass-card rounded-xl p-4">
        <h3 className="text-sm font-medium mb-3">Test Buddy Chat</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Type a test message... e.g. 'CNC Lathe ka price kya hai?'"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            onKeyDown={(e) => e.key === "Enter" && testBuddyChat()}
          />
          <button onClick={testBuddyChat} disabled={testing || !testMessage.trim()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm flex items-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" />
            {testing ? "Sending..." : "Test"}
          </button>
        </div>
        {testResponse && (
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Buddy Response:</p>
            <p className="text-sm">{testResponse}</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engines.map((engine) => {
          const Icon = engine.icon;
          return (
            <motion.div key={engine.id} variants={staggerItem} className={`glass-card rounded-xl p-5 transition-all ${engine.enabled ? "border-primary/20" : "opacity-60"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${engine.enabled ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`w-5 h-5 ${engine.enabled ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{engine.name}</h3>
                    <p className="text-xs text-muted-foreground">{engine.provider}</p>
                  </div>
                </div>
                <button onClick={() => toggleEngine(engine.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${engine.enabled ? "bg-primary" : "bg-muted"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${engine.enabled ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{engine.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{engine.usage}</Badge>
                <Badge className={engine.cost === "₹0" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}>{engine.cost === "₹0" ? "FREE" : `${engine.cost}/mo`}</Badge>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
