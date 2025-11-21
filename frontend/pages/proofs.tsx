import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { ProofGenerator } from '../components/ProofGenerator';
import { ProofVerifier } from '../components/ProofVerifier';

const ProofsPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'verify'>('generate');

  return (
    <>
      <Head>
        <title>ZK Proofs - Generate & Verify - ZK Cross-Chain Validator</title>
        <meta
          name="description"
          content="Generate and verify zero-knowledge proofs for privacy-preserving DeFi operations"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🔐 Zero-Knowledge Proofs
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Generate and verify ZK proofs for privacy-preserving blockchain operations
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 justify-center">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === 'generate'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span>Generate Proof</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('verify')}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === 'verify'
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Verify Proof</span>
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'generate' && <ProofGenerator />}
            {activeTab === 'verify' && <ProofVerifier />}
          </div>

          {/* Feature Comparison */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What's the Difference?
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Generate Proof
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create a zero-knowledge proof from your private data. Runs entirely in your browser - your data never leaves your device.
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-500">
                      <li>• Takes 2-5 seconds</li>
                      <li>• No installation required</li>
                      <li>• 100% client-side</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Verify Proof
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Check if a proof is valid using on-chain verifier contracts. Anyone can verify a proof without seeing private data.
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-500">
                      <li>• On-chain verification</li>
                      <li>• ~200K gas (~$0.01)</li>
                      <li>• Cryptographically secure</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProofsPage;
