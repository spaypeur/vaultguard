import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';
import { sleep } from '../utils/helpers';

export interface EtherscanOptions {
    apiKey: string;
    network?: 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'goerli';
    timeout?: number;
    maxRetries?: number;
}

interface SmartContractInfo {
    address: string;
    name?: string;
    abi: string;
    sourceCode: string;
    compiler: {
        version: string;
        optimization: boolean;
    };
    verification: {
        status: string;
        date: Date;
    };
}

interface AddressAnalytics {
    balance: string;
    transactions: number;
    firstTx: {
        hash: string;
        timestamp: Date;
    };
    lastTx: {
        hash: string;
        timestamp: Date;
    };
}

export class EtherscanClient {
    private readonly client: AxiosInstance;
    private readonly logger: Logger;
    private readonly maxRetries: number;
    private readonly apiKey: string;

    constructor(options: EtherscanOptions) {
        this.logger = new Logger('EtherscanClient');
        this.maxRetries = options.maxRetries || 3;
        this.apiKey = options.apiKey;

        const network = options.network || 'mainnet';
        const baseURL = network === 'mainnet' 
            ? 'https://api.etherscan.io/api'
            : `https://api-${network}.etherscan.io/api`;

        this.client = axios.create({
            baseURL,
            timeout: options.timeout || 30000
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        this.client.interceptors.response.use(
            response => {
                if (response.data.status === '0') {
                    throw new Error(response.data.result);
                }
                return response;
            },
            async error => {
                if (error.response?.status === 429) {
                    const retryAfter = error.response.headers['retry-after'] || 5;
                    await sleep(retryAfter * 1000);
                    return this.client.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    public async getSmartContractInfo(address: string): Promise<SmartContractInfo> {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const [sourceCodeResponse, abiResponse] = await Promise.all([
                    this.client.get('', {
                        params: {
                            module: 'contract',
                            action: 'getsourcecode',
                            address,
                            apikey: this.apiKey
                        }
                    }),
                    this.client.get('', {
                        params: {
                            module: 'contract',
                            action: 'getabi',
                            address,
                            apikey: this.apiKey
                        }
                    })
                ]);

                const sourceData = sourceCodeResponse.data.result[0];
                
                return {
                    address,
                    name: sourceData.ContractName,
                    abi: abiResponse.data.result,
                    sourceCode: sourceData.SourceCode,
                    compiler: {
                        version: sourceData.CompilerVersion,
                        optimization: sourceData.OptimizationUsed === '1'
                    },
                    verification: {
                        status: 'Verified',
                        date: new Date(parseInt(sourceData.VerifiedTimestamp) * 1000)
                    }
                };
            } catch (error) {
                lastError = error;
                if (attempt < this.maxRetries) {
                    await sleep(Math.pow(2, attempt) * 1000);
                }
            }
        }
        throw lastError;
    }

    public async getAddressAnalytics(address: string): Promise<AddressAnalytics> {
        try {
            const [balanceResponse, txListResponse] = await Promise.all([
                this.client.get('', {
                    params: {
                        module: 'account',
                        action: 'balance',
                        address,
                        tag: 'latest',
                        apikey: this.apiKey
                    }
                }),
                this.client.get('', {
                    params: {
                        module: 'account',
                        action: 'txlist',
                        address,
                        sort: 'asc',
                        apikey: this.apiKey
                    }
                })
            ]);

            const transactions = txListResponse.data.result;
            const firstTx = transactions[0];
            const lastTx = transactions[transactions.length - 1];

            return {
                balance: balanceResponse.data.result,
                transactions: transactions.length,
                firstTx: firstTx ? {
                    hash: firstTx.hash,
                    timestamp: new Date(parseInt(firstTx.timeStamp) * 1000)
                } : undefined,
                lastTx: lastTx ? {
                    hash: lastTx.hash,
                    timestamp: new Date(parseInt(lastTx.timeStamp) * 1000)
                } : undefined
            };
        } catch (error) {
            this.logger.error('Error fetching address analytics:', error);
            throw error;
        }
    }

    public async getContractEvents(
        address: string,
        fromBlock: number,
        toBlock: number | string = 'latest'
    ): Promise<any[]> {
        try {
            const response = await this.client.get('', {
                params: {
                    module: 'logs',
                    action: 'getLogs',
                    address,
                    fromBlock,
                    toBlock,
                    apikey: this.apiKey
                }
            });

            return response.data.result;
        } catch (error) {
            this.logger.error('Error fetching contract events:', error);
            throw error;
        }
    }

    public async getInternalTransactions(address: string): Promise<any[]> {
        try {
            const response = await this.client.get('', {
                params: {
                    module: 'account',
                    action: 'txlistinternal',
                    address,
                    sort: 'desc',
                    apikey: this.apiKey
                }
            });

            return response.data.result;
        } catch (error) {
            this.logger.error('Error fetching internal transactions:', error);
            throw error;
        }
    }

    public async getTokenTransfers(address: string): Promise<any[]> {
        try {
            const response = await this.client.get('', {
                params: {
                    module: 'account',
                    action: 'tokentx',
                    address,
                    sort: 'desc',
                    apikey: this.apiKey
                }
            });

            return response.data.result;
        } catch (error) {
            this.logger.error('Error fetching token transfers:', error);
            throw error;
        }
    }

    public async getGasUsage(address: string): Promise<any> {
        try {
            const response = await this.client.get('', {
                params: {
                    module: 'stats',
                    action: 'gasused',
                    address,
                    apikey: this.apiKey
                }
            });

            return response.data.result;
        } catch (error) {
            this.logger.error('Error fetching gas usage:', error);
            throw error;
        }
    }

    public async getContractCreation(address: string): Promise<any> {
        try {
            const response = await this.client.get('', {
                params: {
                    module: 'contract',
                    action: 'getcontractcreation',
                    contractaddresses: address,
                    apikey: this.apiKey
                }
            });

            return response.data.result[0];
        } catch (error) {
            this.logger.error('Error fetching contract creation:', error);
            throw error;
        }
    }
}
