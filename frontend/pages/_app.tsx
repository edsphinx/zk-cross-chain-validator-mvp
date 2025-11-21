import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { scrollSepolia } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [scrollSepolia],
  [publicProvider()]
);

// Configure wallets
const { wallets } = getDefaultWallets({
  appName: 'ZK Cross-Chain Validator',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains
});

const connectors = connectorsForWallets([
  ...wallets,
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
