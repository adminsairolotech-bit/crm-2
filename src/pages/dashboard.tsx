import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import { Cpu, Building2, Users, TrendingUp, Bell, Loader2, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/apiFetch";

interface DashboardData {
  overview: {
    totalLeads: number;
    totalMachines: number;
    totalSuppliers: number;
    activeDevices: number;
    totalConversations: number;
    hotLeads: number;
  };
  pipeline: Record<string, number>;
  revenue: { pipeline: number; conversion: number; avgDealSize: string };
  recentLeads: {
    id: number;
    clientName: string;
    company: string;
    machineInterest: string;
    stage: string;
    score: number;
    budget: number;
    source: string;
  }[];
}

const stageColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500",
  contacted: "bg-amber-500/10 text-amber-500",
  interested: "bg-purple-500/10 text-purple-500",
  demo_scheduled: "bg-pink-500/10 text-pink-500",
  quotation_sent: "bg-emerald-500/10 text-emerald-500",
  negotiating: "bg-orange-500/10 text-orange-500",
  won: "bg-green-500/10 text-green-500",
  lost: "bg-red-500/10 text-red-500",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiOnline, setAiOnline] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [dashboard, buddyStatus] = await Promise.all([
          apiFetch<DashboardData>("/admin/dashboard/stats", { showErrorToast: false }).catch(() => null),
          apiFetch<{ online: boolean }>("/buddy/status", { showErrorToast: false }).catch(() => ({ online: false })),
        ]);
        if (dashboard) setData(dashboard);
        setAiOnline(buddyStatus?.online ?? false);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.overview || { totalLeads: 0, totalMachines: 0, totalSuppliers: 0, activeDevices: 0, totalConversations: 0, hotLeads: 0 };
  const pipeline = data?.pipeline || {};

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome to Sai Rolotech Admin" />

      <motion.div variants={staggerItem} className="flex items-center gap-2 p-3 rounded-lg glass-card">
        {aiOnline ? (
          <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">AI System Online</span></>
        ) : (
          <><WifiOff className="w-4 h-4 text-amber-400" /><span className="text-sm text-amber-400">AI System Offline — API Keys Required</span></>
        )}
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Machines" value={stats.totalMachines} icon={Cpu} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Active Leads" value={stats.totalLeads} icon={TrendingUp} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" change={stats.hotLeads > 0 ? `${stats.hotLeads} hot` : undefined} trend="up" />
        <StatsCard label="Suppliers" value={stats.totalSuppliers} icon={Building2} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
        <StatsCard label="Buddy Conversations" value={stats.totalConversations} icon={Users} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Sales Pipeline">
          <div className="space-y-3">
            {Object.entries(pipeline).length > 0 ? Object.entries(pipeline).map(([stage, cnt]) => (
              <div key={stage} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Badge className={stageColors[stage] || "bg-muted"}>{stage.replace(/_/g, " ")}</Badge>
                </div>
                <span className="text-lg font-semibold">{cnt}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No pipeline data yet</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Recent Leads">
          <div className="space-y-3">
            {data?.recentLeads?.map((lead) => (
              <motion.div key={lead.id} variants={staggerItem} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stageColors[lead.stage] || "bg-muted"}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{lead.clientName}</p>
                  <p className="text-xs text-muted-foreground">{lead.company} — {lead.machineInterest}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={stageColors[lead.stage]}>{lead.stage.replace(/_/g, " ")}</Badge>
                    {lead.budget && <Badge variant="outline">₹{(lead.budget / 100000).toFixed(1)}L</Badge>}
                    <Badge variant="outline">Score: {lead.score}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
            {(!data?.recentLeads || data.recentLeads.length === 0) && (
              <p className="text-sm text-muted-foreground">No leads yet</p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Revenue Overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pipeline Value</p>
            <p className="text-2xl font-bold text-primary">₹{((data?.revenue?.pipeline || 0) / 100000).toFixed(1)}L</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-emerald-500">{data?.revenue?.conversion || 0}%</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Deal Size</p>
            <p className="text-2xl font-bold text-amber-500">{data?.revenue?.avgDealSize || "₹0"}</p>
          </div>
        </div>
      </SectionCard>
    </motion.div>
  );
}
