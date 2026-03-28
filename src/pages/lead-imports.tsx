import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, SectionCard } from "@/components/shared";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Download, Mail,
  RefreshCw, Unplug, ExternalLink, Loader2, Check, MailSearch
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leads as leadsService } from "@/lib/dataService";

const apiFetch = async <T = any>(url: string, opts: any = {}): Promise<T> => {
  const res = await fetch(`/api${url}`, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};
import { useToast } from "@/hooks/use-toast";

type TabKey = "csv" | "gmail";

interface GmailStatus {
  connected: boolean;
  email?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
}

interface ParsedLead {
  id: string;
  source: "IndiaMart" | "JustDial" | "TradeIndia";
  name: string;
  phone: string;
  email: string;
  company: string;
  product: string;
  city: string;
  receivedAt: string;
  rawSubject: string;
  imported: boolean;
}

interface GmailHistoryEntry {
  id: string;
  syncedAt: string;
  source: "gmail";
  totalFetched: number;
  newLeads: number;
  imported: number;
  skipped: number;
}

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/10 text-emerald-400",
  partial: "bg-amber-500/10 text-amber-400",
  failed: "bg-red-500/10 text-red-400",
};

const sourceColors: Record<string, string> = {
  IndiaMart: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  JustDial: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  TradeIndia: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const csvTemplate = "Client Name,Email,Phone,Company,Machine Interest,Budget,Source\n";

function CsvTab() {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div variants={staggerItem}
        className={`glass-card rounded-xl p-8 border-2 border-dashed transition-colors text-center ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); }}>
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) { console.log("Selected file:", e.target.files[0].name); } }} />
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Drop your CSV file here</h3>
        <p className="text-sm text-muted-foreground mb-4">or click to browse files. Max file size: 10MB</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <FileText className="w-4 h-4" /> Browse Files
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate}>
            <Download className="w-4 h-4" /> Download Template
          </Button>
        </div>
      </motion.div>

      <SectionCard title="Required CSV Columns">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Client Name*", "Email", "Phone*", "Company", "Machine Interest", "Budget", "Currency", "Source"].map((col) => (
            <div key={col} className="p-2 rounded-lg bg-muted/30 text-center">
              <span className={`text-xs ${col.includes("*") ? "font-medium text-foreground" : "text-muted-foreground"}`}>{col}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

interface GmailTabProps {
  onHistoryRefresh: () => void;
}

function GmailTab({ onHistoryRefresh }: GmailTabProps) {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [leads, setLeads] = useState<ParsedLead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentSyncedAt, setCurrentSyncedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  const fetchStatus = useCallback(async () => {
    try {
      const data = await apiFetch<GmailStatus & { success: boolean }>("/admin/gmail/status", { showErrorToast: false });
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await apiFetch<{ leads: ParsedLead[] }>("/admin/gmail/leads", { showErrorToast: false });
      setLeads(data.leads || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchLeads();

    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "connected") {
      toast({ title: "Gmail Connected", description: `Connected as ${params.get("email") || "your account"}` });
      window.history.replaceState({}, "", window.location.pathname);
      fetchStatus();
    } else if (params.get("gmail") === "error") {
      toast({ title: "Connection Failed", description: params.get("message") || "Could not connect Gmail", variant: "destructive" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchStatus, fetchLeads, toast]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const data = await apiFetch<{ authUrl: string }>("/admin/gmail/connect");
      window.location.href = data.authUrl;
    } catch {
      toast({ title: "Error", description: "Could not start Gmail connection", variant: "destructive" });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await apiFetch("/admin/gmail/disconnect", { method: "DELETE" });
      setStatus({ connected: false });
      setLeads([]);
      setSelectedIds(new Set());
      setCurrentSyncedAt("");
      toast({ title: "Disconnected", description: "Gmail account disconnected" });
      onHistoryRefresh();
    } catch {
      toast({ title: "Error", description: "Failed to disconnect", variant: "destructive" });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const data = await apiFetch<{ leads: ParsedLead[]; totalFetched: number; newLeads: number; syncedAt: string }>("/admin/gmail/sync", { method: "POST", timeout: 60000 });
      setLeads(data.leads || []);
      setCurrentSyncedAt(data.syncedAt || "");
      toast({ title: "Sync Complete", description: `Found ${data.newLeads} new leads from ${data.totalFetched} emails` });
      fetchStatus();
      onHistoryRefresh();
    } catch (err: any) {
      toast({ title: "Sync Failed", description: err?.message || "Could not sync emails", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    setImporting(true);
    try {
      const data = await apiFetch<{ imported: number; skipped: number }>("/admin/gmail/import", {
        method: "POST",
        body: JSON.stringify({ leadIds: Array.from(selectedIds), syncedAt: currentSyncedAt }),
      });
      toast({ title: "Import Complete", description: `${data.imported} leads added to CRM, ${data.skipped} skipped (duplicates)` });
      setSelectedIds(new Set());
      fetchLeads();
      onHistoryRefresh();
    } catch {
      toast({ title: "Import Failed", description: "Could not import selected leads", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const importable = leads.filter((l) => !l.imported);
    if (selectedIds.size === importable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(importable.map((l) => l.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <motion.div variants={staggerItem} className="glass-card rounded-xl p-8 text-center">
        <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Connect your Gmail</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your Gmail account to automatically pull leads from IndiaMart, JustDial, and TradeIndia inquiry emails.
        </p>
        <Button onClick={handleConnect} disabled={connecting} className="gap-2">
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          {connecting ? "Redirecting..." : "Connect Gmail Account"}
        </Button>
      </motion.div>
    );
  }

  const importableLeads = leads.filter((l) => !l.imported);
  const importedLeads = leads.filter((l) => l.imported);

  return (
    <div className="space-y-6">
      <motion.div variants={staggerItem} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Connected as {status.email}</p>
              <p className="text-xs text-muted-foreground">
                {status.lastSyncedAt
                  ? `Last synced: ${new Date(status.lastSyncedAt).toLocaleString("en-IN")}`
                  : "Not synced yet"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="gap-2">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDisconnect} className="gap-2 text-red-400 hover:text-red-300">
              <Unplug className="w-4 h-4" /> Disconnect
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex items-center gap-3 flex-wrap">
        {(["IndiaMart", "JustDial", "TradeIndia"] as const).map((s) => (
          <Badge key={s} className={sourceColors[s]}>
            {s}: {leads.filter((l) => l.source === s).length}
          </Badge>
        ))}
        <Badge className="bg-muted/30 text-muted-foreground">Total: {leads.length}</Badge>
      </div>

      {importableLeads.length > 0 && (
        <SectionCard title={`Pending Import (${importableLeads.length})`}>
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
              <button
                onClick={toggleAll}
                className="w-5 h-5 rounded border border-border flex items-center justify-center hover:bg-muted/30 transition-colors"
              >
                {selectedIds.size === importableLeads.length && importableLeads.length > 0 && (
                  <Check className="w-3 h-3 text-primary" />
                )}
              </button>
              <span className="text-xs text-muted-foreground flex-1">Select All</span>
              {selectedIds.size > 0 && (
                <Button size="sm" onClick={handleImport} disabled={importing} className="gap-2">
                  {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Import {selectedIds.size} Lead{selectedIds.size > 1 ? "s" : ""} to CRM
                </Button>
              )}
            </div>

            {importableLeads.map((lead) => (
              <motion.div
                key={lead.id}
                variants={staggerItem}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                  selectedIds.has(lead.id) ? "border-primary bg-primary/5" : "border-border hover:bg-muted/10"
                }`}
                onClick={() => toggleSelect(lead.id)}
              >
                <button
                  className="w-5 h-5 rounded border border-border flex items-center justify-center shrink-0 mt-0.5"
                  onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}
                >
                  {selectedIds.has(lead.id) && <Check className="w-3 h-3 text-primary" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{lead.name || "—"}</span>
                    <Badge className={`text-[10px] ${sourceColors[lead.source]}`}>{lead.source}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {lead.phone && <span>Ph: {lead.phone}</span>}
                    {lead.email && <span>Em: {lead.email}</span>}
                    {lead.company && <span>Co: {lead.company}</span>}
                    {lead.city && <span>City: {lead.city}</span>}
                  </div>
                  {lead.product && (
                    <p className="text-xs text-muted-foreground mt-1">Product: {lead.product}</p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(lead.receivedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      )}

      {importedLeads.length > 0 && (
        <SectionCard title={`Already Imported (${importedLeads.length})`}>
          <div className="space-y-1">
            {importedLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 p-3 rounded-lg border border-border opacity-60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-foreground">{lead.name || "—"}</span>
                <Badge className={`text-[10px] ${sourceColors[lead.source]}`}>{lead.source}</Badge>
                {lead.phone && <span className="text-xs text-muted-foreground ml-auto">{lead.phone}</span>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {leads.length === 0 && (
        <motion.div variants={staggerItem} className="glass-card rounded-xl p-8 text-center">
          <MailSearch className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No leads synced yet. Click "Sync Now" to fetch leads from your inbox.</p>
        </motion.div>
      )}
    </div>
  );
}

export default function LeadImportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("gmail");
  const [gmailHistory, setGmailHistory] = useState<GmailHistoryEntry[]>([]);

  const fetchGmailHistory = useCallback(async () => {
    try {
      const data = await apiFetch<{ history: GmailHistoryEntry[] }>("/admin/gmail/history", { showErrorToast: false });
      setGmailHistory(data.history || []);
    } catch {
      setGmailHistory([]);
    }
  }, []);

  useEffect(() => { fetchGmailHistory(); }, [fetchGmailHistory]);

  const getHistoryStatus = (entry: GmailHistoryEntry): "completed" | "partial" | "failed" => {
    if (entry.newLeads === 0) return entry.totalFetched === 0 ? "completed" : "partial";
    if (entry.imported === 0 && entry.newLeads > 0) return "partial";
    return entry.skipped > 0 ? "partial" : "completed";
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Lead Imports" subtitle="Import leads from Gmail portals or CSV files" />

      <motion.div variants={staggerItem} className="flex gap-1 p-1 bg-muted/30 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("gmail")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "gmail" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mail className="w-4 h-4" />
          Gmail Sources
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "csv" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          CSV Upload
        </button>
      </motion.div>

      {activeTab === "gmail"
        ? <GmailTab onHistoryRefresh={fetchGmailHistory} />
        : <CsvTab />
      }

      <SectionCard title="Import History">
        {gmailHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No Gmail syncs yet. Connect Gmail and click Sync Now to get started.</p>
        ) : (
          <div className="space-y-3">
            {gmailHistory.map((entry) => {
              const status = getHistoryStatus(entry);
              return (
                <motion.div key={entry.id} variants={staggerItem} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                  <Mail className="w-8 h-8 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Gmail Sync</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(entry.syncedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {" "}&middot; {entry.totalFetched} emails fetched
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />{entry.imported} imported
                      </p>
                      {entry.skipped > 0 && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{entry.skipped} skipped
                        </p>
                      )}
                    </div>
                    <Badge className={statusColors[status]}>{status}</Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </motion.div>
  );
}
