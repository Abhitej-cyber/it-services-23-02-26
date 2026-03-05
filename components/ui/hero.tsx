import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroProps {
    headline?: {
        line1: string;
        line2: string;
    };
    title?: string;
    subtitle?: string;
    description?: string;
    buttons?: {
        primary?: {
            text: string;
            onClick: () => void;
        };
        secondary?: {
            text: string;
            onClick: () => void;
        };
    };
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
}

export function Hero({
    headline,
    title,
    subtitle,
    description,
    buttons,
    children,
    className,
    contentClassName,
}: HeroProps) {
    return (
        <section
            className={cn(
                "relative w-full py-12 md:py-24 lg:py-32 flex items-center justify-center overflow-hidden",
                className
            )}
        >
            <div
                className={cn(
                    "max-w-[1200px] mx-auto text-center space-y-6 px-4 sm:px-6 lg:px-8",
                    contentClassName
                )}
            >
                {headline && (
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight">
                        <div>{headline.line1}</div>
                        <div className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-500 to-blue-600">
                            {headline.line2}
                        </div>
                    </h1>
                )}
                {title && (
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">
                        {title}
                    </h1>
                )}
                {(subtitle || description) && (
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
                        {subtitle || description}
                    </p>
                )}
                {buttons && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                        {buttons.primary && (
                            <button
                                onClick={buttons.primary.onClick}
                                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                            >
                                {buttons.primary.text}
                            </button>
                        )}
                        {buttons.secondary && (
                            <button
                                onClick={buttons.secondary.onClick}
                                className="px-8 py-3 border-2 border-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                            >
                                {buttons.secondary.text}
                            </button>
                        )}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}
