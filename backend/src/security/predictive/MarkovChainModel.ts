import { ThreatIndicator, ThreatType, ThreatPattern } from './types';

export class MarkovChainModel {
  private transitionMatrix: Map<string, Map<string, number>>;
  private stateOccurrences: Map<string, number>;
  private totalObservations: number;

  constructor() {
    this.transitionMatrix = new Map();
    this.stateOccurrences = new Map();
    this.totalObservations = 0;
  }

  /**
   * Train the Markov Chain model with a sequence of threat indicators
   * @param sequence Array of threat indicators
   */
  public train(sequence: ThreatIndicator[]): void {
    if (sequence.length < 2) return;

    for (let i = 0; i < sequence.length - 1; i++) {
      const currentState = this.getStateKey(sequence[i]);
      const nextState = this.getStateKey(sequence[i + 1]);

      // Update state occurrences
      this.stateOccurrences.set(
        currentState,
        (this.stateOccurrences.get(currentState) || 0) + 1
      );

      // Update transition matrix
      if (!this.transitionMatrix.has(currentState)) {
        this.transitionMatrix.set(currentState, new Map());
      }

      const stateTransitions = this.transitionMatrix.get(currentState)!;
      stateTransitions.set(
        nextState,
        (stateTransitions.get(nextState) || 0) + 1
      );

      this.totalObservations++;
    }

    // Update last state occurrence
    const lastState = this.getStateKey(sequence[sequence.length - 1]);
    this.stateOccurrences.set(
      lastState,
      (this.stateOccurrences.get(lastState) || 0) + 1
    );
  }

  /**
   * Predict the next likely threat states
   * @param currentState Current threat indicator
   * @param numPredictions Number of predictions to return
   * @returns Array of predicted next states with probabilities
   */
  public predict(
    currentState: ThreatIndicator,
    numPredictions: number = 3
  ): Array<{ nextState: string; probability: number }> {
    console.log('DEBUG: MarkovChainModel.predict called with currentState:', currentState);
    const stateKey = this.getStateKey(currentState);
    console.log('DEBUG: Generated stateKey:', stateKey);
    const transitions = this.transitionMatrix.get(stateKey);
    console.log('DEBUG: Transitions for stateKey:', transitions);

    if (!transitions) {
      console.log('DEBUG: No transitions found for stateKey, returning empty array');
      return [];
    }

    const predictions = Array.from(transitions.entries())
      .map(([nextState, count]) => ({
        nextState,
        probability: count / (this.stateOccurrences.get(stateKey) || 1),
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, numPredictions);

    return predictions;
  }

  /**
   * Identify threat patterns in the training data
   * @param minSupport Minimum support threshold for pattern recognition
   * @param maxPatternLength Maximum length of patterns to consider
   * @returns Array of identified threat patterns
   */
  public identifyPatterns(
    minSupport: number = 0.1,
    maxPatternLength: number = 5
  ): ThreatPattern[] {
    const patterns: ThreatPattern[] = [];
    const minCount = Math.ceil(minSupport * this.totalObservations);

    for (const [startState, transitions] of this.transitionMatrix.entries()) {
      for (const [endState, count] of transitions.entries()) {
        if (count >= minCount) {
          patterns.push({
            sequence: [
              this.parseStateKey(startState),
              this.parseStateKey(endState),
            ],
            frequency: count,
            probability: count / (this.stateOccurrences.get(startState) || 1),
            timeWindow: 3600000, // 1 hour in milliseconds
          });
        }
      }
    }

    return patterns.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Get the probability of transitioning from one state to another
   * @param fromState Starting state
   * @param toState Target state
   * @returns Transition probability
   */
  public getTransitionProbability(
    fromState: ThreatIndicator,
    toState: ThreatIndicator
  ): number {
    const fromKey = this.getStateKey(fromState);
    const toKey = this.getStateKey(toState);

    const transitions = this.transitionMatrix.get(fromKey);
    if (!transitions) return 0;

    const transitionCount = transitions.get(toKey) || 0;
    const totalFromState = this.stateOccurrences.get(fromKey) || 1;

    return transitionCount / totalFromState;
  }

  /**
   * Clear the model's training data
   */
  public reset(): void {
    this.transitionMatrix.clear();
    this.stateOccurrences.clear();
    this.totalObservations = 0;
  }

  private getStateKey(indicator: ThreatIndicator): string {
    return `${indicator.type}|${indicator.severity}|${indicator.source}`;
  }

  private parseStateKey(key: string): ThreatIndicator {
    console.log('DEBUG: parseStateKey called with key:', key);
    console.log('DEBUG: typeof crypto:', typeof crypto);
    console.log('DEBUG: crypto.randomUUID available:', typeof crypto?.randomUUID);
    const [type, severity, source] = key.split('|');
    return {
      id: crypto.randomUUID(),
      type: type as ThreatType,
      severity: severity as any,
      confidence: 1.0,
      timestamp: new Date(),
      source,
      metadata: {},
    };
  }
}