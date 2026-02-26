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
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LabInchargeDashboard() {
    const { data: stats, isLoading: loadingStats } = useSWR("/api/stats", fetcher, { revalidateOnFocus: false });
    const { data: ticketsRaw } = useSWR("/api/tickets", fetcher);

    const tickets = Array.isArray(ticketsRaw) ? ticketsRaw : [];
    const loading = loadingStats;

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6 bg-slate-50 min-h-screen relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse z-0" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse z-0" />

            {/* Premium Lab Oversight Header */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 backdrop-blur-md p-6 rounded-[32px] border border-white/50 shadow-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Lab Active</span>
                        </div>
                        <span className="text-slate-300 text-[10px]">•</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">CSE-LAB-301</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        LAB MONITORING <span className="text-blue-600 italic">SYSTEMS</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-medium max-w-md">Real-time oversight of computer infrastructure, software deployments, and maintenance.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Server Time</p>
                        <p className="text-sm font-black text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white font-black text-[11px] rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        <Plus className="h-4 w-4" />
                        REPORT ISSUE
                    </button>
                    <button className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all">
                        <Activity className="h-5 w-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Vibrant KPI Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Lab Inventory", value: stats?.totalSystems || 0, change: "Live Sync", icon: Monitor, gradient: "from-blue-600 to-indigo-700", shadow: "shadow-blue-200" },
                    { label: "Optimal Status", value: stats?.workingSystems || 0, change: "Active", icon: CheckCircle2, gradient: "from-emerald-500 to-teal-700", shadow: "shadow-emerald-200" },
                    { label: "Active Requests", value: stats?.pendingTickets || 0, change: "Processing", icon: Wrench, gradient: "from-orange-500 to-amber-700", shadow: "shadow-orange-200" },
                    { label: "System Health", value: "98%", change: "Healthy", icon: Zap, gradient: "from-indigo-600 to-blue-800", shadow: "shadow-indigo-200" },
                ].map((stat, i) => (
                    <div key={i} className="group relative bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} ${stat.shadow} shadow-lg text-white`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <span className="text-[9px] font-black px-2 py-1 rounded-lg text-slate-400 bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors uppercase tracking-widest">
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[8px] font-bold text-slate-400 border-t border-slate-50 pt-3">
                            <Clock className="h-3 w-3" /> Updated moments ago
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Refined Activity List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Maintenance</h2>
                                <p className="text-slate-400 text-[11px] font-medium">Tracking reported infrastructure technical queries</p>
                            </div>
                            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                <Ticket className="h-5 w-5 text-slate-400" />
                            </div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {tickets.length > 0 ? tickets.slice(0, 5).map((t) => (
                                <div key={t.id} className="p-5 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:border-blue-200 transition-all">
                                                {t.status === "DEPLOYED" ?
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                                                    <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
                                                }
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${t.issueType === "HARDWARE"
                                                        ? "bg-red-50 text-red-600 border-red-100"
                                                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                        }`}>
                                                        {t.issueType}
                                                    </span>
                                                    <span className="text-slate-400 text-[9px] font-bold tracking-widest">{t.ticketNumber}</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase truncate max-w-[200px] sm:max-w-md">{t.title}</h4>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`hidden sm:inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${t.status === "DEPLOYED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                                }`}>
                                                {t.status}
                                            </span>
                                            <button className="p-2 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all">
                                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-16 text-center text-slate-400 italic font-medium text-xs">No active technical queries for this lab</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Info className="h-5 w-5 text-emerald-500" />
                            <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Lab Ethics</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Report hardware issues instantly.",
                                "Authorized software only.",
                                "No external USB devices.",
                                "Maintain logbook daily."
                            ].map((guide, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <span className="font-black text-emerald-500 text-sm">0{i + 1}</span>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">{guide}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Compact Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 right-0 p-10 -mr-12 -mt-12 bg-white/5 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-[2000ms]" />
                        <div className="relative z-10">
                            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                <Server className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight">System<br />Infrastructure</h3>
                            <p className="text-slate-400 text-[11px] mt-3 leading-relaxed font-bold">
                                Ensure all lab terminals are synchronized. OS security patches were deployed successfully.
                            </p>
                            <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-7 w-7 bg-slate-700 border-2 border-slate-900 rounded-xl flex items-center justify-center text-[8px] font-black text-white uppercase">
                                            SY
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest tracking-widest">Admin Monitored</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
