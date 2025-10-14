import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';
import { sleep } from '../utils/helpers';

export interface MessariOptions {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
}

interface AssetMetrics {
    id: string;
    symbol: string;
    metrics: {
        market_data: {
            price_usd: number;
            volume_last_24_hours: number;
            real_volume_last_24_hours: number;
            volume_last_24_hours_overstatement_multiple: number;
            percent_change_usd_last_24_hours: number;
            percent_change_usd_last_1_hour: number;
            percent_change_usd_last_7_days: number;
        };
        marketcap: {
            current_marketcap_usd: number;
            liquid_marketcap_usd: number;
            realized_marketcap_usd: number;
            marketcap_dominance_percent: number;
        };
        supply: {
            circulating: number;
            y_2050: number;
            y_plus10: number;
            liquid: number;
            supply_revived_90d: number;
            supply_active_10y: number;
            supply_active_180d: number;
            supply_active_1d: number;
            supply_active_1y: number;
            supply_active_2y: number;
            supply_active_30d: number;
            supply_active_3y: number;
            supply_active_4y: number;
            supply_active_5y: number;
            supply_active_7d: number;
            supply_active_90d: number;
        };
        blockchain_stats_24_hours: {
            count_of_active_addresses: number;
            transaction_volume: number;
            adjusted_transaction_volume: number;
            adjusted_nvt: number;
            median_tx_value: number;
            median_tx_fee: number;
            count_of_tx: number;
            count_of_payments: number;
            new_issuance: number;
            average_difficulty: number;
            kilobytes_added: number;
            count_of_blocks_added: number;
        };
        risk_metrics: {
            sharpe_ratios: {
                last_30_days: number;
                last_90_days: number;
                last_1_year: number;
                last_3_years: number;
            };
            volatility_stats: {
                volatility_last_30_days: number;
                volatility_last_90_days: number;
                volatility_last_1_year: number;
                volatility_last_3_years: number;
            };
        };
        mining_stats: {
            mining_revenue_from_fees_percent_last_24_hours: number;
            mining_revenue_usd_last_24_hours: number;
            mining_revenue_native_units_last_24_hours: number;
            mining_hash_rate: number;
        };
        exchange_metrics: {
            volume_last_24_hours: number;
            volume_last_24_hours_by_exchange: {
                [exchange: string]: number;
            };
        };
    };
}

interface MarketData {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    market_cap: number;
    timestamp: string;
}

export class MessariClient {
    private readonly client: AxiosInstance;
    private readonly logger: Logger;
    private readonly maxRetries: number;

    constructor(options: MessariOptions) {
        this.logger = new Logger('MessariClient');
        this.maxRetries = options.maxRetries || 3;

        this.client = axios.create({
            baseURL: options.baseURL || 'https://data.messari.io/api/v2',
            timeout: options.timeout || 30000,
            headers: {
                'x-messari-api-key': options.apiKey
            }
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.client.interceptors.response.use(
            response => response,
            async error => {
                if (error.response?.status === 429) {
                    const retryAfter = error.response.headers['retry-after'] || 60;
                    await sleep(retryAfter * 1000);
                    return this.client.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    public async getAssetMetrics(assetKey: string): Promise<AssetMetrics> {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.client.get(`/assets/${assetKey}/metrics`);
                return response.data.data;
            } catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    await sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError;
    }

    public async getAssetMarketData(
        assetKey: string,
        start?: Date,
        end?: Date,
        interval: '1d' | '1h' | '15m' = '1d'
    ): Promise<MarketData[]> {
        try {
            const params: any = { interval };
            if (start) params.start = start.toISOString();
            if (end) params.end = end.toISOString();

            const response = await this.client.get(
                `/assets/${assetKey}/metrics/price/time-series`,
                { params }
            );
            return response.data.data.values;
        } catch (error) {
            this.logger.error('Error fetching market data:', error);
            throw error;
        }
    }

    public async getAssetRiskMetrics(assetKey: string): Promise<any> {
        try {
            const response = await this.client.get(`/assets/${assetKey}/metrics/risk`);
            return response.data.data;
        } catch (error) {
            this.logger.error('Error fetching risk metrics:', error);
            throw error;
        }
    }

    public async getAssetCorrelations(assetKey: string): Promise<any> {
        try {
            const response = await this.client.get(`/assets/${assetKey}/metrics/correlations`);
            return response.data.data;
        } catch (error) {
            this.logger.error('Error fetching correlations:', error);
            throw error;
        }
    }

    public async getAssetProfiles(assetKey: string): Promise<any> {
        try {
            const response = await this.client.get(`/assets/${assetKey}/profile`);
            return response.data.data;
        } catch (error) {
            this.logger.error('Error fetching asset profile:', error);
            throw error;
        }
    }

    public async getMarketOverview(): Promise<any> {
        try {
            const response = await this.client.get('/markets');
            return response.data.data;
        } catch (error) {
            this.logger.error('Error fetching market overview:', error);
            throw error;
        }
    }

    public async getAssetMetricsAll(assets: string[]): Promise<AssetMetrics[]> {
        return await Promise.all(
            assets.map(asset => this.getAssetMetrics(asset))
        );
    }

    public async getMarketDataBatch(
        assets: string[],
        start?: Date,
        end?: Date,
        interval: '1d' | '1h' | '15m' = '1d'
    ): Promise<{ [asset: string]: MarketData[] }> {
        const results: { [asset: string]: MarketData[] } = {};
        
        await Promise.all(
            assets.map(async (asset) => {
                results[asset] = await this.getAssetMarketData(asset, start, end, interval);
            })
        );

        return results;
    }

    public async getRiskMetricsBatch(assets: string[]): Promise<{ [asset: string]: any }> {
        const results: { [asset: string]: any } = {};
        
        await Promise.all(
            assets.map(async (asset) => {
                results[asset] = await this.getAssetRiskMetrics(asset);
            })
        );

        return results;
    }
}