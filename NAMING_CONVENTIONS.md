# Naming Conventions

This document defines the professional naming conventions used throughout the zk-Cross-Chain Validator MVP project.

## 📁 Folder Structure

### Root-Level Folders

| Folder | Purpose | Convention |
|--------|---------|------------|
| `script/` | Foundry Solidity deployment scripts (`.s.sol`) | **Singular** - Required by Foundry framework |
| `scripts/` | Shell and Node.js automation scripts | **Plural** - Industry standard for auxiliary scripts |
| `src/` | Solidity smart contracts | Foundry convention |
| `test/` | Solidity test files | Foundry convention |
| `circuits/` | Circom ZK circuit definitions | Plural for multiple circuits |
| `frontend/` | Next.js web application | Standard web framework convention |
| `lib/` | External dependencies (Foundry) | Foundry convention |

### Why Both `script/` and `scripts/`?

This is a **professional standard** in Foundry/Ethereum projects:

- **`script/` (singular)** - Contains Foundry Solidity deployment scripts that use Foundry's VM
  - Required by Foundry's `forge script` command
  - Used by major projects: OpenZeppelin, Uniswap, Aave

- **`scripts/` (plural)** - Contains automation scripts in various languages
  - Shell scripts for CI/CD, testing, proof generation
  - Node.js scripts for blockchain interactions
  - Separate from Foundry's deployment infrastructure

## 📝 File Naming Conventions

### Solidity Files (`.sol`)

#### Smart Contracts
- **Convention:** PascalCase
- **Location:** `src/`
- **Examples:**
  ```
  BalanceVerifier.sol
  AaveV3Adapter.sol
  CollateralManager.sol
  TransactionExistenceVerifier.sol
  ```

#### Deployment Scripts
- **Convention:** PascalCase + `.s.sol` suffix
- **Location:** `script/`
- **Examples:**
  ```
  DeployBalanceVerifier.s.sol
  DeployAllVerifiers.s.sol
  ```

#### Test Files
- **Convention:** PascalCase + `.t.sol` suffix
- **Location:** `test/`
- **Examples:**
  ```
  BalanceVerifier.t.sol
  AaveIntegration.t.sol
  ```

### Circom Files (`.circom`)

- **Convention:** PascalCase
- **Location:** `circuits/`
- **Examples:**
  ```
  AccountBalanceProof.circom
  AssetOwnership.circom
  VotingEligibility.circom
  CollateralVerification.circom
  TransactionExistence.circom
  ```

### Shell Scripts (`.sh`)

- **Convention:** kebab-case (lowercase with hyphens)
- **Location:** `scripts/`
- **Examples:**
  ```
  generate-proof.sh
  run-full-test-suite.sh
  test-aave-integration.sh
  prepare-circuits-for-browser.sh
  verify-contracts.sh
  ```

### JavaScript/Node.js Scripts (`.js`)

- **Convention:** kebab-case (lowercase with hyphens)
- **Location:** `scripts/`
- **Rationale:** Consistency with shell scripts, easier to read in terminal
- **Examples:**
  ```
  deploy-to-scroll-sepolia.js
  generate-all-proofs.js
  generate-proof.js
  verify-on-chain.js
  ```

### TypeScript/React Files

#### Components (`.tsx`)
- **Convention:** PascalCase
- **Location:** `frontend/components/`
- **Examples:**
  ```
  ProofGenerator.tsx
  ProofVerifier.tsx
  TokenSelector.tsx
  ```

#### Utility Libraries (`.ts`)
- **Convention:** camelCase
- **Location:** `frontend/lib/`
- **Examples:**
  ```
  zkProofGenerator.ts
  tokens.ts
  utils.ts
  ```

#### Pages (`.tsx`)
- **Convention:** kebab-case (lowercase with hyphens)
- **Location:** `frontend/pages/`
- **Rationale:** Maps directly to URL routes
- **Examples:**
  ```
  index.tsx          → /
  dashboard.tsx      → /dashboard
  proof-generator.tsx → /proof-generator
  verify-proof.tsx   → /verify-proof
  aave.tsx          → /aave
  ```

### Configuration Files

- **Convention:** Standard ecosystem naming (lowercase, sometimes with dots/hyphens)
- **Location:** Root directory
- **Examples:**
  ```
  package.json
  foundry.toml
  .gitignore
  .env
  tsconfig.json
  next.config.mjs
  ```

### Documentation Files

- **Convention:** SCREAMING_SNAKE_CASE for root docs, kebab-case for nested
- **Location:** Root or subdirectories
- **Examples:**
  ```
  README.md
  CONTRIBUTING.md
  DEPLOYMENT_GUIDE.md
  NAMING_CONVENTIONS.md
  scripts/README.md
  frontend/README.md
  ```

## 🎯 Naming Patterns by Purpose

### Verifier Contracts
Pattern: `{UseCase}Verifier.sol`
```
BalanceVerifier.sol
AssetOwnershipVerifier.sol
TransactionExistenceVerifier.sol
VotingEligibilityVerifier.sol
CollateralVerifier.sol
```

### Manager Contracts
Pattern: `{UseCase}Manager.sol`
```
CollateralManager.sol
AssetOwnershipManager.sol
VotingEligibilityManager.sol
TransactionProofManager.sol
```

### Adapter Contracts
Pattern: `{Protocol}Adapter.sol`
```
AaveV3Adapter.sol
```

### ZK Circuits
Pattern: `{UseCase}{Type}.circom`
```
AccountBalanceProof.circom
AssetOwnership.circom
TransactionExistence.circom
VotingEligibility.circom
CollateralVerification.circom
```

## ✅ Best Practices

1. **Be Consistent** - Follow the conventions within each file type category
2. **Be Descriptive** - Names should clearly indicate purpose
3. **Avoid Abbreviations** - Use full words unless universally understood (e.g., ZK, NFT)
4. **No Spaces** - Use hyphens (kebab-case) or camelCase/PascalCase
5. **Match Ecosystem Standards** - Follow Foundry, Next.js, and Web3 conventions

## 🔄 Migration Guide

When renaming files:

1. **Update all references** in:
   - Import statements
   - Script paths
   - Documentation (README.md, DEPLOYMENT_GUIDE.md)
   - package.json scripts
   - CI/CD workflows

2. **Test after renaming**:
   ```bash
   # Test Solidity compilation
   forge build

   # Test Solidity tests
   forge test

   # Test frontend build
   cd frontend && npm run build

   # Test scripts
   ./scripts/run-full-test-suite.sh
   ```

3. **Commit with clear message**:
   ```bash
   git add .
   git commit -m "refactor: standardize naming conventions across project"
   ```

## 📚 References

- [Foundry Best Practices](https://book.getfoundry.sh/)
- [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- [Next.js Routing Conventions](https://nextjs.org/docs/routing/introduction)
- [JavaScript Naming Conventions](https://www.robinwieruch.de/javascript-naming-conventions/)
