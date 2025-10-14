import { Portfolio, Asset, AssetType, Blockchain, PriceData } from '@/types';
import DatabaseService from '@/services/database';
import axios from 'axios';
import Redis from 'ioredis';
import { config as REDIS_CONFIG } from '@/config/redis';
import { Logger } from '../utils/logger';

const redis = new Redis({
  host: REDIS_CONFIG.redis.host,
  port: REDIS_CONFIG.redis.port,
  password: REDIS_CONFIG.redis.password,
  tls: REDIS_CONFIG.redis.tls ? {} : undefined,
});

export class PortfolioService {
  private static logger = new Logger('PortfolioService');
  // Cache TTL in seconds
  private static PRICE_CACHE_TTL = 300; // 5 minutes
  private static PORTFOLIO_CACHE_TTL = 60; // 1 minute
  // Create a new portfolio
  static async createPortfolio(
    userId: string,
    portfolioData: {
      name: string;
      description?: string;
      currency?: string;
      riskLevel?: string;
    }
  ): Promise<Portfolio | null> {
    try {
      const portfolio = await DatabaseService.createPortfolio({
        user_id: userId,
        name: portfolioData.name,
        description: portfolioData.description,
        currency: portfolioData.currency || 'USD',
        risk_level: portfolioData.riskLevel as any || 'moderate',
        totalValue: 0,
        is_active: true,
      });

      if (portfolio) {
        // Log portfolio creation
        await DatabaseService.logAuditEvent(
          userId,
          'portfolio_created',
          'portfolio',
          portfolio.id,
          null,
          {
            name: portfolio.name,
            currency: portfolio.currency,
            riskLevel: portfolio.risk_level,
          }
        );
      }

      return portfolio;
    } catch (error) {
      PortfolioService.logger.error('Error creating portfolio:', error);
      return null;
    }
  }

