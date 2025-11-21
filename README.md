# zk-Cross-Chain Validator MVP

> ⚠️ **PROJECT ARCHIVED - November 21, 2025**
>
> This project has been archived due to lack of market validation and no clear product-market fit. The technology works correctly, but there is no evidence of real user demand. Grant funding applications were rejected.
>
> **Status:** Technical demonstration only. No further development planned.
>
> See [PROJECT_ARCHIVE.md](PROJECT_ARCHIVE.md) for full details and lessons learned.

---

A proof-of-concept project that demonstrates secure, privacy-preserving, and cost-effective cross-chain validation using zero-knowledge proofs (zk-SNARKs) on Layer 2. This MVP is built with a modular architecture to enable future expansion of data input use cases.

## Overview

The zk-Cross-Chain Validator MVP is designed to validate blockchain data off-chain via zk circuits and verify it on-chain through a Solidity verifier deployed on a Layer 2 testnet (e.g., Scroll Testnet). The system is modular, allowing additional data input types to be integrated later.

## Data Input Use Cases

The MVP supports five prioritized use cases, each implemented as its own zk circuit to validate specific data conditions:

1. **Account Balance Verification**  
   _Objective:_ Prove that an account's balance exceeds a predefined threshold.  
   _Input:_ Account address, reported balance, threshold value.  
   _Relevance:_ Ensures eligibility for DeFi applications (e.g., staking or lending).

2. **Asset Ownership Confirmation**  
   _Objective:_ Confirm ownership of a specific token or NFT.  
   _Input:_ Account address, asset identifier (token ID/contract address), proof data.  
   _Relevance:_ Supports cross-chain asset bridging and NFT validation.

3. **Transaction Existence Proof**  
   _Objective:_ Prove that a particular transaction occurred on a source chain.  
   _Input:_ Transaction hash, block data, Merkle proof of inclusion.  
   _Relevance:_ Useful for audit trails and verifying cross-chain activity.

4. **Cross-Chain Voting Eligibility**  
   _Objective:_ Validate that a user meets criteria (e.g., minimum stake) for governance participation.  
   _Input:_ Account address, voting threshold, current stake/balance.  
   _Relevance:_ Enables secure and private cross-chain voting mechanisms.

5. **Collateral Verification for Lending**  
   _Objective:_ Prove that a user holds sufficient collateral for a lending protocol.  
   _Input:_ Account address, collateral asset details, collateral amount, required minimum.  
   _Relevance:_ Facilitates risk management in cross-chain DeFi lending.

Each use case is isolated in its own circuit, enabling independent development and future expansion.

## Technical Architecture

### Off-Chain Component

- **zk Circuits:** Developed in Circom (or Noir). Each circuit validates one of the five use cases.
- **Proof Generation:** Utilize `circom` and `snarkjs` to compile circuits, generate witnesses, and produce zk proofs.
- **Modularity:** The design allows additional circuits to be integrated without impacting existing ones.

### On-Chain Component

- **Verifier Contract:** A Solidity contract (developed and tested with Foundry) that accepts zk proofs and public inputs, verifying them on-chain.
- **Extensible Interface:** Designed to support multiple data input types via modular functions.

### Integration Scripts

- **Automation:** Node.js scripts (using Ethers.js) that tie the off-chain proof generation and on-chain verification into a seamless pipeline.

## Prerequisites

