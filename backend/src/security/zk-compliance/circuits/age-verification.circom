pragma circom 2.1.4;

// Verify user age is above required threshold
template Age_Verification() {
    // Public inputs
    signal input timestamp;
    signal input requester;
    
    // Private inputs
    signal private input age;

    // Intermediate signals
    signal age_valid;

    // Constraints
    age_valid <== GreaterThan(32)([age, 18]);

    // Final compliance check
    signal output compliant;
    compliant <== AND(N)([all_constraint_signals]);
}

component main = ComplianceCircuit();