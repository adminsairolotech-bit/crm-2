import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, DataTable } from "@/components/shared";
import { FileText, Download, Search, DollarSign, Bot, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Quotation {
  id: number;
  quotationNo: string;
  clientName: string;
  machine: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  generatedByAi: boolean;
  createdAt: string;
}

const mockQuotations: Quotation[] = [
  { id: 1, quotationNo: "Q-2026-0847", clientName: "Rajesh Kumar", machine: "CNC Lathe Pro 5000", amount: 2450000, status: "sent", generatedByAi: true, createdAt: "2026-03-15" },
  { id: 2, quotationNo: "Q-2026-0846", clientName: "Sunita Reddy", machine: "Milling Machine MM-300", amount: 1650000, status: "accepted", generatedByAi: true, createdAt: "2026-03-14" },
  { id: 3, quotationNo: "Q-2026-0845", clientName: "Kavitha Rao", machine: "Surface Grinder SG-100", amount: 980000, status: "draft", generatedByAi: false, createdAt: "2026-03-13" },
  { id: 4, quotationNo: "Q-2026-0844", clientName: "Ravi Shankar", machine: "CNC Router CR-800", amount: 2800000, status: "sent", generatedByAi: true, createdAt: "2026-03-12" },
  { id: 5, quotationNo: "Q-2026-0843", clientName: "Neha Gupta", machine: "CNC Lathe Pro 5000", amount: 2450000, status: "accepted", generatedByAi: true, createdAt: "2026-03-11" },
  { id: 6, quotationNo: "Q-2026-0842", clientName: "Amit Shah", machine: "Laser Cutter LCM-500", amount: 3200000, status: "rejected", generatedByAi: false, createdAt: "2026-03-10" },
  { id: 7, quotationNo: "Q-2026-0841", clientName: "Deepak Joshi", machine: "Wire EDM WE-400", amount: 4500000, status: "sent", generatedByAi: true, createdAt: "2026-03-09" },
  { id: 8, quotationNo: "Q-2026-0840", clientName: "Mohan Das", machine: "Power Press PP-100", amount: 1200000, status: "accepted", generatedByAi: true, createdAt: "2026-03-08" },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-400",
  sent: "bg-blue-500/10 text-blue-400",
  accepted: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
};

export default function QuotationLogsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockQuotations.filter((q) =>
    q.clientName.toLowerCase().includes(search.toLowerCase()) ||
    q.quotationNo.toLowerCase().includes(search.toLowerCase()) ||
    q.machine.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "quotationNo", header: "Quotation #", render: (q: Quotation) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-foreground">{q.quotationNo}</span>
        {q.generatedByAi && <span title="AI Generated"><Bot className="w-3.5 h-3.5 text-primary" /></span>}
      </div>
    )},
    { key: "client", header: "Client", render: (q: Quotation) => <span className="text-sm">{q.clientName}</span> },
    { key: "machine", header: "Machine", render: (q: Quotation) => <span className="text-sm text-muted-foreground">{q.machine}</span> },
    { key: "amount", header: "Amount", render: (q: Quotation) => <span className="text-sm font-medium">₹{(q.amount / 100000).toFixed(1)}L</span> },
    { key: "date", header: "Date", render: (q: Quotation) => <span className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span> },
    { key: "status", header: "Status", render: (q: Quotation) => <Badge className={statusColors[q.status]}>{q.status}</Badge> },
    { key: "actions", header: "", render: () => (
      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Download className="w-4 h-4 text-muted-foreground" /></button>
    )},
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="AI Quotation Logs" subtitle="Track all generated quotations" />

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Quotations" value={mockQuotations.length} icon={FileText} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="AI Generated" value={mockQuotations.filter((q) => q.generatedByAi).length} icon={Bot} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
        <StatsCard label="Accepted" value={mockQuotations.filter((q) => q.status === "accepted").length} icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatsCard label="Total Value" value={`₹${(mockQuotations.reduce((a, q) => a + q.amount, 0) / 10000000).toFixed(1)}Cr`} icon={DollarSign} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
      </motion.div>

      <motion.div variants={staggerItem} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search quotations..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      </motion.div>

      <motion.div variants={staggerItem} className="glass-card rounded-xl overflow-hidden">
        <DataTable columns={columns} data={filtered} keyExtractor={(q) => q.id} emptyMessage="No quotations found." />
      </motion.div>
    </motion.div>
  );
}
