"use client";

import { useRouter } from "next/navigation";
import { Shield, GraduationCap, Users, Wrench } from "lucide-react";

type RoleOption = {
    role: string;
    displayName: string;
    description: string;
    icon: any;
    gradient: string;
    route: string;
};

const roleOptions: RoleOption[] = [
    {
        role: "DEAN",
        displayName: "Dean",
        description: "Executive Management",
        icon: GraduationCap,
        gradient: "from-green-500 to-green-600",
        route: "/login/dean"
    },
    {
        role: "HOD",
        displayName: "Head of Department",
        description: "Department Management",
        icon: Users,
        gradient: "from-green-500 to-green-600",
        route: "/login/hod"
    },
    {
        role: "ADMIN",
        displayName: "System Admin",
        description: "IT Support & Maintenance",
        icon: Shield,
        gradient: "from-teal-500 to-teal-600",
        route: "/login/admin"
    },
    {
        role: "LAB_INCHARGE",
        displayName: "Lab Incharge",
        description: "Laboratory Operations",
        icon: Wrench,
        gradient: "from-emerald-500 to-emerald-600",
        route: "/login/lab-incharge"
    },
];

export default function RoleSelectionPage() {
    const router = useRouter();

    const handleRoleSelect = (role: RoleOption) => {
        router.push(role.route);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-6xl relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white/90 backdrop-blur-sm rounded-3xl mb-6 shadow-2xl border border-white/20 p-3 hover:scale-105 transition-transform duration-300">
                        <img
                            src="/vignan-logo-new.png"
                            alt="Vignan Logo"
                            className="w-full h-full object-contain drop-shadow-md"
                        />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                        IT Services Asset Management
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Streamline your institution's IT infrastructure with intelligent asset tracking and service management
                    </p>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {roleOptions.map((role) => {
                        const Icon = role.icon;
                        return (
                            <button
                                key={role.role}
                                onClick={() => handleRoleSelect(role)}
                                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
                            >
                                {/* Gradient Background on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>

                                {/* Icon Container */}
                                <div className={`relative w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="h-8 w-8 text-white" />
                                </div>

                                {/* Content */}
                                <div className="relative">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                        {role.displayName}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        {role.description}
                                    </p>
                                    <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                        <span>Continue</span>
                                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer Info */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Secure Authentication • Role-Based Access Control
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
