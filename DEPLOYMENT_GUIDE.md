# Complete Deployment Guide

## Step 1: Deploy Smart Contracts to Scroll Sepolia

### Prerequisites

- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Private key with Scroll Sepolia ETH
  - Get testnet ETH: https://sepolia.scroll.io/faucet

### Deploy Contracts

```bash
# From project root
forge build

# Deploy all 11 contracts (5 verifiers + 5 managers + 1 Aave adapter)
forge script script/DeployAllVerifiers.s.sol:DeployAllVerifiers \
  --rpc-url https://sepolia-rpc.scroll.io/ \
  --private-key $SCROLL_SEPOLIA_DEPLOY_PK \
  --broadcast \
  --verify \
  -vvvv
```

### Save Deployment Addresses

The deployment script will output addresses like:

```
BALANCE_VERIFIER_ADDRESS= 0x...
BALANCE_MANAGER_ADDRESS= 0x...
ASSET_VERIFIER_ADDRESS= 0x...
ASSET_MANAGER_ADDRESS= 0x...
TX_VERIFIER_ADDRESS= 0x...
TX_MANAGER_ADDRESS= 0x...
VOTING_VERIFIER_ADDRESS= 0x...
VOTING_MANAGER_ADDRESS= 0x...
COLLATERAL_VERIFIER_ADDRESS= 0x...
COLLATERAL_MANAGER_ADDRESS= 0x...
AAVE_ADAPTER_ADDRESS= 0x...
```

**Copy these to `.env` file and frontend `.env.local`**

---

## Step 2: Test Proof Generation

Generate proofs for all 5 circuits:

```bash
# Balance Verification
npm run generate:balance 1000000 500000 12345

# Asset Ownership
npm run generate:asset 5 721 67890

# Transaction Existence
npm run generate:transaction 999888 777666 12345 1

# Voting Eligibility
npm run generate:voting 10000 1000 42 11111

# Collateral Verification
npm run generate:collateral 150000 100000 50000 22222
```

Each command generates a proof in `build/<circuit>_proof.json`

---

## Step 3: Verify Proofs On-Chain

After generating proofs, submit them:

```bash
# Configure .env with deployed addresses
echo "CONTRACT_ADDRESS=<YOUR_BALANCE_MANAGER_ADDRESS>" >> .env

# Submit proof (example with balance)
node scripts/verifyOnChain.js submit
```

This creates a transaction on Scroll Sepolia that you can view in block explorer.

---

## Step 4: Test Aave Integration

### Get Test Tokens

```bash
# Mint USDC on Scroll Sepolia
# USDC Faucet: 0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D

# Or interact with Aave Faucet:
# 0x2F826FD1a0071476330a58dD1A9B36bcF7da832d
```

### Test Borrow with ZK Collateral

```bash
# 1. Generate collateral proof
npm run generate:collateral 150000 100000 50000 YOUR_ADDRESS_HASH

# 2. Supply collateral and borrow (via contract interaction)
# Use frontend or write custom script
```

---

## Step 5: Deploy Frontend

### Local Development

```bash
cd frontend
npm install

# Create .env.local with deployed addresses
cp .env.example .env.local
# Edit .env.local with your contract addresses

npm run dev
# Open http://localhost:3000
```

### Production Deployment (Vercel)

```bash
# Push to GitHub
git add frontend/
git commit -m "Add frontend"
git push

# Deploy to Vercel
# 1. Go to vercel.com
# 2. Import your GitHub repo
# 3. Set environment variables from .env.local
# 4. Deploy!
```

### Production Deployment (Netlify)

```bash
cd frontend
npm run build

# Upload .next/ folder to Netlify
# Or connect GitHub repo
```

---

## Step 6: Verify Deployment

### Check Contract Verification

Visit Scroll Sepolia Explorer:
- https://sepolia.scrollscan.com/

Search for your contract addresses and verify they're deployed.

### Test Frontend

1. Open deployed frontend URL
2. Connect wallet (MetaMask)
3. Switch to Scroll Sepolia network
4. Generate a proof
5. Submit to blockchain
6. View transaction in explorer

---

## Step 7: Generate Activity for Demo

### Create Transaction History

```bash
# Generate and submit 10+ proofs
for i in {1..5}; do
  npm run generate:balance $((1000000 + i*100000)) 500000 $i
  # Submit each proof
  node scripts/verifyOnChain.js submit
  sleep 5
done
```

This creates real transaction history visible in block explorer.

---

## Step 8: Prepare Video Demo

### Demo Flow

1. **Show Landing Page**
   - Highlight 5 circuits + Aave integration
   - Show stats (5 circuits, 11 contracts, etc.)

2. **Connect Wallet**
   - Show Scroll Sepolia network
   - Display balance

3. **Generate Proof (Balance)**
   - Fill in form: balance=1000000, threshold=500000
   - Click "Generate" (show ~1-2 second wait)
   - Display generated proof

