// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./TransactionExistenceVerifier.sol";

/**
 * @title TransactionProofManager
 * @notice Manages ZK proofs for cross-chain transaction existence
 * @dev Proves transaction occurred without revealing details
 */
contract TransactionProofManager {
    TransactionExistenceGroth16Verifier public verifier;

    struct TransactionProof {
        uint256 merkleRoot;
        uint256 blockNumber;
        uint256 chainId;
        uint256 timestamp;
        bool verified;
    }

    // Mapping: txProofHash => TransactionProof
    mapping(bytes32 => TransactionProof) public transactionProofs;

    event TransactionVerified(
        bytes32 indexed proofHash,
        uint256 indexed blockNumber,
        uint256 chainId,
        uint256 timestamp
    );

    event TransactionVerificationFailed(
        bytes32 proofHash
    );

    constructor(address _verifierAddress) {
        verifier = TransactionExistenceGroth16Verifier(_verifierAddress);
    }

    /**
     * @notice Verify transaction existence proof
     * @param pA Proof point A
     * @param pB Proof point B
     * @param pC Proof point C
     * @param pubSignals [merkleRoot, blockNumber, chainId]
     */
    function verifyTransaction(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[4] memory pubSignals
    ) public returns (bool) {
        // Convert pubSignals to uint[2] array for verifier
        uint[4] memory verifierSignals = [pubSignals[0], pubSignals[1], pubSignals[2], pubSignals[3]];
        bool isValid = verifier.verifyProof(pA, pB, pC, verifierSignals);

        uint256 merkleRoot = pubSignals[0];
        uint256 blockNumber = pubSignals[1];
        uint256 chainId = pubSignals[2];

        bytes32 proofHash = keccak256(
            abi.encodePacked(merkleRoot, blockNumber, chainId)
        );

        if (isValid) {
            transactionProofs[proofHash] = TransactionProof({
                merkleRoot: merkleRoot,
                blockNumber: blockNumber,
                chainId: chainId,
                timestamp: block.timestamp,
                verified: true
            });

            emit TransactionVerified(proofHash, blockNumber, chainId, block.timestamp);
        } else {
            emit TransactionVerificationFailed(proofHash);
        }

        return isValid;
    }

    /**
     * @notice Check if transaction proof exists
     */
    function isTransactionVerified(
        uint256 merkleRoot,
        uint256 blockNumber,
        uint256 chainId
    ) public view returns (bool verified, uint256 timestamp) {
        bytes32 proofHash = keccak256(
            abi.encodePacked(merkleRoot, blockNumber, chainId)
        );
        TransactionProof memory proof = transactionProofs[proofHash];
        return (proof.verified, proof.timestamp);
    }
}
