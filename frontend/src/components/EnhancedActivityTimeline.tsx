import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  EyeIcon,
  BriefcaseIcon,
  XMarkIcon,
  InformationCircleIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  time: string;
  action: string;
  type: 'threat' | 'transaction' | 'compliance' | 'system' | 'portfolio';
  status: 'completed' | 'blocked' | 'positive' | 'warning' | 'critical' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  details?: string;
  walletAddress?: string;
  amount?: string;
  chain?: string;
  metadata?: {
    source?: string;
    destination?: string;
    transactionHash?: string;
    complianceType?: string;
    threatType?: string;
  };
}

interface EnhancedActivityTimelineProps {
  className?: string;
}

const EnhancedActivityTimeline: React.FC<EnhancedActivityTimelineProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

  // Mock enhanced activities data
  const activities: Activity[] = [
    {
      id: '1',
      time: '2 hours ago',
      action: 'Suspicious transaction detected',
      type: 'threat',
      status: 'blocked',
      severity: 'high',
      riskScore: 87,
      details: 'Large outbound transaction to a known mixer address detected and automatically blocked.',
      walletAddress: '0x742d35Cc6634C0532925a3b8D8C5c5c8F8E3C4f',
      amount: '$12,450',
      chain: 'Ethereum',
      metadata: {
        threatType: 'mixer-detected',
        destination: '0x1234...5678 (Tornado Cash)',
      },
    },
    {
      id: '2',
      time: 'Yesterday',
      action: 'Portfolio rebalancing completed',
      type: 'portfolio',
      status: 'completed',
      severity: 'low',
      details: 'Automatic portfolio rebalancing executed based on risk assessment algorithms.',
      amount: '$2,340',
      metadata: {
        transactionHash: '0xabcd...ef12',
      },
    },
    {
      id: '3',
      time: '3 days ago',
      action: 'KYC verification passed',
      type: 'compliance',
      status: 'completed',
      severity: 'low',
      details: 'Enhanced KYC verification completed successfully for account upgrade.',
      metadata: {
        complianceType: 'kyc-enhanced',
      },
    },
    {
      id: '4',
      time: '1 week ago',
      action: 'Dark web exposure detected',
      type: 'threat',
      status: 'warning',
      severity: 'medium',
      riskScore: 64,
      details: 'Wallet address found on dark web forum associated with phishing campaigns.',
      walletAddress: '0x8f3d2c1e6b7a4c9d5e8f2a1c3b5d7e9f',
      metadata: {
        threatType: 'dark-web-exposure',
        source: 'Dread Forum',
      },
    },
    {
      id: '5',
      time: '2 weeks ago',
      action: 'Large inflow detected',
      type: 'transaction',
      status: 'positive',
      severity: 'low',
      details: 'Large legitimate inflow from DEX trading activity.',
      amount: '$45,670',
      chain: 'Polygon',
      metadata: {
        source: 'Uniswap V3',
        transactionHash: '0x5678...9abc',
      },
    },
    {
      id: '6',
      time: '3 weeks ago',
      action: 'Smart contract vulnerability found',
      type: 'threat',
      status: 'critical',
      severity: 'critical',
      riskScore: 95,
      details: 'Critical reentrancy vulnerability detected in DeFi protocol interaction.',
      walletAddress: '0x9e4f8c7d6b5a2e1f3c8d9a4b7e6f5c2a',
      metadata: {
        threatType: 'smart-contract-vulnerability',
      },
    },
  ];

  const toggleActivityExpansion = (activityId: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(activityId)) {
      newExpanded.delete(activityId);
    } else {
      newExpanded.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const getFilteredActivities = () => {
    return activities.filter(activity => {
      const matchesSearch = activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.walletAddress?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || activity.severity === severityFilter;

      return matchesSearch && matchesType && matchesStatus && matchesSeverity;
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500/50';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'blocked': return ShieldCheckIcon;
      case 'positive': return ArrowTrendingUpIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'critical': return ExclamationTriangleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'threat': return ShieldCheckIcon;
      case 'transaction': return ArrowTrendingUpIcon;
      case 'compliance': return DocumentTextIcon;
      case 'portfolio': return BriefcaseIcon;
      case 'system': return CpuChipIcon;
      default: return InformationCircleIcon;
    }
  };

  const getRiskBadgeColor = (score?: number) => {
    if (!score) return '';
    if (score >= 80) return 'bg-red-900/30 text-red-400 border-red-500/50';
    if (score >= 60) return 'bg-orange-900/30 text-orange-400 border-orange-500/50';
    if (score >= 40) return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50';
    return 'bg-green-900/30 text-green-400 border-green-500/50';
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className={`bg-gray-800/30 rounded-lg border border-gray-700 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-cyan-400" />
            Enhanced Activity Timeline
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Real-time updates
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities, wallets, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="threat">Threats</option>
              <option value="transaction">Transactions</option>
              <option value="compliance">Compliance</option>
              <option value="portfolio">Portfolio</option>
              <option value="system">System</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
              <option value="positive">Positive</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filteredActivities.map((activity, index) => {
              const isExpanded = expandedActivities.has(activity.id);
              const StatusIcon = getStatusIcon(activity.status);
              const TypeIcon = getTypeIcon(activity.type);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-700/30 rounded-lg border border-gray-600/50 hover:border-gray-500/50 transition-colors"
                >
                  {/* Activity Header */}
                  <div
                    className="p-4 cursor-pointer flex items-center gap-4"
                    onClick={() => toggleActivityExpansion(activity.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium truncate">{activity.action}</p>
                        {activity.riskScore && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadgeColor(activity.riskScore)}`}>
                            Risk: {activity.riskScore}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {activity.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <TagIcon className="w-3 h-3" />
                          {activity.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        activity.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        activity.status === 'blocked' ? 'bg-blue-900/30 text-blue-400' :
                        activity.status === 'positive' ? 'bg-emerald-900/30 text-emerald-400' :
                        activity.status === 'warning' ? 'bg-yellow-900/30 text-yellow-400' :
                        activity.status === 'critical' ? 'bg-red-900/30 text-red-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {activity.status.toUpperCase()}
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-600/50"
                      >
                        <div className="p-4 space-y-3">
                          <p className="text-gray-300 text-sm">{activity.details}</p>

                          {/* Metadata Grid */}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {activity.walletAddress && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-1">Wallet Address</span>
                                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-cyan-300 break-all">
                                    {activity.walletAddress}
                                  </code>
                                </div>
                              )}
                              {activity.amount && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-1">Amount</span>
                                  <span className="text-sm text-white font-mono">{activity.amount}</span>
                                </div>
                              )}
                              {activity.chain && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-1">Chain</span>
                                  <span className="text-sm text-white font-mono">{activity.chain}</span>
                                </div>
                              )}
                              {activity.metadata.transactionHash && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-1">Transaction Hash</span>
                                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-cyan-300 break-all">
                                    {activity.metadata.transactionHash}
                                  </code>
                                </div>
                              )}
                              {activity.metadata.threatType && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-1">Threat Type</span>
                                  <span className="text-sm text-orange-400 font-mono">{activity.metadata.threatType}</span>
                                </div>
                              )}
                              {activity.metadata.complianceType && (
                                <div>
                                  <span className="text-xs text-gray-400 block mb-1">Compliance Type</span>
                                  <span className="text-sm text-green-400 font-mono">{activity.metadata.complianceType}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <InformationCircleIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No activities match your current filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
                setSeverityFilter('all');
              }}
              className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedActivityTimeline;