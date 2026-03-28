import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import { Cpu, Building2, Users, TrendingUp, Bell, Loader2, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, leads as leadsService } from "@/lib/dataService";
import type { Lead } from "@/lib/supabase";

const stageColors: Record<string, string> = {
  new_lead: "bg-blue-500/10 text-blue-500",
  contacted: "bg-amber-500/10 text-amber-500",
  interested: "bg-purple-500/10 text-purple-500",
  demo_scheduled: "bg-pink-500/10 text-pink-500",
  quotation_sent: "bg-emerald-500/10 text-emerald-500",
  negotiating: "bg-orange-500/10 text-orange-500",
  won: "bg-green-500/10 text-green-500",
  lost: "bg-red-500/10 text-red-500",
  New: "bg-blue-500/10 text-blue-500",
};

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalMachines: 0, totalLeads: 0, totalSuppliers: 0, newLeads: 0, wonLeads: 0, pipelineValue: 0, conversionRate: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [aiOnline, setAiOnline] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [dashStats, recent, allLeads] = await Promise.all([
          getDashboardStats(),
          leadsService.getRecent(10),
          leadsService.getAll(),
        ]);
        setStats(dashStats);
        setRecentLeads(recent);
        setDbConnected(true);

        const pipelineMap: Record<string, number> = {};
        allLeads.forEach(l => {
          const stage = l.pipeline_stage || l.status || 'new_lead';
          pipelineMap[stage] = (pipelineMap[stage] || 0) + 1;
        });
        setPipeline(pipelineMap);

        const aiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.AI_INTEGRATIONS_GEMINI_API_KEY;
        setAiOnline(!!aiKey);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setDbConnected(false);
      }
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

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome to Sai Rolotech Admin" />

      <motion.div variants={staggerItem} className="flex items-center gap-2 p-3 rounded-lg glass-card">
        {dbConnected ? (
          <><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Supabase Connected — Live Data</span></>
        ) : (
          <><WifiOff className="w-4 h-4 text-amber-400" /><span className="text-sm text-amber-400">Database Offline — Check Supabase Connection</span></>
        )}
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Machines" value={stats.totalMachines} icon={Cpu} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Active Leads" value={stats.totalLeads} icon={TrendingUp} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" change={stats.newLeads > 0 ? `${stats.newLeads} new` : undefined} trend="up" />
        <StatsCard label="Suppliers" value={stats.totalSuppliers} icon={Building2} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
        <StatsCard label="Conversion" value={`${stats.conversionRate}%`} icon={Users} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
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
            {recentLeads.map((lead) => (
              <motion.div key={lead.id} variants={staggerItem} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stageColors[lead.pipeline_stage] || stageColors[lead.status] || "bg-muted"}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.city} — {lead.machine_interest || 'General'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={stageColors[lead.pipeline_stage] || stageColors[lead.status] || "bg-muted"}>{(lead.pipeline_stage || lead.status).replace(/_/g, " ")}</Badge>
                    {lead.budget && <Badge variant="outline">{lead.budget}</Badge>}
                    <Badge variant="outline">{lead.source}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-sm text-muted-foreground">No leads yet</p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Revenue Overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Pipeline Value</p>
            <p className="text-2xl font-bold text-primary">₹{(stats.pipelineValue / 100000).toFixed(1)}L</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-emerald-500">{stats.conversionRate}%</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Won Deals</p>
            <p className="text-2xl font-bold text-amber-500">{stats.wonLeads}</p>
          </div>
        </div>
      </SectionCard>
    </motion.div>
  );
}
