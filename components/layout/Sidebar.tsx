"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Building2,
    Server,
    Ticket,
    Bell,
    Settings,
    LogOut,
    Shield,
    Monitor,
    Wrench,
    Activity,
    User,
    Layers
} from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const getDashboardHref = () => {
        if (!session?.user?.role) return "/login";
        return `/dashboard/${session.user.role.toLowerCase().replace('_', '-')}`;
    };

    const sidebarLinks = [
        { name: "Dashboard", href: getDashboardHref(), icon: LayoutDashboard },
        { name: "Departments", href: "/departments", icon: Building2 },
        { name: "Labs", href: "/labs", icon: Server },
        { name: "Assets", href: "/assets", icon: Monitor },
        { name: "Allocate Systems", href: "/allocate", icon: Layers, deanOnly: true },
        { name: "Requests", href: "/tickets", icon: Wrench },
        { name: "Users", href: "/users", icon: User },
        { name: "History", href: "/notifications", icon: Activity },
    ];

    const filteredLinks = sidebarLinks.filter((link: any) => {
        const role = session?.user?.role;

        // Dean-only links
        if (link.deanOnly && role !== "DEAN") return false;

        // Hide Departments for HOD and ADMIN
        if (role === "HOD" && link.name === "Departments") return false;
        if (role === "ADMIN" && link.name === "Departments") return false;

        // Hide specific links for Lab Incharge
        if (role === "LAB_INCHARGE") {
            const hiddenLinks = ["Departments", "Labs", "Users"];
            if (hiddenLinks.includes(link.name)) return false;
        }

        return true;
    });

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-72 bg-slate-900 text-white shadow-2xl transition-all duration-300">
            {/* Branding */}
            <div className="flex h-24 items-center gap-3 px-8 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic">
                    IT <span className="text-green-500">Services</span>
                </h1>
            </div>

            {/* Profile Summary */}
            <div className="mx-6 my-8 p-4 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-slate-300">
                        {session?.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-black truncate">{session?.user?.name || "User"}</p>
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">{session?.user?.role || "Role"}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-1 px-4">
                {filteredLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 group",
                                isActive
                                    ? "bg-green-600 text-white shadow-xl shadow-green-900/40"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <link.icon className={cn(
                                "h-5 w-5 transition-transform",
                                isActive ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="text-xs font-black uppercase tracking-widest">{link.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg shadow-white" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="absolute bottom-8 left-0 w-full px-6 space-y-2">
                <button
                    onClick={async () => {
                        await signOut({ redirect: false });
                        window.location.href = "/login";
                    }}
                    className="flex w-full items-center gap-4 px-6 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-[20px] transition-all group"
                >
                    <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
