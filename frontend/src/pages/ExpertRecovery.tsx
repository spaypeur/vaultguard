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
  ArrowRightIcon,
  StarIcon,
  UserIcon,
  CalendarIcon,
  TrophyIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';
import RecoveryTestimonials from '../components/RecoveryTestimonials';
import ClientLogosCarousel from '../components/ClientLogosCarousel';
import ROICalculator from '../components/ROICalculator';
import ComplianceBadges from '../components/ComplianceBadges';
import api from '../services/api';

export default function ExpertRecovery() {
  const navigate = useNavigate();
  const [targets, setTargets] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [opsec, setOpsec] = useState<'private' | 'shared'>('private');
  const [newTarget, setNewTarget] = useState({ label: '', description: '' });
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'playbook' | 'evidence'>('playbook');
  const [showPricingCalculator, setShowPricingCalculator] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState('');

  // Fetch data (simulate, or use useEffect+api in production)
  const fetchAll = async () => {
    const { data: t } = await api.get(`/expert-recovery/targets?opsec=${opsec}`);
    setTargets(t);
    if (selectedTarget) {
      const { data: e } = await api.get(`/expert-recovery/evidence?targetId=${selectedTarget.id}&opsec=${opsec}`);
      setEvidence(e);
    }
    const { data: p } = await api.get(`/expert-recovery/playbooks?opsec=${opsec}`);
    setPlaybooks(p);
  };

  // Target management
  const createTarget = async () => {
    const { data } = await api.post('/expert-recovery/targets', { ...newTarget, opsec });
    setTargets([...targets, data]);
    setNewTarget({ label: '', description: '' });
  };
  const addNote = async (targetId: string) => {
    await api.post(`/expert-recovery/targets/${targetId}/notes`, { note });
    setNote('');
    fetchAll();
  };

  // File upload
  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('opsec', opsec);
    if (fileType === 'playbook') {
      formData.append('name', file.name);
      formData.append('description', '');
      await api.post('/expert-recovery/playbooks', formData);
    } else {
      formData.append('targetId', selectedTarget?.id || '');
      await api.post('/expert-recovery/evidence', formData);
    }
    setFile(null);
    fetchAll();
  };

  const calculateEstimatedCost = () => {
    const amount = parseFloat(estimatedAmount.replace(/[^0-9.]/g, ''));
    if (amount < 10000) return { min: 5000, max: 15000 };
    if (amount < 100000) return { min: 10000, max: 25000 };
    if (amount < 1000000) return { min: 20000, max: 40000 };
    return { min: 30000, max: 50000 };
  };

  const calculateSuccessFee = () => {
    const amount = parseFloat(estimatedAmount.replace(/[^0-9.]/g, ''));
    if (amount < 100000) return 20;
    if (amount < 1000000) return 15;
    return 10;
  };

  const successStories = [
    {
      title: 'DeFi Protocol Exploit Recovery',
      amount: '$2.4M',
      timeframe: '18 days',
      description: 'Recovered funds from a complex smart contract exploit involving multiple DEX protocols.',
      client: 'DeFi Investment Fund',
    },
    {
      title: 'Exchange Hack Investigation',
      amount: '$1.8M',
      timeframe: '12 days',
      description: 'Traced stolen Bitcoin through multiple mixers and recovered 85% of funds.',
      client: 'Crypto Exchange',
    },
    {
      title: 'Romance Scam Recovery',
      amount: '$850K',
      timeframe: '21 days',
      description: 'Recovered cryptocurrency sent to romance scammer through international coordination.',
      client: 'Private Individual',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-purple-900">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-purple-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Main Content */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Urgency Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 bg-red-900/30 border border-red-400/50 text-red-400 px-4 py-2 rounded-full mb-6"
              >
                <BoltIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">Emergency Response Available 24/7</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 text-transparent bg-clip-text">
                  Lost Crypto?
                </span>
                <br />
                <span className="text-white">I'll Find It.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                <strong className="text-white">20+ years</strong> tracking hackers across the dark web.
                <br />
                <strong className="text-green-400">94.7% success rate</strong>.
                <span className="text-orange-400"> No recovery, no success fee.</span>
              </p>

              {/* Enhanced Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-4 mb-8"
              >
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">94.7%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">2 hrs</div>
                  <div className="text-sm text-gray-400">Avg Response</div>
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">$47M+</div>
                  <div className="text-sm text-gray-400">Recovered</div>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/services/recovery')}
                  className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-red-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/25"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Start Recovery Process
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPricingCalculator(true)}
                  className="border-2 border-orange-400 text-orange-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-400 hover:text-black transition-all duration-300 flex items-center gap-2"
                >
                  <CurrencyDollarIcon className="w-5 h-5" />
                  Calculate ROI
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-400"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                  <span>FinCEN Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-5 h-5 text-blue-400" />
                  <span>24/7 Emergency Hotline</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                  <span>$50M Insurance Coverage</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Interactive Calculator Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:text-right text-center"
            >
              <ROICalculator variant="modal" defaultAmount="$100,000" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Process Visualization */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              How I Recover Your Stolen Crypto
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              A proven 4-step process with <span className="text-green-400 font-semibold">94.7% success rate</span>
            </motion.p>

            {/* Process Success Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-6 bg-gray-800/50 rounded-full px-8 py-4 border border-gray-700"
            >
              <div className="flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">500+ Successful Recoveries</span>
              </div>
              <div className="w-px h-6 bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold">Avg: 14-30 Days</span>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Submit Case Details',
                description: 'Provide transaction hashes, attack details, and evidence through our secure intake form',
                icon: DocumentTextIcon,
                color: 'from-blue-500 to-cyan-600',
                time: 'Within 2 hours',
                features: ['Secure encrypted form', 'Evidence upload', 'Case prioritization'],
                success: '100% case review rate'
              },
              {
                step: 2,
                title: 'Advanced Investigation',
                description: 'Dark web monitoring, blockchain analysis, and hacker identification using cutting-edge forensics',
                icon: ShieldExclamationIcon,
                color: 'from-purple-500 to-pink-600',
                time: '1-7 days',
                features: ['Dark web intelligence', 'Blockchain tracing', 'Threat actor identification'],
                success: '94.7% identification rate'
              },
              {
                step: 3,
                title: 'Recovery Operation',
                description: 'Coordinate with exchanges, law enforcement, and use strategic pressure to freeze and recover funds',
                icon: LockClosedIcon,
                color: 'from-orange-500 to-red-600',
                time: '7-21 days',
                features: ['Exchange coordination', 'Legal partnerships', 'Asset freezing'],
                success: '85% average recovery rate'
              },
              {
                step: 4,
                title: 'Funds Returned',
                description: 'Recovered cryptocurrency returned to your wallet minus success fee (only if successful)',
                icon: CheckCircleIcon,
                color: 'from-green-500 to-emerald-600',
                time: 'Final step',
                features: ['Secure transfer', 'Success fee deduction', 'Case closure'],
                success: 'No success, no fee'
              },
            ].map((process, index) => (
              <motion.div
                key={process.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <CyberpunkCard className="p-6 text-center h-full hover:border-cyan-400/50 transition-all duration-300">
                  {/* Enhanced Icon with Animation */}
                  <motion.div
                    className={`w-20 h-20 bg-gradient-to-r ${process.color} rounded-full flex items-center justify-center mx-auto mb-6 relative overflow-hidden`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <process.icon className="w-10 h-10 text-white" />

                    {/* Pulse Effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    />
                  </motion.div>

                  {/* Step Number */}
                  <motion.div
                    className="text-3xl font-bold text-cyan-400 mb-3"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {process.step}
                  </motion.div>

                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                    {process.title}
                  </h3>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {process.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <div className="space-y-2">
                      {process.features.map((feature, fIndex) => (
                        <motion.div
                          key={fIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 + fIndex * 0.1 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                          <span className="text-gray-400">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <motion.div
                    className="text-sm text-cyan-400 font-semibold mb-3"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    {process.time}
                  </motion.div>

                  {/* Success Rate */}
                  <motion.div
                    className="text-xs text-green-400 font-medium bg-green-900/20 rounded-full px-3 py-1 inline-block"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.1 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {process.success}
                  </motion.div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>

          {/* Process Flow Connector */}
          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="flex items-center gap-4 text-gray-500">
              <span className="text-sm">Case Intake</span>
              <div className="flex items-center gap-2">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <span className="text-sm">Funds Recovery</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Testimonials and Case Studies */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecoveryTestimonials variant="detailed" showCaseStudies={true} showVideoTestimonials={true} />
        </div>
      </section>

      {/* Client Logos and Trust Indicators */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ClientLogosCarousel variant="detailed" autoplay={true} showDetails={true} />
        </div>
      </section>

      {/* Enhanced Pricing Calculator Modal */}
      {showPricingCalculator && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <ROICalculator
                variant="modal"
                defaultAmount={estimatedAmount}
                onCalculate={(data) => {
                  console.log('ROI Data:', data);
                }}
              />
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setShowPricingCalculator(false);
                    navigate('/services/recovery');
                  }}
                  className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Start Recovery Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      <section className="py-20 bg-gradient-to-r from-red-900 to-orange-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            className="bg-red-900/30 border border-red-400 rounded-lg p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl font-bold text-red-400 mb-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              🚨 EMERGENCY: Active Theft in Progress?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-200 mb-8"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              If funds are currently being stolen or moved, call immediately for emergency response
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.a
                href="tel:+15557326837"
                className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-600/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneIcon className="w-6 h-6" />
                +1-555-RECOVER (732-6837)
              </motion.a>
              <div className="text-center">
                <div className="text-white font-semibold">24/7 Emergency Hotline</div>
                <div className="text-gray-300 text-sm">Average response: 2 hours</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Compliance and Legal Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ComplianceBadges variant="detailed" showDisclaimers={true} />
        </div>
      </section>

      {/* Legacy Expert Operations (for existing functionality) */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Expert Operations Dashboard
            </h2>
            <p className="text-xl text-gray-300">
              Advanced tools for ongoing recovery operations
            </p>
          </motion.div>

          <div className="mb-6 flex gap-4 justify-center">
            <button 
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                opsec === 'private' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`} 
              onClick={() => setOpsec('private')}
            >
              Private Operations
            </button>
            <button 
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                opsec === 'shared' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`} 
              onClick={() => setOpsec('shared')}
            >
              Shared Intelligence
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Target Management */}
            <CyberpunkCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Active Targets</h3>
              <div className="space-y-3 mb-4">
                <input 
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none" 
                  placeholder="Target Label" 
                  value={newTarget.label} 
                  onChange={e => setNewTarget({ ...newTarget, label: e.target.value })} 
                />
                <input 
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none" 
                  placeholder="Description" 
                  value={newTarget.description} 
                  onChange={e => setNewTarget({ ...newTarget, description: e.target.value })} 
                />
                <button 
                  className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors" 
                  onClick={createTarget}
                >
                  Add Target
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {targets.map(t => (
                  <div 
                    key={t.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTarget?.id === t.id ? 'bg-cyan-900/50 border border-cyan-400' : 'bg-gray-800/50 hover:bg-gray-700/50'
                    }`} 
                    onClick={() => setSelectedTarget(t)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{t.label}</span>
                      <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{t.status}</span>
                    </div>
                    <div className="text-gray-300 text-sm mt-1">{t.description}</div>
                  </div>
                ))}
              </div>
            </CyberpunkCard>

            {/* Playbooks & Evidence */}
            <CyberpunkCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Playbooks & Evidence</h3>
              <div className="space-y-4">
                <div>
                  <input 
                    type="file" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                  />
                  <div className="flex gap-2 mt-2">
                    <button 
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors" 
                      onClick={() => { setFileType('playbook'); uploadFile(); }}
                    >
                      Upload Playbook
                    </button>
                    <button 
                      className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors" 
                      onClick={() => { setFileType('evidence'); uploadFile(); }}
                    >
                      Upload Evidence
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {playbooks.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                      <span className="text-gray-300 text-sm">{p.name}</span>
                      <a 
                        className="text-cyan-400 hover:text-cyan-300 text-xs underline" 
                        href={`/api/expert-recovery/playbooks/${p.id}/download`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </CyberpunkCard>

            {/* Target Details & Notes */}
            <CyberpunkCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {selectedTarget ? 'Target Details' : 'Select a Target'}
              </h3>
              {selectedTarget ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-800/30 rounded-lg">
                    <div className="text-white font-semibold">{selectedTarget.label}</div>
                    <div className="text-gray-300 text-sm">{selectedTarget.description}</div>
                  </div>
                  
                  <div>
                    <input 
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none mb-2" 
                      placeholder="Add investigation note..." 
                      value={note} 
                      onChange={e => setNote(e.target.value)} 
                    />
                    <button 
                      className="w-full bg-cyan-600 text-white py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors" 
                      onClick={() => addNote(selectedTarget.id)}
                    >
                      Add Note
                    </button>
                  </div>
                  
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedTarget.notes?.map((n: string, idx: number) => (
                      <div key={idx} className="text-xs text-gray-400 p-2 bg-gray-800/20 rounded">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a target to view details and add investigation notes</p>
                </div>
              )}
            </CyberpunkCard>
          </div>

          {/* Audit Log */}
          <div className="mt-8">
            <CyberpunkCard className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LockClosedIcon className="w-5 h-5 text-green-400" />
                Secure Audit Log
              </h3>
              <p className="text-gray-400">
                All expert recovery actions are logged and encrypted for OPSEC compliance and legal review. 
                This ensures complete transparency and accountability throughout the recovery process.
              </p>
            </CyberpunkCard>
          </div>
        </div>
      </section>
    </div>
  );
}
