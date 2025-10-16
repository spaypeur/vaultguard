pragma circom 2.1.4;

// Verify user is in allowed jurisdiction
template Jurisdiction_Check() {
    // Public inputs
    signal input timestamp;
    signal input requester;
    
    // Private inputs
    signal private input jurisdiction;

    // Intermediate signals
    signal jurisdiction_in_set;

    // Constraints

    // Check if jurisdiction is in set {US, EU, UK, CA}
    signal jurisdiction_matches[4];
    jurisdiction_matches[0] <== IsEqual()([jurisdiction, US]);
    jurisdiction_matches[1] <== IsEqual()([jurisdiction, EU]);
    jurisdiction_matches[2] <== IsEqual()([jurisdiction, UK]);
    jurisdiction_matches[3] <== IsEqual()([jurisdiction, CA]);
    jurisdiction_in_set <== OR(4)(jurisdiction_matches[0], jurisdiction_matches[1], jurisdiction_matches[2], jurisdiction_matches[3]);

    // Final compliance check
    signal output compliant;
    compliant <== AND(N)([all_constraint_signals]);
}

component main = ComplianceCircuit();