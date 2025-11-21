import { useState } from 'react';
import {
  generateProof,
  formatProofForContract,
  getSampleInputs,
  estimateProofTime,
  CIRCUITS,
  CircuitName,
  ProofInputs,
  GeneratedProof,
} from '../lib/zkProofGenerator';

export function ProofGenerator() {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitName>('CollateralVerification');
  const [inputs, setInputs] = useState<ProofInputs>(() => getSampleInputs('CollateralVerification'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [proof, setProof] = useState<GeneratedProof | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const handleCircuitChange = (circuitName: CircuitName) => {
    setSelectedCircuit(circuitName);
    setInputs(getSampleInputs(circuitName));
    setProof(null);
    setError(null);
  };

  const handleInputChange = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateProof = async () => {
    setIsGenerating(true);
    setError(null);
    setProof(null);
    setGenerationTime(null);

    const startTime = Date.now();

    try {
      const generatedProof = await generateProof(selectedCircuit, inputs);
      const endTime = Date.now();

      setProof(generatedProof);
      setGenerationTime((endTime - startTime) / 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate proof');
      console.error('Proof generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSampleInputs = () => {
    setInputs(getSampleInputs(selectedCircuit));
  };

  const circuit = CIRCUITS[selectedCircuit];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">🔐 ZK Proof Generator</h2>
        <p className="text-blue-100">
          Generate zero-knowledge proofs directly in your browser. No installation required.
        </p>
      </div>

      {/* Circuit Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Proof Type
        </label>
        <select
          value={selectedCircuit}
          onChange={(e) => handleCircuitChange(e.target.value as CircuitName)}
          className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
        >
          {Object.entries(CIRCUITS).map(([name, config]) => (
            <option key={name} value={name}>
              {config.name} - {config.description}
            </option>
          ))}
        </select>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {circuit.description}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Estimated time: {estimateProofTime(selectedCircuit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Proof Inputs
          </h3>
          <button
            onClick={handleLoadSampleInputs}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            Load Sample Data
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(inputs).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white font-mono text-sm"
                placeholder={`Enter ${key}`}
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleGenerateProof}
          disabled={isGenerating}
          className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Proof...
            </span>
          ) : (
            '🔐 Generate ZK Proof'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-300">
                Error generating proof
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Proof Display */}
      {proof && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-300">
              Proof Generated Successfully!
            </h3>
          </div>

          {generationTime && (
            <p className="text-sm text-green-700 dark:text-green-400 mb-4">
              ⚡ Generated in {generationTime.toFixed(2)} seconds
            </p>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Proof Data
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(JSON.stringify(proof, null, 2))}
                className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(proof, null, 2)}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Next Steps:
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
              <li>Submit this proof to the smart contract for verification</li>
              <li>The proof is {JSON.stringify(proof).length} bytes</li>
              <li>Gas cost for verification: ~200,000 gas (~$0.01)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          How it works
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Proofs are generated entirely in your browser using WebAssembly</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Your private inputs never leave your device</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Uses Groth16 proof system with bn128 elliptic curve</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 dark:text-blue-400">•</span>
            <span>Each proof is ~800 bytes and takes 2-5 seconds to generate</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
