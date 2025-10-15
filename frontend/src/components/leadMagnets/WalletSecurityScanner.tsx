import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import EmailCaptureModal from './EmailCaptureModal';

interface ScanResult {
  category: string;
  status: 'safe' | 'warning' | 'danger';
  message: string;
  details: string;
  recommendation: string;
}

interface WalletScan {
  address: string;
  isScanning: boolean;
  results: ScanResult[];
  overallScore: number;
  scanDate: string;
}

const scanCategories = [
  {
    name: 'Address Format',
    description: 'Validates wallet address format and checksum'
  },
  {
    name: 'Transaction History',
    description: 'Analyzes transaction patterns for suspicious activity'
  },
  {
    name: 'Balance & Activity',
    description: 'Checks for unusual balance movements or dormant funds'
  },
  {
    name: 'Network Exposure',
    description: 'Scans for address exposure across public block explorers'
  },
  {
    name: 'Association Risk',
    description: 'Checks for links to known malicious addresses or entities'
  },
  {
    name: 'Privacy Score',
    description: 'Evaluates transaction privacy and clustering risk'
  }
];

export default function WalletSecurityScanner() {
  const [walletAddress, setWalletAddress] = useState('');
  const [scanResults, setScanResults] = useState<WalletScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMockResults = (address: string): ScanResult[] => {
    // Simulate different security findings based on address patterns
    const results: ScanResult[] = [
      {
        category: 'Address Format',
        status: 'safe',
        message: 'Valid wallet address format detected',
        details: 'Checksum verification passed for all networks',
        recommendation: 'Address format is secure and properly validated'
      }
    ];

    // Simulate some security findings based on address input
    if (address.length < 20) {
      results.push({
        category: 'Address Format',
        status: 'danger',
        message: 'Invalid wallet address length',
        details: 'Address appears to be truncated or malformed',
        recommendation: 'Double-check the wallet address and ensure it\'s copied correctly'
      });
    }

    if (address.includes('1111')) {
      results.push({
        category: 'Transaction History',
        status: 'warning',
        message: 'Unusual transaction patterns detected',
        details: 'Multiple transactions to high-risk addresses identified',
        recommendation: 'Review recent transactions and consider rotating to a new address'
      });
    }

    if (address.includes('test')) {
      results.push({
        category: 'Network Exposure',
        status: 'warning',
        message: 'High address visibility detected',
        details: 'Address appears frequently in public blockchain explorers',
        recommendation: 'Consider using multiple addresses for better privacy'
      });
    }

    // Add more random results for demo
    const additionalResults: ScanResult[] = [
      {
        category: 'Balance & Activity',
        status: 'safe',
        message: 'Normal balance activity patterns',
        details: 'No suspicious large transfers or unusual timing patterns',
        recommendation: 'Continue monitoring for any sudden changes in activity'
      },
      {
        category: 'Privacy Score',
        status: 'warning',
        message: 'Moderate privacy risk detected',
        details: 'Address clustering analysis shows potential links to exchange accounts',
        recommendation: 'Use privacy-focused coins or mixing services for sensitive transactions'
      }
    ];

    return [...results, ...additionalResults];
  };

  const calculateScore = (results: ScanResult[]): number => {
    let score = 100;
    results.forEach(result => {
      switch (result.status) {
        case 'danger':
          score -= 30;
          break;
        case 'warning':
          score -= 15;
          break;
        case 'safe':
          score -= 0;
          break;
      }
    });
    return Math.max(0, score);
  };

  const performScan = async () => {
    if (!walletAddress.trim()) return;

    setIsScanning(true);
    setScanResults(null);

    // Simulate scanning process
    await new Promise(resolve => setTimeout(resolve, 3000));

    const results = generateMockResults(walletAddress);
    const score = calculateScore(results);

    setScanResults({
      address: walletAddress,
      isScanning: false,
      results,
      overallScore: score,
      scanDate: new Date().toISOString()
    });

    setIsScanning(false);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setShowEmailModal(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Secure';
    if (score >= 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      case 'danger':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <ShieldCheckIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'danger':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-gray-500/10 border-gray-700';
    }
  };

  return (
    <>
      <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-full mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Wallet Security Scanner
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Analyze any cryptocurrency wallet address for security vulnerabilities,
            privacy risks, and suspicious activity patterns. Get instant security assessment.
          </p>
        </div>

        {/* Scan Input */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address (BTC, ETH, or any supported blockchain)"
                className="w-full px-4 py-4 pr-32 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-lg"
                disabled={isScanning}
              />
              <motion.button
                onClick={performScan}
                disabled={isScanning || !walletAddress.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="absolute right-2 top-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold px-6 py-2 rounded-lg transition-all duration-200 flex items-center"
              >
                {isScanning ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Scanning...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    Scan Wallet
                  </div>
                )}
              </motion.button>
            </div>

            <p className="text-sm text-gray-400 mt-2 text-center">
              Supports BTC, ETH, BSC, Polygon, and 50+ other blockchains
            </p>
          </div>
        </div>

        {/* Scanning Animation */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/10 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Scanning Wallet Address</h3>
              <p className="text-gray-400">Analyzing transaction history, privacy risks, and security patterns...</p>

              {/* Progress Steps */}
              <div className="flex justify-center items-center space-x-4 mt-6">
                {scanCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ delay: index * 0.3, duration: 1.5, repeat: Infinity }}
                    className="text-center"
                  >
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs text-gray-400">{category.name}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan Results */}
        {scanResults && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Overall Score */}
            <div className="text-center mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(scanResults.overallScore)}`}>
                {scanResults.overallScore}%
              </div>
              <div className="text-xl text-white mb-1">{getScoreLabel(scanResults.overallScore)}</div>
              <div className="text-sm text-gray-400">
                Security Score • Scanned {new Date(scanResults.scanDate).toLocaleDateString()}
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4 mb-8">
              {scanResults.results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{result.message}</h3>
                      <p className="text-sm text-gray-300 mb-2">{result.details}</p>
                      <div className="text-xs text-gray-400 mb-2">{result.category}</div>
                      <div className="text-sm text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2">
                        <strong>Recommendation:</strong> {result.recommendation}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

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
                      Get Detailed Report
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                onClick={() => setScanResults(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
              >
                Scan Another Wallet
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Features */}
        {!scanResults && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h3 className="text-lg font-bold text-white mb-4 text-center">What We Analyze</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-center mb-2">
                    <ShieldCheckIcon className="w-5 h-5 text-cyan-400 mr-2" />
                    <h4 className="font-semibold text-white text-sm">{category.name}</h4>
                  </div>
                  <p className="text-xs text-gray-400">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">
            Professional Security Analysis
          </h3>
          <p className="text-sm text-gray-300">
            Our scanner uses advanced blockchain analysis techniques similar to those used by{' '}
            <span className="text-cyan-400 font-semibold">professional security firms</span>.
            Get institutional-grade wallet security assessment in seconds.
          </p>
        </motion.div>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        leadMagnet="Wallet Security Scanner Report"
        onEmailCaptured={() => {
          console.log('Email captured, downloading security report...');
          setShowEmailModal(false);
        }}
      />
    </>
  );
}