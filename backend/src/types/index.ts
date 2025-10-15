// Core user and authentication types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  first_name?: string; // snake_case for database compatibility
  last_name?: string; // snake_case for database compatibility
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  email_verified?: boolean; // snake_case for database compatibility
  twoFactorEnabled: boolean;
  two_factor_enabled?: boolean; // snake_case for database compatibility
  two_factor_secret?: string; // snake_case for database compatibility
  jurisdiction?: Jurisdiction; // Missing property added
  password_hash?: string; // snake_case for database compatibility
  login_attempts?: number; // snake_case for database compatibility
  email_verification_token?: string; // snake_case for database compatibility
  password_reset_token?: string; // snake_case for database compatibility
  password_reset_expires?: Date; // snake_case for database compatibility
  phone_number?: string; // snake_case for database compatibility
  lastLoginAt?: Date;
  last_login_at?: Date; // snake_case for database compatibility
  createdAt: Date;
  updatedAt: Date;
  subscription_plan?: string;
  subscription_status?: string;
  subscription_started_at?: Date;
  subscription_expires_at?: Date;
  tax_report_paid?: boolean;
  tax_report_paid_at?: Date;
  tier?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  ADVISOR = 'advisor',
  CLIENT = 'client',
  FAMILY_MEMBER = 'family_member',
  AUDITOR = 'auditor',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  LOCKED = 'locked',
  DEACTIVATED = 'deactivated',
}

// Portfolio and asset types
export interface Portfolio {
  id: string;
  userId: string;
  user_id?: string; // snake_case for database compatibility
  name: string;
  description?: string;
  totalValue: number;
  currency: string;
  riskLevel: RiskLevel;
  risk_level?: string; // snake_case for database compatibility
  isActive: boolean;
  is_active?: boolean; // snake_case for database compatibility
  createdAt: Date;
  updatedAt: Date;
}

export enum RiskLevel {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
  VERY_AGGRESSIVE = 'very_aggressive',
}

export interface Asset {
  id: string;
  portfolioId: string;
  portfolio_id?: string; // snake_case for database compatibility
  symbol: string;
  name: string;
  type: AssetType;
  amount: number;
  value: number;
  currency: string;
  blockchain?: Blockchain;
  address?: string;
  exchange?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>; // Additional metadata field
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
  COMMODITY = 'commodity',
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
  CARDANO = 'cardano',
}

// Threat and security types
export interface Threat {
  id: string;
  userId: string;
  type: ThreatType;
  severity: ThreatSeverity;
  title: string;
  description: string;
  status: ThreatStatus;
  detectedAt: Date;
  resolvedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum ThreatType {
  PHISHING = 'phishing',
  MALWARE = 'malware',
  SUSPICIOUS_TRANSACTION = 'suspicious_transaction',
  SOCIAL_ENGINEERING = 'social_engineering',
  NETWORK_ATTACK = 'network_attack',
  PHYSICAL_SECURITY = 'physical_security',
  REGULATORY_VIOLATION = 'regulatory_violation',
  MARKET_MANIPULATION = 'market_manipulation',
}

export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ThreatStatus {
  DETECTED = 'detected',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  FALSE_POSITIVE = 'false_positive',
  RESOLVED = 'resolved',
  IGNORED = 'ignored',
}

// Compliance and regulatory types
export interface ComplianceRecord {
  id: string;
  userId: string;
  jurisdiction: Jurisdiction;
  type: ComplianceType;
  status: ComplianceStatus;
  dueDate?: Date;
  completedAt?: Date;
  documents: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Jurisdiction {
  US = 'US',
  UK = 'UK',
  EU = 'EU',
  CH = 'CH', // Switzerland
  SG = 'SG', // Singapore
  UAE = 'UAE',
}

export enum ComplianceType {
  KYC = 'kyc',
  AML = 'aml',
  TAX_FILING = 'tax_filing',
  FATCA = 'fatca',
  CRS = 'crs',
  TRAVEL_RULE = 'travel_rule',
  ENTITY_MANAGEMENT = 'entity_management',
  AUDIT = 'audit',
}

export enum ComplianceStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  EXEMPT = 'exempt',
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  twoFactorRequired?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  jurisdiction: Jurisdiction;
  referralCode?: string;
}

export interface TwoFactorSetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

// WebSocket event types
export interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface ThreatAlertEvent extends WebSocketEvent {
  type: 'threat_alert';
  payload: {
    threat: Threat;
    actionRequired: boolean;
    recommendations: string[];
  };
}

// New Recovery types
export interface RecoveryCase {
  id: string;
  incidentId: string;
  userId: string;
  stolenAssets: Asset[]; // Assuming Asset is an existing type
  suspectAddresses: string[];
  status: RecoveryStatus;
  legalActions: string[]; // Array of strings, e.g., 'Asset Seizure Petition'
  auditLog: AuditLogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export enum RecoveryStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  FROZEN = 'frozen', // Funds frozen on exchanges
  FORENSICS_COMPLETE = 'forensics_complete',
  LE_NOTIFIED = 'law_enforcement_notified',
  LEGAL_ACTION_INITIATED = 'legal_action_initiated',
  RECOVERED = 'recovered',
  FAILED = 'failed',
  CLOSED = 'closed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface AuditLogEntry {
  timestamp: Date;
  event: string;
  metadata?: Record<string, any>;
}

export interface RecoveryTransaction {
  id: string;
  userId: string;
  caseId: string;
  recoveredAmount: number;
  feePercentage: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  transactionDate: Date;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface PortfolioUpdateEvent extends WebSocketEvent {
  type: 'portfolio_update';
  payload: {
    portfolioId: string;
    changes: Partial<Portfolio>;
    assets: Asset[];
  };
}

// Error types
export interface AppError {
  name: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
  stack?: string;
  details?: Record<string, any>;
}

// Request/Response middleware types
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
  deviceId?: string;
  ipAddress?: string;
}

export interface RequestContext {
  userId?: string;
  sessionId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  requestId: string;
}

// Price and market data types
export interface PriceData {
  timestamp: Date;
  value: number;
  symbol: string;
  currency: string;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  closePrice?: number;
  volume?: number;
}

export interface MarketData {
  prices: PriceData[];
  marketCap: number;
  volume24h: number;
  change24h: number;
  change7d: number;
  lastUpdated: Date;
}

export enum SupportedExchange {
  BINANCE = 'binance',
  COINBASE = 'coinbase',
  KRAKEN = 'kraken',
  KUCOIN = 'kucoin',
  OKX = 'okx',
  BITFINEX = 'bitfinex',
  BITSTAMP = 'bitstamp',
  GEMINI = 'gemini',
  BYBIT = 'bybit',
  GATEIO = 'gateio',
  CRYPTOCOM = 'cryptocom',
  HUOBI = 'huobi',
  BITTREX = 'bittrex',
  POLONIEX = 'poloniex',
  MEXC = 'mexc',
  BITGET = 'bitget',
  LBANK = 'lbank',
  COINEX = 'coinex',
  UPBIT = 'upbit',
  BITFLYER = 'bitflyer',
  OTHER = 'other',
}

export interface ExchangeAPIClient {
  freezeAccount(accountId: string, transactionDetails: any): Promise<any>;
  // Add other exchange-specific methods as needed
}

export interface ExchangeAPIConfig {
  apiKey: string;
  apiSecret: string;
  // Add other configuration parameters as needed
}

// Referral Program Types
export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  referralCode: string;
  status: ReferralStatus;
  type: ReferralType;
  rewardType: RewardType;
  referrerReward: number;
  refereeReward: number;
  commissionRate?: number; // For affiliate programs
  expiresAt?: Date;
  usedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReferralStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  FRAUD_SUSPECTED = 'fraud_suspected',
}

