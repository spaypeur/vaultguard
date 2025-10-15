import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  CpuChipIcon,
  ClockIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ValueProposition {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric?: string;
  color: string;
}

interface ValuePropositionsProps {
  variant?: 'compact' | 'detailed';
  showFeatures?: boolean;
}

const keyBenefits: ValueProposition[] = [
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: "Military-Grade Security",
    description: "Zero-knowledge architecture with end-to-end encryption",
    metric: "256-bit AES",
    color: "text-cyan-400"
  },
  {
    icon: <CpuChipIcon className="w-6 h-6" />,
    title: "Quantum-Resistant",
    description: "Future-proof cryptography against quantum attacks",
    metric: "Kyber-768",
    color: "text-purple-400"
  },
  {
    icon: <EyeIcon className="w-6 h-6" />,
    title: "Real-Time Monitoring",
    description: "24/7 threat intelligence and portfolio surveillance",
    metric: "99.9% Uptime",
    color: "text-green-400"
  },
  {
    icon: <ChartBarIcon className="w-6 h-6" />,
    title: "Advanced Analytics",
    description: "Cross-chain portfolio tracking and risk assessment",
    metric: "50+ Chains",
    color: "text-blue-400"
  }
];

const keyFeatures = [
  "Multi-signature wallet management",
  "Automated compliance reporting",
  "Dark web monitoring",
  "Emergency response coordination",
  "Smart contract vulnerability scanning",
  "Tax optimization reporting"
];

export default function ValuePropositions({ variant = 'detailed', showFeatures = true }: ValuePropositionsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {keyBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              className="text-center p-3 bg-gray-900/30 rounded-lg border border-gray-700/50"
            >
              <div className={`${benefit.color} mb-2 flex justify-center`}>
                {benefit.icon}
              </div>
              <div className="text-sm font-semibold text-white">{benefit.title}</div>
              {benefit.metric && (
                <div className="text-xs text-gray-400 mt-1">{benefit.metric}</div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mb-8 space-y-8"
    >
      {/* Key Benefits */}
      <div>
        <motion.h3
          variants={itemVariants}
          className="text-xl font-bold text-white mb-6 flex items-center"
        >
          <LockClosedIcon className="w-6 h-6 text-cyan-400 mr-3" />
          Elite Security Features
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keyBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:border-cyan-500/30 transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className={`${benefit.color} mt-1`}>
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-2 flex items-center justify-between">
                    {benefit.title}
                    {benefit.metric && (
                      <span className="text-xs text-gray-400 font-mono bg-gray-800/50 px-2 py-1 rounded">
                        {benefit.metric}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      {showFeatures && (
        <div>
          <motion.h3
            variants={itemVariants}
            className="text-xl font-bold text-white mb-6 flex items-center"
          >
            <CheckCircleIcon className="w-6 h-6 text-green-400 mr-3" />
            Comprehensive Coverage
          </motion.h3>
          <motion.div
            variants={itemVariants}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {keyFeatures.map((feature, index) => (
                <div key={feature} className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Trust Statement */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 border border-cyan-500/20 rounded-lg p-6 text-center"
      >
        <GlobeAltIcon className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-white mb-3">
          Trusted by Elite Institutions Worldwide
        </h4>
        <p className="text-sm text-gray-300 leading-relaxed max-w-2xl mx-auto">
          Join family offices, investment funds, and institutional investors who rely on VaultGuard
          for unparalleled crypto asset protection and compliance management.
        </p>
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center">
            <ShieldCheckIcon className="w-4 h-4 mr-1" />
            <span>SOC 2 Compliant</span>
          </div>
          <div className="flex items-center">
            <GlobeAltIcon className="w-4 h-4 mr-1" />
            <span>Global Coverage</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}