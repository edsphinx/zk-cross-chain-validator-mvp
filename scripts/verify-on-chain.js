require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * Verify a ZK proof on-chain using the BalanceVerifier contract
 */
class OnChainVerifier {
    constructor(rpcUrl, privateKey, contractAddress) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contractAddress = contractAddress;

        // Load contract ABI
        const abiPath = path.join(__dirname, '../build/BalanceVerifier.json');
        if (fs.existsSync(abiPath)) {
            const artifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
            this.abi = artifact.abi;
        } else {
            // If ABI file doesn't exist, use the interface we need
            this.abi = [
                'function verifyBalanceProof(uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC, uint[2] memory pubSignals, address account) public returns (bool)',
                'function verifyProofOnly(uint[2] memory pA, uint[2][2] memory pB, uint[2] memory pC, uint[2] memory pubSignals) public view returns (bool)',
                'function isProofVerified(address account, uint256 threshold, uint256 accountHash) public view returns (bool verified, uint256 timestamp)',
                'function getProof(address account, uint256 threshold, uint256 accountHash) public view returns (tuple(address account, uint256 threshold, uint256 accountHash, uint256 timestamp, bool verified))',
                'event ProofVerified(address indexed account, uint256 indexed threshold, uint256 accountHash, uint256 timestamp)',
                'event ProofVerificationFailed(address indexed account, uint256 threshold, uint256 accountHash)'
            ];
        }

