'use client';

import { useClickRef } from '@make-software/csprclick-react';
import { useEffect, useState } from 'react';

export function NetworkGuard({ children }: { children: React.ReactNode }) {
    const clickRef = useClickRef();
    // In a real app, we might check if connected to Testnet vs Mainnet
    // clickRef?.activeAccount?.chainName

    // For now, we pass through as CSPR.click handles network selection in the wallet mostly
    return <>{children}</>;
}
