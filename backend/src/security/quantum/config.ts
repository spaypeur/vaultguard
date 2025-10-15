export const QUANTUM_CONFIG = {
  // Kyber-768 parameters for post-quantum key exchange
  KYBER: {
    PUBLIC_KEY_SIZE: 1184,
    PRIVATE_KEY_SIZE: 2400,
    CIPHERTEXT_SIZE: 1088,
    SHARED_SECRET_SIZE: 32,
  },
  
  // Security levels (in bits)
  SECURITY_LEVELS: {
    QUANTUM_RESISTANT: 181, // Kyber-768 security level
    CLASSICAL: 256, // For hybrid encryption
  },

  // Hybrid encryption parameters
  HYBRID: {
    SYMMETRIC_ALGO: 'aes-256-cbc',
    KEY_SIZE: 32,
    AUTH_TAG_LENGTH: 16,
    IV_LENGTH: 16,
  },
};