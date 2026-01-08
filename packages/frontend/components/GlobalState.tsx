"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCasperWallet } from './CasperWalletContext';

// ... inside GlobalStateProvider ...

const { activePublicKey, sign, isConnected } = useCasperWallet();

// ... inside updateProfile ...
// Replace clickRef.send with sign logic
// We need to construct the deploy and sign it

// For now, let's just make sure we are using the new context
// The actual deploy construction needs to happen here instead of relying on clickRef convenience methods if they existed.
// However, looking at the previous code, it seems we were using clickRef to sign.
// The native SDK sign method takes a deploy JSON string.

// We need to implement the actual deploy construction using casper-js-sdk if we haven't already.
// But first, let's swap the hook.

// ...

import { DeployUtil, CLValueBuilder, CLPublicKey, RuntimeArgs } from 'casper-js-sdk';

export interface Call {
    id: string; // callOnchainId
    title: string;
    thesis: string;
    asset: string;
    target: string;
    deadline: string;
    stake: string;
    creator: User;
    status: string;
    createdAt: string;
    backers: number;
    comments: number;
    volume: string;
    totalStakeYes: number;
    totalStakeNo: number;
    stakeToken: string;
    endTs: string;
    conditionJson?: any;
}

export interface User {
    wallet: string;
    displayName?: string;
    handle?: string;
    bio?: string;
    avatarCid?: string;
    avatar?: string; // Legacy UI
}

interface GlobalStateContextType {
    calls: Call[];
    createCall: (data: CreateCallData) => Promise<void>;
    stakeOnCall: (callId: string, amount: number, type: 'back' | 'challenge') => Promise<void>;
    currentUser: User | null;
    isLoading: boolean;
    login: () => Promise<void>;
    updateProfile: (data: { handle: string; bio: string }) => Promise<void>;
}

export interface CreateCallData {
    title: string;
    thesis: string;
    asset: string;
    target: string;
    deadline: string;
    stake: string;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: React.ReactNode }) {
    const [calls, setCalls] = useState<Call[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const { activePublicKey, isConnected } = useCasperWallet();

    const fetchCalls = async () => {
        try {
            const res = await fetch('http://localhost:3001/calls');
            if (!res.ok) throw new Error('Failed to fetch calls');
            const data = await res.json();

            // Map backend calls to frontend format
            const mappedCalls: Call[] = data.map((c: any) => ({
                id: c.callOnchainId || c.id.toString(),
                title: c.conditionJson?.title || "Call #" + (c.callOnchainId || c.id),
                thesis: c.conditionJson?.thesis || "Thesis for " + (c.pairId || "this call"),
                asset: c.pairId ? Buffer.from(c.pairId.replace('0x', ''), 'hex').toString().replace(/\0/g, '') : "Unknown",
                target: c.conditionJson?.target || "TBD",
                deadline: new Date(c.endTs).toLocaleDateString(),
                stake: `${c.totalStakeYes} ${c.stakeToken}`,
                creator: c.creator || { wallet: c.creatorWallet, handle: c.creatorWallet.slice(0, 6) },
                status: c.status || 'active',
                createdAt: c.createdAt,
                backers: 0,
                comments: 0,
                volume: `$${(Number(c.totalStakeYes || 0) + Number(c.totalStakeNo || 0)).toLocaleString()}`,
                totalStakeYes: Number(c.totalStakeYes || 0),
                totalStakeNo: Number(c.totalStakeNo || 0),
                stakeToken: c.stakeToken || 'CSPr',
                endTs: c.endTs,
                conditionJson: c.conditionJson
            }));

            setCalls(mappedCalls);
        } catch (error) {
            console.error("Failed to fetch calls:", error);
        }
    };

    const login = async () => {
        if (!activePublicKey) return;
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet: activePublicKey }),
            });
            const user = await res.json();
            setCurrentUser(user);
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: { handle: string; bio: string }) => {
        if (!currentUser || !activePublicKey) return;
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:3001/users/${activePublicKey}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update profile');
            const updatedUser = await res.json();
            setCurrentUser(updatedUser);
        } catch (error) {
            console.error("Update profile failed:", error);
            alert("Failed to update profile. Handle might be taken.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCalls();
    }, []);

    useEffect(() => {
        if (activePublicKey) {
            login();
        }
    }, [activePublicKey]);

    const createCall = async (newCallData: CreateCallData) => {
        if (!activePublicKey) {
            alert("Please connect wallet first");
            return;
        }
        setIsLoading(true);
        try {
            alert("Please sign the deployment in your wallet...");

            // 1. Upload Metadata (Mock)
            const metadata = {
                title: newCallData.title,
                thesis: newCallData.thesis,
                asset: newCallData.asset,
                target: newCallData.target,
                deadline: newCallData.deadline
            };

            const ipfsRes = await fetch('http://localhost:3001/calls/ipfs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata)
            });
            const { cid } = await ipfsRes.json();

            // 2. Mock Create Call Logic (using native context vars)
            // ...

            // Simulate network delay
            await new Promise(r => setTimeout(r, 2000));

            // Optimistic Update
            const newCall: Call = {
                id: 'optimistic-' + Math.random().toString(36).substr(2, 9),
                title: newCallData.title,
                thesis: newCallData.thesis,
                asset: newCallData.asset,
                target: newCallData.target,
                deadline: newCallData.deadline,
                stake: newCallData.stake,
                creator: currentUser!,
                status: 'active',
                createdAt: new Date().toISOString(),
                backers: 1,
                comments: 0,
                volume: `$${newCallData.stake}`,
                totalStakeYes: parseFloat(newCallData.stake.split(' ')[0]) || 0,
                totalStakeNo: 0,
                stakeToken: 'CSPR',
                endTs: new Date(newCallData.deadline).toISOString()
            };
            setCalls(prev => [newCall, ...prev]);

            // Refresh calls
            setTimeout(fetchCalls, 3000);

        } catch (error) {
            console.error("Failed to create call:", error);
            alert("Failed to create call. See console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    const stakeOnCall = async (callId: string, amount: number, type: 'back' | 'challenge') => {
        setIsLoading(true);
        try {
            alert("Please sign the staking deploy in your wallet...");
            // Simulate stake deploy
            console.log("Mocking Casper Deploy for Stake...", { callId, amount, type });

            await new Promise(r => setTimeout(r, 2000));

            setCalls(prev => prev.map(call => {
                if (call.id === callId) {
                    const currentVolume = parseFloat(call.volume.replace(/[^0-9.-]+/g, "")) || 0;
                    const newVolume = currentVolume + amount;
                    return {
                        ...call,
                        backers: call.backers + 1,
                        volume: `$${newVolume.toLocaleString()}`
                    };
                }
                return call;
            }));

        } catch (error) {
            console.error("Failed to stake:", error);
            alert("Failed to stake. See console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GlobalStateContext.Provider value={{ calls, createCall, stakeOnCall, currentUser, isLoading, login, updateProfile }}>
            {children}
        </GlobalStateContext.Provider>
    );
}

export function useGlobalState() {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
}
