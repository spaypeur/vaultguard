import { motion } from 'framer-motion';
import { UsersIcon, ShieldCheckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface Testimonial {
  name: string;
  title: string;
  company: string;
  content: string;
  assets?: string;
}

interface SocialProofProps {
  variant?: 'compact' | 'full';
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    title: "Chief Investment Officer",
    company: "Apex Capital Management",
    content: "VaultGuard's institutional-grade security gives us complete peace of mind for our $2.3B crypto portfolio.",
    assets: "$2.3B+"
  },
  {
    name: "Michael Rodriguez",
    title: "Family Office Manager",
    company: "Rodriguez Family Holdings",
    content: "The zero-knowledge architecture and SOC 2 compliance made this our obvious choice for family wealth protection.",
    assets: "$850M+"
  },
  {
    name: "Dr. Priya Patel",
    title: "Portfolio Director",
    company: "Commonwealth Endowment Fund",
    content: "Outstanding security framework. The insurance coverage and compliance features are unmatched in the industry.",
    assets: "$1.7B+"
  }
];

export default function SocialProof({ variant = 'full' }: SocialProofProps) {
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <UsersIcon className="w-8 h-8 text-cyan-400 mb-2" />
            <div className="text-2xl font-bold text-white">10,000+</div>
            <div className="text-sm text-gray-400">Users Protected</div>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheckIcon className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">$50B+</div>
            <div className="text-sm text-gray-400">Assets Secured</div>
          </div>
          <div className="flex flex-col items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm text-gray-400">Uptime SLA</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="mb-8"
    >
      {/* Social Proof Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-4 bg-gray-900/30 rounded-lg border border-cyan-500/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2"
          >
            10,000+
          </motion.div>
          <div className="text-sm text-gray-300">Elite Users Protected</div>
        </div>
        <div className="text-center p-4 bg-gray-900/30 rounded-lg border border-green-500/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2"
          >
            $50B+
          </motion.div>
          <div className="text-sm text-gray-300">Assets Under Protection</div>
        </div>
        <div className="text-center p-4 bg-gray-900/30 rounded-lg border border-purple-500/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2"
          >
            99.9%
          </motion.div>
          <div className="text-sm text-gray-300">Uptime SLA</div>
        </div>
      </div>

      {/* Rotating Testimonials */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="flex space-x-8 whitespace-nowrap"
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              className="flex-none w-96 bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <p className="text-gray-300 text-sm mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-700/50 pt-4">
                    <div className="font-semibold text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {testimonial.title}
                    </div>
                    <div className="text-xs text-cyan-400 font-medium">
                      {testimonial.company}
                    </div>
                    {testimonial.assets && (
                      <div className="text-xs text-green-400 font-mono mt-1">
                        Portfolio: {testimonial.assets}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}