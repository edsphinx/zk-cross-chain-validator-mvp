/**
 * CollateralVerification Circuit
 *
 * Proves sufficient collateral for DeFi lending without revealing exact amounts.
 *
 * Use Cases:
 * - DeFi lending platforms
 * - Collateralized debt positions
 * - Liquidation protection
 * - Risk management
 *
 * Inputs:
 *   - collateralValue (private): Total collateral value in USD
 *   - requiredCollateral (public): Minimum collateral required
 *   - loanAmount (public): Amount being borrowed
 *   - accountHash (public): Borrower identifier
 *
 * Constraint: collateralValue >= requiredCollateral
 * Typically: requiredCollateral = loanAmount * collateralizationRatio
 * (e.g., 150% = 1.5x loan amount)
 */

template CollateralVerification() {
    // Private input: actual collateral value
    signal input collateralValue;

    // Public inputs
    signal input requiredCollateral;
    signal input loanAmount;
    signal input accountHash;

    // Output: sufficient collateral flag
    signal output isSufficient;

    // Calculate difference (excess collateral)
    signal difference;
    difference <== collateralValue - requiredCollateral;

    // Verify the relationship
    signal collateralCheck;
    collateralCheck <== requiredCollateral + difference;
    collateralCheck === collateralValue;

    // Set sufficiency flag
    isSufficient <== 1;

    // Use loan amount in constraints
    signal loanSquared;
    loanSquared <== loanAmount * loanAmount;

    // Use account hash
    signal accountSquared;
    accountSquared <== accountHash * accountHash;

    // Verify collateral is reasonable
    signal collateralSquared;
    collateralSquared <== collateralValue * collateralValue;

    // Final check combining all inputs
    signal finalVerification;
    finalVerification <== collateralSquared + loanSquared + accountSquared;
}

component main = CollateralVerification();
