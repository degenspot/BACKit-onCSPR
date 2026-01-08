"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const OnboardingContent = dynamic(
    () => import('@/components/OnboardingContent').then(mod => mod.OnboardingContent),
    {
        ssr: false,
        loading: () => (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }
);

export default function OnboardingPage() {
    return <OnboardingContent />;
}


