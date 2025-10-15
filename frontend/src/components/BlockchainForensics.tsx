import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  LinkIcon,
  CpuChipIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface TransactionNode {
  id: string;
  address: string;
  type: 'wallet' | 'exchange' | 'mixer' | 'contract';
  amount: number;
  timestamp: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  chain: string;
  label?: string;
}

interface ForensicAnalysis {
  transactionHash: string;
  status: 'analyzing' | 'completed' | 'failed';
  progress: number;
  findings: {
    totalHops: number;
    mixerDetected: boolean;
    exchangeDeposits: number;
    riskScore: number;
    chains: string[];
    suspiciousActivity: string[];
  };
  timeline: TransactionNode[];
}

export default function BlockchainForensics() {
  const [analysis, setAnalysis] = useState<ForensicAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mockAnalysis: ForensicAnalysis = {
    transactionHash: '0x742d35cc6bf4c4c8f3a9b8f2e1d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2',
    status: 'completed',
    progress: 100,
    findings: {
      totalHops: 15,
      mixerDetected: true,
      exchangeDeposits: 3,
      riskScore: 87,
      chains: ['Ethereum', 'BSC', 'Polygon'],
      suspiciousActivity: [
        'Tornado Cash mixer usage detected',
        'Rapid cross-chain transfers',
        'Multiple exchange deposits within 24h',
        'Connection to known threat actor wallet'
      ]
    },
    timeline: [
      {
        id: '1',
        address: '0x742d35cc...e1f2',
        type: 'wallet',
        amount: 1200000,
        timestamp: '2024-01-15T10:30:00Z',
        risk: 'critical',
        chain: 'Ethereum',
        label: 'Victim Wallet'
      },
      {
        id: '2',
        address: '0x12345678...abcd',
        type: 'mixer',
        amount: 1200000,
        timestamp: '2024-01-15T10:35:00Z',
        risk: 'high',
        chain: 'Ethereum',
        label: 'Tornado Cash'
      },
      {
        id: '3',
        address: '0x87654321...dcba',
        type: 'wallet',
        amount: 1180000,
        timestamp: '2024-01-15T12:15:00Z',
        risk: 'high',
        chain: 'Ethereum',
        label: 'Intermediate Wallet'
      },
      {
        id: '4',
        address: '0xabcdef12...3456',
        type: 'contract',
        amount: 1180000,
        timestamp: '2024-01-15T12:20:00Z',
        risk: 'medium',
        chain: 'BSC',
        label: 'Bridge Contract'
      },
      {
        id: '5',
        address: '0x98765432...1098',
        type: 'exchange',
        amount: 1150000,
        timestamp: '2024-01-15T14:45:00Z',
        risk: 'medium',
        chain: 'BSC',
        label: 'Binance Hot Wallet'
      }
    ]
  };

  const startAnalysis = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysis({
      ...mockAnalysis,
      transactionHash: searchQuery,
      status: 'analyzing',
      progress: 0
    });

    // Simulate analysis progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setAnalysis(prev => prev ? { ...prev, progress: i } : null);
    }

    setAnalysis(prev => prev ? { ...prev, status: 'completed' } : null);
    setIsAnalyzing(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wallet': return '👛';
      case 'exchange': return '🏦';
      case 'mixer': return '🌪️';
      case 'contract': return '📄';
      default: return '❓';
    }
  };

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'Ethereum': return 'blue';
      case 'BSC': return 'yellow';
      case 'Polygon': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <CyberpunkCard glowColor="purple" className="h-full">
      <div className="flex items-center gap-3 mb-6">
        <MagnifyingGlassIcon className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Blockchain Forensics</h3>
      </div>

      {/* Search Interface */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter transaction hash, wallet address, or contract..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing || !searchQuery.trim()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Analysis Status */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Analysis Status</span>
              <span className={`text-sm font-mono px-2 py-1 rounded ${
                analysis.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                analysis.status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {analysis.status.toUpperCase()}
              </span>
            </div>
            
            {analysis.status === 'analyzing' && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysis.progress}%` }}
                ></div>
              </div>
            )}
            
            <div className="text-sm text-gray-400 mt-2 font-mono">
              Hash: {analysis.transactionHash.slice(0, 20)}...
            </div>
          </div>

          {analysis.status === 'completed' && (
            <>
              {/* Key Findings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-purple-400 font-mono text-lg font-bold">{analysis.findings.totalHops}</div>
                  <div className="text-gray-400 text-xs">TRANSACTION HOPS</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-red-400 font-mono text-lg font-bold">{analysis.findings.riskScore}%</div>
                  <div className="text-gray-400 text-xs">RISK SCORE</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-orange-400 font-mono text-lg font-bold">{analysis.findings.exchangeDeposits}</div>
                  <div className="text-gray-400 text-xs">EXCHANGE DEPOSITS</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-cyan-400 font-mono text-lg font-bold">{analysis.findings.chains.length}</div>
                  <div className="text-gray-400 text-xs">BLOCKCHAINS</div>
                </div>
              </div>

              {/* Suspicious Activity Alerts */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">Suspicious Activity Detected</span>
                </div>
                <ul className="space-y-1">
                  {analysis.findings.suspiciousActivity.map((activity, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                      <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Transaction Timeline */}
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Transaction Flow
                </h4>
                <div className="space-y-3">
                  {analysis.timeline.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{getTypeIcon(node.type)}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-mono text-sm">
                            {node.address.slice(0, 10)}...{node.address.slice(-6)}
                          </span>
                          {node.label && (
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                              {node.label}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded bg-${getChainColor(node.chain)}-500/20 text-${getChainColor(node.chain)}-400`}>
                            {node.chain}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          ${node.amount.toLocaleString()} • {new Date(node.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      
                      <div className={`w-3 h-3 rounded-full bg-${getRiskColor(node.risk)}-500`}></div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Export Report
                </button>
                <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Flag as Suspicious
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {!analysis && (
        <div className="text-center py-12 text-gray-400">
          <CpuChipIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-semibold mb-2">Advanced Blockchain Analysis</p>
          <p className="text-sm">
            Enter a transaction hash or wallet address to begin forensic analysis
          </p>
        </div>
      )}
    </CyberpunkCard>
  );
}