// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

// Verifier contracts
import "../src/Verifier.sol";
import "../src/AssetOwnershipVerifier.sol";
import "../src/TransactionExistenceVerifier.sol";
import "../src/VotingEligibilityVerifier.sol";
import "../src/CollateralVerifier.sol";

// Manager contracts
import "../src/BalanceVerifier.sol";
import "../src/AssetOwnershipManager.sol";
import "../src/TransactionProofManager.sol";
import "../src/VotingEligibilityManager.sol";
import "../src/CollateralManager.sol";

/**
 * @title DeployAllVerifiers
 * @notice Unified deployment script for complete ZK verification system
 * @dev Deploys all 5 verifiers and their manager contracts
 *
 * Usage:
 *   forge script script/DeployAllVerifiers.s.sol:DeployAllVerifiers \
 *     --rpc-url <RPC_URL> \
 *     --private-key <PRIVATE_KEY> \
 *     --broadcast \
 *     -vvvv
 */
contract DeployAllVerifiers is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("========================================");
        console.log("ZK Cross-Chain Validator Deployment");
        console.log("========================================\n");

        // 1. Account Balance Verification
        console.log("1/5 Deploying Account Balance Verification System...");
        Groth16Verifier balanceVerifier = new Groth16Verifier();
        BalanceVerifier balanceManager = new BalanceVerifier(address(balanceVerifier));
        console.log("  BalanceVerifier:", address(balanceVerifier));
        console.log("  BalanceManager:", address(balanceManager));
        console.log("  Status: DEPLOYED\n");

        // 2. Asset Ownership Verification
        console.log("2/5 Deploying Asset Ownership Verification System...");
        Groth16Verifier assetVerifier = new Groth16Verifier();
        AssetOwnershipManager assetManager = new AssetOwnershipManager(address(assetVerifier));
        console.log("  AssetOwnershipVerifier:", address(assetVerifier));
        console.log("  AssetOwnershipManager:", address(assetManager));
        console.log("  Status: DEPLOYED\n");

        // 3. Transaction Existence Proof
        console.log("3/5 Deploying Transaction Existence Proof System...");
        Groth16Verifier txVerifier = new Groth16Verifier();
        TransactionProofManager txManager = new TransactionProofManager(address(txVerifier));
        console.log("  TransactionExistenceVerifier:", address(txVerifier));
        console.log("  TransactionProofManager:", address(txManager));
        console.log("  Status: DEPLOYED\n");

        // 4. Voting Eligibility Verification
        console.log("4/5 Deploying Voting Eligibility Verification System...");
        Groth16Verifier votingVerifier = new Groth16Verifier();
        VotingEligibilityManager votingManager = new VotingEligibilityManager(address(votingVerifier));
        console.log("  VotingEligibilityVerifier:", address(votingVerifier));
        console.log("  VotingEligibilityManager:", address(votingManager));
        console.log("  Status: DEPLOYED\n");

        // 5. Collateral Verification
        console.log("5/5 Deploying Collateral Verification System...");
        Groth16Verifier collateralVerifier = new Groth16Verifier();
        CollateralManager collateralManager = new CollateralManager(address(collateralVerifier));
        console.log("  CollateralVerifier:", address(collateralVerifier));
        console.log("  CollateralManager:", address(collateralManager));
        console.log("  Status: DEPLOYED\n");

        vm.stopBroadcast();

        // Deployment Summary
        console.log("========================================");
        console.log("DEPLOYMENT COMPLETE");
        console.log("========================================\n");

        console.log("Add these addresses to your .env file:\n");
        console.log("# Account Balance Verification");
        console.log("BALANCE_VERIFIER_ADDRESS=", address(balanceVerifier));
        console.log("BALANCE_MANAGER_ADDRESS=", address(balanceManager));
        console.log("");

        console.log("# Asset Ownership Verification");
        console.log("ASSET_VERIFIER_ADDRESS=", address(assetVerifier));
        console.log("ASSET_MANAGER_ADDRESS=", address(assetManager));
        console.log("");

        console.log("# Transaction Existence Proof");
        console.log("TX_VERIFIER_ADDRESS=", address(txVerifier));
        console.log("TX_MANAGER_ADDRESS=", address(txManager));
        console.log("");

        console.log("# Voting Eligibility");
        console.log("VOTING_VERIFIER_ADDRESS=", address(votingVerifier));
        console.log("VOTING_MANAGER_ADDRESS=", address(votingManager));
        console.log("");

        console.log("# Collateral Verification");
        console.log("COLLATERAL_VERIFIER_ADDRESS=", address(collateralVerifier));
        console.log("COLLATERAL_MANAGER_ADDRESS=", address(collateralManager));
        console.log("");

        console.log("========================================");
        console.log("Total Contracts Deployed: 10");
        console.log("  - 5 ZK Verifiers (Groth16)");
        console.log("  - 5 Manager Contracts");
        console.log("========================================");
    }
}
