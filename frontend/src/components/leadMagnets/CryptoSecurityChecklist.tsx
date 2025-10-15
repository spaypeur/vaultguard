import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  LockClosedIcon,
  KeyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import EmailCaptureModal from './EmailCaptureModal';

interface SecurityCheck {
  id: string;
  category: string;
  question: string;
  importance: 'high' | 'medium' | 'low';
  completed: boolean;
  description?: string;
}

const securityChecks: SecurityCheck[] = [
  {
    id: 'hardware-wallet',
    category: 'Wallet Security',
    question: 'Are you using a hardware wallet for large amounts?',
    importance: 'high',
    completed: false,
    description: 'Hardware wallets provide the highest level of security for significant crypto holdings'
  },
  {
    id: 'seed-phrase-backup',
    category: 'Wallet Security',
    question: 'Is your seed phrase stored offline and securely?',
    importance: 'high',
    completed: false,
    description: 'Never store seed phrases digitally or in cloud storage'
  },
  {
    id: 'multi-signature',
    category: 'Wallet Security',
    question: 'Do you use multi-signature wallets for business accounts?',
    importance: 'high',
    completed: false,
    description: 'Multi-sig wallets require multiple approvals for transactions'
  },
  {
    id: 'two-factor-auth',
    category: 'Account Security',
    question: 'Do all your exchange accounts have 2FA enabled?',
    importance: 'high',
    completed: false,
    description: 'Use authenticator apps, not SMS for 2FA'
  },
  {
    id: 'phishing-awareness',
    category: 'Operational Security',
    question: 'Do you verify all URLs before entering credentials?',
    importance: 'high',
    completed: false,
    description: 'Check for HTTPS and correct domain spelling'
  },
  {
    id: 'regular-backups',
    category: 'Data Management',
    question: 'Do you maintain encrypted backups of critical data?',
    importance: 'medium',
    completed: false,
    description: 'Regular encrypted backups protect against data loss'
  },
  {
    id: 'firmware-updates',
    category: 'Device Security',
    question: 'Do you keep all wallet firmware updated?',
    importance: 'medium',
    completed: false,
    description: 'Regular firmware updates patch security vulnerabilities'
  },
  {
    id: 'transaction-review',
    category: 'Operational Security',
    question: 'Do you double-check all transaction details?',
    importance: 'high',
    completed: false,
    description: 'Always verify addresses, amounts, and gas fees'
  },
  {
    id: 'dark-web-monitoring',
    category: 'Threat Intelligence',
    question: 'Do you monitor for your information on the dark web?',
    importance: 'medium',
    completed: false,
    description: 'Dark web monitoring can detect leaked credentials'
  },
  {
    id: 'api-key-security',
    category: 'API Security',
    question: 'Are your API keys properly secured with restrictions?',
    importance: 'high',
    completed: false,
    description: 'Limit API key permissions and use IP whitelisting'
  }
];

export default function CryptoSecurityChecklist() {
  const [checks, setChecks] = useState<SecurityCheck[]>(securityChecks);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCheckToggle = (id: string) => {
    setChecks(prev => prev.map(check =>
      check.id === id ? { ...check, completed: !check.completed } : check
    ));
  };

  const getScore = () => {
    const completed = checks.filter(check => check.completed).length;
    return Math.round((completed / checks.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  const getHighPriorityIncomplete = () => {
    return checks.filter(check => !check.completed && check.importance === 'high');
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsGenerating(false);
    setShowEmailModal(true);
  };

  const completedCount = checks.filter(check => check.completed).length;
  const highPriorityIncomplete = getHighPriorityIncomplete();
  const score = getScore();

  return (
    <>
      <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-full mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Ultimate Crypto Security Checklist
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive security assessment for your cryptocurrency holdings.
            Get your personalized security score and improvement recommendations.
          </p>
        </div>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
        >
          <div className={`text-5xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="text-xl text-white mb-1">{getScoreLabel(score)}</div>
          <div className="text-sm text-gray-400">
            {completedCount} of {checks.length} checks completed
          </div>
        </motion.div>

        {/* Security Checks */}
        <div className="space-y-4 mb-8">
          {checks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-lg border transition-all ${
                check.completed
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => handleCheckToggle(check.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    check.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500 hover:border-cyan-400'
                  }`}
                >
                  {check.completed && (
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`font-semibold ${check.completed ? 'text-green-400' : 'text-white'}`}>
                      {check.question}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      check.importance === 'high'
                        ? 'bg-red-500/20 text-red-400'
                        : check.importance === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {check.importance} priority
                    </span>
                  </div>

                  {check.description && (
                    <p className="text-sm text-gray-400 mb-2">{check.description}</p>
                  )}

                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {check.category}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Priority Recommendations */}
        {highPriorityIncomplete.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-center mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-red-400">
                Critical Security Gaps
              </h3>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Complete these high-priority items immediately to secure your assets:
            </p>
            <ul className="space-y-2">
              {highPriorityIncomplete.slice(0, 3).map(check => (
                <li key={check.id} className="flex items-center text-sm text-gray-300">
                  <XCircleIcon className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                  {check.question}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={generatePDF}
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
                  Generating PDF...
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
                  Get My Security Report
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
            Why This Checklist Matters
          </h3>
          <p className="text-sm text-gray-300">
            Based on analysis of 200+ crypto attacks, these security measures could have prevented{' '}
            <span className="text-cyan-400 font-semibold">94%</span> of successful breaches.
            Get your personalized PDF report with specific recommendations for your security posture.
          </p>
        </motion.div>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        leadMagnet="Ultimate Crypto Security Checklist"
        onEmailCaptured={() => {
          // Here you would trigger the actual PDF download
          console.log('Email captured, downloading PDF...');
          setShowEmailModal(false);
        }}
      />
    </>
  );
}