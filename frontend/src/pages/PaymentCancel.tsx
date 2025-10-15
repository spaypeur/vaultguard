import React from 'react';
import { motion } from 'framer-motion';
import {
  XCircleIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-red-500/20 p-8">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center"
            >
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Payment Cancelled
            </h1>

            <p className="text-gray-400 mb-4">
              Your payment was cancelled successfully
            </p>

            <p className="text-sm text-gray-500 mb-6">
              No charges were made to your account. You can try again whenever you're ready to upgrade your crypto protection.
            </p>

            <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-gray-300">Payment Methods</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Bitcoin (BTC)</p>
                <p>• Ethereum (ETH)</p>
                <p>• Tether (USDT) - ERC20 & TRC20</p>
                <p>• Solana (SOL)</p>
                <p>• Cardano (ADA)</p>
                <p>• Polkadot (DOT)</p>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => window.location.href = '/pricing'}
              >
                View Plans Again
                <ArrowRightIcon className="w-4 h-4" />
              </motion.button>

              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full border border-gray-600 text-gray-400 py-2 px-4 rounded-lg font-medium hover:bg-gray-700/50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Need help choosing a plan?
                <a href="mailto:support@vaultguard.io" className="text-cyan-400 hover:text-cyan-300 ml-1">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;