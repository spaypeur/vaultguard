import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger } from '../../utils/logger';

interface SlitherAnalysis {
    sourceCode: string;
    solcVersion: string;
}

export class SlitherClient {
    private readonly tempDir: string;
    private readonly logger: Logger;

    constructor() {
        this.tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'slither-'));
        this.logger = new Logger('slither-client');
    }

    public async analyze(contract: SlitherAnalysis): Promise<any> {
        try {
            // Create temporary contract file
            const contractPath = this.createTempContractFile(contract.sourceCode);

            // Run Slither analysis
            const result = this.runSlitherAnalysis(contractPath, contract.solcVersion);

            // Parse and return results
            return this.parseSlitherOutput(result);
        } finally {
            // Cleanup temporary files
            this.cleanup();
        }
    }

    private createTempContractFile(sourceCode: string): string {
        const filePath = path.join(this.tempDir, 'Contract.sol');
        fs.writeFileSync(filePath, sourceCode);
        return filePath;
    }

    private runSlitherAnalysis(contractPath: string, solcVersion: string): string {
        try {
            // Set Solidity version
            const solcCommand = `solc-select install ${solcVersion} && solc-select use ${solcVersion}`;
            execSync(solcCommand, { stdio: 'pipe' });

            // Run Slither
            const command = `slither ${contractPath} --json -`;
            return execSync(command, {
                stdio: ['pipe', 'pipe', 'pipe'],
                encoding: 'utf-8'
            });
        } catch (error: any) {
            if (error.stdout) {
                // Slither outputs findings to stdout even when returning non-zero
                return error.stdout;
            }
            throw error;
        }
    }

    private parseSlitherOutput(output: string): any {
        try {
            const results = JSON.parse(output);
            return this.transformSlitherResults(results);
        } catch (error) {
            throw new Error(`Failed to parse Slither output: ${error}`);
        }
    }

    private transformSlitherResults(results: any): any {
        // Transform Slither results into standardized format
        const transformed: any[] = [];

        if (results.results && results.results.detectors) {
            for (const finding of results.results.detectors) {
                transformed.push({
                    title: finding.check,
                    description: finding.description,
                    severity: this.mapSlitherSeverity(finding.impact),
                    location: {
                        file: finding.elements[0]?.source_mapping?.filename || 'unknown',
                        line: finding.elements[0]?.source_mapping?.lines[0] || 0,
                        column: 0
                    },
                    code: finding.elements[0]?.name || '',
                    recommendation: finding.recommendation || '',
                    references: finding.wiki_url ? [finding.wiki_url] : []
                });
            }
        }

        return transformed;
    }

    private mapSlitherSeverity(impact: string): 'High' | 'Medium' | 'Low' | 'Info' {
        switch (impact.toLowerCase()) {
            case 'high':
                return 'High';
            case 'medium':
                return 'Medium';
            case 'low':
                return 'Low';
            default:
                return 'Info';
        }
    }

    private cleanup(): void {
        try {
            fs.rmSync(this.tempDir, { recursive: true });
        } catch (error) {
            // Ignore cleanup errors
            this.logger.error('Error cleaning up temporary files:', error);
        }
    }
}