import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import {
  CalendarDays, Clock, CheckCircle2, Phone, User, MessageSquare,
  Send, MapPin, Zap, ArrowRight, Video, Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MeetingSlot {
  id: string;
  date: string;
  time: string;
  label: string;
  available: boolean;
}

interface BookedMeeting {
  id: number;
  leadName: string;
  phone: string;
  slot: string;
  type: "video" | "factory" | "customer";
  status: "confirmed" | "pending" | "completed" | "cancelled";
  source: string;
  bookedAt: string;
  notes?: string;
}

const TIME_SLOTS = ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "5:00 PM"];

function generateSlots(): MeetingSlot[] {
  const slots: MeetingSlot[] = [];
  for (let d = 1; d <= 5; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const dateStr = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    TIME_SLOTS.forEach((time, i) => {
      slots.push({
        id: `slot_${d}_${i}`,
        date: dateStr,
        time,
        label: `${dateStr} — ${time}`,
        available: Math.random() > 0.3,
      });
    });
  }
  return slots;
}

const DEMO_MEETINGS: BookedMeeting[] = [
  { id: 1, leadName: "Satpal Singh", phone: "+91 98765XXXXX", slot: "Mon, 31 Mar — 10:00 AM", type: "factory", status: "confirmed", source: "WhatsApp Auto", bookedAt: "2026-03-28", notes: "Shutter Patti Machine demo" },
  { id: 2, leadName: "Suresh Kumar", phone: "+91 87654XXXXX", slot: "Tue, 1 Apr — 2:00 PM", type: "video", status: "pending", source: "App Direct", bookedAt: "2026-03-29" },
  { id: 3, leadName: "Ramesh Yadav", phone: "+91 76543XXXXX", slot: "Wed, 2 Apr — 11:00 AM", type: "customer", status: "confirmed", source: "WhatsApp Auto", bookedAt: "2026-03-28", notes: "Z Purlin machine interest" },
  { id: 4, leadName: "Vijay Sharma", phone: "+91 98765XXXXX", slot: "Thu, 27 Mar — 3:00 PM", type: "video", status: "completed", source: "Manual", bookedAt: "2026-03-25", notes: "Quotation sent after call" },
  { id: 5, leadName: "Ankit Gupta", phone: "+91 87890XXXXX", slot: "Fri, 21 Mar — 5:00 PM", type: "factory", status: "cancelled", source: "WhatsApp Auto", bookedAt: "2026-03-19", notes: "Budget issue — follow up later" },
];

