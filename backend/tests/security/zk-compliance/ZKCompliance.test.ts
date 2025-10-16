import { ZKCompliance } from '../../../src/security/zk-compliance/ZKCompliance';
import {
  ComplianceCircuit,
  ComplianceOperation,
  ComplianceProof,
} from '../../../src/security/zk-compliance/types';

describe('ZKCompliance', () => {
  let zkCompliance: ZKCompliance;

  beforeEach(() => {
    zkCompliance = ZKCompliance.getInstance();
  });

  describe('Compliance Proofs', () => {
    it('should generate and verify valid compliance proofs', async () => {
      const circuit: ComplianceCircuit = {
        id: 'age-verification',
        name: 'Age Verification',
        description: 'Verify user age is above required threshold',
        constraints: [
          {
            id: 'min-age',
            field: 'age',
            operation: ComplianceOperation.GREATER_THAN,
            value: 18,
            metadata: {
              requirement: 'User must be above 18 years old',
            },
          },
        ],
      };

      const input = {
        privateInputs: {
          age: 25,
        },
        publicInputs: {
          timestamp: Date.now(),
          requester: 'test-service',
        },
      };

      const proof = await zkCompliance.proveCompliance(circuit, input);
      expect(proof).toBeDefined();
      expect(proof.id).toBeDefined();
      expect(proof.proof).toBeDefined();
      expect(proof.publicSignals).toBeDefined();

      const verificationResult = await zkCompliance.verifyCompliance(proof);
      expect(verificationResult.valid).toBe(true);
    });

    it('should fail verification for invalid proofs', async () => {
      const invalidProof: ComplianceProof = {
        id: 'invalid',
        circuitId: 'test',
        proof: 'invalid-proof',
        publicSignals: ['invalid'],
        timestamp: new Date(),
        verificationKey: 'invalid-key',
      };

      const verificationResult = await zkCompliance.verifyCompliance(invalidProof);
      expect(verificationResult.valid).toBe(false);
      expect(verificationResult.error).toBeDefined();
    });
  });

  describe('Complex Compliance Rules', () => {
    it('should handle range-based compliance rules', async () => {
      const circuit: ComplianceCircuit = {
        id: 'transaction-limits',
        name: 'Transaction Limits',
        description: 'Verify transaction amount is within allowed limits',
        constraints: [
          {
            id: 'amount-range',
            field: 'amount',
            operation: ComplianceOperation.IN_RANGE,
            value: { min: 0, max: 10000 },
            metadata: {
              requirement: 'Transaction amount must be between 0 and 10000',
            },
          },
        ],
      };

      const input = {
        privateInputs: {
          amount: 5000,
        },
        publicInputs: {
          timestamp: Date.now(),
          requester: 'test-service',
        },
      };

      const proof = await zkCompliance.proveCompliance(circuit, input);
      const verificationResult = await zkCompliance.verifyCompliance(proof);
      expect(verificationResult.valid).toBe(true);
    });

    it('should handle set-based compliance rules', async () => {
      const circuit: ComplianceCircuit = {
        id: 'jurisdiction-check',
        name: 'Jurisdiction Check',
        description: 'Verify user is in allowed jurisdiction',
        constraints: [
          {
            id: 'allowed-jurisdictions',
            field: 'jurisdiction',
            operation: ComplianceOperation.IN_SET,
            value: ['US', 'EU', 'UK', 'CA'],
            metadata: {
              requirement: 'User must be in an allowed jurisdiction',
            },
          },
        ],
      };

      const input = {
        privateInputs: {
          jurisdiction: 'US',
        },
        publicInputs: {
          timestamp: Date.now(),
          requester: 'test-service',
        },
      };

      const proof = await zkCompliance.proveCompliance(circuit, input);
      const verificationResult = await zkCompliance.verifyCompliance(proof);
      expect(verificationResult.valid).toBe(true);
    });
  });
});