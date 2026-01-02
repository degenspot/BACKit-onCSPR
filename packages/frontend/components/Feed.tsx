'use client';

import { useState, useEffect } from 'react';

interface Call {
    id: number;
    tokenAddress: string;
    stakeAmount: string;
    targetPrice: string;
    endTs: string;
    creatorWallet: string;
}

export function Feed() {
    const [calls, setCalls] = useState<Call[]>([]);

    useEffect(() => {
        // Mock data for now
        const fetchCalls = async () => {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
            setCalls([
                {
                    id: 1,
                    tokenAddress: '0x420...69',
                    stakeAmount: '100',
                    targetPrice: '2000',
                    endTs: new Date(Date.now() + 86400000).toISOString(),
                    creatorWallet: '0x123...abc',
                },
                {
                    id: 2,
                    tokenAddress: '0x777...888',
                    stakeAmount: '500',
                    targetPrice: '0.50',
                    endTs: new Date(Date.now() + 172800000).toISOString(),
                    creatorWallet: '0xdef...456',
                },
            ]);
        };
        fetchCalls();
    }, []);

    return (
        <div className="space-y-4">
            {calls.map((call) => (
                <div key={call.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-500">
                            Created by <span className="font-mono text-indigo-600">{call.creatorWallet}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            Ends: {new Date(call.endTs).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Token: <span className="font-mono">{call.tokenAddress}</span>
                        </h3>
                        <p className="text-gray-600">
                            Target: <span className="font-bold">${call.targetPrice}</span>
                        </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="text-sm font-medium text-gray-900">
                            Stake: {call.stakeAmount} USDC
                        </div>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            View Details →
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
