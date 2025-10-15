import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeSlashIcon,
  DocumentCheckIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface ZKProof {
  id: string;
  type: 'identity' | 'transaction' | 'balance' | 'compliance' | 'audit';
  description: string;
  status: 'generating' | 'verified' | 'failed' | 'expired';
  jurisdiction: string;
  createdAt: string;
  expiresAt: string;
  verificationHash: string;
  privacyLevel: 'standard' | 'enhanced' | 'maximum';
}

interface ComplianceRequirement {
  id: string;
  jurisdiction: string;
  regulation: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  zkProofRequired: boolean;
  lastChecked: string;
  nextDeadline?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface PrivacyMetrics {
  totalProofs: number;
  activeProofs: number;
  privacyScore: number;
  complianceScore: number;
  jurisdictionsCovered: number;
  dataMinimization: number;
}

export default function ZKCompliance() {
  const [zkProofs, setZkProofs] = useState<ZKProof[]>([]);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [metrics, setMetrics] = useState<PrivacyMetrics | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);

  useEffect(() => {
    // Mock ZK proofs data
    const mockProofs: ZKProof[] = [
      {
        id: '1',
        type: 'identity',
        description: 'KYC Identity Verification (EU GDPR Compliant)',
        status: 'verified',
        jurisdiction: 'EU',
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-07-15T10:00:00Z',
        verificationHash: '0x742d35cc6bf4c4c8f3a9b8f2e1d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
        privacyLevel: 'maximum',
      },
      {
        id: '2',
        type: 'balance',
        description: 'Asset Holdings Proof (US FinCEN Compliant)',
        status: 'verified',
        jurisdiction: 'US',
        createdAt: '2024-01-14T15:30:00Z',
        expiresAt: '2024-04-14T15:30:00Z',
        verificationHash: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
        privacyLevel: 'enhanced',
      },
      {
        id: '3',
        type: 'transaction',
        description: 'Transaction History Compliance (Singapore MAS)',
        status: 'generating',
        jurisdiction: 'SG',
        createdAt: '2024-01-15T12:00:00Z',
        expiresAt: '2024-06-15T12:00:00Z',
        verificationHash: '0x...',
        privacyLevel: 'standard',
      },
      {
        id: '4',
        type: 'audit',
        description: 'Quarterly Audit Trail (Swiss FINMA)',
        status: 'verified',
        jurisdiction: 'CH',
        createdAt: '2024-01-10T09:00:00Z',
        expiresAt: '2024-04-10T09:00:00Z',
        verificationHash: '0xc1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
        privacyLevel: 'maximum',
      },
    ];

    const mockRequirements: ComplianceRequirement[] = [
      {
        id: '1',
        jurisdiction: 'EU',
        regulation: 'GDPR',
        requirement: 'Data minimization and privacy by design',
        status: 'compliant',
        zkProofRequired: true,
        lastChecked: '2024-01-15T10:00:00Z',
        nextDeadline: '2024-07-15T10:00:00Z',
        riskLevel: 'low',
      },
      {
        id: '2',
        jurisdiction: 'US',
        regulation: 'FinCEN',
        requirement: 'Beneficial ownership disclosure',
        status: 'compliant',
        zkProofRequired: true,
        lastChecked: '2024-01-14T15:30:00Z',
        nextDeadline: '2024-04-14T15:30:00Z',
        riskLevel: 'medium',
      },
      {
        id: '3',
        jurisdiction: 'SG',
        regulation: 'MAS',
        requirement: 'Transaction monitoring and reporting',
        status: 'pending',
        zkProofRequired: true,
        lastChecked: '2024-01-15T12:00:00Z',
        nextDeadline: '2024-02-15T12:00:00Z',
        riskLevel: 'high',
      },
      {
        id: '4',
        jurisdiction: 'CH',
        regulation: 'FINMA',
        requirement: 'Anti-money laundering compliance',
        status: 'compliant',
        zkProofRequired: true,
        lastChecked: '2024-01-10T09:00:00Z',
        nextDeadline: '2024-04-10T09:00:00Z',
        riskLevel: 'low',
      },
      {
        id: '5',
        jurisdiction: 'UK',
        regulation: 'FCA',
        requirement: 'Market conduct and consumer protection',
        status: 'non_compliant',
        zkProofRequired: false,
        lastChecked: '2024-01-05T14:00:00Z',
        nextDeadline: '2024-01-20T14:00:00Z',
        riskLevel: 'critical',
      },
    ];

    const mockMetrics: PrivacyMetrics = {
      totalProofs: mockProofs.length,
      activeProofs: mockProofs.filter(p => p.status === 'verified').length,
      privacyScore: 94,
      complianceScore: 87,
      jurisdictionsCovered: 5,
      dataMinimization: 96,
    };

    setZkProofs(mockProofs);
    setRequirements(mockRequirements);
    setMetrics(mockMetrics);
  }, []);

