import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { leadTasks } from "@/lib/dataService";

interface SalesTask {
  id: number;
  title: string;
  assignee: string;
  dueDate: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  priority: "low" | "medium" | "high";
  lead?: string;
}

const statusConfig: Record<string, { icon: typeof Circle; color: string; label: string }> = {
  pending: { icon: Circle, color: "text-blue-600", label: "Pending" },
  in_progress: { icon: Clock, color: "text-amber-700", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-emerald-700", label: "Completed" },
  overdue: { icon: AlertCircle, color: "text-red-600", label: "Overdue" },
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-50 text-slate-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-600",
};

export default function SalesTasksPage() {
  const [filter, setFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<SalesTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await leadTasks.getAll();
        const mapped: SalesTask[] = data.map(t => ({
          id: t.id,
          title: t.title,
          assignee: t.assigned_to || 'Unassigned',
          dueDate: t.due_date || '',
          status: (t.status as SalesTask['status']) || 'pending',
          priority: (t.priority as SalesTask['priority']) || 'medium',
          lead: t.description || undefined,
        }));
        setTasks(mapped);
      } catch { setTasks([]); }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Sales Tasks" subtitle="Track and manage sales team tasks" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard label="Total Tasks" value={tasks.length} icon={CheckSquare} iconBg="bg-blue-50" iconColor="text-blue-500" />
        <StatsCard label="Pending" value={tasks.filter((t) => t.status === "pending").length} icon={Circle} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatsCard label="In Progress" value={tasks.filter((t) => t.status === "in_progress").length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-700" />
        <StatsCard label="Overdue" value={tasks.filter((t) => t.status === "overdue").length} icon={AlertCircle} iconBg="bg-red-50" iconColor="text-red-600" />
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
