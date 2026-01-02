//! CLI tool to deploy and interact with Back It (Onchain) smart contracts.

use contracts_odra::{CallRegistry, OutcomeManager, outcome_manager::OutcomeManagerInitArgs};
use odra::host::{HostEnv, NoArgs};
use odra::prelude::Addressable;
use odra_cli::{
    deploy::DeployScript,
    DeployedContractsContainer, DeployerExt,
    OdraCli, 
};

/// Deploys the CallRegistry and OutcomeManager contracts.
pub struct BackItDeployScript;

impl DeployScript for BackItDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer
    ) -> Result<(), odra_cli::deploy::Error> {
        // 1. Deploy CallRegistry
        println!("Deploying CallRegistry...");
        let registry = CallRegistry::load_or_deploy(
            &env,
            NoArgs,
            container,
            400_000_000_000 // 400 CSPR gas limit for deployment
        )?;
        println!("CallRegistry deployed at: {}", registry.address().to_string());

        // 2. Deploy OutcomeManager
        println!("Deploying OutcomeManager...");
        let manager = OutcomeManager::load_or_deploy(
            &env,
            OutcomeManagerInitArgs {
                registry: registry.address(),
            },
            container,
            400_000_000_000 // 400 CSPR gas limit for deployment
        )?;
        println!("OutcomeManager deployed at: {}", manager.address().to_string());

        Ok(())
    }
}

/// Main function to run the CLI tool.
pub fn main() {
    OdraCli::new()
        .about("CLI tool for Back It (Onchain) smart contracts")
        .deploy(BackItDeployScript)
        .contract::<CallRegistry>()
        .contract::<OutcomeManager>()
        .build()
        .run();
}
