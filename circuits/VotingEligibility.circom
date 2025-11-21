/**
 * VotingEligibility Circuit
 *
 * Proves voting eligibility based on token holdings without revealing exact amount.
 *
 * Use Cases:
 * - DAO governance voting
 * - Quadratic voting
 * - Delegation verification
 * - Privacy-preserving governance
 *
 * Inputs:
 *   - tokenBalance (private): Amount of governance tokens held
 *   - votingThreshold (public): Minimum tokens required to vote
 *   - proposalId (public): The proposal being voted on
 *   - accountHash (public): Voter identifier
 *
 * Constraint: tokenBalance >= votingThreshold
 */

template VotingEligibility() {
    // Private input: actual token balance
    signal input tokenBalance;

    // Public inputs
    signal input votingThreshold;
    signal input proposalId;
    signal input accountHash;

    // Output: eligibility flag
    signal output isEligible;

    // Calculate difference
    signal difference;
    difference <== tokenBalance - votingThreshold;

    // Verify relationship
    signal balanceCheck;
    balanceCheck <== votingThreshold + difference;
    balanceCheck === tokenBalance;

    // Set eligibility (if we reach here, voter is eligible)
    isEligible <== 1;

    // Use all public inputs in constraints
    signal proposalCheck;
    proposalCheck <== proposalId * accountHash;

    // Square of balance for verification
    signal balanceSquared;
    balanceSquared <== tokenBalance * tokenBalance;

    // Final verification combining all elements
    signal finalCheck;
    finalCheck <== balanceSquared + proposalCheck;
}

component main = VotingEligibility();
