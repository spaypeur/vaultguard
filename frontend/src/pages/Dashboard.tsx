import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import SurveillanceEye from '../components/SurveillanceEye';
import CyberpunkCard from '../components/CyberpunkCard';
import ThreatFeed from '../components/ThreatFeed';
import GlobalMap from '../components/GlobalMap';

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
      {/* Hero Section with Surveillance Eye */}
      <div className="mb-12">
        <CyberpunkCard variant="glass" className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4 glitch">
                VAULTGUARD COMMAND CENTER
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Your assets are under <span className="text-cyan-400 font-bold">24/7 AI-powered surveillance</span>
              </p>
              <div className="space-y-3">
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
              </div>
            </div>
            <div className="h-96 flex items-center justify-center">
              <SurveillanceEye />
            </div>
          </div>
        </CyberpunkCard>
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <CyberpunkCard key={stat.name} glowColor={stat.glow}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 font-mono uppercase tracking-wider">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{stat.value}</p>
                <p className={`mt-2 text-sm font-mono ${
                  stat.changeType === 'positive' ? 'text-green-400' :
                  stat.changeType === 'negative' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
              <stat.icon className="w-12 h-12 text-cyan-400 opacity-50" />
            </div>
          </CyberpunkCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Threat Feed */}
        <div className="lg:col-span-2">
          <CyberpunkCard glowColor="cyan" className="h-full">
            <ThreatFeed />
          </CyberpunkCard>
        </div>

        {/* Recent Threats */}
        <div>
          <CyberpunkCard glowColor="orange">
            <h3 className="text-lg font-semibold text-orange-400 mb-4 font-mono uppercase tracking-wider">
              Recent Threats
            </h3>
            <div className="space-y-3">
              {threats?.recent?.slice(0, 5).map((threat: any) => (
                <div key={threat.id} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-white">{threat.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{new Date(threat.detectedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded font-mono ${
                    threat.severity === 'critical' ? 'bg-red-900 text-red-200' :
                    threat.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                    threat.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-green-900 text-green-200'
                  }`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-8 font-mono">No threats detected</p>
              )}
            </div>
          </CyberpunkCard>
        </div>
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
