"use client";

import { useState, useEffect } from "react";
import {
    Monitor,
    Ticket,
    CheckCircle2,
    Plus,
    Clock,
    Wrench,
    Activity,
    ArrowRight,
    Server,
    Zap,
    Info
} from "lucide-react";

export default function LabInchargeDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [statsRes, ticketsRes] = await Promise.all([
                    fetch("/api/stats"),
                    fetch("/api/tickets")
                ]);

                const statsData = await statsRes.json();
                const ticketsData = await ticketsRes.json();

                setStats(statsData);
                setTickets(ticketsData);
            } catch (error) {
                console.error("Failed to fetch lab data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-10 bg-slate-50 min-h-screen">
            {/* Dynamic Lab Header */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 -mr-20 -mt-20 bg-green-500/5 rounded-full blur-3xl" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="p-1 px-3 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">CSE-LAB-301</span>
                            <span className="flex h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Live Monitoring</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 leading-tight">Programming Lab 1</h1>
                        <p className="text-slate-500 font-medium max-w-xl">Real-time oversight of computer infrastructure, licensed software deployments, and proactive maintenance tickets.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-3 px-8 py-5 bg-green-600 text-white font-black text-sm rounded-[24px] hover:bg-green-700 hover:shadow-2xl hover:shadow-green-200 transition-all transform hover:-translate-y-1">
                            <Plus className="h-5 w-5" />
                            REPORT SYSTEM ISSUE
                        </button>
                        <button className="p-5 bg-slate-100 rounded-[24px] hover:bg-slate-200 transition-colors">
                            <Activity className="h-6 w-6 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Lab Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Lab Inventory", value: stats?.totalSystems || 0, change: "Live Sync", icon: Monitor, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Optimal Status", value: stats?.workingSystems || 0, change: "Active", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Requests", value: stats?.pendingTickets || 0, change: "Attention", icon: Wrench, color: "text-orange-500", bg: "bg-orange-50" },
                    { label: "System Health", value: "94%", change: "Good", icon: Zap, color: "text-green-500", bg: "bg-green-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#f6f9fc] p-6 rounded-3xl border border-slate-100/60 shadow-sm relative group overflow-hidden transition-all hover:shadow-md cursor-pointer">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -mr-8 -mt-8 rounded-full opacity-50 group-hover:scale-110 transition-transform`} />
                        <div className="relative z-10 flex flex-col gap-5">
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            <div>
                                <p className="text-slate-500 text-sm font-bold">{stat.label}</p>
                                <div className="flex items-center gap-3 mt-1 text-slate-900">
                                    <h3 className="text-[32px] leading-none font-black">{stat.value}</h3>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md text-slate-500 bg-white shadow-sm self-end mb-1">{stat.change}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                    <Clock className="h-3 w-3" /> Last checked: 2m ago
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Ticket List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Lab Activity & Requests</h2>
                                <p className="text-slate-500 text-sm mt-1">Status of ongoing maintenance and reported hardware/software issues</p>
                            </div>
                            <button className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                <Ticket className="h-6 w-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {tickets.length > 0 ? tickets.slice(0, 5).map((t) => (
                                <div key={t.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex items-start gap-6">
                                            <div className={`mt-1 h-14 w-14 rounded-3xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${t.status === "DEPLOYED" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                                }`}>
                                                {t.status === "DEPLOYED" ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${t.issueType === "HARDWARE"
                                                        ? "bg-red-50 text-red-600 border-red-100"
                                                        : "bg-green-50 text-green-600 border-green-100"
                                                        }`}>
                                                        {t.issueType}
                                                    </span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ticketNumber}</span>
                                                </div>
                                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">{t.title}</h4>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-xs font-bold text-slate-500">Asset: PC-402</span>
                                                    <span className="h-1 w-1 bg-slate-200 rounded-full" />
                                                    <span className="text-xs text-slate-400 font-medium">Logged on {new Date(t.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${t.status === "DEPLOYED" ? "bg-green-500 text-white" : "bg-slate-900 text-white"
                                                }`}>
                                                {t.status}
                                            </div>
                                            <button className="p-3 bg-white border border-slate-100 rounded-full hover:border-green-200 hover:bg-green-50 transition-all">
                                                <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-green-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center text-slate-400 italic font-medium">No active requests for this lab</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-emerald-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 p-12 -mr-16 -mb-16 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-[2000ms]" />
                        <div className="relative z-10">
                            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8">
                                <Server className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight">Infrastructure Management</h3>
                            <p className="text-emerald-300 text-sm mt-4 leading-relaxed">
                                Ensure all lab systems are up to date. Security patches for Windows 11 were deployed successfully.
                            </p>
                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-10 w-10 bg-emerald-700 border-2 border-emerald-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                                            USR
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-emerald-200">System Admin monitoring</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="h-5 w-5 text-emerald-500" />
                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">Lab Guidelines</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Report hardware damage within 2 hours of detection.",
                                "Log off systems before shutting down power.",
                                "Prohibit external USB drives for security.",
                                "Maintain system logs daily."
                            ].map((guide, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl">
                                    <span className="font-black text-emerald-500 text-xs">0{i + 1}</span>
                                    <p className="text-xs font-bold text-slate-600 leading-normal">{guide}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
