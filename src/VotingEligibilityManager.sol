// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./VotingEligibilityVerifier.sol";

/**
 * @title VotingEligibilityManager
 * @notice Manages ZK proofs for privacy-preserving voting eligibility
 * @dev Proves voter meets threshold without revealing token balance
 */
contract VotingEligibilityManager {
    VotingEligibilityGroth16Verifier public verifier;

    struct VoterProof {
        address voter;
        uint256 votingThreshold;
        uint256 proposalId;
        uint256 accountHash;
        uint256 timestamp;
        bool verified;
        bool hasVoted;
    }

    // Mapping: hash(voter, proposalId) => VoterProof
    mapping(bytes32 => VoterProof) public voterProofs;

    // Mapping: proposalId => vote count
    mapping(uint256 => uint256) public proposalVoteCount;

    event EligibilityVerified(
        address indexed voter,
        uint256 indexed proposalId,
        uint256 votingThreshold,
        uint256 timestamp
    );

    event VoteCast(
        address indexed voter,
        uint256 indexed proposalId,
        uint256 timestamp
    );

    event EligibilityVerificationFailed(
        address indexed voter,
        uint256 proposalId
    );

    constructor(address _verifierAddress) {
        verifier = VotingEligibilityGroth16Verifier(_verifierAddress);
    }

    /**
     * @notice Verify voting eligibility
     * @param pA Proof point A
     * @param pB Proof point B
     * @param pC Proof point C
     * @param pubSignals [votingThreshold, proposalId, accountHash]
     * @param voter Voter address
     */
    function verifyEligibility(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[5] memory pubSignals,
        address voter
    ) public returns (bool) {
        // Convert to uint[2] for verifier
        uint[5] memory verifierSignals = [pubSignals[0], pubSignals[1], pubSignals[2], pubSignals[3], pubSignals[4]];
        bool isValid = verifier.verifyProof(pA, pB, pC, verifierSignals);

        uint256 votingThreshold = pubSignals[0];
        uint256 proposalId = pubSignals[1];
        uint256 accountHash = pubSignals[2];

        bytes32 proofKey = keccak256(abi.encodePacked(voter, proposalId));

        if (isValid) {
            voterProofs[proofKey] = VoterProof({
                voter: voter,
                votingThreshold: votingThreshold,
                proposalId: proposalId,
                accountHash: accountHash,
                timestamp: block.timestamp,
                verified: true,
                hasVoted: false
            });

            emit EligibilityVerified(voter, proposalId, votingThreshold, block.timestamp);
        } else {
            emit EligibilityVerificationFailed(voter, proposalId);
        }

        return isValid;
    }

    /**
     * @notice Cast a vote (requires prior eligibility verification)
     * @param proposalId The proposal to vote on
     */
    function castVote(uint256 proposalId) public {
        bytes32 proofKey = keccak256(abi.encodePacked(msg.sender, proposalId));
        VoterProof storage proof = voterProofs[proofKey];

        require(proof.verified, "Eligibility not verified");
        require(!proof.hasVoted, "Already voted");

        proof.hasVoted = true;
        proposalVoteCount[proposalId]++;

        emit VoteCast(msg.sender, proposalId, block.timestamp);
    }

    /**
     * @notice Check voting eligibility status
     */
    function isEligible(
        address voter,
        uint256 proposalId
    ) public view returns (bool verified, bool hasVoted, uint256 timestamp) {
        bytes32 proofKey = keccak256(abi.encodePacked(voter, proposalId));
        VoterProof memory proof = voterProofs[proofKey];
        return (proof.verified, proof.hasVoted, proof.timestamp);
    }

    /**
     * @notice Get vote count for a proposal
     */
    function getVoteCount(uint256 proposalId) public view returns (uint256) {
        return proposalVoteCount[proposalId];
    }
}
