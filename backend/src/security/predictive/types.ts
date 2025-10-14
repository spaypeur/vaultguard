export interface ThreatIndicator {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  confidence: number;
  timestamp: Date;
  source: string;
  metadata: Record<string, any>;
}

export interface ThreatPattern {
  sequence: ThreatIndicator[];
  frequency: number;
  probability: number;
  timeWindow: number; // in milliseconds
}

export interface PredictionResult {
  predictedThreats: ThreatPrediction[];
  confidence: number;
  timeFrame: {
    start: Date;
    end: Date;
  };
}

export interface ThreatPrediction {
  threatType: ThreatType;
  probability: number;
  estimatedTime: Date;
  potentialImpact: ThreatSeverity;
  preventiveMeasures: PreventiveMeasure[];
}

export interface PreventiveMeasure {
  id: string;
  action: string;
  priority: number;
  effectiveness: number;
  resourceCost: number;
}

export enum ThreatType {
  DDOS = 'DDOS',
  ACCOUNT_TAKEOVER = 'ACCOUNT_TAKEOVER',
  FRAUD = 'FRAUD',
  MALWARE = 'MALWARE',
  API_ABUSE = 'API_ABUSE',
  INSIDER_THREAT = 'INSIDER_THREAT',
  ZERO_DAY = 'ZERO_DAY',
  RANSOMWARE = 'RANSOMWARE'
}

export enum ThreatSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}