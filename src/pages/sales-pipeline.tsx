import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard } from "@/components/shared";
import { KanbanSquare, Users, DollarSign, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: number;
  name: string;
  company: string;
  machine: string;
  value: string;
  daysInStage: number;
}

type Stage = "new" | "contacted" | "quotation_sent" | "negotiation" | "order_confirmed" | "lost";

const stageConfig: Record<Stage, { label: string; color: string; bgColor: string }> = {
  new: { label: "New Lead", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  contacted: { label: "Contacted", color: "text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
  quotation_sent: { label: "Quotation Sent", color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20" },
  negotiation: { label: "Negotiation", color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20" },
  order_confirmed: { label: "Order Confirmed", color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  lost: { label: "Lost", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20" },
};

const stages: Stage[] = ["new", "contacted", "quotation_sent", "negotiation", "order_confirmed", "lost"];

const initialLeads: Record<Stage, Lead[]> = {
  new: [
    { id: 1, name: "Rajesh Kumar", company: "Tata AutoComp", machine: "CNC Lathe", value: "₹24.5L", daysInStage: 2 },
    { id: 2, name: "Priya Nair", company: "Godrej Agrovet", machine: "Hydraulic Press", value: "₹18.0L", daysInStage: 1 },
    { id: 3, name: "Amit Shah", company: "Bajaj Auto", machine: "Laser Cutter", value: "₹32.0L", daysInStage: 3 },
  ],
  contacted: [
    { id: 4, name: "Sunita Reddy", company: "Mahindra CIE", machine: "Milling Machine", value: "₹16.5L", daysInStage: 5 },
    { id: 5, name: "Deepak Joshi", company: "L&T Technology", machine: "Wire EDM", value: "₹45.0L", daysInStage: 3 },
  ],
  quotation_sent: [
    { id: 6, name: "Kavitha Rao", company: "TVS Motors", machine: "Surface Grinder", value: "₹9.8L", daysInStage: 7 },
    { id: 7, name: "Mohan Das", company: "Ashok Leyland", machine: "Power Press", value: "₹12.0L", daysInStage: 4 },
  ],
  negotiation: [
    { id: 8, name: "Ravi Shankar", company: "Hero MotoCorp", machine: "CNC Router", value: "₹28.0L", daysInStage: 10 },
  ],
  order_confirmed: [
    { id: 9, name: "Neha Gupta", company: "Maruti Suzuki", machine: "CNC Lathe Pro", value: "₹24.5L", daysInStage: 1 },
  ],
  lost: [
    { id: 10, name: "Arun Verma", company: "Tata Steel", machine: "Bandsaw", value: "₹4.5L", daysInStage: 15 },
  ],
};

export default function SalesPipelinePage() {
  const [leads, setLeads] = useState(initialLeads);
  const [draggedLead, setDraggedLead] = useState<{ lead: Lead; fromStage: Stage } | null>(null);
  const [dropTarget, setDropTarget] = useState<Stage | null>(null);

  const handleDragStart = useCallback((lead: Lead, fromStage: Stage) => {
    setDraggedLead({ lead, fromStage });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    setDropTarget(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toStage: Stage) => {
    e.preventDefault();
    setDropTarget(null);

    if (!draggedLead || draggedLead.fromStage === toStage) {
      setDraggedLead(null);
      return;
    }

    setLeads((prev) => {
      const updated = { ...prev };
      updated[draggedLead.fromStage] = prev[draggedLead.fromStage].filter((l) => l.id !== draggedLead.lead.id);
      updated[toStage] = [...prev[toStage], { ...draggedLead.lead, daysInStage: 0 }];
      return updated;
    });

    setDraggedLead(null);
  }, [draggedLead]);

  const totalLeads = Object.values(leads).flat().length;
  const totalValue = "₹2.15Cr";

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Sales Pipeline" subtitle="Drag and drop leads between stages to track progress" />

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Leads" value={totalLeads} icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Pipeline Value" value={totalValue} icon={DollarSign} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatsCard label="Won This Month" value={leads.order_confirmed.length} icon={Target} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
        <StatsCard label="Conversion" value="32.8%" icon={KanbanSquare} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
      </motion.div>

      <motion.div variants={staggerItem} className="flex gap-4 overflow-x-auto pb-4 scroll-optimized">
        {stages.map((stage) => {
          const config = stageConfig[stage];
          const stageLeads = leads[stage];
          const isDropping = dropTarget === stage;
          return (
            <div key={stage} className="min-w-[280px] flex-shrink-0"
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}>
              <div className={`rounded-xl border ${config.bgColor} p-3 mb-3`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-semibold ${config.color}`}>{config.label}</h3>
                  <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                </div>
              </div>
              <div className={`space-y-3 min-h-[100px] rounded-xl p-2 transition-colors ${isDropping ? "bg-primary/5 border-2 border-dashed border-primary/30" : "border-2 border-transparent"}`}>
                {stageLeads.map((lead) => (
                  <div key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead, stage)}
                    className={`glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all ${draggedLead?.lead.id === lead.id ? "opacity-40 scale-95" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.company}</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 text-xs">{lead.value}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{lead.machine}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{lead.daysInStage}d in stage</span>
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
    </motion.div>
  );
}
