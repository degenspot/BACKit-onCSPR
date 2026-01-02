"use client";

import { AppLayout } from "@/components/AppLayout";
import { ArrowRight, Calendar, DollarSign, Target, Type } from 'lucide-react';
import { useState } from "react";
import { useGlobalState } from "@/components/GlobalState";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/Loader";

export default function CreatePage() {
    const { createCall, isLoading } = useGlobalState();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        thesis: '',
        asset: '',
        target: '',
        deadline: '',
        stake: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createCall({
            title: formData.title,
            thesis: formData.thesis,
            asset: formData.asset,
            target: formData.target,
            deadline: formData.deadline,
            stake: formData.stake
        });
        router.push('/feed');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.type === 'date' ? 'deadline' : (e.target.placeholder?.includes('Title') ? 'title' : e.target.placeholder?.includes('Thesis') ? 'thesis' : e.target.placeholder?.includes('Asset') ? 'asset' : e.target.placeholder?.includes('Target') ? 'target' : 'stake')]: e.target.value }));
    };

    // Helper to update state based on input name since I didn't add name attributes initially
    // Ideally we should add name attributes to inputs
    const handleInputChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const RightSidebar = (
        <div className="bg-secondary/20 rounded-xl p-6 border border-border">
            <h3 className="font-bold text-lg mb-2">How it works</h3>
            <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-4">
                <li>Create a prediction with a clear condition and deadline.</li>
                <li>Stake tokens to back your claim.</li>
                <li>Others can challenge your prediction by staking against it.</li>
                <li>The outcome is verified by our oracle network.</li>
                <li>Winners take the pool (minus fees).</li>
            </ul>
        </div>
    );

    return (
        <AppLayout rightSidebar={RightSidebar}>
            {isLoading && <Loader text="Creating Prediction Market..." />}
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">Create a Prediction</h1>
                    <p className="text-muted-foreground">Put your reputation onchain. Make a call.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Type className="h-4 w-4 text-primary" />
                            Prediction Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., ETH will flip BTC by 2025"
                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            required
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                        />
                    </div>

                    {/* Thesis */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Thesis (Optional)</label>
                        <textarea
                            placeholder="Why do you think this will happen?"
                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none transition-all"
                            value={formData.thesis}
                            onChange={(e) => handleInputChange('thesis', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Asset */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                Asset
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., ETH"
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                required
                                value={formData.asset}
                                onChange={(e) => handleInputChange('asset', e.target.value)}
                            />
                        </div>

                        {/* Target Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary" />
                                Target Price / Condition
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., $5,000"
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                required
                                value={formData.target}
                                onChange={(e) => handleInputChange('target', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Deadline */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Deadline
                            </label>
                            <input
                                type="date"
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                required
                                value={formData.deadline}
                                onChange={(e) => handleInputChange('deadline', e.target.value)}
                            />
                        </div>

                        {/* Stake Amount */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-primary" />
                                Your Stake (USDC)
                            </label>
                            <input
                                type="number"
                                placeholder="100"
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                required
                                value={formData.stake}
                                onChange={(e) => handleInputChange('stake', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                "Creating..."
                            ) : (
                                <>
                                    Create Prediction
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
