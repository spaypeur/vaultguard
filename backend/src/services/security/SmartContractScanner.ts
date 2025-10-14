import { ethers } from 'ethers';
import { Logger } from '../../utils/logger';
import { EtherscanClient } from './etherscan';
import { MythXClient } from './mythx';
import { SlitherClient } from './slither';

interface VulnerabilityReport {
    high: Vulnerability[];
    medium: Vulnerability[];
    low: Vulnerability[];
    info: Vulnerability[];
    score: number;
    timestamp: Date;
}

interface Vulnerability {
    id: string;
    title: string;
    severity: 'High' | 'Medium' | 'Low' | 'Info';
    description: string;
    location: {
        file: string;
        line: number;
        column: number;
    };
    code: string;
    function?: string;
    recommendation: string;
    references: string[];
    swcID?: string;
    gasImpact?: number;
}

interface ContractMetadata {
    name: string;
    version: string;
    optimizer: {
        enabled: boolean;
        runs: number;
    };
    evmVersion: string;
    libraries: { [key: string]: string };
}

export class SmartContractScanner {
    private readonly logger: Logger;
    private readonly etherscan: EtherscanClient;
    private readonly mythx: MythXClient;
    private readonly slither: SlitherClient;
    private readonly provider: ethers.JsonRpcProvider;