  const generateZKProof = async (type: string, jurisdiction: string) => {
    setIsGeneratingProof(true);
    
    // Simulate ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newProof: ZKProof = {
      id: Date.now().toString(),
      type: type as any,
      description: `New ${type} proof for ${jurisdiction}`,
      status: 'verified',
      jurisdiction,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      verificationHash: '0x' + Math.random().toString(16).substr(2, 64),
      privacyLevel: 'enhanced',
    };
    
    setZkProofs(prev => [newProof, ...prev]);
    setIsGeneratingProof(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': case 'compliant': return 'green';
      case 'generating': case 'pending': return 'yellow';
      case 'failed': case 'non_compliant': return 'red';
      case 'expired': return 'gray';
      default: return 'gray';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'green';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getPrivacyLevelColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'purple';
      case 'enhanced': return 'cyan';
      case 'standard': return 'blue';
      default: return 'gray';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const jurisdictions = ['all', 'US', 'EU', 'UK', 'SG', 'CH', 'CA', 'AU'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <CyberpunkCard glowColor="purple" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <EyeSlashIcon className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Zero-Knowledge Compliance</h3>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              {jurisdictions.map(jurisdiction => (
                <option key={jurisdiction} value={jurisdiction}>
                  {jurisdiction === 'all' ? 'All Jurisdictions' : jurisdiction}
                </option>
              ))}
            </select>
            <button
              onClick={() => generateZKProof('compliance', selectedJurisdiction === 'all' ? 'US' : selectedJurisdiction)}
              disabled={isGeneratingProof}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {isGeneratingProof ? (
                <>
                  <CpuChipIcon className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <KeyIcon className="w-4 h-4" />
                  Generate Proof
                </>
              )}
            </button>
          </div>
        </div>

        {/* Privacy Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-400">{metrics.totalProofs}</div>
              <div className="text-gray-400 text-xs">TOTAL PROOFS</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{metrics.activeProofs}</div>
              <div className="text-gray-400 text-xs">ACTIVE</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-cyan-400">{metrics.privacyScore}%</div>
              <div className="text-gray-400 text-xs">PRIVACY SCORE</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-blue-400">{metrics.complianceScore}%</div>
              <div className="text-gray-400 text-xs">COMPLIANCE</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-orange-400">{metrics.jurisdictionsCovered}</div>
              <div className="text-gray-400 text-xs">JURISDICTIONS</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-green-400">{metrics.dataMinimization}%</div>
              <div className="text-gray-400 text-xs">DATA MIN.</div>
            </div>
          </div>
        )}
      </CyberpunkCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ZK Proofs */}
        <CyberpunkCard glowColor="cyan" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <LockClosedIcon className="w-6 h-6 text-cyan-400" />
            <h4 className="text-lg font-bold text-white">Zero-Knowledge Proofs</h4>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {zkProofs
              .filter(proof => selectedJurisdiction === 'all' || proof.jurisdiction === selectedJurisdiction)
              .map((proof, index) => (
                <motion.div
                  key={proof.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 border-${getStatusColor(proof.status)}-500 bg-gray-800/30 rounded-r-lg p-4 hover:bg-gray-800/50 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-${getStatusColor(proof.status)}-400 text-xs font-mono uppercase px-2 py-1 bg-${getStatusColor(proof.status)}-500/10 rounded`}>
                        {proof.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded bg-${getPrivacyLevelColor(proof.privacyLevel)}-500/20 text-${getPrivacyLevelColor(proof.privacyLevel)}-400`}>
                        {proof.privacyLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <GlobeAltIcon className="w-3 h-3" />
                      <span>{proof.jurisdiction}</span>
                    </div>
                  </div>
                  
                  <h5 className="text-white font-semibold mb-2">{proof.description}</h5>
                  
                  <div className="text-xs text-gray-400 mb-2 font-mono">
                    Hash: {proof.verificationHash.slice(0, 20)}...
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      <span>Created {formatTimeAgo(proof.createdAt)}</span>
                    </div>
                    <div className="text-gray-500">
                      Expires: {new Date(proof.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </CyberpunkCard>

        {/* Compliance Requirements */}
        <CyberpunkCard glowColor="orange" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <DocumentCheckIcon className="w-6 h-6 text-orange-400" />
            <h4 className="text-lg font-bold text-white">Compliance Requirements</h4>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {requirements
              .filter(req => selectedJurisdiction === 'all' || req.jurisdiction === selectedJurisdiction)
              .map((requirement, index) => (
                <motion.div
                  key={requirement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 border-${getStatusColor(requirement.status)}-500 bg-gray-800/30 rounded-r-lg p-4 hover:bg-gray-800/50 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-${getStatusColor(requirement.status)}-400 text-xs font-mono uppercase px-2 py-1 bg-${getStatusColor(requirement.status)}-500/10 rounded`}>
                        {requirement.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded bg-${getRiskColor(requirement.riskLevel)}-500/20 text-${getRiskColor(requirement.riskLevel)}-400`}>
                        {requirement.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{requirement.jurisdiction}</span>
                      {requirement.zkProofRequired && (
                        <EyeSlashIcon className="w-3 h-3 text-purple-400" title="ZK Proof Required" />
                      )}
                    </div>
                  </div>
                  
                  <h5 className="text-white font-semibold mb-1">{requirement.regulation}</h5>
                  <p className="text-gray-400 text-sm mb-2">{requirement.requirement}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-gray-500">
                      Last checked: {formatTimeAgo(requirement.lastChecked)}
                    </div>
                    {requirement.nextDeadline && (
                      <div className={`font-semibold ${
                        new Date(requirement.nextDeadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        Due: {new Date(requirement.nextDeadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
          </div>
        </CyberpunkCard>
      </div>

      {/* Privacy Features */}
      <CyberpunkCard glowColor="green" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheckIcon className="w-6 h-6 text-green-400" />
          <h4 className="text-lg font-bold text-white">Privacy-Preserving Features</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <EyeSlashIcon className="w-8 h-8 text-purple-400" />
              <div>
                <h5 className="text-white font-semibold">Data Minimization</h5>
                <p className="text-gray-400 text-sm">Only necessary data is processed</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
            </div>
            <div className="text-right text-xs text-purple-400 mt-1">96% Optimized</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <LockClosedIcon className="w-8 h-8 text-cyan-400" />
              <div>
                <h5 className="text-white font-semibold">Selective Disclosure</h5>
                <p className="text-gray-400 text-sm">Reveal only required information</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
            <div className="text-right text-xs text-cyan-400 mt-1">89% Selective</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <KeyIcon className="w-8 h-8 text-green-400" />
              <div>
                <h5 className="text-white font-semibold">Cryptographic Proofs</h5>
                <p className="text-gray-400 text-sm">Mathematical verification without data</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
            </div>
            <div className="text-right text-xs text-green-400 mt-1">94% Verified</div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Configure Privacy Settings
          </button>
          <button className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Export Compliance Report
          </button>
        </div>
      </CyberpunkCard>
    </div>
  );
}