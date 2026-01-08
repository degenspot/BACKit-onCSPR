'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

import { CasperWalletProvider } from './CasperWalletContext';

// Keep others dynamic to avoid window errors in their own files if they have them
const GlobalStateProvider = dynamic(
    () => import('./GlobalState').then(mod => mod.GlobalStateProvider),
    { ssr: false }
);

const NetworkGuard = dynamic(
    () => import('./NetworkGuard').then(mod => mod.NetworkGuard),
    { ssr: false }
);

export function Providers(props: {
    children: ReactNode;
}) {
    return (
        <CasperWalletProvider>
            <NetworkGuard>
                <GlobalStateProvider>
                    {props.children}
                </GlobalStateProvider>
            </NetworkGuard>
        </CasperWalletProvider>
    );
}

