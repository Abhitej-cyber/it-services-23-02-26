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
    ArrowUpRight,
    Search,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, ticketsRes, requestsRes] = await Promise.all([
                    fetch("/api/stats"),
                    fetch("/api/tickets"),
                    fetch("/api/requests")
                ]);

                const statsData = await statsRes.json();
                const ticketsData = await ticketsRes.json();
                const requestsData = await requestsRes.json();

                setStats(statsData);
                setTickets(Array.isArray(ticketsData) ? ticketsData : []);
                setRequests(Array.isArray(requestsData) ? requestsData : []);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                setTickets([]);
                setRequests([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

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
                const requestsRes = await fetch("/api/requests");
                const requestsData = await requestsRes.json();
                setRequests(Array.isArray(requestsData) ? requestsData : []);
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

    const filteredTickets = tickets
        .filter(t => {
            const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                t.ticketNumber.toLowerCase().includes(search.toLowerCase());
            const matchesPriority = filterPriority === "ALL" || t.priority === filterPriority;
            return matchesSearch && matchesPriority;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
        <div className="p-6 lg:p-10 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Simplified Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Administration</h1>
                    <p className="text-slate-500 font-medium">Operational oversight of institutional IT resources</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Concise Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Managed Systems", value: stats?.totalSystems || 0, change: "Live Sync", icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Servers", value: stats?.totalServers || 0, change: "Active", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Network Nodes", value: stats?.totalRouters || 0, change: "Online", icon: Network, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending Requests", value: stats?.pendingTickets || 0, change: "Awaiting", icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#f6f9fc] p-6 rounded-3xl border border-slate-100/60 shadow-sm relative group overflow-hidden transition-all">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -mr-8 -mt-8 rounded-full opacity-50 group-hover:scale-110 transition-transform`} />
                        <div className="relative z-10 flex flex-col gap-5">
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            <div>
                                <p className="text-slate-500 text-sm font-bold">{stat.label}</p>
                                <div className="flex items-center gap-3 mt-1 text-slate-900">
                                    <h3 className="text-[32px] leading-none font-black">{stat.value}</h3>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md text-slate-500 bg-white shadow-sm self-end mb-1">{stat.change}</span>
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
                                                        {ticket.ticketNumber} • {ticket.title}
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
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.status === "DEPLOYED" || ticket.status === "RESOLVED" ? "bg-green-100 text-green-700" :
                                                    ticket.status === "PROCESSING" ? "bg-emerald-100 text-emerald-700" :
                                                        "bg-green-100 text-green-700"
                                                    }`}>
                                                    {ticket.status}
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
                                                        {request.requestNumber} • {request.title}
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
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-green-100 text-green-700"}`}>
                                                    {request.status}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setIsProcessingModalOpen(true);
                                                    }}
                                                    className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline mt-2"
                                                >
                                                    Process Request
                                                </button>
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
    );
}

