import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CpuChipIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BellIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { paymentAPI } from '../services/api';

interface SubscriptionTiersProps {
  currentPlan?: string;
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({ currentPlan = 'free' }) => {
  const { user } = useAuthStore();
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [supportedCrypto, setSupportedCrypto] = useState<any[]>([]);
  const [isLoadingPaymentInfo, setIsLoadingPaymentInfo] = useState(true);

  // Mock usage data - in real app, this would come from API
  const usageData = {
    walletScans: { used: 5, limit: 10 },
    apiCalls: { used: 150, limit: 1000 },
    reports: { used: 2, limit: 5 },
    teamMembers: { used: 1, limit: 1 },
  };

  // Mock subscription expiry
  const subscriptionExpiry = new Date('2024-12-31');
  const daysUntilExpiry = Math.ceil((subscriptionExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const tiers = [
    {
      name: 'Foundation',
      price: '$99',
      period: '/month',
      description: 'Essential protection for individual portfolios',
      color: 'from-blue-500 to-cyan-600',
      features: [
        { name: 'Wallet Monitoring', included: true, limit: '10 wallets' },
        { name: 'Basic Threat Detection', included: true, limit: 'Standard' },
        { name: 'Email Support', included: true, limit: '48h response' },
        { name: 'Basic Reports', included: true, limit: 'Monthly' },
        { name: 'API Access', included: true, limit: '1,000 calls/month' },
        { name: 'Dark Web Monitoring', included: false },
        { name: 'Advanced Analytics', included: false },
        { name: 'Priority Support', included: false },
        { name: 'Custom Integrations', included: false },
        { name: 'Team Management', included: false },
      ],
    },
    {
      name: 'Guardian',
      price: '$299',
      period: '/month',
      description: 'Advanced protection for high-value portfolios',
      color: 'from-purple-500 to-pink-600',
      popular: true,
      features: [
        { name: 'Wallet Monitoring', included: true, limit: '50 wallets' },
        { name: 'Basic Threat Detection', included: true, limit: 'Advanced' },
        { name: 'Email Support', included: true, limit: '24h response' },
        { name: 'Basic Reports', included: true, limit: 'Weekly' },
        { name: 'API Access', included: true, limit: '10,000 calls/month' },
        { name: 'Dark Web Monitoring', included: true, limit: 'Basic' },
        { name: 'Advanced Analytics', included: true, limit: 'Standard' },
        { name: 'Priority Support', included: true },
        { name: 'Custom Integrations', included: false },
        { name: 'Team Management', included: false },
      ],
    },
    {
      name: 'Sovereign',
      price: '$999',
      period: '/month',
      description: 'Maximum protection for institutional clients',
      color: 'from-amber-500 to-orange-600',
      features: [
        { name: 'Wallet Monitoring', included: true, limit: 'Unlimited' },
        { name: 'Basic Threat Detection', included: true, limit: 'Quantum-resistant' },
        { name: 'Email Support', included: true, limit: '1h response' },
        { name: 'Basic Reports', included: true, limit: 'Real-time' },
        { name: 'API Access', included: true, limit: 'Unlimited' },
        { name: 'Dark Web Monitoring', included: true, limit: 'Advanced' },
        { name: 'Advanced Analytics', included: true, limit: 'Premium' },
        { name: 'Priority Support', included: true, limit: 'Dedicated manager' },
        { name: 'Custom Integrations', included: true },
        { name: 'Team Management', included: true, limit: 'Unlimited' },
      ],
    },
  ];

  const currentTier = tiers.find(tier => tier.name.toLowerCase() === currentPlan) || tiers[0];

  // Load payment information on component mount
  useEffect(() => {
    const loadPaymentInfo = async () => {
      try {
        setIsLoadingPaymentInfo(true);
        const paymentInfo = await paymentAPI.getPaymentInfo();
        if (paymentInfo.success) {
          setSupportedCrypto(paymentInfo.data.supportedCrypto || []);
        }
      } catch (error) {
        console.error('Failed to load payment info:', error);
      } finally {
        setIsLoadingPaymentInfo(false);
      }
    };

    if (user) {
      loadPaymentInfo();
    }
  }, [user]);

  // Handle payment processing
  const handlePayment = async (planId: string, paymentMethod: 'btcpay' | 'stripe' = 'btcpay') => {
    if (!user) {
      setPaymentError('Please log in to make a payment');
      return;
    }

    try {
      setIsProcessingPayment(planId);
      setPaymentError(null);
      setPaymentSuccess(null);

      const response = await paymentAPI.createPaymentSession(planId, paymentMethod);

      if (response.success) {
        // Show success toast
        toast.success('Redirecting to payment...');

        // Redirect to BTCPay Server checkout
        if (response.data.url) {
          setTimeout(() => {
            window.location.href = response.data.url;
          }, 1500); // Give user time to see the toast
        } else {
          throw new Error('No checkout URL received');
        }
      } else {
        throw new Error(response.error || 'Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Payment error:', error);

      const errorMessage = error.message || 'Failed to process payment. Please try again.';
      setPaymentError(errorMessage);

      // Show error toast
      toast.error(errorMessage);

      // Show specific error messages for common issues
      if (error.message?.includes('network') || error.message?.includes('timeout')) {
        toast('Please check your internet connection and try again.', {
          icon: '🌐',
          duration: 4000,
        });
      } else if (error.message?.includes('unauthorized') || error.message?.includes('login')) {
        toast('Please log in to make a payment.', {
          icon: '🔐',
          duration: 4000,
        });
      }
    } finally {
      setIsProcessingPayment(null);
    }
  };

  // Handle subscription renewal/upgrade
  const handleSubscriptionAction = async (targetPlan: string) => {
    if (currentPlan === 'free' || targetPlan !== currentPlan) {
      await handlePayment(targetPlan.toLowerCase());
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Current Plan: {currentTier.name}</h2>
            <p className="text-gray-400">{currentTier.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              {currentTier.price}
              <span className="text-sm text-gray-400">{currentTier.period}</span>
            </div>
            {currentPlan !== 'free' && daysUntilExpiry <= 30 && (
              <div className="flex items-center gap-2 mt-2 text-orange-400">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="text-sm">Expires in {daysUntilExpiry} days</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Usage Meters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-cyan-400" />
          Usage This Month
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(usageData).map(([key, data]) => {
            const percentage = (data.used / data.limit) * 100;
            const isNearLimit = percentage > 80;

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`text-sm font-mono ${isNearLimit ? 'text-orange-400' : 'text-gray-400'}`}>
                    {data.used}/{data.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2 rounded-full ${isNearLimit ? 'bg-orange-400' : 'bg-cyan-400'}`}
                  />
                </div>
                {isNearLimit && (
                  <div className="text-xs text-orange-400">
                    {percentage > 100 ? 'Limit exceeded' : 'Approaching limit'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Feature Comparison Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          {showComparison ? 'Hide' : 'Show'} Feature Comparison
          <ArrowRightIcon className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-90' : ''}`} />
        </button>
      </motion.div>

      {/* Feature Comparison Matrix */}
      {showComparison && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-mono text-sm">Feature</th>
                    {tiers.map((tier) => (
                      <th key={tier.name} className="p-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          tier.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {tier.name}
                          {tier.popular && <span className="text-xs">★ POPULAR</span>}
                        </div>
                        <div className="mt-2 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                          {tier.price}
                          <span className="text-sm text-gray-400">{tier.period}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tiers[0].features.map((feature, index) => (
                    <motion.tr
                      key={feature.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-700/50 hover:bg-gray-700/20"
                    >
                      <td className="p-4 text-gray-300 font-medium">
                        {feature.name}
                        {feature.limit && (
                          <span className="text-xs text-gray-400 ml-2">({feature.limit})</span>
                        )}
                      </td>
                      {tiers.map((tier) => {
                        const tierFeature = tier.features[index];
                        return (
                          <td key={tier.name} className="p-4 text-center">
                            {tierFeature.included ? (
                              <CheckIcon className="w-5 h-5 text-green-400 mx-auto" />
                            ) : (
                              <XMarkIcon className="w-5 h-5 text-gray-600 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Renewal/Upgrade CTA */}
      {currentPlan !== 'sovereign' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-2">
            {daysUntilExpiry <= 7 ? 'Renew Your Subscription' : 'Upgrade Your Protection'}
          </h3>
          <p className="text-purple-100 mb-4">
            {daysUntilExpiry <= 7
              ? `Your subscription expires in ${daysUntilExpiry} days. Renew now to maintain continuous protection.`
              : 'Unlock advanced features and higher limits with a premium plan.'
            }
          </p>
          <div className="space-y-4">
            {/* Payment Error Display */}
            {paymentError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span className="text-sm">{paymentError}</span>
                </div>
              </motion.div>
            )}

            {/* Payment Success Display */}
            {paymentSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-green-400">
                  <CheckIcon className="w-4 h-4" />
                  <span className="text-sm">{paymentSuccess}</span>
                </div>
              </motion.div>
            )}

            {/* Payment Methods Info */}
            {!isLoadingPaymentInfo && supportedCrypto.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CurrencyDollarIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-gray-300">Payment Methods</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {supportedCrypto.slice(0, 4).map((crypto) => (
                    <div key={crypto.code} className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{crypto.symbol}</span>
                      <span>{crypto.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Powered by BTCPay Server - Pay with Bitcoin, Ethereum, and more
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleSubscriptionAction(currentPlan !== 'sovereign' ? 'guardian' : 'sovereign')}
                disabled={isProcessingPayment !== null || !user}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                  isProcessingPayment
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-4 h-4" />
                    {daysUntilExpiry <= 7 ? 'Renew Now' : 'Upgrade Plan'}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="border border-purple-300 text-purple-100 px-6 py-3 rounded-lg font-semibold hover:bg-purple-500/20 transition-colors"
              >
                Compare Plans
              </button>
            </div>

            {!user && (
              <p className="text-xs text-gray-500 text-center">
                Please log in to make payments
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SubscriptionTiers;