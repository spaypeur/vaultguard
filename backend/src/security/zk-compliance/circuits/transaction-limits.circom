pragma circom 2.1.4;

// Verify transaction amount is within allowed limits
template Transaction_Limits() {
    // Public inputs
    signal input timestamp;
    signal input requester;
    
    // Private inputs
    signal private input amount;

    // Intermediate signals
    signal amount_in_range;

    // Constraints

    // Check if amount is in range [0, 10000]
    signal amount_gte_min <== GreaterEqThan(32)([amount, 0]);
    signal amount_lte_max <== LessEqThan(32)([amount, 10000]);
    amount_in_range <== AND()([amount_gte_min, amount_lte_max]);

    // Final compliance check
    signal output compliant;
    compliant <== AND(N)([all_constraint_signals]);
}

component main = ComplianceCircuit();