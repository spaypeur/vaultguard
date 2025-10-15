import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BellAlertIcon,
  ShieldExclamationIcon,
  GlobeAltIcon,
  ClockIcon,
  FireIcon,
  EyeIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface ThreatIntel {
  id: string;
  timestamp: string;
  type: 'phishing' | 'malware' | 'exploit' | 'scam' | 'vulnerability' | 'market_manipulation';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  indicators: string[];
  affectedAssets?: string[];
  confidence: number;
  aiAnalysis: string;
  actionRecommended: boolean;
}

interface ThreatStats {
  totalThreats: number;
  criticalThreats: number;
  blockedAttacks: number;
  aiPredictions: number;
  threatTrend: 'increasing' | 'stable' | 'decreasing';
}

export default function RealTimeThreatIntelligence() {
  const [threats, setThreats] = useState<ThreatIntel[]>([]);
  const [stats, setStats] = useState<ThreatStats>({
    totalThreats: 0,
    criticalThreats: 0,
    blockedAttacks: 0,
    aiPredictions: 0,
    threatTrend: 'stable'
  });
  const [isLive, setIsLive] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntel | null>(null);

  useEffect(() => {
    // Initialize with mock threat intelligence data
    const mockThreats: ThreatIntel[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
        type: 'phishing',
        severity: 'critical',
        title: 'MetaMask Phishing Campaign Targeting High-Value Wallets',
        description: 'AI detected sophisticated phishing campaign using fake MetaMask updates to target wallets with >$100K balance',
        source: 'VaultGuard AI Neural Network',
        indicators: ['metamask-update[.]com', '0x1234...fake', 'approval-scam-pattern'],
        affectedAssets: ['ETH', 'USDC', 'WBTC'],
        confidence: 96,
        aiAnalysis: 'Pattern matches known APT group "CryptoReaper" with 94% similarity. Likely targeting institutional investors.',
        actionRecommended: true,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        type: 'exploit',
        severity: 'high',
        title: 'DeFi Protocol Flash Loan Vulnerability',
        description: 'Zero-day vulnerability discovered in popular DeFi protocol allowing price oracle manipulation',
        source: 'Blockchain Security Scanner',
        indicators: ['flash-loan-exploit', 'price-oracle-manipulation', 'MEV-attack'],
        affectedAssets: ['Multiple DeFi Tokens'],
        confidence: 89,
        aiAnalysis: 'Similar to recent Euler Finance exploit. Estimated potential loss: $50M+. Patch available.',
        actionRecommended: true,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        type: 'malware',
        severity: 'medium',
        title: 'Crypto Clipboard Hijacker Detected',
        description: 'New malware variant detected that replaces crypto addresses in clipboard with attacker addresses',
        source: 'Endpoint Detection System',
        indicators: ['clipboard-hijack.exe', 'crypto-stealer-v3', 'registry-persistence'],
        confidence: 82,
        aiAnalysis: 'Targets Windows systems. Uses advanced evasion techniques. 15,000+ infections detected globally.',
        actionRecommended: false,
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        type: 'scam',
        severity: 'high',
        title: 'Fake Airdrop Campaign on Social Media',
        description: 'Large-scale fake airdrop campaign impersonating major crypto projects to steal private keys',
        source: 'Social Media Intelligence',
        indicators: ['fake-airdrop-site[.]io', 'seed-phrase-harvesting', 'social-engineering'],
        confidence: 91,
        aiAnalysis: 'Coordinated campaign across Twitter, Telegram, Discord. 50,000+ potential victims identified.',
        actionRecommended: true,
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
        type: 'vulnerability',
        severity: 'medium',
        title: 'Smart Contract Reentrancy Risk',
        description: 'Potential reentrancy vulnerability identified in newly deployed smart contract',
        source: 'Smart Contract Analyzer',
        indicators: ['reentrancy-pattern', 'unchecked-external-call', 'state-modification'],
        confidence: 76,
        aiAnalysis: 'Low-severity reentrancy risk. Limited impact due to small contract balance. Monitoring recommended.',
        actionRecommended: false,
      },
    ];

    setThreats(mockThreats);
    setStats({
      totalThreats: mockThreats.length,
      criticalThreats: mockThreats.filter(t => t.severity === 'critical').length,
      blockedAttacks: 247,
      aiPredictions: 1834,
      threatTrend: 'increasing'
    });

    // Simulate real-time threat updates
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        const newThreat: ThreatIntel = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: ['phishing', 'malware', 'exploit', 'scam'][Math.floor(Math.random() * 4)] as any,
          severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
          title: 'New Threat Detected by AI',
          description: 'Real-time threat intelligence system detected suspicious activity',
          source: 'VaultGuard AI Neural Network',
          indicators: ['ai-detected-pattern'],
          confidence: Math.floor(Math.random() * 30) + 70,
          aiAnalysis: 'Automated analysis in progress...',
          actionRecommended: Math.random() > 0.5,
        };

        setThreats(prev => [newThreat, ...prev.slice(0, 9)]);
        setStats(prev => ({
          ...prev,
          totalThreats: prev.totalThreats + 1,
          criticalThreats: newThreat.severity === 'critical' ? prev.criticalThreats + 1 : prev.criticalThreats,
        }));
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      case 'info': return 'gray';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phishing': return '🎣';
      case 'malware': return '🦠';
      case 'exploit': return '💥';
      case 'scam': return '🚨';
      case 'vulnerability': return '🔓';
      case 'market_manipulation': return '📈';
      default: return '⚠️';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CyberpunkCard glowColor="red" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BellAlertIcon className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">Real-Time Threat Intelligence</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400 font-mono">
              {isLive ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-red-400 font-mono text-2xl font-bold">{stats.totalThreats}</div>
            <div className="text-gray-400 text-xs">THREATS TODAY</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-orange-400 font-mono text-2xl font-bold">{stats.criticalThreats}</div>
            <div className="text-gray-400 text-xs">CRITICAL</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-green-400 font-mono text-2xl font-bold">{stats.blockedAttacks}</div>
            <div className="text-gray-400 text-xs">BLOCKED</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-cyan-400 font-mono text-2xl font-bold">{stats.aiPredictions}</div>
            <div className="text-gray-400 text-xs">AI PREDICTIONS</div>
          </div>
        </div>

        {/* Threat Trend */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <ArrowTrendingUpIcon className={`w-4 h-4 ${
            stats.threatTrend === 'increasing' ? 'text-red-400' :
            stats.threatTrend === 'decreasing' ? 'text-green-400' : 'text-gray-400'
          }`} />
          <span className="text-gray-400">
            Threat level: <span className={`font-semibold ${
              stats.threatTrend === 'increasing' ? 'text-red-400' :
              stats.threatTrend === 'decreasing' ? 'text-green-400' : 'text-gray-400'
            }`}>
              {stats.threatTrend.toUpperCase()}
            </span>
          </span>
        </div>
      </CyberpunkCard>

      {/* Threat Feed */}
      <CyberpunkCard glowColor="orange" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <FireIcon className="w-6 h-6 text-orange-400" />
          <h4 className="text-lg font-bold text-white">Live Threat Feed</h4>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {threats.map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`border-l-4 border-${getSeverityColor(threat.severity)}-500 bg-gray-800/30 rounded-r-lg p-4 hover:bg-gray-800/50 transition-colors cursor-pointer`}
              onClick={() => setSelectedThreat(threat)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(threat.type)}</span>
                  <span className={`text-${getSeverityColor(threat.severity)}-400 text-xs font-mono uppercase px-2 py-1 bg-${getSeverityColor(threat.severity)}-500/10 rounded`}>
                    {threat.severity}
                  </span>
                  {threat.actionRecommended && (
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-400 animate-pulse" />
                  )}
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(threat.timestamp)}</span>
              </div>
              
              <h5 className="text-white font-semibold mb-1">{threat.title}</h5>
              <p className="text-gray-400 text-sm mb-2">{threat.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <CpuChipIcon className="w-3 h-3" />
                    <span>{threat.source}</span>
                  </div>
                  {threat.affectedAssets && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <span>Assets: {threat.affectedAssets.join(', ')}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <EyeIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400">{threat.confidence}% confidence</span>
                </div>
              </div>

              {/* AI Analysis Preview */}
              <div className="mt-2 bg-cyan-500/10 border border-cyan-500/20 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <CpuChipIcon className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 text-xs font-semibold">AI Analysis</span>
                </div>
                <p className="text-gray-300 text-xs">{threat.aiAnalysis}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          <button className="flex-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            View All Threats
          </button>
          <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Emergency Response
          </button>
        </div>
      </CyberpunkCard>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedThreat(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Threat Details</h3>
              <button
                onClick={() => setSelectedThreat(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(selectedThreat.type)}</span>
                <span className={`text-${getSeverityColor(selectedThreat.severity)}-400 text-sm font-mono uppercase px-3 py-1 bg-${getSeverityColor(selectedThreat.severity)}-500/10 rounded`}>
                  {selectedThreat.severity}
                </span>
                <span className="text-gray-400 text-sm">{formatTimeAgo(selectedThreat.timestamp)}</span>
              </div>
              
              <h4 className="text-lg font-semibold text-white">{selectedThreat.title}</h4>
              <p className="text-gray-300">{selectedThreat.description}</p>
              
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-4">
                <h5 className="text-cyan-400 font-semibold mb-2">AI Analysis</h5>
                <p className="text-gray-300 text-sm">{selectedThreat.aiAnalysis}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-white font-semibold mb-2">Indicators of Compromise</h5>
                  <ul className="space-y-1">
                    {selectedThreat.indicators.map((indicator, index) => (
                      <li key={index} className="text-sm text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded">
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-white font-semibold mb-2">Threat Intelligence</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Source:</span>
                      <span className="text-white">{selectedThreat.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-cyan-400">{selectedThreat.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Action Required:</span>
                      <span className={selectedThreat.actionRecommended ? 'text-red-400' : 'text-green-400'}>
                        {selectedThreat.actionRecommended ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Block Threat
                </button>
                <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                  Mark as False Positive
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}