export enum ReferralType {
  STANDARD = 'standard',
  AFFILIATE = 'affiliate',
  INFLUENCER = 'influencer',
  PARTNER = 'partner',
}

export enum RewardType {
  CREDIT = 'credit',
  DISCOUNT = 'discount',
  FREE_MONTH = 'free_month',
  COMMISSION = 'commission',
  POINTS = 'points',
}

export interface ReferralReward {
  id: string;
  referralId: string;
  userId: string;
  type: RewardType;
  amount: number;
  currency: string;
  status: RewardStatus;
  distributedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum RewardStatus {
  PENDING = 'pending',
  DISTRIBUTED = 'distributed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface ReferralLeaderboard {
  userId: string;
  userName: string;
  referralCount: number;
  totalRewards: number;
  rank: number;
  badges: ReferralBadge[];
  period: LeaderboardPeriod;
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

export interface ReferralBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  referralCount?: number;
  totalRewards?: number;
  streakDays?: number;
  tier?: string;
}

export interface AffiliateProgram {
  id: string;
  userId: string;
  affiliateCode: string;
  commissionRate: number;
  status: AffiliateStatus;
  totalEarnings: number;
  totalReferrals: number;
  payoutInfo: PayoutInfo;
  performance: AffiliatePerformance;
  createdAt: Date;
  updatedAt: Date;
}

export enum AffiliateStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export interface PayoutInfo {
  method: PayoutMethod;
  accountDetails: Record<string, any>;
  minimumPayout: number;
  currency: string;
}

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
  PAYPAL = 'paypal',
  CHECK = 'check',
}

export interface AffiliatePerformance {
  clicks: number;
  conversions: number;
  conversionRate: number;
  earnings: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
  topReferrals: string[]; // Referral IDs
}

export interface ReferralLink {
  id: string;
  referralId: string;
  url: string;
  qrCode?: string;
  platform?: SocialPlatform;
  clicks: number;
  conversions: number;
  createdAt: Date;
  expiresAt?: Date;
}

export enum SocialPlatform {
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  DIRECT = 'direct',
}

export interface FraudDetection {
  referralId: string;
  riskScore: number;
  flags: FraudFlag[];
  status: FraudStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

export enum FraudFlag {
  MULTIPLE_ACCOUNTS = 'multiple_accounts',
  RAPID_REFERRALS = 'rapid_referrals',
  SUSPICIOUS_IP = 'suspicious_ip',
  VPN_USAGE = 'vpn_usage',
  DEVICE_FINGERPRINT = 'device_fingerprint',
  UNUSUAL_PATTERN = 'unusual_pattern',
}

export enum FraudStatus {
  CLEAN = 'clean',
  SUSPICIOUS = 'suspicious',
  FLAGGED = 'flagged',
  BLOCKED = 'blocked',
}
