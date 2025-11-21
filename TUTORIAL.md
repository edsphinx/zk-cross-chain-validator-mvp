# ZK Balance Verification - Step-by-Step Tutorial

This tutorial will guide you through using the ZK-Cross-Chain Validator MVP to generate and verify zero-knowledge proofs of account balances.

## Prerequisites

Before starting, ensure you have:
- Node.js v14+ installed
- npm or yarn
- Git
- A wallet with testnet ETH (for deployment)
- Basic understanding of command line

## Part 1: Setup (5 minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/edsphinx/zk-cross-chain-validator-mvp.git
cd zk-cross-chain-validator-mvp

# Install dependencies
npm install

# Initialize git submodules
git submodule update --init --recursive
```

### Step 2: Configure Environment

```bash
# Create .env file from example
cp .env.example .env

# Edit .env file with your details
nano .env  # or use your preferred editor
```

Add your configuration:
```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia-rpc.scroll.io/
CHAIN_ID=534351
```

**⚠️ WARNING**: Never commit your `.env` file with real keys to git!

## Part 2: Understanding the Circuit (10 minutes)

### What Does the Circuit Prove?

The `AccountBalanceProof` circuit proves:
> "I have an account balance that meets or exceeds a threshold, but I won't reveal the exact amount."

### Circuit Inputs

```javascript
{
  balance: "1000000",      // Private: Your actual balance (kept secret)
  threshold: "500000",     // Public: Minimum required balance
  accountHash: "12345..."  // Public: Your account identifier
}
```

### How It Works

1. **Off-Chain**: Generate proof that `balance >= threshold`
2. **On-Chain**: Verify the proof without revealing `balance`
3. **Result**: Get confirmation that threshold is met

## Part 3: Generate Your First Proof (5 minutes)

### Step 1: Create Input Data

Let's prove we have at least 500,000 tokens:

```bash
# Syntax: node scripts/generateProof.js <balance> <threshold> <accountHash>
node scripts/generateProof.js 1000000 500000 12345678901234567890
```

### Expected Output

```
🔐 Generating ZK proof for balance verification...
   Balance: 1000000 (private)
   Threshold: 500000 (public)
   Account Hash: 12345678901234567890 (public)

📝 Generating witness...
✅ Proof generated successfully!

📊 Public Signals:
   Threshold: 500000
   Account Hash: 12345678901234567890

🔍 Verifying proof locally...
✅ Proof is valid!

💾 Proof saved to: build/proof.json
```

### What Happened?

1. ✅ Circuit computed that `1000000 >= 500000` is true
2. ✅ Generated a cryptographic proof
3. ✅ Verified locally that the proof is valid
4. ✅ Saved proof to `build/proof.json`

### Try an Invalid Proof

```bash
# This should fail because 400000 < 500000
node scripts/generateProof.js 400000 500000 12345678901234567890
```

You'll see an error because the balance doesn't meet the threshold!

## Part 4: Run Tests (5 minutes)

### Test the Circuit

```bash
npm run test:circuit
```

This runs 30+ test cases including:
- Valid balance proofs
- Invalid balance proofs
- Edge cases
- Public/private signal handling

### Test the Smart Contracts

```bash
forge test -vv
```

Tests the Solidity contracts:
- Deployment
- Proof verification
- State management
- Gas usage

## Part 5: Deploy to Testnet (10 minutes)

### Step 1: Get Testnet ETH

Get free testnet ETH from Scroll Sepolia faucet:
- https://sepolia.scroll.io/faucet

### Step 2: Deploy Contracts

```bash
forge script script/DeployBalanceVerifier.s.sol:DeployBalanceVerifier \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

### Expected Output

```
Deploying Groth16Verifier...
Groth16Verifier deployed at: 0x1234...

Deploying BalanceVerifier...
BalanceVerifier deployed at: 0x5678...

========================================
Deployment Summary
========================================
Groth16Verifier: 0x1234...
BalanceVerifier: 0x5678...
========================================
```

### Step 3: Update .env

Add the deployed contract address to `.env`:

```env
CONTRACT_ADDRESS=0x5678...  # Your BalanceVerifier address
VERIFIER_ADDRESS=0x1234...  # Your Groth16Verifier address
```

## Part 6: Verify Proof On-Chain (5 minutes)

### Step 1: Generate a New Proof

```bash
# Generate proof (if you haven't already)
node scripts/generateProof.js 2000000 1000000 99999999999
```

### Step 2: Verify (View Function - Free)

