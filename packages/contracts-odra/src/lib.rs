//! Back It (Onchain) - Casper Smart Contracts
//!
//! A prediction marketplace built on Casper Network using Odra framework.

#![cfg_attr(target_arch = "wasm32", no_std)]

pub mod call_registry;
pub mod outcome_manager;

pub use call_registry::CallRegistry;
pub use outcome_manager::OutcomeManager;
