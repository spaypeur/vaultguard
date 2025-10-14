import { ComplianceCircuit, ComplianceConstraint, ComplianceOperation } from './types';
import { writeFileSync } from 'fs';
import { join } from 'path';

export class CircuitGenerator {
  private static instance: CircuitGenerator;
  private circuitCache: Map<string, string>;

  private constructor() {
    this.circuitCache = new Map();
  }

  public static getInstance(): CircuitGenerator {
    if (!CircuitGenerator.instance) {
      CircuitGenerator.instance = new CircuitGenerator();
    }
    return CircuitGenerator.instance;
  }

  /**
   * Generate a circom circuit for a compliance rule
   * @param circuit Compliance circuit definition
   * @returns Circuit source code
   */
  public generateCircuit(circuit: ComplianceCircuit): string {
    if (this.circuitCache.has(circuit.id)) {
      return this.circuitCache.get(circuit.id)!;
    }

    let circuitCode = this.generateCircuitHeader(circuit);
    circuitCode += this.generateSignals(circuit);
    circuitCode += this.generateConstraints(circuit);
    circuitCode += this.generateCircuitFooter();

    this.circuitCache.set(circuit.id, circuitCode);
    return circuitCode;
  }

  /**
   * Save the generated circuit to a file
   * @param circuit Compliance circuit definition
   * @param outputPath Output directory path
   * @returns Path to the generated circuit file
   */
  public saveCircuit(circuit: ComplianceCircuit, outputPath: string): string {
    const circuitCode = this.generateCircuit(circuit);
    const filePath = join(outputPath, `${circuit.id}.circom`);
    writeFileSync(filePath, circuitCode);
    return filePath;
  }

  private generateCircuitHeader(circuit: ComplianceCircuit): string {
    return `pragma circom 2.1.4;

// ${circuit.description}
template ${this.normalizeCircuitName(circuit.name)}() {
    // Public inputs
    signal input timestamp;
    signal input requester;
    
    // Private inputs
`;
  }

  private generateSignals(circuit: ComplianceCircuit): string {
    let signals = '';
    const uniqueFields = new Set(circuit.constraints.map(c => c.field));

    for (const field of uniqueFields) {
      signals += `    signal private input ${this.normalizeFieldName(field)};\n`;
    }

    signals += '\n    // Intermediate signals\n';
    for (const constraint of circuit.constraints) {
      signals += this.generateConstraintSignals(constraint);
    }

    return signals;
  }

  private generateConstraints(circuit: ComplianceCircuit): string {
    let constraints = '\n    // Constraints\n';
    for (const constraint of circuit.constraints) {
      constraints += this.generateConstraintLogic(constraint);
    }
    return constraints;
  }

  private generateConstraintSignals(constraint: ComplianceConstraint): string {
    const fieldName = this.normalizeFieldName(constraint.field);
    
    switch (constraint.operation) {
      case ComplianceOperation.IN_RANGE:
        return `    signal ${fieldName}_in_range;\n`;
      case ComplianceOperation.IN_SET:
      case ComplianceOperation.NOT_IN_SET:
        return `    signal ${fieldName}_in_set;\n`;
      default:
        return `    signal ${fieldName}_valid;\n`;
    }
  }

  private generateConstraintLogic(constraint: ComplianceConstraint): string {
    const fieldName = this.normalizeFieldName(constraint.field);
    
    switch (constraint.operation) {
      case ComplianceOperation.EQUAL:
        return `    ${fieldName}_valid <== IsEqual()([${fieldName}, ${constraint.value}]);\n`;
      
      case ComplianceOperation.GREATER_THAN:
        return `    ${fieldName}_valid <== GreaterThan(32)([${fieldName}, ${constraint.value}]);\n`;
      
      case ComplianceOperation.LESS_THAN:
        return `    ${fieldName}_valid <== LessThan(32)([${fieldName}, ${constraint.value}]);\n`;
      
      case ComplianceOperation.IN_RANGE:
        const { min, max } = constraint.value;
        return `
    // Check if ${fieldName} is in range [${min}, ${max}]
    signal ${fieldName}_gte_min <== GreaterEqThan(32)([${fieldName}, ${min}]);
    signal ${fieldName}_lte_max <== LessEqThan(32)([${fieldName}, ${max}]);
    ${fieldName}_in_range <== AND()([${fieldName}_gte_min, ${fieldName}_lte_max]);\n`;
      
      case ComplianceOperation.IN_SET:
        const setValues = constraint.value.join(', ');
        return `
    // Check if ${fieldName} is in set {${setValues}}
    signal ${fieldName}_matches[${constraint.value.length}];
    for (var i = 0; i < ${constraint.value.length}; i++) {
        ${fieldName}_matches[i] <== IsEqual()([${fieldName}, ${constraint.value[i]}]);
    }
    ${fieldName}_in_set <== OR(${constraint.value.length})(${fieldName}_matches);\n`;
      
      default:
        return '';
    }
  }

  private generateCircuitFooter(): string {
    return `
    // Final compliance check
    signal output compliant;
    compliant <== AND(N)([all_constraint_signals]);
}

component main = ComplianceCircuit();`;
  }

  private normalizeCircuitName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^[0-9]/, '_$&');
  }

  private normalizeFieldName(field: string): string {
    return field
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^[0-9]/, '_$&');
  }
}