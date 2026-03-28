import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import { TrendingUp, DollarSign, Users, Target, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const monthlyData = [
  { month: "Oct", leads: 42, conversions: 12, revenue: 18.5 },
  { month: "Nov", leads: 55, conversions: 16, revenue: 24.2 },
  { month: "Dec", leads: 48, conversions: 14, revenue: 21.8 },
  { month: "Jan", leads: 61, conversions: 19, revenue: 29.4 },
  { month: "Feb", leads: 58, conversions: 17, revenue: 26.7 },
  { month: "Mar", leads: 67, conversions: 22, revenue: 34.1 },
];

const conversionFunnel = [
  { stage: "Website Visits", count: 2840, pct: 100 },
  { stage: "Inquiry Made", count: 420, pct: 14.8 },
  { stage: "Lead Created", count: 67, pct: 2.4 },
  { stage: "Demo Scheduled", count: 24, pct: 0.85 },
  { stage: "Quotation Sent", count: 18, pct: 0.63 },
  { stage: "Order Confirmed", count: 8, pct: 0.28 },
];

const tooltipStyle = {
  contentStyle: { background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  labelStyle: { color: "#374151", fontWeight: 600 },
  itemStyle: { color: "#6b7280" },
};

export default function GrowthAnalyticsPage() {
  const [period, setPeriod] = useState<"6m" | "1y">("6m");

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Growth Analytics" subtitle="Track lead conversion, revenue pipeline, and monthly growth" />

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Monthly Revenue" value="₹34.1L" icon={DollarSign} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" change="+27.7%" trend="up" />
        <StatsCard label="Conversion Rate" value="32.8%" icon={Target} iconBg="bg-blue-500/10" iconColor="text-blue-500" change="+4.2%" trend="up" />
        <StatsCard label="New Leads" value={67} icon={Users} iconBg="bg-purple-500/10" iconColor="text-purple-500" change="+15.5%" trend="up" />
        <StatsCard label="Growth Rate" value="+18%" icon={TrendingUp} iconBg="bg-amber-500/10" iconColor="text-amber-500" change="+3%" trend="up" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Lead Acquisition Trend"
          headerAction={
            <div className="flex gap-1">
              {(["6m", "1y"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  {p === "6m" ? "6 Months" : "1 Year"}
                </button>
              ))}
            </div>
          }>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215 20.2% 65.1%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 20.2% 65.1%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="leads" name="Leads" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((_, i) => (
                    <Cell key={i} fill={i === monthlyData.length - 1 ? "#6366f1" : "#a5b4fc"} />
                  ))}
                </Bar>
                <Bar dataKey="conversions" name="Conversions" fill="hsl(262.1 83.3% 57.8%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Revenue Pipeline">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: "hsl(215 20.2% 65.1%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(215 20.2% 65.1%)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v}L`} />
                <Tooltip {...tooltipStyle} formatter={(value: string | number | Array<string | number>) => [`₹${value}L`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(142 71% 45%)" fill="url(#revenueGradient)" strokeWidth={2} dot={{ fill: "hsl(142 71% 45%)", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Conversion Funnel">
        <div className="space-y-3 mt-2">
          {conversionFunnel.map((stage, i) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-40 shrink-0">{stage.stage}</span>
              <div className="flex-1 relative">
                <div className="w-full bg-muted rounded-full h-8">
                  <div className="bg-primary/80 rounded-full h-8 flex items-center justify-end pr-3 transition-all"
                    style={{ width: `${Math.max(stage.pct, 5)}%` }}>
                    {stage.pct > 10 && <span className="text-xs font-medium text-primary-foreground">{stage.count.toLocaleString()}</span>}
                  </div>
                </div>
                {stage.pct <= 10 && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground">{stage.count.toLocaleString()}</span>}
              </div>
              <span className="text-xs text-muted-foreground w-14 text-right">{stage.pct}%</span>
              {i > 0 && (
                <ArrowUpRight className={`w-4 h-4 shrink-0 ${stage.pct > conversionFunnel[i - 1].pct * 0.3 ? "text-emerald-500" : "text-red-400"}`} />
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}
