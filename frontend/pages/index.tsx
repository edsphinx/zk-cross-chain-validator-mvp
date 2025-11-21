import Head from 'next/head';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>ZK Cross-Chain Validator | Privacy-Preserving Verification</title>
        <meta name="description" content="Zero-Knowledge proof system for cross-chain validation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <header className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ZK</span>
              </div>
              <span className="text-white font-bold text-xl">Cross-Chain Validator</span>
            </div>
            <ConnectButton />
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6">
              Privacy-Preserving
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                ZK Verification
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Prove balances, ownership, and eligibility without revealing sensitive data.
              Powered by Zero-Knowledge proofs on Scroll Sepolia.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition">
                Launch App
              </Link>
              <Link href="/docs" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition">
                Documentation
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
            {/* Circuit 1 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition">
              <div className="text-blue-400 text-3xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Balance Verification</h3>
              <p className="text-gray-400 mb-4">
                Prove your balance meets a threshold without revealing the exact amount.
              </p>
              <Link href="/dashboard?circuit=balance" className="text-blue-400 hover:text-blue-300">
                Try it →
              </Link>
            </div>

            {/* Circuit 2 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition">
              <div className="text-purple-400 text-3xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-white mb-2">Asset Ownership</h3>
              <p className="text-gray-400 mb-4">
                Prove NFT or token ownership without revealing your collection.
              </p>
              <Link href="/dashboard?circuit=asset" className="text-purple-400 hover:text-purple-300">
                Try it →
              </Link>
            </div>

            {/* Circuit 3 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition">
              <div className="text-green-400 text-3xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-white mb-2">Transaction Proof</h3>
              <p className="text-gray-400 mb-4">
                Verify cross-chain transactions without exposing details.
              </p>
              <Link href="/dashboard?circuit=transaction" className="text-green-400 hover:text-green-300">
                Try it →
              </Link>
            </div>

            {/* Circuit 4 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition">
              <div className="text-yellow-400 text-3xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold text-white mb-2">Voting Eligibility</h3>
              <p className="text-gray-400 mb-4">
                Prove voting rights without revealing token holdings.
              </p>
              <Link href="/dashboard?circuit=voting" className="text-yellow-400 hover:text-yellow-300">
                Try it →
              </Link>
            </div>

            {/* Circuit 5 */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-red-500 transition">
              <div className="text-red-400 text-3xl mb-4">🏦</div>
              <h3 className="text-xl font-bold text-white mb-2">Collateral Verification</h3>
              <p className="text-gray-400 mb-4">
                Prove sufficient collateral for DeFi lending privately.
              </p>
              <Link href="/dashboard?circuit=collateral" className="text-red-400 hover:text-red-300">
                Try it →
              </Link>
            </div>

            {/* Aave Integration */}
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 border border-purple-500">
              <div className="text-white text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Aave V3 Integration</h3>
              <p className="text-gray-200 mb-4">
                Borrow from Aave with ZK collateral proofs on Scroll Sepolia!
              </p>
              <Link href="/aave" className="text-white hover:text-gray-200 font-semibold">
                Use Aave →
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">5</div>
              <div className="text-gray-400">ZK Circuits</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">11</div>
              <div className="text-gray-400">Smart Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">~250K</div>
              <div className="text-gray-400">Gas per Proof</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-gray-400">Privacy</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 mt-20">
          <div className="container mx-auto px-4 py-8 text-center text-gray-400">
            <p>Powered by Groth16 • Deployed on Scroll Sepolia</p>
            <div className="mt-4 flex justify-center space-x-6">
              <a href="https://github.com/edsphinx/zk-cross-chain-validator-mvp" className="hover:text-white">GitHub</a>
              <a href="/docs" className="hover:text-white">Docs</a>
              <a href="https://docs.scroll.io" className="hover:text-white">Scroll</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
