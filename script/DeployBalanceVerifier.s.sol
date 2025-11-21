// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Verifier.sol";
import "../src/BalanceVerifier.sol";

/**
 * @title DeployBalanceVerifier
 * @notice Deployment script for the ZK Balance Verification system
 * @dev Deploys both the Groth16Verifier and BalanceVerifier contracts
 *
 * Usage:
 *   forge script script/DeployBalanceVerifier.s.sol:DeployBalanceVerifier \
 *     --rpc-url <RPC_URL> \
 *     --private-key <PRIVATE_KEY> \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key <API_KEY>
 *
 * For testnet deployment (e.g., Scroll Sepolia):
 *   forge script script/DeployBalanceVerifier.s.sol:DeployBalanceVerifier \
 *     --rpc-url https://sepolia-rpc.scroll.io/ \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast
 */
contract DeployBalanceVerifier is Script {
    function run() external {
        // Get the private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy the Groth16Verifier
        console.log("Deploying Groth16Verifier...");
        Groth16Verifier verifier = new Groth16Verifier();
        console.log("Groth16Verifier deployed at:", address(verifier));

        // Step 2: Deploy the BalanceVerifier
        console.log("Deploying BalanceVerifier...");
        BalanceVerifier balanceVerifier = new BalanceVerifier(address(verifier));
        console.log("BalanceVerifier deployed at:", address(balanceVerifier));

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment summary
        console.log("\n========================================");
        console.log("Deployment Summary");
        console.log("========================================");
        console.log("Groth16Verifier:", address(verifier));
        console.log("BalanceVerifier:", address(balanceVerifier));
        console.log("========================================");
        console.log("\nTo verify your contract on Etherscan:");
        console.log("forge verify-contract", address(balanceVerifier), "src/BalanceVerifier.sol:BalanceVerifier");
        console.log("\nSave these addresses to your .env file:");
        console.log("VERIFIER_ADDRESS=", address(verifier));
        console.log("CONTRACT_ADDRESS=", address(balanceVerifier));
    }
}
