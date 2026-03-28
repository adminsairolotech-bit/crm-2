import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { machines as machineService } from "@/lib/dataService";
import {
  Cpu, Search, IndianRupee, Loader2, Plus, Eye, Pencil, X, Grid3X3,
  List, Filter, ChevronDown, ChevronRight, Star, Package, Settings,
  Zap, TrendingUp, BarChart3, Tag, Box, Layers, ArrowUpDown, FileText,
  Download, Share2, Power, AlertTriangle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface Machine {
  id: number;
  name: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  price: number | null;
  currency: string;
  isActive: boolean;
  specifications: any;
  images: string[] | null;
  createdAt: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  "CNC": { bg: "bg-blue-500/10", text: "text-blue-500", icon: Cpu },
  "Lathe": { bg: "bg-emerald-500/10", text: "text-emerald-500", icon: Settings },
  "Milling": { bg: "bg-purple-500/10", text: "text-purple-500", icon: Layers },
  "Grinding": { bg: "bg-orange-500/10", text: "text-orange-500", icon: Zap },
  "Drilling": { bg: "bg-cyan-500/10", text: "text-cyan-500", icon: Box },
  "Welding": { bg: "bg-red-500/10", text: "text-red-500", icon: AlertTriangle },
  "Laser": { bg: "bg-pink-500/10", text: "text-pink-500", icon: Star },
  "Press": { bg: "bg-amber-500/10", text: "text-amber-500", icon: Package },
};

const CHART_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4", "#ef4444", "#ec4899", "#84cc16"];

export default function MachineCatalogPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "date">("name");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [activeTab, setActiveTab] = useState<"catalog" | "analytics" | "compare">("catalog");
  const [compareList, setCompareList] = useState<Machine[]>([]);

  useEffect(() => {
    async function loadMachines() {
      try {
        const data = await machineService.getAll();
        const mapped = data.map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          subcategory: m.model || null,
          description: m.description,
          price: m.price ? parseFloat(String(m.price).replace(/[^\d.]/g, '')) || null : null,
          currency: "INR",
          isActive: true,
          specifications: m.specs || m.specifications || {},
          images: Array.isArray(m.images) ? m.images.map((img: any) => typeof img === 'string' ? img : img?.url || '') : null,
          createdAt: m.created_at,
        }));
        setMachines(mapped);
      } catch {
        setMachines([]);
      }
      setLoading(false);
    }
    loadMachines();
  }, []);

  const categories = ["All", ...new Set(machines.map((m) => m.category).filter(Boolean))];

  const filtered = machines.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.subcategory || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || m.category === category;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? m.isActive : !m.isActive);
    const matchPrice = priceRange === "all" ||
      (priceRange === "low" && (m.price || 0) < 500000) ||
      (priceRange === "mid" && (m.price || 0) >= 500000 && (m.price || 0) < 2000000) ||
      (priceRange === "high" && (m.price || 0) >= 2000000);
    return matchSearch && matchCat && matchStatus && matchPrice;
  }).sort((a, b) => {
    if (sortBy === "price") return (b.price || 0) - (a.price || 0);
    if (sortBy === "date") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return a.name.localeCompare(b.name);
  });

  const avgPrice = machines.length > 0 ? machines.reduce((a, m) => a + (m.price || 0), 0) / machines.length : 0;
  const maxPrice = machines.length > 0 ? Math.max(...machines.map((m) => m.price || 0)) : 0;
  const activeMachines = machines.filter((m) => m.isActive).length;

  const categoryData = categories.filter((c) => c !== "All").map((c) => ({
    name: c,
    count: machines.filter((m) => m.category === c).length,
  }));

  const priceDistData = [
    { range: "< ₹5L", count: machines.filter((m) => (m.price || 0) < 500000).length },
    { range: "₹5-20L", count: machines.filter((m) => (m.price || 0) >= 500000 && (m.price || 0) < 2000000).length },
    { range: "₹20-50L", count: machines.filter((m) => (m.price || 0) >= 2000000 && (m.price || 0) < 5000000).length },
    { range: "> ₹50L", count: machines.filter((m) => (m.price || 0) >= 5000000).length },
  ];

  const toggleCompare = (m: Machine) => {
    if (compareList.find((c) => c.id === m.id)) {
      setCompareList(compareList.filter((c) => c.id !== m.id));
    } else if (compareList.length < 4) {
      setCompareList([...compareList, m]);
    }
  };

  const getCategoryStyle = (cat: string | null) => {
    const key = Object.keys(CATEGORY_COLORS).find((k) => (cat || "").toLowerCase().includes(k.toLowerCase()));
    return key ? CATEGORY_COLORS[key] : { bg: "bg-gray-500/10", text: "text-gray-400", icon: Cpu };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="Machine Catalog" subtitle="Pro-level industrial machinery management by category" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatsCard label="Total Machines" value={machines.length} icon={Cpu} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Active" value={activeMachines} icon={Power} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatsCard label="Categories" value={categories.length - 1} icon={Layers} iconBg="bg-purple-500/10" iconColor="text-purple-500" />
        <StatsCard label="Avg. Price" value={`₹${(avgPrice / 100000).toFixed(1)}L`} icon={IndianRupee} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
        <StatsCard label="Highest" value={`₹${(maxPrice / 100000).toFixed(1)}L`} icon={TrendingUp} iconBg="bg-red-500/10" iconColor="text-red-500" />
        <StatsCard label="Comparing" value={compareList.length} icon={ArrowUpDown} iconBg="bg-cyan-500/10" iconColor="text-cyan-500" />
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-wrap gap-2">
        {[
          { key: "catalog", label: "Catalog", icon: Grid3X3 },
          { key: "analytics", label: "Analytics", icon: BarChart3 },
          { key: "compare", label: `Compare (${compareList.length})`, icon: ArrowUpDown },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-primary text-primary-foreground shadow-lg" : "bg-card hover:bg-muted text-muted-foreground border border-border"
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </motion.div>

      {activeTab === "catalog" && (
        <>
          <motion.div variants={staggerItem} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search machines, categories, specs..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card border border-border text-sm hover:bg-muted transition-colors">
                <Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              <div className="flex items-center bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="glass-card rounded-xl p-4 flex flex-wrap gap-3">
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  {categories.map((c) => <option key={c} value={c as string}>{c as string}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value as any)}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="all">All Prices</option>
                  <option value="low">Under ₹5L</option>
                  <option value="mid">₹5L - ₹20L</option>
                  <option value="high">Above ₹20L</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const style = getCategoryStyle(cat as string);
                const count = cat === "All" ? machines.length : machines.filter((m) => m.category === cat).length;
                return (
                  <button key={cat} onClick={() => setCategory(cat as string)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      category === cat ? "bg-primary text-primary-foreground border-primary" : `${style.bg} ${style.text} border-transparent hover:border-current`
                    }`}>
                    <Tag className="w-3 h-3" /> {cat as string} ({count})
                  </button>
                );
              })}
            </div>
          </motion.div>

          {viewMode === "grid" ? (
            <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => {
                const style = getCategoryStyle(m.category);
                const CatIcon = style.icon;
                const isComparing = compareList.some((c) => c.id === m.id);
                return (
                  <div key={m.id} className={`glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-all group ${isComparing ? "ring-2 ring-primary" : ""}`}>
                    <div className={`h-2 ${m.isActive ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-gray-500"}`} />
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${style.bg}`}>
                            <CatIcon className={`w-5 h-5 ${style.text}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-sm">{m.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{m.category || "—"}</span>
                              {m.subcategory && (
                                <><span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{m.subcategory}</span></>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={m.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-400"}>
                          {m.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {m.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-lg font-bold text-foreground">
                          {m.price ? `₹${(m.price / 100000).toFixed(1)}L` : "Price N/A"}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedMachine(selectedMachine?.id === m.id ? null : m)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleCompare(m)}
                            className={`p-1.5 rounded-lg transition-colors ${isComparing ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {selectedMachine?.id === m.id && (
                      <div className="p-4 border-t border-border bg-card/50 space-y-2">
                        {m.specifications && typeof m.specifications === "object" && (
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Specifications</h4>
                            <div className="grid grid-cols-2 gap-1">
                              {Object.entries(m.specifications as Record<string, any>).slice(0, 6).map(([k, v]) => (
                                <div key={k} className="text-xs">
                                  <span className="text-muted-foreground">{k}:</span>{" "}
                                  <span className="text-foreground font-medium">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">ID: #{m.id} • Added: {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN") : "—"}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div variants={staggerItem} className="space-y-2">
              {filtered.map((m) => {
                const style = getCategoryStyle(m.category);
                const CatIcon = style.icon;
                const isComparing = compareList.some((c) => c.id === m.id);
                return (
                  <div key={m.id} className={`glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all ${isComparing ? "ring-2 ring-primary" : ""}`}>
                    <div className={`p-2.5 rounded-xl ${style.bg} flex-shrink-0`}>
                      <CatIcon className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{m.name}</h3>
                      <p className="text-xs text-muted-foreground">{m.category || "—"} • {m.subcategory || "—"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground">{m.price ? `₹${(m.price / 100000).toFixed(1)}L` : "—"}</p>
                    </div>
                    <Badge className={m.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-400"}>
                      {m.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setSelectedMachine(selectedMachine?.id === m.id ? null : m)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleCompare(m)}
                        className={`p-1.5 rounded-lg transition-colors ${isComparing ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {filtered.length === 0 && (
            <div className="glass-card rounded-xl p-12 text-center">
              <Cpu className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No Machines Found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </>
      )}

      {activeTab === "analytics" && (
        <motion.div variants={staggerItem} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-card rounded-xl p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" /> Machines by Category
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}>
                    {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-500" /> Price Distribution
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priceDistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.filter((c) => c !== "All").slice(0, 6).map((cat) => {
              const style = getCategoryStyle(cat as string);
              const CatIcon = style.icon;
              const catMachines = machines.filter((m) => m.category === cat);
              const catAvgPrice = catMachines.length > 0 ? catMachines.reduce((a, m) => a + (m.price || 0), 0) / catMachines.length : 0;
              return (
                <div key={cat} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${style.bg}`}>
                      <CatIcon className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{cat as string}</h4>
                      <p className="text-xs text-muted-foreground">{catMachines.length} machines</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Avg Price</span>
                    <span className="font-medium text-foreground">₹{(catAvgPrice / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-medium text-emerald-500">{catMachines.filter((m) => m.isActive).length}/{catMachines.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {activeTab === "compare" && (
        <motion.div variants={staggerItem} className="space-y-4">
          {compareList.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <ArrowUpDown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground">No Machines Selected</h3>
              <p className="text-sm text-muted-foreground mb-4">Go to Catalog tab and click the compare button on machines to add them here</p>
              <Button onClick={() => setActiveTab("catalog")} className="gap-2"><Grid3X3 className="w-4 h-4" /> Go to Catalog</Button>
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left text-xs text-muted-foreground uppercase">Feature</th>
                    {compareList.map((m) => (
                      <th key={m.id} className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-foreground">{m.name}</span>
                          <button onClick={() => toggleCompare(m)} className="text-xs text-red-500 hover:underline">Remove</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Category", getValue: (m: Machine) => m.category || "—" },
                    { label: "Subcategory", getValue: (m: Machine) => m.subcategory || "—" },
                    { label: "Price", getValue: (m: Machine) => m.price ? `₹${(m.price / 100000).toFixed(1)}L` : "—" },
                    { label: "Status", getValue: (m: Machine) => m.isActive ? "Active" : "Inactive" },
                    { label: "Description", getValue: (m: Machine) => m.description?.substring(0, 100) || "—" },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-border/50">
                      <td className="p-4 text-xs text-muted-foreground font-medium">{row.label}</td>
                      {compareList.map((m) => (
                        <td key={m.id} className="p-4 text-center text-foreground text-sm">{row.getValue(m)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
