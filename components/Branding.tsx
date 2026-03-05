import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandingProps {
    text: string;
    image: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    xs: "gap-2 h-8",
    sm: "gap-2 h-10",
    md: "gap-3 h-12",
    lg: "gap-3 h-14",
    xl: "gap-4 h-16",
};

const imgSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
};

export function Branding({ text, image, size = "md", className }: BrandingProps) {
    const sizeKey = (size || "md") as keyof typeof sizeClasses;

    return (
        <div className={cn("flex items-center", sizeClasses[sizeKey], className)}>
            <Image
                src={image}
                alt="Brand Logo"
                width={imgSizes[sizeKey]}
                height={imgSizes[sizeKey]}
                className="object-contain"
                priority
            />
            <span className="font-black text-slate-900 whitespace-nowrap">
                {text}
            </span>
        </div>
    );
}
