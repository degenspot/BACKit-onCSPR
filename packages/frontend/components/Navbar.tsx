'use client';

import { useCasperWallet } from './CasperWalletContext';
import Link from 'next/link';

export function Navbar() {
    const { isConnected, activePublicKey, requestConnection, disconnectFromSite } = useCasperWallet();

    const handleConnect = () => {
        requestConnection();
    };

    const handleDisconnect = () => {
        disconnectFromSite();
    };

    return (
        <div className="flex justify-between items-center py-4 px-6 bg-white shadow-sm mb-8">
            <Link href="/feed" className="text-xl font-bold text-indigo-600">Back It (Onchain)</Link>
            <div className="flex items-center gap-4">
                {!isConnected || !activePublicKey ? (
                    <button
                        onClick={handleConnect}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Connect Wallet
                    </button>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="font-medium text-sm">
                                {`${activePublicKey.slice(0, 6)}...${activePublicKey.slice(-4)}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Casper
                            </span>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
