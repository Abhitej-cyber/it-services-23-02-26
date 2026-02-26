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
    Users
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

    const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
    const distribution = Array.isArray(distributionRaw) ? distributionRaw : [];
    const admins = Array.isArray(adminsRaw) ? adminsRaw : [];
    const hods = Array.isArray(hodsRaw) ? hodsRaw : [];

    const loading = loadingStats;

    const [showHistory, setShowHistory] = useState(false);

    // Search & Modals
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [processingRequest, setProcessingRequest] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [assignedAdminId, setAssignedAdminId] = useState("");
    const [activeTab, setActiveTab] = useState<"SERVICE" | "ACCOUNT" | "HOD_DIRECTORY">("SERVICE");

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
                    remarks: remarks || `Processed by Dean`,
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
            <div className="flex h-[80vh] items-center justify-center bg-slate-50/50">
                <div className="relative">
                    <div className="h-16 w-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                    <div className="h-16 w-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-10 selection:bg-blue-500/30 overflow-hidden text-slate-900 font-sans">
            {/* Ambient Animated Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-[8000ms]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 space-y-10 max-w-[1600px] mx-auto">
                {/* Header with Glassmorphism */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 backdrop-blur-sm">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 mb-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Executive Overview</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Live Inventory Sync • Master Control</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-inner hidden sm:block">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="pr-2 sm:pr-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Today's Date</p>
                            <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* KPI Cards - Breathtaking Gradients & Shadows */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            label: "Total Systems",
                            value: stats?.totalSystems || 0,
                            change: "Live Tracking",
                            icon: Monitor,
                            colors: "from-blue-600 hover:from-blue-500 to-indigo-700 hover:to-indigo-600",
                            shadow: "shadow-blue-500/20",
                            text: "text-white",
                            subtext: stats?.lastSync ? `Updated ${new Date(stats.lastSync).toLocaleTimeString()}` : "Fetching..."
                        },
                        {
                            label: "Ready for Use",
                            value: stats?.readyForUse || 0,
                            change: "Active status",
                            icon: CheckCircle2,
                            colors: "from-emerald-500 hover:from-emerald-400 to-teal-600 hover:to-teal-500",
                            shadow: "shadow-emerald-500/20",
                            text: "text-white"
                        },
                        {
                            label: "Service Pipeline",
                            value: stats?.service || 0,
                            change: "Maintenance",
                            icon: Wrench,
                            colors: "from-white to-slate-50 border border-slate-200/60 hover:border-slate-300",
                            shadow: "shadow-slate-200/40",
                            text: "text-slate-900",
                            iconColor: "text-orange-500",
                            bgOverlay: "bg-orange-50"
                        },
                        {
                            label: "Priority Actions",
                            value: stats?.priorityTasks || 0,
                            change: "Require attention",
                            icon: Flame,
                            colors: stats?.priorityTasks > 0 ? "from-red-500 hover:from-red-400 to-rose-600 hover:to-rose-500" : "from-white to-slate-50 border border-slate-200/60 hover:border-slate-300",
                            shadow: stats?.priorityTasks > 0 ? "shadow-red-500/20" : "shadow-slate-200/40",
                            text: stats?.priorityTasks > 0 ? "text-white" : "text-slate-900",
                            iconColor: stats?.priorityTasks > 0 ? "text-white" : "text-slate-400",
                            bgOverlay: stats?.priorityTasks > 0 ? "bg-white/10" : "bg-slate-100"
                        },
                    ].map((kpi, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                if (kpi.label === "Priority Actions") {
                                    document.getElementById('institutional-queue')?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className={cn(
                                `bg-gradient-to-br ${kpi.colors} p-8 rounded-[32px] shadow-xl ${kpi.shadow} relative group overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-pointer`
                            )}
                        >
                            {/* Abstract decorative shapes inside cards */}
                            <div className={cn(
                                "absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700 blur-2xl",
                                kpi.bgOverlay || "bg-white"
                            )} />
                            <div className={cn(
                                "absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-xl",
                                kpi.bgOverlay || "bg-white"
                            )} />

                            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                <div className="flex items-start justify-between">
                                    <div className={cn(
                                        "p-3 rounded-2xl backdrop-blur-md",
                                        kpi.text === "text-white" ? "bg-white/20 shadow-inner" : "bg-white shadow-sm border border-slate-100"
                                    )}>
                                        <kpi.icon className={cn("h-6 w-6 relative z-10", kpi.iconColor || "text-white")} />
                                    </div>
                                    <ArrowRight className={cn(
                                        "h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300",
                                        kpi.text === "text-white" ? "text-white/70" : "text-slate-400"
                                    )} />
                                </div>

                                <div>
                                    <p className={cn(
                                        "text-xs font-black uppercase tracking-widest mb-1 opacity-80",
                                        kpi.text
                                    )}>{kpi.label}</p>
                                    <div className="flex items-baseline gap-3 mt-1">
                                        <h3 className={cn("text-[40px] leading-none font-black tracking-tighter", kpi.text)}>{kpi.value}</h3>
                                        <span className={cn(
                                            "text-[9px] font-bold px-2 py-1 rounded-lg shadow-sm whitespace-nowrap uppercase tracking-widest",
                                            kpi.text === "text-white" ? "bg-white/20 text-white backdrop-blur-md" : "bg-slate-100 text-slate-500"
                                        )}>{kpi.change}</span>
                                    </div>
                                    {'subtext' in kpi && (
                                        <p className={cn("text-[9px] font-bold uppercase tracking-[0.2em] mt-4 opacity-60", kpi.text)}>{kpi.subtext}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <div className="xl:col-span-2 space-y-10">
                        {/* Elegant Analytics Chart Section */}
                        <div className="bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity -z-10 -mr-20 -mt-20"></div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Cpu className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">Infrastructure Map</h3>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Distribution Density</h2>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Analysis</span>
                                </div>
                            </div>

                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={1} />
                                                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                        <XAxis
                                            dataKey="code"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc', opacity: 0.6 }}
                                            contentStyle={{
                                                borderRadius: '20px',
                                                border: '1px solid #f1f5f9',
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                padding: '12px 20px',
                                                fontWeight: 'bold',
                                                fontSize: '12px'
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={48}>
                                            {distribution.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill="url(#colorCount)" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Request Approvals - Glass Tabs & Advanced List */}
                        <div id="institutional-queue" className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 overflow-hidden scroll-mt-6">
                            <div className="p-8 lg:p-10 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gradient-to-br from-white to-slate-50/50">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-100 rounded-xl">
                                            <Zap className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Command Center Queue</h2>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
                                        <button
                                            onClick={() => setActiveTab("SERVICE")}
                                            className={cn(
                                                "text-xs font-bold px-6 py-2.5 rounded-xl transition-all duration-300",
                                                activeTab === "SERVICE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                            )}
                                        >
                                            Operational Requests
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("ACCOUNT")}
                                            className={cn(
                                                "text-xs font-bold px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2",
                                                activeTab === "ACCOUNT" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                            )}
                                        >
                                            Account Approvals
                                            {requests.filter(r => r.type === "ACCOUNT_APPROVAL" && r.status === "PENDING").length > 0 && (
                                                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-black">
                                                    {requests.filter(r => r.type === "ACCOUNT_APPROVAL" && r.status === "PENDING").length}
                                                </span>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("HOD_DIRECTORY")}
                                            className={cn(
                                                "text-xs font-bold px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2",
                                                activeTab === "HOD_DIRECTORY" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                            )}
                                        >
                                            HOD Directory
                                            <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 rounded-md text-[10px] font-black">
                                                {hods.length}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 lg:w-72">
                                    <div className="relative w-full group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Search global assets..."
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold shadow-sm transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Global Search Results Dropdown */}
                            {searchResults.length > 0 && searchQuery && (
                                <div className="p-8 bg-blue-50/80 border-b border-blue-100 backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-blue-600" />
                                            <h3 className="text-xs font-black uppercase text-blue-600 tracking-[0.2em]">Global Asset Locator</h3>
                                        </div>
                                        <button onClick={() => setSearchResults([])} className="text-[10px] font-black text-slate-400 hover:text-slate-700 uppercase px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm transition-all">Clear Results</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {searchResults.map(asset => (
                                            <div key={asset.id} className="p-5 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                        <Monitor className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{asset.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{asset.assetNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest rounded-md mb-1">{asset.lab?.name || "Global Unassigned"}</span>
                                                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">{asset.department.code}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="divide-y divide-slate-100 bg-white">
                                {activeTab === "HOD_DIRECTORY" ? (
                                    hods.length > 0 ? (
                                        hods.map((hod, index) => (
                                            <div key={hod.id} className="p-8 hover:bg-slate-50/80 transition-all duration-300 group">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-xs font-black text-slate-300 w-6 tabular-nums">
                                                            {String(index + 1).padStart(2, '0')}
                                                        </div>
                                                        <div className="h-14 w-14 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 text-xl border border-blue-100/50 shadow-inner group-hover:scale-105 transition-transform">
                                                            {hod.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{hod.name}</h4>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                                                                    {hod.department?.name || 'Departmental Lead'}
                                                                </span>
                                                                <span className="text-slate-400 text-[10px] font-semibold">{hod.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteUser(hod.id)}
                                                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all self-end sm:self-auto"
                                                        title="Revoke HOD Access"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-24 flex flex-col items-center justify-center text-center">
                                            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 mb-6">
                                                <Users className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-900 tracking-tight">Empty Directory</h4>
                                            <p className="text-sm text-slate-500 mt-2 font-medium max-w-sm">No HOD accounts are currently registered in the institutional system.</p>
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
                                        <div key={req.id} className="p-8 hover:bg-slate-50/80 transition-all group relative overflow-hidden">
                                            {/* Status indicator line */}
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                                req.priority === "HIGH" ? "bg-red-500" : "bg-blue-500"
                                            )} />

                                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pl-2">
                                                <div className="flex items-start gap-6">
                                                    <div className="mt-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600 font-black text-[10px] uppercase tracking-widest whitespace-nowrap">
                                                        #{req.requestNumber.split('-')[2]}
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                                                                activeTab === "ACCOUNT" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                                                            )}>
                                                                {req.type.replace('_', ' ')}
                                                            </span>
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                                                                req.priority === "HIGH" ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                                                            )}>
                                                                {req.priority === "HIGH" && <Flame className="w-3 h-3" />}
                                                                {req.priority} PRIORITY
                                                            </span>
                                                        </div>
                                                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{req.title}</h4>
                                                        <p className="text-slate-500 text-sm mt-2 font-medium line-clamp-2 max-w-2xl leading-relaxed">{req.description}</p>

                                                        <div className="flex flex-wrap items-center gap-4 mt-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-600">
                                                                    {req.createdBy.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-900">{req.createdBy.name}</p>
                                                                    <p className="text-[10px] font-semibold text-slate-500">{req.department.code}</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                                                            <div className="flex items-center gap-2 text-slate-400">
                                                                <Calendar className="w-4 h-4" />
                                                                <span className="text-[11px] font-semibold">{new Date(req.createdAt).toDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all xl:shrink-0 w-full xl:w-auto overflow-hidden group/btn relative"
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        Review & Setup
                                                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-24 flex flex-col items-center justify-center text-center">
                                        <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 mb-6">
                                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                                        </div>
                                        <h4 className="text-xl font-bold text-slate-900 tracking-tight">Queue Optimized</h4>
                                        <p className="text-sm text-slate-500 mt-2 font-medium">All executive-level tasks and requests have been processed.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-[11px] font-black text-slate-500 hover:text-blue-600 uppercase tracking-widest inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    {showHistory ? "Hide Processed Log" : "Audit Full History"}
                                    <ChevronRight className={cn("h-4 w-4 transition-transform", showHistory && "rotate-90")} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Action Stack */}
                    <div className="space-y-8">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 sticky top-10">
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Executive Actions</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Manage Departments", desc: "Oversee academic sectors", icon: Building2, color: "text-blue-600", bg: "bg-blue-50 border-blue-100", href: "/departments" },
                                    { label: "Allocate New Lab", desc: "Provision infrastructure", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100", href: "/labs" },
                                    { label: "Audit Reports", desc: "System compliance", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", href: "/notifications" },
                                    { label: "System Preferences", desc: "Platform settings", icon: GraduationCap, color: "text-slate-600", bg: "bg-slate-100 border-slate-200", href: "/settings" },
                                ].map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => router.push(action.href)}
                                        className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 group transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl border ${action.bg} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                                <action.icon className={`h-5 w-5 ${action.color}`} />
                                            </div>
                                            <div className="text-left">
                                                <span className="block font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm">{action.label}</span>
                                                <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">{action.desc}</span>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] text-white relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                                <Shield className="w-8 h-8 text-blue-400 mb-4 relative z-10" />
                                <h4 className="font-bold text-lg mb-2 relative z-10">Admin Control</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium relative z-10">
                                    You have full elevated privileges across the institutional infrastructure. All actions are securely logged.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Intelligent Approval Modal */}
                <Modal
                    isOpen={!!selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    title="Executive Authorization required"
                    className="max-w-2xl"
                >
                    {selectedRequest && (
                        <div className="space-y-8">
                            <div className="p-8 bg-slate-50/50 rounded-[32px] border border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1.5 rounded-md uppercase tracking-widest">{selectedRequest.type.replace('_', ' ')}</span>
                                    <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-md uppercase tracking-widest">#{selectedRequest.requestNumber}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">{selectedRequest.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium bg-white p-5 rounded-2xl border border-slate-100">{selectedRequest.description}</p>

                                <div className="mt-6 flex items-center gap-4">
                                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-200 shadow-sm">
                                        {selectedRequest.department.code}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 uppercase">HOD Request: {selectedRequest.createdBy.name}</p>
                                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{selectedRequest.department.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Decision Remarks Array</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Enter official reasoning. Will be transmitted to HOD..."
                                        className="w-full p-5 bg-white rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium text-sm text-slate-900 shadow-sm transition-all resize-none"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assign IT Administrator</label>
                                    <div className="relative">
                                        <select
                                            className="w-full pl-5 pr-12 py-4 bg-white rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-xs text-slate-900 shadow-sm transition-all appearance-none"
                                            value={assignedAdminId}
                                            onChange={(e) => setAssignedAdminId(e.target.value)}
                                        >
                                            <option value="">Select admin responsible for implementation...</option>
                                            {admins.map((admin: any) => (
                                                <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    {selectedRequest.type === "ACCOUNT_APPROVAL" && (
                                        <button
                                            onClick={() => handleDeleteUser(selectedRequest.createdById)}
                                            className="col-span-2 flex items-center justify-center gap-2 py-4 bg-white border border-red-200 text-red-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:border-red-300 transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            PURGE APPLIED ACCOUNT
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleAction("DECLINED")}
                                        disabled={processingRequest}
                                        className="flex items-center justify-center gap-2 py-4 bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                                    >
                                        {processingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                        DECLINE
                                    </button>
                                    <button
                                        onClick={() => handleAction("APPROVED")}
                                        disabled={processingRequest}
                                        className="flex items-center justify-center gap-2 py-4 bg-blue-600 border border-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                    >
                                        {processingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        AUTHORIZE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}
