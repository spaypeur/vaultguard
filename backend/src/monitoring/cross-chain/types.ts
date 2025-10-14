export interface ChainConfig {
  id: string;
  name: string;
  type: BlockchainType;
  rpcUrl: string;
  wsUrl?: string;
  apiKey?: string;
  startBlock?: number;
  confirmations: number;
  active: boolean;
}

export interface BlockData {
  chainId: string;
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  transactions: TransactionData[];
}

export interface TransactionData {
  chainId: string;
  txHash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  status: TransactionStatus;
  method?: string;
  gasUsed?: string;
  gasPrice?: string;
  input?: string;
  logs?: EventLog[];
}

export interface EventLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export interface AssetBalance {
  chainId: string;
  address: string;
  token: string;
  balance: string;
  symbol: string;
  decimals: number;
  lastUpdated: number;
}

export interface MonitoringStats {
  chainId: string;
  lastBlock: number;
  lastSyncTime: number;
  avgBlockTime: number;
  peersCount: number;
  syncStatus: SyncStatus;
  latency: number;
}

export enum BlockchainType {
  ETHEREUM = 'ETHEREUM',
  SOLANA = 'SOLANA',
  POLKADOT = 'POLKADOT',
  ARBITRUM = 'ARBITRUM',
  AVALANCHE = 'AVALANCHE',
  BSC = 'BSC',
  POLYGON = 'POLYGON',
  OPTIMISM = 'OPTIMISM',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export enum SyncStatus {
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED',
  ERROR = 'ERROR',
}