export enum UserRole {
  ADMIN = 'admin',
  ADVISOR = 'advisor',
  CLIENT = 'client',
  FAMILY_MEMBER = 'family_member',
  AUDITOR = 'auditor'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  LOCKED = 'locked',
  DEACTIVATED = 'deactivated'
}

export enum Jurisdiction {
  US = 'US',
  UK = 'UK',
  EU = 'EU',
  CH = 'CH',
  SG = 'SG',
  UAE = 'UAE'
}

export enum RiskLevel {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
  VERY_AGGRESSIVE = 'very_aggressive'
}

export enum AssetType {
  CRYPTOCURRENCY = 'cryptocurrency',
  TOKEN = 'token',
  NFT = 'nft',
  DEFI_POSITION = 'defi_position',
  STAKED = 'staked',
  FIAT = 'fiat',
  STOCK = 'stock',
  BOND = 'bond',
  REAL_ESTATE = 'real_estate',
  COMMODITY = 'commodity'
}

export enum Blockchain {
  BITCOIN = 'bitcoin',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  POLYGON = 'polygon',
  AVALANCHE = 'avalanche',
  BINANCE_SMART_CHAIN = 'binance_smart_chain',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  BASE = 'base',
  CARDANO = 'cardano'
}

export enum ThreatType {
  PHISHING = 'phishing',
  MALWARE = 'malware',
  SUSPICIOUS_TRANSACTION = 'suspicious_transaction',
  SOCIAL_ENGINEERING = 'social_engineering',
  NETWORK_ATTACK = 'network_attack',
  PHYSICAL_SECURITY = 'physical_security',
  REGULATORY_VIOLATION = 'regulatory_violation',
  MARKET_MANIPULATION = 'market_manipulation'
}

export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ThreatStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  FALSE_POSITIVE = 'false_positive',
  RESOLVED = 'resolved',
  IGNORED = 'ignored'
}

export enum ComplianceType {
  KYC = 'kyc',
  AML = 'aml',
  TAX_FILING = 'tax_filing',
  FATCA = 'fatca',
  CRS = 'crs',
  TRAVEL_RULE = 'travel_rule',
  ENTITY_MANAGEMENT = 'entity_management',
  AUDIT = 'audit'
}

export enum ComplianceStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  EXEMPT = 'exempt'
}

// Database types (snake_case - matches Supabase schema)
export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  email_verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_login_at?: Date;
  login_attempts: number;
  locked_until?: Date;
  jurisdiction: Jurisdiction;
  referral_code?: string;
  referred_by?: string;
  kyc_status?: string;
  kyc_submitted_at?: Date;
  kyc_verified_at?: Date;
  kyc_documents?: any;
  preferences?: any;
  created_at: Date;
  updated_at: Date;
}

export interface DbPortfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  total_value: number;
  currency: string;
  risk_level: RiskLevel;
  is_active: boolean;
  rebalancing_enabled?: boolean;
  rebalancing_frequency?: string;
  target_allocations?: any;
  created_at: Date;
  updated_at: Date;
}

export interface DbAsset {
  id: string;
  portfolio_id: string;
  symbol: string;
  name: string;
  type: AssetType;
  amount: number;
  value: number;
  currency: string;
  blockchain?: Blockchain;
  address?: string;
  exchange?: string;
  metadata?: Record<string, any>;
  last_updated: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DbThreat {
  id: string;
  user_id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  title: string;
  description: string;
  status: ThreatStatus;
  source_ip?: string;
  source_location?: any;
  indicators?: any;
  evidence?: any;
  detected_at: Date;
  resolved_at?: Date;
  resolved_by?: string;
  resolution_notes?: string;
  false_positive?: boolean;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface DbComplianceRecord {
  id: string;
  user_id: string;
  jurisdiction: Jurisdiction;
  type: ComplianceType;
  status: ComplianceStatus;
  title: string;
  description?: string;
  due_date?: Date;
  completed_at?: Date;
  submitted_at?: Date;
  verified_at?: Date;
  documents?: any[];
  requirements?: any;
  notes?: string;
  assigned_to?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// Recovery types for database
export interface DbRecoveryCase {
  id: string;
  incident_id: string;
  user_id: string;
  stolen_assets: any; // JSONB type in DB, will store Asset[]
  suspect_addresses: string[];
  status: string; // Maps to RecoveryStatus enum
  legal_actions: string[];
  audit_log: any; // JSONB type in DB, will store AuditLogEntry[]
  created_at: string; // ISO string
  updated_at: string; // ISO string
}

export interface DbRecoveryTransaction {
  id: string;
  user_id: string;
  case_id: string;
  recovered_amount: number;
  fee_percentage: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  transaction_date: string; // ISO string
  status: string; // 'pending' | 'completed' | 'failed'
  metadata?: any; // JSONB type in DB
}
