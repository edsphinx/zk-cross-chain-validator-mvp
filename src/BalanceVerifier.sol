// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./Verifier.sol";

/**
 * @title BalanceVerifier
 * @notice Wrapper contract for Account Balance Verification using ZK proofs
 * @dev This contract provides business logic on top of the Groth16Verifier
 *      to validate account balance proofs without revealing the actual balance
 */
contract BalanceVerifier {
    // Reference to the ZK proof verifier contract
    Groth16Verifier public verifier;

    // Struct to store verification result
    struct BalanceProof {
        address account;
        uint256 threshold;
        uint256 accountHash;
        uint256 timestamp;
        bool verified;
    }

    // Mapping to store verified proofs by account and threshold
    mapping(bytes32 => BalanceProof) public verifiedProofs;

    // Events
    event ProofVerified(
        address indexed account,
        uint256 indexed threshold,
        uint256 accountHash,
        uint256 timestamp
    );

    event ProofVerificationFailed(
        address indexed account,
        uint256 threshold,
        uint256 accountHash
    );

    /**
     * @notice Constructor to set the verifier contract
     * @param _verifierAddress Address of the deployed Groth16Verifier contract
     */
    constructor(address _verifierAddress) {
        verifier = Groth16Verifier(_verifierAddress);
    }

    /**
     * @notice Verify a balance proof
     * @param pA First element of the proof (G1 point)
     * @param pB Second element of the proof (G2 point)
     * @param pC Third element of the proof (G1 point)
     * @param pubSignals Public signals [threshold, accountHash]
     * @param account Address of the account being verified
     * @return True if the proof is valid
     */
    function verifyBalanceProof(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[2] memory pubSignals,
        address account
    ) public returns (bool) {
        // Verify the ZK proof
        bool isValid = verifier.verifyProof(pA, pB, pC, pubSignals);

        uint256 threshold = pubSignals[0];
        uint256 accountHash = pubSignals[1];

        if (isValid) {
            // Generate a unique key for this proof
            bytes32 proofKey = keccak256(
                abi.encodePacked(account, threshold, accountHash)
            );

            // Store the verified proof
            verifiedProofs[proofKey] = BalanceProof({
                account: account,
                threshold: threshold,
                accountHash: accountHash,
                timestamp: block.timestamp,
                verified: true
            });

            emit ProofVerified(account, threshold, accountHash, block.timestamp);
        } else {
            emit ProofVerificationFailed(account, threshold, accountHash);
        }

        return isValid;
    }

    /**
     * @notice Check if a proof has been verified for an account
     * @param account Address of the account
     * @param threshold The threshold that was proven
     * @param accountHash Hash of the account used in the proof
     * @return verified True if a valid proof exists
     * @return timestamp When the proof was verified
     */
    function isProofVerified(
        address account,
        uint256 threshold,
        uint256 accountHash
    ) public view returns (bool verified, uint256 timestamp) {
        bytes32 proofKey = keccak256(
            abi.encodePacked(account, threshold, accountHash)
        );
        BalanceProof memory proof = verifiedProofs[proofKey];
        return (proof.verified, proof.timestamp);
    }

    /**
     * @notice Get the full proof details
     * @param account Address of the account
     * @param threshold The threshold that was proven
     * @param accountHash Hash of the account used in the proof
     * @return The full BalanceProof struct
     */
    function getProof(
        address account,
        uint256 threshold,
        uint256 accountHash
    ) public view returns (BalanceProof memory) {
        bytes32 proofKey = keccak256(
            abi.encodePacked(account, threshold, accountHash)
        );
        return verifiedProofs[proofKey];
    }

    /**
     * @notice Simple helper to verify a proof and return the result without storing
     * @param pA First element of the proof (G1 point)
     * @param pB Second element of the proof (G2 point)
     * @param pC Third element of the proof (G1 point)
     * @param pubSignals Public signals [threshold, accountHash]
     * @return True if the proof is valid
     */
    function verifyProofOnly(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[2] memory pubSignals
    ) public view returns (bool) {
        return verifier.verifyProof(pA, pB, pC, pubSignals);
    }
}
