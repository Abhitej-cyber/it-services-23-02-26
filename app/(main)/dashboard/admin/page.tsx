"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Shield,
    Server,
    Network,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    ChevronRight,
    Loader2,
    Calendar,
    Activity,
    Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
    const router = useRouter();


    const { data: stats, isLoading: loadingStats } = useSWR("/api/stats", fetcher, { revalidateOnFocus: false });
    const { data: ticketsRaw, mutate: mutateTickets } = useSWR("/api/tickets", fetcher);
    const { data: requestsRaw, mutate: mutateRequests } = useSWR("/api/requests", fetcher);

    const tickets = Array.isArray(ticketsRaw) ? ticketsRaw : [];
    const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
    const loading = loadingStats;

    const [search, setSearch] = useState("");
    const [activeQueue, setActiveQueue] = useState<"TICKETS" | "REQUESTS">("TICKETS");
    const [filterPriority, setFilterPriority] = useState<string>("ALL");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [processingRequest, setProcessingRequest] = useState(false);
    const [requestRemarks, setRequestRemarks] = useState("");
    const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);

    // Lab Creation Extra Fields (for LAB_SETUP type)
    const [labCode, setLabCode] = useState("");
    const [labCapacity, setLabCapacity] = useState("");
    const [labLocation, setLabLocation] = useState("");

    const handleProcessRequest = async (status: string) => {
        if (!selectedRequest) return;
        setProcessingRequest(true);
        try {
            const res = await fetch(`/api/requests/${selectedRequest.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    remarks: requestRemarks || `Processed by System Admin`,
                    labCode,
                    labCapacity,
                    labLocation
                })
            });

            if (res.ok) {
                await mutateRequests();
                setIsProcessingModalOpen(false);
                setSelectedRequest(null);
                setRequestRemarks("");
                setLabCode("");
                setLabCapacity("");
                setLabLocation("");
            }
        } catch (error) {
            console.error("Failed to update request:", error);
        } finally {
            setProcessingRequest(false);
        }
    };

    const getUnifiedStatus = (status: string) => {
        if (status === "SUBMITTED" || status === "PENDING") return "PENDING";
        if (status === "PROCESSING" || status === "QUEUED" || status === "ASSIGNED" || status === "IN_PROGRESS") return "IN_PROCESS";
        if (status === "RESOLVED" || status === "DEPLOYED" || status === "COMPLETED") return "RESOLVED";
        if (status === "CLOSED" || status === "DECLINED") return "CLOSED";
        return status;
    };

    const filteredTickets = tickets
        .filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.ticketNumber.toLowerCase().includes(search.toLowerCase());
            const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
            return matchesSearch && matchesPriority;
        })
        .sort((a, b) => {
            const statusOrder: Record<string, number> = {
                "SUBMITTED": 0, "PENDING": 0, "APPROVED": 0,
                "PROCESSING": 1, "QUEUED": 1, "ASSIGNED": 1, "IN_PROGRESS": 1,
                "RESOLVED": 2, "DEPLOYED": 2, "COMPLETED": 2,
                "CLOSED": 3, "DECLINED": 3
            };

            const statusA = getUnifiedStatus(a.status);
            const statusB = getUnifiedStatus(b.status);

            const orderA = statusOrder[statusA] ?? 4;
            const orderB = statusOrder[statusB] ?? 4;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const filteredRequests = requests
        .filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                r.requestNumber.toLowerCase().includes(search.toLowerCase());
            const matchesPriority = filterPriority === "ALL" || r.priority === filterPriority;
            return matchesSearch && matchesPriority;
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());


    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-8 selection:bg-blue-500/30 overflow-hidden text-slate-900">
            {/* Ambient Animated Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] mix-blend-multiply animate-pulse duration-[8000ms]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[100px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 space-y-8 max-w-[1600px] mx-auto">
                {/* Premium Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 backdrop-blur-sm">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 mb-1">
                            <Activity className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Admin Control Center</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                            Operation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Mastery</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">System Oversight • Infrastructure Sync</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-semibold shadow-sm transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-inner">
                                <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div className="pr-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Today</p>
                                <p className="text-xs font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards - Dean Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            label: "Total Systems",
                            value: stats?.totalSystems || 0,
                            change: "Inventory",
                            icon: Shield,
                            colors: "from-blue-600 hover:from-blue-500 to-indigo-700 hover:to-indigo-600",
                            shadow: "shadow-blue-500/20",
                            text: "text-white"
                        },
                        {
                            label: "Pending Tasks",
                            value: stats?.pendingTickets || 0,
                            change: "Awaiting",
                            icon: Clock,
                            colors: "from-white to-slate-50 border border-slate-200/60 hover:border-slate-300",
                            shadow: "shadow-slate-200/40",
                            text: "text-slate-900",
                            iconColor: "text-orange-500",
                            bgOverlay: "bg-orange-50"
                        },
                        {
                            label: "In Process",
                            value: stats?.inProgressTickets || 0,
                            change: "Active",
                            icon: AlertCircle,
                            colors: stats?.inProgressTickets > 0 ? "from-red-500 hover:from-red-400 to-rose-600 hover:to-rose-500" : "from-white to-slate-50 border border-slate-200/60 hover:border-slate-300",
                            shadow: stats?.inProgressTickets > 0 ? "shadow-red-500/20" : "shadow-slate-200/40",
                            text: stats?.inProgressTickets > 0 ? "text-white" : "text-slate-900",
                            iconColor: stats?.inProgressTickets > 0 ? "text-white" : "text-red-500",
                            bgOverlay: stats?.inProgressTickets > 0 ? "bg-white/10" : "bg-red-50"
                        },
                        {
                            label: "Resolved Today",
                            value: stats?.completedToday || 0,
                            change: "Ready",
                            icon: CheckCircle2,
                            colors: "from-emerald-500 hover:from-emerald-400 to-teal-600 hover:to-teal-500",
                            shadow: "shadow-emerald-500/20",
                            text: "text-white"
                        },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className={cn(
                                `bg-gradient-to-br ${stat.colors} p-6 rounded-3xl shadow-xl ${stat.shadow} relative group overflow-hidden transition-all duration-500 hover:-translate-y-1 cursor-pointer`
                            )}
                        >
                            <div className={cn(
                                "absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700 blur-2xl",
                                stat.bgOverlay || "bg-white"
                            )} />
                            <div className={cn(
                                "absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-10 blur-xl",
                                stat.bgOverlay || "bg-white"
                            )} />

                            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                <div className="flex items-start justify-between">
                                    <div className={cn(
                                        "p-2.5 rounded-xl backdrop-blur-md",
                                        stat.text === "text-white" ? "bg-white/20 shadow-inner" : "bg-white shadow-sm border border-slate-100"
                                    )}>
                                        <stat.icon className={cn("h-5 w-5 relative z-10", stat.iconColor || "text-white")} />
                                    </div>
                                    <ArrowRight className={cn(
                                        "h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300",
                                        stat.text === "text-white" ? "text-white/70" : "text-slate-400"
                                    )} />
                                </div>

                                <div>
                                    <p className={cn(
                                        "text-xs font-black uppercase tracking-widest mb-1 opacity-80",
                                        stat.text
                                    )}>{stat.label}</p>
                                    <div className="flex items-baseline gap-3 mt-0.5">
                                        <h3 className={cn("text-3xl leading-none font-black tracking-tighter", stat.text)}>{stat.value}</h3>
                                        <span className={cn(
                                            "text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm whitespace-nowrap uppercase tracking-widest",
                                            stat.text === "text-white" ? "bg-white/20 text-white backdrop-blur-md" : "bg-slate-100 text-slate-500"
                                        )}>{stat.change}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Service Queue */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex gap-6">
                                    <button
                                        onClick={() => setActiveQueue("TICKETS")}
                                        className={cn(
                                            "text-xl font-bold transition-colors relative pb-1",
                                            activeQueue === "TICKETS" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Service Requests
                                        {activeQueue === "TICKETS" && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-full" />}
                                    </button>
                                    <button
                                        onClick={() => setActiveQueue("REQUESTS")}
                                        className={cn(
                                            "text-xl font-bold transition-colors relative pb-1",
                                            activeQueue === "REQUESTS" ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Resource Requests
                                        {requests.length > 0 && (
                                            <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-600 rounded-md text-[10px] font-black">
                                                {requests.filter(r => r.status === "APPROVED").length}
                                            </span>
                                        )}
                                        {activeQueue === "REQUESTS" && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-full" />}
                                    </button>
                                </div>
                                <Link href={activeQueue === "TICKETS" ? "/tickets" : "#"} className="text-sm font-medium text-green-600 hover:text-green-700">View All</Link>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {activeQueue === "TICKETS" ? (
                                    filteredTickets.length > 0 ? filteredTickets.slice(0, 5).map((ticket, index) => (
                                        <div
                                            key={ticket.id}
                                            className="p-6 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                            onClick={() => router.push(`/tickets`)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="text-[10px] font-black text-slate-300 w-4 mt-1.5">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </div>
                                                    <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 animate-pulse ${ticket.priority === "CRITICAL" ? "bg-red-500" : "bg-emerald-500"
                                                        }`} />
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 group-hover:text-green-600 transition-colors uppercase text-sm tracking-wide">
                                                            {ticket.title}
                                                        </h4>
                                                        <p className="text-slate-500 text-sm mt-1">{ticket.department?.name} • {ticket.lab?.name || "General"}</p>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${ticket.issueType === "HARDWARE"
                                                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                                }`}>
                                                                {ticket.issueType}
                                                            </span>
                                                            <span className="text-slate-400 text-[10px]">•</span>
                                                            <span className="text-slate-500 text-xs flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getUnifiedStatus(ticket.status) === "RESOLVED" ? "bg-green-100 text-green-700" :
                                                        getUnifiedStatus(ticket.status) === "IN_PROCESS" ? "bg-orange-100 text-orange-700" :
                                                            "bg-emerald-100 text-emerald-700"
                                                        }`}>
                                                        {getUnifiedStatus(ticket.status).replace('_', ' ')}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-slate-500 italic">No requests in the queue</div>
                                    )
                                ) : (
                                    filteredRequests.length > 0 ? filteredRequests.slice(0, 5).map((request, index) => (
                                        <div
                                            key={request.id}
                                            className="p-6 hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="text-[10px] font-black text-slate-300 w-4 mt-1.5">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </div>
                                                    <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${request.priority === "CRITICAL" ? "bg-red-500" : "bg-orange-500"
                                                        }`} />
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 uppercase text-sm tracking-wide">
                                                            {request.title}
                                                        </h4>
                                                        <p className="text-slate-500 text-sm mt-1">From: {request.createdBy.name} ({request.department.code})</p>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                                {request.type.replace('_', ' ')}
                                                            </span>
                                                            <span className="text-slate-400 text-[10px]">•</span>
                                                            <span className="text-slate-500 text-xs font-medium">Approved by Dean</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getUnifiedStatus(request.status) === "RESOLVED" ? "bg-green-100 text-green-700" :
                                                        getUnifiedStatus(request.status) === "IN_PROCESS" ? "bg-orange-100 text-orange-700" :
                                                            "bg-emerald-100 text-emerald-700"
                                                        }`}>
                                                        {getUnifiedStatus(request.status).replace('_', ' ')}
                                                    </span>
                                                    {request.type !== "ACCOUNT_APPROVAL" && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(request);
                                                                setIsProcessingModalOpen(true);
                                                            }}
                                                            className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline mt-2"
                                                        >
                                                            Process Request
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-slate-500 italic">No approved resource requests</div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Tasks & Progress */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 mb-6">Service Performance</h2>
                            <div className="space-y-6">
                                {[
                                    { label: "Success Rate", value: 98, color: "bg-green-500" },
                                    { label: "SLA Compliance", value: 94, color: "bg-teal-500" },
                                    { label: "Uptime (Global)", value: 99.9, color: "bg-emerald-500" },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 font-medium">{item.label}</span>
                                            <span className="text-slate-900 font-bold">{item.value}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                                style={{ width: `${item.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Shield className="h-32 w-32 text-white" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2 relative z-10">System Alert</h3>
                            <p className="text-slate-400 text-sm mb-4 relative z-10">
                                There are 4 high-priority hardware issues pending in CSE Lab 301. Immediate attention required.
                            </p>
                            <button
                                onClick={() => router.push("/tickets")}
                                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors relative z-10 shadow-lg shadow-green-900/20"
                            >
                                Respond Now
                            </button>
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={isProcessingModalOpen}
                    onClose={() => setIsProcessingModalOpen(false)}
                    title="Process Resource Request"
                >
                    {selectedRequest && (
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 uppercase text-sm">{selectedRequest.requestNumber} • {selectedRequest.title}</h3>
                                <p className="text-slate-500 text-sm mt-2">{selectedRequest.description}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400">Implementation Remarks</label>
                                <textarea
                                    rows={3}
                                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500"
                                    placeholder="Details about the implementation, asset numbers assigned, etc..."
                                    value={requestRemarks}
                                    onChange={(e) => setRequestRemarks(e.target.value)}
                                />
                            </div>

                            {selectedRequest.type === "LAB_SETUP" && (
                                <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest">Laboratory Provisioning Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase text-slate-400">Lab Code</label>
                                            <input
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold uppercase"
                                                placeholder="e.g. CSE-101"
                                                value={labCode}
                                                onChange={(e) => setLabCode(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase text-slate-400">Max Capacity</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                                placeholder="40"
                                                value={labCapacity}
                                                onChange={(e) => setLabCapacity(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black uppercase text-slate-400">Physical Location</label>
                                        <input
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                            placeholder="e.g. Block C, 3rd Floor"
                                            value={labLocation}
                                            onChange={(e) => setLabLocation(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleProcessRequest("IN_PROGRESS")}
                                    disabled={processingRequest}
                                    className="py-3 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 disabled:opacity-50"
                                >
                                    {processingRequest ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "START WORK"}
                                </button>
                                <button
                                    onClick={() => handleProcessRequest("COMPLETED")}
                                    disabled={processingRequest}
                                    className="py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processingRequest ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "MARK COMPLETED"}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}

