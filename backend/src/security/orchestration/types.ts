import { ThreatIndicator, ThreatType, ThreatSeverity } from '../predictive/types';
import { BlockData, TransactionData } from '../../monitoring/cross-chain/types';
import { ComplianceProof } from '../zk-compliance/types';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: ThreatSeverity;
  timestamp: Date;
  source: string;
  data: any;
  context?: Record<string, any>;
}

export interface DefenseAction {
  id: string;
  type: DefenseActionType;
  priority: number;
  target: string;
  parameters: Record<string, any>;
  status: ActionStatus;
  timestamp: Date;
  result?: ActionResult;
}

export interface DefensePolicy {
  id: string;
  name: string;
  description: string;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  priority: number;
  enabled: boolean;
}

export interface PolicyCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  threshold?: number;
  timeWindow?: number;
}

export interface PolicyAction {
  type: DefenseActionType;
  parameters: Record<string, any>;
  delay?: number;
  retryCount?: number;
  fallback?: PolicyAction;
}

export interface ActionResult {
  success: boolean;
  timestamp: Date;
  message?: string;
  data?: any;
}

export interface DefenseMatrix {
  activeThreats: Map<string, ThreatIndicator>;
  activePolicies: DefensePolicy[];
  pendingActions: DefenseAction[];
  completedActions: DefenseAction[];
}

export interface OrchestrationMetrics {
  totalEvents: number;
  activeThreats: number;
  mitigatedThreats: number;
  pendingActions: number;
  avgResponseTime: number;
  successRate: number;
}

export enum SecurityEventType {
  THREAT_DETECTED = 'THREAT_DETECTED',
  ANOMALY_DETECTED = 'ANOMALY_DETECTED',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  COMPLIANCE_ISSUE = 'COMPLIANCE_ISSUE',
  AUTHENTICATION_FAILURE = 'AUTHENTICATION_FAILURE',
  SUSPICIOUS_TRANSACTION = 'SUSPICIOUS_TRANSACTION',
}

export enum DefenseActionType {
  BLOCK_IP = 'BLOCK_IP',
  SUSPEND_ACCOUNT = 'SUSPEND_ACCOUNT',
  INCREASE_MONITORING = 'INCREASE_MONITORING',
  THROTTLE_REQUESTS = 'THROTTLE_REQUESTS',
  ENABLE_2FA = 'ENABLE_2FA',
  FREEZE_ASSETS = 'FREEZE_ASSETS',
  NOTIFY_ADMIN = 'NOTIFY_ADMIN',
  ESCALATE_INCIDENT = 'ESCALATE_INCIDENT',
}

export enum ActionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  REGEX_MATCH = 'REGEX_MATCH',
}