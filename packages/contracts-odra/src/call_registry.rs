//! Call Registry Contract
//! 
//! Manages prediction calls where users stake CSPR on outcomes.
//! Uses flat storage pattern for on-chain compatibility.

use odra::prelude::*;
use odra::casper_types::{U256, U512};

/// Event emitted when a new call is created
#[odra::event]
pub struct CallCreated {
    pub call_id: u64,
    pub creator: Address,
    pub stake_amount: U512,
    pub start_ts: u64,
    pub end_ts: u64,
    pub token_address: String,
    pub pair_id: String,
    pub ipfs_cid: String,
}

/// Event emitted when a user stakes on a call
#[odra::event]
pub struct StakeAdded {
    pub call_id: u64,
    pub staker: Address,
    pub position: bool,  // true = YES, false = NO
    pub amount: U512,
}

/// The Call Registry contract
/// Using flat storage pattern (separate Mappings for each field)
#[odra::module(events = [CallCreated, StakeAdded])]
pub struct CallRegistry {
    // Counter for call IDs
    next_call_id: Var<u64>,
    
    // Call fields stored separately
    call_creators: Mapping<u64, Address>,
    call_total_stake_yes: Mapping<u64, U512>,
    call_total_stake_no: Mapping<u64, U512>,
    call_start_ts: Mapping<u64, u64>,
    call_end_ts: Mapping<u64, u64>,
    call_token_address: Mapping<u64, String>,
    call_pair_id: Mapping<u64, String>,
    call_ipfs_cid: Mapping<u64, String>,
    call_settled: Mapping<u64, bool>,
    call_outcome: Mapping<u64, bool>,
    call_final_price: Mapping<u64, U256>,
    
    // User stakes: (call_id, user) -> amount
    user_stakes_yes: Mapping<(u64, Address), U512>,
    user_stakes_no: Mapping<(u64, Address), U512>,
}

#[odra::module]
impl CallRegistry {
    /// Initialize the contract
    pub fn init(&mut self) {
        self.next_call_id.set(0);
    }

    /// Create a new prediction call
    /// The caller must send CSPR as the initial stake (backs YES position)
    #[odra(payable)]
    pub fn create_call(
        &mut self,
        end_ts: u64,
        token_address: String,
        pair_id: String,
        ipfs_cid: String,
    ) {
        let stake_amount = self.env().attached_value();
        let caller = self.env().caller();
        let current_time = self.env().get_block_time();

        // Validate inputs
        assert!(end_ts > current_time, "End time must be in future");
        assert!(stake_amount > U512::zero(), "Stake amount must be > 0");

        let call_id = self.next_call_id.get_or_default();
        
        // Store call data
        self.call_creators.set(&call_id, caller);
        self.call_total_stake_yes.set(&call_id, stake_amount);
        self.call_total_stake_no.set(&call_id, U512::zero());
        self.call_start_ts.set(&call_id, current_time);
        self.call_end_ts.set(&call_id, end_ts);
        self.call_token_address.set(&call_id, token_address.clone());
        self.call_pair_id.set(&call_id, pair_id.clone());
        self.call_ipfs_cid.set(&call_id, ipfs_cid.clone());
        self.call_settled.set(&call_id, false);
        self.call_outcome.set(&call_id, false);
        self.call_final_price.set(&call_id, U256::zero());
        
        // Record user stake
        self.user_stakes_yes.set(&(call_id, caller), stake_amount);
        
        // Increment counter
        self.next_call_id.set(call_id + 1);

        self.env().emit_event(CallCreated {
            call_id,
            creator: caller,
            stake_amount,
            start_ts: current_time,
            end_ts,
            token_address,
            pair_id,
            ipfs_cid,
        });
    }

    /// Stake on an existing call
    /// position: true = YES, false = NO
    #[odra(payable)]
    pub fn stake_on_call(&mut self, call_id: u64, position: bool) {
        let amount = self.env().attached_value();
        let caller = self.env().caller();
        let current_time = self.env().get_block_time();

        // Check call exists
        let creator = self.call_creators.get(&call_id);
        assert!(creator.is_some(), "Call does not exist");
        
        let end_ts = self.call_end_ts.get(&call_id).unwrap_or(0);
        let settled = self.call_settled.get(&call_id).unwrap_or(false);
        
        assert!(current_time < end_ts, "Call ended");
        assert!(!settled, "Call already settled");
        assert!(amount > U512::zero(), "Amount must be > 0");

        if position {
            let current_total = self.call_total_stake_yes.get(&call_id).unwrap_or_default();
            self.call_total_stake_yes.set(&call_id, current_total + amount);
            
            let current_user = self.user_stakes_yes.get(&(call_id, caller)).unwrap_or_default();
            self.user_stakes_yes.set(&(call_id, caller), current_user + amount);
        } else {
            let current_total = self.call_total_stake_no.get(&call_id).unwrap_or_default();
            self.call_total_stake_no.set(&call_id, current_total + amount);
            
            let current_user = self.user_stakes_no.get(&(call_id, caller)).unwrap_or_default();
            self.user_stakes_no.set(&(call_id, caller), current_user + amount);
        }

        self.env().emit_event(StakeAdded {
            call_id,
            staker: caller,
            position,
            amount,
        });
    }

