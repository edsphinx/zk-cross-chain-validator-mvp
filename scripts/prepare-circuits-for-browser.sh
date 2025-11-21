#!/bin/bash

# ============================================================================
# Prepare ZK Circuits for Browser Use
# ============================================================================
# This script copies the compiled WASM files and proving keys to the
# frontend public directory so they can be loaded by the browser.
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Preparing ZK Circuits for Browser${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create frontend public circuits directory
FRONTEND_CIRCUITS_DIR="frontend/public/circuits"
mkdir -p "$FRONTEND_CIRCUITS_DIR"

# Circuits to copy
CIRCUITS=(
    "AccountBalanceProof"
    "AssetOwnership"
    "TransactionExistence"
    "VotingEligibility"
    "CollateralVerification"
)

TOTAL_SIZE=0

for CIRCUIT in "${CIRCUITS[@]}"; do
    echo -e "${YELLOW}[${CIRCUIT}]${NC} Copying files..."

    BUILD_DIR="circuits/build_${CIRCUIT}"

    # Check if build directory exists
    if [ ! -d "$BUILD_DIR" ]; then
        echo -e "${YELLOW}⚠️  Warning: Build directory not found for ${CIRCUIT}${NC}"
        echo "   Run: ./scripts/generate-proof.sh ${CIRCUIT}"
        continue
    fi

    # Copy WASM file
    WASM_FILE="${BUILD_DIR}/${CIRCUIT}_js/${CIRCUIT}.wasm"
    if [ -f "$WASM_FILE" ]; then
        cp "$WASM_FILE" "${FRONTEND_CIRCUITS_DIR}/${CIRCUIT}.wasm"
        WASM_SIZE=$(wc -c < "$WASM_FILE")
        TOTAL_SIZE=$((TOTAL_SIZE + WASM_SIZE))
        echo -e "  ✅ WASM copied ($(numfmt --to=iec-i --suffix=B $WASM_SIZE))"
    else
        echo -e "  ❌ WASM file not found: $WASM_FILE"
    fi

    # Copy proving key (zkey)
    ZKEY_FILE="${BUILD_DIR}/${CIRCUIT}.zkey"
    if [ -f "$ZKEY_FILE" ]; then
        cp "$ZKEY_FILE" "${FRONTEND_CIRCUITS_DIR}/${CIRCUIT}.zkey"
        ZKEY_SIZE=$(wc -c < "$ZKEY_FILE")
        TOTAL_SIZE=$((TOTAL_SIZE + ZKEY_SIZE))
        echo -e "  ✅ Proving key copied ($(numfmt --to=iec-i --suffix=B $ZKEY_SIZE))"
    else
        echo -e "  ❌ Proving key not found: $ZKEY_FILE"
    fi

    echo ""
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Circuit files prepared for browser use${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📁 Location: $FRONTEND_CIRCUITS_DIR"
echo "📊 Total size: $(numfmt --to=iec-i --suffix=B $TOTAL_SIZE)"
echo ""
echo "Files copied:"
ls -lh "$FRONTEND_CIRCUITS_DIR" | tail -n +2

echo ""
echo "Next steps:"
echo "  1. Install snarkjs in frontend: cd frontend && npm install snarkjs"
echo "  2. Start dev server: npm run dev"
echo "  3. Navigate to /proof-generator to test"
echo ""
