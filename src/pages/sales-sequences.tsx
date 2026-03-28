import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, SectionCard } from "@/components/shared";
import { Zap, Clock, Mail, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SequenceStep {
  day: number;
  action: string;
  channel: "email" | "phone" | "whatsapp";
  template: string;
}

interface Sequence {
  id: number;
  name: string;
  description: string;
  steps: SequenceStep[];
  activeLeads: number;
  completionRate: number;
}

const channelIcons = { email: Mail, phone: Phone, whatsapp: MessageSquare };
const channelColors = { email: "text-blue-600", phone: "text-emerald-700", whatsapp: "text-emerald-700" };

const mockSequences: Sequence[] = [
  {
    id: 1, name: "New Lead Nurture", description: "Automated follow-up for new inbound leads", activeLeads: 24, completionRate: 68,
    steps: [
      { day: 0, action: "Welcome email with catalog", channel: "email", template: "welcome_catalog" },
      { day: 1, action: "WhatsApp introduction", channel: "whatsapp", template: "intro_whatsapp" },
      { day: 3, action: "Follow-up call", channel: "phone", template: "first_call" },
      { day: 7, action: "Send quotation email", channel: "email", template: "quotation_followup" },
      { day: 14, action: "Check-in WhatsApp", channel: "whatsapp", template: "checkin_14d" },
    ],
  },
  {
    id: 2, name: "Post-Demo Follow-up", description: "Sequence after machine demonstration", activeLeads: 8, completionRate: 82,
    steps: [
      { day: 0, action: "Thank you email", channel: "email", template: "demo_thankyou" },
      { day: 2, action: "Technical specs WhatsApp", channel: "whatsapp", template: "specs_followup" },
      { day: 5, action: "Pricing discussion call", channel: "phone", template: "pricing_call" },
      { day: 10, action: "Final offer email", channel: "email", template: "final_offer" },
    ],
  },
  {
    id: 3, name: "Re-engagement", description: "Win back cold leads", activeLeads: 15, completionRate: 24,
    steps: [
      { day: 0, action: "Re-engagement email", channel: "email", template: "reengage_intro" },
      { day: 3, action: "New catalog WhatsApp", channel: "whatsapp", template: "new_catalog" },
      { day: 7, action: "Special offer email", channel: "email", template: "special_offer" },
    ],
  },
];

export default function SalesSequencesPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Sales Sequences" subtitle="Automated follow-up sequences for lead nurturing" />

      <div className="space-y-6">
        {mockSequences.map((seq) => (
          <SectionCard key={seq.id} title={seq.name}
            headerAction={
              <div className="flex items-center gap-2">
                <Badge variant="outline">{seq.activeLeads} active</Badge>
                <Badge className="bg-emerald-50 text-emerald-700">{seq.completionRate}% complete</Badge>
              </div>
            }>
            <p className="text-sm text-muted-foreground mb-4">{seq.description}</p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {seq.steps.map((step, i) => {
                  const ChannelIcon = channelIcons[step.channel];
                  return (
                    <motion.div key={i} variants={staggerItem} className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center z-10 shrink-0">
                        <span className="text-xs font-bold text-primary">D{step.day}</span>
                      </div>
                      <div className="flex-1 glass-card rounded-lg p-3 border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <ChannelIcon className={`w-4 h-4 ${channelColors[step.channel]}`} />
                          <span className="text-sm font-medium text-foreground">{step.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Template: {step.template}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </motion.div>
  );
}
