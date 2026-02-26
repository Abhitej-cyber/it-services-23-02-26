"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Ticket,
    Search,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Loader2,
    Filter,
    ArrowRight
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function TicketsPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [resourceRequests, setResourceRequests] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [labs, setLabs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedAssetId, setSelectedAssetId] = useState("");

    useEffect(() => {
        fetchAllData();
        fetchInitialData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [ticketsRes, requestsRes] = await Promise.all([
                fetch("/api/tickets"),
                fetch("/api/requests")
            ]);
            const ticketsData = await ticketsRes.json();
            const requestsData = await requestsRes.json();
            setTickets(Array.isArray(ticketsData) ? ticketsData : []);
            setResourceRequests(Array.isArray(requestsData) ? requestsData : []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [assetsRes, deptsRes, labsRes] = await Promise.all([
                fetch("/api/assets"),
                fetch("/api/departments"),
                fetch("/api/labs")
            ]);
            const assetsData = await assetsRes.json();
            const deptsData = await deptsRes.json();
            const labsData = await labsRes.json();

            setAssets(Array.isArray(assetsData) ? assetsData : []);
            setDepartments(Array.isArray(deptsData) ? deptsData : []);
            setLabs(Array.isArray(labsData) ? labsData : []);
        } catch (error) {
            console.error("Failed to fetch metadata", error);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const body = Object.fromEntries(formData.entries());

        // Derive departmentId from asset or session
        const selectedAsset = assets.find(a => a.id === selectedAssetId);
        if (selectedAsset) {
            body.departmentId = selectedAsset.departmentId;
        } else if (departments.length > 0) {
            body.departmentId = departments[0].id; // Fallback
        }

        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setShowCreateModal(false);
                fetchAllData();
                setSelectedAssetId("");
            }
        } catch (error) {
            console.error("Failed to create ticket", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStatus = async (item: any, unifiedStatus: string) => {
        const id = item.id;
        const isRequest = item.type === 'RESOURCE_REQUEST';

        // Map unified UI status to database-specific enums
        let finalStatus = unifiedStatus;
        if (isRequest) {
            if (unifiedStatus === "PENDING") finalStatus = "PENDING";
            if (unifiedStatus === "IN_PROCESS") finalStatus = "IN_PROGRESS";
            if (unifiedStatus === "RESOLVED") finalStatus = "COMPLETED";
            if (unifiedStatus === "CLOSED") finalStatus = "DECLINED";
        } else {
            if (unifiedStatus === "PENDING") finalStatus = "SUBMITTED";
            if (unifiedStatus === "IN_PROCESS") finalStatus = "PROCESSING";
            if (unifiedStatus === "RESOLVED") finalStatus = "RESOLVED";
            if (unifiedStatus === "CLOSED") finalStatus = "CLOSED";
        }

        try {
            const endpoint = isRequest ? `/api/requests/${id}` : `/api/tickets/${id}`;
            await fetch(endpoint, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: finalStatus })
            });
            fetchAllData();
        } catch (error) {
            console.error("Failed to update item", error);
        }
    };

    const getUnifiedStatus = (status: string) => {
        if (status === "SUBMITTED" || status === "PENDING") return "PENDING";
        if (status === "PROCESSING" || status === "QUEUED" || status === "ASSIGNED" || status === "IN_PROGRESS" || status === "IN_PROCESS") return "IN_PROCESS";
        if (status === "RESOLVED" || status === "DEPLOYED" || status === "COMPLETED") return "RESOLVED";
        if (status === "CLOSED" || status === "DECLINED") return "CLOSED";
        return status;
    };

    const safeTickets = Array.isArray(tickets) ? tickets : [];
    const safeRequests = Array.isArray(resourceRequests) ? resourceRequests : [];

    // Unified helper for counts
    const getCounts = () => {
        const newOpen =
            safeTickets.filter(t => ["SUBMITTED", "APPROVED", "QUEUED"].includes(t.status)).length +
            safeRequests.filter(r => ["PENDING", "APPROVED", "ASSIGNED"].includes(r.status)).length;

        const inProgress =
            safeTickets.filter(t => t.status === "PROCESSING" || t.status === "IN_PROGRESS" || t.status === "IN_PROCESS").length +
            safeRequests.filter(r => r.status === "IN_PROGRESS" || r.status === "IN_PROCESS").length;

        const resolved =
            safeTickets.filter(t => ["RESOLVED", "DEPLOYED"].includes(t.status)).length +
            safeRequests.filter(r => r.status === "COMPLETED" || r.status === "RESOLVED").length;

        return { newOpen, inProgress, resolved };
    };

    const counts = getCounts();

    const filteredTickets = safeTickets.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(search.toLowerCase())
    );

    const filteredRequests = safeRequests.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.requestNumber.toLowerCase().includes(search.toLowerCase())
    );

    const allItems = [
        ...filteredTickets.map(t => ({ ...t, type: 'TICKET' })),
        ...filteredRequests.map(r => ({ ...r, type: 'RESOURCE_REQUEST' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="p-6 lg:p-10 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Requests</h1>
                    <p className="text-slate-500 font-medium">Monitor and resolve infrastructure service requests</p>
                </div>
                {session?.user?.role === "LAB_INCHARGE" && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black text-sm rounded-2xl hover:bg-green-700 shadow-xl shadow-green-200 transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        RAISE SUPPORT REQUEST
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Status Bubbles */}
                <div className="xl:col-span-1 space-y-4">
                    {[
                        { label: "New & Open", count: counts.newOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "In Process", count: counts.inProgress, color: "text-orange-600", bg: "bg-orange-50" },
                        { label: "Resolved", count: counts.resolved, color: "text-green-600", bg: "bg-green-50" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-green-200 transition-all">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color} mt-1`}>{stat.count}</p>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                <Ticket className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ticket List */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                    <Clock className="h-6 w-6 text-slate-400" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900">Service Queue</h2>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search requests..."
                                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-green-500 transition-all w-48"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {loading ? (
                                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest flex flex-col items-center">
                                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-green-600" />
                                    Loading Secure Queue...
                                </div>
                            ) : (
                                allItems.map((item) => (
                                    <div key={item.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                                        <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
                                            <div className="flex items-start gap-6">
                                                <div className={`mt-1 h-14 w-14 rounded-3xl flex items-center justify-center flex-shrink-0 font-black text-xs ${item.priority === "CRITICAL" || item.priority === "HIGH" ? "bg-red-50 text-red-600 border border-red-100" :
                                                    item.priority === "NORMAL" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                        "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                    }`}>
                                                    {item.priority.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${item.type === 'RESOURCE_REQUEST' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            item.issueType === "HARDWARE" ? "bg-red-50 text-red-600 border-red-100" :
                                                                item.issueType === "SOFTWARE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                    "bg-green-50 text-green-600 border-green-100"
                                                            }`}>
                                                            {item.type === 'RESOURCE_REQUEST' ? 'RESOURCE' : item.issueType}
                                                        </span>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{item.type === 'RESOURCE_REQUEST' ? item.requestNumber : item.ticketNumber}</span>
                                                        {item.type === 'RESOURCE_REQUEST' && (
                                                            <>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="text-[10px] font-black text-blue-500 tracking-widest uppercase">Approved Request</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                                                    <p className="text-slate-500 text-sm mt-1 line-clamp-1">{item.description}</p>
                                                    <div className="flex items-center gap-4 mt-4">
                                                        {item.type === 'TICKET' && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ASSET: {item.asset?.assetNumber || "GENERAL"}</span>}
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">DEPT: {item.department?.code}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right mr-4 hidden md:block">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged By</p>
                                                    <p className="text-xs font-bold text-slate-700">{item.createdBy?.name}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center ${getUnifiedStatus(item.status) === "RESOLVED" ? "bg-green-500 text-white" :
                                                            getUnifiedStatus(item.status) === "IN_PROCESS" ? "bg-orange-500 text-white" :
                                                                "bg-emerald-500 text-white"
                                                        }`}>
                                                        {getUnifiedStatus(item.status).replace('_', ' ')}
                                                    </span>
                                                    {session?.user?.role === "ADMIN" && (
                                                        <select
                                                            value={getUnifiedStatus(item.status)}
                                                            onChange={(e) => updateStatus(item, e.target.value)}
                                                            disabled={getUnifiedStatus(item.status) === "RESOLVED" || getUnifiedStatus(item.status) === "CLOSED"}
                                                            className={`text-[10px] font-black border rounded-lg px-2 py-1.5 uppercase tracking-widest outline-none transition-all ${getUnifiedStatus(item.status) === "RESOLVED" || getUnifiedStatus(item.status) === "CLOSED"
                                                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                                                : "text-green-600 bg-white border-green-100 focus:ring-2 focus:ring-green-500 cursor-pointer hover:border-green-300"
                                                                }`}
                                                        >
                                                            <option value="APPROVED">Approved</option>
                                                            <option value="IN_PROCESS">In Process</option>
                                                            <option value="RESOLVED">Resolved</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Raise Request Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Raise Support Request"
                className="max-w-2xl"
            >
                <form onSubmit={handleCreateTicket} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Title</label>
                        <input name="title" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" placeholder="e.g. System blue screen on boot" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Description</label>
                        <textarea name="description" required rows={4} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500" placeholder="Explain the technical issue in detail..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Issue Type</label>
                            <select name="issueType" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="HARDWARE">Hardware failure</option>
                                <option value="SOFTWARE">Software / OS issue</option>
                                <option value="NETWORK">Network / Connectivity</option>
                                <option value="OTHER">Other technical issue</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Priority</label>
                            <select name="priority" required className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="LOW">Low - No impact</option>
                                <option value="NORMAL">Normal - Standard</option>
                                <option value="HIGH">High - Operational risk</option>
                                <option value="CRITICAL">Critical - System down</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Affected Asset</label>
                            <select
                                name="assetId"
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500"
                                value={selectedAssetId}
                                onChange={(e) => setSelectedAssetId(e.target.value)}
                            >
                                <option value="">General Issue (No specific asset)</option>
                                {assets.map(a => <option key={a.id} value={a.id}>{a.assetNumber} - {a.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deployment Location (Lab)</label>
                            <select name="labId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500">
                                <option value="">Institutional Global</option>
                                {labs.map(l => <option key={l.id} value={l.id}>{l.name} ({l.code})</option>)}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "DISPATCH SUPPORT REQUEST"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
