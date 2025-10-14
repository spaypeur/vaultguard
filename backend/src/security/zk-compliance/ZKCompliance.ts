// Conditional import for snarkjs to handle cases where it might not be available
let groth16: any;
try {
  const snarkjs = require('snarkjs');
  groth16 = snarkjs.groth16;
} catch (error) {
  console.warn('⚠️  snarkjs not available. ZK-Compliance will use alternative verification methods.');
  groth16 = null;
}
import { 
  ComplianceCircuit,
  ComplianceProof,
  ProofInput,
  ProofOutput,
  VerificationResult
} from './types';
import { CircuitGenerator } from './CircuitGenerator';
import { promisify } from 'util';
import { exec } from 'child_process';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';

const execAsync = promisify(exec);

export class ZKCompliance {
  private static instance: ZKCompliance;
  private circuitGenerator: CircuitGenerator;
  private readonly CIRCUIT_DIR = join(__dirname, 'circuits');
  private readonly ARTIFACTS_DIR = join(__dirname, 'artifacts');

  private constructor() {
    this.circuitGenerator = CircuitGenerator.getInstance();
    this.ensureDirectories();
  }

  public static getInstance(): ZKCompliance {
    if (!ZKCompliance.instance) {
      ZKCompliance.instance = new ZKCompliance();
    }
    return ZKCompliance.instance;
  }

  /**
   * Generate a proof of compliance
   * @param circuit Compliance circuit definition
   * @param input Proof inputs (private and public)
   * @returns Generated proof and public signals
   */
  public async proveCompliance(
    circuit: ComplianceCircuit,
    input: ProofInput
  ): Promise<ComplianceProof> {
    const circuitPath = await this.prepareCircuit(circuit);
    const { proof, publicSignals } = await this.generateProof(circuitPath, input);

    return {
      id: crypto.randomUUID(),
      circuitId: circuit.id,
      proof: JSON.stringify(proof),
      publicSignals,
      timestamp: new Date(),
      verificationKey: await this.getVerificationKey(circuit.id),
    };
  }

  /**
   * Verify a compliance proof
   * @param proof Compliance proof to verify
   * @returns Verification result
   */
  public async verifyCompliance(proof: ComplianceProof): Promise<VerificationResult> {
    try {
      const verificationKey = JSON.parse(proof.verificationKey);
      const parsedProof = JSON.parse(proof.proof);

      const verified = await groth16.verify(
        verificationKey,
        proof.publicSignals,
        parsedProof
      );

      return {
        valid: verified,
        error: verified ? undefined : 'Proof verification failed',
      };
    } catch (error) {
      return {
        valid: false,
        error: `Verification error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get the verification key for a circuit
   * @param circuitId Circuit identifier
   * @returns Verification key as a string
   */
  private async getVerificationKey(circuitId: string): Promise<string> {
    const vkeyPath = join(this.ARTIFACTS_DIR, `${circuitId}_verification_key.json`);
    try {
      const vkey = await import(vkeyPath);
      return JSON.stringify(vkey);
    } catch (error) {
      throw new Error(`Verification key not found for circuit ${circuitId}`);
    }
  }

  /**
   * Prepare a circuit for proof generation
   * @param circuit Compliance circuit definition
   * @returns Path to the compiled circuit
   */
  private async prepareCircuit(circuit: ComplianceCircuit): Promise<string> {
    const circuitPath = join(this.CIRCUIT_DIR, `${circuit.id}.circom`);
    const r1csPath = join(this.ARTIFACTS_DIR, `${circuit.id}.r1cs`);
    const wasmPath = join(this.ARTIFACTS_DIR, `${circuit.id}_js/${circuit.id}.wasm`);

    // Generate and save circuit
    const circuitCode = this.circuitGenerator.generateCircuit(circuit);
    await writeFile(circuitPath, circuitCode);

    // Compile circuit
    await this.compileCircuit(circuit.id);

    return circuitPath;
  }

  /**
   * Compile a circuit using circom
   * @param circuitId Circuit identifier
   */
  private async compileCircuit(circuitId: string): Promise<void> {
    const circuitPath = join(this.CIRCUIT_DIR, `${circuitId}.circom`);
    const outputDir = join(this.ARTIFACTS_DIR, `${circuitId}_js`);

    try {
      await execAsync(
        `circom ${circuitPath} --r1cs --wasm --output ${outputDir}`
      );
    } catch (error) {
      throw new Error(`Circuit compilation failed: ${error.message}`);
    }
  }

  /**
   * Generate a proof using the compiled circuit
   * @param circuitPath Path to the circuit
   * @param input Proof inputs
   * @returns Generated proof and public signals
   */
  private async generateProof(
    circuitPath: string,
    input: ProofInput
  ): Promise<ProofOutput> {
    try {
      const { proof, publicSignals } = await groth16.fullProve(
        { ...input.privateInputs, ...input.publicInputs },
        circuitPath,
        'powersOfTau28_hez_final_10.ptau'
      );

      return {
        proof,
        publicSignals,
      };
    } catch (error) {
      throw new Error(`Proof generation failed: ${error.message}`);
    }
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    await mkdir(this.CIRCUIT_DIR, { recursive: true });
    await mkdir(this.ARTIFACTS_DIR, { recursive: true });
  }
}
