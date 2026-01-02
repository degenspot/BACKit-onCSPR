import { TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    size?: "default" | "xl";
}

export function Logo({ className, size = "default" }: LogoProps) {
    return (
        <div className={cn("flex items-center gap-2 font-bold", className)}>
            <div className={cn(
                "bg-primary text-primary-foreground rounded-lg flex items-center justify-center",
                size === "default" ? "h-8 w-8" : "h-12 w-12"
            )}>
                <TrendingUp className={cn(
                    size === "default" ? "h-5 w-5" : "h-7 w-7"
                )} />
            </div>
            <span className={cn(
                "tracking-tight",
                size === "default" ? "text-xl" : "text-3xl"
            )}>
                BackIT
            </span>
        </div>
    );
}
