import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  DocumentIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { leadMagnetsAPI } from '../../services/api';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadMagnet: string;
  onEmailCaptured: (email: string) => void;
}

export default function EmailCaptureModal({
  isOpen,
  onClose,
  leadMagnet,
  onEmailCaptured
}: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Call the lead magnets API to capture the email
      await leadMagnetsAPI.captureLead(email, leadMagnet);

      setIsSuccess(true);

      // Simulate download after success
      setTimeout(() => {
        onEmailCaptured(email);
        // Trigger actual PDF download here
      }, 1000);

    } catch (err: any) {
      console.error('Lead magnet capture error:', err);
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setError('');
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-cyan-500/20 p-6 text-left align-middle shadow-xl transition-all">
                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.div
                      key="capture-form"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center mr-3">
                            <DocumentIcon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <Dialog.Title as="h3" className="text-lg font-bold text-white">
                              Get Your Free {leadMagnet}
                            </Dialog.Title>
                            <p className="text-sm text-gray-400">
                              Enter your email to download
                            </p>
                          </div>
                        </div>

                        {!isSubmitting && (
                          <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <XMarkIcon className="w-6 h-6" />
                          </button>
                        )}
                      </div>

                      {/* Lead Magnet Preview */}
                      <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-2">
                          <ShieldCheckIcon className="w-5 h-5 text-cyan-400 mr-2" />
                          <span className="text-sm font-semibold text-white">
                            {leadMagnet}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Comprehensive security checklist with personalized recommendations
                        </p>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="email"
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                              disabled={isSubmitting}
                              required
                            />
                          </div>
                        </div>

                        {error && (
                          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            {error}
                          </div>
                        )}

                        {/* Value Props */}
                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="flex items-center">
                            <CheckCircleIcon className="w-3 h-3 text-green-400 mr-2" />
                            Instant PDF download
                          </div>
                          <div className="flex items-center">
                            <CheckCircleIcon className="w-3 h-3 text-green-400 mr-2" />
                            No spam, unsubscribe anytime
                          </div>
                          <div className="flex items-center">
                            <CheckCircleIcon className="w-3 h-3 text-green-400 mr-2" />
                            Weekly crypto security tips
                          </div>
                        </div>

                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            'Download PDF Report'
                          )}
                        </motion.button>
                      </form>

                      {/* Privacy Notice */}
                      <p className="text-xs text-gray-500 mt-4 text-center">
                        We respect your privacy. Unsubscribe at any time.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success-message"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircleIcon className="w-8 h-8 text-green-400" />
                      </motion.div>

                      <h3 className="text-xl font-bold text-white mb-2">
                        Success!
                      </h3>

                      <p className="text-gray-300 mb-4">
                        Your {leadMagnet} is being prepared for download.
                      </p>

                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center mb-2">
                          <DocumentIcon className="w-5 h-5 text-cyan-400 mr-2" />
                          <span className="text-sm font-semibold text-white">
                            Security-Report-{new Date().toISOString().split('T')[0]}.pdf
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Download will start automatically...
                        </p>
                      </div>

                      <motion.button
                        onClick={handleClose}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                      >
                        Close
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}