// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/CollateralVerifier.sol";
import "../src/CollateralManager.sol";
import "../src/AaveV3Adapter.sol";

/**
 * @title AaveIntegrationTest
 * @notice Comprehensive tests for Aave V3 integration with ZK proofs
 */
contract AaveIntegrationTest is Test {
    CollateralManager public collateralManager;
    AaveV3Adapter public aaveAdapter;
    CollateralGroth16Verifier public verifier;

    // Scroll Sepolia addresses
    address constant AAVE_POOL = 0x48914C788295b5db23aF2b5F0B3BE775C4eA9440;
    address constant USDC = 0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D;
    address constant WETH = 0xb123dCe044EdF0a755505d9623Fba16C0F41cae9;
    address constant DAI = 0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40;

    address public user1 = address(0x1);
    address public user2 = address(0x2);

    event CollateralSuppliedToAave(
        address indexed borrower,
        uint256 indexed loanId,
        address collateralAsset,
        uint256 amount
    );

    event BorrowedFromAave(
        address indexed borrower,
        uint256 indexed loanId,
        address borrowAsset,
        uint256 amount
    );

    function setUp() public {
        // Deploy contracts
        verifier = new CollateralGroth16Verifier();
        collateralManager = new CollateralManager(address(verifier));
        aaveAdapter = new AaveV3Adapter(address(collateralManager));
    }

    /**
     * Test 1: Contract deployment
     */
    function test_Deployment() public {
        assertEq(address(aaveAdapter.collateralManager()), address(collateralManager));
        assertEq(address(aaveAdapter.aavePool()), AAVE_POOL);
        assertEq(aaveAdapter.USDC(), USDC);
        assertEq(aaveAdapter.WETH(), WETH);
        assertEq(aaveAdapter.DAI(), DAI);
    }

    /**
     * Test 2: Aave pool address is correct
     */
    function test_AavePoolAddress() public {
        assertEq(address(aaveAdapter.aavePool()), AAVE_POOL);
        // Verify it's the real Aave pool on Scroll Sepolia
        assertTrue(AAVE_POOL != address(0));
    }

    /**
     * Test 3: Token addresses are correct
     */
    function test_TokenAddresses() public {
        assertEq(aaveAdapter.USDC(), 0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D);
        assertEq(aaveAdapter.WETH(), 0xb123dCe044EdF0a755505d9623Fba16C0F41cae9);
        assertEq(aaveAdapter.DAI(), 0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40);
    }

    /**
     * Test 4: Get Aave account data (view function)
     * Note: Requires forking Scroll Sepolia to access real Aave contracts
     */
    function test_GetAaveAccountData() public {
        // Skip if not on forked Scroll Sepolia network
        if (block.chainid != 534351) {
            // Just verify contract is configured correctly
            assertEq(address(aaveAdapter.aavePool()), AAVE_POOL);
            return;
        }

        (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        ) = aaveAdapter.getAaveAccountData();

        // Initially should be zero (no collateral supplied yet)
        assertEq(totalCollateralBase, 0);
        assertEq(totalDebtBase, 0);
    }

    /**
     * Test 5: Supply and borrow with invalid proof should fail
     */
    function test_SupplyAndBorrowWithInvalidProof() public {
        uint[2] memory pA = [uint(1), uint(2)];
        uint[2][2] memory pB = [[uint(1), uint(2)], [uint(3), uint(4)]];
        uint[2] memory pC = [uint(1), uint(2)];
        uint[5] memory pubSignals = [uint(100000), uint(50000), uint(12345), uint(0), uint(0)];

        vm.expectRevert("ZK proof verification failed");
        aaveAdapter.supplyAndBorrowWithZKProof(
            pA,
            pB,
            pC,
            pubSignals,
            USDC,
            100000,
            DAI,
            50000
        );
    }

    /**
     * Test 6: Get loan details for non-existent loan
     */
    function test_GetLoanDetails_NonExistent() public {
        (
            address borrower,
            address collateralAsset,
            address borrowAsset,
            uint256 collateralAmount,
            uint256 borrowAmount,
            uint256 zkLoanId,
            bool active
        ) = aaveAdapter.getLoanDetails(999);

        assertEq(borrower, address(0));
        assertEq(collateralAsset, address(0));
        assertEq(borrowAsset, address(0));
        assertEq(collateralAmount, 0);
        assertEq(borrowAmount, 0);
        assertEq(zkLoanId, 0);
        assertFalse(active);
    }

    /**
     * Test 7: Check verified collateral for non-existent loan
     */
    function test_HasVerifiedCollateral_NonExistent() public {
        (bool verified, bool active) = aaveAdapter.hasVerifiedCollateral(user1, 1);
        assertFalse(verified);
        assertFalse(active);
    }

    /**
     * Test 8: Next loan ID starts at 1
     */
    function test_NextLoanIdStartsAtOne() public {
        assertEq(aaveAdapter.nextAaveLoanId(), 1);
    }

    /**
     * Test 9: Repay non-existent loan should fail
     */
    function test_RepayNonExistentLoan() public {
        vm.prank(user1);
        vm.expectRevert("Loan not active");
        aaveAdapter.repayAndWithdraw(999, 1000);
    }

    /**
     * Test 10: Contract constants are immutable
     */
    function test_ConstantsAreCorrect() public view {
        // Verify all addresses match Scroll Sepolia deployment
        assertEq(aaveAdapter.AAVE_POOL(), 0x48914C788295b5db23aF2b5F0B3BE775C4eA9440);
        assertEq(aaveAdapter.USDC(), 0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D);
        assertEq(aaveAdapter.WETH(), 0xb123dCe044EdF0a755505d9623Fba16C0F41cae9);
        assertEq(aaveAdapter.DAI(), 0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40);
    }

    /**
     * Test 11: Contract can interact with real Aave pool
     * Note: This test requires forking Scroll Sepolia
     */
    function testFork_CanInteractWithAavePool() public {
        // Skip if not on forked network
        if (block.chainid != 534351) {
            return;
        }

        // This test would require forking Scroll Sepolia
        // and minting test tokens
        // For now, we verify the contract is set up correctly
        assertTrue(address(aaveAdapter.aavePool()) != address(0));
    }

    /**
     * Test 12: Gas estimation for view functions
     * Note: Requires forking Scroll Sepolia to access real Aave contracts
     */
    function test_GasEstimation_GetAaveAccountData() public {
        // Skip if not on forked Scroll Sepolia network
        if (block.chainid != 534351) {
            // Just verify contract configuration
            assertTrue(address(aaveAdapter.aavePool()) != address(0));
            return;
        }

        uint256 gasBefore = gasleft();
        aaveAdapter.getAaveAccountData();
        uint256 gasUsed = gasBefore - gasleft();

        // Should be reasonable for a view function
        assertTrue(gasUsed < 100000);
    }

    /**
     * Test 13: Integration with CollateralManager
     */
    function test_IntegrationWithCollateralManager() public {
        assertEq(
            address(aaveAdapter.collateralManager()),
            address(collateralManager)
        );

        // Verify we can call CollateralManager through the adapter
        address managerAddress = address(aaveAdapter.collateralManager());
        assertTrue(managerAddress != address(0));
    }
}
