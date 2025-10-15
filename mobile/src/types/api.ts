// Local type definitions for mobile app
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum Jurisdiction {
  US = 'US',
  EU = 'EU',
  UK = 'UK',
  CA = 'CA',
  AU = 'AU',
  SG = 'SG',
  OTHER = 'OTHER'
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    twoFactorRequired?: boolean;
  };
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  jurisdiction: Jurisdiction;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  kycStatus: string;
  preferences?: Record<string, any>;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  currency: string;
  riskLevel: string;
  isActive: boolean;
  rebalancingEnabled: boolean;
  rebalancingFrequency?: string;
  targetAllocations?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  amount: number;
  value: number;
  currency: string;
  blockchain?: string;
  address?: string;
  exchange?: string;
  metadata?: Record<string, any>;
  lastUpdated: string;
}

export interface Threat {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  sourceIp?: string;
  sourceLocation?: Record<string, any>;
  indicators?: Record<string, any>;
  evidence?: Record<string, any>;
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  falsePositive: boolean;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}