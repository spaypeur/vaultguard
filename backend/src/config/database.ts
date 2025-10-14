import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { initializeSupabaseRedis, setupCacheTables } from '../services/initializeCache';
import SupabaseRedisIntegration from '../services/supabaseRedisIntegration';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client for public operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});



// Database configuration
export const dbConfig = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey,
  serviceRoleKey: supabaseServiceRoleKey,
  options: {
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-my-custom-header': 'vaultguard',
      },
    },
  },
};

// Initialize cache integration
let cacheIntegration: SupabaseRedisIntegration;

export async function initializeDatabase(): Promise<void> {
  try {
    // Set up cache tables in Supabase
    await setupCacheTables();
    
    // Initialize Supabase-Redis integration
    cacheIntegration = await initializeSupabaseRedis();
    
    console.log('Database and cache initialization completed successfully');
  } catch (error) {
    console.error('Failed to initialize database and cache:', error);
    throw error;
  }
}

export function getCacheIntegration(): SupabaseRedisIntegration {
  if (!cacheIntegration) {
    throw new Error('Cache integration not initialized');
  }
  return cacheIntegration;
}

export default supabase;
