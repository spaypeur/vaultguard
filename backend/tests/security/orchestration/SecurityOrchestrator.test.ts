import { SecurityOrchestrator } from '../../../src/security/orchestration/SecurityOrchestrator';
import {
  SecurityEvent,
  SecurityEventType,
  DefensePolicy,
  DefenseActionType,
  ConditionOperator,
} from '../../../src/security/orchestration/types';
import { ThreatSeverity } from '../../../src/security/predictive/types';

describe('SecurityOrchestrator', () => {
  let orchestrator: SecurityOrchestrator;

  beforeEach(async () => {
    orchestrator = SecurityOrchestrator.getInstance();
    await orchestrator.initialize();
  });

  describe('Policy Management', () => {
    const testPolicy: DefensePolicy = {
      id: 'test-policy-1',
      name: 'Test Policy',
      description: 'Test defense policy',
      conditions: [
        {
          field: 'type',
          operator: ConditionOperator.EQUALS,
          value: SecurityEventType.THREAT_DETECTED,
        },
        {
          field: 'severity',
          operator: ConditionOperator.EQUALS,
          value: ThreatSeverity.HIGH,
        },
      ],
      actions: [
        {
          type: DefenseActionType.BLOCK_IP,
          parameters: { ip: '192.168.1.1' },
        },
      ],
      priority: 1,
      enabled: true,
    };

    it('should add and validate policies', async () => {
      await orchestrator.addPolicy(testPolicy);
      const matrix = await orchestrator.getDefenseMatrix();
      
      expect(matrix.activePolicies).toHaveLength(1);
      expect(matrix.activePolicies[0].id).toBe(testPolicy.id);
    });

    it('should reject invalid policies', async () => {
      const invalidPolicy: DefensePolicy = { ...testPolicy, actions: [] };
      await expect(orchestrator.addPolicy(invalidPolicy)).rejects.toThrow();
    });
  });

  describe('Event Processing', () => {
    const testEvent: SecurityEvent = {
      id: 'test-event-1',
      type: SecurityEventType.THREAT_DETECTED,
      severity: ThreatSeverity.HIGH,
      timestamp: new Date(),
      source: 'test',
      data: { ip: '192.168.1.1' },
    };

    it('should process security events', async () => {
      await orchestrator.processEvent(testEvent);
      const matrix = await orchestrator.getDefenseMatrix();
      
      expect(matrix.activeThreats.has(testEvent.id)).toBe(true);
    });

    it('should trigger appropriate defense actions', async () => {
      const policy: DefensePolicy = {
        id: 'test-policy-2',
        name: 'Test Response Policy',
        description: 'Policy for test events',
        conditions: [
          {
            field: 'type',
            operator: ConditionOperator.EQUALS,
            value: SecurityEventType.THREAT_DETECTED,
          },
        ],
        actions: [
          {
            type: DefenseActionType.BLOCK_IP,
            parameters: { ip: '192.168.1.1' },
          },
        ],
        priority: 1,
        enabled: true,
      };

      await orchestrator.addPolicy(policy);
      await orchestrator.processEvent(testEvent);

      const matrix = await orchestrator.getDefenseMatrix();
      expect(matrix.pendingActions.length).toBeGreaterThan(0);
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should track orchestration metrics', async () => {
      const testEvent: SecurityEvent = {
        id: 'test-event-2',
        type: SecurityEventType.SUSPICIOUS_TRANSACTION,
        severity: ThreatSeverity.MEDIUM,
        timestamp: new Date(),
        source: 'test',
        data: { transaction: 'tx123' },
      };

      await orchestrator.processEvent(testEvent);
      const metrics = orchestrator.getMetrics();

      expect(metrics.totalEvents).toBeGreaterThan(0);
      expect(metrics.activeThreats).toBeGreaterThanOrEqual(0);
      expect(metrics.pendingActions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Defense Matrix', () => {
    it('should maintain an accurate defense matrix', async () => {
      const policy: DefensePolicy = {
        id: 'test-policy-3',
        name: 'Matrix Test Policy',
        description: 'Test defense matrix updates',
        conditions: [
          {
            field: 'severity',
            operator: ConditionOperator.GREATER_THAN,
            value: ThreatSeverity.MEDIUM,
          },
        ],
        actions: [
          {
            type: DefenseActionType.NOTIFY_ADMIN,
            parameters: { message: 'High severity threat detected' },
          },
        ],
        priority: 2,
        enabled: true,
      };

      await orchestrator.addPolicy(policy);
      
      const event: SecurityEvent = {
        id: 'test-event-3',
        type: SecurityEventType.SYSTEM_ERROR,
        severity: ThreatSeverity.CRITICAL,
        timestamp: new Date(),
        source: 'test',
        data: { error: 'Critical system failure' },
      };

      await orchestrator.processEvent(event);
      const matrix = await orchestrator.getDefenseMatrix();

      expect(matrix.activePolicies).toHaveLength(1);
      expect(matrix.activeThreats.size).toBeGreaterThan(0);
      expect(matrix.pendingActions.length).toBeGreaterThan(0);
    });
  });
});