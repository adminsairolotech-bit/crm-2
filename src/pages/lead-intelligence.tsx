import { useState, useEffect, useCallback } from "react";
import { Target, AlertTriangle, TrendingUp, Users, Bell, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard, LoadingSkeleton } from "@/components/shared";
import { LoadingWithTimeout } from "@/components/LoadingWithTimeout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { leads as leadsService, leadIntelligence as intelligenceService } from "@/lib/dataService";

interface LeadIntelligenceItem {
  id: number;
  userId: string;
  leadId: number | null;
  intentScore: number;
  intentLevel: string;
  priceInquiryCount: number;
  budgetMentionCount: number;
  urgencySignalCount: number;
  competitorMentionCount: number;
  repeatedProductCount: number;
  totalConversations: number;
  classification: string;
  alertSent: boolean;
  lastAnalyzedAt: string;
}

interface DashboardData {
  summary: {
    totalTracked: number;
    hotLeads: number;
    warmLeads: number;
    coldLeads: number;
  };
  hotLeads: LeadIntelligenceItem[];
  warmLeads: LeadIntelligenceItem[];
  recentSignals: Record<string, number>;
  classifications: Record<string, number>;
}

const INTENT_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  serious_buyer: "Serious Buyer",
  potential_buyer: "Potential Buyer",
  researching: "Researching",
  casual_inquiry: "Casual Inquiry",
  unknown: "Unknown",
};

export default function LeadIntelligencePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<LeadIntelligenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const allLeads = await leadsService.getAll().catch(() => []);
      const hotLeads = allLeads.filter(l => l.lead_score >= 80).length;
      const avgScore = allLeads.length > 0 ? Math.round(allLeads.reduce((a, l) => a + (l.lead_score || 0), 0) / allLeads.length) : 0;
      const dashData: DashboardData = {
        totalLeads: allLeads.length,
        hotLeads,
        warmLeads: allLeads.filter(l => l.lead_score >= 50 && l.lead_score < 80).length,
        coldLeads: allLeads.filter(l => l.lead_score < 50).length,
        avgScore,
        conversionRate: allLeads.length > 0 ? Math.round(allLeads.filter(l => l.pipeline_stage === 'won').length / allLeads.length * 100) : 0,
        predictedRevenue: allLeads.reduce((a, l) => a + (parseFloat(String(l.budget || '0').replace(/[^\d.]/g, '')) || 0), 0),
      };
      setData(dashData);
      const alertItems: LeadIntelligenceItem[] = allLeads.filter(l => l.lead_score >= 80).map(l => ({
        id: l.id, userId: '', leadId: l.id, type: 'hot_lead', title: `Hot Lead: ${l.name}`,
        message: `Lead score ${l.lead_score} — interested in ${l.machine_interest}`,
        priority: 'high', status: 'active', createdAt: l.created_at || '',
      }));
      setAlerts(alertItems);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load lead intelligence", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const acknowledgeAlert = async (id: number) => {
    try {
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast({ title: "Alert acknowledged" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const summary = data?.summary || { totalTracked: 0, hotLeads: 0, warmLeads: 0, coldLeads: 0 };

  return (
    <LoadingWithTimeout loading={loading} onRetry={fetchData} loadingContent={<LoadingSkeleton />}>
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
      <PageHeader title="Lead Intelligence" subtitle="AI-powered conversation analysis and buyer intent detection" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Tracked" value={summary.totalTracked} icon={Users} />
        <StatsCard label="Hot Leads" value={summary.hotLeads} icon={AlertTriangle} trend={summary.hotLeads > 0 ? "up" : undefined} />
        <StatsCard label="Warm Leads" value={summary.warmLeads} icon={TrendingUp} />
        <StatsCard label="Pending Alerts" value={alerts.length} icon={Bell} trend={alerts.length > 0 ? "up" : undefined} />
      </motion.div>

      {alerts.length > 0 && (
        <SectionCard title="High-Intent Alerts">
          <div className="space-y-3">
            {alerts.map(alert => (
              <motion.div key={alert.id} variants={staggerItem} className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-sm">User: {alert.userId.substring(0, 12)}...</span>
                    <Badge className={INTENT_COLORS.high}>Intent: {alert.intentScore.toFixed(0)}%</Badge>
                    <Badge variant="outline">{CLASSIFICATION_LABELS[alert.classification] || alert.classification}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>Price inquiries: {alert.priceInquiryCount}</span>
                    <span>Budget mentions: {alert.budgetMentionCount}</span>
                    <span>Urgency signals: {alert.urgencySignalCount}</span>
                    <span>Conversations: {alert.totalConversations}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Acknowledge
                </Button>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Lead Classifications">
          <div className="space-y-3">
            {Object.entries(data?.classifications || {}).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm">{CLASSIFICATION_LABELS[key] || key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: `${Math.min((count / Math.max(summary.totalTracked, 1)) * 100, 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Signal Distribution">
          <div className="space-y-3">
            {Object.entries(data?.recentSignals || {}).sort((a, b) => b[1] - a[1]).map(([signal, count]) => (
              <div key={signal} className="flex items-center justify-between">
                <span className="text-sm capitalize">{signal.replace(/_/g, " ")}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {Object.keys(data?.recentSignals || {}).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No signals detected yet. Signals are analyzed from Buddy AI conversations.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Hot Leads">
        <div className="space-y-3">
          {(data?.hotLeads || []).map(lead => (
            <motion.div key={lead.id} variants={staggerItem} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">User: {lead.userId.substring(0, 16)}...</span>
                  <Badge className={INTENT_COLORS[lead.intentLevel]}>Score: {lead.intentScore.toFixed(0)}</Badge>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                  <span>{lead.totalConversations} conversations</span>
                  <span>{lead.priceInquiryCount} price asks</span>
                  <span>{lead.urgencySignalCount} urgency signals</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(lead.lastAnalyzedAt).toLocaleDateString()}</span>
            </motion.div>
          ))}
          {(data?.hotLeads || []).length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No hot leads detected yet.</p>}
        </div>
      </SectionCard>
    </motion.div>
    </LoadingWithTimeout>
  );
}
