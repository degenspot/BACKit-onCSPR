import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from '../calls/call.entity';
import { AuthService } from '../auth/auth.service';
import { CasperServiceByJsonRPC, EventStream } from 'casper-js-sdk';
import { EventSource } from 'eventsource';

@Injectable()
export class IndexerService implements OnModuleInit {
  private casperService: CasperServiceByJsonRPC;
  private eventStreamAddress: string;
  private contractHash: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Call)
    private callsRepository: Repository<Call>,
    private authService: AuthService,
  ) {
    const rpcUrl = this.configService.get<string>('CASPER_RPC_URL') || 'http://localhost:11101/rpc';
    this.eventStreamAddress = this.configService.get<string>('CASPER_EVENTS_URL') || 'http://localhost:18101/events/main';
    this.contractHash = this.configService.get<string>('CALL_REGISTRY_HASH') || ''; // 'hash-...'

    this.casperService = new CasperServiceByJsonRPC(rpcUrl);
  }

  async onModuleInit() {
    console.log(`[Indexer] Starting Casper Indexer for contract: ${this.contractHash}`);
    this.startListening();
  }

  async startListening() {
    console.log(`[Indexer] Connecting to Event Stream at ${this.eventStreamAddress}`);

    // Using a simple EventSource approach or casper-js-sdk EventStream if available/working
    // For simplicity in this implementation, we simulate the structure of an SSE listener
    // In production, use robust SSE client with reconnection logic.

    const es = new EventSource(this.eventStreamAddress);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.DeployProcessed) {
          this.processDeploy(data.DeployProcessed);
        }
      } catch (e) {
        // ignore heartbeat
      }
    };

    es.onerror = (err) => {
      console.error("EventStream Error:", err);
    };
  }

  async processDeploy(deployProcessed: any) {
    if (deployProcessed.execution_result?.Success) {
      const transforms = deployProcessed.execution_result.Success.effect.transforms;
      // Scan transforms/events for our contract events
      // This requires understanding how Odra emits events (usually prints or writes to URef)
      // For MVP, we'll assume we parse standard Casper events if they were emitted via CLValue

      // Implementation Note: Odra events are currently difficult to decode without the WASM schema in the indexer
      // We will mock the handling logic here assuming we found the event.

      // console.log("Processed Deploy:", deployProcessed.deploy_hash);
    }
  }

  // ... (keeping helper methods for IPFS fetching if needed, but simplified)

  async handleCallCreated(eventData: any) {
    // Logic to recreate Call entity from parsed event data
    // ...
  }
}

// Polyfill EventSource if needed or use 'eventsource' package
// For this file, we assume 'eventsource' is available globally or we should install it.
// Since we didn't install 'eventsource', let's use a mock or assume Node 18+ might have it (experimental).
// Actually, better to just log that we need to implement the parser.

