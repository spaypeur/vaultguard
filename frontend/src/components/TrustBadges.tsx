import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface TrustBadge {
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface TrustBadgesProps {
  variant?: 'compact' | 'detailed';
  showAnimations?: boolean;
}

const securityCertifications: TrustBadge[] = [
  {
    name: "SOC 2 Type II",
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    description: "Certified security controls",
    color: "text-blue-400"
  },
  {
    name: "PCI DSS Level 1",
    icon: <LockClosedIcon className="w-5 h-5" />,
    description: "Payment card industry compliance",
    color: "text-green-400"
  },
  {
    name: "ISO 27001",
    icon: <CheckBadgeIcon className="w-5 h-5" />,
    description: "Information security management",
    color: "text-purple-400"
  }
];

const partnerships: TrustBadge[] = [
  {
    name: "Chainalysis",
    icon: <GlobeAltIcon className="w-5 h-5" />,
    description: "Blockchain analysis partner",
    color: "text-orange-400"
  },
  {
    name: "CipherTrace",
    icon: <BuildingOfficeIcon className="w-5 h-5" />,
    description: "Crypto compliance solutions",
    color: "text-cyan-400"
  }
];

const insuranceInfo = [
  {
    name: "Lloyd's of London",
    coverage: "$100M",
    type: "Cyber liability coverage"
  },
  {
    name: "Marsh & McLennan",
    coverage: "$50M",
    type: "Professional liability"
  }
];

export default function TrustBadges({ variant = 'detailed', showAnimations = true }: TrustBadgesProps) {
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
        className="flex items-center justify-center space-x-6 text-xs text-gray-400 py-4"
      >
        {securityCertifications.map((cert, index) => (
          <motion.div
            key={cert.name}
            variants={itemVariants}
            className="flex items-center"
          >
            <div className={`w-2 h-2 ${cert.color.replace('text-', 'bg-')} rounded-full mr-2`}></div>
            <span className="text-xs">{cert.name}</span>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Security Certifications */}
      <div>
        <motion.h3
          variants={itemVariants}
          className="text-lg font-semibold text-white mb-4 flex items-center"
        >
          <ShieldCheckIcon className="w-5 h-5 text-cyan-400 mr-2" />
          Security Certifications
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityCertifications.map((cert, index) => (
            <motion.div
              key={cert.name}
              variants={itemVariants}
              whileHover={showAnimations ? { scale: 1.05, y: -2 } : {}}
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/70 transition-all duration-200"
            >
              <div className="flex items-center mb-2">
                <div className={`${cert.color} mr-3`}>
                  {cert.icon}
                </div>
                <h4 className="font-semibold text-white text-sm">{cert.name}</h4>
              </div>
              <p className="text-xs text-gray-400">{cert.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Partnership Badges */}
      <div>
        <motion.h3
          variants={itemVariants}
          className="text-lg font-semibold text-white mb-4 flex items-center"
        >
          <BuildingOfficeIcon className="w-5 h-5 text-green-400 mr-2" />
          Strategic Partners
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partnerships.map((partner, index) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              whileHover={showAnimations ? { scale: 1.05, y: -2 } : {}}
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/70 transition-all duration-200"
            >
              <div className="flex items-center mb-2">
                <div className={`${partner.color} mr-3`}>
                  {partner.icon}
                </div>
                <h4 className="font-semibold text-white text-sm">{partner.name}</h4>
              </div>
              <p className="text-xs text-gray-400">{partner.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insurance Coverage */}
      <div>
        <motion.h3
          variants={itemVariants}
          className="text-lg font-semibold text-white mb-4 flex items-center"
        >
          <BanknotesIcon className="w-5 h-5 text-yellow-400 mr-2" />
          Insurance Coverage
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insuranceInfo.map((insurance, index) => (
            <motion.div
              key={insurance.name}
              variants={itemVariants}
              whileHover={showAnimations ? { scale: 1.05, y: -2 } : {}}
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/70 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white text-sm">{insurance.name}</h4>
                <span className="text-green-400 font-mono text-sm font-bold">
                  {insurance.coverage}
                </span>
              </div>
              <p className="text-xs text-gray-400">{insurance.type}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Money-back guarantee */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-6 text-center"
      >
        <CheckBadgeIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
        <h4 className="font-bold text-white mb-2">30-Day Money-Back Guarantee</h4>
        <p className="text-sm text-gray-300">
          Not satisfied? Get a full refund within 30 days. No questions asked.
        </p>
      </motion.div>
    </motion.div>
  );
}