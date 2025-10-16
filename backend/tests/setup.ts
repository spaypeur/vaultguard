import { webcrypto } from 'crypto';

// Polyfill crypto for tests
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
});
// Jest setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.EMAIL_HOST = 'smtp.test.com';

// Global test setup
beforeAll(async () => {
  // Setup test database connections, mocks, etc.
});

afterAll(async () => {
  // Cleanup test resources
});

// Increase test timeout for integration tests
jest.setTimeout(30000);