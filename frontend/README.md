# ZK Cross-Chain Validator Frontend

Modern web interface for generating and verifying Zero-Knowledge proofs on Scroll Sepolia.

## Features

- 🔐 **5 ZK Circuits** - Balance, Asset, Transaction, Voting, Collateral
- 🌐 **Web3 Integration** - Connect with MetaMask, WalletConnect
- ⚡ **Aave V3** - Real DeFi integration on Scroll Sepolia
- 📊 **Live Dashboard** - Track proofs and metrics
- 🎨 **Modern UI** - Built with Next.js, React, and Tailwind CSS

## Quick Start

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment

Create `.env.local`:

```env
# Contract Addresses (from deployment)
NEXT_PUBLIC_BALANCE_MANAGER=0x...
NEXT_PUBLIC_ASSET_MANAGER=0x...
NEXT_PUBLIC_TX_MANAGER=0x...
NEXT_PUBLIC_VOTING_MANAGER=0x...
NEXT_PUBLIC_COLLATERAL_MANAGER=0x...
NEXT_PUBLIC_AAVE_ADAPTER=0x...

# RPC
NEXT_PUBLIC_RPC_URL=https://sepolia-rpc.scroll.io/
NEXT_PUBLIC_CHAIN_ID=534351

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Usage

### 1. Connect Wallet

Click "Connect Wallet" and choose MetaMask or WalletConnect.

### 2. Generate Proof

1. Navigate to desired circuit (Balance, Asset, etc.)
2. Fill in the proof parameters
3. Click "Generate Proof" (takes ~1-2 seconds)
4. Proof is generated locally in your browser

### 3. Verify On-Chain

1. Review the generated proof
2. Click "Verify On-Chain"
3. Confirm transaction in wallet
4. View transaction on Scroll Sepolia explorer

### 4. Use with Aave

Go to "Aave Integration" page:
1. Generate collateral proof
2. Supply collateral to Aave
3. Borrow assets with ZK proof!

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **RainbowKit** - Wallet connection
- **Wagmi** - Ethereum hooks
- **Ethers.js v6** - Blockchain interaction
- **snarkjs** - ZK proof generation (client-side)

## Project Structure

```
frontend/
├── pages/
│   ├── index.tsx          # Landing page
│   ├── dashboard.tsx      # Main dashboard
│   ├── aave.tsx          # Aave integration
│   └── _app.tsx          # App configuration
├── components/
│   ├── ProofGenerator/   # Proof generation components
│   ├── CircuitSelector/  # Circuit selection
│   └── WalletConnect/    # Wallet connection
├── lib/
│   ├── contracts.ts      # Contract ABIs and addresses
│   ├── proofGenerator.ts # ZK proof generation logic
│   └── utils.ts          # Helper functions
└── styles/
    └── globals.css       # Global styles
```

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/edsphinx/zk-cross-chain-validator-mvp/tree/main/frontend)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BALANCE_MANAGER` | Balance Verifier Manager address | `0x...` |
| `NEXT_PUBLIC_ASSET_MANAGER` | Asset Ownership Manager address | `0x...` |
| `NEXT_PUBLIC_TX_MANAGER` | Transaction Proof Manager address | `0x...` |
| `NEXT_PUBLIC_VOTING_MANAGER` | Voting Eligibility Manager address | `0x...` |
| `NEXT_PUBLIC_COLLATERAL_MANAGER` | Collateral Manager address | `0x...` |
| `NEXT_PUBLIC_AAVE_ADAPTER` | Aave V3 Adapter address | `0x...` |
| `NEXT_PUBLIC_RPC_URL` | Scroll Sepolia RPC | `https://sepolia-rpc.scroll.io/` |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID | `534351` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect ID | Get from cloud.walletconnect.com |

## Features by Page

### Landing Page (`/`)

- Hero section
- Feature cards for all 5 circuits
- Aave integration highlight
- Statistics dashboard
- Connect wallet

### Dashboard (`/dashboard`)

- Circuit selector
- Proof generator interface
- Transaction history
- Gas cost tracker
- Success/failure metrics

### Aave Integration (`/aave`)

- Collateral proof generator
- Supply/Borrow interface
- Health factor monitor
- Active loans tracker
- Repayment interface

## Development

### Adding a New Circuit

1. Add circuit config to `lib/circuits.ts`
2. Create component in `components/`
3. Add route to dashboard
4. Update contract addresses

### Testing

```bash
# Run tests (when implemented)
npm test
```

## Troubleshooting

### Wallet Connection Issues

- Ensure MetaMask is on Scroll Sepolia
- Add network manually if needed:
  - RPC: https://sepolia-rpc.scroll.io/
  - Chain ID: 534351
  - Currency: ETH

### Proof Generation Fails

- Check browser console for errors
- Ensure input values are valid
- Try with smaller numbers first

### Transaction Fails

- Check you have enough ETH for gas
- Verify contract addresses are correct
- Check Scroll Sepolia status

## Resources

- [Scroll Documentation](https://docs.scroll.io/)
- [Aave V3 Docs](https://docs.aave.com/)
- [ZK Proofs Guide](https://zkp.science/)
- [Next.js Docs](https://nextjs.org/docs)

## Support

- GitHub Issues: [Create an issue](https://github.com/edsphinx/zk-cross-chain-validator-mvp/issues)
- Discord: Coming soon
- Documentation: `/docs`

## License

MIT License - see LICENSE file for details
