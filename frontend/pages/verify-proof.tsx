import type { NextPage } from 'next';
import Head from 'next/head';
import { ProofVerifier } from '../components/ProofVerifier';

const VerifyProofPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Verify ZK Proof - ZK Cross-Chain Validator</title>
        <meta
          name="description"
          content="Verify zero-knowledge proofs on-chain using Groth16 verifier contracts on Scroll Sepolia"
        />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <ProofVerifier />
      </div>
    </>
  );
};

export default VerifyProofPage;
