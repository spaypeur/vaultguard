import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';
import { usePaymentStatus } from '../hooks/usePaymentStatus';

const PaymentSuccess: React.FC = () => {
  const { user } = useAuthStore();

  // Get URL parameters for payment tracking
  const urlParams = new URLSearchParams(window.location.search);
  const btcpayInvoice = urlParams.get('btcpay_invoice');

  // Use the payment status hook for real-time updates
  const {
    status: paymentStatus,
    paymentDetails,
    error,
    isPolling,
    retryCount,
    maxRetries,
    stopPolling,
    reset
  } = usePaymentStatus({
    paymentId: btcpayInvoice || undefined,
    autoPoll: true,
    pollInterval: 5000,
    maxRetries: 10,
  });

  // Refresh user data when payment is confirmed
  useEffect(() => {
    if (paymentStatus === 'confirmed' && user) {
      // Refresh user subscription data in the auth store
      useAuthStore.getState().refreshUser();

      // Show success toast
      toast.success('Payment confirmed! Your subscription is now active.', {
        duration: 6000,
        icon: '🎉',
      });
    }
  }, [paymentStatus, user]);

  // Show notifications for payment status changes
  useEffect(() => {
    if (paymentStatus === 'pending') {
      toast('Payment is being processed. This may take a few minutes for crypto payments.', {
        icon: '⏳',
        duration: 8000,
      });
    } else if (paymentStatus === 'failed') {
      toast.error('Payment verification failed. Please contact support if you believe this is an error.', {
        duration: 8000,
        icon: '❌',
      });
    }
  }, [paymentStatus]);

  const getStatusContent = () => {
    switch (paymentStatus) {
      case 'confirmed':
        return {
          icon: CheckCircleIcon,
          title: 'Payment Confirmed!',
          subtitle: 'Your subscription is now active',
          description: `Welcome to the ${paymentDetails?.plan} plan. Your crypto protection is now active.`,
          bgColor: 'bg-green-500/10 border-green-500/20',
          iconColor: 'text-green-400',
          buttonText: 'Go to Dashboard',
          buttonLink: '/dashboard',
        };

      case 'pending':
        return {
          icon: ClockIcon,
          title: 'Payment Processing',
          subtitle: 'Please wait while we confirm your payment',
          description: 'Crypto payments typically take 5-15 minutes to confirm. You\'ll receive an email once your subscription is activated.',
          bgColor: 'bg-yellow-500/10 border-yellow-500/20',
          iconColor: 'text-yellow-400',
          buttonText: 'Check Status',
          buttonLink: '/payment/success',
        };

      case 'failed':
        return {
          icon: ClockIcon,
          title: 'Payment Status Check Failed',
          subtitle: 'Unable to verify payment status',
          description: error || 'Please contact support if you believe your payment was successful.',
          bgColor: 'bg-red-500/10 border-red-500/20',
          iconColor: 'text-red-400',
          buttonText: 'Contact Support',
          buttonLink: '/contact',
        };

      default:
        return {
          icon: ClockIcon,
          title: 'Checking Payment Status',
          subtitle: 'Please wait...',
          description: 'Verifying your payment and activating your subscription.',
          bgColor: 'bg-blue-500/10 border-blue-500/20',
          iconColor: 'text-blue-400',
          buttonText: 'Refresh',
          buttonLink: '/payment/success',
        };
    }
  };

  const statusContent = getStatusContent();
  const StatusIcon = statusContent.icon;

  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgb(31 41 55)', // gray-800
            border: '1px solid rgb(75 85 99)', // gray-600
            color: 'white',
            borderRadius: '0.5rem',
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border p-8 ${statusContent.bgColor}`}>
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center ${statusContent.iconColor}`}
            >
              <StatusIcon className="w-8 h-8" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {statusContent.title}
            </h1>

            <p className="text-gray-400 mb-4">
              {statusContent.subtitle}
            </p>

            <p className="text-sm text-gray-500 mb-6">
              {statusContent.description}
            </p>

            {paymentDetails && (
              <div className="bg-gray-700/30 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Subscription Details
                </h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>Plan: <span className="text-white capitalize">{paymentDetails.plan}</span></p>
                  {paymentDetails.startedAt && (
                    <p>Started: <span className="text-white">{new Date(paymentDetails.startedAt).toLocaleDateString()}</span></p>
                  )}
                  {paymentDetails.amount && (
                    <p>Amount: <span className="text-white">${paymentDetails.amount}</span></p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => window.location.href = statusContent.buttonLink}
              >
                {statusContent.buttonText}
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>

              {paymentStatus === 'pending' && (
                <button
                  onClick={() => {
                    reset();
                    window.location.reload();
                  }}
                  className="w-full border border-gray-600 text-gray-400 py-2 px-4 rounded-lg font-medium hover:bg-gray-700/50 transition-colors"
                >
                  Refresh Status
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Questions about your payment?
                <a href="mailto:support@vaultguard.io" className="text-cyan-400 hover:text-cyan-300 ml-1">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentSuccess;