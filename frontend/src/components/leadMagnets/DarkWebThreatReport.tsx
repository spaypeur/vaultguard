import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import EmailCaptureModal from './EmailCaptureModal';

interface ThreatInsight {
  id: string;
  category: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  affectedAssets: string[];
  mitigation: string;
}

const threatInsights: ThreatInsight[] = [
  {
    id: 'phishing-attacks',
    category: 'Social Engineering',
    title: 'Sophisticated Phishing Campaigns',
    severity: 'critical',
    description: 'Advanced phishing attacks targeting high-net-worth crypto investors through personalized emails and fake DeFi protocols.',
    impact: '$2.3M average loss per successful attack',
    trend: 'increasing',
    affectedAssets: ['All major cryptocurrencies', 'DeFi tokens', 'NFTs'],
    mitigation: 'Verify all URLs, use hardware wallets, implement multi-signature approvals'
  },
  {
    id: 'smart-contract-exploits',
    category: 'Technical Vulnerabilities',
    title: 'Cross-Chain Bridge Exploits',
    severity: 'high',
    description: 'Attackers exploiting vulnerabilities in blockchain bridges to steal assets during cross-chain transfers.',
    impact: '$620M+ stolen in 2024 across major bridge hacks',
    trend: 'increasing',
    affectedAssets: ['USDC', 'USDT', 'WETH', 'Cross-chain assets'],
    mitigation: 'Use decentralized bridges, verify contract addresses, limit bridge usage'
  },
  {
    id: 'dark-web-marketplaces',
    category: 'Dark Web Intelligence',
    title: 'Stolen Credential Markets',
    severity: 'high',
    description: 'Flourishing underground markets selling hacked exchange accounts and wallet credentials.',
    impact: '45% of stolen crypto originates from credential compromise',
    trend: 'stable',
    affectedAssets: ['Exchange accounts', 'Wallet credentials', 'Private keys'],
    mitigation: 'Use unique passwords, enable 2FA, monitor account activity'
  },
  {
    id: 'supply-chain-attacks',
    category: 'Infrastructure',
    title: 'Malware Distribution via Updates',
    severity: 'medium',
    description: 'Malicious actors compromising software updates and popular crypto tools to distribute malware.',
    impact: '12 major crypto tools compromised in 2024',
    trend: 'increasing',
    affectedAssets: ['Wallet software', 'Trading bots', 'Portfolio trackers'],
    mitigation: 'Verify software signatures, use official sources, keep software updated'
  },
  {
    id: 'oracle-manipulation',
    category: 'DeFi Protocols',
    title: 'Price Oracle Manipulation',
    severity: 'medium',
    description: 'Attackers manipulating price feeds to exploit DeFi protocols and liquidate positions.',
    impact: '$180M+ in manipulated liquidations',
    trend: 'decreasing',
    affectedAssets: ['Lending protocols', 'Stablecoins', 'DeFi positions'],
    mitigation: 'Use time-weighted average prices, diversify oracles, monitor positions'
  },
  {
    id: 'ransomware-crypto',
    category: 'Ransomware',
    title: 'Crypto-Focused Ransomware',
    severity: 'medium',
    description: 'Ransomware attacks specifically targeting crypto investors and demanding payment in cryptocurrency.',
    impact: '$34M paid in crypto ransoms in 2024',
    trend: 'stable',
    affectedAssets: ['Private keys', 'Wallet files', 'Exchange access'],
    mitigation: 'Regular encrypted backups, air-gapped storage, incident response plans'
  }
];

const reportStats = {
  totalThreats: 1247,
  criticalAlerts: 89,
  monitoredAssets: '$2.8T',
  responseTime: '< 2 minutes'
};

export default function DarkWebThreatReport() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = ['all', ...Array.from(new Set(threatInsights.map(t => t.category)))];

  const filteredInsights = selectedCategory === 'all'
    ? threatInsights
    : threatInsights.filter(insight => insight.category === selectedCategory);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↗';
      case 'decreasing': return '↘';
      case 'stable': return '→';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      case 'stable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setShowEmailModal(true);
  };

  return (
    <>
      <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-full mb-4">
            <EyeIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Dark Web Threat Report 2024
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Exclusive intelligence report on current dark web threats targeting cryptocurrency
            investors and institutions. Based on real-time monitoring of underground markets.
          </p>
        </div>

        {/* Report Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-cyan-400 mb-1">{reportStats.totalThreats.toLocaleString()}+</div>
            <div className="text-sm text-gray-400">Threats Detected</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-red-400 mb-1">{reportStats.criticalAlerts}</div>
            <div className="text-sm text-gray-400">Critical Alerts</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-green-400 mb-1">{reportStats.monitoredAssets}</div>
            <div className="text-sm text-gray-400">Assets Monitored</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-2xl font-bold text-purple-400 mb-1">{reportStats.responseTime}</div>
            <div className="text-sm text-gray-400">Avg Response</div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                selectedCategory === category
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category === 'all' ? 'All Threats' : category}
            </button>
          ))}
        </div>

        {/* Threat Insights */}
        <div className="space-y-4 mb-8">
          <AnimatePresence>
            {filteredInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{insight.title}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(insight.severity)}`}>
                        {insight.severity.toUpperCase()}
                      </span>
                      <span className={`text-sm ${getTrendColor(insight.trend)}`}>
                        {getTrendIcon(insight.trend)} {insight.trend}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <CurrencyDollarIcon className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-xs font-medium text-red-400">IMPACT</span>
                    </div>
                    <div className="text-sm text-gray-300">{insight.impact}</div>
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <GlobeAltIcon className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-xs font-medium text-blue-400">AFFECTED ASSETS</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {insight.affectedAssets.slice(0, 2).join(', ')}
                      {insight.affectedAssets.length > 2 && ` +${insight.affectedAssets.length - 2} more`}
                    </div>
                  </div>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <ShieldCheckIcon className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-xs font-medium text-green-400">MITIGATION</span>
                    </div>
                    <div className="text-sm text-gray-300">{insight.mitigation}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Report Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-cyan-500/10"
        >
          <h3 className="text-lg font-bold text-white mb-3">What You'll Get in the Full Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2" />
                Detailed threat analysis for each category
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2" />
                Real dark web monitoring data
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2" />
                Specific attack vectors and techniques
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2" />
                Mitigation strategies and best practices
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2" />
                Trend analysis and future predictions
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircleIcon className="w-4 h-4 text-cyan-400 mr-2" />
                Actionable security recommendations
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={generateReport}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center group"
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Generating Report...
                </motion.div>
              ) : (
                <motion.div
                  key="generate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Download Full Report
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
          >
            Back to Top
          </motion.button>
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">
            Intelligence-Driven Security
          </h3>
          <p className="text-sm text-gray-300">
            This report is based on active monitoring of 50+ dark web marketplaces and{' '}
            <span className="text-cyan-400 font-semibold">1,247 unique threats</span> detected in 2024.
            Get the intelligence you need to stay ahead of sophisticated attackers.
          </p>
        </motion.div>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        leadMagnet="Dark Web Threat Report 2024"
        onEmailCaptured={() => {
          console.log('Email captured, downloading threat report...');
          setShowEmailModal(false);
        }}
      />
    </>
  );
}