```bash
# Verify without submitting a transaction (no gas cost)
node scripts/verifyOnChain.js verify
```

Output:
```
🔍 Verifying proof on-chain (view)...
   Result: ✅ Valid
```

### Step 3: Submit to Blockchain (Costs Gas)

```bash
# Submit and store the proof on-chain
node scripts/verifyOnChain.js submit
```

Output:
```
📤 Submitting proof to blockchain...
   Account: 0xYourAddress...
   Threshold: 1000000
   Account Hash: 99999999999
   Estimated gas: 245000
   Transaction hash: 0xabc123...
   Waiting for confirmation...
   ✅ Confirmed in block 12345678
   Gas used: 238542

🎉 Proof verified and stored on-chain!
   Timestamp: 2025-11-21T17:00:00.000Z
```

### Step 4: Check Proof Status

```bash
# Check if a proof exists for an account
node scripts/verifyOnChain.js check 0xYourAddress 1000000 99999999999
```

Output:
```
🔍 Checking proof status...
   Account: 0xYourAddress
   Threshold: 1000000
   Account Hash: 99999999999
   ✅ Proof exists and is verified
   Verified at: 2025-11-21T17:00:00.000Z
```

## Part 7: Understanding the Code (10 minutes)

### Circuit Code (`circuits/AccountBalanceProof.circom`)

```circom
template AccountBalanceProof() {
    signal input balance;      // Private: hidden from verifier
    signal input threshold;    // Public: visible to all
    signal input accountHash;  // Public: account identifier

    // Calculate difference
    signal difference;
    difference <== balance - threshold;

    // Verify: difference must equal balance - threshold
    difference === balance - threshold;

    // Verify: balance must equal threshold + difference
    signal balanceCheck;
    balanceCheck <== threshold + difference;
    balanceCheck === balance;
}
```

**Key Points**:
- `balance` is private - never revealed
- `threshold` and `accountHash` are public
- Constraints ensure `balance >= threshold`

### Smart Contract (`src/BalanceVerifier.sol`)

```solidity
function verifyBalanceProof(
    uint[2] memory pA,
    uint[2][2] memory pB,
    uint[2] memory pC,
    uint[2] memory pubSignals,
    address account
) public returns (bool) {
    // Verify the ZK proof using Groth16Verifier
    bool isValid = verifier.verifyProof(pA, pB, pC, pubSignals);

    if (isValid) {
        // Store the verified proof
        bytes32 proofKey = keccak256(
            abi.encodePacked(account, threshold, accountHash)
        );
        verifiedProofs[proofKey] = BalanceProof({...});

        emit ProofVerified(...);
    }

    return isValid;
}
```

**Key Points**:
- Calls Groth16Verifier to check proof
- Stores verified proofs for future queries
- Emits events for monitoring

## Part 8: Real-World Use Cases (5 minutes)

### Use Case 1: DeFi Lending

Prove you have sufficient collateral without revealing exact amount:

```bash
# Prove you have at least 10,000 USDC
node scripts/generateProof.js 15000000000 10000000000 0x7a250d...

# Verify on-chain
node scripts/verifyOnChain.js submit
```

### Use Case 2: Governance Voting

Prove voting eligibility without revealing token holdings:

```bash
# Prove you hold at least 1000 governance tokens
node scripts/generateProof.js 5000 1000 0x3b89ac...

# Verify on-chain for voting contract
node scripts/verifyOnChain.js submit
```

### Use Case 3: Airdrop Eligibility

Prove you qualify for airdrop without revealing balance:

```bash
# Prove you hold at least 100 tokens
node scripts/generateProof.js 250 100 0x9d41ef...

# Verify on-chain
node scripts/verifyOnChain.js submit
```

## Part 9: Integration Example (15 minutes)

### Integrating with Your dApp

```javascript
// In your frontend or backend
const { generateBalanceProof, formatProofForSolidity } = require('./scripts/generateProof');
const OnChainVerifier = require('./scripts/verifyOnChain');

async function verifyUserBalance(userBalance, requiredThreshold) {
    // 1. Generate proof off-chain
    const { proof, publicSignals } = await generateBalanceProof(
        userBalance,
        requiredThreshold,
        calculateAccountHash(userAddress)
    );

    // 2. Format for Solidity
    const formatted = formatProofForSolidity(proof, publicSignals);

    // 3. Verify on-chain
    const verifier = new OnChainVerifier(rpcUrl, privateKey, contractAddress);
    const receipt = await verifier.submitProof(
        proof,
        publicSignals,
        userAddress
    );

    return receipt.status === 1;
}
```

