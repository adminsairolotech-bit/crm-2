import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import {
  FileText,
  Search,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { quotations as quotationService } from "@/lib/dataService";
import type { QuotationRequest } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";

interface QuotationView {
  id: number;
  quotationNo: string;
  clientName: string;
  clientPhone: string;
  city: string;
  machine: string;
  amount: number;
  status: QuoteStatus;
  createdAt: string;
  validity: string;
}

const statusConfig: Record<QuoteStatus, { color: string; icon: typeof FileText; label: string }> = {
  draft: { color: "bg-slate-100 text-slate-600 border-slate-200", icon: Clock, label: "Draft" },
  sent: { color: "bg-blue-50 text-blue-600 border-blue-200", icon: Send, label: "Sent" },
  accepted: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2, label: "Accepted" },
  rejected: { color: "bg-red-50 text-red-600 border-red-200", icon: XCircle, label: "Rejected" },
};

function parseAmount(value: string | null) {
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
}

function addDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function mapQuotation(row: QuotationRequest): QuotationView {
  const safeStatus = (["draft", "sent", "accepted", "rejected"].includes(row.status) ? row.status : "draft") as QuoteStatus;
  return {
    id: row.id,
    quotationNo: `QT-${String(row.id).padStart(5, "0")}`,
    clientName: row.customer_name || "Unknown Customer",
    clientPhone: row.customer_phone || "No phone",
    city: row.customer_city || "Unknown city",
    machine: row.machine_name || "General Machine",
    amount: parseAmount(row.quoted_price),
    status: safeStatus,
    createdAt: row.created_at,
    validity: addDays(row.created_at, 30),
  };
}

export default function QuotationLogsLivePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteStatus>("all");
  const [quotations, setQuotations] = useState<QuotationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadQuotations = async (showToast = false) => {
    try {
      showToast ? setRefreshing(true) : setLoading(true);
      const rows = await quotationService.getAll();
      const mapped = rows.map(mapQuotation);
      setQuotations(mapped);
      if (showToast) {
        toast({ title: "Quotation logs refreshed", description: `${mapped.length} live quotations loaded` });
      }
    } catch {
      setQuotations([]);
      if (showToast) {
        toast({ title: "Quotation load failed", description: "quotation_requests table check karein", variant: "destructive" });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const filtered = useMemo(() => {
    return quotations.filter((quotation) => {
      const matchesSearch =
        quotation.clientName.toLowerCase().includes(search.toLowerCase()) ||
        quotation.quotationNo.toLowerCase().includes(search.toLowerCase()) ||
        quotation.machine.toLowerCase().includes(search.toLowerCase()) ||
        quotation.city.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const totalValue = quotations.reduce((sum, quotation) => sum + quotation.amount, 0);
  const acceptedValue = quotations.filter((quotation) => quotation.status === "accepted").reduce((sum, quotation) => sum + quotation.amount, 0);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <PageHeader
        title="Quotation Logs"
        subtitle="Live quotation records from CRM"
        actions={(
          <button
            onClick={() => loadQuotations(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        )}
      />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard label="Total Quotes" value={quotations.length} icon={FileText} iconBg="bg-blue-50" iconColor="text-blue-500" />
        <StatsCard label="Accepted" value={quotations.filter((quotation) => quotation.status === "accepted").length} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatsCard label="Drafts" value={quotations.filter((quotation) => quotation.status === "draft").length} icon={Clock} iconBg="bg-slate-50" iconColor="text-slate-500" />
        <StatsCard label="Won Value" value={`₹${(acceptedValue / 100000).toFixed(1)}L`} icon={IndianRupee} iconBg="bg-amber-50" iconColor="text-amber-500" />
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by client, machine, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(["all", "draft", "sent", "accepted", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${statusFilter === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading live quotations...
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((quotation) => {
            const StatusIcon = statusConfig[quotation.status].icon;
            return (
              <motion.div key={quotation.id} variants={staggerItem} className="glass-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold text-foreground">{quotation.quotationNo}</span>
                        <Badge className={`text-xs ${statusConfig[quotation.status].color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[quotation.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-0.5">{quotation.clientName}</p>
                      <p className="text-xs text-muted-foreground">{quotation.machine} · {quotation.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">₹{(quotation.amount / 100000).toFixed(1)}L</p>
                      <p className="text-xs text-muted-foreground">
                        Valid till {new Date(quotation.validity).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast({ title: quotation.quotationNo, description: `${quotation.clientName} · ${quotation.clientPhone}` })}
                        className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
                        aria-label="View quotation"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No live quotations found</p>
            </div>
          )}
        </div>
      )}

      <SectionCard title="Quotation Summary">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["draft", "sent", "accepted", "rejected"] as QuoteStatus[]).map((status) => {
            const count = quotations.filter((quotation) => quotation.status === status).length;
            const value = quotations.filter((quotation) => quotation.status === status).reduce((sum, quotation) => sum + quotation.amount, 0);
            const Icon = statusConfig[status].icon;
            return (
              <div key={status} className={`rounded-xl p-4 border ${statusConfig[status].color}`}>
                <Icon className="w-5 h-5 mb-2 opacity-70" />
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs font-medium capitalize">{status}</p>
                <p className="text-xs mt-1 opacity-70">₹{(value / 100000).toFixed(1)}L</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          Total quotation book value: ₹{(totalValue / 100000).toFixed(1)}L
        </div>
      </SectionCard>
    </motion.div>
  );
}
