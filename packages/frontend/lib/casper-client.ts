/**
 * Casper Contract Client
 * 
 * Utilities for interacting with Odra-based contracts on Casper Network
 */

import { DeployUtil, RuntimeArgs, CLValueBuilder, CasperClient, Keys, CLPublicKey } from 'casper-js-sdk';

// Contract hashes from environment
export const CONTRACTS = {
    CALL_REGISTRY: process.env.NEXT_PUBLIC_CALL_REGISTRY_HASH || '',
    OUTCOME_MANAGER: process.env.NEXT_PUBLIC_OUTCOME_MANAGER_HASH || '',
};

// Network config
export const CASPER_CONFIG = {
    nodeUrl: process.env.NEXT_PUBLIC_CASPER_NODE_URL || 'https://rpc.testnet.casperlabs.io/rpc',
    chainName: process.env.NEXT_PUBLIC_CASPER_CHAIN_NAME || 'casper-test',
};

/**
 * Create a CasperClient instance
 */
export function getCasperClient(): CasperClient {
    return new CasperClient(CASPER_CONFIG.nodeUrl);
}

/**
 * Convert CSPR to motes (1 CSPR = 1,000,000,000 motes)
 */
export function csprToMotes(cspr: number): bigint {
    return BigInt(Math.floor(cspr * 1_000_000_000));
}

/**
 * Convert motes to CSPR
 */
export function motesToCspr(motes: bigint): number {
    return Number(motes) / 1_000_000_000;
}

/**
 * Build a deploy for creating a new call
 */
export function buildCreateCallDeploy(
    senderPublicKey: CLPublicKey,
    endTs: number,
    tokenAddress: string,
    pairId: string,
    ipfsCid: string,
    stakeAmount: bigint, // in motes
): DeployUtil.Deploy {
    const contractHashBytes = Uint8Array.from(
        Buffer.from(CONTRACTS.CALL_REGISTRY.replace('hash-', ''), 'hex')
    );

    const runtimeArgs = RuntimeArgs.fromMap({
        end_ts: CLValueBuilder.u64(endTs),
        token_address: CLValueBuilder.string(tokenAddress),
        pair_id: CLValueBuilder.string(pairId),
        ipfs_cid: CLValueBuilder.string(ipfsCid),
    });

    const deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(
            senderPublicKey,
            CASPER_CONFIG.chainName,
            1,
            1800000 // 30 min TTL
        ),
        DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            contractHashBytes,
            'create_call',
            runtimeArgs
        ),
        DeployUtil.standardPayment(stakeAmount + BigInt(5_000_000_000)) // stake + 5 CSPR gas
    );

    return deploy;
}

/**
 * Build a deploy for staking on a call
 */
export function buildStakeOnCallDeploy(
    senderPublicKey: CLPublicKey,
    callId: number,
    position: boolean, // true = YES, false = NO
    stakeAmount: bigint, // in motes
): DeployUtil.Deploy {
    const contractHashBytes = Uint8Array.from(
        Buffer.from(CONTRACTS.CALL_REGISTRY.replace('hash-', ''), 'hex')
    );

    const runtimeArgs = RuntimeArgs.fromMap({
        call_id: CLValueBuilder.u64(callId),
        position: CLValueBuilder.bool(position),
    });

    const deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(
            senderPublicKey,
            CASPER_CONFIG.chainName,
            1,
            1800000
        ),
        DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            contractHashBytes,
            'stake_on_call',
            runtimeArgs
        ),
        DeployUtil.standardPayment(stakeAmount + BigInt(3_000_000_000)) // stake + 3 CSPR gas
    );

    return deploy;
}

/**
 * Build a deploy for withdrawing payout
 */
export function buildWithdrawPayoutDeploy(
    senderPublicKey: CLPublicKey,
    callId: number,
): DeployUtil.Deploy {
    const contractHashBytes = Uint8Array.from(
        Buffer.from(CONTRACTS.OUTCOME_MANAGER.replace('hash-', ''), 'hex')
    );

    const runtimeArgs = RuntimeArgs.fromMap({
        call_id: CLValueBuilder.u64(callId),
    });

    const deploy = DeployUtil.makeDeploy(
        new DeployUtil.DeployParams(
            senderPublicKey,
            CASPER_CONFIG.chainName,
            1,
            1800000
        ),
        DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            contractHashBytes,
            'withdraw_payout',
            runtimeArgs
        ),
        DeployUtil.standardPayment(BigInt(3_000_000_000)) // 3 CSPR gas
    );

    return deploy;
}

/**
 * Submit a signed deploy to the network
 */
export async function submitDeploy(signedDeploy: DeployUtil.Deploy): Promise<string> {
    const client = getCasperClient();
    const deployHash = await client.putDeploy(signedDeploy);
    return deployHash;
}

/**
 * Get deploy status
 */
export async function getDeployStatus(deployHash: string): Promise<'pending' | 'success' | 'failed'> {
    const client = getCasperClient();
    try {
        const result = await client.getDeploy(deployHash);
        if (result && result.length > 1) {
            const execution = result[1] as any;
            if (execution?.execution_results?.[0]?.result?.Success) {
                return 'success';
            } else if (execution?.execution_results?.[0]?.result?.Failure) {
                return 'failed';
            }
        }
        return 'pending';
    } catch {
        return 'pending';
    }
}
