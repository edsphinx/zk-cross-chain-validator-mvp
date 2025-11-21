// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./CollateralVerifier.sol";

/**
 * @title CollateralManager
 * @notice Manages ZK proofs for collateral verification in lending
 * @dev Proves sufficient collateral without revealing exact amounts
 */
contract CollateralManager {
    Groth16Verifier public verifier;

    struct CollateralProof {
        address borrower;
        uint256 requiredCollateral;
        uint256 loanAmount;
        uint256 accountHash;
        uint256 timestamp;
        bool verified;
        bool loanActive;
    }

    // Mapping: hash(borrower, loanId) => CollateralProof
    mapping(bytes32 => CollateralProof) public collateralProofs;

    // Loan counter
    uint256 public nextLoanId = 1;

    event CollateralVerified(
        address indexed borrower,
        uint256 indexed loanId,
        uint256 requiredCollateral,
        uint256 loanAmount,
        uint256 timestamp
    );

    event LoanInitiated(
        address indexed borrower,
        uint256 indexed loanId,
        uint256 loanAmount
    );

    event LoanRepaid(
        address indexed borrower,
        uint256 indexed loanId
    );

    event CollateralVerificationFailed(
        address indexed borrower,
        uint256 loanAmount
    );

    constructor(address _verifierAddress) {
        verifier = Groth16Verifier(_verifierAddress);
    }

    /**
     * @notice Verify collateral and initiate loan
     * @param pA Proof point A
     * @param pB Proof point B
     * @param pC Proof point C
     * @param pubSignals [requiredCollateral, loanAmount, accountHash]
     * @return loanId The ID of the initiated loan (0 if failed)
     */
    function verifyCollateralAndInitiateLoan(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[3] memory pubSignals
    ) public returns (uint256) {
        // Convert to uint[2] for verifier
        uint[2] memory verifierSignals = [pubSignals[0], pubSignals[1]];
        bool isValid = verifier.verifyProof(pA, pB, pC, verifierSignals);

        uint256 requiredCollateral = pubSignals[0];
        uint256 loanAmount = pubSignals[1];
        uint256 accountHash = pubSignals[2];

        if (!isValid) {
            emit CollateralVerificationFailed(msg.sender, loanAmount);
            return 0;
        }

        // Create loan
        uint256 loanId = nextLoanId++;
        bytes32 proofKey = keccak256(abi.encodePacked(msg.sender, loanId));

        collateralProofs[proofKey] = CollateralProof({
            borrower: msg.sender,
            requiredCollateral: requiredCollateral,
            loanAmount: loanAmount,
            accountHash: accountHash,
            timestamp: block.timestamp,
            verified: true,
            loanActive: true
        });

        emit CollateralVerified(
            msg.sender,
            loanId,
            requiredCollateral,
            loanAmount,
            block.timestamp
        );
        emit LoanInitiated(msg.sender, loanId, loanAmount);

        return loanId;
    }

    /**
     * @notice Repay loan
     * @param loanId The loan to repay
     */
    function repayLoan(uint256 loanId) public {
        bytes32 proofKey = keccak256(abi.encodePacked(msg.sender, loanId));
        CollateralProof storage proof = collateralProofs[proofKey];

        require(proof.verified, "Loan not found");
        require(proof.loanActive, "Loan already repaid");
        require(proof.borrower == msg.sender, "Not your loan");

        proof.loanActive = false;

        emit LoanRepaid(msg.sender, loanId);
    }

    /**
     * @notice Check collateral proof status
     */
    function getCollateralStatus(
        address borrower,
        uint256 loanId
    ) public view returns (
        bool verified,
        bool loanActive,
        uint256 loanAmount,
        uint256 timestamp
    ) {
        bytes32 proofKey = keccak256(abi.encodePacked(borrower, loanId));
        CollateralProof memory proof = collateralProofs[proofKey];
        return (
            proof.verified,
            proof.loanActive,
            proof.loanAmount,
            proof.timestamp
        );
    }

    /**
     * @notice Verify collateral only (view function)
     */
    function verifyCollateralView(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[2] memory pubSignals
    ) public view returns (bool) {
        return verifier.verifyProof(pA, pB, pC, pubSignals);
    }
}
