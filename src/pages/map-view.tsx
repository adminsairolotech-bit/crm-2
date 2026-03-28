import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, SectionCard } from "@/components/shared";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const serviceAreas = [
  { region: "Maharashtra", cities: ["Pune", "Mumbai", "Nashik", "Aurangabad"], suppliers: 8, machines: 34 },
  { region: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai"], suppliers: 6, machines: 22 },
  { region: "Gujarat", cities: ["Ahmedabad", "Rajkot", "Surat"], suppliers: 5, machines: 18 },
  { region: "Karnataka", cities: ["Bangalore", "Mysore"], suppliers: 4, machines: 15 },
  { region: "Telangana", cities: ["Hyderabad", "Warangal"], suppliers: 3, machines: 12 },
  { region: "Haryana", cities: ["Gurgaon", "Faridabad"], suppliers: 3, machines: 10 },
  { region: "Delhi NCR", cities: ["New Delhi", "Noida", "Ghaziabad"], suppliers: 4, machines: 16 },
  { region: "Rajasthan", cities: ["Jaipur", "Udaipur"], suppliers: 2, machines: 8 },
];

export default function MapViewPage() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Map View" subtitle="Supplier and machine locations across India" />

      <motion.div variants={staggerItem} className="glass-card rounded-xl overflow-hidden" style={{ height: "400px" }}>
        <iframe
          title="Sai Rolotech Service Areas"
          src="https://www.openstreetmap.org/export/embed.html?bbox=68.7,8.0,97.4,37.6&layer=mapnik"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </motion.div>

      <SectionCard title="Service Areas">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceAreas.map((area) => (
            <motion.div key={area.region} variants={staggerItem} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{area.region}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{area.cities.join(", ")}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{area.suppliers} suppliers</Badge>
                <Badge className="bg-blue-50 text-blue-600">{area.machines} machines</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}
