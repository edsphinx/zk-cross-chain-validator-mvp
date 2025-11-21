#!/bin/bash

# Script to verify all deployed contracts on Scroll Sepolia Etherscan
# Usage: ./verifyContracts.sh

echo "🔍 Verifying all contracts on Scroll Sepolia..."
echo "==========================================="

# Load environment variables
source .env

# Scroll Sepolia Explorer API
EXPLORER_URL="https://api-sepolia.scrollscan.com/api"
ETHERSCAN_API_KEY=${ETHERSCAN_API_KEY}

# Check if addresses are set
if [ -z "$BALANCE_MANAGER_ADDRESS" ]; then
    echo "❌ Error: Contract addresses not found in .env"
    echo "   Please deploy first and save addresses"
    exit 1
fi

# Verify function
verify_contract() {
    local CONTRACT_ADDRESS=$1
    local CONTRACT_NAME=$2
    local CONSTRUCTOR_ARGS=$3

    echo ""
    echo "Verifying: $CONTRACT_NAME"
    echo "Address: $CONTRACT_ADDRESS"

    ~/.foundry/bin/forge verify-contract \
        $CONTRACT_ADDRESS \
        $CONTRACT_NAME \
        --chain-id 534351 \
        --etherscan-api-key $ETHERSCAN_API_KEY \
        --constructor-args $CONSTRUCTOR_ARGS \
        --watch

    if [ $? -eq 0 ]; then
        echo "✅ $CONTRACT_NAME verified successfully!"
    else
        echo "⚠️  $CONTRACT_NAME verification failed (might already be verified)"
    fi
}

# Verify all contracts
echo ""
echo "1/11 Balance Verification System"
verify_contract $BALANCE_VERIFIER_ADDRESS "src/Verifier.sol:Groth16Verifier" ""
verify_contract $BALANCE_MANAGER_ADDRESS "src/BalanceVerifier.sol:BalanceVerifier" $(cast abi-encode "constructor(address)" $BALANCE_VERIFIER_ADDRESS)

echo ""
echo "2/11 Asset Ownership System"
verify_contract $ASSET_VERIFIER_ADDRESS "src/AssetOwnershipVerifier.sol:Groth16Verifier" ""
verify_contract $ASSET_MANAGER_ADDRESS "src/AssetOwnershipManager.sol:AssetOwnershipManager" $(cast abi-encode "constructor(address)" $ASSET_VERIFIER_ADDRESS)

echo ""
echo "3/11 Transaction Existence System"
verify_contract $TX_VERIFIER_ADDRESS "src/TransactionExistenceVerifier.sol:Groth16Verifier" ""
verify_contract $TX_MANAGER_ADDRESS "src/TransactionProofManager.sol:TransactionProofManager" $(cast abi-encode "constructor(address)" $TX_VERIFIER_ADDRESS)

echo ""
echo "4/11 Voting Eligibility System"
verify_contract $VOTING_VERIFIER_ADDRESS "src/VotingEligibilityVerifier.sol:Groth16Verifier" ""
verify_contract $VOTING_MANAGER_ADDRESS "src/VotingEligibilityManager.sol:VotingEligibilityManager" $(cast abi-encode "constructor(address)" $VOTING_VERIFIER_ADDRESS)

echo ""
echo "5/11 Collateral Verification System"
verify_contract $COLLATERAL_VERIFIER_ADDRESS "src/CollateralVerifier.sol:Groth16Verifier" ""
verify_contract $COLLATERAL_MANAGER_ADDRESS "src/CollateralManager.sol:CollateralManager" $(cast abi-encode "constructor(address)" $COLLATERAL_VERIFIER_ADDRESS)

echo ""
echo "6/11 Aave V3 Integration"
verify_contract $AAVE_ADAPTER_ADDRESS "src/AaveV3Adapter.sol:AaveV3Adapter" $(cast abi-encode "constructor(address)" $COLLATERAL_MANAGER_ADDRESS)

echo ""
echo "==========================================="
echo "✅ Contract verification complete!"
echo ""
echo "View on Scroll Sepolia Explorer:"
echo "https://sepolia.scrollscan.com/address/$BALANCE_MANAGER_ADDRESS"
echo "https://sepolia.scrollscan.com/address/$AAVE_ADAPTER_ADDRESS"
echo ""
