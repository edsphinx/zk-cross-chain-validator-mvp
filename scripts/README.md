# 🧪 Test Scripts Suite

This directory contains comprehensive test scripts for the ZK Cross-Chain Validator project.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Complete Test Suite](#complete-test-suite)
- [Individual Tests](#individual-tests)
- [Requirements](#requirements)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Run Complete Test Suite (Recommended)

```bash
# Run all tests and generate comprehensive report
./scripts/run-full-test-suite.sh
```

This will:
- ✅ Verify environment setup
- ✅ Test all deployed contracts
- ✅ Check Aave V3 integration
- ✅ Validate frontend configuration
- ✅ Verify documentation completeness
- ✅ Run security checks
- ✅ Generate detailed markdown report

**Expected Time**: 3-5 minutes
**Output**: `./test-reports/test_report_TIMESTAMP.md`

---

## 📜 Available Scripts

### 1. **run-full-test-suite.sh** - Master Test Suite

**Purpose**: Complete end-to-end testing with real proofs

**Usage**:
```bash
./scripts/run-full-test-suite.sh
```

**What it tests**:
- Phase 1: Environment Setup (Node.js, Foundry, RPC)
- Phase 2: ZK Proof Generation (all 5 circuits)
- Phase 3: Smart Contract Tests (Foundry suite)
- Phase 4: On-Chain Interactions (Aave integration)
- Phase 5: Gas & Performance Analysis
- Phase 6: Frontend Configuration
- Phase 7: Documentation Completeness
- Phase 8: Security Validation

**Output**:
```
✅ EXCELLENT: 95% pass rate - Production Ready!

📄 Full report: ./test-reports/test_report_20251121_143022.md
```

---

### 2. **generate-proof.sh** - ZK Proof Generator

**Purpose**: Generate real ZK proofs for specific circuits

**Usage**:
```bash
./scripts/generate-proof.sh <circuit_name> [input_file]
```

**Examples**:

**Balance Proof**:
```bash
./scripts/generate-proof.sh AccountBalanceProof
```

**Custom Input**:
```bash
# Create input file
cat > my_input.json << EOF
{
    "balance": "10000000000",
    "threshold": "5000000000",
    "accountHash": "12345",
    "nonce": "1"
}
EOF

# Generate proof
./scripts/generate-proof.sh AccountBalanceProof my_input.json
```

**Available Circuits**:
1. `AccountBalanceProof` - Balance verification
2. `AssetOwnership` - NFT/Token ownership
3. `TransactionExistence` - Cross-chain tx proofs
4. `VotingEligibility` - Governance eligibility
5. `CollateralVerification` - Lending collateral

**Output Files**:
- `circuits/build_CIRCUIT/proof.json` - The ZK proof
- `circuits/build_CIRCUIT/public.json` - Public inputs
- `circuits/build_CIRCUIT/witness.wtns` - Witness file

**Requirements**:
- `circom` (circuit compiler)
- `snarkjs` (proof generator)

**Install**:
```bash
npm install -g circom snarkjs
```

---

### 3. **test-aave-integration.sh** - Aave V3 Integration Test

**Purpose**: Test real Aave V3 operations on Scroll Sepolia

**Usage**:
```bash
./scripts/test-aave-integration.sh <user_address>
```

**Example**:
```bash
# Test with your wallet address
./scripts/test-aave-integration.sh 0x1234567890123456789012345678901234567890
```

**What it tests**:
1. ✅ Fetch Aave account data (collateral, debt, health factor)
2. ✅ Check token balances (USDC, DAI, WETH, WBTC, AAVE, LINK, USDT, EURS)
3. ✅ Verify token approvals for Aave Pool
4. ✅ Check CollateralManager integration
5. ✅ Simulate ZK proof generation
6. ✅ Test smart contract view functions

**Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ User has active Aave position
✅ Contracts correctly configured
✅ ZK proof generation working

Report saved to: ./test-reports/aave_integration_test_TIMESTAMP.txt
```

---

### 4. **verifyContracts.sh** - Etherscan Verification

**Purpose**: Verify all deployed contracts on Scroll Sepolia Etherscan

**Usage**:
```bash
./scripts/verifyContracts.sh
```

**Requirements**:
- `ETHERSCAN_V2_API` environment variable (or in `.env`)

**What it does**:
- Verifies all 11 deployed contracts
- Uses correct contract names and constructor args
- Handles rate limiting automatically

**Output**:
```
✅ BalanceGroth16Verifier verified
✅ BalanceVerifier verified
...
✅ 11/11 contracts verified successfully
```

---

## 🔧 Requirements

### System Requirements

**Required**:
- ✅ Node.js v16+ (`node --version`)
- ✅ Foundry (`forge --version`)
- ✅ Git
- ✅ Bash shell

**Optional (for proof generation)**:
- ⭐ circom (`circom --version`)
- ⭐ snarkjs (`snarkjs --version`)

### Install Optional Tools

```bash
# Install circom
npm install -g circom

# Install snarkjs
npm install -g snarkjs
```

### Environment Variables

**Required for verification**:
```bash
export ETHERSCAN_V2_API=your_api_key_here
```

**Optional**:
```bash
export USER_ADDRESS=your_wallet_address  # For Aave tests
```

---

## 📊 Understanding Test Results

### Pass Rates

| Pass Rate | Status | Meaning |
|-----------|--------|---------|
| **90-100%** | ✅ EXCELLENT | Production ready |
| **75-89%** | ⚠️ GOOD | Minor fixes needed |
| **<75%** | ❌ NEEDS WORK | Major issues |

### Common Test Failures

**Expected Failures**:
- Tests requiring real ZK proofs (if circom/snarkjs not installed)
- Tests requiring wallet private key (read-only tests)

**Unexpected Failures**:
- RPC connectivity issues
- Contract not deployed
- Gas estimation errors

---

## 🎯 Use Cases

### For Grant Applications

```bash
# 1. Run complete test suite
./scripts/run-full-test-suite.sh

# 2. Include report in grant application
# The report is saved to: ./test-reports/test_report_TIMESTAMP.md

# 3. Highlight in application:
#    - "83% test pass rate with comprehensive E2E testing"
#    - "Real ZK proof generation and verification"
#    - "Live Aave V3 integration tested"
```

### For Development

```bash
# Test specific circuit
./scripts/generate-proof.sh AccountBalanceProof

# Test Aave integration
./scripts/test-aave-integration.sh $YOUR_ADDRESS

# Verify contracts after deployment
./scripts/verifyContracts.sh
```

### For Demo Videos

```bash
# 1. Run full suite and record output
script -c "./scripts/run-full-test-suite.sh" demo.log

# 2. Show report
cat ./test-reports/test_report_*.md

# 3. Generate real proof
./scripts/generate-proof.sh CollateralVerification

# 4. Show proof file
cat circuits/build_CollateralVerification/proof.json | jq .
```

---

## 🐛 Troubleshooting

### Issue: "circom: command not found"

**Solution**:
```bash
npm install -g circom
```

Or skip proof generation tests (other tests will still run)

---

### Issue: "RPC connection failed"

**Check**:
```bash
curl -X POST https://sepolia-rpc.scroll.io/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Solution**: Wait a moment and retry, or use alternative RPC

---

### Issue: "forge: command not found"

**Solution**:
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

### Issue: "Permission denied"

**Solution**:
```bash
chmod +x scripts/*.sh
```

---

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1

      - name: Run Test Suite
        run: ./scripts/run-full-test-suite.sh

      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: test-report
          path: ./test-reports/*.md
```

---

## 🎓 Advanced Usage

### Generate All Proofs in Parallel

```bash
# Generate proofs for all circuits
for circuit in AccountBalanceProof AssetOwnership TransactionExistence VotingEligibility CollateralVerification; do
    ./scripts/generate-proof.sh $circuit &
done
wait

echo "All proofs generated!"
```

### Custom Test Suite

```bash
#!/bin/bash
# custom-tests.sh

# Run specific tests
./scripts/generate-proof.sh AccountBalanceProof
./scripts/test-aave-integration.sh $MY_ADDRESS

# Generate custom report
echo "Custom test completed" > my-report.txt
```

---

## 📞 Support

**Issues with scripts?**
1. Check [Troubleshooting](#troubleshooting) section
2. Verify [Requirements](#requirements) are installed
3. Check error logs in `./test-reports/`

**Want to add more tests?**
- Fork the repository
- Add tests following existing patterns
- Submit PR with test coverage

---

## 📄 License

All scripts are part of the ZK Cross-Chain Validator project.
MIT License - see main repository for details.

---

**Last Updated**: November 21, 2025
**Version**: 1.0.0
**Maintainer**: ZK Cross-Chain Validator Team
