// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./CollateralManager.sol";

/**
 * @title AaveV3Adapter
 * @notice Adapter to use ZK Collateral Proofs with Aave V3 on Scroll Sepolia
 * @dev Integrates CollateralManager with Aave V3 Pool for privacy-preserving lending
 *
 * Aave V3 Scroll Sepolia Addresses:
 * - Pool: 0x48914C788295b5db23aF2b5F0B3BE775C4eA9440
 * - PoolDataProvider: 0xaE58b3Be9E159bDEc67Ada8507CA3001c80725Ee
 * - USDC: 0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D
 * - WETH: 0xb123dCe044EdF0a755505d9623Fba16C0F41cae9
 */

interface IPool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf) external;
    function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) external returns (uint256);
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
    function getUserAccountData(address user) external view returns (
        uint256 totalCollateralBase,
        uint256 totalDebtBase,
        uint256 availableBorrowsBase,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    );
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract AaveV3Adapter {
    CollateralManager public collateralManager;
    IPool public aavePool;

    // Aave V3 on Scroll Sepolia
    address public constant AAVE_POOL = 0x48914C788295b5db23aF2b5F0B3BE775C4eA9440;
    address public constant USDC = 0x2C9678042D52B97D27f2bD2947F7111d93F3dD0D;
    address public constant WETH = 0xb123dCe044EdF0a755505d9623Fba16C0F41cae9;
    address public constant DAI = 0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40;

    // Mapping: loanId => Aave borrow details
    struct AaveLoan {
        address borrower;
        address collateralAsset;
        address borrowAsset;
        uint256 collateralAmount;
        uint256 borrowAmount;
        uint256 zkLoanId;
        bool active;
    }

    mapping(uint256 => AaveLoan) public aaveLoans;
    uint256 public nextAaveLoanId = 1;

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

    event RepaidToAave(
        address indexed borrower,
        uint256 indexed loanId,
        uint256 amount
    );

    constructor(address _collateralManager) {
        collateralManager = CollateralManager(_collateralManager);
        aavePool = IPool(AAVE_POOL);
    }

    /**
     * @notice Supply collateral to Aave and borrow with ZK proof
     * @param pA ZK Proof point A
     * @param pB ZK Proof point B
     * @param pC ZK Proof point C
     * @param pubSignals [requiredCollateral, borrowAmount, accountHash]
     * @param collateralAsset Asset to supply as collateral
     * @param collateralAmount Amount to supply
     * @param borrowAsset Asset to borrow
     * @param borrowAmount Amount to borrow
     */
    function supplyAndBorrowWithZKProof(
        uint[2] memory pA,
        uint[2][2] memory pB,
        uint[2] memory pC,
        uint[3] memory pubSignals,
        address collateralAsset,
        uint256 collateralAmount,
        address borrowAsset,
        uint256 borrowAmount
    ) external returns (uint256 loanId) {
        // 1. Verify ZK proof through CollateralManager
        uint256 zkLoanId = collateralManager.verifyCollateralAndInitiateLoan(
            pA, pB, pC, pubSignals
        );

        require(zkLoanId > 0, "ZK proof verification failed");

        // 2. Transfer collateral from user to this contract
        IERC20(collateralAsset).transferFrom(msg.sender, address(this), collateralAmount);

        // 3. Approve Aave to spend collateral
        IERC20(collateralAsset).approve(AAVE_POOL, collateralAmount);

        // 4. Supply collateral to Aave
        aavePool.supply(collateralAsset, collateralAmount, address(this), 0);

        emit CollateralSuppliedToAave(msg.sender, nextAaveLoanId, collateralAsset, collateralAmount);

        // 5. Borrow from Aave
        // interestRateMode: 2 = variable rate
        aavePool.borrow(borrowAsset, borrowAmount, 2, 0, address(this));

        // 6. Transfer borrowed assets to user
        IERC20(borrowAsset).transfer(msg.sender, borrowAmount);

        emit BorrowedFromAave(msg.sender, nextAaveLoanId, borrowAsset, borrowAmount);

        // 7. Record loan
        loanId = nextAaveLoanId++;
        aaveLoans[loanId] = AaveLoan({
            borrower: msg.sender,
            collateralAsset: collateralAsset,
            borrowAsset: borrowAsset,
            collateralAmount: collateralAmount,
            borrowAmount: borrowAmount,
            zkLoanId: zkLoanId,
            active: true
        });

        return loanId;
    }

    /**
     * @notice Repay loan and withdraw collateral
     * @param loanId The Aave loan ID
     * @param repayAmount Amount to repay
     */
    function repayAndWithdraw(uint256 loanId, uint256 repayAmount) external {
        AaveLoan storage loan = aaveLoans[loanId];
        require(loan.active, "Loan not active");
        require(loan.borrower == msg.sender, "Not your loan");

        // 1. Transfer repayment from user
        IERC20(loan.borrowAsset).transferFrom(msg.sender, address(this), repayAmount);

        // 2. Approve Aave
        IERC20(loan.borrowAsset).approve(AAVE_POOL, repayAmount);

        // 3. Repay to Aave
        // interestRateMode: 2 = variable rate
        aavePool.repay(loan.borrowAsset, repayAmount, 2, address(this));

        emit RepaidToAave(msg.sender, loanId, repayAmount);

        // 4. Withdraw collateral
        uint256 withdrawnAmount = aavePool.withdraw(
            loan.collateralAsset,
            loan.collateralAmount,
            msg.sender
        );

        // 5. Mark ZK loan as repaid
        collateralManager.repayLoan(loan.zkLoanId);

        // 6. Mark Aave loan as inactive
        loan.active = false;
    }

    /**
     * @notice Get Aave account data for this adapter
     */
    function getAaveAccountData() external view returns (
        uint256 totalCollateralBase,
        uint256 totalDebtBase,
        uint256 availableBorrowsBase,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    ) {
        return aavePool.getUserAccountData(address(this));
    }

    /**
     * @notice Get loan details
     */
    function getLoanDetails(uint256 loanId) external view returns (
        address borrower,
        address collateralAsset,
        address borrowAsset,
        uint256 collateralAmount,
        uint256 borrowAmount,
        uint256 zkLoanId,
        bool active
    ) {
        AaveLoan memory loan = aaveLoans[loanId];
        return (
            loan.borrower,
            loan.collateralAsset,
            loan.borrowAsset,
            loan.collateralAmount,
            loan.borrowAmount,
            loan.zkLoanId,
            loan.active
        );
    }

    /**
     * @notice Check if user has sufficient collateral verified via ZK proof
     */
    function hasVerifiedCollateral(
        address borrower,
        uint256 loanId
    ) external view returns (bool verified, bool active) {
        AaveLoan memory loan = aaveLoans[loanId];
        if (loan.borrower != borrower) return (false, false);

        (bool zkVerified, bool zkActive,,) = collateralManager.getCollateralStatus(
            borrower,
            loan.zkLoanId
        );

        return (zkVerified, zkActive && loan.active);
    }
}
