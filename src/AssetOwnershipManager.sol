// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./AssetOwnershipVerifier.sol";

/**
 * @title AssetOwnershipManager
 * @notice Manages ZK proofs for asset ownership verification (NFTs, Tokens)
 * @dev Proves ownership without revealing balance amounts
 */
contract AssetOwnershipManager {
    AssetOwnershipGroth16Verifier public verifier;

    struct OwnershipProof {
        address account;
        uint256 assetId;        // Token contract or NFT ID
        uint256 accountHash;
        uint256 timestamp;
        bool verified;
    }

    // Mapping: hash(account, assetId) => OwnershipProof
    mapping(bytes32 => OwnershipProof) public ownershipProofs;

    event OwnershipVerified(
        address indexed account,
        uint256 indexed assetId,
        uint256 accountHash,
        uint256 timestamp
    );

    event OwnershipVerificationFailed(
        address indexed account,
        uint256 assetId
    );

    constructor(address _verifierAddress) {
        verifier = AssetOwnershipGroth16Verifier(_verifierAddress);
    }

    /**
     * @notice Verify and store asset ownership proof
     * @param pA Proof point A
     * @param pB Proof point B
     * @param pC Proof point C
     * @param pubSignals Public signals [assetId, accountHash]
     * @param account Account address
     */
    function verifyOwnership(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[4] memory pubSignals,
        address account
    ) public returns (bool) {
        bool isValid = verifier.verifyProof(pA, pB, pC, pubSignals);

        uint256 assetId = pubSignals[0];
        uint256 accountHash = pubSignals[1];

        if (isValid) {
            bytes32 proofKey = keccak256(abi.encodePacked(account, assetId));

            ownershipProofs[proofKey] = OwnershipProof({
                account: account,
                assetId: assetId,
                accountHash: accountHash,
                timestamp: block.timestamp,
                verified: true
            });

            emit OwnershipVerified(account, assetId, accountHash, block.timestamp);
        } else {
            emit OwnershipVerificationFailed(account, assetId);
        }

        return isValid;
    }

    /**
     * @notice Check if ownership proof exists
     */
    function isOwnershipVerified(
        address account,
        uint256 assetId
    ) public view returns (bool verified, uint256 timestamp) {
        bytes32 proofKey = keccak256(abi.encodePacked(account, assetId));
        OwnershipProof memory proof = ownershipProofs[proofKey];
        return (proof.verified, proof.timestamp);
    }

    /**
     * @notice Verify proof without storing (view function)
     */
    function verifyOwnershipView(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[4] memory pubSignals
    ) public view returns (bool) {
        return verifier.verifyProof(pA, pB, pC, pubSignals);
    }
}
