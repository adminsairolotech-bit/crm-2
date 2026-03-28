import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import { CalendarDays, Clock, CheckCircle2, XCircle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Demo {
  id: number;
  company: string;
  contact: string;
  machine: string;
  date: string;
  time: string;
  location: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

const mockDemos: Demo[] = [
  { id: 1, company: "Tata AutoComp", contact: "Rajesh Kumar", machine: "CNC Lathe Pro 5000", date: "2026-03-17", time: "10:00 AM", location: "Pune Factory", status: "scheduled" },
  { id: 2, company: "Mahindra CIE", contact: "Sunita Reddy", machine: "Milling Machine MM-300", date: "2026-03-18", time: "2:00 PM", location: "Chennai Showroom", status: "scheduled" },
  { id: 3, company: "TVS Motors", contact: "Kavitha Rao", machine: "Surface Grinder SG-100", date: "2026-03-19", time: "11:00 AM", location: "Hosur Plant", status: "scheduled" },
  { id: 4, company: "Hero MotoCorp", contact: "Ravi Shankar", machine: "CNC Router CR-800", date: "2026-03-14", time: "3:00 PM", location: "Gurgaon Office", status: "completed", notes: "Client impressed, requesting quotation" },
  { id: 5, company: "Bajaj Auto", contact: "Amit Shah", machine: "Laser Cutter LCM-500", date: "2026-03-13", time: "10:30 AM", location: "Pune HQ", status: "completed", notes: "Needs custom specs" },
  { id: 6, company: "Tata Steel", contact: "Arun Verma", machine: "Bandsaw BS-250", date: "2026-03-12", time: "4:00 PM", location: "Jamshedpur", status: "cancelled", notes: "Client postponed indefinitely" },
];

const statusConfig: Record<string, { color: string; icon: typeof CalendarDays }> = {
  scheduled: { color: "bg-blue-50 text-blue-600", icon: CalendarDays },
  completed: { color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  cancelled: { color: "bg-red-50 text-red-600", icon: XCircle },
};

export default function DemoSchedulerPage() {
  const upcoming = mockDemos.filter((d) => d.status === "scheduled");
  const past = mockDemos.filter((d) => d.status !== "scheduled");

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Demo Scheduler" subtitle="Schedule and track machine demonstrations" />

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Upcoming Demos" value={upcoming.length} icon={CalendarDays} iconBg="bg-blue-50" iconColor="text-blue-500" />
        <StatsCard label="Completed" value={mockDemos.filter((d) => d.status === "completed").length} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatsCard label="This Week" value={upcoming.length} icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-500" />
      </motion.div>

      <SectionCard title="Upcoming Demos">
        <div className="space-y-3">
          {upcoming.map((demo) => (
            <motion.div key={demo.id} variants={staggerItem} className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">{new Date(demo.date).getDate()}</span>
                <span className="text-xs text-primary">{new Date(demo.date).toLocaleDateString("en-IN", { month: "short" })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{demo.company}</span>
                  <Badge className={statusConfig[demo.status].color}>{demo.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{demo.contact} &middot; {demo.machine}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{demo.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{demo.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Past Demos">
        <div className="space-y-3">
          {past.map((demo) => (
            <motion.div key={demo.id} variants={staggerItem} className="flex items-start gap-4 p-4 rounded-lg border border-border opacity-75">
              <div className="w-14 h-14 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-bold text-muted-foreground">{new Date(demo.date).getDate()}</span>
                <span className="text-xs text-muted-foreground">{new Date(demo.date).toLocaleDateString("en-IN", { month: "short" })}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{demo.company}</span>
                  <Badge className={statusConfig[demo.status].color}>{demo.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{demo.contact} &middot; {demo.machine}</p>
                {demo.notes && <p className="text-xs text-muted-foreground mt-1 italic">{demo.notes}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}
