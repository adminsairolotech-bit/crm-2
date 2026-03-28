import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard } from "@/components/shared";
import {
  Users, Search, Shield, UserCheck, UserX, Phone, Mail,
  ToggleLeft, ToggleRight, Plus, Pencil,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface CRMUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "sales" | "support" | "viewer";
  department: string;
  isActive: boolean;
  lastActive: string;
  leadsAssigned: number;
  avatar: string;
}

const mockUsers: CRMUser[] = [
  { id: 1, name: "Vipin Jangra", email: "admin@sairolotech.com", phone: "+91-9899925274", role: "admin", department: "Management", isActive: true, lastActive: "Just now", leadsAssigned: 0, avatar: "VJ" },
  { id: 2, name: "Rahul Sharma", email: "rahul@sairolotech.com", phone: "+91-9876543210", role: "sales", department: "Sales", isActive: true, lastActive: "2h ago", leadsAssigned: 24, avatar: "RS" },
  { id: 3, name: "Priya Verma", email: "priya@sairolotech.com", phone: "+91-9865432109", role: "sales", department: "Sales", isActive: true, lastActive: "4h ago", leadsAssigned: 18, avatar: "PV" },
  { id: 4, name: "Amit Kumar", email: "amit@sairolotech.com", phone: "+91-9854321098", role: "support", department: "Service", isActive: true, lastActive: "1d ago", leadsAssigned: 8, avatar: "AK" },
  { id: 5, name: "Sunita Devi", email: "sunita@sairolotech.com", phone: "+91-9843210987", role: "viewer", department: "Accounts", isActive: true, lastActive: "2d ago", leadsAssigned: 0, avatar: "SD" },
  { id: 6, name: "Deepak Yadav", email: "deepak@sairolotech.com", phone: "+91-9832109876", role: "sales", department: "Sales", isActive: false, lastActive: "7d ago", leadsAssigned: 5, avatar: "DY" },
];

const roleConfig: Record<string, { color: string; label: string }> = {
  admin:   { color: "bg-red-50 text-red-700 border-red-200",     label: "Admin" },
  sales:   { color: "bg-blue-50 text-blue-700 border-blue-200",   label: "Sales" },
  support: { color: "bg-amber-50 text-amber-700 border-amber-200", label: "Support" },
  viewer:  { color: "bg-slate-50 text-slate-600 border-slate-200", label: "Viewer" },
};

export default function UserManagementPage() {
  const [search, setSearch]     = useState("");
  const [roleFilter, setRole]   = useState("all");
  const [users, setUsers]       = useState<CRMUser[]>(mockUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", phone: "", role: "sales" as CRMUser["role"] });

  const filtered = users.filter(u => {
    const m = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const r = roleFilter === "all" || u.role === roleFilter;
    return m && r;
  });

  function toggleUser(id: number) {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const next = { ...u, isActive: !u.isActive };
      toast({ title: `${next.name} ${next.isActive ? "activated" : "deactivated"}` });
      return next;
    }));
  }

  function sendInvite() {
    if (!inviteData.name || !inviteData.email) {
      toast({ title: "Name and email required", variant: "destructive" }); return;
    }
    const newUser: CRMUser = {
      id: Date.now(), ...inviteData, department: inviteData.role === "sales" ? "Sales" : inviteData.role === "support" ? "Service" : "General",
      isActive: true, lastActive: "Never", leadsAssigned: 0,
      avatar: inviteData.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    };
    setUsers(prev => [...prev, newUser]);
    toast({ title: "Invite sent!", description: `${inviteData.email} ko invite bheja gaya` });
    setShowInvite(false);
    setInviteData({ name: "", email: "", phone: "", role: "sales" });
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 pb-10">
      <PageHeader title="User Management" subtitle="SAI RoloTech CRM team members aur access roles" />

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard label="Total Users"  value={users.length}                         icon={Users}      iconBg="bg-blue-50"    iconColor="text-blue-500" />
        <StatsCard label="Admins"       value={users.filter(u => u.role === "admin").length} icon={Shield} iconBg="bg-red-50" iconColor="text-red-500" />
        <StatsCard label="Active"       value={users.filter(u => u.isActive).length}  icon={UserCheck}  iconBg="bg-emerald-50" iconColor="text-emerald-500" />
        <StatsCard label="Inactive"     value={users.filter(u => !u.isActive).length} icon={UserX}      iconBg="bg-slate-50"   iconColor="text-slate-400" />
      </motion.div>

      {/* Search + Filter + Invite */}
      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={roleFilter} onChange={e => setRole(e.target.value)}
          className="bg-white border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="sales">Sales</option>
          <option value="support">Support</option>
          <option value="viewer">Viewer</option>
        </select>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </motion.div>

      {/* Invite Form */}
      {showInvite && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border-l-4 border-primary">
          <h3 className="text-sm font-bold text-foreground mb-4">New User Invite karo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Full Name *</label>
              <input value={inviteData.name} onChange={e => setInviteData(p => ({ ...p, name: e.target.value }))}
                placeholder="Employee ka naam"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Email *</label>
              <input type="email" value={inviteData.email} onChange={e => setInviteData(p => ({ ...p, email: e.target.value }))}
                placeholder="email@sairolotech.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Phone</label>
              <input value={inviteData.phone} onChange={e => setInviteData(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91-XXXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Role</label>
              <select value={inviteData.role} onChange={e => setInviteData(p => ({ ...p, role: e.target.value as CRMUser["role"] }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={sendInvite} className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              Send Invite
            </button>
            <button onClick={() => setShowInvite(false)} className="px-5 py-2 bg-muted text-foreground text-sm rounded-xl hover:bg-muted/80 transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* User Cards */}
      <div className="space-y-3">
        {filtered.map(u => (
          <motion.div key={u.id} variants={staggerItem}
            className={`glass-card rounded-2xl p-4 border transition-all ${u.isActive ? "border-border" : "border-slate-200 opacity-60"}`}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{u.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{u.name}</p>
                  <Badge className={`text-[10px] ${roleConfig[u.role].color}`}>{roleConfig[u.role].label}</Badge>
                  <Badge className={`text-[10px] ${u.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{u.department}</span>
                  {u.leadsAssigned > 0 && <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">{u.leadsAssigned} leads</span>}
                  <span className="text-xs text-muted-foreground">Last: {u.lastActive}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toast({ title: "Edit coming soon" })}
                  className="p-2 rounded-xl border border-border hover:bg-muted transition-colors" aria-label="Edit user">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                {u.role !== "admin" && (
                  <button onClick={() => toggleUser(u.id)} aria-label={u.isActive ? "Deactivate" : "Activate"}
                    className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                    {u.isActive
                      ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                      : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
