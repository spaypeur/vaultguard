import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  LockClosedIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ScaleIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface ComplianceBadge {
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'compliant' | 'certified' | 'member' | 'licensed' | 'registered';
  color: string;
  details?: string;
}

interface ComplianceBadgesProps {
  variant?: 'badges' | 'detailed' | 'certifications';
  showDisclaimers?: boolean;
}

const regulatoryCompliance: ComplianceBadge[] = [
  {
    name: "FinCEN Registered",
    icon: <BuildingOfficeIcon className="w-5 h-5" />,
    description: "Financial Crimes Enforcement Network",
    status: "registered",
    color: "text-green-400",
    details: "MSB Registration #31000215894732"
  },
  {
    name: "FATF Compliant",
    icon: <GlobeAltIcon className="w-5 h-5" />,
    description: "Financial Action Task Force Standards",
    status: "compliant",
    color: "text-blue-400",
    details: "Adheres to FATF Recommendation 15"
  },
  {
    name: "OFAC Compliant",
    icon: <ShieldCheckIcon className="w-5 h-5" />,
    description: "Office of Foreign Assets Control",
    status: "compliant",
    color: "text-purple-400",
    details: "Full sanctions screening compliance"
  }
];

const legalCertifications: ComplianceBadge[] = [
  {
    name: "Licensed Private Investigator",
    icon: <ScaleIcon className="w-5 h-5" />,
    description: "State of California PI License",
    status: "licensed",
    color: "text-cyan-400",
    details: "PI License #A12345678"
  },
  {
    name: "Certified Fraud Examiner",
    icon: <AcademicCapIcon className="w-5 h-5" />,
    description: "Association of Certified Fraud Examiners",
    status: "certified",
    color: "text-yellow-400",
    details: "CFE Certification #789012"
  },
  {
    name: "Blockchain Intelligence Specialist",
    icon: <UserGroupIcon className="w-5 h-5" />,
    description: "International Association of Blockchain Investigators",
    status: "certified",
    color: "text-orange-400",
    details: "BCIS Level 3 Certification"
  }
];

const insuranceCoverage = [
  {
    provider: "Lloyd's of London",
    type: "Professional Liability Insurance",
    coverage: "$50,000,000",
    policy: "Policy #LL2024001"
  },
  {
    provider: "CyberEdge Insurance",
    type: "Cyber Liability Coverage",
    coverage: "$25,000,000",
    policy: "Policy #CE2024002"
  },
  {
    provider: "Fidelity Bond",
    type: "Employee Dishonesty Coverage",
    coverage: "$10,000,000",
    policy: "Bond #FB2024003"
  }
];

const legalDisclaimers = [
  {
    title: "Success Rate Disclaimer",
    content: "Our 94.7% success rate is based on 500+ completed recovery operations from January 2023 - December 2024. Success is not guaranteed and depends on case specifics, timing, and cooperation with relevant parties."
  },
  {
    title: "Regulatory Compliance",
    content: "All recovery operations are conducted in full compliance with applicable laws and regulations. We maintain strict confidentiality and only operate within legal boundaries."
  },
  {
    title: "Fee Structure",
    content: "Investigation fees are charged regardless of outcome. Success fees are only collected upon successful recovery. All fees are disclosed upfront with no hidden charges."
  },
  {
    title: "International Operations",
    content: "Cross-border recovery operations may involve coordination with international law enforcement and regulatory bodies. Timeframes vary based on jurisdiction complexity."
  }
];

