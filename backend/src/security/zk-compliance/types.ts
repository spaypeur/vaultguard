export interface ComplianceCircuit {
  id: string;
  name: string;
  description: string;
  constraints: ComplianceConstraint[];
}

export interface ComplianceConstraint {
  id: string;
  field: string;
  operation: ComplianceOperation;
  value: any;
  metadata: Record<string, any>;
}

export interface ComplianceProof {
  id: string;
  circuitId: string;
  proof: string;
  publicSignals: string[];
  timestamp: Date;
  verificationKey: string;
}

export interface ProofInput {
  privateInputs: Record<string, any>;
  publicInputs: Record<string, any>;
}

export interface ProofOutput {
  proof: string;
  publicSignals: string[];
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
}

export enum ComplianceOperation {
  EQUAL = 'EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  IN_RANGE = 'IN_RANGE',
  IN_SET = 'IN_SET',
  NOT_IN_SET = 'NOT_IN_SET',
}