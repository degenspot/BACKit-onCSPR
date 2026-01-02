import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Keys, DeployUtil, RuntimeArgs, CLValueBuilder, CasperClient, CLPublicKey } from 'casper-js-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);
  private keyPair: Keys.AsymmetricKey | null = null;
  private casperClient: CasperClient;
  private chainName: string;
  private outcomeManagerHash: string | null = null;

  constructor(private configService: ConfigService) {
    // Initialize Casper client
    const nodeUrl = this.configService.get<string>('CASPER_NODE_URL', 'http://localhost:7777/rpc');
    this.casperClient = new CasperClient(nodeUrl);
    this.chainName = this.configService.get<string>('CASPER_CHAIN_NAME', 'casper-test');
    this.outcomeManagerHash = this.configService.get<string>('OUTCOME_MANAGER_HASH') || null;

    // Load oracle keys
    this.initializeKeys();
  }

  private initializeKeys() {
    const secretKeyPath = this.configService.get<string>('ORACLE_SECRET_KEY_PATH');

    if (secretKeyPath && fs.existsSync(secretKeyPath)) {
      try {
        // Try Ed25519 first
        try {
          this.keyPair = Keys.Ed25519.loadKeyPairFromPrivateFile(secretKeyPath);
        } catch (e) {
          // Fallback to Secp256K1
          this.keyPair = Keys.Secp256K1.loadKeyPairFromPrivateFile(secretKeyPath);
        }
        this.logger.log(`Oracle key loaded from ${secretKeyPath}`);
        this.logger.log(`Oracle public key: ${this.keyPair.publicKey.toHex()}`);
      } catch (e) {
        this.logger.error('Failed to load oracle key from file', e);
        this.keyPair = null;
      }
    } else {
      // For development, generate a new key
      this.keyPair = Keys.Ed25519.new();
      this.logger.warn('No secret key provided, using random key');
      this.logger.log(`Dev oracle public key: ${this.keyPair.publicKey.toHex()}`);
    }
  }

  /**
   * Get the oracle's public key (for authorization on contract)
   */
  getOraclePublicKey(): string | null {
    return this.keyPair?.publicKey.toHex() || null;
  }

  /**
   * Fetch price from DexScreener or similar API
   */
  async fetchPrice(tokenAddress: string, pairId: string): Promise<number> {
    this.logger.log(`Fetching price for ${tokenAddress} (pair: ${pairId})`);

    try {
      // Try DexScreener first
      const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/base/${pairId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.pair?.priceUsd) {
          const price = parseFloat(data.pair.priceUsd);
          this.logger.log(`Price fetched: $${price}`);
          return price;
        }
      }
    } catch (e) {
      this.logger.warn(`DexScreener fetch failed: ${e}`);
    }

    // Fallback to mock price for development
    this.logger.warn('Using mock price');
    return 1.0;
  }

  /**
   * Sign an outcome message using Ed25519
   * Message format: JSON { callId, outcome, finalPrice, timestamp }
   */
  signOutcome(
    callId: number,
    outcome: boolean,
    finalPrice: bigint,
    timestamp: number,
  ): Uint8Array {
    if (!this.keyPair) {
      throw new Error('Oracle signer not configured');
    }

    // Create a deterministic message to sign
    const message = JSON.stringify({
      callId,
      outcome,
      finalPrice: finalPrice.toString(),
      timestamp,
    });

    // Sign the message bytes
    const messageBytes = Buffer.from(message, 'utf-8');
    const signature = this.keyPair.sign(messageBytes);

    this.logger.log(`Signed outcome for call ${callId}: outcome=${outcome}, price=${finalPrice}`);
    return signature;
  }

  /**
   * Submit outcome to the OutcomeManager contract on Casper
   */
  async submitOutcome(
    callId: number,
    outcome: boolean,
    finalPrice: bigint,
    timestamp: number,
  ): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Oracle signer not configured');
    }

    if (!this.outcomeManagerHash) {
      throw new Error('OutcomeManager contract hash not configured');
    }

    // Build runtime args for submit_outcome
    const runtimeArgs = RuntimeArgs.fromMap({
      call_id: CLValueBuilder.u64(callId),
      outcome: CLValueBuilder.bool(outcome),
      final_price: CLValueBuilder.u256(finalPrice.toString()),
    });

    // Create the deploy
    const deploy = DeployUtil.makeDeploy(
      new DeployUtil.DeployParams(
        this.keyPair.publicKey,
        this.chainName,
        1,  // gas price
        1800000 // TTL 30 min
      ),
      DeployUtil.ExecutableDeployItem.newStoredContractByHash(
        Uint8Array.from(Buffer.from(this.outcomeManagerHash.replace('hash-', ''), 'hex')),
        'submit_outcome',
        runtimeArgs
      ),
      DeployUtil.standardPayment(5_000_000_000) // 5 CSPR
    );

    // Sign the deploy
    const signedDeploy = DeployUtil.signDeploy(deploy, this.keyPair);

    // Submit to network
    const deployHash = await this.casperClient.putDeploy(signedDeploy);
    this.logger.log(`Deploy submitted: ${deployHash}`);

    return deployHash;
  }

  /**
   * Check deploy status
   */
  async getDeployStatus(deployHash: string): Promise<string> {
    try {
      const result = await this.casperClient.getDeploy(deployHash);
      if (result && result.length > 1) {
        const execution = result[1];
        if (execution?.execution_results?.[0]?.result?.Success) {
          return 'success';
        } else if (execution?.execution_results?.[0]?.result?.Failure) {
          return 'failed';
        }
      }
      return 'pending';
    } catch (e) {
      return 'unknown';
    }
  }
}
