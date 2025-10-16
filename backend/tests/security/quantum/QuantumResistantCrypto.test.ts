import { QuantumResistantCrypto } from '../../../src/security/quantum/QuantumResistantCrypto';
import { Buffer } from 'buffer';

describe('QuantumResistantCrypto', () => {
  let crypto: QuantumResistantCrypto;

  beforeEach(() => {
    crypto = QuantumResistantCrypto.getInstance();
  });

  describe('Key Generation', () => {
    it('should generate valid key pairs', async () => {
      const keyPair = await crypto.generateKeyPair();
      
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(keyPair.publicKey).toBeInstanceOf(Buffer);
      expect(keyPair.privateKey).toBeInstanceOf(Buffer);
    });
  });

  describe('Hybrid Encryption/Decryption', () => {
    it('should successfully encrypt and decrypt data', async () => {
      const keyPair = await crypto.generateKeyPair();
      const testData = Buffer.from('Test message for quantum-resistant encryption');
      
      const encrypted = await crypto.hybridEncrypt(testData, keyPair.publicKey);
      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.encapsulatedKey).toBeDefined();
      
      const decrypted = await crypto.hybridDecrypt(encrypted, keyPair.privateKey);
      expect(decrypted.toString()).toBe(testData.toString());
    });
  });

  describe('Key Encapsulation', () => {
    it('should successfully perform key encapsulation and decapsulation', async () => {
      const keyPair = await crypto.generateKeyPair();
      
      const { ciphertext, sharedSecret: secret1 } = await crypto.encapsulate(keyPair.publicKey);
      const secret2 = await crypto.decapsulate(keyPair.privateKey, ciphertext);
      
      expect(secret1).toEqual(secret2);
    });
  });
});