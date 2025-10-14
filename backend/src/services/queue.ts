import Bull from 'bull';
import { SmartContractScanner } from './security/SmartContractScanner';
import { ContractScan } from '../models/ContractScan';
import { Logger } from '../utils/logger';

const logger = new Logger('Queue');

export enum JobQueue {
    CONTRACT_SCAN = 'contract-scan'
}

interface ContractScanJob {
    scanId: string;
    address: string;
    chainId: number;
    scanType: 'quick' | 'standard' | 'deep';
}

// Create Bull queues
const queues: { [key in JobQueue]: Bull.Queue } = {
    [JobQueue.CONTRACT_SCAN]: new Bull(JobQueue.CONTRACT_SCAN, {
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD
        }
    })
};

// Process contract scan jobs
queues[JobQueue.CONTRACT_SCAN].process(async (job) => {
    const { scanId, address, chainId, scanType } = job.data as ContractScanJob;
    
    try {
        // Update scan status
        await ContractScan.findByIdAndUpdate(scanId, {
            status: 'in-progress'
        });

        // Initialize scanner with appropriate configuration based on scan type
        const scanner = new SmartContractScanner(
            process.env.ETHERSCAN_API_KEY!,
            process.env.MYTHX_API_KEY!,
            process.env.RPC_URL!
        );

        // Perform scan with appropriate depth
        const scanOptions = {
            quick: { skipDynamicAnalysis: true, skipMythX: true },
            standard: { skipDynamicAnalysis: false, skipMythX: false },
            deep: { 
                skipDynamicAnalysis: false, 
                skipMythX: false,
                extendedAnalysis: true
            }
        };

        const report = await scanner.scanContract(address, chainId.toString());

        // Update scan results
        await ContractScan.findByIdAndUpdate(scanId, {
            status: 'completed',
            score: report.score,
            vulnerabilities: {
                high: report.high.length,
                medium: report.medium.length,
                low: report.low.length,
                info: report.info.length
            }
        });

        return report;
    } catch (error) {
        logger.error(`Error processing contract scan job ${scanId}:`, error);
        
        // Update scan status to failed
        await ContractScan.findByIdAndUpdate(scanId, {
            status: 'failed'
        });

        throw error;
    }
});

// Queue event handlers
for (const [name, queue] of Object.entries(queues)) {
    queue
        .on('completed', (job) => {
            logger.info(`Job ${job.id} in queue ${name} completed successfully`);
        })
        .on('failed', (job, error) => {
            logger.error(`Job ${job?.id} in queue ${name} failed:`, error);
        })
        .on('error', (error) => {
            logger.error(`Queue ${name} error:`, error);
        });
}

// Clean up completed jobs
for (const queue of Object.values(queues)) {
    queue.clean(15 * 24 * 60 * 60 * 1000, 'completed'); // Keep completed jobs for 15 days
}

export const createJob = async (
    queue: JobQueue,
    data: any,
    opts?: Bull.JobOptions
): Promise<Bull.Job> => {
    return queues[queue].add(data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000
        },
        removeOnComplete: true,
        ...opts
    });
};