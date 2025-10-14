import { OmnichainMonitor } from '../../../src/monitoring/cross-chain/OmnichainMonitor';
import { ChainConfig, BlockchainType } from '../../../src/monitoring/cross-chain/types';
import '@types/jest';

jest.mock('@solana/web3.js');
jest.mock('@polkadot/api');
jest.mock('ethers');
jest.mock('ioredis');

describe('OmnichainMonitor', () => {
  let monitor: OmnichainMonitor;
  const mockConfigs: ChainConfig[] = [
    {
      id: 'eth-mainnet',
      name: 'Ethereum Mainnet',
      type: BlockchainType.ETHEREUM,
      rpcUrl: 'https://mainnet.infura.io/v3/your-api-key',
      confirmations: 12,
      active: true,
    },
    {
      id: 'solana-mainnet',
      name: 'Solana Mainnet',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      type: BlockchainType.SOLANA,
      confirmations: 32,
      active: true,
    },
  ];

  beforeEach(() => {
    monitor = OmnichainMonitor.getInstance();
  });

  afterEach(async () => {
    await monitor.stopMonitoring();
  });

  describe('Initialization', () => {
    it('should initialize chains successfully', async () => {
      await monitor.initialize(mockConfigs);
      const stats = await monitor.getStats();
      expect(stats.length).toBe(2);
    });

    it('should handle invalid chain configurations', async () => {
      const invalidConfig = {
        ...mockConfigs[0],
        rpcUrl: 'invalid-url',
      };

      await expect(monitor.initialize([invalidConfig])).rejects.toThrow();
    });
  });

  describe('Monitoring', () => {
    beforeEach(async () => {
      await monitor.initialize(mockConfigs);
    });

    it('should start and stop monitoring', async () => {
      await monitor.startMonitoring();
      expect(monitor.getStats()).resolves.toBeDefined();
      
      await monitor.stopMonitoring();
      // Add assertions for stopped state
    });

    it('should handle subscription callbacks', async () => {
      const mockCallback = jest.fn();
      monitor.subscribe('eth-mainnet', mockCallback);
      
      await monitor.startMonitoring();
      // Wait for some blocks
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Balance Tracking', () => {
    beforeEach(async () => {
      await monitor.initialize(mockConfigs);
    });

    it('should fetch balances across chains', async () => {
      const addresses = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'
      ];

      const balances = await monitor.getBalances(addresses);
      expect(balances.size).toBe(2);
      
      for (const [address, chainBalances] of balances) {
        expect(chainBalances.length).toBeGreaterThan(0);
        expect(chainBalances[0].address).toBe(address);
      }
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await monitor.initialize(mockConfigs);
      await monitor.startMonitoring();
    });

    it('should track chain performance metrics', async () => {
      const stats = await monitor.getStats();
      
      for (const chainStats of stats) {
        expect(chainStats.latency).toBeDefined();
        expect(chainStats.avgBlockTime).toBeGreaterThan(0);
        expect(chainStats.peersCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});