import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';
import { sleep } from '../utils/helpers';

export interface ChainAnalysisOptions {
    apiKey: string;
    baseURL?: string;
    timeout?: number;
    maxRetries?: number;
}

interface TransactionAnalysis {
    risk_score: number;
    risk_triggers: string[];
    category: string;
    timestamp: Date;
}

interface AddressAnalysis {
    address: string;
    risk_score: number;
    category: string;
    total_received: number;
    total_sent: number;
    flags: string[];
    exposure: {
        sanctioned: number;
        gambling: number;
        darknet: number;
        scam: number;
        ransomware: number;
        mixer: number;
    };
}

export class ChainanalysisClient {
    private readonly client: AxiosInstance;
    private readonly logger: Logger;
    private readonly maxRetries: number;

    constructor(options: ChainAnalysisOptions) {
        this.logger = new Logger('ChainanalysisClient');
        this.maxRetries = options.maxRetries || 3;

        this.client = axios.create({
            baseURL: options.baseURL || 'https://api.chainalysis.com/api/v1',
            timeout: options.timeout || 30000,
            headers: {
                'Authorization': `Bearer ${options.apiKey}`,
                'Content-Type': 'application/json'
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
                    this.logger.warn(`Rate limited, waiting ${retryAfter}s before retry`);
                    await sleep(retryAfter * 1000);
                    return this.client.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    public async analyzeTransaction(txHash: string): Promise<TransactionAnalysis> {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.client.get(`/transactions/${txHash}`);
                return response.data;
            } catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
                }
            }
        }
        throw lastError;
    }

    public async analyzeAddress(address: string): Promise<AddressAnalysis> {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await this.client.get(`/addresses/${address}`);
                return response.data;
            } catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    await sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError;
    }

    public async analyzeMultipleAddresses(addresses: string[]): Promise<AddressAnalysis[]> {
        return await Promise.all(
            addresses.map(address => this.analyzeAddress(address))
        );
    }

    public async getTransactionHistory(address: string, startDate?: Date): Promise<TransactionAnalysis[]> {
        try {
            const params: any = {};
            if (startDate) {
                params.start_date = startDate.toISOString();
            }

            const response = await this.client.get(`/addresses/${address}/transactions`, { params });
            return response.data;
        } catch (error) {
            this.logger.error('Error fetching transaction history:', error);
            throw error;
        }
    }

    public async getClusterInfo(address: string): Promise<any> {
        try {
            const response = await this.client.get(`/clusters/${address}`);
            return response.data;
        } catch (error) {
            this.logger.error('Error fetching cluster info:', error);
            throw error;
        }
    }

    public async getExposureReport(address: string): Promise<any> {
        try {
            const response = await this.client.get(`/addresses/${address}/exposure`);
            return response.data;
        } catch (error) {
            this.logger.error('Error fetching exposure report:', error);
            throw error;
        }
    }

    public async getRiskProfile(address: string): Promise<any> {
        try {
            const response = await this.client.get(`/addresses/${address}/risk-profile`);
            return response.data;
        } catch (error) {
            this.logger.error('Error fetching risk profile:', error);
            throw error;
        }
    }

    public async getWalletService(address: string): Promise<any> {
        try {
            const response = await this.client.get(`/addresses/${address}/service`);
            return response.data;
        } catch (error) {
            this.logger.error('Error fetching wallet service:', error);
            throw error;
        }
    }

    public async searchSanctionedEntities(query: string): Promise<any> {
        try {
            const response = await this.client.get('/sanctions/search', {
                params: { query }
            });
            return response.data;
        } catch (error) {
            this.logger.error('Error searching sanctioned entities:', error);
            throw error;
        }
    }
}