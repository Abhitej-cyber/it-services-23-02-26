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
    Trash2
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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-10 bg-[#f8fafc] min-h-screen">
            {/* Header with Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight tracking-tighter uppercase italic">
                        Asset <span className="text-green-500">Intelligence</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Connected to Inventory Spreadsheet • v1.0.4</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="bg-green-50 p-3 rounded-xl">
                        <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="pr-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Date</p>
                        <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            {/* High-Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        label: "Total Systems",
                        value: stats?.totalSystems || 0,
                        change: "Live Sync",
                        icon: Monitor,
                        color: "text-blue-600",
                        bg: "bg-blue-50",
                        subtext: stats?.lastSync ? `Updated ${new Date(stats.lastSync).toLocaleTimeString()}` : "Fetching..."
                    },
                    { label: "Ready for Use", value: stats?.readyForUse || 0, change: "Active", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Service", value: stats?.service || 0, change: "Under Maintenance", icon: Wrench, color: "text-orange-500", bg: "bg-orange-50" },
                    { label: "Priority Tasks", value: stats?.priorityTasks || 0, change: "Urgent Attention", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
                ].map((kpi, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            if (kpi.label === "Priority Tasks") {
                                document.getElementById('institutional-queue')?.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className={cn(
                            "bg-[#f6f9fc] p-6 rounded-3xl border border-slate-100/60 shadow-sm relative group overflow-hidden transition-all",
                            kpi.label === "Priority Tasks" && "cursor-pointer hover:shadow-xl hover:shadow-red-50 hover:border-red-100"
                        )}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} -mr-8 -mt-8 rounded-full opacity-50 group-hover:scale-110 transition-transform`} />
                        <div className="relative z-10 flex flex-col gap-5">
                            <kpi.icon className={`h-6 w-6 ${kpi.color}`} />

                            <div>
                                <p className="text-slate-500 text-sm font-bold">{kpi.label}</p>
                                <div className="flex items-center gap-3 mt-1 text-slate-900">
                                    <h3 className="text-[32px] leading-none font-black">{kpi.value}</h3>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md text-slate-500 bg-white shadow-sm self-end mb-1">{kpi.change}</span>
                                </div>
                                {'subtext' in kpi && <p className="text-[8px] text-slate-400 mt-3 font-black uppercase tracking-widest">{kpi.subtext}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    {/* Analytics Section */}
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Departmental Infrastructure</h3>
                                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">System Distribution Analytics</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 bg-green-500 rounded-full" />
                                <span className="text-[10px] font-black text-slate-400 uppercase">Core Computing</span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={distribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="code"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                                        {distribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={['#16a34a', '#10b981', '#059669', '#34d399', '#064e3b'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Request Approvals */}
                    <div id="institutional-queue" className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden scroll-mt-6">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic">Institutional <span className="text-green-600">Queue</span></h2>
                                <div className="flex items-center gap-6 mt-4">
                                    <button
                                        onClick={() => setActiveTab("SERVICE")}
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative",
                                            activeTab === "SERVICE" ? "text-green-600" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Operational Requests
                                        {activeTab === "SERVICE" && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-full" />}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("ACCOUNT")}
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative",
                                            activeTab === "ACCOUNT" ? "text-green-600" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Account Approvals
                                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[8px]">
                                            {requests.filter(r => r.type === "ACCOUNT_APPROVAL" && r.status === "PENDING").length}
                                        </span>
                                        {activeTab === "ACCOUNT" && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-full" />}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("HOD_DIRECTORY")}
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative",
                                            activeTab === "HOD_DIRECTORY" ? "text-green-600" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        HOD Directory
                                        <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px]">
                                            {hods.length}
                                        </span>
                                        {activeTab === "HOD_DIRECTORY" && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-full" />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative hidden md:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search asset location..."
                                        className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs w-64 focus:ring-2 focus:ring-green-500 font-bold"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>
                        </div>

                        {searchResults.length > 0 && searchQuery && (
                            <div className="p-8 bg-green-50/50 border-b border-green-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-black uppercase text-green-600 tracking-widest">Global Asset Locator</h3>
                                    <button onClick={() => setSearchResults([])} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase">Clear</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {searchResults.map(asset => (
                                        <div key={asset.id} className="p-5 bg-white rounded-3xl border border-green-100 flex items-center justify-between group hover:border-green-300 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-green-50 rounded-2xl group-hover:scale-110 transition-transform">
                                                    <Monitor className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 tracking-tight">{asset.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{asset.assetNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-900 uppercase">{asset.lab?.name || "Global"}</p>
                                                <p className="text-[9px] text-green-500 font-black uppercase tracking-wider">{asset.department.code} • {asset.lab?.code || 'UNALLOCATED'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="divide-y divide-slate-50">
                            {activeTab === "HOD_DIRECTORY" ? (
                                hods.length > 0 ? (
                                    hods.map((hod, index) => (
                                        <div key={hod.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-5">
                                                    <div className="text-[10px] font-black text-slate-300 w-4">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </div>
                                                    <div className="h-14 w-14 bg-green-50 rounded-2xl flex items-center justify-center font-black text-green-600 text-xl border border-green-100">
                                                        {hod.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-green-600 transition-colors uppercase tracking-tight">{hod.name}</h4>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                                            {hod.department?.name || 'Departmental Lead'} • {hod.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteUser(hod.id)}
                                                    className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                    title="Delete HOD Account"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-24 text-center">
                                        <div className="inline-flex p-8 bg-slate-50 rounded-[32px] mb-6 shadow-inner">
                                            <Shield className="h-12 w-12 text-slate-300" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Empty Directory</h4>
                                        <p className="text-slate-500 mt-2 font-medium">No HOD accounts found in the system.</p>
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
                                    <div key={req.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-start gap-5">
                                                <div className="text-[10px] font-black text-slate-300 w-4 mt-4">
                                                    {String(index + 1).padStart(2, '0')}
                                                </div>
                                                <div className="mt-1 p-3 bg-slate-100 rounded-2xl text-slate-600 font-black text-xs uppercase shadow-sm">
                                                    {req.requestNumber.split('-')[2]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{req.type.replace('_', ' ')}</span>
                                                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", req.priority === "HIGH" ? "text-red-500" : "text-green-500")}>
                                                            {req.priority} PRIORITY
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-green-600 transition-colors uppercase tracking-tight">{req.title}</h4>
                                                    <p className="text-slate-500 text-sm mt-1 font-medium line-clamp-1">{req.description}</p>
                                                    <div className="flex items-center gap-4 mt-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-7 w-7 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-[10px] text-slate-500">
                                                                {req.createdBy.name.charAt(0)}
                                                            </div>
                                                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{req.createdBy.name} • {req.department.code}</span>
                                                        </div>
                                                        <span className="text-slate-300">|</span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(req.createdAt).toDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-700 hover:shadow-xl hover:shadow-green-200 transition-all"
                                            >
                                                Review & Act
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-24 text-center">
                                    <div className="inline-flex p-8 bg-green-50 rounded-[32px] mb-6 shadow-inner">
                                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Queue Cleared</h4>
                                    <p className="text-slate-500 mt-2 font-medium">All pending requests have been processed.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-50/50 text-center border-t border-slate-100">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="text-xs font-black text-green-600 hover:text-green-700 uppercase tracking-[0.2em] inline-flex items-center gap-3"
                            >
                                {showHistory ? "Hide Processed Log" : "Audit Full history"}
                                <ChevronRight className={cn("h-4 w-4 transition-transform", showHistory && "rotate-90")} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Action Stack */}
                <div className="space-y-10">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">Executive Actions</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Manage Departments", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", href: "/departments" },
                                { label: "Allocate New Lab", icon: Shield, color: "text-green-600", bg: "bg-green-50", href: "/labs" },
                                { label: "Audit Reports", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", href: "/notifications" },
                                { label: "Settings", icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-50", href: "/settings" },
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.push(action.href)}
                                    className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:border-green-200 hover:bg-green-50/20 group transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${action.bg} transition-transform group-hover:rotate-12`}>
                                            <action.icon className={`h-6 w-6 ${action.color}`} />
                                        </div>
                                        <span className="font-black text-slate-700 group-hover:text-green-700 transition-colors uppercase text-[11px] tracking-widest">{action.label}</span>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Approval Decision Modal */}
            <Modal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title="Executive Resource Decision"
                className="max-w-2xl"
            >
                {selectedRequest && (
                    <div className="space-y-8">
                        <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-black text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase tracking-widest">{selectedRequest.type.replace('_', ' ')}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{selectedRequest.requestNumber}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 tracking-tight uppercase italic">{selectedRequest.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedRequest.description}</p>

                            <div className="mt-8 pt-8 border-t border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100 shadow-sm">
                                        {selectedRequest.department.code}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">HOD {selectedRequest.createdBy.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedRequest.department.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Decision Remarks & Instructions</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter reasoning for this decision. These instructions will be logged and sent to the HOD..."
                                    className="w-full p-8 bg-slate-50 rounded-[32px] border-none focus:ring-2 focus:ring-green-500 font-bold text-slate-700 shadow-inner"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Allocate IT Administrator</label>
                                <select
                                    className="w-full p-6 bg-slate-50 rounded-[24px] border-none focus:ring-2 focus:ring-green-500 font-black text-xs text-slate-700 shadow-inner uppercase tracking-widest"
                                    value={assignedAdminId}
                                    onChange={(e) => setAssignedAdminId(e.target.value)}
                                >
                                    <option value="">Select Admin for Implementation</option>
                                    {admins.map((admin: any) => (
                                        <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-4">
                                {selectedRequest.type === "ACCOUNT_APPROVAL" && (
                                    <button
                                        onClick={() => handleDeleteUser(selectedRequest.createdById)}
                                        className="flex items-center justify-center gap-3 py-6 bg-white border-2 border-red-100 text-red-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-[32px] hover:bg-red-50 transition-all col-span-2"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                        DELETE APPLIED ACCOUNT PERMANENTLY
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction("DECLINED")}
                                    disabled={processingRequest}
                                    className="flex items-center justify-center gap-3 py-6 bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] rounded-[32px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                >
                                    {processingRequest ? <Loader2 className="h-5 w-5 animate-spin" /> : <XCircle className="h-5 w-5" />}
                                    DECLINE RESOLUTION
                                </button>
                                <button
                                    onClick={() => handleAction("APPROVED")}
                                    disabled={processingRequest}
                                    className="flex items-center justify-center gap-3 py-6 bg-green-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[32px] hover:bg-green-700 shadow-2xl shadow-green-200 transition-all"
                                >
                                    {processingRequest ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                    OFFICIALLY APPROVE
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
