import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageHeader, StatsCard, DataTable } from "@/components/shared";
import { Users, Search, Shield, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "supplier" | "machine_user";
  company?: string;
  isActive: boolean;
  createdAt: string;
}

const mockUsers: User[] = [
  { id: 1, name: "Sai Admin", email: "admin@sairolotech.com", phone: "+91 98765 00001", role: "admin", isActive: true, createdAt: "2025-01-15" },
  { id: 2, name: "Vikram Sharma", email: "vikram@precisiontools.in", phone: "+91 98765 43210", role: "supplier", company: "Precision Tools Pvt Ltd", isActive: true, createdAt: "2025-03-20" },
  { id: 3, name: "Anita Patel", email: "anita@hydroforce.in", phone: "+91 87654 32109", role: "supplier", company: "HydroForce India", isActive: true, createdAt: "2025-04-10" },
  { id: 4, name: "Rajesh Kumar", email: "rajesh@tata.com", phone: "+91 76543 21098", role: "machine_user", company: "Tata AutoComp", isActive: true, createdAt: "2025-06-15" },
  { id: 5, name: "Priya Nair", email: "priya@godrej.com", phone: "+91 65432 10987", role: "machine_user", company: "Godrej Agrovet", isActive: true, createdAt: "2025-07-22" },
  { id: 6, name: "Deepak Joshi", email: "deepak@lnt.com", phone: "+91 54321 09876", role: "machine_user", company: "L&T Technology", isActive: false, createdAt: "2025-08-05" },
  { id: 7, name: "Meena Iyer", email: "meena@sparktech.in", phone: "+91 43210 98765", role: "supplier", company: "SparkTech EDM", isActive: true, createdAt: "2025-09-18" },
  { id: 8, name: "Arun Verma", email: "arun@tatasteel.com", phone: "+91 32109 87654", role: "machine_user", company: "Tata Steel", isActive: true, createdAt: "2025-10-30" },
];

const roleColors: Record<string, string> = {
  admin: "bg-red-500/10 text-red-400",
  supplier: "bg-purple-500/10 text-purple-400",
  machine_user: "bg-blue-500/10 text-blue-400",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  supplier: "Supplier",
  machine_user: "User",
};

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns = [
    { key: "name", header: "User", render: (u: User) => (
      <div>
        <p className="font-medium text-foreground">{u.name}</p>
        <p className="text-xs text-muted-foreground">{u.email}</p>
      </div>
    )},
    { key: "phone", header: "Phone", render: (u: User) => <span className="text-sm">{u.phone}</span> },
    { key: "role", header: "Role", render: (u: User) => <Badge className={roleColors[u.role]}>{roleLabels[u.role]}</Badge> },
    { key: "company", header: "Company", render: (u: User) => <span className="text-sm text-muted-foreground">{u.company || "—"}</span> },
    { key: "status", header: "Status", render: (u: User) => (
      <Badge className={u.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-500/10 text-gray-400"}>
        {u.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    { key: "joined", header: "Joined", render: (u: User) => <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span> },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <PageHeader title="User Management" subtitle="Manage all platform users and roles" />

      <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Users" value={mockUsers.length} icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Admins" value={mockUsers.filter((u) => u.role === "admin").length} icon={Shield} iconBg="bg-red-500/10" iconColor="text-red-400" />
        <StatsCard label="Active" value={mockUsers.filter((u) => u.isActive).length} icon={UserCheck} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatsCard label="Inactive" value={mockUsers.filter((u) => !u.isActive).length} icon={UserX} iconBg="bg-gray-500/10" iconColor="text-gray-400" />
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="supplier">Supplier</option>
          <option value="machine_user">Machine User</option>
        </select>
      </motion.div>

      <motion.div variants={staggerItem} className="glass-card rounded-xl overflow-hidden">
        <DataTable columns={columns} data={filtered} keyExtractor={(u) => u.id} emptyMessage="No users found." />
      </motion.div>
    </motion.div>
  );
}