    constructor(
        etherscanApiKey: string,
        mythxApiKey: string,
        rpcUrl: string
    ) {
        this.logger = new Logger('SmartContractScanner');
        this.etherscan = new EtherscanClient({ apiKey: etherscanApiKey });
        this.mythx = new MythXClient({ apiKey: mythxApiKey });
        this.slither = new SlitherClient();
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    public async scanContract(
        address: string,
        chain: string = 'ethereum'
    ): Promise<VulnerabilityReport> {
        this.logger.info(`Starting scan for contract ${address} on ${chain}`);

        try {
            // Get contract source code and metadata
            const contractInfo = await this.etherscan.getSmartContractInfo(address);
            
            // Run static analysis
            const [mythxResults, slitherResults] = await Promise.all([
                this.scanWithMythX(contractInfo),
                this.scanWithSlither(contractInfo)
            ]);

            // Run dynamic analysis
            const dynamicResults = await this.performDynamicAnalysis(address, contractInfo);

            // Combine and deduplicate results
            const combinedResults = this.combineResults(
                mythxResults,
                slitherResults,
                dynamicResults
            );

            // Calculate overall security score
            const score = this.calculateSecurityScore(combinedResults);

            return {
                ...combinedResults,
                score,
                timestamp: new Date()
            };
        } catch (error) {
            this.logger.error(`Error scanning contract ${address}:`, error);
            throw error;
        }
    }

    private async scanWithMythX(contractInfo: any): Promise<Vulnerability[]> {
        try {
            const analysis = await this.mythx.analyze({
                contractName: contractInfo.name,
                sourceCode: contractInfo.sourceCode,
                bytecode: contractInfo.bytecode,
                deployedBytecode: contractInfo.deployedBytecode
            });

            return this.transformMythXResults(analysis);
        } catch (error) {
            this.logger.error('Error in MythX analysis:', error);
            return [];
        }
    }

    private async scanWithSlither(contractInfo: any): Promise<Vulnerability[]> {
        try {
            const analysis = await this.slither.analyze({
                sourceCode: contractInfo.sourceCode,
                solcVersion: contractInfo.compiler.version
            });

            return this.transformSlitherResults(analysis);
        } catch (error) {
            this.logger.error('Error in Slither analysis:', error);
            return [];
        }
    }

    private async performDynamicAnalysis(
        address: string,
        contractInfo: any
    ): Promise<Vulnerability[]> {
        const vulnerabilities: Vulnerability[] = [];

        try {
            // Check for reentrancy vulnerabilities
            const reentrancyIssues = await this.checkReentrancy(address);
            vulnerabilities.push(...reentrancyIssues);

            // Check for access control issues
            const accessControlIssues = await this.checkAccessControl(address, contractInfo);
            vulnerabilities.push(...accessControlIssues);

            // Check for integer overflow/underflow
            const overflowIssues = await this.checkOverflowUnderflow(address);
            vulnerabilities.push(...overflowIssues);

            // Check for dependency vulnerabilities
            const dependencyIssues = await this.checkDependencies(contractInfo);
            vulnerabilities.push(...dependencyIssues);

            return vulnerabilities;
        } catch (error) {
            this.logger.error('Error in dynamic analysis:', error);
            return vulnerabilities;
        }
    }

    private async checkReentrancy(address: string): Promise<Vulnerability[]> {
        const vulnerabilities: Vulnerability[] = [];
        
        try {
            const contract = new ethers.Contract(address, [], this.provider);
            const code = await this.provider.getCode(address);

            // Check for potential reentrancy patterns in the bytecode
            if (this.hasReentrancyPattern(code)) {
                vulnerabilities.push({
                    id: crypto.randomUUID(),
                    title: 'Potential Reentrancy Vulnerability',
                    severity: 'High',
                    description: 'Contract may be vulnerable to reentrancy attacks',
                    location: {
                        file: 'contract',
                        line: 0,
                        column: 0
                    },
                    code: '',
                    recommendation: 'Implement reentrancy guard or use OpenZeppelin\'s ReentrancyGuard',
                    references: [
                        'https://swcregistry.io/docs/SWC-107',
                        'https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard'
                    ]
                });
            }
        } catch (error) {
            this.logger.error('Error checking reentrancy:', error);
        }

        return vulnerabilities;
    }

    private async checkAccessControl(
        address: string,
        contractInfo: any
    ): Promise<Vulnerability[]> {
        const vulnerabilities: Vulnerability[] = [];

        try {
            // Check for missing access control
            const functions = this.extractFunctions(contractInfo.abi);
            for (const func of functions) {
                if (this.isSensitiveFunction(func) && !this.hasAccessControl(func)) {
                    vulnerabilities.push({
                        id: crypto.randomUUID(),
                        title: 'Missing Access Control',
                        severity: 'High',
                        description: `Function ${func.name} lacks access control`,
                        location: {
                            file: 'contract',
                            line: 0,
                            column: 0
                        },
                        code: '',
                        function: func.name,
                        recommendation: 'Implement proper access control using OpenZeppelin\'s AccessControl',
                        references: [
                            'https://docs.openzeppelin.com/contracts/4.x/access-control'
                        ]
                    });
                }
            }
        } catch (error) {
            this.logger.error('Error checking access control:', error);
        }

        return vulnerabilities;
    }

    private async checkOverflowUnderflow(address: string): Promise<Vulnerability[]> {
        const vulnerabilities: Vulnerability[] = [];

        try {
            const contract = new ethers.Contract(address, [], this.provider);
            const code = await this.provider.getCode(address);

            // Check for SafeMath usage or built-in overflow checks
            if (!this.hasSafeMathOrOverflowChecks(code)) {
                vulnerabilities.push({
                    id: crypto.randomUUID(),
                    title: 'Potential Integer Overflow/Underflow',
                    severity: 'High',
                    description: 'Contract may be vulnerable to integer overflow/underflow',
                    location: {
                        file: 'contract',
                        line: 0,
                        column: 0
                    },
                    code: '',
                    recommendation: 'Use SafeMath for Solidity <0.8.0 or upgrade to Solidity >=0.8.0',
                    references: [
                        'https://swcregistry.io/docs/SWC-101',
                        'https://docs.openzeppelin.com/contracts/4.x/api/utils#SafeMath'
                    ]
                });
            }
        } catch (error) {
            this.logger.error('Error checking overflow/underflow:', error);
        }

        return vulnerabilities;
    }

    private async checkDependencies(contractInfo: any): Promise<Vulnerability[]> {
        const vulnerabilities: Vulnerability[] = [];

        try {
            // Check compiler version
            if (this.isVulnerableCompilerVersion(contractInfo.compiler.version)) {
                vulnerabilities.push({
                    id: crypto.randomUUID(),
                    title: 'Vulnerable Compiler Version',
                    severity: 'Medium',
                    description: 'Contract uses a compiler version with known vulnerabilities',
                    location: {
                        file: 'contract',
                        line: 0,
                        column: 0
                    },
                    code: '',
                    recommendation: 'Upgrade to the latest stable Solidity version',
                    references: [
                        'https://github.com/ethereum/solidity/releases'
                    ]
                });
            }

            // Check dependencies
            const outdatedDeps = this.checkOutdatedDependencies(contractInfo);
            vulnerabilities.push(...outdatedDeps);
        } catch (error) {
            this.logger.error('Error checking dependencies:', error);
        }

        return vulnerabilities;
    }

    private hasReentrancyPattern(bytecode: string): boolean {
        // Implement bytecode pattern matching for reentrancy
        return false;
    }

    private hasSafeMathOrOverflowChecks(bytecode: string): boolean {
        // Implement SafeMath detection logic
        return false;
    }

    private isVulnerableCompilerVersion(version: string): boolean {
        // Implement compiler version checking
        return false;
    }

    private checkOutdatedDependencies(contractInfo: any): Vulnerability[] {
        // Implement dependency checking
        return [];
    }

    private transformMythXResults(results: any): Vulnerability[] {
        // Transform MythX results to standard format
        return [];
    }

    private transformSlitherResults(results: any): Vulnerability[] {
        // Transform Slither results to standard format
        return [];
    }

    private combineResults(...results: Vulnerability[][]): {
        high: Vulnerability[];
        medium: Vulnerability[];
        low: Vulnerability[];
        info: Vulnerability[];
    } {
        const combined = results.flat();
        return {
            high: combined.filter(v => v.severity === 'High'),
            medium: combined.filter(v => v.severity === 'Medium'),
            low: combined.filter(v => v.severity === 'Low'),
            info: combined.filter(v => v.severity === 'Info')
        };
    }

    private calculateSecurityScore(results: {
        high: Vulnerability[];
        medium: Vulnerability[];
        low: Vulnerability[];
        info: Vulnerability[];
    }): number {
        const weights = {
            high: 10,
            medium: 5,
            low: 2,
            info: 0.5
        };

        const totalIssues =
            results.high.length * weights.high +
            results.medium.length * weights.medium +
            results.low.length * weights.low +
            results.info.length * weights.info;

        // Score from 0-100, lower is worse
        return Math.max(0, 100 - totalIssues);
    }

    private extractFunctions(abi: any[]): any[] {
        return abi.filter(item => item.type === 'function');
    }

    private isSensitiveFunction(func: any): boolean {
        const sensitivePatterns = [
            'transfer',
            'send',
            'withdraw',
            'selfdestruct',
            'delegatecall'
        ];
        return sensitivePatterns.some(pattern => 
            func.name.toLowerCase().includes(pattern)
        );
    }

    private hasAccessControl(func: any): boolean {
        // Check for modifiers or require statements that implement access control
        return false;
    }
}