import { PredictiveSecurity } from '../../../src/security/predictive/PredictiveSecurity';
import { ThreatIndicator, ThreatType, ThreatSeverity } from '../../../src/security/predictive/types';

describe('PredictiveSecurity', () => {
  let predictiveSecurity: PredictiveSecurity;

  beforeEach(async () => {
    predictiveSecurity = PredictiveSecurity.getInstance();
    await predictiveSecurity.reset();
  });

  describe('Threat Processing and Prediction', () => {
    it('should process new threats and generate predictions', async () => {
      const threats: ThreatIndicator[] = [
        {
          id: '1',
          type: ThreatType.DDOS,
          severity: ThreatSeverity.HIGH,
          confidence: 0.9,
          timestamp: new Date(),
          source: 'firewall',
          metadata: {},
        },
        {
          id: '2',
          type: ThreatType.ACCOUNT_TAKEOVER,
          severity: ThreatSeverity.CRITICAL,
          confidence: 0.95,
          timestamp: new Date(),
          source: 'auth-service',
          metadata: {},
        },
      ];

      // Process threats sequentially
      for (const threat of threats) {
        await predictiveSecurity.processNewThreat(threat);
      }

      const prediction = await predictiveSecurity.preemptAttacks();
      
      expect(prediction).toBeDefined();
      expect(prediction.predictedThreats.length).toBeGreaterThan(0);
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.timeFrame.start).toBeDefined();
      expect(prediction.timeFrame.end).toBeDefined();
    });

    it('should generate appropriate preventive measures', async () => {
      const ddosAttack: ThreatIndicator = {
        id: '1',
        type: ThreatType.DDOS,
        severity: ThreatSeverity.CRITICAL,
        confidence: 0.95,
        timestamp: new Date(),
        source: 'firewall',
        metadata: {},
      };

      await predictiveSecurity.processNewThreat(ddosAttack);
      const prediction = await predictiveSecurity.preemptAttacks();

      const ddosPrediction = prediction.predictedThreats.find(
        (threat) => threat.threatType === ThreatType.DDOS
      );

      if (ddosPrediction) {
        expect(ddosPrediction.preventiveMeasures.length).toBeGreaterThan(0);
        expect(ddosPrediction.preventiveMeasures[0].action).toBeDefined();
        expect(ddosPrediction.preventiveMeasures[0].priority).toBeGreaterThan(0);
      }
    });
  });

  describe('Pattern Recognition', () => {
    it('should identify threat patterns', async () => {
      const threats: ThreatIndicator[] = Array(10)
        .fill(null)
        .map((_, index) => ({
          id: index.toString(),
          type: index % 2 === 0 ? ThreatType.DDOS : ThreatType.ACCOUNT_TAKEOVER,
          severity: ThreatSeverity.HIGH,
          confidence: 0.9,
          timestamp: new Date(),
          source: 'test',
          metadata: {},
        }));

      for (const threat of threats) {
        await predictiveSecurity.processNewThreat(threat);
      }

      const patterns = await predictiveSecurity.getCurrentPatterns();
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].probability).toBeGreaterThan(0);
    });
  });
});