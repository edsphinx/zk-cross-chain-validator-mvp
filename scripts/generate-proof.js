const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

/**
 * Generate a ZK proof for Account Balance Verification
 *
 * @param {string} balance - The account's actual balance (private input)
 * @param {string} threshold - The minimum required balance (public input)
 * @param {string} accountHash - Hash identifier for the account (public input)
 * @returns {Object} The generated proof and public signals
 */
async function generateBalanceProof(balance, threshold, accountHash) {
    console.log('🔐 Generating ZK proof for balance verification...');
    console.log(`   Balance: ${balance} (private)`);
    console.log(`   Threshold: ${threshold} (public)`);
    console.log(`   Account Hash: ${accountHash} (public)`);

    // Prepare input for the circuit
    const input = {
        balance: balance.toString(),
        threshold: threshold.toString(),
        accountHash: accountHash.toString()
    };

    // Paths to circuit files
    const wasmPath = path.join(__dirname, '../build/AccountBalanceProof.wasm');
    const zkeyPath = path.join(__dirname, '../build/account_balance_final.zkey');

    try {
        // Generate witness
        console.log('\n📝 Generating witness...');
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasmPath,
            zkeyPath
        );

        console.log('✅ Proof generated successfully!');
        console.log('\n📊 Public Signals:');
        console.log(`   Threshold: ${publicSignals[0]}`);
        console.log(`   Account Hash: ${publicSignals[1]}`);

        return { proof, publicSignals };
    } catch (error) {
        console.error('❌ Error generating proof:', error.message);
        throw error;
    }
}

/**
 * Verify a proof locally (off-chain verification)
 *
 * @param {Object} proof - The generated proof
 * @param {Array} publicSignals - The public signals
 * @returns {boolean} True if the proof is valid
 */
async function verifyProofLocally(proof, publicSignals) {
    console.log('\n🔍 Verifying proof locally...');

    const vKeyPath = path.join(__dirname, '../build/verification_key.json');
    const vKey = JSON.parse(fs.readFileSync(vKeyPath, 'utf8'));

    try {
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        if (isValid) {
            console.log('✅ Proof is valid!');
        } else {
            console.log('❌ Proof is invalid!');
        }

        return isValid;
    } catch (error) {
        console.error('❌ Error verifying proof:', error.message);
        throw error;
    }
}

/**
 * Save proof to file
 *
 * @param {Object} proof - The generated proof
 * @param {Array} publicSignals - The public signals
 * @param {string} filename - Output filename (default: proof.json)
 */
function saveProof(proof, publicSignals, filename = 'proof.json') {
    const outputPath = path.join(__dirname, '../build', filename);
    const data = { proof, publicSignals };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Proof saved to: ${outputPath}`);
}

/**
 * Load proof from file
 *
 * @param {string} filename - Input filename
 * @returns {Object} The proof and public signals
 */
function loadProof(filename = 'proof.json') {
    const inputPath = path.join(__dirname, '../build', filename);
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    return data;
}

/**
 * Format proof for Solidity contract call
 *
 * @param {Object} proof - The generated proof
 * @param {Array} publicSignals - The public signals
 * @returns {Object} Formatted proof ready for contract interaction
 */
function formatProofForSolidity(proof, publicSignals) {
    return {
        pA: [proof.pi_a[0], proof.pi_a[1]],
        pB: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
        pC: [proof.pi_c[0], proof.pi_c[1]],
        pubSignals: publicSignals
    };
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 3) {
        console.log('Usage: node generateProof.js <balance> <threshold> <accountHash>');
        console.log('Example: node generateProof.js 1000000 500000 12345678901234567890');
        process.exit(1);
    }

    const [balance, threshold, accountHash] = args;

    generateBalanceProof(balance, threshold, accountHash)
        .then(async ({ proof, publicSignals }) => {
            // Verify locally
            const isValid = await verifyProofLocally(proof, publicSignals);

            if (isValid) {
                // Save proof
                saveProof(proof, publicSignals);

                // Show formatted proof for Solidity
                console.log('\n📋 Formatted for Solidity:');
                const formattedProof = formatProofForSolidity(proof, publicSignals);
                console.log(JSON.stringify(formattedProof, null, 2));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = {
    generateBalanceProof,
    verifyProofLocally,
    saveProof,
    loadProof,
    formatProofForSolidity
};
