import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Kyber768 } from './Kyber768';
import { QUANTUM_CONFIG } from './config';

interface KeyPair {
  publicKey: Buffer;
  privateKey: Buffer;
}

export class QuantumResistantCrypto {
  private static instance: QuantumResistantCrypto;
  private kyber: Kyber768;

  private constructor() {
    this.kyber = new Kyber768();
  }

  public static getInstance(): QuantumResistantCrypto {
    if (!QuantumResistantCrypto.instance) {
      QuantumResistantCrypto.instance = new QuantumResistantCrypto();
    }
    return QuantumResistantCrypto.instance;
  }

  /**
   * Generate a quantum-resistant key pair using Kyber-768
   * NIST approved post-quantum algorithm
   */
  public async generateKeyPair(): Promise<KeyPair> {
    return await this.kyber.generateKeyPair();
  }

  /**
   * Encapsulate a shared secret using recipient's public key
   * @param recipientPublicKey - The recipient's public key
   */
  public async encapsulate(recipientPublicKey: Buffer): Promise<{
    ciphertext: Buffer;
    sharedSecret: Buffer;
  }> {
    return await this.kyber.encapsulate(recipientPublicKey);
  }

  /**
   * Decapsulate a shared secret using recipient's private key and sender's ciphertext
   * @param privateKey - The recipient's private key
   * @param ciphertext - The sender's ciphertext
   */
  public async decapsulate(
    privateKey: Buffer,
    ciphertext: Buffer
  ): Promise<Buffer> {
    return await this.kyber.decapsulate(privateKey, ciphertext);
  }

  /**
   * Hybrid encryption using both quantum-resistant and traditional algorithms
   * @param data - Data to encrypt
   * @param recipientPublicKey - Recipient's public key
   */
  public async hybridEncrypt(
    data: Buffer,
    recipientPublicKey: Buffer
  ): Promise<{
    ciphertext: Buffer;
    encapsulatedKey: Buffer;
  }> {
    const { ciphertext: encapsulatedKey, sharedSecret } = await this.encapsulate(
      recipientPublicKey
    );

    // Use the shared secret for symmetric encryption
    const encrypted = this.symmetricEncrypt(data, sharedSecret);
    
    return {
      ciphertext: encrypted,
      encapsulatedKey,
    };
  }

  /**
   * Hybrid decryption using both quantum-resistant and traditional algorithms
   * @param encryptedData - Encrypted data object
   * @param privateKey - Recipient's private key
   */
  public async hybridDecrypt(
    encryptedData: { ciphertext: Buffer; encapsulatedKey: Buffer },
    privateKey: Buffer
  ): Promise<Buffer> {
    const sharedSecret = await this.decapsulate(
      privateKey,
      encryptedData.encapsulatedKey
    );

    return this.symmetricDecrypt(encryptedData.ciphertext, sharedSecret);
  }

  /**
   * Symmetric encryption using AES-256-CBC
   * @param data - Data to encrypt
   * @param key - Encryption key
   */
  private symmetricEncrypt(data: Buffer, key: Buffer): Buffer {
    const iv = randomBytes(QUANTUM_CONFIG.HYBRID.IV_LENGTH);
    const cipher = createCipheriv(
      QUANTUM_CONFIG.HYBRID.SYMMETRIC_ALGO,
      key.slice(0, 32), // AES-256 needs 32 bytes key
      iv
    );

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Format: IV + Encrypted Data (CBC doesn't need separate auth tag)
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Symmetric decryption using AES-256-CBC
   * @param data - Data to decrypt
   * @param key - Decryption key
   */
  private symmetricDecrypt(data: Buffer, key: Buffer): Buffer {
    // Extract IV and encrypted data
    const iv = data.slice(0, QUANTUM_CONFIG.HYBRID.IV_LENGTH);
    const encrypted = data.slice(QUANTUM_CONFIG.HYBRID.IV_LENGTH);

    const decipher = createDecipheriv(
      QUANTUM_CONFIG.HYBRID.SYMMETRIC_ALGO,
      key.slice(0, 32),
      iv
    );

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}