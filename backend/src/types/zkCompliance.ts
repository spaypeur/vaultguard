export interface ZkProof {
  proof: any;
  publicSignals: string[];
}

export interface ComplianceVerification {
  userId: string;
  documentHash: string;
  timestamp: number;
  jurisdiction: string;
  requirements: string[];
  metadata?: {
    multiPartyVerification?: boolean;
    hardwareAuthentication?: boolean;
    requestIp?: string;
    verificationAttempts?: number;
    lastVerificationIp?: string;
    securityLevel?: string;
    riskScore?: number;
  };
}

export interface ZkComplianceRecord {
  id: string;
  userId: string;
  jurisdiction: string;
  documentHash: string;
  requirements: string[];
  privateHash: string;
  proofData: any;
  publicSignals: string[];
  verified: boolean;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}