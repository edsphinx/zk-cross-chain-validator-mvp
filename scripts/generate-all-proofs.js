const snarkjs = require('snarkjs');
const fs = require('fs');
const path = require('path');

/**
 * Unified proof generation for all circuits
 */

const circuits = {
    balance: {
        name: 'AccountBalanceProof',
        wasm: 'build/AccountBalanceProof.wasm',
        zkey: 'build/account_balance_final.zkey',
        inputs: ['balance', 'threshold', 'accountHash'],
        example: { balance: '1000000', threshold: '500000', accountHash: '12345' }
    },
    asset: {
        name: 'AssetOwnership',
        wasm: 'build/AssetOwnership.wasm',
        zkey: 'build/asset_ownership_final.zkey',
        inputs: ['assetBalance', 'assetId', 'accountHash'],
        example: { assetBalance: '5', assetId: '721', accountHash: '67890' }
    },
    transaction: {
        name: 'TransactionExistence',
        wasm: 'build/TransactionExistence.wasm',
        zkey: 'build/tx_existence_final.zkey',
        inputs: ['txHash', 'merkleRoot', 'blockNumber', 'chainId'],
        example: { txHash: '999888', merkleRoot: '777666', blockNumber: '12345', chainId: '1' }
    },
    voting: {
        name: 'VotingEligibility',
        wasm: 'build/VotingEligibility.wasm',
        zkey: 'build/voting_final.zkey',
        inputs: ['tokenBalance', 'votingThreshold', 'proposalId', 'accountHash'],
        example: { tokenBalance: '10000', votingThreshold: '1000', proposalId: '42', accountHash: '11111' }
    },
    collateral: {
        name: 'CollateralVerification',
        wasm: 'build/CollateralVerification.wasm',
        zkey: 'build/collateral_final.zkey',
        inputs: ['collateralValue', 'requiredCollateral', 'loanAmount', 'accountHash'],
        example: { collateralValue: '150000', requiredCollateral: '100000', loanAmount: '50000', accountHash: '22222' }
    }
};

async function generateProof(circuitType, inputData) {
    const circuit = circuits[circuitType];
    if (!circuit) {
        throw new Error(`Unknown circuit type: ${circuitType}`);
    }

    console.log(`\n🔐 Generating ZK proof for ${circuit.name}...`);
    console.log(`   Circuit: ${circuitType}`);

    const wasmPath = path.join(__dirname, '..', circuit.wasm);
    const zkeyPath = path.join(__dirname, '..', circuit.zkey);

    try {
        console.log('📝 Generating witness...');
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            inputData,
            wasmPath,
            zkeyPath
        );

        console.log('✅ Proof generated successfully!');
        console.log('\n📊 Public Signals:');
        publicSignals.forEach((signal, i) => {
            console.log(`   [${i}]: ${signal}`);
        });

        return { proof, publicSignals };
    } catch (error) {
        console.error('❌ Error generating proof:', error.message);
        throw error;
    }
}

function saveProof(circuitType, proof, publicSignals, filename) {
    const outputPath = path.join(__dirname, '../build', filename);
    const data = {
        circuitType,
        proof,
        publicSignals,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Proof saved to: ${outputPath}`);
}

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
    const circuitType = args[0];

    if (!circuitType) {
        console.log('Usage: node generateAllProofs.js <circuitType> [inputs...]');
        console.log('\nAvailable circuits:');
        Object.keys(circuits).forEach(type => {
            const circuit = circuits[type];
            console.log(`\n  ${type}:`);
            console.log(`    Inputs: ${circuit.inputs.join(', ')}`);
            console.log(`    Example: node generateAllProofs.js ${type} ${Object.values(circuit.example).join(' ')}`);
        });
        process.exit(1);
    }

    const circuit = circuits[circuitType];
    if (!circuit) {
        console.error(`❌ Unknown circuit type: ${circuitType}`);
        console.log(`Available: ${Object.keys(circuits).join(', ')}`);
        process.exit(1);
    }

    // Parse inputs
    const inputData = {};
    const inputValues = args.slice(1);

    if (inputValues.length === 0) {
        console.log(`ℹ️  No inputs provided, using example values...`);
        Object.assign(inputData, circuit.example);
    } else if (inputValues.length !== circuit.inputs.length) {
        console.error(`❌ Expected ${circuit.inputs.length} inputs, got ${inputValues.length}`);
        console.log(`Required inputs: ${circuit.inputs.join(', ')}`);
        console.log(`Example: node generateAllProofs.js ${circuitType} ${Object.values(circuit.example).join(' ')}`);
        process.exit(1);
    } else {
        circuit.inputs.forEach((input, i) => {
            inputData[input] = inputValues[i];
        });
    }

    console.log('\n📋 Input Data:');
    Object.entries(inputData).forEach(([key, value]) => {
        const isPrivate = key.includes('balance') || key.includes('Value') || key.includes('txHash');
        console.log(`   ${key}: ${value} ${isPrivate ? '(private)' : '(public)'}`);
    });

    generateProof(circuitType, inputData)
        .then(({ proof, publicSignals }) => {
            // Save proof
            const filename = `${circuitType}_proof.json`;
            saveProof(circuitType, proof, publicSignals, filename);

            // Show formatted proof for Solidity
            console.log('\n📋 Formatted for Solidity:');
            const formattedProof = formatProofForSolidity(proof, publicSignals);
            console.log(JSON.stringify(formattedProof, null, 2));
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = {
    generateProof,
    saveProof,
    formatProofForSolidity,
    circuits
};
