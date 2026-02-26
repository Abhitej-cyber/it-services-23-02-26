"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    History,
    Monitor,
    CheckCircle2,
    Clock,
    AlertCircle,
    LayoutGrid,
    ArrowRight,
    ClipboardList,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/modal";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HODDashboard() {
    const { data: session } = useSession();
    const router = useRouter();

    const { data: stats, isLoading: loadingStats } = useSWR("/api/stats", fetcher, { revalidateOnFocus: false });
    const { data: requestsRaw, mutate: mutateRequests } = useSWR("/api/requests", fetcher);
    const { data: labsRaw, mutate: mutateLabs } = useSWR("/api/labs", fetcher, { revalidateOnFocus: false });
    const { data: usersRaw } = useSWR("/api/users?role=LAB_INCHARGE", fetcher, { revalidateOnFocus: false });

    const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
    const labs = Array.isArray(labsRaw) ? labsRaw : [];
    const users = Array.isArray(usersRaw) ? usersRaw : [];
    const loading = loadingStats;

    const [showHistory, setShowHistory] = useState(false);

    // Modals
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Form States
    const [requestForm, setRequestForm] = useState({ title: "", description: "", type: "NEW_SYSTEM", priority: "NORMAL" });
    const [assignForm, setAssignForm] = useState({ labId: "", inchargeId: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleRaiseRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        const deptId = session?.user?.departmentId;
        if (!deptId) {
            alert("Error: Your account is not associated with any department. Please contact the administrator.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...requestForm,
                    departmentId: deptId
                })
            });

            if (res.ok) {
                const data = await res.json();
                setIsRequestModalOpen(false);
                setRequestForm({ title: "", description: "", type: "NEW_SYSTEM", priority: "NORMAL" });
                await mutateRequests();
                alert(`Success! Request ${data.requestNumber} has been raised.`);
            } else {
                const errorData = await res.json();
                alert(`Error: ${errorData.error || "Failed to raise request"}`);
            }
        } catch (error) {
            console.error("Failed to raise request", error);
            alert("An error occurred while submitting the request. Please check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignIncharge = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`/api/labs/${assignForm.labId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inchargeId: assignForm.inchargeId })
            });
            if (res.ok) {
                setIsAssignModalOpen(false);
                setAssignForm({ labId: "", inchargeId: "" });
                await mutateLabs();
            }
        } catch (error) {
            console.error("Failed to assign incharge", error);
        } finally {
            setSubmitting(false);
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
        <div className="p-6 lg:p-10 space-y-10 bg-white min-h-screen">
            {/* Simple Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">IT Management Console</h1>
                    <p className="text-slate-500 font-medium">Monitoring departmental assets and technical requests</p>
                </div>
                <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="flex items-center gap-3 px-6 py-3.5 bg-green-600 text-white font-bold text-sm rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                >
                    <Plus className="h-5 w-5" />
                    New Resource Request
                </button>
            </div>

            {/* Simplified Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Assets", value: stats?.totalSystems || 0, change: "Managed", icon: Monitor, color: "text-blue-600", bg: "bg-blue-50", href: "/assets" },
                    { label: "Active Requests", value: stats?.activeRequests || 0, change: "Operational", icon: History, color: "text-orange-500", bg: "bg-orange-50", href: "/dashboard/hod#request-pipeline" },
                    { label: "Working Condition", value: `${Math.round((stats?.workingSystems / stats?.totalSystems) * 100) || 0}%`, change: "Optimal", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => stat.href && router.push(stat.href)}
                        className="bg-[#f6f9fc] p-6 rounded-3xl border border-slate-100/60 shadow-sm relative group overflow-hidden transition-all hover:shadow-md cursor-pointer"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -mr-8 -mt-8 rounded-full opacity-50 group-hover:scale-110 transition-transform`} />
                        <div className="relative z-10 flex flex-col gap-5">
                            <div className="flex justify-between items-start">
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-current transition-colors" />
                            </div>
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Recent Requests - Modern Table Style */}
                <div id="request-pipeline" className="scroll-mt-10 space-y-8 p-10 bg-slate-50/50 rounded-[48px] border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <ClipboardList className="h-6 w-6 text-slate-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Request Pipeline</h2>
                        </div>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-sm font-black text-green-600 hover:text-green-700 flex items-center gap-2"
                        >
                            {showHistory ? "Active Only" : "History"}
                            <ArrowRight className={cn("h-4 w-4 transition-transform", showHistory && "rotate-90")} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {(Array.isArray(requests) ? requests : [])
                            .filter(r => showHistory ? true : ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS"].includes(r.status))
                            .slice(0, 10)
                            .map((req, index) => (
                                <div
                                    key={req.id}
                                    className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-slate-100 transition-all group cursor-pointer"
                                    onClick={() => {
                                        setSelectedRequest(req);
                                        setIsDetailsModalOpen(true);
                                    }}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="text-[10px] font-black text-slate-300 w-4">
                                            {String(index + 1).padStart(2, '0')}
                                        </div>
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-xs ${req.status === "APPROVED" || req.status === "COMPLETED" ? "bg-green-50 text-green-600 border border-green-100" :
                                            req.status === "DECLINED" ? "bg-red-50 text-red-600 border border-red-100" :
                                                "bg-orange-50 text-orange-600 border border-orange-100"
                                            }`}>
                                            {req.status === "APPROVED" || req.status === "COMPLETED" ? <CheckCircle2 className="h-6 w-6" /> :
                                                req.status === "DECLINED" ? <AlertCircle className="h-6 w-6" /> :
                                                    <Clock className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-green-600 transition-colors uppercase text-sm">{req.title}</h4>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{req.requestNumber} • {new Date(req.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${req.priority === "HIGH" || req.priority === "CRITICAL" ? "bg-red-600 text-white" : "bg-slate-100 text-slate-600"
                                            }`}>
                                            {req.priority}
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        {requests.filter(r => showHistory ? true : ["PENDING", "APPROVED", "ASSIGNED", "IN_PROGRESS"].includes(r.status)).length === 0 && (
                            <div className="p-12 text-center text-slate-400 italic font-medium">No {showHistory ? "" : "active"} requests in pipeline</div>
                        )}
                    </div>
                </div>

                {/* Labs Management Section */}
                <div id="lab-overseer" className="scroll-mt-10 space-y-8 p-10 bg-white rounded-[48px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl border transition-colors bg-green-50 border-green-100">
                                <LayoutGrid className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Lab Overseer</h2>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setAssignForm({ labId: labs[0]?.id || "", inchargeId: "" });
                                setIsAssignModalOpen(true);
                            }}
                            className="text-sm font-black text-green-600 hover:text-green-700 flex items-center gap-2"
                        >
                            Assign New Incharge
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {(Array.isArray(labs) ? labs : [])
                            .map((lab, i) => (
                                <div key={lab.id} className="p-7 bg-slate-50/50 hover:bg-white rounded-[32px] border border-slate-50 hover:border-green-100 hover:shadow-2xl hover:shadow-green-50 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-16 w-16 rounded-[24px] bg-white border border-slate-100 flex items-center justify-center font-black text-xl text-slate-900 shadow-sm`}>
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{lab.name}</h4>
                                            <p className="text-slate-500 text-sm font-medium">Incharge: <span className="text-slate-900 font-bold">{lab.incharge?.name || "Not Assigned"}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100`}>
                                            {lab.code}
                                        </div>
                                        <button
                                            onClick={() => router.push(`/assets?labId=${lab.id}`)}
                                            className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-green-500 transition-colors"
                                        >
                                            Manage Lab Assets →
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* Modals */}
                    <Modal
                        isOpen={isRequestModalOpen}
                        onClose={() => setIsRequestModalOpen(false)}
                        title="Raise Resource Request"
                    >
                        <form onSubmit={handleRaiseRequest} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Title</label>
                                <input
                                    required
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., 20 New Systems for Lab 102"
                                    value={requestForm.title}
                                    onChange={e => setRequestForm({ ...requestForm, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Type</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500"
                                        value={requestForm.type}
                                        onChange={e => setRequestForm({ ...requestForm, type: e.target.value })}
                                    >
                                        <option value="NEW_SYSTEM">New Systems</option>
                                        <option value="HARDWARE_REPAIR">Hardware Repair</option>
                                        <option value="SOFTWARE_INSTALLATION">Software</option>
                                        <option value="NETWORK_UPGRADE">Network</option>
                                        <option value="LAB_SETUP">Lab Setup</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500"
                                        value={requestForm.priority}
                                        onChange={e => setRequestForm({ ...requestForm, priority: e.target.value })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detailed Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Please provide specific details about the requirement..."
                                    value={requestForm.description}
                                    onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                                />
                            </div>
                            <button
                                disabled={submitting}
                                className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                SUBMIT OFFICIAL REQUEST
                            </button>
                        </form>
                    </Modal>

                    <Modal
                        isOpen={isAssignModalOpen}
                        onClose={() => setIsAssignModalOpen(false)}
                        title="Assign Lab Incharge"
                    >
                        <form onSubmit={handleAssignIncharge} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Lab</label>
                                <select
                                    required
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500"
                                    value={assignForm.labId}
                                    onChange={e => setAssignForm({ ...assignForm, labId: e.target.value })}
                                >
                                    <option value="" disabled>Choose a lab...</option>
                                    {labs.map(lab => (
                                        <option key={lab.id} value={lab.id}>{lab.name} ({lab.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Incharge</label>
                                <select
                                    required
                                    className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500"
                                    value={assignForm.inchargeId}
                                    onChange={e => setAssignForm({ ...assignForm, inchargeId: e.target.value })}
                                >
                                    <option value="" disabled>Choose a faculty member...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                disabled={submitting}
                                className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                CONFIRM ASSIGNMENT
                            </button>
                        </form>
                    </Modal>

                    <Modal
                        isOpen={isDetailsModalOpen}
                        onClose={() => setIsDetailsModalOpen(false)}
                        title="Resource Request Details"
                    >
                        {selectedRequest && (
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedRequest.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                            selectedRequest.status === "DECLINED" ? "bg-red-100 text-red-700" :
                                                "bg-orange-100 text-orange-700"
                                            }`}>
                                            {selectedRequest.status}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">{selectedRequest.requestNumber}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">{selectedRequest.title}</h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedRequest.description}</p>
                                </div>

                                {selectedRequest.remarks && (
                                    <div className={cn(
                                        "p-6 rounded-3xl border",
                                        selectedRequest.status === "DECLINED" ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
                                    )}>
                                        <h4 className={cn(
                                            "text-[10px] font-black uppercase tracking-widest mb-2",
                                            selectedRequest.status === "DECLINED" ? "text-red-600" : "text-green-600"
                                        )}>
                                            Dean's Remarks
                                        </h4>
                                        <p className="text-sm text-slate-700 font-bold italic">"{selectedRequest.remarks}"</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                        <p className="text-xs font-bold text-slate-900 mt-1 uppercase">{selectedRequest.type.replace('_', ' ')}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</p>
                                        <p className="text-xs font-bold text-slate-900 mt-1 uppercase">{selectedRequest.priority}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="w-full py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700"
                                >
                                    CLOSE DETAILS
                                </button>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
}

