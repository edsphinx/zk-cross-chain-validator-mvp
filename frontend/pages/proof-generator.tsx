import type { NextPage } from 'next';
import Head from 'next/head';
import { ProofGenerator } from '../components/ProofGenerator';

const ProofGeneratorPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>ZK Proof Generator - ZK Cross-Chain Validator</title>
        <meta
          name="description"
          content="Generate zero-knowledge proofs directly in your browser for privacy-preserving DeFi operations"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <ProofGenerator />
      </div>
    </>
  );
};

export default ProofGeneratorPage;