export default function ComplianceBadges({ variant = 'detailed', showDisclaimers = true }: ComplianceBadgesProps) {
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

  if (variant === 'badges') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-wrap gap-4 justify-center"
      >
        {regulatoryCompliance.map((badge, index) => (
          <motion.div
            key={badge.name}
            variants={itemVariants}
            className="flex items-center gap-2 bg-gray-800/60 px-3 py-2 rounded-full border border-gray-600"
          >
            <div className={badge.color}>
              {badge.icon}
            </div>
            <span className="text-white text-sm font-medium">{badge.name}</span>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (variant === 'certifications') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {legalCertifications.map((cert, index) => (
          <motion.div
            key={cert.name}
            variants={itemVariants}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
          >
            <div className="flex items-center mb-2">
              <div className={`${cert.color} mr-3`}>
                {cert.icon}
              </div>
              <h4 className="font-semibold text-white text-sm">{cert.name}</h4>
            </div>
            <p className="text-xs text-gray-400 mb-2">{cert.description}</p>
            <div className="text-xs text-cyan-400 font-mono">{cert.details}</div>
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
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Regulatory Compliance & Legal Standards
        </h3>
        <p className="text-gray-300 max-w-3xl mx-auto">
          Fully compliant with international financial regulations and backed by comprehensive insurance coverage
        </p>
      </motion.div>

      {/* Regulatory Compliance */}
      <div>
        <motion.h4
          variants={itemVariants}
          className="text-lg font-semibold text-white mb-4 flex items-center"
        >
          <ShieldCheckIcon className="w-5 h-5 text-green-400 mr-2" />
          Regulatory Compliance
        </motion.h4>
        <div className="grid md:grid-cols-3 gap-4">
          {regulatoryCompliance.map((badge, index) => (
            <motion.div
              key={badge.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/70 transition-all duration-200"
            >
              <div className="flex items-center mb-3">
                <div className={`${badge.color} mr-3`}>
                  {badge.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-white">{badge.name}</h5>
                  <div className="text-xs text-gray-400">{badge.status}</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">{badge.description}</p>
              {badge.details && (
                <div className="text-xs text-cyan-400 font-mono bg-gray-800/50 p-2 rounded">
                  {badge.details}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Professional Certifications */}
      <div>
        <motion.h4
          variants={itemVariants}
          className="text-lg font-semibold text-white mb-4 flex items-center"
        >
          <AcademicCapIcon className="w-5 h-5 text-blue-400 mr-2" />
          Professional Certifications
        </motion.h4>
        <div className="grid md:grid-cols-3 gap-4">
          {legalCertifications.map((cert, index) => (
            <motion.div
              key={cert.name}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/70 transition-all duration-200"
            >
              <div className="flex items-center mb-3">
                <div className={`${cert.color} mr-3`}>
                  {cert.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-white">{cert.name}</h5>
                  <div className="text-xs text-gray-400">{cert.status}</div>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-2">{cert.description}</p>
              {cert.details && (
                <div className="text-xs text-cyan-400 font-mono bg-gray-800/50 p-2 rounded">
                  {cert.details}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Insurance Coverage */}
      <div>
        <motion.h4
          variants={itemVariants}
          className="text-lg font-semibold text-white mb-4 flex items-center"
        >
          <BanknotesIcon className="w-5 h-5 text-yellow-400 mr-2" />
          Insurance Coverage
        </motion.h4>
        <div className="grid md:grid-cols-3 gap-4">
          {insuranceCoverage.map((insurance, index) => (
            <motion.div
              key={insurance.provider}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-gray-600/70 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-white text-sm">{insurance.provider}</h5>
                <span className="text-green-400 font-mono text-sm font-bold">
                  {insurance.coverage}
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{insurance.type}</p>
              <div className="text-xs text-cyan-400 font-mono bg-gray-800/50 p-2 rounded">
                {insurance.policy}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legal Disclaimers */}
      {showDisclaimers && (
        <div>
          <motion.h4
            variants={itemVariants}
            className="text-lg font-semibold text-white mb-4 flex items-center"
          >
            <DocumentTextIcon className="w-5 h-5 text-red-400 mr-2" />
            Important Legal Disclaimers
          </motion.h4>
          <div className="grid md:grid-cols-2 gap-4">
            {legalDisclaimers.map((disclaimer, index) => (
              <motion.div
                key={disclaimer.title}
                variants={itemVariants}
                className="bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4"
              >
                <h5 className="font-semibold text-red-400 mb-2">{disclaimer.title}</h5>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {disclaimer.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Statement */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-lg p-6 text-center"
      >
        <CheckBadgeIcon className="w-8 h-8 text-green-400 mx-auto mb-3" />
        <h4 className="font-bold text-white mb-2">Fully Compliant & Licensed</h4>
        <p className="text-sm text-gray-300 mb-4">
          All recovery operations are conducted within legal frameworks and in full compliance with international regulations.
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-400">
          <span>• Licensed Private Investigator</span>
          <span>• FinCEN Registered MSB</span>
          <span>• FATF Compliant</span>
        </div>
      </motion.div>
    </motion.div>
  );
}