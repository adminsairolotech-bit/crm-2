import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SalesTask {
  id: number;
  title: string;
  assignee: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  lead?: string;
}

const mockTasks: SalesTask[] = [
  { id: 1, title: "Follow up with Rajesh Kumar on CNC Lathe quote", assignee: "Anil", dueDate: "2026-03-17", status: "pending", priority: "high", lead: "Rajesh Kumar" },
  { id: 2, title: "Schedule demo for Tata AutoComp", assignee: "Priya", dueDate: "2026-03-18", status: "in_progress", priority: "high", lead: "Tata AutoComp" },
  { id: 3, title: "Send revised quotation to TVS Motors", assignee: "Anil", dueDate: "2026-03-15", status: "overdue", priority: "medium", lead: "TVS Motors" },
  { id: 4, title: "Update machine specs for Laser Cutter LCM-500", assignee: "Deepak", dueDate: "2026-03-20", status: "pending", priority: "low" },
  { id: 5, title: "Collect feedback from Hero MotoCorp demo", assignee: "Priya", dueDate: "2026-03-19", status: "in_progress", priority: "medium", lead: "Hero MotoCorp" },
  { id: 6, title: "Prepare quotation for Ashok Leyland", assignee: "Anil", dueDate: "2026-03-14", status: "completed", priority: "high", lead: "Ashok Leyland" },
  { id: 7, title: "Onboard new supplier — SparkTech EDM", assignee: "Deepak", dueDate: "2026-03-21", status: "pending", priority: "medium" },
  { id: 8, title: "Review pricing for Milling Machine MM-300", assignee: "Anil", dueDate: "2026-03-16", status: "completed", priority: "low" },
];

const statusConfig: Record<string, { icon: typeof Circle; color: string; label: string }> = {
  pending: { icon: Circle, color: "text-blue-400", label: "Pending" },
  in_progress: { icon: Clock, color: "text-amber-400", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-emerald-400", label: "Completed" },
  overdue: { icon: AlertCircle, color: "text-red-400", label: "Overdue" },
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500/10 text-gray-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
};

export default function SalesTasksPage() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? mockTasks : mockTasks.filter((t) => t.status === filter);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Sales Tasks" subtitle="Track and manage sales team tasks" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard label="Total Tasks" value={mockTasks.length} icon={CheckSquare} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Pending" value={mockTasks.filter((t) => t.status === "pending").length} icon={Circle} iconBg="bg-blue-500/10" iconColor="text-blue-400" />
        <StatsCard label="In Progress" value={mockTasks.filter((t) => t.status === "in_progress").length} icon={Clock} iconBg="bg-amber-500/10" iconColor="text-amber-400" />
        <StatsCard label="Overdue" value={mockTasks.filter((t) => t.status === "overdue").length} icon={AlertCircle} iconBg="bg-red-500/10" iconColor="text-red-400" />
      </motion.div>

      <motion.div variants={staggerItem} className="flex gap-2 flex-wrap">
        {["all", "pending", "in_progress", "completed", "overdue"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </motion.div>

      <SectionCard noPadding>
        <div className="divide-y divide-border">
          {filtered.map((task) => {
            const config = statusConfig[task.status];
            const StatusIcon = config.icon;
            return (
              <motion.div key={task.id} variants={staggerItem} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                <StatusIcon className={`w-5 h-5 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Assigned: {task.assignee}</span>
                    <span>Due: {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    {task.lead && <span>Lead: {task.lead}</span>}
                  </div>
                </div>
                <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>
    </motion.div>
  );
}
