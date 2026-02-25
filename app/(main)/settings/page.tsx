"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Save,
    CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-6 lg:p-10 space-y-10 bg-slate-50 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">SYSTEM SETTINGS</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Manage your institutional preferences and profile</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-black text-sm rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                >
                    {saved ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    {saved ? "PREFERENCES SAVED" : "SAVE CHANGES"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Navigation Sidebar */}
                <div className="space-y-2">
                    {[
                        { label: "Profile Information", icon: User, active: true },
                        { label: "Notifications", icon: Bell },
                        { label: "Security & Access", icon: Shield },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${item.active
                                ? "bg-white text-green-600 shadow-sm border border-slate-100"
                                : "text-slate-400 hover:bg-white/50"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <User className="h-6 w-6 text-green-500" />
                                General Profile
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                    <input
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold"
                                        value={session?.user?.name || ""}
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                    <input
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold"
                                        value={session?.user?.email || ""}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6 pt-10 border-t border-slate-50">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Bell className="h-6 w-6 text-orange-500" />
                                Notification Toggles
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: "Email alerts for new requests", desc: "Receive immediate notification when a lab incharge raises a request." },
                                    { label: "Maintenance reminders", desc: "Weekly digest of assets nearing warranty expiry." },
                                    { label: "Request approval updates", desc: "Get notified when the Dean acts on your resource requests." }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                                            <p className="text-xs text-slate-500">{item.desc}</p>
                                        </div>
                                        <div className="h-6 w-11 bg-green-600 rounded-full relative cursor-pointer shadow-inner">
                                            <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-md" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6 pt-10 border-t border-slate-50">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                <Shield className="h-6 w-6 text-green-500" />
                                Security Settings
                            </h2>
                            <button className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                                Change Account Password
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