  // Get user's portfolios
  static async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    try {
      return await DatabaseService.getPortfoliosByUserId(userId);
    } catch (error) {
      PortfolioService.logger.error('Error fetching user portfolios:', error);
      return [];
    }
  }

  // Get portfolio by ID
  static async getPortfolioById(portfolioId: string): Promise<Portfolio | null> {
    try {
      return await DatabaseService.getPortfolioById(portfolioId);
    } catch (error) {
      PortfolioService.logger.error('Error fetching portfolio:', error);
      return null;
    }
  }

  // Update portfolio
  static async updatePortfolio(
    portfolioId: string,
    updates: Partial<Portfolio>
  ): Promise<Portfolio | null> {
    try {
      const portfolio = await DatabaseService.getPortfolioById(portfolioId);
      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      const updatedPortfolio = await DatabaseService.updatePortfolio(portfolioId, updates);

      if (updatedPortfolio) {
        // Log portfolio update
        await DatabaseService.logAuditEvent(
          portfolio.user_id,
          'portfolio_updated',
          'portfolio',
          portfolioId,
          portfolio,
          updates
        );
      }

      return updatedPortfolio;
    } catch (error) {
      PortfolioService.logger.error('Error updating portfolio:', error);
      return null;
    }
  }

  // Delete portfolio (soft delete by setting is_active to false)
  static async deletePortfolio(portfolioId: string, userId: string): Promise<boolean> {
    try {
      const portfolio = await DatabaseService.getPortfolioById(portfolioId);
      if (!portfolio || portfolio.user_id !== userId) {
        throw new Error('Portfolio not found or access denied');
      }

      await DatabaseService.updatePortfolio(portfolioId, { is_active: false });

      // Log portfolio deletion
      await DatabaseService.logAuditEvent(
        userId,
        'portfolio_deleted',
        'portfolio',
        portfolioId
      );

      return true;
    } catch (error) {
      PortfolioService.logger.error('Error deleting portfolio:', error);
      return false;
    }
  }

  // Add asset to portfolio
  static async addAsset(
    portfolioId: string,
    userId: string,
    assetData: {
      symbol: string;
      name: string;
      type: AssetType;
      amount: number;
      value: number;
      currency?: string;
      blockchain?: Blockchain;
      address?: string;
      exchange?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Asset | null> {
    try {
      const portfolio = await DatabaseService.getPortfolioById(portfolioId);
      if (!portfolio || portfolio.user_id !== userId) {
        throw new Error('Portfolio not found or access denied');
      }

      const asset = await DatabaseService.createAsset({
        portfolio_id: portfolioId,
        symbol: assetData.symbol,
        name: assetData.name,
        type: assetData.type,
        amount: assetData.amount,
        value: assetData.value,
        currency: assetData.currency || 'USD',
        blockchain: assetData.blockchain,
        address: assetData.address,
        exchange: assetData.exchange,
        metadata: assetData.metadata || {},
      });

      if (asset) {
        // Update portfolio total value
        await this.updatePortfolioValue(portfolioId);

        // Log asset addition
        await DatabaseService.logAuditEvent(
          userId,
          'asset_added',
          'asset',
          asset.id,
          null,
          {
            symbol: asset.symbol,
            type: asset.type,
            amount: asset.amount,
            value: asset.value,
            portfolioId: portfolioId,
          }
        );
      }

      return asset;
    } catch (error) {
      PortfolioService.logger.error('Error adding asset:', error);
      return null;
    }
  }

  // Get assets in portfolio
  static async getPortfolioAssets(portfolioId: string, userId: string): Promise<Asset[]> {
    try {
      const portfolio = await DatabaseService.getPortfolioById(portfolioId);
      if (!portfolio || portfolio.user_id !== userId) {
        throw new Error('Portfolio not found or access denied');
      }

      return await DatabaseService.getAssetsByPortfolioId(portfolioId);
    } catch (error) {
      PortfolioService.logger.error('Error fetching portfolio assets:', error);
      return [];
    }
  }

  // Update asset
  static async updateAsset(
    assetId: string,
    userId: string,
    updates: Partial<Asset>
  ): Promise<Asset | null> {
    try {
      const asset = await DatabaseService.getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const portfolio = await DatabaseService.getPortfolioById(asset.portfolio_id);
      if (!portfolio || portfolio.user_id !== userId) {
        throw new Error('Access denied');
      }

      const oldValue = asset;
      const updatedAsset = await DatabaseService.updateAsset(assetId, updates);

      if (updatedAsset) {
        // Update portfolio total value if asset value changed
        if (updates.value !== undefined || updates.amount !== undefined) {
          await this.updatePortfolioValue(asset.portfolio_id);
        }

        // Log asset update
        await DatabaseService.logAuditEvent(
          userId,
          'asset_updated',
          'asset',
          assetId,
          oldValue,
          updates
        );
      }

      return updatedAsset;
    } catch (error) {
      PortfolioService.logger.error('Error updating asset:', error);
      return null;
    }
  }

  // Remove asset from portfolio
  static async removeAsset(assetId: string, userId: string): Promise<boolean> {
    try {
      const asset = await DatabaseService.getAssetById(assetId);
      if (!asset) {
        throw new Error('Asset not found');
      }

      const portfolio = await DatabaseService.getPortfolioById(asset.portfolio_id);
      if (!portfolio || portfolio.user_id !== userId) {
        throw new Error('Access denied');
      }

      // Soft delete by setting amount to 0 and marking as inactive
      // In a real implementation, you might want to actually delete the record
      await DatabaseService.updateAsset(assetId, {
        amount: 0,
        value: 0,
        metadata: { ...asset.metadata, deleted: true, deletedAt: new Date() }
      });

      // Update portfolio total value
      await this.updatePortfolioValue(asset.portfolio_id);

      // Log asset removal
      await DatabaseService.logAuditEvent(
        userId,
        'asset_removed',
        'asset',
        assetId,
        asset,
        { removed: true }
      );

      return true;
    } catch (error) {
      PortfolioService.logger.error('Error removing asset:', error);
      return false;
    }
  }

  // Update portfolio total value based on assets
  private static async updatePortfolioValue(portfolioId: string): Promise<void> {
    try {
      const assets = await DatabaseService.getAssetsByPortfolioId(portfolioId);
      const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value), 0);

      await DatabaseService.updatePortfolio(portfolioId, {
        totalValue: totalValue,
        updatedAt: new Date(),
      });
    } catch (error) {
      PortfolioService.logger.error('Error updating portfolio value:', error);
    }
  }

  // Get portfolio summary with asset breakdown
  static async getPortfolioSummary(portfolioId: string, userId: string): Promise<any | null> {
    try {
      const portfolio = await DatabaseService.getPortfolioById(portfolioId);
      if (!portfolio || portfolio.user_id !== userId) {
        throw new Error('Portfolio not found or access denied');
      }

      const assets = await DatabaseService.getAssetsByPortfolioId(portfolioId);

      // Group assets by type
      const assetsByType = assets.reduce((acc, asset) => {
        if (!acc[asset.type]) {
          acc[asset.type] = {
            type: asset.type,
            totalValue: 0,
            count: 0,
            assets: [],
          };
        }
        acc[asset.type].totalValue += Number(asset.value);
        acc[asset.type].count += 1;
        acc[asset.type].assets.push(asset);
        return acc;
      }, {} as Record<string, any>);

      // Calculate allocation percentages
      const totalValue = Number(portfolio.totalValue);
      Object.values(assetsByType).forEach((typeData: any) => {
        typeData.percentage = totalValue > 0 ? (typeData.totalValue / totalValue) * 100 : 0;
      });

      return {
        portfolio: {
          id: portfolio.id,
          name: portfolio.name,
          totalValue: portfolio.totalValue,
          currency: portfolio.currency,
          riskLevel: portfolio.risk_level,
          assetCount: assets.length,
        },
        assetsByType: Object.values(assetsByType),
        topAssets: assets
          .sort((a, b) => Number(b.value) - Number(a.value))
          .slice(0, 10),
      };
    } catch (error) {
      PortfolioService.logger.error('Error getting portfolio summary:', error);
      return null;
    }
  }

  // Get user's total wealth across all portfolios
  // Get real-time price data
  private static async getCurrentPrices(symbols: string[]): Promise<Record<string, number>> {
    try {
      // Try cache first
      const prices = await Promise.all(
        symbols.map(async (symbol) => {
          const cached = await redis.get(`price:${symbol}`);
          return cached ? { symbol, price: parseFloat(cached) } : null;
        })
      );

      const missingSymbols = symbols.filter(
        symbol => !prices.find(p => p?.symbol === symbol)
      );

      if (missingSymbols.length > 0) {
        // Fetch from CoinGecko API
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${missingSymbols.join(',')}&vs_currencies=usd`
        );

        // Cache new prices
        await Promise.all(
          Object.entries(response.data).map(([symbol, data]: [string, any]) =>
            redis.setex(`price:${symbol}`, 300, data.usd.toString())
          )
        );

        // Combine with cached prices
        return Object.fromEntries(
          symbols.map(symbol => [
            symbol,
            prices.find(p => p?.symbol === symbol)?.price || response.data[symbol]?.usd
          ])
        );
      }

      return Object.fromEntries(
        prices.filter(p => p !== null).map(p => [p!.symbol, p!.price])
      );
    } catch (error) {
      PortfolioService.logger.error('Error fetching current prices:', error);
      throw error;
    }
  }

  // Calculate real-time portfolio metrics
  private static calculateRealTimeMetrics(
    assets: Asset[],
    currentPrices: Record<string, number>
  ): {
    profitLoss: number;
    profitLossPercentage: number;
  } {
    const initialValue = assets.reduce(
      (sum, asset) => sum + (asset.amount * (asset as any).initialPrice),
      0
    );

    const currentValue = assets.reduce(
      (sum, asset) => sum + (asset.amount * (currentPrices[asset.symbol] || 0)),
      0
    );

    const profitLoss = currentValue - initialValue;
    const profitLossPercentage = initialValue > 0 ? (profitLoss / initialValue) * 100 : 0;

    return {
      profitLoss,
      profitLossPercentage,
    };
  }

  // Get historical price data
  private static async getHistoricalPrices(
    symbols: string[],
    timeframe: string
  ): Promise<Record<string, PriceData[]>> {
    try {
      const days = timeframe === '24h' ? 1 : 
                   timeframe === '7d' ? 7 :
                   timeframe === '30d' ? 30 :
                   timeframe === '90d' ? 90 : 365;

      const results: Record<string, PriceData[]> = {};

      // Fetch historical data for each symbol
      await Promise.all(
        symbols.map(async (symbol) => {
          const response = await axios.get(
            `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${days}`
          );

          results[symbol] = response.data.prices.map(([timestamp, price]: [number, number]) => ({
            timestamp: new Date(timestamp),
            value: price,
            symbol,
            currency: 'USD',
          }));
        })
      );

      return results;
    } catch (error) {
      PortfolioService.logger.error('Error fetching historical prices:', error);
      throw error;
    }
  }

  // Get assets from a specific exchange
  private static async getExchangeAssets(exchange: any): Promise<Asset[]> {
    try {
      switch (exchange.type) {
        case 'binance':
          return this.getBinanceAssets(exchange.credentials);
        case 'coinbase':
          return this.getCoinbaseAssets(exchange.credentials);
        default:
          throw new Error(`Unsupported exchange type: ${exchange.type}`);
      }
    } catch (error) {
      PortfolioService.logger.error(`Error fetching ${exchange.type} assets:`, error);
      throw error;
    }
  }

  // Get assets from Binance
  private static async getBinanceAssets(credentials: { apiKey: string; apiSecret: string }): Promise<Asset[]> {
    // Implementation using Binance API
    const response = await axios.get('https://api.binance.com/api/v3/account', {
      headers: {
        'X-MBX-APIKEY': credentials.apiKey,
      },
    });

    return response.data.balances
      .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b: any) => ({
        symbol: b.asset,
        amount: parseFloat(b.free) + parseFloat(b.locked),
        type: AssetType.CRYPTOCURRENCY,
        exchange: 'binance',
      }));
  }

  // Get assets from Coinbase
  private static async getCoinbaseAssets(credentials: { accessToken: string }): Promise<Asset[]> {
    // Implementation using Coinbase API
    const response = await axios.get('https://api.coinbase.com/v2/accounts', {
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    return response.data.data
      .filter((acc: any) => parseFloat(acc.balance.amount) > 0)
      .map((acc: any) => ({
        symbol: acc.balance.currency,
        amount: parseFloat(acc.balance.amount),
        type: AssetType.CRYPTOCURRENCY,
        exchange: 'coinbase',
      }));
  }

  // Calculate performance metrics
  private static calculatePerformanceMetrics(
    assets: Asset[],
    historicalPrices: Record<string, PriceData[]>
  ): {
    profitLoss: number;
    profitLossPercentage: number;
    topPerformers: Array<{ symbol: string; performance: number }>;
    riskMetrics: {
      volatility: number;
      sharpeRatio: number;
      maxDrawdown: number;
    };
  } {
    const startValues = new Map<string, number>();
    const endValues = new Map<string, number>();
    const dailyReturns = new Map<string, number[]>();

    // Calculate values and returns for each asset
    for (const [symbol, prices] of Object.entries(historicalPrices)) {
      if (prices.length < 2) continue;
      
      startValues.set(symbol, prices[0].value);
      endValues.set(symbol, prices[prices.length - 1].value);
      
      const returns = prices.slice(1).map((price, i) => 
        (price.value - prices[i].value) / prices[i].value
      );
      dailyReturns.set(symbol, returns);
    }

    // Calculate portfolio-level metrics
    const totalStartValue = Array.from(startValues.entries()).reduce(
      (sum, [symbol, price]) => sum + this.getAssetAmount(assets, symbol) * price,
      0
    );

    const totalEndValue = Array.from(endValues.entries()).reduce(
      (sum, [symbol, price]) => sum + this.getAssetAmount(assets, symbol) * price,
      0
    );

    // Performance calculations
    const profitLoss = totalEndValue - totalStartValue;
    const profitLossPercentage = (profitLoss / totalStartValue) * 100;

    // Calculate top performers
    const performances = Array.from(startValues.keys()).map(symbol => ({
      symbol,
      performance: ((endValues.get(symbol)! - startValues.get(symbol)!) / startValues.get(symbol)!) * 100
    }));

    const topPerformers = performances.sort((a, b) => b.performance - a.performance).slice(0, 5);

    // Risk metrics
    const portfolioReturns = this.calculatePortfolioReturns(assets, dailyReturns);
    const volatility = this.calculateVolatility(portfolioReturns);
    const sharpeRatio = this.calculateSharpeRatio(portfolioReturns, volatility);
    const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);

    return {
      profitLoss,
      profitLossPercentage,
      topPerformers,
      riskMetrics: {
        volatility,
        sharpeRatio,
        maxDrawdown,
      },
    };
  }

  // Helper methods for performance calculations
  private static getAssetAmount(assets: Asset[], symbol: string): number {
    return assets.find(a => a.symbol === symbol)?.amount || 0;
  }

  private static calculatePortfolioReturns(
    assets: Asset[],
    dailyReturns: Map<string, number[]>
  ): number[] {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const weights = assets.reduce((map, asset) => {
      map.set(asset.symbol, asset.value / totalValue);
      return map;
    }, new Map<string, number>());

    const maxLength = Math.max(...Array.from(dailyReturns.values()).map(r => r.length));
    const portfolioReturns = new Array(maxLength).fill(0);

    for (const [symbol, returns] of dailyReturns.entries()) {
      const weight = weights.get(symbol) || 0;
      returns.forEach((ret, i) => {
        portfolioReturns[i] += ret * weight;
      });
    }

    return portfolioReturns;
  }

  private static calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized
  }

  private static calculateSharpeRatio(returns: number[], volatility: number): number {
    const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const riskFreeRate = 0.02 / 252; // Daily risk-free rate (assuming 2% annual)
    return (meanReturn - riskFreeRate) / volatility * Math.sqrt(252);
  }

  private static calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let value = 1;

    returns.forEach(ret => {
      value *= (1 + ret);
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    return maxDrawdown * 100;
  }

  // Calculate historical changes for performance metrics
  private static calculateHistoricalChanges(
    assets: Asset[],
    historicalPrices: Record<string, PriceData[]>
  ): {
    dailyChange: number;
    weeklyChange: number;
    monthlyChange: number;
    yearlyChange: number;
  } {
    const changes = {
      dailyChange: 0,
      weeklyChange: 0,
      monthlyChange: 0,
      yearlyChange: 0
    };

    // Calculate weighted changes for each period
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

    for (const asset of assets) {
      const prices = historicalPrices[asset.symbol];
      if (!prices || prices.length < 2) continue;

      const weight = asset.value / totalValue;
      const latest = prices[prices.length - 1].value;

      // Find the price points for different periods
      const day = prices.find(p => p.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000));
      const week = prices.find(p => p.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const month = prices.find(p => p.timestamp >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const year = prices.find(p => p.timestamp >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

      if (day) changes.dailyChange += ((latest - day.value) / day.value * 100) * weight;
      if (week) changes.weeklyChange += ((latest - week.value) / week.value * 100) * weight;
      if (month) changes.monthlyChange += ((latest - month.value) / month.value * 100) * weight;
      if (year) changes.yearlyChange += ((latest - year.value) / year.value * 100) * weight;
    }

    return changes;
  }

  // Get user's total wealth (improved version)
  static async getUserTotalWealth(userId: string): Promise<{
    totalValue: number;
    portfolioCount: number;
    totalAssets: number;
    performanceMetrics: {
      dailyChange: number;
      weeklyChange: number;
      monthlyChange: number;
      yearlyChange: number;
    };
    currency: string;
    lastUpdated: Date;
  }> {
    try {
      const portfolios = await DatabaseService.getPortfoliosByUserId(userId);
      const assets = await DatabaseService.getAssetsByUserId(userId);
      const currentPrices = await this.getCurrentPrices(assets.map(a => a.symbol));

      const totalValue = assets.reduce((sum, asset) => 
        sum + asset.amount * (currentPrices[asset.symbol] || 0), 
        0
      );

      // Calculate historical performance
      const historicalPrices = await this.getHistoricalPrices(
        assets.map(a => a.symbol),
        '365d' // Get full year of data
      );

      const performanceMetrics = this.calculateHistoricalChanges(assets, historicalPrices);

      return {
        totalValue,
        portfolioCount: portfolios.length,
        totalAssets: assets.length,
        performanceMetrics,
        currency: 'USD',
        lastUpdated: new Date(),
      };
    } catch (error) {
      PortfolioService.logger.error('Error calculating user total wealth:', error);
      throw error;
    }
  }
}

export default PortfolioService;
