#!/bin/bash

# ============================================================================
# Generate Real ZK Proof for a Specific Circuit
# ============================================================================
# Usage: ./generate-proof.sh <circuit_name> <input_file>
# Example: ./generate-proof.sh AccountBalanceProof input.json
# ============================================================================

set -e

CIRCUIT_NAME=$1
INPUT_FILE=$2

if [ -z "$CIRCUIT_NAME" ]; then
    echo "Usage: $0 <circuit_name> [input_file]"
    echo ""
    echo "Available circuits:"
    echo "  - AccountBalanceProof"
    echo "  - AssetOwnership"
    echo "  - TransactionExistence"
    echo "  - VotingEligibility"
    echo "  - CollateralVerification"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Generating ZK Proof for $CIRCUIT_NAME${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Directories
CIRCUIT_DIR="circuits"
BUILD_DIR="circuits/build_${CIRCUIT_NAME}"
CIRCUIT_FILE="${CIRCUIT_DIR}/${CIRCUIT_NAME}.circom"

# Check if circuit exists
if [ ! -f "$CIRCUIT_FILE" ]; then
    echo "❌ Error: Circuit file not found: $CIRCUIT_FILE"
    exit 1
fi

echo -e "${YELLOW}[1/6]${NC} Setting up build directory..."
mkdir -p "$BUILD_DIR"

echo -e "${YELLOW}[2/6]${NC} Compiling circuit with circom..."

# Check if circom 2.x is available, if not download it
CIRCOM_BIN="/usr/local/bin/circom2"
if [ ! -f "$CIRCOM_BIN" ]; then
    CIRCOM_BIN="./circom2"
    if [ ! -f "$CIRCOM_BIN" ]; then
        echo "  Downloading circom 2.x..."
        curl -fsSL https://github.com/iden3/circom/releases/download/v2.1.9/circom-linux-amd64 -o "$CIRCOM_BIN"
        chmod +x "$CIRCOM_BIN"
    fi
fi

# Compile circuit
"$CIRCOM_BIN" "$CIRCUIT_FILE" \
    --r1cs \
    --wasm \
    --sym \
    -o "$BUILD_DIR" \
    2>&1 | grep -v "template instances"

echo -e "${GREEN}✅ Circuit compiled${NC}"

echo -e "${YELLOW}[3/6]${NC} Generating input..."

# Generate sample input if not provided
if [ -z "$INPUT_FILE" ]; then
    INPUT_FILE="${BUILD_DIR}/input.json"

    case "$CIRCUIT_NAME" in
        "AccountBalanceProof")
            cat > "$INPUT_FILE" << EOF
{
    "balance": "5000000000",
    "threshold": "2000000000",
    "accountHash": "12345678901234567890"
}
EOF
            ;;
        "AssetOwnership")
            cat > "$INPUT_FILE" << EOF
{
    "assetBalance": "1000000000000000000",
    "assetId": "12345",
    "accountHash": "67890"
}
EOF
            ;;
        "TransactionExistence")
            cat > "$INPUT_FILE" << EOF
{
    "txHash": "123456789",
    "merkleRoot": "987654321",
    "blockNumber": "1000000",
    "chainId": "534351"
}
EOF
            ;;
        "VotingEligibility")
            cat > "$INPUT_FILE" << EOF
{
    "tokenBalance": "10000000000000000000000",
    "votingThreshold": "5000000000000000000000",
    "proposalId": "1",
    "accountHash": "123456789"
}
EOF
            ;;
        "CollateralVerification")
            cat > "$INPUT_FILE" << EOF
{
    "collateralValue": "5000000000",
    "requiredCollateral": "3000000000",
    "loanAmount": "2000000000",
    "accountHash": "123456789"
}
EOF
            ;;
        *)
            echo "❌ Unknown circuit: $CIRCUIT_NAME"
            exit 1
            ;;
    esac

    echo "  Generated sample input: $INPUT_FILE"
fi

echo -e "${GREEN}✅ Input generated${NC}"

echo -e "${YELLOW}[4/6]${NC} Computing witness..."

# Compute witness
node "${BUILD_DIR}/${CIRCUIT_NAME}_js/generate_witness.js" \
    "${BUILD_DIR}/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm" \
    "$INPUT_FILE" \
    "${BUILD_DIR}/witness.wtns"

echo -e "${GREEN}✅ Witness computed${NC}"

echo -e "${YELLOW}[5/6]${NC} Checking for proving key..."

# Check if proving key exists, if not generate it
PTAU_FILE="circuits/powersOfTau28_hez_final_14.ptau"
ZKEY_FILE="${BUILD_DIR}/${CIRCUIT_NAME}.zkey"

if [ ! -f "$ZKEY_FILE" ]; then
    echo "  Proving key not found, generating..."

    # Download powers of tau if not exists
    if [ ! -f "$PTAU_FILE" ]; then
        echo "  Downloading powers of tau..."
        wget -q https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau \
            -O "$PTAU_FILE" \
            || echo "  Warning: Could not download powers of tau"
    fi

    if [ -f "$PTAU_FILE" ]; then
        # Generate zkey
        if command -v snarkjs &> /dev/null; then
            snarkjs groth16 setup \
                "${BUILD_DIR}/${CIRCUIT_NAME}.r1cs" \
                "$PTAU_FILE" \
                "$ZKEY_FILE" \
                > /dev/null 2>&1

            echo -e "${GREEN}✅ Proving key generated${NC}"
        else
            echo "❌ snarkjs not installed, cannot generate proving key"
            echo "Install with: npm install -g snarkjs"
            exit 1
        fi
    fi
fi

echo -e "${YELLOW}[6/6]${NC} Generating proof..."

# Generate proof
if command -v snarkjs &> /dev/null; then
    snarkjs groth16 prove \
        "$ZKEY_FILE" \
        "${BUILD_DIR}/witness.wtns" \
        "${BUILD_DIR}/proof.json" \
        "${BUILD_DIR}/public.json" \
        > /dev/null 2>&1

    echo -e "${GREEN}✅ Proof generated${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ Proof Generation Complete!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📁 Output files:"
    echo "   Proof:        ${BUILD_DIR}/proof.json"
    echo "   Public input: ${BUILD_DIR}/public.json"
    echo "   Witness:      ${BUILD_DIR}/witness.wtns"
    echo ""

    # Display proof size
    PROOF_SIZE=$(wc -c < "${BUILD_DIR}/proof.json")
    echo "📊 Proof size: $PROOF_SIZE bytes"

    # Verify proof locally
    echo ""
    echo "🔍 Verifying proof locally..."

    # Generate verification key if not exists
    VKEY_FILE="${BUILD_DIR}/verification_key.json"
    if [ ! -f "$VKEY_FILE" ]; then
        snarkjs zkey export verificationkey "$ZKEY_FILE" "$VKEY_FILE" > /dev/null 2>&1
    fi

    # Verify
    if snarkjs groth16 verify \
        "$VKEY_FILE" \
        "${BUILD_DIR}/public.json" \
        "${BUILD_DIR}/proof.json" \
        > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Proof verification: VALID${NC}"
    else
        echo -e "❌ Proof verification: INVALID"
        exit 1
    fi

    echo ""
    echo "Next steps:"
    echo "  1. Use proof.json for on-chain verification"
    echo "  2. Submit to smart contract using cast or ethers.js"
    echo "  3. Verify on Scroll Sepolia testnet"

else
    echo "❌ snarkjs not installed"
    echo "Install with: npm install -g snarkjs"
    exit 1
fi
