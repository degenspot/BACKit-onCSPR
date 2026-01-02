"use client";

import { AppLayout } from "@/components/AppLayout";
import { Search, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from "next/link";

export default function ExplorePage() {
    const RightSidebar = (
        <div className="space-y-6">
            <div>
                <h3 className="font-bold text-lg mb-4">Who to follow</h3>
                <div className="space-y-4">
                    <SuggestedUser name="VitalikButerin" handle="@vitalik" />
                    <SuggestedUser name="Brian Armstrong" handle="@brian_armstrong" />
                    <SuggestedUser name="Jesse Pollak" handle="@jessepollak" />
                </div>
            </div>
        </div>
    );

    return (
        <AppLayout rightSidebar={RightSidebar}>
            <div className="p-4">
                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search markets, users, or tags..."
                        className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>

                {/* Trending Topics */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Trending Topics
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <TopicCard topic="Ethereum ETF" calls="1.2k" />
                        <TopicCard topic="Base L2" calls="850" />
                        <TopicCard topic="Solana Memes" calls="3.4k" />
                        <TopicCard topic="US Election" calls="5.6k" />
                    </div>
                </section>

                {/* Suggested Markets */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Suggested Markets</h2>
                    <div className="space-y-3">
                        <SuggestedMarket
                            title="Bitcoin to break $100k in 2025"
                            volume="$2.5M"
                            change="+12%"
                        />
                        <SuggestedMarket
                            title="Farcaster to reach 1M DAU"
                            volume="$500k"
                            change="+5%"
                        />
                        <SuggestedMarket
                            title="Coinbase stock (COIN) > $300"
                            volume="$1.2M"
                            change="-2%"
                        />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

function TopicCard({ topic, calls }: { topic: string; calls: string }) {
    return (
        <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 cursor-pointer transition-colors group">
            <h3 className="font-bold group-hover:text-primary transition-colors">{topic}</h3>
            <p className="text-sm text-muted-foreground">{calls} calls</p>
        </div>
    );
}

function SuggestedMarket({ title, volume, change }: { title: string; volume: string; change: string }) {
    const isPositive = change.startsWith('+');
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-secondary/30 cursor-pointer transition-colors">
            <div>
                <h3 className="font-medium mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">Vol: {volume}</p>
            </div>
            <div className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change}
            </div>
        </div>
    );
}

function SuggestedUser({ name, handle }: { name: string; handle: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                    {name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{handle}</p>
                </div>
            </div>
            <button className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors">
                Follow
            </button>
        </div>
    );
}
