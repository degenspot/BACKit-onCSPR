'use client';

import { ClickProvider } from '@make-software/csprclick-react';
import { ReactNode } from 'react';
import { GlobalStateProvider } from './GlobalState';
import { NetworkGuard } from './NetworkGuard';

const clickConfig = {
    appName: 'Back It (Onchain)',
    appId: 'back-it-onchain',
    providers: ['casper-wallet', 'ledger', 'metamask-snap'],
    contentMode: 'iframe', // or 'popup'
    theme: 'dark',
};

export function Providers(props: {
    children: ReactNode;
}) {
    return (
        <ClickProvider options={clickConfig}>
            <NetworkGuard>
                <GlobalStateProvider>
                    {props.children}
                </GlobalStateProvider>
            </NetworkGuard>
        </ClickProvider>
    );
}

