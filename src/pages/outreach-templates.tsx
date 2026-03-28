import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, SectionCard } from "@/components/shared";
import { Send, Pencil, Copy, MessageSquare, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Template {
  id: number;
  name: string;
  channel: "whatsapp" | "email" | "phone_script";
  stage: string;
  subject?: string;
  body: string;
  variables: string[];
}

const channelColors = { whatsapp: "bg-emerald-50 text-emerald-700", email: "bg-blue-50 text-blue-600", phone_script: "bg-amber-50 text-amber-700" };
const channelIcons = { whatsapp: MessageSquare, email: Mail, phone_script: Phone };

const mockTemplates: Template[] = [
  { id: 1, name: "Initial Outreach", channel: "whatsapp", stage: "New Lead",
    body: "Namaste {{name}}! I'm from Sai Rolotech. Thank you for your interest in {{machine}}. Would you like to know more about pricing and specifications? We can arrange a demo at your convenience.",
    variables: ["name", "machine"] },
  { id: 2, name: "Follow-up After Demo", channel: "email", stage: "Post-Demo", subject: "Thank you for visiting Sai Rolotech Demo",
    body: "Dear {{name}},\n\nThank you for attending the {{machine}} demonstration. As discussed, I'm attaching the detailed specifications and our best pricing.\n\nPlease let me know if you have any questions.\n\nBest regards,\nSai Rolotech Team",
    variables: ["name", "machine"] },
  { id: 3, name: "Quotation Follow-up", channel: "whatsapp", stage: "Quotation Sent",
    body: "Hi {{name}}, hope you've had a chance to review our quotation ({{quotation_no}}) for {{machine}}. Happy to discuss any modifications. Shall I schedule a call this week?",
    variables: ["name", "quotation_no", "machine"] },
  { id: 4, name: "Cold Call Script", channel: "phone_script", stage: "Cold Outreach",
    body: "Good morning/afternoon, am I speaking with {{name}}?\n\nI'm calling from Sai Rolotech. We specialize in industrial machinery including CNC, Laser, and Hydraulic machines.\n\nI noticed your company {{company}} might benefit from our {{machine}}. Do you have 2 minutes to hear about our current offers?",
    variables: ["name", "company", "machine"] },
  { id: 5, name: "Re-engagement Message", channel: "email", stage: "Cold Lead", subject: "New offerings from Sai Rolotech",
    body: "Dear {{name}},\n\nIt's been a while since we last connected. We've added exciting new machines to our catalog and have special offers running this quarter.\n\nWould love to reconnect and share what's new.\n\nWarm regards,\nSai Rolotech Team",
    variables: ["name"] },
];

export default function OutreachTemplatesPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");

  const filtered = selectedChannel === "all" ? mockTemplates : mockTemplates.filter((t) => t.channel === selectedChannel);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Outreach Templates" subtitle="Manage follow-up message templates for sales outreach" />

      <motion.div variants={staggerItem} className="flex gap-2 flex-wrap">
        {["all", "whatsapp", "email", "phone_script"].map((ch) => (
          <button key={ch} onClick={() => setSelectedChannel(ch)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedChannel === ch ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {ch === "all" ? "All" : ch === "phone_script" ? "Phone Script" : ch.charAt(0).toUpperCase() + ch.slice(1)}
          </button>
        ))}
      </motion.div>

      <div className="space-y-4">
        {filtered.map((template) => {
          const ChannelIcon = channelIcons[template.channel];
          return (
            <motion.div key={template.id} variants={staggerItem} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${channelColors[template.channel]}`}>
                    <ChannelIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{template.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={channelColors[template.channel]}>{template.channel === "phone_script" ? "phone" : template.channel}</Badge>
                      <Badge variant="outline">{template.stage}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              </div>
              {template.subject && <p className="text-xs text-muted-foreground mb-2">Subject: {template.subject}</p>}
              <div className="p-3 rounded-lg bg-muted/30 border border-border mb-3">
                <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">{template.body}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Variables:</span>
                {template.variables.map((v) => (
                  <Badge key={v} variant="outline" className="text-xs font-mono">{`{{${v}}}`}</Badge>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
