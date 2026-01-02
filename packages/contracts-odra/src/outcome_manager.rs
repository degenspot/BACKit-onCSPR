//! Outcome Manager Contract
//! 
//! Handles oracle signature verification, outcome submission, and payout distribution.

use odra::prelude::*;
use odra::casper_types::{U256, U512};

/// Event emitted when an outcome is submitted by the oracle
#[odra::event]
pub struct OutcomeSubmitted {
    pub call_id: u64,
    pub outcome: bool,
    pub final_price: U256,
    pub oracle: Address,
}

/// Event emitted when a user withdraws their payout
#[odra::event]
pub struct PayoutWithdrawn {
    pub call_id: u64,
    pub recipient: Address,
    pub amount: U512,
}

/// The Outcome Manager contract
#[odra::module(events = [OutcomeSubmitted, PayoutWithdrawn])]
pub struct OutcomeManager {
    /// Address of the CallRegistry contract
    registry: Var<Address>,
    /// Authorized oracle addresses
    authorized_oracles: Mapping<Address, bool>,
    /// Track which calls have been settled
    settled: Mapping<u64, bool>,
    /// Store outcomes: call_id -> outcome (bool)
    outcome_results: Mapping<u64, bool>,
    /// Store final prices: call_id -> final_price
    final_prices: Mapping<u64, U256>,
    /// Track who has withdrawn: (call_id, user) -> bool
    withdrawn: Mapping<(u64, Address), bool>,
    /// Owner for admin functions
    owner: Var<Address>,
}

#[odra::module]
impl OutcomeManager {
    /// Initialize the contract with registry address
    pub fn init(&mut self, registry: Address) {
        self.registry.set(registry);
        self.owner.set(self.env().caller());
    }

    /// Set oracle authorization (admin only)
    pub fn set_oracle(&mut self, oracle: Address, authorized: bool) {
        let caller = self.env().caller();
        let owner = self.owner.get().expect("Owner not set");
        assert!(caller == owner, "Only owner can set oracles");
        
        self.authorized_oracles.set(&oracle, authorized);
    }

    /// Submit an outcome for a call
    /// In production, this would verify a cryptographic signature
    /// For MVP, we trust the authorized oracle caller
    pub fn submit_outcome(
        &mut self,
        call_id: u64,
        outcome: bool,
        final_price: U256,
    ) {
        let caller = self.env().caller();
        
        // Verify caller is authorized oracle
        let is_authorized = self.authorized_oracles.get(&caller).unwrap_or(false);
        assert!(is_authorized, "Caller is not an authorized oracle");

        // Check not already settled
        let is_settled = self.settled.get(&call_id).unwrap_or(false);
        assert!(!is_settled, "Call already settled");

        // Mark as settled and store outcome
        self.settled.set(&call_id, true);
        self.outcome_results.set(&call_id, outcome);
        self.final_prices.set(&call_id, final_price);

        // Emit event
        self.env().emit_event(OutcomeSubmitted {
            call_id,
            outcome,
            final_price,
            oracle: caller,
        });
    }

    /// Withdraw payout for a settled call
    /// Note: This is a simplified implementation
    pub fn withdraw_payout(&mut self, call_id: u64) {
        let caller = self.env().caller();
        
        // Check call is settled
        let is_settled = self.settled.get(&call_id).unwrap_or(false);
        assert!(is_settled, "Call not yet settled");

        // Check not already withdrawn
        let has_withdrawn = self.withdrawn.get(&(call_id, caller)).unwrap_or(false);
        assert!(!has_withdrawn, "Already withdrawn");

        // Mark as withdrawn (actual payout logic would calculate shares)
        self.withdrawn.set(&(call_id, caller), true);

        // Note: Full payout implementation requires cross-contract calls to registry
        // or storing stake data in this contract
    }

    /// Check if a call is settled
    pub fn is_settled(&self, call_id: u64) -> bool {
        self.settled.get(&call_id).unwrap_or(false)
    }

    /// Get outcome for a call (returns false if not settled)
    pub fn get_outcome(&self, call_id: u64) -> bool {
        self.outcome_results.get(&call_id).unwrap_or(false)
    }

    /// Get final price for a call
    pub fn get_final_price(&self, call_id: u64) -> U256 {
        self.final_prices.get(&call_id).unwrap_or_default()
    }

    /// Check if user has withdrawn
    pub fn has_withdrawn(&self, call_id: u64, user: Address) -> bool {
        self.withdrawn.get(&(call_id, user)).unwrap_or(false)
    }

    /// Check if an address is an authorized oracle
    pub fn is_oracle(&self, addr: Address) -> bool {
        self.authorized_oracles.get(&addr).unwrap_or(false)
    }

    /// Get owner address
    pub fn get_owner(&self) -> Option<Address> {
        self.owner.get()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::call_registry::CallRegistry;
    use odra::host::{Deployer, HostRef, NoArgs};

    #[test]
    fn test_oracle_authorization() {
        let env = odra_test::env();
        
        // Deploy registry first
        let registry = CallRegistry::deploy(&env, NoArgs);
        let registry_addr = registry.address().clone();
        
        // Deploy outcome manager with init args
        let mut manager = OutcomeManager::deploy(&env, OutcomeManagerInitArgs { 
            registry: registry_addr 
        });

        let oracle = env.get_account(1);
        
        // Initially not authorized
        assert!(!manager.is_oracle(oracle));
        
        // Authorize oracle
        manager.set_oracle(oracle, true);
        assert!(manager.is_oracle(oracle));
        
        // Revoke authorization
        manager.set_oracle(oracle, false);
        assert!(!manager.is_oracle(oracle));
    }

    #[test]
    fn test_submit_outcome() {
        let env = odra_test::env();
        
        let registry = CallRegistry::deploy(&env, NoArgs);
        let registry_addr = registry.address().clone();
        
        let mut manager = OutcomeManager::deploy(&env, OutcomeManagerInitArgs { 
            registry: registry_addr 
        });

        let oracle = env.get_account(1);
        manager.set_oracle(oracle, true);
        
        // Submit outcome as oracle
        env.set_caller(oracle);
        manager.submit_outcome(0, true, U256::from(1_500_000_000_000_000_000u128));
        
        assert!(manager.is_settled(0));
        assert!(manager.get_outcome(0));
        assert_eq!(manager.get_final_price(0), U256::from(1_500_000_000_000_000_000u128));
    }
}
