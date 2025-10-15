import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface ClientRecovery {
  id: string;
  companyName: string;
  logoUrl: string;
  industry: string;
  amountRecovered: string;
  timeframe: string;
  caseType: string;
  testimonial?: string;
  successRate: number;
}

interface ClientLogosCarouselProps {
  variant?: 'compact' | 'detailed';
  autoplay?: boolean;
  showDetails?: boolean;
}

const clientRecoveries: ClientRecovery[] = [
  {
    id: '1',
    companyName: 'DeFi Capital Management',
    logoUrl: '/api/placeholder/120/60',
    industry: 'Investment Fund',
    amountRecovered: '$2.4M',
    timeframe: '18 days',
    caseType: 'Smart Contract Exploit',
    testimonial: 'Exceptional results in record time',
    successRate: 90
  },
  {
    id: '2',
    companyName: 'TechFlow Solutions',
    logoUrl: '/api/placeholder/120/60',
    industry: 'Technology',
    amountRecovered: '$1.2M',
    timeframe: '14 days',
    caseType: 'Ransomware Attack',
    testimonial: 'Professional and discreet service',
    successRate: 95
  },
  {
    id: '3',
    companyName: 'Global Trading Corp',
    logoUrl: '/api/placeholder/120/60',
    industry: 'Financial Services',
    amountRecovered: '$3.1M',
    timeframe: '21 days',
    caseType: 'Exchange Breach',
    testimonial: 'Exceeded our expectations',
    successRate: 88
  },
  {
    id: '4',
    companyName: 'Innovation Labs',
    logoUrl: '/api/placeholder/120/60',
    industry: 'Biotechnology',
    amountRecovered: '$890K',
    timeframe: '12 days',
    caseType: 'Social Engineering',
    testimonial: 'Swift and effective recovery',
    successRate: 92
  },
  {
    id: '5',
    companyName: 'NextGen Finance',
    logoUrl: '/api/placeholder/120/60',
    industry: 'Fintech',
    amountRecovered: '$1.8M',
    timeframe: '16 days',
    caseType: 'DeFi Hack',
    testimonial: 'Outstanding technical expertise',
    successRate: 87
  },
  {
    id: '6',
    companyName: 'SecureChain Systems',
    logoUrl: '/api/placeholder/120/60',
    industry: 'Blockchain Security',
    amountRecovered: '$2.7M',
    timeframe: '19 days',
    caseType: 'Bridge Exploit',
    testimonial: 'Highly recommend their services',
    successRate: 93
  }
];

export default function ClientLogosCarousel({
  variant = 'detailed',
  autoplay = true,
  showDetails = true
}: ClientLogosCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (autoplay && !isHovered && variant === 'detailed') {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % clientRecoveries.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoplay, isHovered, variant]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % clientRecoveries.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + clientRecoveries.length) % clientRecoveries.length);
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center space-x-8 opacity-60">
          {clientRecoveries.slice(0, 6).map((client) => (
            <div key={client.id} className="flex items-center space-x-2">
              <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400 font-bold">
                  {client.companyName.split(' ')[0]}
                </span>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-400">{client.amountRecovered}</div>
                <div className="text-xs text-gray-400">Recovered</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold text-white mb-4">
          Trusted by Industry Leaders
        </h3>
        <p className="text-gray-300">
          Successful recoveries across diverse industries and case types
        </p>
      </motion.div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-[200px]"
          >
            <div className="text-center">
              {/* Company Logo Placeholder */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-48 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center mx-auto mb-6 border border-gray-700"
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">
                    {clientRecoveries[currentIndex].companyName}
                  </div>
                  <div className="text-sm text-gray-400">
                    {clientRecoveries[currentIndex].industry}
                  </div>
                </div>
              </motion.div>

              {/* Recovery Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center p-4 bg-green-900/20 rounded-lg"
                >
                  <CurrencyDollarIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">
                    {clientRecoveries[currentIndex].amountRecovered}
                  </div>
                  <div className="text-sm text-gray-400">Amount Recovered</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center p-4 bg-blue-900/20 rounded-lg"
                >
                  <ClockIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">
                    {clientRecoveries[currentIndex].timeframe}
                  </div>
                  <div className="text-sm text-gray-400">Recovery Time</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center p-4 bg-purple-900/20 rounded-lg"
                >
                  <TrophyIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">
                    {clientRecoveries[currentIndex].successRate}%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </motion.div>
              </div>

              {/* Case Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <h4 className="text-xl font-bold text-white mb-2">
                  {clientRecoveries[currentIndex].caseType}
                </h4>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Successfully recovered funds from a complex {clientRecoveries[currentIndex].caseType.toLowerCase()}
                  case, demonstrating expertise in advanced blockchain forensics and international cooperation.
                </p>
              </motion.div>

              {/* Testimonial */}
              {clientRecoveries[currentIndex].testimonial && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gray-800/50 rounded-lg p-4 max-w-xl mx-auto"
                >
                  <p className="text-gray-300 italic">
                    "{clientRecoveries[currentIndex].testimonial}"
                  </p>
                  <div className="text-cyan-400 font-semibold mt-2">
                    {clientRecoveries[currentIndex].companyName}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-all duration-300 opacity-70 hover:opacity-100"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-all duration-300 opacity-70 hover:opacity-100"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          {clientRecoveries.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-cyan-400 w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Clients', value: '500+', icon: '👥' },
          { label: 'Success Rate', value: '94.7%', icon: '✅' },
          { label: 'Avg Recovery', value: '$1.8M', icon: '💰' },
          { label: 'Industries', value: '12+', icon: '🏢' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}