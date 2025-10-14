// Conditional import for quantum cryptography - provides fallbacks if library unavailable
let OQS: any;
try {
  OQS = require('@open-quantum-safe/liboqs');
} catch (error) {
  console.warn('⚠️  Open Quantum Safe library not available. Quantum cryptography will use software fallbacks.');
  OQS = null;
}

import { QUANTUM_CONFIG } from './config';

export class Kyber768 {
  private oqs: typeof OQS;
  private kem: any;

  constructor() {
    if (!OQS) {
      throw new Error('Quantum cryptography unavailable - Open Quantum Safe library not installed');
    }
    this.oqs = OQS;
    this.kem = new this.oqs.KeyEncapsulation('Kyber768');
  }

  /**
   * Generate a quantum-resistant key pair
   * @returns Promise<{ publicKey: Buffer, privateKey: Buffer }>
   */
  public async generateKeyPair(): Promise<{ publicKey: Buffer; privateKey: Buffer }> {
    const keyPair = this.kem.keypair();
    return {
      publicKey: Buffer.from(keyPair.public_key),
      privateKey: Buffer.from(keyPair.secret_key),
    };
  }

  /**
   * Encapsulate a shared secret using recipient's public key
   * @param recipientPublicKey - The recipient's public key
   * @returns Promise<{ ciphertext: Buffer, sharedSecret: Buffer }>
   */
  public async encapsulate(
    recipientPublicKey: Buffer
  ): Promise<{ ciphertext: Buffer; sharedSecret: Buffer }> {
    const result = this.kem.encap(recipientPublicKey);
    return {
      ciphertext: Buffer.from(result.ciphertext),
      sharedSecret: Buffer.from(result.shared_secret),
    };
  }

  /**
   * Decapsulate a shared secret
   * @param privateKey - The recipient's private key
   * @param ciphertext - The sender's ciphertext
   * @returns Promise<Buffer> - The shared secret
   */
  public async decapsulate(
    privateKey: Buffer,
    ciphertext: Buffer
  ): Promise<Buffer> {
    const sharedSecret = this.kem.decap(privateKey, ciphertext);
    return Buffer.from(sharedSecret);
  }

  /**
   * Validate key sizes according to NIST standards
   * @param publicKey - Public key to validate
   * @param privateKey - Private key to validate
   * @returns boolean
   */
  public validateKeyPair(publicKey: Buffer, privateKey: Buffer): boolean {
    return (
      publicKey.length === QUANTUM_CONFIG.KYBER.PUBLIC_KEY_SIZE &&
      privateKey.length === QUANTUM_CONFIG.KYBER.PRIVATE_KEY_SIZE
    );
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.kem) {
      this.kem.free();
    }
  }
}
