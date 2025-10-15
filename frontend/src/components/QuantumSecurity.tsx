import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  BoltIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface QuantumAlgorithm {
  id: string;
  name: string;
  type: 'signature' | 'encryption' | 'key_exchange' | 'hash';
  status: 'active' | 'deprecated' | 'experimental' | 'recommended';
  quantumResistant: boolean;
  securityLevel: number;
  performance: 'fast' | 'medium' | 'slow';
  description: string;
  nistApproved: boolean;
}

interface QuantumThreat {
  id: string;
  type: 'quantum_computer' | 'algorithm_break' | 'key_compromise' | 'protocol_weakness';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timeToImpact: string;
  mitigation: string;
  affectedSystems: string[];
}

interface SecurityMetrics {
  quantumReadiness: number;
  algorithmStrength: number;
  keyRotationHealth: number;
  threatResistance: number;
  complianceScore: number;
  lastQuantumAssessment: string;
}

export default function QuantumSecurity() {
  const [algorithms, setAlgorithms] = useState<QuantumAlgorithm[]>([]);
  const [threats, setThreats] = useState<QuantumThreat[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('all');
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    // Mock quantum-resistant algorithms
    const mockAlgorithms: QuantumAlgorithm[] = [
      {
        id: '1',
        name: 'CRYSTALS-Kyber',
        type: 'key_exchange',
        status: 'active',
        quantumResistant: true,
        securityLevel: 256,
        performance: 'fast',
        description: 'NIST-standardized lattice-based key encapsulation mechanism',
        nistApproved: true,
      },
      {
        id: '2',
        name: 'CRYSTALS-Dilithium',
        type: 'signature',
        status: 'active',
        quantumResistant: true,
        securityLevel: 256,
        performance: 'medium',
        description: 'NIST-standardized lattice-based digital signature algorithm',
        nistApproved: true,
      },
      {
        id: '3',
        name: 'FALCON',
        type: 'signature',
        status: 'recommended',
        quantumResistant: true,
        securityLevel: 256,
        performance: 'fast',
        description: 'Compact lattice-based signature scheme',
        nistApproved: true,
      },
      {
        id: '4',
        name: 'SPHINCS+',
        type: 'signature',
        status: 'active',
        quantumResistant: true,
        securityLevel: 256,
        performance: 'slow',
        description: 'Hash-based signature scheme with minimal security assumptions',
        nistApproved: true,
      },
      {
        id: '5',
        name: 'RSA-2048',
        type: 'signature',
        status: 'deprecated',
        quantumResistant: false,
        securityLevel: 112,
        performance: 'medium',
        description: 'Classical RSA - vulnerable to quantum attacks',
        nistApproved: false,
      },
      {
        id: '6',
        name: 'ECDSA P-256',
        type: 'signature',
        status: 'deprecated',
        quantumResistant: false,
        securityLevel: 128,
        performance: 'fast',
        description: 'Elliptic curve signature - vulnerable to quantum attacks',
        nistApproved: false,
      },
      {
        id: '7',
        name: 'SHAKE-256',
        type: 'hash',
        status: 'active',
        quantumResistant: true,
        securityLevel: 256,
        performance: 'fast',
        description: 'Quantum-resistant hash function',
        nistApproved: true,
      },
    ];

    const mockThreats: QuantumThreat[] = [
      {
        id: '1',
        type: 'quantum_computer',
        severity: 'high',
        title: 'Large-Scale Quantum Computer Development',
        description: 'Major tech companies are advancing quantum computing capabilities that could break current cryptographic systems',
        timeToImpact: '5-10 years',
        mitigation: 'Migrate to quantum-resistant algorithms immediately',
        affectedSystems: ['RSA', 'ECDSA', 'DH Key Exchange'],
      },
      {
        id: '2',
        type: 'algorithm_break',
        severity: 'medium',
        title: 'Cryptanalytic Advances',
        description: 'New mathematical techniques could reduce the security of current post-quantum algorithms',
        timeToImpact: '2-5 years',
        mitigation: 'Implement hybrid classical/post-quantum systems',
        affectedSystems: ['Some Lattice-based schemes'],
      },
      {
        id: '3',
        type: 'key_compromise',
        severity: 'critical',
        title: 'Legacy Key Exposure Risk',
        description: 'Previously encrypted data could be decrypted once quantum computers become available',
        timeToImpact: 'Immediate',
        mitigation: 'Re-encrypt sensitive data with quantum-resistant algorithms',
        affectedSystems: ['All classical encryption'],
      },
      {
        id: '4',
        type: 'protocol_weakness',
        severity: 'medium',
        title: 'Implementation Vulnerabilities',
        description: 'Side-channel attacks and implementation flaws in post-quantum algorithms',
        timeToImpact: '1-3 years',
        mitigation: 'Regular security audits and constant-time implementations',
        affectedSystems: ['All cryptographic implementations'],
      },
    ];

    const mockMetrics: SecurityMetrics = {
      quantumReadiness: 87,
      algorithmStrength: 94,
      keyRotationHealth: 91,
      threatResistance: 89,
      complianceScore: 96,
      lastQuantumAssessment: '2024-01-15T10:00:00Z',
    };

    setAlgorithms(mockAlgorithms);
    setThreats(mockThreats);
    setMetrics(mockMetrics);
  }, []);

  const upgradeToQuantumResistant = async () => {
    setIsUpgrading(true);
    
    // Simulate quantum upgrade process
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update algorithms to quantum-resistant versions
    setAlgorithms(prev => prev.map(alg => ({
      ...alg,
      status: alg.quantumResistant ? 'active' : 'deprecated'
    })));
    
    setIsUpgrading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'recommended': return 'cyan';
      case 'experimental': return 'yellow';
      case 'deprecated': return 'red';
      default: return 'gray';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'fast': return 'green';
      case 'medium': return 'yellow';
      case 'slow': return 'red';
      default: return 'gray';
    }
  };

  const algorithmTypes = ['all', 'signature', 'encryption', 'key_exchange', 'hash'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <CyberpunkCard glowColor="purple" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CpuChipIcon className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Quantum-Resistant Security</h3>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              {algorithmTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Algorithms' : type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={upgradeToQuantumResistant}
              disabled={isUpgrading}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {isUpgrading ? (
                <>
                  <BoltIcon className="w-4 h-4 animate-pulse" />
                  Upgrading...
                </>
              ) : (
                <>
                  <BoltIcon className="w-4 h-4" />
                  Quantum Upgrade
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">{metrics.quantumReadiness}%</div>
              <div className="text-gray-400 text-xs">QUANTUM READY</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-cyan-400">{metrics.algorithmStrength}%</div>
              <div className="text-gray-400 text-xs">ALGORITHM STRENGTH</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{metrics.keyRotationHealth}%</div>
              <div className="text-gray-400 text-xs">KEY ROTATION</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-orange-400">{metrics.threatResistance}%</div>
              <div className="text-gray-400 text-xs">THREAT RESISTANCE</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{metrics.complianceScore}%</div>
              <div className="text-gray-400 text-xs">COMPLIANCE</div>
            </div>
          </div>
        )}
      </CyberpunkCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cryptographic Algorithms */}
        <CyberpunkCard glowColor="cyan" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <KeyIcon className="w-6 h-6 text-cyan-400" />
            <h4 className="text-lg font-bold text-white">Cryptographic Algorithms</h4>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {algorithms
              .filter(alg => selectedAlgorithm === 'all' || alg.type === selectedAlgorithm)
              .map((algorithm, index) => (
                <motion.div
                  key={algorithm.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 border-${getStatusColor(algorithm.status)}-500 bg-gray-800/30 rounded-r-lg p-4 hover:bg-gray-800/50 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-${getStatusColor(algorithm.status)}-400 text-xs font-mono uppercase px-2 py-1 bg-${getStatusColor(algorithm.status)}-500/10 rounded`}>
                        {algorithm.status}
                      </span>
                      {algorithm.quantumResistant && (
                        <ShieldCheckIcon className="w-4 h-4 text-purple-400" title="Quantum Resistant" />
                      )}
                      {algorithm.nistApproved && (
                        <CheckCircleIcon className="w-4 h-4 text-green-400" title="NIST Approved" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded bg-${getPerformanceColor(algorithm.performance)}-500/20 text-${getPerformanceColor(algorithm.performance)}-400`}>
                        {algorithm.performance.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <h5 className="text-white font-semibold mb-1">{algorithm.name}</h5>
                  <p className="text-gray-400 text-sm mb-2">{algorithm.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <div className="text-gray-500">
                        Type: <span className="text-white">{algorithm.type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-gray-500">
                        Security: <span className="text-cyan-400">{algorithm.securityLevel}-bit</span>
                      </div>
                    </div>
                    {!algorithm.quantumResistant && (
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-400 animate-pulse" title="Quantum Vulnerable" />
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </CyberpunkCard>

        {/* Quantum Threats */}
        <CyberpunkCard glowColor="red" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-400" />
            <h4 className="text-lg font-bold text-white">Quantum Threat Assessment</h4>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {threats.map((threat, index) => (
              <motion.div
                key={threat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-l-4 border-${getSeverityColor(threat.severity)}-500 bg-gray-800/30 rounded-r-lg p-4 hover:bg-gray-800/50 transition-colors`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-${getSeverityColor(threat.severity)}-400 text-xs font-mono uppercase px-2 py-1 bg-${getSeverityColor(threat.severity)}-500/10 rounded`}>
                    {threat.severity}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3" />
                    <span>{threat.timeToImpact}</span>
                  </div>
                </div>
                
                <h5 className="text-white font-semibold mb-2">{threat.title}</h5>
                <p className="text-gray-400 text-sm mb-3">{threat.description}</p>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 mb-2">
                  <div className="text-blue-400 text-xs font-semibold mb-1">Mitigation Strategy</div>
                  <p className="text-gray-300 text-xs">{threat.mitigation}</p>
                </div>
                
                <div className="text-xs text-gray-500">
                  Affected: {threat.affectedSystems.join(', ')}
                </div>
              </motion.div>
            ))}
          </div>
        </CyberpunkCard>
      </div>

      {/* Quantum Readiness Assessment */}
      <CyberpunkCard glowColor="green" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <LockClosedIcon className="w-6 h-6 text-green-400" />
          <h4 className="text-lg font-bold text-white">Quantum Readiness Assessment</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheckIcon className="w-8 h-8 text-green-400" />
              <div>
                <h5 className="text-white font-semibold">Algorithm Migration</h5>
                <p className="text-gray-400 text-sm">Post-quantum algorithm adoption</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
            <div className="text-right text-xs text-green-400 mt-1">87% Complete</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <KeyIcon className="w-8 h-8 text-cyan-400" />
              <div>
                <h5 className="text-white font-semibold">Key Management</h5>
                <p className="text-gray-400 text-sm">Quantum-safe key lifecycle</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '91%' }}></div>
            </div>
            <div className="text-right text-xs text-cyan-400 mt-1">91% Secure</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <CpuChipIcon className="w-8 h-8 text-purple-400" />
              <div>
                <h5 className="text-white font-semibold">Implementation</h5>
                <p className="text-gray-400 text-sm">Side-channel resistance</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
            <div className="text-right text-xs text-purple-400 mt-1">94% Hardened</div>
          </div>
        </div>

        <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BoltIcon className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Quantum Advantage Timeline</span>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Current estimates suggest cryptographically relevant quantum computers may emerge within 5-10 years. 
            VaultGuard is already implementing NIST-approved post-quantum algorithms to ensure your assets remain secure.
          </p>
          <div className="flex gap-2">
            <button className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <CogIcon className="w-4 h-4 inline mr-2" />
              Configure Quantum Settings
            </button>
            <button className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              Generate Quantum Report
            </button>
          </div>
        </div>
      </CyberpunkCard>
    </div>
  );
}