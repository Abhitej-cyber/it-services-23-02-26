"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Shield,
    GraduationCap,
    Building2,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Calendar,
    ChevronRight,
    ArrowRight,
    Search,
    Monitor,
    AlertCircle,
    Loader2,
    Wrench,
    Trash2,
    Cpu,
    Zap,
    MapPin,
    Flame,
    Activity,
    Users,
    Package,
    Plus
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { Modal } from "@/components/ui/modal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DeanDashboard() {
    const router = useRouter();

    const { data: stats, isLoading: loadingStats } = useSWR("/api/stats", fetcher, { revalidateOnFocus: false });
    const { data: requestsRaw, mutate: mutateRequests } = useSWR("/api/requests", fetcher);
    const { data: distributionRaw } = useSWR("/api/analytics/distribution", fetcher, { revalidateOnFocus: false });
    const { data: adminsRaw } = useSWR("/api/users?role=ADMIN", fetcher, { revalidateOnFocus: false });
    const { data: hodsRaw, mutate: mutateHods } = useSWR("/api/users?role=HOD", fetcher);
    const { data: inventoryRequestsRaw, mutate: mutateInventoryReqs } = useSWR("/api/inventory/requests", fetcher);

    const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
    const distribution = Array.isArray(distributionRaw) ? distributionRaw : [];
    const admins = Array.isArray(adminsRaw) ? adminsRaw : [];
    const hods = Array.isArray(hodsRaw) ? hodsRaw : [];
    const inventoryRequests = Array.isArray(inventoryRequestsRaw) ? inventoryRequestsRaw : [];

    const loading = loadingStats;

    const [showHistory, setShowHistory] = useState(false);

    // Search & Modals
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [processingRequest, setProcessingRequest] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [assignedAdminId, setAssignedAdminId] = useState("");
    const [activeTab, setActiveTab] = useState<"SERVICE" | "ACCOUNT" | "HOD_DIRECTORY" | "INVENTORY">("SERVICE");
    const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);

    const [newInventoryItem, setNewInventoryItem] = useState({ name: "", quantity: 1, category: "" });

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(`/api/assets?search=${searchQuery}&limit=50`);
            const data = await res.json();
            setSearchResults(Array.isArray(data.assets) ? data.assets : []);
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    const handleAction = async (status: "APPROVED" | "DECLINED") => {
        if (!selectedRequest) return;
        setProcessingRequest(true);
        try {
            const res = await fetch(`/api/requests/${selectedRequest.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    remarks: remarks || `Processed by Dean via Executive Link`,
                    assignedAdminId: status === "APPROVED" ? assignedAdminId : undefined
                })
            });

            if (res.ok) {
                await Promise.all([mutateRequests(), mutateHods()]);
                setSelectedRequest(null);
                setRemarks("");
                setAssignedAdminId("");
            }
        } catch (error) {
            console.error("Failed to update request:", error);
        } finally {
            setProcessingRequest(false);
        }
    };

    const handleAddInventory = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessingRequest(true);
        try {
            const res = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newInventoryItem),
            });

            if (res.ok) {
                setIsAddInventoryOpen(false);
                setNewInventoryItem({ name: "", quantity: 1, category: "" });
                await fetch("/api/inventory"); // Optional but good for cache
            } else {
                const err = await res.json();
                alert(err.error || "Failed to initialize component");
            }
        } catch (error) {
            console.error("Inventory addition failed:", error);
        } finally {
            setProcessingRequest(false);
        }
    };

    const handleInventoryAction = async (requestId: string, status: "APPROVED" | "DECLINED") => {
        setProcessingRequest(true);
        try {
            const res = await fetch(`/api/inventory/requests/${requestId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                await Promise.all([mutateInventoryReqs(), fetch("/api/inventory").then(res => res.json())]);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to process inventory request");
            }
        } catch (error) {
            console.error("Inventory action failed:", error);
        } finally {
            setProcessingRequest(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to permanently delete this HOD account? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                await Promise.all([mutateHods(), mutateRequests()]);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("An error occurred while deleting the account");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-transparent">
                <div className="relative">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                            borderRadius: ["20%", "50%", "20%"]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-20 w-20 bg-gradient-to-tr from-green-400 via-emerald-400 to-gold-400 blur-xl opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-[#fafafa] p-6 lg:p-10 space-y-10 selection:bg-green-500/30 overflow-hidden text-slate-900 font-sans">
            {/* Deep Sea Matrix Mesh Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#fafafa]">
                <motion.div
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#ecf39e]/40 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        x: [0, -40, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#91a84b]/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#f7e479]/40 rounded-full blur-[100px]"
                />
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 space-y-10 max-w-[1700px] mx-auto">
                {/* Header with Playful Glassmorphism */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-green-100 shadow-sm mb-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-green-600 animate-ping" />
                            <span className="text-[11px] font-black text-green-800 uppercase tracking-[0.2em]">Vignan Institute of Technology and Science</span>
                        </motion.div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-x-4">
                            <span className="text-[#1b4332]">Asset</span>
                            <span className="relative">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#b7e4c7] animate-gradient-x">Intelligence</span>
                                <motion.div
                                    animate={{ width: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -bottom-2 left-0 h-1.5 bg-gradient-to-r from-[#2d6a4f] to-[#b7e4c7] rounded-full opacity-30"
                                />
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-slate-200" />
                            Global Infrastructure Control
                            <span className="w-8 h-[2px] bg-slate-200" />
                        </p>
                    </div>

                    <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="flex items-center gap-5 bg-white/70 backdrop-blur-xl p-5 rounded-[32px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
                    >
                        <div className="bg-gradient-to-br from-green-700 to-emerald-600 p-4 rounded-2xl shadow-lg shadow-green-900/20">
                            <Calendar className="h-6 w-6 text-emerald-50" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] mb-1">System Timeline</p>
                            <p className="text-lg font-black text-green-900 tracking-tight">
                                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* KPI Cards - Breathtaking Candy Gradients */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        {
                            label: "Network Nodes",
                            value: stats?.totalSystems || 0,
                            change: "Live Tracking",
                            icon: Monitor,
                            colors: "from-[#1b4332] to-[#2d6a4f]",
                            glow: "shadow-green-900/40",
                            accent: "bg-white/10",
                            text: "text-green-50",
                            href: "/assets"
                        },
                        {
                            label: "System Health",
                            value: stats?.readyForUse || 0,
                            change: "Optimal Condition",
                            icon: CheckCircle2,
                            colors: "from-[#2d6a4f] to-[#40916c]",
                            glow: "shadow-green-700/30",
                            accent: "bg-white/10",
                            text: "text-green-50",
                            href: "/assets"
                        },
                        {
                            label: "Service Ops",
                            value: stats?.service || 0,
                            change: "Active Pipeline",
                            icon: Wrench,
                            colors: "from-[#40916c] to-[#95d5b2]",
                            glow: "shadow-green-500/30",
                            accent: "bg-[#1b4332]/10",
                            text: "text-white",
                            href: "/tickets"
                        },
                        {
                            label: "Alert Status",
                            value: stats?.priorityTasks || 0,
                            change: stats?.priorityTasks > 0 ? "Urgent Action" : "No Conflicts",
                            icon: Flame,
                            colors: stats?.priorityTasks > 0 ? "from-[#1b4332] to-[#40916c]" : "from-[#d8f3dc] to-[#b7e4c7]",
                            glow: stats?.priorityTasks > 0 ? "shadow-green-900/40" : "shadow-green-100/30",
                            accent: "bg-white/20",
                            text: stats?.priorityTasks > 0 ? "text-white" : "text-[#1b4332]",
                            href: "/tickets"
                        },
                    ].map((kpi, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            onClick={() => {
                                if (kpi.label === "Alert Status" || kpi.label === "Priority Actions") {
                                    document.getElementById('institutional-queue')?.scrollIntoView({ behavior: 'smooth' });
                                } else if (kpi.href) {
                                    router.push(kpi.href);
                                }
                            }}
                            className={cn(
                                `relative group bg-gradient-to-br ${kpi.colors} p-8 rounded-[40px] shadow-2xl ${kpi.glow} overflow-hidden cursor-pointer`
                            )}
                        >
                            {/* Animated Background Shapes */}
                            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                            <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                                <div className="flex items-center justify-between">
                                    <div className={cn("p-4 rounded-3xl backdrop-blur-xl border border-white/30", kpi.accent)}>
                                        <kpi.icon className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all">
                                        <ArrowRight className="h-5 w-5 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/80">{kpi.label}</p>
                                    <div className="flex items-baseline gap-4">
                                        <h3 className="text-6xl font-black tracking-tighter text-white">{kpi.value}</h3>
                                        <div className="px-3 py-1 bg-white/20 border border-white/30 rounded-full backdrop-blur-md">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{kpi.change}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <div className="xl:col-span-2 space-y-10">
                        {/* Elegant Analytics Chart Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/80 backdrop-blur-2xl p-8 lg:p-10 rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-80 h-80 bg-green-50 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-50 rounded-xl">
                                            <Cpu className="w-5 h-5 text-green-700" />
                                        </div>
                                        <h3 className="text-[11px] font-black text-green-700 uppercase tracking-[0.2em]">Deployment Matrix</h3>
                                    </div>
                                    <h2 className="text-3xl font-black text-green-900 tracking-tight">Infrastructure Pulse</h2>
                                </div>
                                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-purple-50 shadow-sm">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                                    </span>
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Active Monitoring</span>
                                </div>
                            </div>

                            <div className="h-[360px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1b4332" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" strokeOpacity={0.5} />
                                        <XAxis
                                            dataKey="code"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc', radius: 12 }}
                                            contentStyle={{
                                                borderRadius: '24px',
                                                border: 'none',
                                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                                                padding: '16px 24px',
                                                fontWeight: '800',
                                                fontSize: '13px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[16, 16, 4, 4]} barSize={54}>
                                            {distribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill="url(#colorCount)" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Request Queue - Bubble Tabs & Candy List */}
                        <div id="institutional-queue" className="bg-white/70 backdrop-blur-2xl rounded-[48px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white overflow-hidden scroll-mt-6">
                            <div className="p-8 lg:p-12 border-b border-[#caf0f8]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                <div className="space-y-8 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-br from-green-700 to-emerald-600 rounded-2xl shadow-lg shadow-green-900/20">
                                            <Zap className="h-6 w-6 text-emerald-50" />
                                        </div>
                                        <h2 className="text-3xl font-black text-green-900 tracking-tight">Signal Flow Queue</h2>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 bg-[#caf0f8]/30 p-2 rounded-[24px] w-fit border border-[#ade8f4]/20">
                                        {[
                                            { id: "SERVICE", label: "Operations" },
                                            { id: "ACCOUNT", label: "Accounts", count: requests.filter(r => r.type === "ACCOUNT_APPROVAL" && r.status === "PENDING").length, color: "bg-green-800" },
                                            { id: "HOD_DIRECTORY", label: "Directory", count: hods.length, color: "bg-green-700" },
                                            { id: "INVENTORY", label: "Peripherals", count: inventoryRequests.filter(r => r.status === "PENDING").length, color: "bg-emerald-600" },
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id as any)}
                                                className={cn(
                                                    "text-[11px] font-black px-6 py-3 rounded-[18px] transition-all duration-300 flex items-center gap-3 uppercase tracking-widest",
                                                    activeTab === tab.id
                                                        ? "bg-white text-green-800 shadow-md ring-1 ring-green-100"
                                                        : "text-slate-400 hover:text-green-700 hover:bg-white/40"
                                                )}
                                            >
                                                {tab.label}
                                                {tab.count !== undefined && tab.count > 0 && (
                                                    <span className={cn("px-2 py-0.5 text-white rounded-lg text-[10px] shadow-sm animate-pulse", tab.color)}>
                                                        {tab.count}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 lg:w-80">
                                    <div className="relative w-full group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-green-200 group-focus-within:text-green-700 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Sync assets..."
                                            className="w-full pl-12 pr-6 py-4 bg-white/60 border border-green-50 rounded-[28px] text-sm focus:ring-4 focus:ring-green-500/10 focus:border-green-200 font-bold shadow-sm transition-all placeholder:text-green-200"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Global Search Results Dropdown */}
                            {searchResults.length > 0 && searchQuery && (
                                <div className="p-10 bg-gradient-to-b from-[#caf0f8]/20 to-transparent border-b border-[#caf0f8]/40 backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-xl shadow-sm border border-green-50">
                                                <MapPin className="h-4 w-4 text-green-600" />
                                            </div>
                                            <h3 className="text-xs font-black uppercase text-green-800 tracking-[0.2em]">Signal Locator Results</h3>
                                        </div>
                                        <button onClick={() => setSearchResults([])} className="text-[10px] font-black text-green-300 hover:text-green-800 uppercase px-4 py-2 bg-white rounded-xl border border-green-50 shadow-sm transition-all">Clear Sync</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {searchResults.map(asset => (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={asset.id}
                                                className="p-6 bg-white rounded-[32px] border border-purple-50 shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden border-b-4 border-b-purple-100"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 text-green-500 rounded-2xl border border-green-100 group-hover:bg-green-500 group-hover:text-white transition-all duration-500">
                                                        <Monitor className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-slate-800 tracking-tight">{asset.name}</p>
                                                        <p className="text-[10px] text-green-400 font-black uppercase tracking-widest">{asset.assetNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-2">{asset.lab?.name || "Unbound"}</span>
                                                    <p className="text-[11px] text-slate-400 font-bold uppercase">{asset.department.code}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="divide-y divide-purple-50 bg-white/40">
                                {activeTab === "HOD_DIRECTORY" ? (
                                    hods.length > 0 ? (
                                        hods.map((hod, index) => (
                                            <div key={hod.id} className="p-8 hover:bg-white/80 transition-all duration-300 group">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                    <div className="flex items-center gap-8">
                                                        <div className="text-xs font-black text-green-200 tabular-nums">
                                                            {String(index + 1).padStart(2, '0')}
                                                        </div>
                                                        <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-[28px] flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-green-500/20 group-hover:rotate-6 transition-transform overflow-hidden">
                                                            {hod.image ? (
                                                                <img src={hod.image} alt={hod.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                hod.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors tracking-tight">{hod.name}</h4>
                                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                                <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
                                                                    {hod.department?.name || 'Department Head'}
                                                                </span>
                                                                <span className="text-slate-400 text-xs font-bold">{hod.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteUser(hod.id)}
                                                        className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[22px] border border-transparent hover:border-rose-100 transition-all self-end sm:self-auto group-hover:scale-110"
                                                        title="Revoke Permission"
                                                    >
                                                        <Trash2 className="h-6 w-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-24 flex flex-col items-center justify-center text-center">
                                            <div className="p-8 bg-green-50 rounded-[3rem] border border-green-100 mb-8 animate-bounce">
                                                <Users className="h-12 w-12 text-green-300" />
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Empty Directory</h4>
                                            <p className="text-sm text-slate-500 mt-3 font-bold max-w-sm">No HOD signals detected in the system matrix yet.</p>
                                        </div>
                                    )
                                ) : activeTab === "INVENTORY" ? (
                                    inventoryRequests.filter(r => showHistory ? true : r.status === "PENDING").length > 0 ? (
                                        inventoryRequests.filter(r => showHistory ? true : r.status === "PENDING").map((req: any, index: number) => (
                                            <div key={req.id} className="p-8 hover:bg-white/80 transition-all group relative overflow-hidden">
                                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 pl-2">
                                                    <div className="flex items-start gap-8">
                                                        <div className="mt-1.5 px-4 py-2 bg-white border border-green-100 rounded-2xl shadow-sm text-green-700 font-black text-[11px] uppercase tracking-widest whitespace-nowrap">
                                                            #{req.requestNumber.split('-')[2]}
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                                                                    Material Sync
                                                                </span>
                                                            </div>
                                                            <h4 className="text-2xl font-black text-slate-800 group-hover:text-green-600 transition-colors tracking-tight">
                                                                {req.inventoryItem?.name} {req.quantity > 1 ? `x${req.quantity}` : ""}
                                                            </h4>
                                                            <p className="text-slate-500 text-sm font-bold line-clamp-2 max-w-2xl leading-relaxed">{req.remarks || "Standard procurement for system integrity."}</p>
                                                            {(req.department || req.lab) && (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                                                        <Building2 className="w-3 h-3 text-slate-400" />
                                                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">{req.department?.code || "GLB"}</span>
                                                                    </div>
                                                                    {req.lab && (
                                                                        <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                                                                            <Monitor className="w-3 h-3 text-slate-400" />
                                                                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">{req.lab.name}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md overflow-hidden">
                                                                        {req.requestedBy?.image ? (
                                                                            <img src={req.requestedBy.image} alt={req.requestedBy.name} className="h-full w-full object-cover" />
                                                                        ) : (
                                                                            req.requestedBy?.name?.charAt(0) || "S"
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-black text-slate-900">{req.requestedBy?.name || "System Controller"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-slate-400">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span className="text-[11px] font-black">{new Date(req.createdAt).toDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {req.status === "PENDING" ? (
                                                        <div className="flex items-center gap-4 xl:shrink-0">
                                                            <button
                                                                onClick={() => handleInventoryAction(req.id, "DECLINED")}
                                                                disabled={processingRequest}
                                                                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-400 border border-slate-100 font-black text-[11px] uppercase tracking-widest rounded-3xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all disabled:opacity-50"
                                                            >
                                                                <XCircle className="w-5 h-5" /> Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleInventoryAction(req.id, "APPROVED")}
                                                                disabled={processingRequest}
                                                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl hover:shadow-xl hover:shadow-purple-500/20 transition-all disabled:opacity-50"
                                                            >
                                                                <CheckCircle2 className="w-5 h-5" /> Grant
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className={cn(
                                                            "px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border shrink-0",
                                                            req.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                                        )}>
                                                            {req.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-24 flex flex-col items-center justify-center text-center">
                                            <div className="p-8 bg-green-50 rounded-[3rem] border border-green-100 mb-8">
                                                <Package className="h-12 w-12 text-green-300" />
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Resources Stocked</h4>
                                            <p className="text-sm text-slate-500 mt-3 font-medium max-w-sm">No pending material requests found in the current cycle.</p>
                                        </div>
                                    )
                                ) : requests.filter(r => {
                                    const baseFilter = showHistory ? true : r.status === "PENDING";
                                    const typeFilter = activeTab === "ACCOUNT"
                                        ? r.type === "ACCOUNT_APPROVAL"
                                        : r.type !== "ACCOUNT_APPROVAL";
                                    return baseFilter && typeFilter;
                                }).length > 0 ? (
                                    requests.filter(r => {
                                        const baseFilter = showHistory ? true : r.status === "PENDING";
                                        const typeFilter = activeTab === "ACCOUNT"
                                            ? r.type === "ACCOUNT_APPROVAL"
                                            : r.type !== "ACCOUNT_APPROVAL";
                                        return baseFilter && typeFilter;
                                    }).map((req, index) => (
                                        <div key={req.id} className="p-10 hover:bg-white/80 transition-all group relative overflow-hidden">
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full",
                                                req.priority === "HIGH" ? "bg-rose-500" : "bg-green-500"
                                            )} />

                                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 pl-2">
                                                <div className="flex items-start gap-8">
                                                    <div className="mt-1.5 px-4 py-2 bg-white border border-green-100 rounded-2xl shadow-sm text-green-700 font-black text-[11px] uppercase tracking-widest whitespace-nowrap">
                                                        #{req.requestNumber.split('-')[2]}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                                                                {req.type.replace('_', ' ')}
                                                            </span>
                                                            <span className={cn(
                                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                                                                req.priority === "HIGH" ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                                                            )}>
                                                                {req.priority === "HIGH" && <Flame className="w-3.5 h-3.5" />}
                                                                {req.priority} PRIORITY
                                                            </span>
                                                        </div>
                                                        <h4 className="text-2xl font-black text-slate-900 group-hover:text-green-600 transition-colors tracking-tight leading-tight">{req.title}</h4>
                                                        <p className="text-slate-500 text-sm font-bold line-clamp-2 max-w-2xl leading-relaxed">{req.description}</p>

                                                        <div className="flex flex-wrap items-center gap-6 pt-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md overflow-hidden">
                                                                    {req.createdBy.image ? (
                                                                        <img src={req.createdBy.image} alt={req.createdBy.name} className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        req.createdBy.name.charAt(0)
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900">{req.createdBy.name}</p>
                                                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{req.department.code}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Calendar className="w-4 h-4" />
                                                                <span className="text-[11px] font-black">{new Date(req.createdAt).toDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="flex items-center justify-center gap-4 px-10 py-5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest rounded-3xl hover:bg-green-600 hover:shadow-2xl hover:shadow-green-500/20 transition-all xl:shrink-0 w-full xl:w-auto overflow-hidden group/btn relative"
                                                >
                                                    <span className="relative z-10 flex items-center gap-3">
                                                        Review Pulse
                                                        <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                                                    </span>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-24 flex flex-col items-center justify-center text-center">
                                        <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 mb-8">
                                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">System Optimized</h4>
                                        <p className="text-sm text-slate-500 mt-3 font-bold">The executive flow is completely clear. No action needed.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-purple-50/30 text-center border-t border-purple-50">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-[11px] font-black text-green-700 hover:text-green-900 uppercase tracking-[0.25em] inline-flex items-center gap-3 px-8 py-3 rounded-2xl hover:bg-white transition-all shadow-sm"
                                >
                                    {showHistory ? "Mask Historical Data" : "Reveal Neural Audit Log"}
                                    <ChevronRight className={cn("h-5 w-5 transition-transform duration-500", showHistory && "rotate-90")} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Action Stack */}
                    <div className="space-y-10">
                        <div className="bg-white/70 backdrop-blur-2xl p-10 rounded-[56px] shadow-[0_25px_60px_rgba(0,0,0,0.04)] border border-white sticky top-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-rose-50 rounded-2xl">
                                    <Activity className="w-6 h-6 text-rose-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Deep Actions</h3>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: "Matrix Sectors", desc: "Oversee academic units", icon: Building2, colors: "from-[#dad7cd]/20 to-[#a3b18a]/10", text: "text-[#344e41]", href: "/departments", action: null },
                                    { label: "Inject Component", desc: "Global inventory sync", icon: Plus, colors: "from-[#a3b18a]/20 to-[#588157]/10", text: "text-[#3a5a40]", href: "#", action: () => setIsAddInventoryOpen(true) },
                                    { label: "Sync Reports", desc: "System integrity status", icon: TrendingUp, colors: "from-[#588157]/20 to-[#3a5a40]/10", text: "text-[#344e41]", href: "/notifications", action: null },
                                    { label: "Quantum Logic", desc: "Platform master config", icon: GraduationCap, colors: "from-[#3a5a40]/20 to-[#344e41]/10", text: "text-[#588157]", href: "/settings", action: null },
                                ].map((action, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ x: 10 }}
                                        onClick={() => action.action ? action.action() : router.push(action.href)}
                                        className="w-full flex items-center justify-between p-6 bg-white border border-slate-50 rounded-[32px] hover:shadow-xl hover:shadow-green-500/5 group transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(`p-4 rounded-[22px] bg-gradient-to-br ${action.colors} transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-sm border border-white`)}>
                                                <action.icon className={cn(`h-6 w-6 ${action.text}`)} />
                                            </div>
                                            <div className="text-left">
                                                <span className="block font-black text-slate-800 text-base group-hover:text-green-700 transition-colors tracking-tight">{action.label}</span>
                                                <span className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{action.desc}</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shadow-inner">
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] text-white relative overflow-hidden group">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute -right-16 -top-16 w-48 h-48 bg-green-500/20 rounded-full blur-[60px]"
                                />
                                <Shield className="w-10 h-10 text-green-400 mb-6 relative z-10 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-xl mb-3 relative z-10 tracking-tight">Executive Shield</h4>
                                <p className="text-sm text-slate-400 leading-relaxed font-bold relative z-10 opacity-80 uppercase tracking-wider text-[11px]">
                                    Master authentication active. Your actions are signed and secured within the institutional blockchain.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Intelligent Approval Modal */}
                <Modal
                    isOpen={!!selectedRequest}
                    onClose={() => {
                        setSelectedRequest(null);
                        setRemarks("");
                        setAssignedAdminId("");
                    }}
                    title=""
                >
                    <div className="bg-white/95 backdrop-blur-3xl rounded-[48px] overflow-hidden border border-white shadow-2xl">
                        <div className="bg-gradient-to-br from-[#344e41] to-[#3a5a40] p-10 text-white relative">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute top-0 right-0 w-64 h-64 bg-[#588157]/20 rounded-full blur-[60px] -mr-20 -mt-20"
                            />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                                        <Shield className="h-6 w-6 text-[#dad7cd]" />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#a3b18a]">Executive Clearance Required</h3>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight mb-2">{selectedRequest?.title}</h2>
                                <p className="text-[#dad7cd] text-sm font-bold uppercase tracking-widest">{selectedRequest?.requestNumber}</p>
                            </div>
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Decision Remarks / Observations</label>
                                <textarea
                                    rows={3}
                                    placeholder="Provide detailed context for the action log..."
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[32px] text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-green-500/10 focus:border-green-300 transition-all resize-none shadow-inner"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Processing Unit (Admin)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {admins.map((admin) => (
                                        <button
                                            key={admin.id}
                                            onClick={() => setAssignedAdminId(admin.id)}
                                            className={cn(
                                                "flex items-center gap-4 p-5 rounded-[28px] border-2 transition-all duration-300 group text-left",
                                                assignedAdminId === admin.id
                                                    ? "bg-green-50 border-green-200 shadow-md shadow-green-500/5"
                                                    : "bg-white border-slate-50 hover:border-green-100"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-base transition-transform group-hover:rotate-6",
                                                assignedAdminId === admin.id
                                                    ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                                                    : "bg-slate-100 text-slate-400"
                                            )}>
                                                {admin.name.charAt(0)}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className={cn("font-black text-sm tracking-tight truncate", assignedAdminId === admin.id ? "text-green-600" : "text-slate-800")}>{admin.name}</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">{admin.email}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    onClick={() => handleAction("DECLINED")}
                                    disabled={processingRequest}
                                    className="flex-1 py-5 bg-white border border-slate-100 text-slate-400 font-black text-[11px] uppercase tracking-widest rounded-[28px] hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    <XCircle className="w-5 h-5" /> REJECT
                                </button>
                                <button
                                    onClick={() => handleAction("APPROVED")}
                                    disabled={processingRequest || !assignedAdminId}
                                    className="flex-[2] py-5 bg-gradient-to-r from-[#344e41] to-[#3a5a40] text-white font-black text-[11px] uppercase tracking-widest rounded-[28px] hover:shadow-2xl hover:shadow-[#344e41]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                >
                                    {processingRequest ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    EXECUTE CLEARANCE
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* Add Inventory Item Modal */}
                <Modal
                    isOpen={isAddInventoryOpen}
                    onClose={() => setIsAddInventoryOpen(false)}
                    title=""
                >
                    <div className="bg-white/95 backdrop-blur-3xl rounded-[48px] overflow-hidden border border-white shadow-2xl">
                        <div className="bg-gradient-to-br from-[#3a5a40] to-[#588157] p-10 text-white relative">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 7, repeat: Infinity }}
                                className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -ml-20 -mb-20"
                            />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/20 rounded-2xl border border-white/30">
                                        <Package className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#dad7cd]">Inventory Genesis</h3>
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">Material Injection</h2>
                            </div>
                        </div>

                        <form onSubmit={handleAddInventory} className="p-10 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Component Identifier</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Quantum Processor X1"
                                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] text-lg font-black placeholder:text-slate-300 focus:ring-4 focus:ring-green-500/10 focus:border-green-300 transition-all shadow-inner"
                                    value={newInventoryItem.name}
                                    onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Units</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[28px] text-lg font-black focus:ring-4 focus:ring-green-500/10 focus:border-green-300 transition-all shadow-inner"
                                        value={newInventoryItem.quantity}
                                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Peripheral"
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[28px] text-lg font-black placeholder:text-slate-300 focus:ring-4 focus:ring-green-500/10 focus:border-green-300 transition-all shadow-inner"
                                        value={newInventoryItem.category}
                                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processingRequest}
                                className="w-full py-6 bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-[32px] hover:shadow-2xl hover:shadow-green-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 overflow-hidden relative group"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {processingRequest ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    INITIALIZE COMPONENT
                                </span>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </form>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
