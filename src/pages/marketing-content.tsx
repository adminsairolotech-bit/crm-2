import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, SectionCard } from "@/components/shared";
import { Megaphone, MessageSquare, Mail, Copy, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContentPiece {
  id: number;
  title: string;
  channel: "whatsapp" | "email" | "sms";
  content: string;
  createdAt: string;
  machine?: string;
  status: "draft" | "sent" | "scheduled";
}

const channelIcons = { whatsapp: MessageSquare, email: Mail, sms: MessageSquare };
const channelColors = { whatsapp: "bg-emerald-50 text-emerald-700", email: "bg-blue-50 text-blue-600", sms: "bg-violet-50 text-violet-600" };

const mockContent: ContentPiece[] = [
  { id: 1, title: "CNC Lathe Special Offer", channel: "whatsapp", content: "Namaste! Sai Rolotech is offering special pricing on CNC Lathe Pro 5000. Get up to 15% off this month! Contact us for a demo. Call: 98765-43210", createdAt: "2026-03-15", machine: "CNC Lathe Pro 5000", status: "sent" },
  { id: 2, title: "New Machine Announcement", channel: "email", content: "Dear valued customer, we are excited to announce the launch of our new Laser Cutting Machine LCM-500. With precision up to 0.01mm and 30% faster processing...", createdAt: "2026-03-14", machine: "Laser Cutter LCM-500", status: "scheduled" },
  { id: 3, title: "Trade Show Invitation", channel: "whatsapp", content: "You're invited! Visit Sai Rolotech at IMTEX 2026, Bangalore Exhibition Centre. See our latest CNC, Laser, and Hydraulic machines live! Stall B-42.", createdAt: "2026-03-13", status: "sent" },
  { id: 4, title: "Monthly Newsletter", channel: "email", content: "This month at Sai Rolotech: 3 new machine additions, 12 successful installations, customer spotlight: TVS Motors...", createdAt: "2026-03-12", status: "draft" },
  { id: 5, title: "Service Reminder", channel: "sms", content: "Hi! Your machine (CNC Lathe #SRT-2024-156) is due for scheduled maintenance. Book your slot: sairolo.tech/service", createdAt: "2026-03-11", status: "sent" },
];

const statusColors: Record<string, string> = {
  draft: "bg-slate-50 text-slate-600",
  sent: "bg-emerald-50 text-emerald-700",
  scheduled: "bg-amber-50 text-amber-700",
};

export default function MarketingContentPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Marketing Content" subtitle="AI-generated marketing messages and campaigns" />

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Content" value={mockContent.length} icon={Megaphone} iconBg="bg-violet-50" iconColor="text-purple-500" />
        <StatsCard label="WhatsApp" value={mockContent.filter((c) => c.channel === "whatsapp").length} icon={MessageSquare} iconBg="bg-emerald-50" iconColor="text-emerald-700" />
        <StatsCard label="Emails" value={mockContent.filter((c) => c.channel === "email").length} icon={Mail} iconBg="bg-blue-50" iconColor="text-blue-500" />
        <StatsCard label="AI Generated" value={mockContent.length} icon={Bot} iconBg="bg-amber-50" iconColor="text-amber-500" />
      </motion.div>

      <div className="space-y-4">
        {mockContent.map((piece) => {
          const ChannelIcon = channelIcons[piece.channel];
          return (
            <motion.div key={piece.id} variants={staggerItem} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${channelColors[piece.channel]}`}>
                    <ChannelIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{piece.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={channelColors[piece.channel]}>{piece.channel}</Badge>
                      <Badge className={statusColors[piece.status]}>{piece.status}</Badge>
                      {piece.machine && <span className="text-xs text-muted-foreground">{piece.machine}</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(piece.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border mb-3">
                <p className="text-xs text-foreground/80 leading-relaxed">{piece.content}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2"><Copy className="w-3 h-3" /> Copy</Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
