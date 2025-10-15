import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { OmnichainMonitor } from '../../monitoring/cross-chain/OmnichainMonitor';
import { PredictiveSecurity } from '../../security/predictive/PredictiveSecurity';
import { Logger } from '../../utils/logger';

interface RiskScore {
    overall: number;
    components: {
        marketRisk: number;
        counterpartyRisk: number;
        smartContractRisk: number;
        liquidityRisk: number;
        regulatoryRisk: number;
    };
    factors: RiskFactor[];
    timestamp: Date;
}

interface RiskFactor {
    name: string;
    score: number;
    weight: number;
    details: string;
}

interface AssetExposure {
    asset: string;
    amount: BigNumber;
    value: BigNumber;
    protocol: string;
    chain: string;
    // Additional properties for risk analysis
    has_audit?: boolean;
    audit_score?: number;
    liquidity?: number;
    volume_24h?: number;
    has_withdrawal_limits?: boolean;
    daily_withdrawal_limit?: number;
    is_compliant?: boolean;
    jurisdiction?: string;
    is_regulated?: boolean;
}

export class PortfolioThreatIntel {
    private chainMonitor: OmnichainMonitor;
    private predictiveSecurity: PredictiveSecurity;
    private readonly logger: Logger;
    private readonly CHAINALYSIS_API_KEY = process.env.CHAINALYSIS_API_KEY;
    private readonly ELLIPTIC_API_KEY = process.env.ELLIPTIC_API_KEY;
    private readonly MESSARI_API_KEY = process.env.MESSARI_API_KEY;

    constructor() {
        this.chainMonitor = OmnichainMonitor.getInstance();
        this.predictiveSecurity = PredictiveSecurity.getInstance();
        this.logger = new Logger('portfolio-threat-intel');
    }

    public async calculatePortfolioRisk(exposures: AssetExposure[]): Promise<RiskScore> {
        try {
            // Gather risk data from multiple sources
            const [
                marketRisks,
                counterpartyRisks,
                contractRisks,
                liquidityRisks,
                regulatoryRisks
            ] = await Promise.all([
                this.assessMarketRisks(exposures),
                this.assessCounterpartyRisks(exposures),
                this.assessSmartContractRisks(exposures),
                this.assessLiquidityRisks(exposures),
                this.assessRegulatoryRisks(exposures)
            ]);

            // Calculate weighted risk score
            const components = {
                marketRisk: this.calculateWeightedScore(marketRisks),
                counterpartyRisk: this.calculateWeightedScore(counterpartyRisks),
                smartContractRisk: this.calculateWeightedScore(contractRisks),
                liquidityRisk: this.calculateWeightedScore(liquidityRisks),
                regulatoryRisk: this.calculateWeightedScore(regulatoryRisks)
            };

            const factors = [
                ...marketRisks,
                ...counterpartyRisks,
                ...contractRisks,
                ...liquidityRisks,
                ...regulatoryRisks
            ];

            const overall = this.calculateOverallRiskScore(components);

            return {
                overall,
                components,
                factors,
                timestamp: new Date()
            };
        } catch (error) {
            this.logger.error('Portfolio risk calculation error:', error);
            throw error;
        }
    }

    private async assessMarketRisks(exposures: AssetExposure[]): Promise<RiskFactor[]> {
        const risks: RiskFactor[] = [];

        // Query Messari for market data
        const marketData = await Promise.all(
            exposures.map(exp => this.getMessariAssetData(exp.asset))
        );

        // Analyze volatility
        risks.push({
            name: 'Volatility Risk',
            score: this.calculateVolatilityScore(marketData),
            weight: 0.3,
            details: 'Based on 30-day historical volatility'
        });

        // Analyze market concentration
        risks.push({
            name: 'Concentration Risk',
            score: this.calculateConcentrationScore(exposures),
            weight: 0.25,
            details: 'Portfolio concentration in specific assets'
        });

        // Analyze correlation risk
        risks.push({
            name: 'Correlation Risk',
            score: this.calculateCorrelationScore(marketData),
            weight: 0.2,
            details: 'Inter-asset price correlation analysis'
        });

        return risks;
    }

    private async assessCounterpartyRisks(exposures: AssetExposure[]): Promise<RiskFactor[]> {
        const risks: RiskFactor[] = [];

        // Query Chainalysis for counterparty risks
        for (const exposure of exposures) {
            const counterpartyData = await this.getChainalysisData(exposure);
            
            risks.push({
                name: 'Counterparty Risk',
                score: this.analyzeCounterpartyRisk(counterpartyData),
                weight: 0.4,
                details: `Analysis of ${exposure.protocol} protocol risk`
            });
        }

        // Analyze protocol security
        risks.push({
            name: 'Protocol Security Risk',
            score: await this.analyzeProtocolSecurity(exposures),
            weight: 0.35,
            details: 'Security assessment of involved protocols'
        });

        return risks;
    }

