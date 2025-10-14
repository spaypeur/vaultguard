import { sleep } from '../../utils/helpers';

interface MythXConfig {
    apiKey: string;
}

interface AnalysisRequest {
    contractName: string;
    sourceCode: string;
    bytecode: string;
    deployedBytecode: string;
}

export class MythXClient {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.mythx.io/v1';

    constructor(config: MythXConfig) {
        this.apiKey = config.apiKey;
    }

    public async analyze(contract: AnalysisRequest): Promise<any> {
        // Submit analysis
        const analysisId = await this.submitAnalysis(contract);

        // Poll for results
        const result = await this.pollAnalysisStatus(analysisId);

        return result;
    }

    private async submitAnalysis(contract: AnalysisRequest): Promise<string> {
        const response = await fetch(`${this.baseUrl}/analyses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    type: 'analyses',
                    attributes: {
                        mainSource: contract.sourceCode,
                        bytecode: contract.bytecode,
                        deployedBytecode: contract.deployedBytecode,
                        sourceMap: '',
                        deployedSourceMap: '',
                        analysisMode: 'full',
                        contractName: contract.contractName
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`MythX API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.id;
    }

    private async pollAnalysisStatus(analysisId: string): Promise<any> {
        const maxAttempts = 30;
        const pollingInterval = 10000; // 10 seconds

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const status = await this.getAnalysisStatus(analysisId);

            if (status.status === 'finished') {
                return status.issues;
            }

            if (status.status === 'error') {
                throw new Error(`Analysis failed: ${status.error}`);
            }

            await sleep(pollingInterval);
        }

        throw new Error('Analysis timed out');
    }

    private async getAnalysisStatus(analysisId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/analyses/${analysisId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        if (!response.ok) {
            throw new Error(`MythX API error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            status: data.data.attributes.status,
            issues: data.data.attributes.issues || [],
            error: data.data.attributes.error
        };
    }
}