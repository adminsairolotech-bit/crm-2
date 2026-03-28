import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import {
  CalendarDays, Clock, CheckCircle2, XCircle, MapPin, Plus,
  Phone, User, Cog, Building2, StickyNote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Demo {
  id: number;
  company: string;
  contact: string;
  phone: string;
  machine: string;
  date: string;
  time: string;
  location: "factory" | "customer" | "video";
  locationDetail: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

const initDemos: Demo[] = [
  { id: 1, company: "Satpal Roofing Works", contact: "Satpal Singh", phone: "+91 98765 11111", machine: "Shutter Patti Machine (Semi-Auto)", date: "2026-04-02", time: "10:00 AM", location: "factory", locationDetail: "Mundka Factory, New Delhi", status: "scheduled" },
  { id: 2, company: "Kumar Profile Industries", contact: "Suresh Kumar", phone: "+91 98765 22222", machine: "False Ceiling Machine (Full-Auto)", date: "2026-04-04", time: "2:00 PM", location: "factory", locationDetail: "Mundka Factory, New Delhi", status: "scheduled" },
  { id: 3, company: "Rohtak Sheet Metal", contact: "Ramesh Yadav", phone: "+91 98765 33333", machine: "Z Purlin Roll Forming Machine", date: "2026-04-07", time: "11:00 AM", location: "customer", locationDetail: "Rohtak, Haryana", status: "scheduled" },
  { id: 4, company: "Panipat Fabricators", contact: "Vijay Sharma", phone: "+91 98765 44444", machine: "Aluminium Profile Machine", date: "2026-03-28", time: "3:00 PM", location: "video", locationDetail: "WhatsApp Video Call", status: "completed", notes: "Very interested — quotation requested for 2 machines" },
  { id: 5, company: "Noida Tech Profiles", contact: "Ankit Gupta", phone: "+91 98765 55555", machine: "Shutter Patti Machine (Basic)", date: "2026-03-25", time: "10:30 AM", location: "factory", locationDetail: "Mundka Factory, New Delhi", status: "completed", notes: "Placed order for 1 unit — delivery in 45 days" },
  { id: 6, company: "Ludhiana Roll Works", contact: "Gurpreet Singh", phone: "+91 98765 66666", machine: "C Purlin Machine", date: "2026-03-22", time: "4:00 PM", location: "customer", locationDetail: "Ludhiana, Punjab", status: "cancelled", notes: "Budget constraint — follow up in 2 months" },
];

const locationConfig: Record<string, { color: string; label: string }> = {
  factory: { color: "bg-blue-50 text-blue-600 border-blue-200", label: "🏭 Factory" },
  customer: { color: "bg-purple-50 text-purple-600 border-purple-200", label: "🏢 Customer Site" },
  video: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "📹 Video Call" },
};

const statusConfig: Record<string, { color: string; icon: typeof CalendarDays }> = {
  scheduled: { color: "bg-blue-50 text-blue-600 border-blue-200", icon: CalendarDays },
  completed:  { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled:  { color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const MACHINES = [
  "Shutter Patti Machine (Basic)", "Shutter Patti Machine (Semi-Auto)", "Shutter Patti Machine (Full-Auto)",
  "False Ceiling Machine (Semi-Auto)", "False Ceiling Machine (Full-Auto)",
  "Z Purlin Roll Forming Machine", "C Purlin Machine", "Aluminium Profile Machine",
];

const emptyForm = { company: "", contact: "", phone: "", machine: MACHINES[0], date: "", time: "10:00 AM", location: "factory" as Demo["location"], locationDetail: "", notes: "" };

export default function DemoSchedulerPage() {
  const [demos, setDemos]         = useState<Demo[]>(initDemos);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ ...emptyForm });
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const upcoming = demos.filter(d => d.status === "scheduled");
  const past      = demos.filter(d => d.status !== "scheduled");

  function scheduleDemo() {
    if (!form.company || !form.contact || !form.date) {
      toast({ title: "Company, contact aur date required", variant: "destructive" }); return;
    }
    const newDemo: Demo = { id: Date.now(), ...form, status: "scheduled" };
    setDemos(prev => [newDemo, ...prev]);
    toast({ title: "Demo scheduled!", description: `${form.company} — ${form.date} at ${form.time}` });
    setShowForm(false);
    setForm({ ...emptyForm });
  }

  function markComplete(id: number, notes: string = "") {
    setDemos(prev => prev.map(d => d.id === id ? { ...d, status: "completed", notes } : d));
    toast({ title: "Demo completed! 🎉" });
  }
  function markCancelled(id: number) {
    setDemos(prev => prev.map(d => d.id === id ? { ...d, status: "cancelled" } : d));
    toast({ title: "Demo cancelled" });
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <PageHeader title="Demo Scheduler" subtitle="Machine demonstrations aur factory visit schedule karo" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard label="Upcoming"   value={upcoming.length}                              icon={CalendarDays} iconBg="bg-blue-50"    iconColor="text-blue-500" />
        <StatsCard label="Completed"  value={demos.filter(d => d.status==="completed").length} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatsCard label="This Month" value={demos.filter(d => d.date.startsWith("2026-04")).length} icon={Clock}        iconBg="bg-amber-50"   iconColor="text-amber-500" />
        <StatsCard label="Conversion" value="66%"                                          icon={CheckCircle2} iconBg="bg-purple-50"  iconColor="text-purple-500" />
      </motion.div>

      {/* Schedule Button */}
      <motion.div variants={staggerItem}>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Schedule New Demo
        </button>
      </motion.div>

      {/* New Demo Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border-l-4 border-primary">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" /> Naya Demo Schedule
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { label: "Company Name *", key: "company", placeholder: "e.g. Satpal Roofing Works" },
              { label: "Contact Name *", key: "contact", placeholder: "e.g. Satpal Singh" },
              { label: "Phone", key: "phone", placeholder: "+91-XXXXXXXXXX" },
              { label: "Location Detail", key: "locationDetail", placeholder: "Factory address / city" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-foreground mb-1 block">{f.label}</label>
                <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Machine *</label>
              <select value={form.machine} onChange={e => setForm(p => ({ ...p, machine: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                {MACHINES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Demo Type</label>
              <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value as Demo["location"] }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="factory">🏭 Factory Visit (Mundka)</option>
                <option value="customer">🏢 Customer Site</option>
                <option value="video">📹 Video Call</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Time</label>
              <select value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                {["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-foreground mb-1 block">Notes (optional)</label>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Koi special requirement ya notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={scheduleDemo} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              Schedule Demo
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-muted text-foreground text-sm rounded-xl hover:bg-muted/80 transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={staggerItem} className="flex gap-2">
        {(["upcoming", "past"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {tab === "upcoming" ? `Upcoming (${upcoming.length})` : `Past (${past.length})`}
          </button>
        ))}
      </motion.div>

      {/* Demo Cards */}
      <div className="space-y-3">
        {(activeTab === "upcoming" ? upcoming : past).map(demo => {
          const StatusIcon = statusConfig[demo.status].icon;
          const d = new Date(demo.date);
          return (
            <motion.div key={demo.id} variants={staggerItem}
              className={`glass-card rounded-2xl p-4 border transition-all ${demo.status === "scheduled" ? "border-border hover:border-primary/30" : "border-border/50 opacity-75"}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${demo.status === "scheduled" ? "bg-primary/10" : "bg-muted"}`}>
                  <span className={`text-lg font-bold ${demo.status === "scheduled" ? "text-primary" : "text-muted-foreground"}`}>{d.getDate()}</span>
                  <span className={`text-xs ${demo.status === "scheduled" ? "text-primary" : "text-muted-foreground"}`}>{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-foreground">{demo.company}</span>
                    <Badge className={`text-[10px] ${statusConfig[demo.status].color}`}>
                      <StatusIcon className="w-2.5 h-2.5 mr-1" />
                      {demo.status.charAt(0).toUpperCase() + demo.status.slice(1)}
                    </Badge>
                    <Badge className={`text-[10px] ${locationConfig[demo.location].color}`}>{locationConfig[demo.location].label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{demo.contact}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{demo.phone}</span>
                    <span className="flex items-center gap-1"><Cog className="w-3 h-3" />{demo.machine}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{demo.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{demo.locationDetail}</span>
                  </div>
                  {demo.notes && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <StickyNote className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground italic">{demo.notes}</p>
                    </div>
                  )}
                </div>
                {demo.status === "scheduled" && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => markComplete(demo.id, "Demo completed successfully")}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-medium rounded-xl transition-colors">
                      ✓ Done
                    </button>
                    <button onClick={() => markCancelled(demo.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-medium rounded-xl transition-colors">
                      ✕ Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {(activeTab === "upcoming" ? upcoming : past).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{activeTab === "upcoming" ? "Koi upcoming demo nahi" : "Koi past demo nahi"}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
