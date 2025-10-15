import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  EyeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface DarkWebAlert {
  id: string;
  timestamp: string;
  source: 'dark_web' | 'mariana_web' | 'ghost_web';
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'wallet_mention' | 'asset_listing' | 'threat_actor' | 'marketplace_activity';
  title: string;
  description: string;
  location?: string;
  amount?: number;
  currency?: string;
  confidence: number;
  actionRequired: boolean;
}

export default function DarkWebIntelligence() {
  const [alerts, setAlerts] = useState<DarkWebAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [lastScan, setLastScan] = useState(new Date());

  // Simulate real-time dark web monitoring
  useEffect(() => {
    const mockAlerts: DarkWebAlert[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        source: 'dark_web',
        severity: 'high',
        type: 'wallet_mention',
        title: 'Wallet Address Mentioned in Forum',
        description: 'Your monitored wallet 0x742d...8f3a was discussed in a private forum thread about "high-value targets"',
        location: 'Russian Forum (Tor)',
        confidence: 87,
        actionRequired: true,
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        source: 'mariana_web',
        severity: 'critical',
        type: 'asset_listing',
        title: 'Stolen NFT Listed for Sale',
        description: 'CryptoPunk #7804 matching your collection was listed on underground marketplace',
        location: 'DeepMarket (Mariana)',
        amount: 150000,
        currency: 'USD',
        confidence: 94,
        actionRequired: true,
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        source: 'ghost_web',
        severity: 'medium',
        type: 'threat_actor',
        title: 'Known Threat Actor Activity',
        description: 'Threat actor "CryptoReaper" active in channels, previously targeted similar portfolios',
        location: 'Ghost Channel #447',
        confidence: 73,
        actionRequired: false,
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        source: 'dark_web',
        severity: 'low',
        type: 'marketplace_activity',
        title: 'Marketplace Intelligence',
        description: 'New phishing kit targeting MetaMask users detected in marketplace',
        location: 'AlphaBay Mirror',
        confidence: 65,
        actionRequired: false,
      },
    ];

    setAlerts(mockAlerts);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastScan(new Date());
      // Randomly add new alerts
      if (Math.random() > 0.8) {
        const newAlert: DarkWebAlert = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          source: ['dark_web', 'mariana_web', 'ghost_web'][Math.floor(Math.random() * 3)] as any,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          type: 'marketplace_activity',
          title: 'New Intelligence Detected',
          description: 'Automated monitoring detected new activity of interest',
          confidence: Math.floor(Math.random() * 40) + 60,
          actionRequired: Math.random() > 0.7,
        };
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'dark_web': return '🕸️';
      case 'mariana_web': return '🌊';
      case 'ghost_web': return '👻';
      default: return '🔍';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <CyberpunkCard glowColor="cyan" className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <EyeIcon className="w-6 h-6 text-cyan-400" />
          <h3 className="text-xl font-bold text-white">Dark Web Intelligence</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-sm text-gray-400 font-mono">
            {isMonitoring ? 'MONITORING' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Monitoring Status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-cyan-400 font-mono text-lg font-bold">24/7</div>
          <div className="text-gray-400 text-xs">SURVEILLANCE</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-green-400 font-mono text-lg font-bold">{alerts.length}</div>
          <div className="text-gray-400 text-xs">ALERTS TODAY</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="text-purple-400 font-mono text-lg font-bold">3</div>
          <div className="text-gray-400 text-xs">NETWORKS</div>
        </div>
      </div>

      {/* Last Scan Info */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <ClockIcon className="w-4 h-4" />
        <span>Last scan: {formatTimeAgo(lastScan.toISOString())}</span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border-l-4 border-${getSeverityColor(alert.severity)}-500 bg-gray-800/30 rounded-r-lg p-4 hover:bg-gray-800/50 transition-colors cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSourceIcon(alert.source)}</span>
                <span className={`text-${getSeverityColor(alert.severity)}-400 text-xs font-mono uppercase px-2 py-1 bg-${getSeverityColor(alert.severity)}-500/10 rounded`}>
                  {alert.severity}
                </span>
                {alert.actionRequired && (
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-400 animate-pulse" />
                )}
              </div>
              <span className="text-xs text-gray-500">{formatTimeAgo(alert.timestamp)}</span>
            </div>
            
            <h4 className="text-white font-semibold mb-1">{alert.title}</h4>
            <p className="text-gray-400 text-sm mb-2">{alert.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                {alert.location && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPinIcon className="w-3 h-3" />
                    <span>{alert.location}</span>
                  </div>
                )}
                {alert.amount && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <CurrencyDollarIcon className="w-3 h-3" />
                    <span>${alert.amount.toLocaleString()} {alert.currency}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400">{alert.confidence}% confidence</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-2">
        <button className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          View All Intelligence
        </button>
        <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          Emergency Alert
        </button>
      </div>
    </CyberpunkCard>
  );
}