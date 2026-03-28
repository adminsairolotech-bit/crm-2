import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import {
  Zap, Clock, Mail, Phone, MessageSquare, Play, Pause,
  Users, CheckCircle2, TrendingUp, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface SequenceStep {
  day: number;
  action: string;
  channel: "email" | "phone" | "whatsapp";
  template: string;
  sent?: number;
  opened?: number;
}

interface Sequence {
  id: number;
  name: string;
  description: string;
  steps: SequenceStep[];
  activeLeads: number;
  completionRate: number;
  running: boolean;
  totalSent: number;
  replies: number;
}

const channelIcons = { email: Mail, phone: Phone, whatsapp: MessageSquare };
const channelColors: Record<string, string> = {
  email: "bg-blue-50 text-blue-600 border-blue-200",
  phone: "bg-emerald-50 text-emerald-700 border-emerald-200",
  whatsapp: "bg-green-50 text-green-700 border-green-200",
};

const initSequences: Sequence[] = [
  {
    id: 1, name: "New IndiaMART Lead Nurture", description: "IndiaMART se aaye naye leads ke liye automated follow-up sequence",
    activeLeads: 24, completionRate: 68, running: true, totalSent: 142, replies: 31,
    steps: [
      { day: 0, action: "Welcome WhatsApp + catalog link", channel: "whatsapp", template: "welcome_catalog", sent: 48, opened: 42 },
      { day: 1, action: "Follow-up call — machine interest check", channel: "phone", template: "first_call", sent: 41, opened: 38 },
      { day: 3, action: "Specifications email (Shutter Patti / False Ceiling)", channel: "email", template: "specs_email", sent: 35, opened: 28 },
      { day: 7, action: "WhatsApp check-in + pricing", channel: "whatsapp", template: "pricing_wa", sent: 18, opened: 15 },
      { day: 14, action: "Final offer email + deadline urgency", channel: "email", template: "final_offer", sent: 0, opened: 0 },
    ],
  },
  {
    id: 2, name: "Post-Demo Follow-up", description: "Factory visit ya demo ke baad rapid follow-up sequence",
    activeLeads: 8, completionRate: 82, running: true, totalSent: 47, replies: 14,
    steps: [
      { day: 0, action: "Thank you WhatsApp + demo summary", channel: "whatsapp", template: "demo_thanks", sent: 14, opened: 14 },
      { day: 2, action: "Technical specs + video WhatsApp", channel: "whatsapp", template: "specs_video", sent: 12, opened: 11 },
      { day: 5, action: "Pricing discussion call", channel: "phone", template: "pricing_call", sent: 11, opened: 10 },
      { day: 10, action: "Final quotation email", channel: "email", template: "final_quote", sent: 10, opened: 7 },
    ],
  },
  {
    id: 3, name: "Cold Lead Re-engagement", description: "30+ din se inactive leads ko wapas engage karne ki sequence",
    activeLeads: 15, completionRate: 24, running: false, totalSent: 38, replies: 5,
    steps: [
      { day: 0, action: "Re-engagement WhatsApp — new machine announcement", channel: "whatsapp", template: "reengage_wa", sent: 20, opened: 15 },
      { day: 3, action: "New catalog email", channel: "email", template: "new_catalog", sent: 12, opened: 8 },
      { day: 7, action: "Special discount WhatsApp offer", channel: "whatsapp", template: "discount_offer", sent: 6, opened: 4 },
    ],
  },
];

export default function SalesSequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>(initSequences);
  const [openId, setOpenId]       = useState<number | null>(1);

  function toggleRun(id: number) {
    setSequences(prev => prev.map(s => {
      if (s.id !== id) return s;
      const next = { ...s, running: !s.running };
      toast({ title: `"${next.name}" ${next.running ? "started" : "paused"}` });
      return next;
    }));
  }

  const totalActive = sequences.reduce((a, s) => a + s.activeLeads, 0);
  const totalSent   = sequences.reduce((a, s) => a + s.totalSent, 0);
  const totalReplies= sequences.reduce((a, s) => a + s.replies, 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <PageHeader title="Sales Sequences" subtitle="Automated follow-up sequences for lead nurturing" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard label="Active Leads"   value={totalActive}                             icon={Users}        iconBg="bg-blue-50"    iconColor="text-blue-500" />
        <StatsCard label="Running"        value={sequences.filter(s => s.running).length} icon={Play}         iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatsCard label="Total Sent"     value={totalSent}                               icon={Zap}          iconBg="bg-amber-50"   iconColor="text-amber-500" />
        <StatsCard label="Replies"        value={totalReplies}                            icon={TrendingUp}   iconBg="bg-purple-50"  iconColor="text-purple-500" />
      </motion.div>

      <div className="space-y-4">
        {sequences.map(seq => (
          <motion.div key={seq.id} variants={staggerItem} className="glass-card rounded-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-bold text-foreground">{seq.name}</h3>
                    <Badge className={seq.running ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}>
                      {seq.running ? "▶ Running" : "⏸ Paused"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{seq.description}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{seq.activeLeads}</span> active leads</span>
                    <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{seq.totalSent}</span> msgs sent</span>
                    <span className="text-xs text-muted-foreground"><span className="font-semibold text-emerald-600">{seq.replies}</span> replies</span>
                    <span className="text-xs text-muted-foreground">{seq.completionRate}% completion</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${seq.completionRate}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleRun(seq.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${seq.running ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"}`}>
                    {seq.running ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Start</>}
                  </button>
                  <button onClick={() => setOpenId(openId === seq.id ? null : seq.id)}
                    className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                    {openId === seq.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Steps */}
            {openId === seq.id && (
              <div className="p-4">
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" aria-hidden="true" />
                  <div className="space-y-4">
                    {seq.steps.map((step, i) => {
                      const ChannelIcon = channelIcons[step.channel];
                      const isDone = (step.sent ?? 0) > 0;
                      return (
                        <div key={i} className="flex items-start gap-4 relative">
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center z-10 shrink-0 ${isDone ? "bg-primary/10 border-primary/30" : "bg-slate-100 border-slate-300"}`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Clock className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="flex-1 bg-muted/30 rounded-xl p-3 border border-border">
                            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                              <div className="flex items-center gap-2">
                                <Badge className={`text-[10px] ${channelColors[step.channel]}`}>
                                  <ChannelIcon className="w-2.5 h-2.5 mr-1" />
                                  {step.channel === "whatsapp" ? "WhatsApp" : step.channel.charAt(0).toUpperCase() + step.channel.slice(1)}
                                </Badge>
                                <span className="text-xs font-medium text-foreground">{step.action}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">Day {step.day}</span>
                            </div>
                            {isDone && (
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span>Sent: <span className="text-foreground font-medium">{step.sent}</span></span>
                                <span>Opened: <span className="text-emerald-600 font-medium">{step.opened}</span></span>
                                {step.sent! > 0 && <span>Rate: <span className="text-blue-600 font-medium">{Math.round((step.opened!/step.sent!)*100)}%</span></span>}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