- **Software:** Node.js (v14+), Foundry, Circom, snarkjs
- **Environment:** Access to a Layer 2 testnet (e.g., Scroll Testnet)
- **Expertise:** Familiarity with zero-knowledge proofs, Solidity (v0.8.x), and JavaScript

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/edsphinx/zk-cross-chain-validator.git
   cd zk-cross-chain-validator
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Circom and snarkjs:**
   Follow the [Circom installation guide](https://docs.circom.io/getting-started/installation/) to install Circom and snarkjs globally.

## Folder Structure

```bash
 zk-cross-chain-validator/
 ├── contracts/         # Contratos Solidity (por ejemplo, Verifier.sol)
 ├── circuits/          # Archivos de los zk-circuits (ej. AccountBalanceProof.circom)
 ├── script/            # Scripts de despliegue Solidity (ej. DeployAllVerifiers.s.sol)
 ├── scripts/           # Scripts de automatización (bash y Node.js)
 ├── src/               # Contratos inteligentes principales
 ├── tests/             # Pruebas unitarias (por ejemplo, tests con Foundry)
 ├── docs/              # Documentación adicional y diagramas
 ├── .gitignore         # Ignorar archivos innecesarios (Node, compilados, etc.)
 ├── README.md          # Documentación principal del proyecto
 └── package.json       # Dependencias y scripts de Node.js
```

## Usage

### Off-Chain Proof Generation

For each use case, compile the corresponding zk circuit. For example, for Account Balance Verification:

1. **Compile the Circuit:**

   ```bash
   circom circuits/AccountBalanceProof.circom --r1cs --wasm --sym
   ```

2. **Generate the Witness and Proof:**

   ```bash
   node circuits/AccountBalanceProof_js/generate_witness.js circuits/AccountBalanceProof_js/AccountBalanceProof.wasm input.json witness.wtns
   snarkjs groth16 prove circuits/AccountBalanceProof.r1cs pot12_final.ptau witness.wtns proof.json public.json
   ```

   Repeat similar steps for the other circuits.

### On-Chain Verification

1. **Deploy the Verifier Contract:**
   Use Foundry to deploy the contract on Scroll Testnet:

   ```bash
   forge script script/DeployVerifier.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
   ```

2. **Verify the Proof:**
   Run the integration script to submit the proof and public inputs:

   ```bash
   node scripts/verify-on-chain.js --contract <deployed_address> --proof proof.json --public public.json
   ```

### Testing

Run unit tests using Foundry:

```bash
forge test
```

## Future Roadmap

With additional support, the project will evolve as follows:

1. **Advanced Proof Aggregation:**
   Aggregate multiple zk proofs into a single succinct proof to lower on-chain verification costs.

2. **Universal zk Verifier (WASM-Based):**
   Develop a WASM-based verifier for chain-agnostic proof validation.

3. **Expanded Data Input Modules:**
   Integrate additional modular circuits for new use cases (e.g., dynamic collateral adjustment, multi-token verification).

4. **User Interface Development:**
   Build a dashboard for users to generate proofs, submit verifications, and monitor status.

5. **Enhanced Security & Scalability:**
   Conduct comprehensive audits and optimize the system for production deployment.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Deploy and verify contracts |
| **[scripts/README.md](./scripts/README.md)** | Test scripts and automation |
| **[frontend/README.md](./frontend/README.md)** | Frontend setup and usage |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | How to contribute |

## 🚀 Quick Start

### Generate ZK Proofs (No Installation Required)

```bash
# Start frontend
cd frontend
npm install
npm run dev

# Visit http://localhost:3000/proof-generator
# - Select proof type
# - Enter inputs
# - Generate proof in browser (2-5 seconds)
```

### Run Complete Test Suite

```bash
./scripts/run-full-test-suite.sh
```

### Test Aave Integration

```bash
./scripts/test-aave-integration.sh YOUR_WALLET_ADDRESS
```

## 📊 Current Status

✅ **Production-Ready Testnet**

- 11/11 contracts deployed & verified on Scroll Sepolia
- 5/5 ZK circuits generating real proofs
- Browser-based proof generation (zero installation)
- Live Aave V3 integration
- 83% test pass rate

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployed addresses.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Circom](https://docs.circom.io/)
- [snarkjs](https://github.com/iden3/snarkjs)
- [Foundry](https://book.getfoundry.sh/)
- The open-source community and projects that have inspired this work.
  - [Scroll](https://scroll.io/)
  - [Filosofía Código](https://www.youtube.com/c/FilosofiaCodigo)
  - [Succinct Labs](https://www.succinct.xyz/)
  - [Lagrange Labs](https://www.lagrange.dev/)
  - [zkBridge](https://www.zkbridge.com/)
  - [Herodotous](https://herodotus.dev/)
  - [=nil; Foundation](https://nil.foundation/)
