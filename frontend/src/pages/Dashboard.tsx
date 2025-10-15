import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  LockClosedIcon,
  XMarkIcon,
  ArrowRightIcon,
  StarIcon,
  BellIcon,
  DocumentTextIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import SurveillanceEye from '../components/SurveillanceEye';
import CyberpunkCard from '../components/CyberpunkCard';
import ThreatFeed from '../components/ThreatFeed';
import GlobalMap from '../components/GlobalMap';
import DarkWebIntelligence from '../components/DarkWebIntelligence';
import BlockchainForensics from '../components/BlockchainForensics';
import RealTimeThreatIntelligence from '../components/RealTimeThreatIntelligence';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import MultiSigWalletManager from '../components/MultiSigWalletManager';
import ZKCompliance from '../components/ZKCompliance';
import QuantumSecurity from '../components/QuantumSecurity';
import SubscriptionTiers from '../components/SubscriptionTiers';
import EnhancedActivityTimeline from '../components/EnhancedActivityTimeline';
import PortfolioPerformance from '../components/PortfolioPerformance';
import NotificationSystem from '../components/NotificationSystem';
import ReferralWidget from '../components/ReferralWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const { data: portfolios } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const { data } = await api.get('/portfolio');
      return data.data;
    },
    enabled: isAuthenticated, // Only run query if authenticated
  });

  const { data: threats } = useQuery({
    queryKey: ['threats', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/threats/stats');
      return data.data;
    },
    enabled: isAuthenticated, // Only run query if authenticated
  });

  const [walletQuery, setWalletQuery] = useState('');
  const [walletData, setWalletData] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [walletError, setWalletError] = useState('');

  const handleWalletSearch = async () => {
    setLoadingWallet(true);
    setWalletError('');
    setWalletData(null);
    try {
      const { data } = await api.post('/forensic-analysis', { stolenTxId: walletQuery });
      setWalletData(data);
    } catch (err: any) {
      setWalletError(err?.response?.data?.message || 'Failed to fetch wallet data');
    } finally {
      setLoadingWallet(false);
    }
  };

  const totalValue = portfolios?.reduce((sum: number, p: any) => sum + Number(p.totalValue), 0) || 0;
  
  // Mock user subscription status - in real app, this would come from user data
  const userSubscription = user?.subscription || 'free';
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  
  const dismissBanner = (bannerId: string) => {
    setDismissedBanners(prev => [...prev, bannerId]);
  };

  // Contextual upsell logic
  const getContextualUpsells = () => {
    const upsells = [];
    
    // High-value portfolio upsell
    if (totalValue > 100000 && userSubscription === 'foundation') {
      upsells.push({
        id: 'guardian-upgrade',
        title: 'Protect Your High-Value Portfolio',
        description: `Your $${totalValue.toLocaleString()} portfolio qualifies for Guardian-level protection`,
        cta: 'Upgrade to Guardian',
        color: 'from-purple-500 to-pink-600',
        icon: ShieldCheckIcon,
        action: () => navigate('/pricing'),
      });
    }
    
    // Tax season upsell
    const isTaxSeason = new Date().getMonth() >= 0 && new Date().getMonth() <= 3; // Jan-Apr
    if (isTaxSeason) {
      upsells.push({
        id: 'tax-report',
        title: 'Tax Season is Here!',
        description: 'Generate your IRS Form 8949 for crypto taxes in minutes',
        cta: 'Generate Tax Report - $99',
        color: 'from-green-500 to-emerald-600',
        icon: DocumentTextIcon,
        action: () => navigate('/services/tax-reports'),
      });
    }
    
    // Threat detected upsell
    if (threats?.activeThreats > 0) {
      upsells.push({
        id: 'expert-recovery',
        title: 'Threats Detected!',
        description: `${threats.activeThreats} active threats found. Get expert assistance`,
        cta: 'Get Expert Help',
        color: 'from-red-500 to-orange-600',
        icon: ExclamationTriangleIcon,
        action: () => navigate('/services/recovery'),
      });
    }
    
    return upsells.filter(upsell => !dismissedBanners.includes(upsell.id));
  };

  const contextualUpsells = getContextualUpsells();

  const stats = [
    {
      name: 'Assets Under Protection',
      value: totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      icon: BriefcaseIcon,
      change: '+12.5%',
      changeType: 'positive',
      glow: 'cyan' as const,
    },
    {
      name: 'Threats Neutralized',
      value: threats?.byStatus?.resolved || 0,
      icon: ShieldCheckIcon,
      change: `${threats?.unresolved || 0} Active`,
      changeType: threats?.unresolved > 5 ? 'negative' : 'positive',
      glow: 'green' as const,
    },
    {
      name: 'Recovery Success Rate',
      value: '94.7%',
      icon: CheckCircleIcon,
      change: 'Industry Leading',
      changeType: 'positive',
      glow: 'purple' as const,
    },
    {
      name: 'Active Portfolios',
      value: portfolios?.length || 0,
      icon: ArrowTrendingUpIcon,
      change: '24/7 Monitoring',
      changeType: 'neutral',
      glow: 'orange' as const,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Subscription Status Banner */}
      {userSubscription === 'free' && !dismissedBanners.includes('subscription-banner') && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">You're on the Free plan</h3>
                <p className="text-blue-100 text-sm">Upgrade to unlock dark web monitoring, advanced analytics, and priority support</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/pricing')}
                className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Plans
              </button>
              <button
                onClick={() => dismissBanner('subscription-banner')}
                className="text-white/70 hover:text-white p-1"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contextual Upsell Cards */}
      {contextualUpsells.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 grid gap-4"
        >
          {contextualUpsells.slice(0, 2).map((upsell, index) => (
            <motion.div
              key={upsell.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-r ${upsell.color} rounded-lg p-4 flex items-center justify-between`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <upsell.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{upsell.title}</h3>
                  <p className="text-white/90 text-sm">{upsell.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={upsell.action}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  {upsell.cta}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => dismissBanner(upsell.id)}
                  className="text-white/70 hover:text-white p-1"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Hero Section with Surveillance Eye */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <CyberpunkCard variant="glass" className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 glitch"
                >
                  VAULTGUARD COMMAND CENTER
                </motion.h1>
                <NotificationSystem />
              </div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-gray-300 mb-6"
              >
                Your assets are under <span className="text-cyan-400 font-bold">24/7 AI-powered surveillance</span>
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 font-mono text-sm">QUANTUM ENCRYPTION ACTIVE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                  <span className="text-cyan-400 font-mono text-sm">NEURAL THREAT DETECTION ONLINE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                  <span className="text-purple-400 font-mono text-sm">BLOCKCHAIN FORENSICS READY</span>
                </div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-96 flex items-center justify-center"
            >
              <SurveillanceEye />
            </motion.div>
          </div>
        </CyberpunkCard>
      </motion.div>

      {/* Subscription Tiers & Usage */}
      <div className="mb-8">
        <SubscriptionTiers currentPlan={userSubscription} />
      </div>

      {/* Wallet Search */}
      <div className="mb-8">
        <CyberpunkCard glowColor="cyan">
          <div className="flex items-center gap-4">
            <EyeIcon className="w-6 h-6 text-cyan-400" />
            <input
              type="text"
              className="input flex-1 bg-black/50 border-cyan-500/30 focus:border-cyan-500"
              placeholder="Enter wallet address for deep forensic analysis..."
              value={walletQuery}
              onChange={e => setWalletQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleWalletSearch()}
            />
            <button
              className="btn-primary px-8"
              onClick={handleWalletSearch}
              disabled={loadingWallet}
            >
              {loadingWallet ? 'ANALYZING...' : 'SCAN'}
            </button>
          </div>
        </CyberpunkCard>
      </div>

      {/* Referral Widget */}
      <div className="mb-8">
        <ReferralWidget />
      </div>

      {walletError && (
        <CyberpunkCard glowColor="orange" className="mb-8">
          <div className="text-orange-400">{walletError}</div>
        </CyberpunkCard>
      )}

      {walletData && (
        <CyberpunkCard glowColor="purple" className="mb-8">
          <h3 className="text-lg font-semibold text-purple-400 mb-4 font-mono">FORENSIC ANALYSIS RESULTS</h3>
          <pre className="bg-black/50 text-cyan-300 p-4 rounded-lg overflow-x-auto text-xs font-mono custom-scrollbar">
            {JSON.stringify(walletData, null, 2)}
          </pre>
        </CyberpunkCard>
      )}

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <CyberpunkCard glowColor={stat.glow}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 font-mono uppercase tracking-wider mb-2">{stat.name}</p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, type: "spring", stiffness: 200 }}
                    className="text-3xl font-semibold text-white mb-2"
                  >
                    {stat.value}
                  </motion.p>
                  <p className={`text-sm font-mono ${
                    stat.changeType === 'positive' ? 'text-green-400' :
                    stat.changeType === 'negative' ? 'text-red-400' :
                    'text-gray-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="w-12 h-12 text-cyan-400 opacity-50" />
                </motion.div>
              </div>
            </CyberpunkCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Portfolio Performance Visualizations */}
      <div className="mb-8">
        <PortfolioPerformance />
      </div>

      {/* Quick Actions and Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="lg:col-span-1"
        >
          <CyberpunkCard glowColor="purple" className="h-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ArrowRightIcon className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/services/recovery')}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white p-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2"
                >
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  Request Expert Consultation
                </button>
                <button
                  onClick={() => navigate('/services/tax-reports')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  Generate Tax Report
                </button>
                <button
                  onClick={() => navigate('/dashboard/portfolio')}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2"
                >
                  <BriefcaseIcon className="w-5 h-5" />
                  Add New Wallet
                </button>
                {userSubscription !== 'sovereign' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white p-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                    Invite Team Member
                  </button>
                )}
              </div>
            </div>
          </CyberpunkCard>
        </motion.div>

        {/* Enhanced Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <EnhancedActivityTimeline />
        </motion.div>
      </div>

      {/* Premium Intelligence Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Dark Web Intelligence */}
        <div>
          <DarkWebIntelligence />
        </div>

        {/* Blockchain Forensics */}
        <div>
          <BlockchainForensics />
        </div>

        {/* Legacy Threat Feed */}
        <div>
          <CyberpunkCard glowColor="cyan" className="h-full">
            <ThreatFeed />
          </CyberpunkCard>
        </div>
      </div>

      {/* Real-Time Threat Intelligence */}
      <div className="mb-8">
        <RealTimeThreatIntelligence />
      </div>

      {/* Advanced Analytics Command Center */}
      <div className="mb-8">
        <AdvancedAnalytics />
      </div>

      {/* Multi-Sig Wallet Management */}
      <div className="mb-8">
        <MultiSigWalletManager />
      </div>

      {/* Zero-Knowledge Compliance */}
      <div className="mb-8">
        <ZKCompliance />
      </div>

      {/* Quantum-Resistant Security */}
      <div className="mb-8">
        <QuantumSecurity />
      </div>

      {/* Global Surveillance Map */}
      <CyberpunkCard glowColor="purple" className="mb-8">
        <div className="h-80">
          <GlobalMap />
        </div>
      {/* Quick Access Services */}
      {user?.role === 'client' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 font-mono">QUICK ACCESS SERVICES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CyberpunkCard glowColor="orange" className="cursor-pointer hover:scale-105 transition-transform">
              <div className="text-center p-4" onClick={() => navigate('/tax-report')}>
                <CheckCircleIcon className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Tax Reports</h3>
                <p className="text-sm text-gray-400">Generate IRS Form 8949 reports</p>
                <div className="mt-3 text-xs text-orange-300 font-mono">$99/report</div>
              </div>
            </CyberpunkCard>

            <CyberpunkCard glowColor="purple" className="cursor-pointer hover:scale-105 transition-transform">
              <div className="text-center p-4" onClick={() => navigate('/expert-recovery')}>
                <ShieldCheckIcon className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Expert Recovery</h3>
                <p className="text-sm text-gray-400">Asset recovery operations</p>
                <div className="mt-3 text-xs text-purple-300 font-mono">Case-by-case</div>
              </div>
            </CyberpunkCard>

            <CyberpunkCard glowColor="green" className="cursor-pointer hover:scale-105 transition-transform">
              <div className="text-center p-4" onClick={() => navigate('/compliance')}>
                <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Compliance Hub</h3>
                <p className="text-sm text-gray-400">KYC/AML management</p>
                <div className="mt-3 text-xs text-green-300 font-mono">Included</div>
              </div>
            </CyberpunkCard>

            <CyberpunkCard glowColor="cyan" className="cursor-pointer hover:scale-105 transition-transform">
              <div className="text-center p-4" onClick={() => navigate('/scan')}>
                <ArrowTrendingUpIcon className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Security Scan</h3>
                <p className="text-sm text-gray-400">Malware detection</p>
                <div className="mt-3 text-xs text-cyan-300 font-mono">Free</div>
              </div>
            </CyberpunkCard>
          </div>
        </div>
      )}
      </CyberpunkCard>

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CyberpunkCard glowColor="green" variant="glass">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-400 mb-2">$2.4B+</div>
            <div className="text-sm text-gray-400 font-mono">ASSETS RECOVERED</div>
          </div>
        </CyberpunkCard>
        <CyberpunkCard glowColor="cyan" variant="glass">
          <div className="text-center">
            <div className="text-5xl font-bold text-cyan-400 mb-2">10,000+</div>
            <div className="text-sm text-gray-400 font-mono">THREATS BLOCKED</div>
          </div>
        </CyberpunkCard>
        <CyberpunkCard glowColor="purple" variant="glass">
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-400 mb-2">99.9%</div>
            <div className="text-sm text-gray-400 font-mono">UPTIME GUARANTEE</div>
          </div>
        </CyberpunkCard>
      </div>
    </div>
  );
}
