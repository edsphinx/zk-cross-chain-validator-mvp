# 📝 Contract Verification Instructions

## ✅ All 11 Contracts Deployed Successfully

All contracts are live on Scroll Sepolia. Verification on Etherscan is optional but recommended for transparency.

---

## Option 1: Automated Verification (Recommended)

### Prerequisites
Get an Etherscan API key:
1. Go to https://scrollscan.com/myapikey
2. Create an account and generate an API key

### Method A: Using Environment Variable
```bash
export ETHERSCAN_V2_API=your_api_key_here
./scripts/verifyContracts.sh
```

### Method B: Using .env File
```bash
echo "ETHERSCAN_API_KEY=your_api_key_here" >> .env
./scripts/verifyContracts.sh
```

---

## Option 2: Manual Verification (via Web UI)

Visit each contract on Scroll Sepolia Explorer and use the "Verify & Publish" button:

### 1. Balance Verification System
**Verifier**: https://sepolia.scrollscan.com/address/0xD28008A82C0F17120D981a44cC78979FEC6C6Fd9#code
- Contract: `src/Verifier.sol:BalanceGroth16Verifier`
- Compiler: Solidity 0.8.30
- Optimization: Enabled (200 runs)
- Constructor arguments: None

**Manager**: https://sepolia.scrollscan.com/address/0xcc06a2109fD6D4DF459fd225cA50681a9335113F#code
- Contract: `src/BalanceVerifier.sol:BalanceVerifier`
- Compiler: Solidity 0.8.30
- Optimization: Enabled (200 runs)
- Constructor arguments: `0xD28008A82C0F17120D981a44cC78979FEC6C6Fd9`

### 2. Asset Ownership System
**Verifier**: https://sepolia.scrollscan.com/address/0xd4495De178b8a9f1457547A7AA0fb9900A533653#code
- Contract: `src/AssetOwnershipVerifier.sol:AssetOwnershipGroth16Verifier`
- Constructor arguments: None

**Manager**: https://sepolia.scrollscan.com/address/0xb42891Ee97591aAF8edfe1d3Cf253a569986603B#code
- Contract: `src/AssetOwnershipManager.sol:AssetOwnershipManager`
- Constructor arguments: `0xd4495De178b8a9f1457547A7AA0fb9900A533653`

### 3. Transaction Existence System
**Verifier**: https://sepolia.scrollscan.com/address/0x405aE9448B8aF9eE0433C42D86aD6D9426a5f288#code
- Contract: `src/TransactionExistenceVerifier.sol:TransactionExistenceGroth16Verifier`
- Constructor arguments: None

**Manager**: https://sepolia.scrollscan.com/address/0xC3136b612637EFdCA1015B2082EEdABF204B7Cb2#code
- Contract: `src/TransactionProofManager.sol:TransactionProofManager`
- Constructor arguments: `0x405aE9448B8aF9eE0433C42D86aD6D9426a5f288`

### 4. Voting Eligibility System
**Verifier**: https://sepolia.scrollscan.com/address/0x6C0D0561007Ea564501834f2E408FE246620Cf75#code
- Contract: `src/VotingEligibilityVerifier.sol:VotingEligibilityGroth16Verifier`
- Constructor arguments: None

**Manager**: https://sepolia.scrollscan.com/address/0xf8270B6e1D07112512c6802E70Eee5D0b0988F5b#code
- Contract: `src/VotingEligibilityManager.sol:VotingEligibilityManager`
- Constructor arguments: `0x6C0D0561007Ea564501834f2E408FE246620Cf75`

### 5. Collateral Verification System
**Verifier**: https://sepolia.scrollscan.com/address/0xa3e8EbD7E0f84D28709140446821D50F71ab6287#code
- Contract: `src/CollateralVerifier.sol:CollateralGroth16Verifier`
- Constructor arguments: None

**Manager**: https://sepolia.scrollscan.com/address/0x5987817C0dA0a87bAfC48E399a73c6D33f60b249#code
- Contract: `src/CollateralManager.sol:CollateralManager`
- Constructor arguments: `0xa3e8EbD7E0f84D28709140446821D50F71ab6287`

### 6. Aave V3 Integration
**Adapter**: https://sepolia.scrollscan.com/address/0x26D0C5DF2e47170EF8841D4231682Bc23ec27cd2#code
- Contract: `src/AaveV3Adapter.sol:AaveV3Adapter`
- Compiler: Solidity 0.8.30
- Optimization: Enabled (200 runs)
- Constructor arguments: `0x5987817C0dA0a87bAfC48E399a73c6D33f60b249`

---

## Option 3: Command-Line Verification (Individual Contracts)

### Example for Balance Verifier:
```bash
~/.foundry/bin/forge verify-contract \
  0xD28008A82C0F17120D981a44cC78979FEC6C6Fd9 \
  src/Verifier.sol:BalanceGroth16Verifier \
  --chain-id 534351 \
  --etherscan-api-key $ETHERSCAN_V2_API \
  --watch
```

### Example for Balance Manager:
```bash
~/.foundry/bin/forge verify-contract \
  0xcc06a2109fD6D4DF459fd225cA50681a9335113F \
  src/BalanceVerifier.sol:BalanceVerifier \
  --chain-id 534351 \
  --etherscan-api-key $ETHERSCAN_V2_API \
  --constructor-args $(~/.foundry/bin/cast abi-encode "constructor(address)" 0xD28008A82C0F17120D981a44cC78979FEC6C6Fd9) \
  --watch
```

---

## 📊 Verification Status

| Contract | Address | Status |
|----------|---------|--------|
| BalanceGroth16Verifier | 0xD28008...6Fd9 | ⏳ Pending |
| BalanceVerifier | 0xcc06a2...113F | ⏳ Pending |
| AssetOwnershipGroth16Verifier | 0xd4495D...3653 | ⏳ Pending |
| AssetOwnershipManager | 0xb42891...603B | ⏳ Pending |
| TransactionExistenceGroth16Verifier | 0x405aE9...f288 | ⏳ Pending |
| TransactionProofManager | 0xC3136b...7Cb2 | ⏳ Pending |
| VotingEligibilityGroth16Verifier | 0x6C0D05...Cf75 | ⏳ Pending |
| VotingEligibilityManager | 0xf8270B...F5b | ⏳ Pending |
| CollateralGroth16Verifier | 0xa3e8Eb...6287 | ⏳ Pending |
| CollateralManager | 0x598781...b249 | ⏳ Pending |
| AaveV3Adapter | 0x26D0C5...7cd2 | ⏳ Pending |

---

## ✅ Why Verify Contracts?

1. **Transparency**: Users can read the contract source code
2. **Trust**: Proves the deployed bytecode matches the source
3. **Interaction**: Etherscan provides a web interface to interact with verified contracts
4. **Grant Applications**: Verified contracts look more professional

---

## 🎯 Next Steps After Verification

1. **Test Frontend**: Run `cd frontend && npm run dev`
2. **Generate Proofs**: Test all 5 ZK circuits
3. **Test Aave Integration**: Try supply/borrow operations
4. **Record Demo**: Create video showing the working system
5. **Apply to Grants**: With fully verified, working contracts

---

## 📞 Need Help?

- **Scroll Docs**: https://docs.scroll.io/
- **Foundry Docs**: https://book.getfoundry.sh/
- **Etherscan API**: https://docs.scrollscan.com/

---

**Note**: Contracts are fully functional on Scroll Sepolia whether verified or not. Verification is primarily for transparency and ease of use through the Etherscan UI.
