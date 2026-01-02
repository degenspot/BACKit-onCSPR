"use client";

import { AppLayout } from "@/components/AppLayout";
import { Bell, UserPlus, Heart, MessageSquare, TrendingUp } from 'lucide-react';

export default function ActivityPage() {
    const RightSidebar = (
        <div className="bg-secondary/20 rounded-xl p-6 border border-border">
            <h3 className="font-bold text-lg mb-2">Activity Feed</h3>
            <p className="text-sm text-muted-foreground">
                Stay updated on your calls, stakes, and followers.
            </p>
        </div>
    );

    return (
        <AppLayout rightSidebar={RightSidebar}>
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6 px-2">Activity</h1>

                <div className="space-y-4">
                    <NotificationItem
                        icon={<UserPlus className="h-5 w-5 text-blue-500" />}
                        title="New Follower"
                        description="VitalikFan started following you"
                        time="2m ago"
                    />
                    <NotificationItem
                        icon={<Heart className="h-5 w-5 text-red-500" />}
                        title="New Like"
                        description="CryptoWhale liked your prediction on ETH"
                        time="15m ago"
                    />
                    <NotificationItem
                        icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                        title="Prediction Trending"
                        description="Your call 'SOL flipping BNB' is trending!"
                        time="1h ago"
                    />
                    <NotificationItem
                        icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
                        title="New Comment"
                        description="SatoshiGhost commented: 'Great analysis!'"
                        time="3h ago"
                    />
                    <NotificationItem
                        icon={<UserPlus className="h-5 w-5 text-blue-500" />}
                        title="New Follower"
                        description="AlphaHunter started following you"
                        time="5h ago"
                    />
                    <NotificationItem
                        icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                        title="Stake Matched"
                        description="Someone staked 50 USDC against your position"
                        time="1d ago"
                    />
                </div>
            </div>
        </AppLayout>
    );
}

function NotificationItem({ icon, title, description, time }: { icon: React.ReactNode; title: string; description: string; time: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <div className="mt-1 p-2 rounded-full bg-secondary">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm">{title}</h3>
                    <span className="text-xs text-muted-foreground">{time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
