import {
  ThreatIndicator,
  ThreatPrediction,
  PredictionResult,
  PreventiveMeasure,
  ThreatType,
  ThreatSeverity,
} from './types';
import { MarkovChainModel } from './MarkovChainModel';

export class PredictiveSecurity {
  private static instance: PredictiveSecurity;
  private markovModel: MarkovChainModel;
  private recentThreats: ThreatIndicator[] = [];
  private readonly MAX_HISTORY = 1000;
  private readonly PREDICTION_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private constructor() {
    this.markovModel = new MarkovChainModel();
  }

  public static getInstance(): PredictiveSecurity {
    if (!PredictiveSecurity.instance) {
      PredictiveSecurity.instance = new PredictiveSecurity();
    }
    return PredictiveSecurity.instance;
  }

  /**
   * Process a new threat indicator and update predictions
   * @param threat New threat indicator
   */
  public async processNewThreat(threat: ThreatIndicator): Promise<void> {
    this.recentThreats.push(threat);
    if (this.recentThreats.length > this.MAX_HISTORY) {
      this.recentThreats.shift();
    }

    // Retrain model with updated data
    this.markovModel.train(this.recentThreats);
  }

  /**
   * Predict potential future threats based on current patterns
   * @returns Prediction result with confidence scores
   */
  public async preemptAttacks(): Promise<PredictionResult> {
    if (this.recentThreats.length === 0) {
      return this.emptyPredictionResult();
    }

    const currentState = this.recentThreats[this.recentThreats.length - 1];
    const predictions = this.markovModel.predict(currentState, 5);
    const patterns = this.markovModel.identifyPatterns(0.1, 5);

    const predictedThreats: ThreatPrediction[] = predictions.map(
      (pred, index) => {
        const baseTime = new Date();
        baseTime.setTime(baseTime.getTime() + (index + 1) * 3600000); // Add hours

        return {
          threatType: pred.nextState.split('|')[0] as ThreatType,
          probability: pred.probability,
          estimatedTime: baseTime,
          potentialImpact: this.assessImpact(pred.probability),
          preventiveMeasures: this.generatePreventiveMeasures(
            pred.nextState.split('|')[0] as ThreatType,
            pred.probability
          ),
        };
      }
    );

    return {
      predictedThreats,
      confidence: this.calculateOverallConfidence(predictedThreats),
      timeFrame: {
        start: new Date(),
        end: new Date(Date.now() + this.PREDICTION_WINDOW),
      },
    };
  }

  /**
   * Reset the prediction model and clear historical data
   */
  public async reset(): Promise<void> {
    this.recentThreats = [];
    this.markovModel.reset();
  }

  /**
   * Get the current state of threat patterns
   * @returns Array of identified threat patterns
   */
  public async getCurrentPatterns() {
    return this.markovModel.identifyPatterns();
  }

  private assessImpact(probability: number): ThreatSeverity {
    if (probability >= 0.8) return ThreatSeverity.CRITICAL;
    if (probability >= 0.6) return ThreatSeverity.HIGH;
    if (probability >= 0.4) return ThreatSeverity.MEDIUM;
    if (probability >= 0.2) return ThreatSeverity.LOW;
    return ThreatSeverity.INFO;
  }

  private generatePreventiveMeasures(
    threatType: ThreatType,
    probability: number
  ): PreventiveMeasure[] {
    const measures: PreventiveMeasure[] = [];
    const basePriority = Math.ceil(probability * 10);

    switch (threatType) {
      case ThreatType.DDOS:
        measures.push(
          {
            id: crypto.randomUUID(),
            action: 'Scale infrastructure capacity',
            priority: basePriority,
            effectiveness: 0.85,
            resourceCost: 8,
          },
          {
            id: crypto.randomUUID(),
            action: 'Enable additional DDoS mitigation rules',
            priority: basePriority - 1,
            effectiveness: 0.9,
            resourceCost: 5,
          }
        );
        break;
      case ThreatType.ACCOUNT_TAKEOVER:
        measures.push(
          {
            id: crypto.randomUUID(),
            action: 'Enforce additional authentication factors',
            priority: basePriority,
            effectiveness: 0.95,
            resourceCost: 3,
          },
          {
            id: crypto.randomUUID(),
            action: 'Review and limit access permissions',
            priority: basePriority - 2,
            effectiveness: 0.8,
            resourceCost: 4,
          }
        );
        break;
      // Add more cases for other threat types
    }

    return measures;
  }

  private calculateOverallConfidence(predictions: ThreatPrediction[]): number {
    if (predictions.length === 0) return 0;
    
    const weightedSum = predictions.reduce(
      (sum, pred, index) => sum + pred.probability * (1 / (index + 1)),
      0
    );
    
    return weightedSum / predictions.length;
  }

  private emptyPredictionResult(): PredictionResult {
    return {
      predictedThreats: [],
      confidence: 0,
      timeFrame: {
        start: new Date(),
        end: new Date(Date.now() + this.PREDICTION_WINDOW),
      },
    };
  }
}