import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard } from "@/components/shared";
import { KanbanSquare, Users, DollarSign, Target, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { leads as leadsService } from "@/lib/dataService";
import { toast } from "@/hooks/use-toast";

interface LeadCard {
  id: number;
  name: string;
  company: string;
  machine: string;
  value: string;
  valueNumber: number;
  daysInStage: number;
}

type Stage = "new_lead" | "contacted" | "quotation_sent" | "negotiating" | "won" | "lost";

const stageConfig: Record<Stage, { label: string; color: string; bgColor: string }> = {
  new_lead: { label: "New Lead", color: "text-blue-600", bgColor: "bg-blue-50 border-blue-200" },
  contacted: { label: "Contacted", color: "text-cyan-700", bgColor: "bg-cyan-50 border-cyan-200" },
  quotation_sent: { label: "Quotation Sent", color: "text-amber-600", bgColor: "bg-amber-50 border-amber-200" },
  negotiating: { label: "Negotiation", color: "text-violet-600", bgColor: "bg-violet-50 border-violet-200" },
  won: { label: "Won", color: "text-emerald-600", bgColor: "bg-emerald-50 border-emerald-200" },
  lost: { label: "Lost", color: "text-red-600", bgColor: "bg-red-50 border-red-200" },
};

const stages: Stage[] = ["new_lead", "contacted", "quotation_sent", "negotiating", "won", "lost"];

const emptyPipeline: Record<Stage, LeadCard[]> = {
  new_lead: [],
  contacted: [],
  quotation_sent: [],
  negotiating: [],
  won: [],
  lost: [],
};

export default function SalesPipelineLivePage() {
  const [leads, setLeads] = useState(emptyPipeline);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingLeadId, setSavingLeadId] = useState<number | null>(null);
  const [draggedLead, setDraggedLead] = useState<{ lead: LeadCard; fromStage: Stage } | null>(null);
  const [dropTarget, setDropTarget] = useState<Stage | null>(null);

  const loadLeads = useCallback(async (showToast = false) => {
    try {
      showToast ? setRefreshing(true) : setLoading(true);
      const allLeads = await leadsService.getAll();
      const grouped: Record<Stage, LeadCard[]> = {
        new_lead: [],
        contacted: [],
        quotation_sent: [],
        negotiating: [],
        won: [],
        lost: [],
      };

      allLeads.forEach((leadRecord) => {
        const stage = (leadRecord.pipeline_stage || "new_lead") as Stage;
        const daysInStage = leadRecord.created_at ? Math.max(1, Math.floor((Date.now() - new Date(leadRecord.created_at).getTime()) / 86400000)) : 1;
        const valueNumber = parseFloat(String(leadRecord.budget || "0").replace(/[^\d.]/g, "")) || 0;
        const lead: LeadCard = {
          id: leadRecord.id,
          name: leadRecord.name,
          company: leadRecord.city || "",
          machine: leadRecord.machine_interest || "General",
          value: leadRecord.budget || "₹0",
          valueNumber,
          daysInStage,
        };

        if (grouped[stage]) grouped[stage].push(lead);
        else grouped.new_lead.push(lead);
      });

      setLeads(grouped);
      if (showToast) {
        toast({ title: "Pipeline refreshed", description: `${allLeads.length} live leads loaded` });
      }
    } catch {
      setLeads(emptyPipeline);
      if (showToast) {
        toast({ title: "Pipeline refresh failed", description: "Leads table ya Supabase connection check karein", variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleDragStart = useCallback((lead: LeadCard, fromStage: Stage) => {
    setDraggedLead({ lead, fromStage });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDropTarget(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, toStage: Stage) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedLead || draggedLead.fromStage === toStage) {
      setDraggedLead(null);
      return;
    }

    const leadToMove = draggedLead.lead;
    const fromStage = draggedLead.fromStage;

    setLeads((prev) => {
      const updated = { ...prev };
      updated[fromStage] = prev[fromStage].filter((lead) => lead.id !== leadToMove.id);
      updated[toStage] = [...prev[toStage], { ...leadToMove, daysInStage: 0 }];
      return updated;
    });

    setSavingLeadId(leadToMove.id);
    try {
      await leadsService.update(leadToMove.id, { pipeline_stage: toStage, status: toStage });
      toast({ title: "Pipeline updated", description: `${leadToMove.name} moved to ${stageConfig[toStage].label}` });
    } catch {
      setLeads((prev) => {
        const updated = { ...prev };
        updated[toStage] = prev[toStage].filter((lead) => lead.id !== leadToMove.id);
        updated[fromStage] = [...prev[fromStage], { ...leadToMove }];
        return updated;
      });
      toast({ title: "Stage update failed", description: "Move save nahi hua", variant: "destructive" });
    } finally {
      setSavingLeadId(null);
      setDraggedLead(null);
    }
  }, [draggedLead]);

  const flattened = useMemo(() => Object.values(leads).flat(), [leads]);
  const totalLeads = flattened.length;
  const totalValue = flattened.reduce((sum, lead) => sum + lead.valueNumber, 0);
  const wonLeads = leads.won.length;
  const conversion = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader
        title="Sales Pipeline"
        subtitle="Live pipeline with drag-and-drop persistence"
        actions={(
          <button
            onClick={() => loadLeads(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        )}
      />

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Leads" value={totalLeads} icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Pipeline Value" value={`₹${(totalValue / 10000000).toFixed(2)}Cr`} icon={DollarSign} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatsCard label="Won Leads" value={wonLeads} icon={Target} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
        <StatsCard label="Conversion" value={`${conversion}%`} icon={KanbanSquare} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading live pipeline...
        </div>
      ) : (
        <motion.div variants={staggerItem} className="flex gap-4 overflow-x-auto pb-4 scroll-optimized">
          {stages.map((stage) => {
            const config = stageConfig[stage];
            const stageLeads = leads[stage];
            const isDropping = dropTarget === stage;

            return (
              <div
                key={stage}
                className="min-w-[280px] flex-shrink-0"
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className={`rounded-xl border ${config.bgColor} p-3 mb-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${config.color}`}>{config.label}</h3>
                    <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                  </div>
                </div>
                <div className={`space-y-3 min-h-[100px] rounded-xl p-2 transition-colors ${isDropping ? "bg-primary/5 border-2 border-dashed border-primary/30" : "border-2 border-transparent"}`}>
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead, stage)}
                      className={`glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all ${draggedLead?.lead.id === lead.id ? "opacity-40 scale-95" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.company}</p>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">{lead.value}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{lead.machine}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{lead.daysInStage}d in stage</span>
                        {savingLeadId === lead.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-6 text-xs text-muted-foreground">Drop leads here</div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