        this.contract = new ethers.Contract(this.contractAddress, this.abi, this.wallet);
    }

    /**
     * Format proof data for contract call
     */
    formatProof(proof, publicSignals) {
        return {
            pA: [proof.pi_a[0], proof.pi_a[1]],
            pB: [
                [proof.pi_b[0][1], proof.pi_b[0][0]],
                [proof.pi_b[1][1], proof.pi_b[1][0]]
            ],
            pC: [proof.pi_c[0], proof.pi_c[1]],
            pubSignals: publicSignals
        };
    }

    /**
     * Verify proof on-chain (view function, no gas cost)
     */
    async verifyProofView(proof, publicSignals) {
        console.log('🔍 Verifying proof on-chain (view)...');

        try {
            const formatted = this.formatProof(proof, publicSignals);
            const isValid = await this.contract.verifyProofOnly(
                formatted.pA,
                formatted.pB,
                formatted.pC,
                formatted.pubSignals
            );

            console.log(`   Result: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
            return isValid;
        } catch (error) {
            console.error('❌ Error verifying proof:', error.message);
            throw error;
        }
    }

    /**
     * Submit and store proof on-chain (transaction, costs gas)
     */
    async submitProof(proof, publicSignals, accountAddress) {
        console.log('📤 Submitting proof to blockchain...');
        console.log(`   Account: ${accountAddress}`);
        console.log(`   Threshold: ${publicSignals[0]}`);
        console.log(`   Account Hash: ${publicSignals[1]}`);

        try {
            const formatted = this.formatProof(proof, publicSignals);

            // Estimate gas
            const gasEstimate = await this.contract.verifyBalanceProof.estimateGas(
                formatted.pA,
                formatted.pB,
                formatted.pC,
                formatted.pubSignals,
                accountAddress
            );

            console.log(`   Estimated gas: ${gasEstimate.toString()}`);

            // Submit transaction
            const tx = await this.contract.verifyBalanceProof(
                formatted.pA,
                formatted.pB,
                formatted.pC,
                formatted.pubSignals,
                accountAddress,
                { gasLimit: gasEstimate * 120n / 100n } // 20% buffer
            );

            console.log(`   Transaction hash: ${tx.hash}`);
            console.log('   Waiting for confirmation...');

            const receipt = await tx.wait();
            console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
            console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

            // Check for events
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contract.interface.parseLog(log);
                    return parsed && parsed.name === 'ProofVerified';
                } catch {
                    return false;
                }
            });

            if (event) {
                const parsed = this.contract.interface.parseLog(event);
                console.log('\n🎉 Proof verified and stored on-chain!');
                console.log(`   Timestamp: ${new Date(Number(parsed.args.timestamp) * 1000).toISOString()}`);
            }

            return receipt;
        } catch (error) {
            console.error('❌ Error submitting proof:', error.message);
            throw error;
        }
    }

    /**
     * Check if a proof has been verified for an account
     */
    async checkProofStatus(accountAddress, threshold, accountHash) {
        console.log('🔍 Checking proof status...');
        console.log(`   Account: ${accountAddress}`);
        console.log(`   Threshold: ${threshold}`);
        console.log(`   Account Hash: ${accountHash}`);

        try {
            const [verified, timestamp] = await this.contract.isProofVerified(
                accountAddress,
                threshold,
                accountHash
            );

            if (verified) {
                console.log('   ✅ Proof exists and is verified');
                console.log(`   Verified at: ${new Date(Number(timestamp) * 1000).toISOString()}`);
            } else {
                console.log('   ❌ No verified proof found');
            }

            return { verified, timestamp: Number(timestamp) };
        } catch (error) {
            console.error('❌ Error checking proof status:', error.message);
            throw error;
        }
    }

    /**
     * Get full proof details
     */
    async getProofDetails(accountAddress, threshold, accountHash) {
        console.log('📋 Fetching proof details...');

        try {
            const proofData = await this.contract.getProof(
                accountAddress,
                threshold,
                accountHash
            );

            console.log('\nProof Details:');
            console.log(`   Account: ${proofData.account}`);
            console.log(`   Threshold: ${proofData.threshold.toString()}`);
            console.log(`   Account Hash: ${proofData.accountHash.toString()}`);
            console.log(`   Timestamp: ${new Date(Number(proofData.timestamp) * 1000).toISOString()}`);
            console.log(`   Verified: ${proofData.verified}`);

            return proofData;
        } catch (error) {
            console.error('❌ Error fetching proof details:', error.message);
            throw error;
        }
    }
}

// CLI usage
if (require.main === module) {
    const { loadProof } = require('./generateProof');

    const command = process.argv[2];

    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
        console.error('❌ Error: RPC_URL and PRIVATE_KEY must be set in .env file');
        process.exit(1);
    }

    if (!process.env.CONTRACT_ADDRESS) {
        console.error('❌ Error: CONTRACT_ADDRESS must be set in .env file');
        process.exit(1);
    }

    const verifier = new OnChainVerifier(
        process.env.RPC_URL,
        process.env.PRIVATE_KEY,
        process.env.CONTRACT_ADDRESS
    );

    (async () => {
        try {
            if (command === 'verify') {
                // Load proof from file
                const { proof, publicSignals } = loadProof();
                await verifier.verifyProofView(proof, publicSignals);
            } else if (command === 'submit') {
                // Load proof and submit
                const { proof, publicSignals } = loadProof();
                const accountAddress = process.argv[3] || verifier.wallet.address;
                await verifier.submitProof(proof, publicSignals, accountAddress);
            } else if (command === 'check') {
                // Check proof status
                const [accountAddress, threshold, accountHash] = process.argv.slice(3);
                if (!accountAddress || !threshold || !accountHash) {
                    console.error('Usage: node verifyOnChain.js check <accountAddress> <threshold> <accountHash>');
                    process.exit(1);
                }
                await verifier.checkProofStatus(accountAddress, threshold, accountHash);
            } else if (command === 'details') {
                // Get proof details
                const [accountAddress, threshold, accountHash] = process.argv.slice(3);
                if (!accountAddress || !threshold || !accountHash) {
                    console.error('Usage: node verifyOnChain.js details <accountAddress> <threshold> <accountHash>');
                    process.exit(1);
                }
                await verifier.getProofDetails(accountAddress, threshold, accountHash);
            } else {
                console.log('Usage:');
                console.log('  node verifyOnChain.js verify          - Verify proof (view, no gas)');
                console.log('  node verifyOnChain.js submit [addr]   - Submit proof (costs gas)');
                console.log('  node verifyOnChain.js check <addr> <threshold> <hash> - Check status');
                console.log('  node verifyOnChain.js details <addr> <threshold> <hash> - Get details');
                process.exit(1);
            }
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })();
}

module.exports = OnChainVerifier;