### Example: DeFi Lending Contract

```solidity
// Your lending contract
contract MyLendingProtocol {
    BalanceVerifier public balanceVerifier;

    function borrowWithProof(
        uint amount,
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[2] memory pubSignals
    ) external {
        // Verify user has sufficient collateral
        require(
            balanceVerifier.verifyProofOnly(pA, pB, pC, pubSignals),
            "Insufficient collateral"
        );

        // Proceed with lending...
        _executeLoan(msg.sender, amount);
    }
}
```

## Part 10: Troubleshooting (5 minutes)

### Common Issues

#### Issue 1: "Cannot find module 'snarkjs'"

```bash
# Solution: Install dependencies
npm install
```

#### Issue 2: "Proof generation failed"

```bash
# Check that balance >= threshold
# Ensure all inputs are valid numbers
node scripts/generateProof.js 1000000 500000 12345
```

#### Issue 3: "Contract not deployed"

```bash
# Check .env has CONTRACT_ADDRESS
cat .env | grep CONTRACT_ADDRESS

# If empty, deploy first
forge script script/DeployBalanceVerifier.s.sol:DeployBalanceVerifier \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

#### Issue 4: "Transaction reverted"

```bash
# Check you have enough testnet ETH
# Verify proof is valid first
node scripts/verifyOnChain.js verify

# Then submit
node scripts/verifyOnChain.js submit
```

## Part 11: Advanced Usage (10 minutes)

### Custom Proof Generation

```javascript
const { generateBalanceProof, saveProof } = require('./scripts/generateProof');

// Generate multiple proofs
async function generateMultipleProofs() {
    const proofs = [
        { balance: '1000000', threshold: '500000', hash: '1111' },
        { balance: '2000000', threshold: '1000000', hash: '2222' },
        { balance: '5000000', threshold: '2000000', hash: '3333' }
    ];

    for (let i = 0; i < proofs.length; i++) {
        const p = proofs[i];
        const { proof, publicSignals } = await generateBalanceProof(
            p.balance,
            p.threshold,
            p.hash
        );
        saveProof(proof, publicSignals, `proof_${i}.json`);
        console.log(`Proof ${i} saved!`);
    }
}
```

### Batch Verification

```javascript
const OnChainVerifier = require('./scripts/verifyOnChain');
const { loadProof } = require('./scripts/generateProof');

async function batchVerify() {
    const verifier = new OnChainVerifier(rpcUrl, privateKey, contractAddress);

    for (let i = 0; i < 3; i++) {
        const { proof, publicSignals } = loadProof(`proof_${i}.json`);
        const isValid = await verifier.verifyProofView(proof, publicSignals);
        console.log(`Proof ${i}: ${isValid ? 'Valid ✅' : 'Invalid ❌'}`);
    }
}
```

## Part 12: Next Steps

### Expand the MVP

1. **Add More Use Cases**
   - Asset ownership verification
   - Transaction existence proofs
   - Voting eligibility
   - Collateral verification

2. **Optimize Circuits**
   - Add range checks
   - Optimize constraints
   - Reduce proof size

3. **Build Frontend**
   - React/Vue app for proof generation
   - Web3 integration
   - User-friendly interface

4. **Deploy to Mainnet**
   - Audit contracts
   - Deploy to Scroll mainnet
   - Set up monitoring

### Learn More

- [Circom Documentation](https://docs.circom.io/)
- [snarkJS Guide](https://github.com/iden3/snarkjs)
- [Foundry Book](https://book.getfoundry.sh/)
- [Scroll Documentation](https://docs.scroll.io/)

## Summary

You've learned how to:

✅ Set up the ZK verification system
✅ Generate zero-knowledge proofs
✅ Deploy contracts to testnet
✅ Verify proofs on-chain
✅ Integrate with your dApp

This MVP demonstrates a **functional implementation** of privacy-preserving balance verification using zero-knowledge proofs.

## Need Help?

- 📖 Check [IMPLEMENTATION.md](./IMPLEMENTATION.md) for technical details
- 💬 Open an issue on GitHub
- 📧 Contact the maintainers

## Congratulations! 🎉

You've successfully completed the ZK Balance Verification tutorial. You now have a working MVP that can be used in grant applications and real-world projects.

---

**Next**: Consider expanding this to other use cases or integrating with existing dApps!
