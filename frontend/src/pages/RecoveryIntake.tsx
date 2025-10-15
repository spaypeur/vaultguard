import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';

interface CaseDetails {
  amountStolen: string;
  attackType: string;
  blockchainsInvolved: string[];
  timeline: string;
  description: string;
  txHashes: string;
  evidence: File[];
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
}

export default function RecoveryIntake() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    amountStolen: '',
    attackType: '',
    blockchainsInvolved: [],
    timeline: '',
    description: '',
    txHashes: '',
    evidence: [],
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      urgency: 'medium',
    },
  });

  const attackTypes = [
    'Phishing Attack',
    'Exchange Hack',
    'Wallet Compromise',
    'Smart Contract Exploit',
    'SIM Swap',
    'Social Engineering',
    'Malware/Keylogger',
    'Rug Pull/Exit Scam',
    'Romance Scam',
    'Investment Fraud',
    'Other',
  ];

  const blockchains = [
    'Bitcoin (BTC)',
    'Ethereum (ETH)',
    'Binance Smart Chain (BSC)',
    'Polygon (MATIC)',
    'Solana (SOL)',
    'Avalanche (AVAX)',
    'Cardano (ADA)',
    'Polkadot (DOT)',
    'Chainlink (LINK)',
    'Litecoin (LTC)',
    'Other',
  ];

  const timelineOptions = [
    'Less than 24 hours ago',
    '1-7 days ago',
    '1-4 weeks ago',
    '1-3 months ago',
    '3-6 months ago',
    'More than 6 months ago',
  ];

  const calculateEstimatedCost = () => {
    const amount = parseFloat(caseDetails.amountStolen.replace(/[^0-9.]/g, ''));
    if (amount < 10000) return { min: 5000, max: 15000 };
    if (amount < 100000) return { min: 10000, max: 25000 };
    if (amount < 1000000) return { min: 20000, max: 40000 };
    return { min: 30000, max: 50000 };
  };

  const calculateSuccessFee = () => {
    const amount = parseFloat(caseDetails.amountStolen.replace(/[^0-9.]/g, ''));
    if (amount < 100000) return 20;
    if (amount < 1000000) return 15;
    return 10;
  };

  const handleSubmit = async () => {
    // Here you would submit to your backend
    console.log('Submitting case:', caseDetails);
    // Navigate to confirmation or dashboard
    navigate('/dashboard/expert-recovery');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Case Overview</h3>
            
            <div>
              <label className="block text-white font-semibold mb-2">
                Amount Stolen (USD) *
              </label>
              <input
                type="text"
                value={caseDetails.amountStolen}
                onChange={(e) => setCaseDetails({...caseDetails, amountStolen: e.target.value})}
                placeholder="$50,000"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Type of Attack *
              </label>
              <select
                value={caseDetails.attackType}
                onChange={(e) => setCaseDetails({...caseDetails, attackType: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="">Select attack type...</option>
                {attackTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                When did this occur? *
              </label>
              <select
                value={caseDetails.timeline}
                onChange={(e) => setCaseDetails({...caseDetails, timeline: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="">Select timeline...</option>
                {timelineOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Blockchain(s) Involved *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {blockchains.map((blockchain) => (
                  <label key={blockchain} className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={caseDetails.blockchainsInvolved.includes(blockchain)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCaseDetails({
                            ...caseDetails,
                            blockchainsInvolved: [...caseDetails.blockchainsInvolved, blockchain]
                          });
                        } else {
                          setCaseDetails({
                            ...caseDetails,
                            blockchainsInvolved: caseDetails.blockchainsInvolved.filter(b => b !== blockchain)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{blockchain}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Case Details & Evidence</h3>
            
            <div>
              <label className="block text-white font-semibold mb-2">
                Detailed Description *
              </label>
              <textarea
                value={caseDetails.description}
                onChange={(e) => setCaseDetails({...caseDetails, description: e.target.value})}
                placeholder="Please provide a detailed description of what happened, including any relevant context, how you discovered the theft, and any actions you've already taken..."
                rows={6}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Transaction Hashes (if known)
              </label>
              <textarea
                value={caseDetails.txHashes}
                onChange={(e) => setCaseDetails({...caseDetails, txHashes: e.target.value})}
                placeholder="Enter transaction hashes, one per line..."
                rows={4}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Evidence Files
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setCaseDetails({...caseDetails, evidence: files});
                  }}
                  className="hidden"
                  id="evidence-upload"
                />
                <label htmlFor="evidence-upload" className="cursor-pointer">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">
                    Click to upload screenshots, emails, or other evidence
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Supported: PDF, PNG, JPG, TXT (Max 10MB each)
                  </p>
                </label>
                {caseDetails.evidence.length > 0 && (
                  <div className="mt-4">
                    <p className="text-green-400">{caseDetails.evidence.length} file(s) selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={caseDetails.contactInfo.name}
                  onChange={(e) => setCaseDetails({
                    ...caseDetails,
                    contactInfo: {...caseDetails.contactInfo, name: e.target.value}
                  })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={caseDetails.contactInfo.email}
                  onChange={(e) => setCaseDetails({
                    ...caseDetails,
                    contactInfo: {...caseDetails.contactInfo, email: e.target.value}
                  })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={caseDetails.contactInfo.phone}
                onChange={(e) => setCaseDetails({
                  ...caseDetails,
                  contactInfo: {...caseDetails.contactInfo, phone: e.target.value}
                })}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Case Urgency
              </label>
              <select
                value={caseDetails.contactInfo.urgency}
                onChange={(e) => setCaseDetails({
                  ...caseDetails,
                  contactInfo: {...caseDetails.contactInfo, urgency: e.target.value as any}
                })}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              >
                <option value="low">Low - No immediate threat</option>
                <option value="medium">Medium - Standard priority</option>
                <option value="high">High - Funds still moving</option>
                <option value="critical">Critical - Active theft in progress</option>
              </select>
            </div>
          </div>
        );

      case 4:
        const estimatedCost = calculateEstimatedCost();
        const successFee = calculateSuccessFee();
        
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Pricing & Next Steps</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <CyberpunkCard className="p-6">
                <h4 className="text-xl font-semibold text-cyan-400 mb-4">Investigation Costs</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Initial Consultation:</span>
                    <span className="text-white font-semibold">$500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Investigation Fee:</span>
                    <span className="text-white font-semibold">
                      ${estimatedCost.min.toLocaleString()} - ${estimatedCost.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Success Fee:</span>
                    <span className="text-white font-semibold">{successFee}% of recovered funds</span>
                  </div>
                </div>
              </CyberpunkCard>

              <CyberpunkCard className="p-6">
                <h4 className="text-xl font-semibold text-green-400 mb-4">Success Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Recovery Success Rate:</span>
                    <span className="text-green-400 font-semibold">94.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Average Case Duration:</span>
                    <span className="text-white font-semibold">14-30 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">No Recovery Policy:</span>
                    <span className="text-green-400 font-semibold">No success fee</span>
                  </div>
                </div>
              </CyberpunkCard>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-yellow-400 font-semibold mb-1">Time is Critical</h5>
                  <p className="text-gray-300 text-sm">
                    Cryptocurrency theft investigations are most successful when initiated quickly. 
                    Funds can be moved rapidly across multiple blockchains and exchanges.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/30 border border-blue-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <PhoneIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-blue-400 font-semibold mb-1">24/7 Emergency Response</h5>
                  <p className="text-gray-300 text-sm mb-2">
                    For critical cases with active theft in progress:
                  </p>
                  <p className="text-white font-semibold">+1-555-RECOVER (1-555-732-6837)</p>
                  <p className="text-gray-400 text-xs">Average response time: 2 hours</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h5 className="text-white font-semibold mb-2">What happens next?</h5>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2 text-black font-bold">1</div>
                  <p className="text-gray-300">Case Review</p>
                  <p className="text-gray-500 text-xs">Within 2 hours</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2 text-black font-bold">2</div>
                  <p className="text-gray-300">Investigation</p>
                  <p className="text-gray-500 text-xs">Dark web & blockchain analysis</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2 text-black font-bold">3</div>
                  <p className="text-gray-300">Recovery Operation</p>
                  <p className="text-gray-500 text-xs">Exchange & law enforcement coordination</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 text-black font-bold">4</div>
                  <p className="text-gray-300">Funds Returned</p>
                  <p className="text-gray-500 text-xs">Success fee applies</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-600 text-transparent bg-clip-text mb-6">
              Lost Crypto? I'll Find It.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              20+ years tracking hackers across the dark web. 94.7% success rate.
            </p>
            
            {/* Urgency Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-red-400" />
                <span>Time is critical - funds move fast</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 text-blue-400" />
                <span>Average response time: 2 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-green-400" />
                <span>94.7% recovery success rate</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= stepNumber
                        ? 'bg-cyan-500 text-black'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div
                      className={`w-16 h-1 ${
                        step > stepNumber ? 'bg-cyan-500' : 'bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <CyberpunkCard className="p-8">
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-all duration-300"
              >
                Previous
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2"
                >
                  <ShieldExclamationIcon className="w-5 h-5" />
                  Submit Case for Review
                </button>
              )}
            </div>
          </CyberpunkCard>

          {/* Emergency Contact */}
          <div className="mt-8 text-center">
            <div className="bg-red-900/30 border border-red-400 rounded-lg p-6">
              <h3 className="text-red-400 font-bold text-xl mb-2">
                🚨 EMERGENCY: Active Theft in Progress?
              </h3>
              <p className="text-gray-300 mb-4">
                If funds are currently being stolen or moved, call immediately:
              </p>
              <a
                href="tel:+15557326837"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-all duration-300"
              >
                <PhoneIcon className="w-5 h-5" />
                +1-555-RECOVER (732-6837)
              </a>
              <p className="text-gray-400 text-sm mt-2">
                24/7 emergency hotline - Average response: 2 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}