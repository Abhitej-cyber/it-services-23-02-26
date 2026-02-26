"use client";

import { useSession, signOut } from "next-auth/react";
import {
    Bell,
    Search,
    ChevronDown,
    Monitor,
    Clock,
    User as UserIcon,
    ArrowRight,
    Settings,
    LogOut
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export function Header() {
    const { data: session } = useSession();
    const [activities, setActivities] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch("/api/activities?limit=5");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setActivities(data.slice(0, 5));

                        // Simple unread logic based on local storage
                        const lastSeen = localStorage.getItem("lastSeenActivity");
                        if (data.length > 0) {
                            if (!lastSeen || new Date(data[0].createdAt) > new Date(lastSeen)) {
                                setHasUnread(true);
                            }
                        }
                    } else {
                        setActivities([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        if (session) {
            fetchActivities();
            // Poll every 60 seconds
            const interval = setInterval(fetchActivities, 60000);
            return () => clearInterval(interval);
        }
    }, [session]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = () => {
        if (activities.length > 0) {
            localStorage.setItem("lastSeenActivity", activities[0].createdAt);
            setHasUnread(false);
        }
    };

    return (
        <header className="sticky top-0 z-30 h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between">
            <div className="flex items-center gap-8">
                {/* Search */}
                <div className="relative hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-3xl text-sm w-[440px] focus:ring-2 focus:ring-green-500 transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Action Icons */}
                <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                    <button
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) markAsRead();
                        }}
                        className="p-3 hover:bg-slate-50 rounded-2xl transition-colors relative"
                    >
                        <Bell className="h-5 w-5 text-slate-400" />
                        {hasUnread && (
                            <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Alerts</h3>
                                <Link href="/notifications" onClick={() => setShowNotifications(false)} className="text-[9px] font-black text-green-600 hover:underline uppercase tracking-widest">View History</Link>
                            </div>
                            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
                                {activities.length > 0 ? (
                                    activities.map((act) => (
                                        <Link
                                            key={act.id}
                                            href="/notifications"
                                            onClick={() => setShowNotifications(false)}
                                            className="block p-5 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex gap-4">
                                                <div className="h-8 w-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                                                    <Bell className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-900 uppercase leading-tight line-clamp-1">{act.entity}</p>
                                                    <p className="text-[9px] text-slate-500 font-medium italic line-clamp-2 leading-relaxed">{act.details}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Clock className="h-3 w-3 text-slate-300" />
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-10 text-center">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Awaiting Events</p>
                                    </div>
                                )}
                            </div>
                            <Link
                                href="/notifications"
                                onClick={() => setShowNotifications(false)}
                                className="block py-4 bg-slate-900 text-white text-center text-[9px] font-black uppercase tracking-[0.2em] hover:bg-green-600 transition-colors"
                            >
                                Enter System Pulse
                            </Link>
                        </div>
                    )}

                    {/* Redacted Globe Icon */}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-100 relative" ref={profileRef}>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{session?.user?.name || "User"}</p>
                        <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">{session?.user?.role || "Member"}</p>
                    </div>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${showProfileMenu ? 'bg-green-600 rotate-180' : 'bg-slate-900 shadow-lg shadow-slate-200'
                            }`}
                    >
                        <ChevronDown className="h-4 w-4 text-white" />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Authenticated User</p>
                                <p className="text-[11px] font-black text-slate-900 line-clamp-1">{session?.user?.email}</p>
                            </div>
                            <div className="p-2">
                                <Link
                                    href="/settings"
                                    onClick={() => setShowProfileMenu(false)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors group"
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-green-50 transition-colors">
                                        <Settings className="h-3.5 w-3.5 text-slate-500 group-hover:text-green-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Settings</span>
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors group"
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-red-100 transition-colors">
                                        <LogOut className="h-3.5 w-3.5 text-slate-500 group-hover:text-red-600" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
