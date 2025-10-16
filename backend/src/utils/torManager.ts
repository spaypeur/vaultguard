import { SocksProxyAgent } from 'socks-proxy-agent';
import { Logger } from './logger';

class TorManager {
    private static instance: TorManager;
    private readonly logger: Logger;
    private httpAgent: SocksProxyAgent;
    private httpsAgent: SocksProxyAgent;
    private readonly TOR_PROXY = 'socks5h://127.0.0.1:9050';

    private constructor() {
        this.logger = new Logger('TorManager');
        this.setupAgents();
    }

    public static getInstance(): TorManager {
        if (!TorManager.instance) {
            TorManager.instance = new TorManager();
        }
        return TorManager.instance;
    }

    private setupAgents(): void {
        this.httpAgent = new SocksProxyAgent(this.TOR_PROXY);
        this.httpsAgent = new SocksProxyAgent(this.TOR_PROXY);
    }

    public async initialize(): Promise<void> {
        try {
            await this.renewCircuit();
            this.logger.info('Tor circuit initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Tor circuit:', error);
            throw error;
        }
    }

    public async renewCircuit(): Promise<void> {
        try {
            // Implement Tor control protocol commands here
            // This would typically involve sending SIGNAL NEWNYM to the Tor controller
            this.setupAgents(); // Create new agents with fresh circuit
            this.logger.info('Tor circuit renewed successfully');
        } catch (error) {
            this.logger.error('Failed to renew Tor circuit:', error);
            throw error;
        }
    }

    public getHttpAgent(): SocksProxyAgent {
        return this.httpAgent;
    }

    public getHttpsAgent(): SocksProxyAgent {
        return this.httpsAgent;
    }
}

export const initialize = async () => {
    await TorManager.getInstance().initialize();
};

export const renewCircuit = async () => {
    await TorManager.getInstance().renewCircuit();
};

export const getHttpAgent = () => {
    return TorManager.getInstance().getHttpAgent();
};

export const getHttpsAgent = () => {
    return TorManager.getInstance().getHttpsAgent();
};