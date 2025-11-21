// Token configuration for Scroll Sepolia
export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: string;
  iconUrl: string;
  coingeckoId?: string;
}

// Aave V3 Scroll Sepolia Test Tokens
export const TOKENS: Record<string, Token> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D',
    decimals: 6,
    icon: '💵',
    iconUrl: 'https://app.aave.com/icons/tokens/usdc.svg',
    coingeckoId: 'usd-coin'
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40',
    decimals: 18,
    icon: '🪙',
    iconUrl: 'https://app.aave.com/icons/tokens/dai.svg',
    coingeckoId: 'dai'
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xb123dCe044EdF0a755505d9623Fba16C0F41cae9',
    decimals: 18,
    icon: '💎',
    iconUrl: 'https://app.aave.com/icons/tokens/weth.svg',
    coingeckoId: 'weth'
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x5ea79f3190ff37418d42f9b2618688494dbd9693',
    decimals: 8,
    icon: '₿',
    iconUrl: 'https://app.aave.com/icons/tokens/wbtc.svg',
    coingeckoId: 'wrapped-bitcoin'
  },
  AAVE: {
    symbol: 'AAVE',
    name: 'Aave Token',
    address: '0xfc2921be7b2762f0e87039905d6019b0ff5978a8',
    decimals: 18,
    icon: '🔷',
    iconUrl: 'https://app.aave.com/icons/tokens/aave.svg',
    coingeckoId: 'aave'
  },
  LINK: {
    symbol: 'LINK',
    name: 'Chainlink',
    address: '0x279cbf5b7e3651f03cb9b71a9e7a3c924b267801',
    decimals: 18,
    icon: '🔗',
    iconUrl: 'https://app.aave.com/icons/tokens/link.svg',
    coingeckoId: 'chainlink'
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x186c0c26c45a8da1da34339ee513624a9609156d',
    decimals: 6,
    icon: '💲',
    iconUrl: 'https://app.aave.com/icons/tokens/usdt.svg',
    coingeckoId: 'tether'
  },
  EURS: {
    symbol: 'EURS',
    name: 'STASIS EURO',
    address: '0xdf40f3a3566b4271450083f1ad5732590ba47575',
    decimals: 2,
    icon: '€',
    iconUrl: 'https://app.aave.com/icons/tokens/eurs.svg',
    coingeckoId: 'stasis-eurs'
  }
};

// Get token by address
export function getTokenByAddress(address: string): Token | undefined {
  return Object.values(TOKENS).find(
    t => t.address.toLowerCase() === address.toLowerCase()
  );
}

// Get token list as array
export function getTokenList(): Token[] {
  return Object.values(TOKENS);
}

// Format token amount with proper decimals
export function formatTokenAmount(amount: string, decimals: number): string {
  try {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals > 6 ? 6 : decimals
    });
  } catch {
    return '0.00';
  }
}

// Aave V3 addresses
export const AAVE_ADDRESSES = {
  POOL: '0x48914C788295b5db23aF2b5F0B3BE775C4eA9440',
  FAUCET: '0x2F826FD1a0071476330a58dD1A9B36bcF7da832d',
  POOL_DATA_PROVIDER: '0x1D01f7d8B42Ec47837966732f831E1D6321df499'
};

// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  BALANCE_MANAGER: process.env.NEXT_PUBLIC_BALANCE_MANAGER || '0xcc06a2109fD6D4DF459fd225cA50681a9335113F',
  ASSET_MANAGER: process.env.NEXT_PUBLIC_ASSET_MANAGER || '0xb42891Ee97591aAF8edfe1d3Cf253a569986603B',
  TX_MANAGER: process.env.NEXT_PUBLIC_TX_MANAGER || '0xC3136b612637EFdCA1015B2082EEdABF204B7Cb2',
  VOTING_MANAGER: process.env.NEXT_PUBLIC_VOTING_MANAGER || '0xf8270B6e1D07112512c6802E70Eee5D0b0988F5b',
  COLLATERAL_MANAGER: process.env.NEXT_PUBLIC_COLLATERAL_MANAGER || '0x5987817C0dA0a87bAfC48E399a73c6D33f60b249',
  AAVE_ADAPTER: process.env.NEXT_PUBLIC_AAVE_ADAPTER || '0x26D0C5DF2e47170EF8841D4231682Bc23ec27cd2'
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '534351'),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia-rpc.scroll.io/',
  blockExplorer: 'https://sepolia.scrollscan.com',
  name: 'Scroll Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
};