    private async assessSmartContractRisks(exposures: AssetExposure[]): Promise<RiskFactor[]> {
        const risks: RiskFactor[] = [];

        // Analyze smart contract vulnerabilities
        for (const exposure of exposures) {
            const contractAnalysis = await this.analyzeSmartContract(exposure);
            
            risks.push({
                name: 'Smart Contract Risk',
                score: this.calculateContractRiskScore(contractAnalysis),
                weight: 0.45,
                details: `Smart contract analysis for ${exposure.protocol}`
            });
        }

        return risks;
    }

    private async assessLiquidityRisks(exposures: AssetExposure[]): Promise<RiskFactor[]> {
        const risks: RiskFactor[] = [];

        // Analyze liquidity depth
        risks.push({
            name: 'Liquidity Depth Risk',
            score: await this.analyzeLiquidityDepth(exposures),
            weight: 0.3,
            details: 'Analysis of market liquidity depth'
        });

        // Analyze withdrawal limits
        risks.push({
            name: 'Withdrawal Risk',
            score: await this.analyzeWithdrawalLimits(exposures),
            weight: 0.25,
            details: 'Protocol withdrawal limitations'
        });

        return risks;
    }

    private async assessRegulatoryRisks(exposures: AssetExposure[]): Promise<RiskFactor[]> {
        const risks: RiskFactor[] = [];

        // Analyze regulatory compliance
        risks.push({
            name: 'Regulatory Compliance Risk',
            score: await this.analyzeRegulatoryCompliance(exposures),
            weight: 0.4,
            details: 'Regulatory compliance assessment'
        });

        // Analyze jurisdictional exposure
        risks.push({
            name: 'Jurisdictional Risk',
            score: await this.analyzeJurisdictionalExposure(exposures),
            weight: 0.35,
            details: 'Exposure to high-risk jurisdictions'
        });

        return risks;
    }

    private async getMessariAssetData(asset: string): Promise<any> {
        const response = await axios.get(
            `https://data.messari.io/api/v1/assets/${asset}/metrics`,
            {
                headers: { 'x-messari-api-key': this.MESSARI_API_KEY }
            }
        );
        return response.data;
    }

    private async getChainalysisData(exposure: AssetExposure): Promise<any> {
        const response = await axios.get(
            'https://api.chainalysis.com/api/risk-assessment',
            {
                headers: { 'Authorization': `Bearer ${this.CHAINALYSIS_API_KEY}` },
                params: {
                    address: exposure.protocol,
                    asset: exposure.asset
                }
            }
        );
        return response.data;
    }

    private async analyzeSmartContract(exposure: AssetExposure): Promise<any> {
        const response = await axios.post(
            'https://api.elliptic.co/v2/smart-contract-analysis',
            {
                chain: exposure.chain,
                contractAddress: exposure.protocol
            },
            {
                headers: { 'Authorization': `Bearer ${this.ELLIPTIC_API_KEY}` }
            }
        );
        return response.data;
    }

    private calculateVolatilityScore(marketData: any[]): number {
        if (!marketData || marketData.length === 0) return 0.5;
        
        const prices = marketData.map(d => d.price || 0);
        const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
        const stdDev = Math.sqrt(variance);
        const volatility = stdDev / mean;
        
        return Math.min(volatility * 2, 1.0);
    }

    private calculateConcentrationScore(exposures: AssetExposure[]): number {
        if (!exposures || exposures.length === 0) return 0;
        
        const totalValue = exposures.reduce((sum, e) => sum + (e.value || 0), 0);
        if (totalValue === 0) return 0;
        
        const concentrations = exposures.map(e => (e.value || 0) / totalValue);
        const herfindahlIndex = concentrations.reduce((sum, c) => sum + c * c, 0);
        
        return Math.min(herfindahlIndex * 1.5, 1.0);
    }

    private calculateCorrelationScore(marketData: any[]): number {
        if (!marketData || marketData.length < 2) return 0.5;
        
        let totalCorrelation = 0;
        let pairs = 0;
        
        for (let i = 0; i < marketData.length; i++) {
            for (let j = i + 1; j < marketData.length; j++) {
                const correlation = Math.abs(marketData[i].correlation_with?.[marketData[j].symbol] || 0);
                totalCorrelation += correlation;
                pairs++;
            }
        }
        
        return pairs > 0 ? totalCorrelation / pairs : 0.5;
    }

