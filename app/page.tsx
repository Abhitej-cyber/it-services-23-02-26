"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hero } from "@/components/ui/hero";
import { Leaf, Zap, Shield, Globe, FileText, Lock } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
    const router = useRouter();
    const { data, error, isLoading } = useSWR("/api/policy", fetcher);

    return (
        <main className="relative min-h-screen bg-[#fafafa] flex flex-col items-center justify-start py-20 px-6 overflow-x-hidden selection:bg-[#2d6a4f]/30 font-sans text-slate-900">
            {/* Ambient Nature Mesh Backgrounds */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#ecf39e]/40 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#91a84b]/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#f7e479]/40 rounded-full blur-[100px]"
                />
            </div>

            <div className="flex-1 w-full max-w-4xl z-10 flex flex-col items-center justify-center min-h-[80vh]">
                <Hero
                    trustBadge={{
                        text: "VIGNAN INSTITUTE OF TECHNOLOGY AND SCIENCE",
                        image: "/vignan-logo-final.png"
                    }}
                    headline={{
                        line1: "IT",
                        line2: "Services"
                    }}
                    subtitle="Advanced Asset & Service Management System for Modern Institutions. Streamline operations, track assets, and manage requests efficiently."
                    buttons={{
                        primary: {
                            text: "Login to Dashboard →",
                            onClick: () => router.push("/login")
                        }
                    }}
                    className="max-w-4xl"
                />
            </div>

            {/* Policy Section Directly Embedded in Home Page */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="w-full max-w-4xl z-10 mt-16 pb-16"
            >
                <div className="w-full bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-[#1b4332]/5 border border-[#2d6a4f]/10 relative overflow-hidden group hover:shadow-3xl transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1b4332] via-[#c5a059] to-[#1b4332] opacity-80" />
                    <FileText className="absolute -right-8 -bottom-8 w-48 h-48 text-[#2d6a4f]/5 pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-[#e8f0eb] p-3 rounded-xl border border-[#c5a059]/20">
                                <Shield className="w-6 h-6 text-[#2d6a4f]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#1b4332]">IT Services Policy</h2>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4 animate-pulse pt-4">
                                <div className="h-4 bg-slate-200 rounded w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                            </div>
                        ) : error || data?.error ? (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-600">
                                <Lock className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                                <p className="text-sm">Unable to load the latest policy at this moment.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data?.policy?.map((paragraph: string, idx: number) => (
                                    <p key={idx} className="text-slate-600 leading-relaxed text-base tracking-wide text-justify">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Subtle Side Ornaments */}
            <div className="hidden lg:block fixed left-10 top-1/2 -translate-y-1/2 space-y-12 opacity-20 z-0">
                <Leaf className="w-10 h-10 text-[#2d6a4f]" />
                <Zap className="w-8 h-8 text-[#c5a059] ml-6" />
            </div>
            <div className="hidden lg:block fixed right-10 top-1/2 -translate-y-1/2 space-y-12 opacity-20 z-0 flex flex-col items-end text-right">
                <Shield className="w-10 h-10 text-[#1b4332]" />
                <Globe className="w-8 h-8 text-[#c5a059] mr-6" />
            </div>

            {/* Premium Bottom Bar Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#1b4332] via-[#c5a059] to-[#1b4332] opacity-20" />
        </main>
    );
}
