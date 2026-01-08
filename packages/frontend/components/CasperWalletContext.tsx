'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of the window object with CasperWalletProvider
declare global {
    interface Window {
        CasperWalletProvider?: (options: { timeout: number }) => any;
        CasperWalletEventTypes?: {
            Connected: string;
            Disconnected: string;
            ActiveKeyChanged: string;
            TabChanged: string;
            Locked: string;
            Unlocked: string;
        };
    }
}

interface CasperWalletContextType {
    isConnected: boolean;
    activePublicKey: string | null;
    requestConnection: () => Promise<void>;
    disconnectFromSite: () => Promise<void>;
    sign: (deployJson: string, publicKey: string) => Promise<any>;
}

const CasperWalletContext = createContext<CasperWalletContextType | undefined>(undefined);

// Timeout (in ms) for requests to the extension [DEFAULT: 30 min]
const REQUESTS_TIMEOUT_MS = 30 * 60 * 1000;

export function CasperWalletProvider({ children }: { children: React.ReactNode }) {
    const [provider, setProvider] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activePublicKey, setActivePublicKey] = useState<string | null>(null);

    // Initialize provider
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const CasperWalletProvider = window.CasperWalletProvider;
            if (CasperWalletProvider) {
                const walletProvider = CasperWalletProvider({
                    timeout: REQUESTS_TIMEOUT_MS
                });
                setProvider(walletProvider);
            } else {
                console.log("Casper Wallet extension is not installed!");
            }
        }
    }, []);

    // Check connection and listen for events
    useEffect(() => {
        if (!provider) return;

        const checkConnection = async () => {
            try {
                const connected = await provider.isConnected();
                if (connected) {
                    setIsConnected(true);
                    const publicKey = await provider.getActivePublicKey();
                    setActivePublicKey(publicKey);
                }
            } catch (err) {
                console.error("Failed to check connection:", err);
            }
        };

        checkConnection();

        // Event listeners handling could be added here if needed to react to external changes
        // provider.on(window.CasperWalletEventTypes.Connected, ...);

    }, [provider]);

    const requestConnection = async () => {
        if (!provider) {
            alert("Casper Wallet extension is not installed! Please install it first.");
            window.open('https://www.casperwallet.io/', '_blank');
            return;
        }

        try {
            const connected = await provider.requestConnection();
            if (connected) {
                setIsConnected(true);
                const publicKey = await provider.getActivePublicKey();
                setActivePublicKey(publicKey);
            } else {
                alert("Connection denied by user");
            }
        } catch (error: any) {
            console.error("Connection error:", error);
            alert(error.message || "Failed to connect to wallet");
        }
    };

    const disconnectFromSite = async () => {
        if (!provider) return;

        try {
            const disconnected = await provider.disconnectFromSite();
            if (disconnected) {
                setIsConnected(false);
                setActivePublicKey(null);
            }
        } catch (error: any) {
            console.error("Disconnect error:", error);
        }
    };

    const sign = async (deployJson: string, publicKey: string) => {
        if (!provider) throw new Error("Provider not initialized");
        return await provider.sign(deployJson, publicKey);
    };

    return (
        <CasperWalletContext.Provider
            value={{
                isConnected,
                activePublicKey,
                requestConnection,
                disconnectFromSite,
                sign
            }}
        >
            {children}
        </CasperWalletContext.Provider>
    );
}

export function useCasperWallet() {
    const context = useContext(CasperWalletContext);
    if (context === undefined) {
        throw new Error('useCasperWallet must be used within a CasperWalletProvider');
    }
    return context;
}
