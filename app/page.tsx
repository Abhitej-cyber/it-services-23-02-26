import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

            <div className="z-10 text-center space-y-8">
                <h1 className="text-6xl font-bold tracking-tight text-primary sm:text-7xl">
                    IT Services
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground mx-auto">
                    Advanced Asset & Service Management System for Modern Institutions.
                    Streamline operations, track assets, and manage requests efficiently.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Login to Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                </div>
            </div>
        </main>
    );
}
