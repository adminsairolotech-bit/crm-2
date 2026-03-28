import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, SectionCard } from "@/components/shared";
import { Settings, Key, Bell, Zap, Globe, Shield, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const initialToggles: FeatureToggle[] = [
  { id: "ai_quotation", name: "AI Quotation Generation", description: "Auto-generate quotations from lead conversations", enabled: true },
  { id: "ai_buddy", name: "Buddy AI Chat", description: "AI-powered chat assistant for customers", enabled: true },
  { id: "lead_intelligence", name: "Lead Intelligence", description: "AI analysis of buyer intent from conversations", enabled: true },
  { id: "push_notifications", name: "Push Notifications", description: "Send push notifications to mobile users", enabled: false },
  { id: "auto_followup", name: "Auto Follow-up", description: "Automated follow-up messages via WhatsApp/Email", enabled: false },
  { id: "voice_processing", name: "Voice Processing", description: "Speech-to-text and text-to-speech capabilities", enabled: false },
];

const apiKeyConfig = [
  { name: "Gemini API Key", env: "GEMINI_API_KEYS", masked: "sk-gem•••••••••••hK2", status: "active" },
  { name: "ElevenLabs API Key", env: "ELEVENLABS_API_KEY", masked: "el-•••••••not set", status: "missing" },
  { name: "Deepgram API Key", env: "DEEPGRAM_API_KEY", masked: "dg-•••••••not set", status: "missing" },
  { name: "AssemblyAI API Key", env: "ASSEMBLYAI_API_KEY", masked: "aa-•••••••not set", status: "missing" },
  { name: "Firebase Project ID", env: "VITE_FIREBASE_PROJECT_ID", masked: "sai-rolo•••••tech", status: "active" },
];

const notificationSettings = [
  { name: "New Lead Alerts", description: "Notify when a new lead registers", enabled: true },
  { name: "High-Intent Alerts", description: "Alert when AI detects high buyer intent", enabled: true },
  { name: "Demo Reminders", description: "Send reminders before scheduled demos", enabled: true },
  { name: "Quotation Updates", description: "Notify when quotation status changes", enabled: false },
  { name: "Weekly Summary", description: "Send weekly performance summary email", enabled: false },
];

export default function SettingsPage() {
  const [toggles, setToggles] = useState(initialToggles);
  const [notifs, setNotifs] = useState(notificationSettings);

  const toggleFeature = (id: string) => {
    setToggles((prev) => prev.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const toggleNotif = (name: string) => {
    setNotifs((prev) => prev.map((n) => n.name === name ? { ...n, enabled: !n.enabled } : n));
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Settings" subtitle="System configuration and feature management" />

      <SectionCard title="API Keys" headerAction={<Key className="w-4 h-4 text-muted-foreground" />}>
        <div className="space-y-3">
          {apiKeyConfig.map((key) => (
            <motion.div key={key.name} variants={staggerItem} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{key.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{key.masked}</p>
              </div>
              <Badge className={key.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}>
                {key.status}
              </Badge>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Notification Settings" headerAction={<Bell className="w-4 h-4 text-muted-foreground" />}>
        <div className="space-y-3">
          {notifs.map((notif) => (
            <motion.div key={notif.name} variants={staggerItem} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{notif.name}</p>
                <p className="text-xs text-muted-foreground">{notif.description}</p>
              </div>
              <button onClick={() => toggleNotif(notif.name)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notif.enabled ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notif.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Feature Toggles" headerAction={<Zap className="w-4 h-4 text-muted-foreground" />}>
        <div className="space-y-3">
          {toggles.map((toggle) => (
            <motion.div key={toggle.id} variants={staggerItem} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">{toggle.name}</p>
                <p className="text-xs text-muted-foreground">{toggle.description}</p>
              </div>
              <button onClick={() => toggleFeature(toggle.id)}
                className={`relative w-11 h-6 rounded-full transition-colors ${toggle.enabled ? "bg-primary" : "bg-muted"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${toggle.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="General" headerAction={<Globe className="w-4 h-4 text-muted-foreground" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Company Name</label>
            <input type="text" defaultValue="Sai Rolotech"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Support Email</label>
            <input type="email" defaultValue="support@sairolotech.com"
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Default Currency</label>
            <select defaultValue="INR" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Max API Calls/Day</label>
            <input type="number" defaultValue={1000}
              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground" />
          </div>
        </div>
        <div className="mt-4">
          <Button className="gap-2"><Save className="w-4 h-4" /> Save Settings</Button>
        </div>
      </SectionCard>
    </motion.div>
  );
}
