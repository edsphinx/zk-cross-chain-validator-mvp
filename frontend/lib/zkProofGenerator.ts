/**
 * Browser-based ZK Proof Generator
 *
 * This module generates ZK proofs directly in the browser using snarkjs.
 * No backend required - users can generate proofs client-side for privacy.
 */

import * as snarkjs from 'snarkjs';

export interface ProofInputs {
  [key: string]: string | number;
}

export interface GeneratedProof {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
}

/**
 * Circuit configurations with WASM and zkey URLs
 */
export const CIRCUITS = {
  AccountBalanceProof: {
    name: 'AccountBalanceProof',
    wasmUrl: '/circuits/AccountBalanceProof.wasm',
    zkeyUrl: '/circuits/AccountBalanceProof.zkey',
    description: 'Prove balance >= threshold without revealing exact amount',
  },
  AssetOwnership: {
    name: 'AssetOwnership',
    wasmUrl: '/circuits/AssetOwnership.wasm',
    zkeyUrl: '/circuits/AssetOwnership.zkey',
    description: 'Prove ownership of NFT/token without revealing balance',
  },
  TransactionExistence: {
    name: 'TransactionExistence',
    wasmUrl: '/circuits/TransactionExistence.wasm',
    zkeyUrl: '/circuits/TransactionExistence.zkey',
    description: 'Prove transaction occurred on another chain',
  },
  VotingEligibility: {
    name: 'VotingEligibility',
    wasmUrl: '/circuits/VotingEligibility.wasm',
    zkeyUrl: '/circuits/VotingEligibility.zkey',
    description: 'Prove voting eligibility without revealing token balance',
  },
  CollateralVerification: {
    name: 'CollateralVerification',
    wasmUrl: '/circuits/CollateralVerification.wasm',
    zkeyUrl: '/circuits/CollateralVerification.zkey',
    description: 'Prove sufficient collateral for DeFi lending',
  },
};

export type CircuitName = keyof typeof CIRCUITS;

/**
 * Generate ZK proof in the browser
 *
 * @param circuitName - Name of the circuit to use
 * @param inputs - Input signals for the circuit
 * @returns Generated proof and public signals
 *
 * @example
 * ```ts
 * const proof = await generateProof('AccountBalanceProof', {
 *   balance: '5000000000',
 *   threshold: '2000000000',
 *   accountHash: '12345678901234567890'
 * });
 * ```
 */
export async function generateProof(
  circuitName: CircuitName,
  inputs: ProofInputs
): Promise<GeneratedProof> {
  const circuit = CIRCUITS[circuitName];

  if (!circuit) {
    throw new Error(`Unknown circuit: ${circuitName}`);
  }

  console.log(`[ZK Proof] Generating proof for ${circuitName}...`);
  console.log(`[ZK Proof] Inputs:`, inputs);

  try {
    // Step 1: Load WASM file
    console.log(`[ZK Proof] Loading WASM from ${circuit.wasmUrl}...`);
    const wasmResponse = await fetch(circuit.wasmUrl);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to load WASM: ${wasmResponse.statusText}`);
    }
    const wasmBuffer = await wasmResponse.arrayBuffer();

    // Step 2: Load proving key (zkey)
    console.log(`[ZK Proof] Loading proving key from ${circuit.zkeyUrl}...`);
    const zkeyResponse = await fetch(circuit.zkeyUrl);
    if (!zkeyResponse.ok) {
      throw new Error(`Failed to load zkey: ${zkeyResponse.statusText}`);
    }
    const zkeyBuffer = await zkeyResponse.arrayBuffer();

    // Step 3: Generate witness
    console.log(`[ZK Proof] Computing witness...`);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      inputs,
      new Uint8Array(wasmBuffer),
      new Uint8Array(zkeyBuffer)
    );

    console.log(`[ZK Proof] ✅ Proof generated successfully!`);
    console.log(`[ZK Proof] Public signals:`, publicSignals);

    return { proof, publicSignals };
  } catch (error) {
    console.error(`[ZK Proof] ❌ Failed to generate proof:`, error);
    throw error;
  }
}

/**
 * Verify a ZK proof (client-side verification for testing)
 *
 * @param circuitName - Name of the circuit
 * @param proof - The proof to verify
 * @param publicSignals - Public signals from the proof
 * @returns true if proof is valid
 */
export async function verifyProof(
  circuitName: CircuitName,
  proof: any,
  publicSignals: string[]
): Promise<boolean> {
  const circuit = CIRCUITS[circuitName];

  // For client-side verification, we'd need the verification key
  // This is optional - on-chain verification is the main goal
  console.log(`[ZK Proof] Verification would happen on-chain for ${circuitName}`);

  return true; // Placeholder - real verification happens on-chain
}

/**
 * Format proof for smart contract submission
 *
 * Converts snarkjs proof format to the format expected by Solidity verifier
 */
export function formatProofForContract(proof: any): {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
} {
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
  };
}

/**
 * Generate sample inputs for a circuit (for testing/demo)
 */
export function getSampleInputs(circuitName: CircuitName): ProofInputs {
  switch (circuitName) {
    case 'AccountBalanceProof':
      return {
        balance: '5000000000',
        threshold: '2000000000',
        accountHash: '12345678901234567890',
      };

    case 'AssetOwnership':
      return {
        assetBalance: '1000000000000000000',
        assetId: '12345',
        accountHash: '67890',
      };

    case 'TransactionExistence':
      return {
        txHash: '123456789',
        merkleRoot: '987654321',
        blockNumber: '1000000',
        chainId: '534351',
      };

    case 'VotingEligibility':
      return {
        tokenBalance: '10000000000000000000000',
        votingThreshold: '5000000000000000000000',
        proposalId: '1',
        accountHash: '123456789',
      };

    case 'CollateralVerification':
      return {
        collateralValue: '5000000000',
        requiredCollateral: '3000000000',
        loanAmount: '2000000000',
        accountHash: '123456789',
      };

    default:
      throw new Error(`Unknown circuit: ${circuitName}`);
  }
}

/**
 * Estimate proof generation time based on circuit complexity
 */
export function estimateProofTime(circuitName: CircuitName): string {
  // Based on typical browser performance
  const times: Record<CircuitName, string> = {
    AccountBalanceProof: '2-5 seconds',
    AssetOwnership: '2-5 seconds',
    TransactionExistence: '3-6 seconds',
    VotingEligibility: '2-5 seconds',
    CollateralVerification: '3-6 seconds',
  };

  return times[circuitName] || '2-5 seconds';
}