4. **Verify On-Chain**
   - Click "Verify On-Chain"
   - Show MetaMask confirmation
   - Show gas estimate (~250K)
   - Confirm transaction
   - Show transaction in Scroll Sepolia explorer

5. **Show Other Circuits**
   - Quickly demonstrate each of the 5 circuits
   - Show they all work

6. **Aave Integration**
   - Navigate to Aave page
   - Generate collateral proof
   - Show "Supply and Borrow" interface
   - Demonstrate real DeFi integration

7. **Show Dashboard**
   - Transaction history
   - Gas costs
   - Success metrics
   - Active proofs

8. **Show Block Explorer**
   - Open Scroll Sepolia explorer
   - Show deployed contracts
   - Show transaction history
   - Show proof verifications

---

## Troubleshooting

### Contract Deployment Fails

**Issue**: Insufficient gas or RPC error

**Solution**:
```bash
# Check balance
cast balance $YOUR_ADDRESS --rpc-url https://sepolia-rpc.scroll.io/

# Get more testnet ETH
# https://sepolia.scroll.io/faucet

# Try with higher gas limit
forge script ... --gas-limit 10000000
```

### Proof Generation Fails

**Issue**: Circuit compilation or input error

**Solution**:
```bash
# Verify circuits compiled
ls build/*.wasm

# Check input format
cat circuits/input_example.json

# Re-compile if needed
circom circuits/AccountBalanceProof.circom --r1cs --wasm --sym -o build/
```

### Frontend Connection Issues

**Issue**: Cannot connect to contracts

**Solution**:
1. Verify contract addresses in `.env.local`
2. Check network is Scroll Sepolia (534351)
3. Ensure RPC URL is correct: `https://sepolia-rpc.scroll.io/`
4. Clear browser cache and restart

### Aave Integration Fails

**Issue**: Transaction reverts

**Solution**:
1. Ensure you have approved tokens
2. Check collateral amount is sufficient
3. Verify Aave pool address: `0x48914C788295b5db23aF2b5F0B3BE775C4eA9440`
4. Test with smaller amounts first

---

## Environment Variables Reference

### Root `.env`

```env
SCROLL_SEPOLIA_DEPLOY_PK=your_private_key
PRIVATE_KEY=your_private_key
RPC_URL=https://sepolia-rpc.scroll.io/

# Deployed addresses (from deployment)
BALANCE_MANAGER_ADDRESS=0x...
ASSET_MANAGER_ADDRESS=0x...
TX_MANAGER_ADDRESS=0x...
VOTING_MANAGER_ADDRESS=0x...
COLLATERAL_MANAGER_ADDRESS=0x...
AAVE_ADAPTER_ADDRESS=0x...
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_BALANCE_MANAGER=0x...
NEXT_PUBLIC_ASSET_MANAGER=0x...
NEXT_PUBLIC_TX_MANAGER=0x...
NEXT_PUBLIC_VOTING_MANAGER=0x...
NEXT_PUBLIC_COLLATERAL_MANAGER=0x...
NEXT_PUBLIC_AAVE_ADAPTER=0x...

NEXT_PUBLIC_RPC_URL=https://sepolia-rpc.scroll.io/
NEXT_PUBLIC_CHAIN_ID=534351
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## Quick Commands Reference

```bash
# Compile contracts
forge build

# Deploy all
forge script script/DeployAllVerifiers.s.sol:DeployAllVerifiers --rpc-url https://sepolia-rpc.scroll.io/ --private-key $SCROLL_SEPOLIA_DEPLOY_PK --broadcast -vvvv

# Generate proofs
npm run generate:balance 1000000 500000 12345
npm run generate:asset 5 721 67890
npm run generate:transaction 999888 777666 12345 1
npm run generate:voting 10000 1000 42 11111
npm run generate:collateral 150000 100000 50000 22222

# Verify on-chain
node scripts/verifyOnChain.js submit

# Run frontend
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build
```

---

## Success Checklist

- [ ] 11 contracts deployed to Scroll Sepolia
- [ ] All 5 circuits compiled and tested
- [ ] Proof generation working for all circuits
- [ ] On-chain verification successful
- [ ] Aave adapter deployed
- [ ] Frontend running locally
- [ ] Wallet connection working
- [ ] Transaction history visible in block explorer
- [ ] Demo video recorded
- [ ] Documentation complete

---

## Next Steps After Deployment

1. **Generate Activity**: Create 20+ transactions for demo
2. **Record Video**: Show all features working
3. **Update Documentation**: Add deployment addresses
4. **Create Tutorial**: Step-by-step user guide
5. **Prepare Grant Application**: Use deployment as proof of work

---

## Support

- GitHub: https://github.com/edsphinx/zk-cross-chain-validator-mvp
- Scroll Docs: https://docs.scroll.io/
- Aave Docs: https://docs.aave.com/

**Good luck with your deployment!** 🚀
