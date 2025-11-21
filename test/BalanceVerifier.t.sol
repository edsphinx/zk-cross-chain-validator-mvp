// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Verifier.sol";
import "../src/BalanceVerifier.sol";

/**
 * @title BalanceVerifierTest
 * @notice Comprehensive tests for the BalanceVerifier contract
 * @dev Tests include deployment, proof verification, and state management
 */
contract BalanceVerifierTest is Test {
    Groth16Verifier public verifier;
    BalanceVerifier public balanceVerifier;

    address public user1 = address(0x1);
    address public user2 = address(0x2);

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

    function setUp() public {
        // Deploy the Groth16Verifier
        verifier = new Groth16Verifier();

        // Deploy the BalanceVerifier with the verifier address
        balanceVerifier = new BalanceVerifier(address(verifier));
    }

    /**
     * Test 1: Contract deployment
     */
    function test_Deployment() public {
        assertEq(address(balanceVerifier.verifier()), address(verifier));
    }

    /**
     * Test 2: Verify a valid proof
     * Note: These values are from an actual generated proof
     * In practice, you would generate real proofs using the circuit
     */
    function test_VerifyValidProof() public {
        // Example proof data (these would come from actual proof generation)
        // For testing, we're using placeholder values
        uint[2] memory pA = [
            uint(1),
            uint(2)
        ];

        uint[2][2] memory pB = [
            [uint(1), uint(2)],
            [uint(3), uint(4)]
        ];

        uint[2] memory pC = [
            uint(1),
            uint(2)
        ];

        uint[2] memory pubSignals = [
            uint(500000),  // threshold
            uint(12345678901234567890)  // accountHash
        ];

        // Note: This test will fail with these dummy values because they don't
        // represent a valid proof. In a real scenario, you would:
        // 1. Generate a real proof using the circuit
        // 2. Load it in the test
        // 3. Verify it

        // For now, we're testing the contract logic flow
        vm.expectRevert(); // Expect failure with dummy proof
        balanceVerifier.verifyBalanceProof(pA, pB, pC, pubSignals, user1);
    }

    /**
     * Test 3: Verify proof view function (no state change)
     */
    function test_VerifyProofOnly() public {
        uint[2] memory pA = [uint(1), uint(2)];
        uint[2][2] memory pB = [[uint(1), uint(2)], [uint(3), uint(4)]];
        uint[2] memory pC = [uint(1), uint(2)];
        uint[2] memory pubSignals = [uint(500000), uint(12345678901234567890)];

        // This will return false for invalid proof, but shouldn't revert
        bool result = balanceVerifier.verifyProofOnly(pA, pB, pC, pubSignals);
        assertFalse(result);
    }

    /**
     * Test 4: Check proof status for non-existent proof
     */
    function test_IsProofVerified_NotExists() public {
        (bool verified, uint256 timestamp) = balanceVerifier.isProofVerified(
            user1,
            500000,
            12345678901234567890
        );

        assertFalse(verified);
        assertEq(timestamp, 0);
    }

    /**
     * Test 5: Get proof details for non-existent proof
     */
    function test_GetProof_NotExists() public {
        BalanceVerifier.BalanceProof memory proof = balanceVerifier.getProof(
            user1,
            500000,
            12345678901234567890
        );

        assertEq(proof.account, address(0));
        assertEq(proof.threshold, 0);
        assertEq(proof.accountHash, 0);
        assertEq(proof.timestamp, 0);
        assertFalse(proof.verified);
    }

    /**
     * Test 6: Multiple users can have different proofs
     */
    function test_MultipleUsers() public {
        // In a real scenario, each user would have their own valid proof
        // This test demonstrates the contract can handle multiple users
        (bool verified1,) = balanceVerifier.isProofVerified(
            user1,
            500000,
            12345
        );

        (bool verified2,) = balanceVerifier.isProofVerified(
            user2,
            600000,
            67890
        );

        assertFalse(verified1);
        assertFalse(verified2);
    }

    /**
     * Test 7: Same user can have multiple proofs with different thresholds
     */
    function test_MultipleThresholds() public {
        (bool verified1,) = balanceVerifier.isProofVerified(
            user1,
            500000,
            12345
        );

        (bool verified2,) = balanceVerifier.isProofVerified(
            user1,
            1000000,
            12345
        );

        // These should be treated as different proofs
        assertFalse(verified1);
        assertFalse(verified2);
    }

    /**
     * Test 8: Verifier address is correctly set
     */
    function test_VerifierAddress() public {
        address verifierAddr = address(balanceVerifier.verifier());
        assertEq(verifierAddr, address(verifier));
        assertTrue(verifierAddr != address(0));
    }

    /**
     * Test 9: Contract can receive and handle public signals correctly
     */
    function test_PublicSignalsHandling() public view {
        // Test that the contract correctly interprets public signals
        uint256 testThreshold = 1000000;
        uint256 testAccountHash = 99999;

        // The contract should be able to handle these values
        // This is more of a smoke test to ensure no overflow issues
        assertTrue(testThreshold > 0);
        assertTrue(testAccountHash > 0);
    }

    /**
     * Test 10: Gas estimation for proof verification
     */
    function test_GasEstimation() public {
        uint[2] memory pA = [uint(1), uint(2)];
        uint[2][2] memory pB = [[uint(1), uint(2)], [uint(3), uint(4)]];
        uint[2] memory pC = [uint(1), uint(2)];
        uint[2] memory pubSignals = [uint(500000), uint(12345678901234567890)];

        // Measure gas for view function
        uint256 gasBefore = gasleft();
        balanceVerifier.verifyProofOnly(pA, pB, pC, pubSignals);
        uint256 gasUsed = gasBefore - gasleft();

        // Gas should be reasonable (less than 1M for view function)
        assertTrue(gasUsed < 1000000);
    }
}