const WA_FLOW_STEPS = [
  { day: "Day 1", msg: "Namaste sir, Sai Rolotech se bol rahe hai. Aapko machine ke options + price + demo ek hi app me mil jayega.", icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
  { day: "Day 2", msg: "Sir kya aapko 5 min demo dikha dein video call par? Hamare paas 3 time slots available hain.", icon: Video, color: "bg-purple-50 text-purple-600" },
  { day: "Auto", msg: "Sir yeh rahi available slots:\n• 10:00 AM\n• 2:00 PM\n• 5:00 PM\nKoi bhi time batayein, hum confirm kar denge!", icon: CalendarDays, color: "bg-emerald-50 text-emerald-600" },
  { day: "Booked", msg: "Meeting confirmed! {date} ko {time} par. Link: meet.google.com/xxx", icon: CheckCircle2, color: "bg-green-50 text-green-700" },
];

const typeConfig: Record<string, { color: string; label: string; icon: typeof Video }> = {
  video: { color: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Video Call", icon: Video },
  factory: { color: "bg-blue-50 text-blue-600 border-blue-200", label: "Factory Visit", icon: Building2 },
  customer: { color: "bg-purple-50 text-purple-600 border-purple-200", label: "Customer Site", icon: MapPin },
};

const statusConfig: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function MeetingBookingPage() {
  const [slots] = useState<MeetingSlot[]>(generateSlots);
  const [meetings, setMeetings] = useState<BookedMeeting[]>(DEMO_MEETINGS);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookForm, setBookForm] = useState({ leadName: "", phone: "", type: "video" as BookedMeeting["type"], notes: "" });
  const [activeTab, setActiveTab] = useState<"upcoming" | "flow" | "slots">("upcoming");

  const confirmed = meetings.filter(m => m.status === "confirmed").length;
  const pending = meetings.filter(m => m.status === "pending").length;
  const completed = meetings.filter(m => m.status === "completed").length;
  const autoBooked = meetings.filter(m => m.source === "WhatsApp Auto").length;

  function handleBook() {
    if (!bookForm.leadName || !bookForm.phone || !selectedSlot) {
      toast({ title: "Name, phone aur slot select karein", variant: "destructive" });
      return;
    }
    const slot = slots.find(s => s.id === selectedSlot);
    const newMeeting: BookedMeeting = {
      id: Date.now(),
      leadName: bookForm.leadName,
      phone: bookForm.phone,
      slot: slot?.label || "",
      type: bookForm.type,
      status: "confirmed",
      source: "Manual",
      bookedAt: new Date().toISOString().split("T")[0],
      notes: bookForm.notes,
    };
    setMeetings(prev => [newMeeting, ...prev]);
    toast({ title: "Meeting booked!", description: `${bookForm.leadName} — ${slot?.label}` });
    setBookForm({ leadName: "", phone: "", type: "video", notes: "" });
    setSelectedSlot(null);
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <PageHeader title="Meeting Auto-Booking" subtitle="WhatsApp se meeting fix — automatic scheduling system" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard label="Confirmed" value={confirmed} icon={CheckCircle2} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatsCard label="Pending" value={pending} icon={Clock} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
        <StatsCard label="Completed" value={completed} icon={CalendarDays} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Auto (WA)" value={autoBooked} icon={Zap} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
      </motion.div>

      <motion.div variants={staggerItem} className="flex gap-2 overflow-x-auto pb-2">
        {(["upcoming", "flow", "slots"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab ? "bg-primary text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab === "upcoming" ? "Upcoming Meetings" : tab === "flow" ? "WhatsApp Auto Flow" : "Book New Slot"}
          </button>
        ))}
      </motion.div>

      {activeTab === "upcoming" && (
        <SectionCard title="All Meetings" headerAction={<CalendarDays className="w-4 h-4 text-blue-600" />}>
          <div className="space-y-3">
            {meetings.map(m => {
              const tc = typeConfig[m.type];
              const TypeIcon = tc.icon;
              return (
                <motion.div key={m.id} variants={staggerItem} className="border border-border rounded-xl p-4 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tc.color}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{m.leadName}</p>
                        <p className="text-xs text-muted-foreground">{m.phone}</p>
                      </div>
                    </div>
                    <Badge className={statusConfig[m.status]}>{m.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.slot}</span>
                    <Badge variant="outline" className="text-[10px]">{tc.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{m.source}</Badge>
                  </div>
                  {m.notes && <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg px-3 py-1.5">{m.notes}</p>}
                  {m.status === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => {
                        setMeetings(prev => prev.map(x => x.id === m.id ? { ...x, status: "confirmed" } : x));
                        toast({ title: "Meeting confirmed!" });
                      }}>
                        <CheckCircle2 className="w-3 h-3" /> Confirm
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {activeTab === "flow" && (
        <SectionCard title="WhatsApp → Meeting Auto Flow" headerAction={<MessageSquare className="w-4 h-4 text-green-600" />}>
          <div className="space-y-1">
            {WA_FLOW_STEPS.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${step.color}`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    {i < WA_FLOW_STEPS.length - 1 && <div className="w-0.5 h-8 bg-border" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <Badge variant="outline" className="text-[10px] mb-1.5">{step.day}</Badge>
                    <div className="bg-muted/50 rounded-xl p-3 border border-border">
                      <p className="text-xs text-foreground whitespace-pre-line">{step.msg}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Auto-Detection: Jab lead WhatsApp par "demo", "meeting", "milna" ya "dekhna" likhta hai → system automatically available slots bhej deta hai
            </p>
          </div>
        </SectionCard>
      )}

      {activeTab === "slots" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Available Slots" headerAction={<Clock className="w-4 h-4 text-blue-600" />}>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedSlot === slot.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : slot.available
                        ? "border-border hover:border-primary/50 hover:bg-muted/30"
                        : "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{slot.label}</span>
                    </div>
                    {slot.available ? (
                      <Badge className="bg-emerald-50 text-emerald-600 text-[10px]">Available</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-500 text-[10px]">Booked</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Book Meeting" headerAction={<Send className="w-4 h-4 text-emerald-600" />}>
            <div className="space-y-4">
              {selectedSlot && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {slots.find(s => s.id === selectedSlot)?.label}
                  </span>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Lead Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={bookForm.leadName}
                    onChange={e => setBookForm(p => ({ ...p, leadName: e.target.value }))}
                    placeholder="Client ka naam"
                    className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={bookForm.phone}
                    onChange={e => setBookForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Meeting Type</label>
                <select
                  value={bookForm.type}
                  onChange={e => setBookForm(p => ({ ...p, type: e.target.value as BookedMeeting["type"] }))}
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm"
                >
                  <option value="video">Video Call</option>
                  <option value="factory">Factory Visit (Mundka)</option>
                  <option value="customer">Customer Site Visit</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <textarea
                  value={bookForm.notes}
                  onChange={e => setBookForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Machine interest, special requests..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button className="w-full gap-2" onClick={handleBook} disabled={!selectedSlot}>
                <CalendarDays className="w-4 h-4" /> Meeting Book Karein
              </Button>
            </div>
          </SectionCard>
        </div>
      )}
    </motion.div>
  );
}