    private analyzeCounterpartyRisk(data: any): number {
        const reputation = data.reputation_score || 50;
        const history = data.transaction_history_count || 0;
        const disputes = data.dispute_count || 0;
        
        let score = 0;
        if (reputation < 50) score += 0.4;
        if (history < 10) score += 0.3;
        if (disputes > 0) score += 0.3;
        
        return Math.min(score, 1.0);
    }

    private async analyzeProtocolSecurity(exposures: AssetExposure[]): Promise<number> {
        let totalRisk = 0;
        let count = 0;
        
        for (const exposure of exposures) {
            const protocol = exposure.protocol || '';
            const hasAudit = exposure.has_audit || false;
            const auditScore = exposure.audit_score || 0;
            
            let risk = 0;
            if (!hasAudit) risk += 0.5;
            if (auditScore < 70) risk += 0.3;
            if (protocol === 'unknown') risk += 0.2;
            
            totalRisk += Math.min(risk, 1.0);
            count++;
        }
        
        return count > 0 ? totalRisk / count : 0.5;
    }

    private calculateContractRiskScore(analysis: any): number {
        const vulnerabilities = analysis.vulnerabilities || 0;
        const complexity = analysis.complexity_score || 0;
        const isUpgradeable = analysis.is_upgradeable || false;
        
        let score = 0;
        if (vulnerabilities > 0) score += 0.5;
        if (complexity > 80) score += 0.3;
        if (isUpgradeable) score += 0.2;
        
        return Math.min(score, 1.0);
    }

    private async analyzeLiquidityDepth(exposures: AssetExposure[]): Promise<number> {
        let totalRisk = 0;
        let count = 0;
        
        for (const exposure of exposures) {
            const liquidity = exposure.liquidity || 0;
            const volume24h = exposure.volume_24h || 0;
            
            let risk = 0;
            if (liquidity < 1000000) risk += 0.4;
            if (volume24h < 100000) risk += 0.3;
            
            totalRisk += Math.min(risk, 1.0);
            count++;
        }
        
        return count > 0 ? totalRisk / count : 0.5;
    }

    private async analyzeWithdrawalLimits(exposures: AssetExposure[]): Promise<number> {
        let totalRisk = 0;
        let count = 0;
        
        for (const exposure of exposures) {
            const hasLimits = exposure.has_withdrawal_limits || false;
            const dailyLimit = exposure.daily_withdrawal_limit || Infinity;
            const value = exposure.value || 0;
            
            let risk = 0;
            if (hasLimits) risk += 0.3;
            if (value > dailyLimit) risk += 0.5;
            
            totalRisk += Math.min(risk, 1.0);
            count++;
        }
        
        return count > 0 ? totalRisk / count : 0.3;
    }

    private async analyzeRegulatoryCompliance(exposures: AssetExposure[]): Promise<number> {
        let totalRisk = 0;
        let count = 0;
        
        for (const exposure of exposures) {
            const isCompliant = exposure.is_compliant || false;
            const jurisdiction = exposure.jurisdiction || 'unknown';
            const isRegulated = exposure.is_regulated || false;
            
            let risk = 0;
            if (!isCompliant) risk += 0.5;
            if (jurisdiction === 'unknown') risk += 0.3;
            if (!isRegulated) risk += 0.2;
            
            totalRisk += Math.min(risk, 1.0);
            count++;
        }
        
        return count > 0 ? totalRisk / count : 0.5;
    }

    private async analyzeJurisdictionalExposure(exposures: AssetExposure[]): Promise<number> {
        const jurisdictions = new Set<string>();
        let highRiskCount = 0;
        
        for (const exposure of exposures) {
            const jurisdiction = exposure.jurisdiction || 'unknown';
            jurisdictions.add(jurisdiction);
            
            if (['unknown', 'offshore', 'unregulated'].includes(jurisdiction.toLowerCase())) {
                highRiskCount++;
            }
        }
        
        const diversification = jurisdictions.size / Math.max(exposures.length, 1);
        const highRiskRatio = highRiskCount / Math.max(exposures.length, 1);
        
        return Math.min((1 - diversification) * 0.5 + highRiskRatio * 0.5, 1.0);
    }

    private calculateWeightedScore(factors: RiskFactor[]): number {
        const totalWeight = factors.reduce((sum, factor) => sum + factor.weight, 0);
        return factors.reduce((score, factor) => 
            score + (factor.score * factor.weight) / totalWeight, 0);
    }

    private calculateOverallRiskScore(components: Record<string, number>): number {
        const weights = {
            marketRisk: 0.25,
            counterpartyRisk: 0.25,
            smartContractRisk: 0.2,
            liquidityRisk: 0.15,
            regulatoryRisk: 0.15
        };

        return Object.entries(components).reduce(
            (score, [key, value]) => score + value * weights[key as keyof typeof weights],
            0
        );
    }
}