    /// Get call creator
    pub fn get_call_creator(&self, call_id: u64) -> Option<Address> {
        self.call_creators.get(&call_id)
    }

    /// Get total stake for YES position
    pub fn get_total_stake_yes(&self, call_id: u64) -> U512 {
        self.call_total_stake_yes.get(&call_id).unwrap_or_default()
    }

    /// Get total stake for NO position
    pub fn get_total_stake_no(&self, call_id: u64) -> U512 {
        self.call_total_stake_no.get(&call_id).unwrap_or_default()
    }

    /// Get call end time
    pub fn get_end_ts(&self, call_id: u64) -> u64 {
        self.call_end_ts.get(&call_id).unwrap_or(0)
    }

    /// Check if call is settled
    pub fn is_call_settled(&self, call_id: u64) -> bool {
        self.call_settled.get(&call_id).unwrap_or(false)
    }

    /// Get user stake for a specific position
    pub fn get_user_stake(&self, call_id: u64, user: Address, position: bool) -> U512 {
        if position {
            self.user_stakes_yes.get(&(call_id, user)).unwrap_or_default()
        } else {
            self.user_stakes_no.get(&(call_id, user)).unwrap_or_default()
        }
    }

    /// Get the next call ID
    pub fn get_next_call_id(&self) -> u64 {
        self.next_call_id.get_or_default()
    }

    /// Mark a call as settled
    pub fn settle_call(&mut self, call_id: u64, outcome: bool, final_price: U256) {
        let settled = self.call_settled.get(&call_id).unwrap_or(true);
        assert!(!settled, "Already settled");
        
        self.call_settled.set(&call_id, true);
        self.call_outcome.set(&call_id, outcome);
        self.call_final_price.set(&call_id, final_price);
    }

    /// Get call outcome (only valid if settled)
    pub fn get_outcome(&self, call_id: u64) -> bool {
        self.call_outcome.get(&call_id).unwrap_or(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use odra::host::{Deployer, HostRef, NoArgs};

    #[test]
    fn test_create_call() {
        let env = odra_test::env();
        let mut registry = CallRegistry::deploy(&env, NoArgs);
        
        // Create a call with 100 CSPR stake
        let end_ts = env.block_time() + 3600; // 1 hour from now
        registry
            .with_tokens(U512::from(100_000_000_000u64)) // 100 CSPR
            .create_call(
                end_ts,
                "0xTokenAddress".to_string(),
                "token_usdt".to_string(),
                "QmTestCID".to_string(),
            );

        assert_eq!(registry.get_next_call_id(), 1);
        assert_eq!(registry.get_total_stake_yes(0), U512::from(100_000_000_000u64));
        assert_eq!(registry.get_total_stake_no(0), U512::zero());
        assert!(!registry.is_call_settled(0));
    }

    #[test]
    fn test_stake_on_call() {
        let env = odra_test::env();
        let mut registry = CallRegistry::deploy(&env, NoArgs);
        
        let end_ts = env.block_time() + 3600;
        registry
            .with_tokens(U512::from(100_000_000_000u64))
            .create_call(
                end_ts,
                "0xToken".to_string(),
                "pair_1".to_string(),
                "QmCID".to_string(),
            );

        // Second user stakes NO
        let user2 = env.get_account(1);
        env.set_caller(user2);
        registry
            .with_tokens(U512::from(50_000_000_000u64))
            .stake_on_call(0, false);

        assert_eq!(registry.get_total_stake_yes(0), U512::from(100_000_000_000u64));
        assert_eq!(registry.get_total_stake_no(0), U512::from(50_000_000_000u64));
    }
    
    #[test]
    fn test_settle_call() {
        let env = odra_test::env();
        let mut registry = CallRegistry::deploy(&env, NoArgs);
        
        let end_ts = env.block_time() + 3600;
        registry
            .with_tokens(U512::from(100_000_000_000u64))
            .create_call(
                end_ts,
                "0xToken".to_string(),
                "pair_1".to_string(),
                "QmCID".to_string(),
            );
        
        // Settle the call
        registry.settle_call(0, true, U256::from(1500));
        
        assert!(registry.is_call_settled(0));
        assert!(registry.get_outcome(0));
    }
}
