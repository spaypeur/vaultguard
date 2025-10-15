import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  GiftIcon,
  UserPlusIcon,
  TrophyIcon,
  ShareIcon,
  QrCodeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import CyberpunkCard from './CyberpunkCard';
import api from '../services/api';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  currentRank?: number;
}

export default function ReferralWidget() {
  const { user } = useAuthStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Fetch referral statistics
  const { data: referralStats, isLoading } = useQuery({
    queryKey: ['referrals', 'stats'],
    queryFn: async (): Promise<ReferralStats> => {
      const { data } = await api.get('/referrals/stats');
      return data.data;
    },
    enabled: !!user,
  });

  // Mock current referral code and link - in real app these would come from API
  const referralCode = 'VAULTGUARD2024';
  const referralLink = `https://vaultguard.com/register?ref=${referralCode}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show toast notification
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <CyberpunkCard glowColor="purple">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </CyberpunkCard>
    );
  }

  return (
    <>
      <CyberpunkCard glowColor="purple" className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-pink-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]"></div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <GiftIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Referral Program</h3>
                <p className="text-sm text-gray-400">Earn rewards by inviting friends</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                title="Share Referral"
              >
                <ShareIcon className="w-4 h-4 text-blue-400" />
              </button>
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                title="Show QR Code"
              >
                <QrCodeIcon className="w-4 h-4 text-green-400" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <UsersIcon className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400 font-mono">TOTAL REFERRALS</span>
              </div>
              <div className="text-xl font-bold text-white">
                {referralStats?.totalReferrals || 0}
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400 font-mono">CONVERSIONS</span>
              </div>
              <div className="text-xl font-bold text-white">
                {referralStats?.completedReferrals || 0}
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <CurrencyDollarIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400 font-mono">EARNINGS</span>
              </div>
              <div className="text-xl font-bold text-white">
                ${referralStats?.totalEarnings?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrophyIcon className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400 font-mono">RANK</span>
              </div>
              <div className="text-xl font-bold text-white">
                #{referralStats?.currentRank || '-'}
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono text-purple-300">Your Referral Code:</span>
              <button
                onClick={() => copyToClipboard(referralCode)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
              >
                COPY
              </button>
            </div>
            <div className="font-mono text-lg text-white bg-black/50 rounded px-3 py-2 border border-gray-600">
              {referralCode}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 flex gap-2">
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
              <UserPlusIcon className="w-4 h-4" />
              Invite Friends
            </button>
            <button className="px-4 py-2 border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" />
              View Stats
            </button>
          </div>
        </div>
      </CyberpunkCard>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Share Referral</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Referral Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="flex-1 bg-black/50 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 bg-black/50 border border-gray-600 rounded px-3 py-2 text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold">
                  <ShareIcon className="w-4 h-4" />
                  Twitter
                </button>
                <button className="flex items-center justify-center gap-2 p-2 bg-blue-800 hover:bg-blue-900 text-white rounded text-sm font-semibold">
                  Facebook
                </button>
                <button className="flex items-center justify-center gap-2 p-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-sm font-semibold">
                  LinkedIn
                </button>
                <button className="flex items-center justify-center gap-2 p-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold">
                  WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg p-6 max-w-sm w-full border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                {/* QR Code placeholder - in real app this would be generated */}
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                  <QrCodeIcon className="w-24 h-24 text-gray-400" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Share this QR code with friends to easily share your referral link
              </p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold">
                Download QR Code
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}