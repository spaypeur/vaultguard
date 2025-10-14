import { AssetType } from './database';

export interface Asset {
  id: string;
  portfolioId: string;
  symbol: string;
  name: string;
  type: AssetType;
  amount: number;
  value: number;
  currency: string;
  address?: string;
  exchange?: string;
  metadata?: Record<string, any>;
  lastUpdated: Date;
}

export interface PriceData {
  timestamp: Date;
  value: number;
  symbol: string;
  currency: string;
}

export interface PerformanceMetrics {
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  yearlyChange: number;
}

export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface UserWealthSummary {
  totalValue: number;
  portfolioCount: number;
  totalAssets: number;
  performanceMetrics: PerformanceMetrics;
  currency: string;
  lastUpdated: Date;
}