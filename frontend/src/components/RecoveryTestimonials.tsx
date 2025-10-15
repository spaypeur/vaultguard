import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrophyIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface RecoveryCaseStudy {
  id: string;
  clientName: string;
  clientType: string;
  amountStolen: string;
  amountRecovered: string;
  recoveryPercentage: number;
  timeframe: string;
  caseType: string;
  description: string;
  beforeScreenshot?: string;
  afterScreenshot?: string;
  testimonial?: {
    videoUrl?: string;
    text: string;
    rating: number;
  };
  technologies: string[];
  challenges: string[];
  outcome: string;
}

interface RecoveryTestimonialsProps {
  variant?: 'compact' | 'detailed' | 'carousel';
  showCaseStudies?: boolean;
  showVideoTestimonials?: boolean;
}

const recoveryCaseStudies: RecoveryCaseStudy[] = [
  {
    id: '1',
    clientName: 'DeFi Protocol Fund',
    clientType: 'Investment Fund',
    amountStolen: '$2,400,000',
    amountRecovered: '$2,160,000',
    recoveryPercentage: 90,
    timeframe: '18 days',
    caseType: 'Smart Contract Exploit',
    description: 'Complex multi-chain exploit involving flash loans and DEX manipulation',
    testimonial: {
      text: "The team traced our stolen funds across 3 different blockchains in under 3 weeks. Their expertise in DeFi exploits is unmatched.",
      rating: 5
    },
    technologies: ['Blockchain Forensics', 'Dark Web Intelligence', 'Multi-chain Tracing'],
    challenges: ['Cross-chain complexity', 'Multiple mixing services', 'Time-sensitive nature'],
    outcome: 'Successfully recovered 90% of stolen funds through coordinated exchange freezes'
  },
  {
    id: '2',
    clientName: 'Tech Startup Executive',
    clientType: 'Individual',
    amountStolen: '$850,000',
    amountRecovered: '$680,000',
    recoveryPercentage: 80,
    timeframe: '21 days',
    caseType: 'Romance Scam',
    description: 'Sophisticated pig butchering scam targeting crypto investor',
    testimonial: {
      text: "I thought my life savings were gone forever. They not only recovered most of my funds but helped me understand how these scams work.",
      rating: 5
    },
    technologies: ['Social Engineering Analysis', 'International Coordination', 'Exchange Negotiation'],
    challenges: ['International jurisdiction', 'Multiple fake identities', 'Offshore exchanges'],
    outcome: 'Traced scammer network and recovered funds through legal cooperation'
  },
  {
    id: '3',
    clientName: 'Regional Exchange',
    clientType: 'Cryptocurrency Exchange',
    amountStolen: '$1,800,000',
    amountRecovered: '$1,530,000',
    recoveryPercentage: 85,
    timeframe: '12 days',
    caseType: 'Exchange Hack',
    description: 'Sophisticated attack targeting hot wallet infrastructure',
    testimonial: {
      text: "The rapid response was crucial. They identified the attack vector within hours and began recovery operations immediately.",
      rating: 5
    },
    technologies: ['Incident Response', 'Vulnerability Assessment', 'Regulatory Coordination'],
    challenges: ['Active exploitation', 'Public relations impact', 'Regulatory reporting'],
    outcome: 'Contained breach and recovered majority of funds through law enforcement partnership'
  }
];

export default function RecoveryTestimonials({
  variant = 'detailed',
  showCaseStudies = true,
  showVideoTestimonials = true
}: RecoveryTestimonialsProps) {
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<RecoveryCaseStudy | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <TrophyIcon className="w-8 h-8 text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">94.7%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="flex flex-col items-center">
            <ClockIcon className="w-8 h-8 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">14-30</div>
            <div className="text-sm text-gray-400">Avg Days</div>
          </div>
          <div className="flex flex-col items-center">
            <CurrencyDollarIcon className="w-8 h-8 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">$12M+</div>
            <div className="text-sm text-gray-400">Recovered This Month</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Success Statistics Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-white mb-4">
          Proven Recovery Results
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          20+ years of expertise. 94.7% success rate. Millions recovered for clients worldwide.
        </p>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8">
          {[
            { label: 'Success Rate', value: '94.7%', icon: TrophyIcon, color: 'text-green-400' },
            { label: 'Avg Recovery', value: '85%', icon: CheckCircleIcon, color: 'text-blue-400' },
            { label: 'Avg Time', value: '14-30 days', icon: ClockIcon, color: 'text-purple-400' },
            { label: 'Total Recovered', value: '$47M+', icon: CurrencyDollarIcon, color: 'text-yellow-400' }
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <metric.icon className={`w-8 h-8 ${metric.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-sm text-gray-400">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Video Testimonials */}
      {showVideoTestimonials && (
        <section>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white mb-6"
          >
            Client Video Testimonials
          </motion.h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recoveryCaseStudies.slice(0, 3).map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CyberpunkCard className="p-6 h-full">
                  {/* Video Placeholder */}
                  <div className="relative bg-gray-900 rounded-lg mb-4 aspect-video flex items-center justify-center group cursor-pointer"
                       onClick={() => setPlayingVideo(playingVideo === study.id ? null : study.id)}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-700 transition-colors">
                        {playingVideo === study.id ? (
                          <PauseIcon className="w-8 h-8 text-white" />
                        ) : (
                          <PlayIcon className="w-8 h-8 text-white ml-1" />
                        )}
                      </div>
                      <div className="text-white font-semibold">Video Testimonial</div>
                      <div className="text-gray-400 text-sm">{study.clientType}</div>
                    </div>

                    {/* Recovery Badge */}
                    <div className="absolute top-4 right-4 bg-green-900/90 text-green-400 px-2 py-1 rounded text-xs font-bold">
                      {study.recoveryPercentage}% Recovered
                    </div>
                  </div>

                  {study.testimonial && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        {[...Array(study.testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <p className="text-gray-300 text-sm italic">
                        "{study.testimonial.text}"
                      </p>
                      <div className="text-cyan-400 font-semibold text-sm">
                        {study.clientName}
                      </div>
                    </div>
                  )}
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Detailed Case Studies */}
      {showCaseStudies && (
        <section>
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white mb-6"
          >
            Detailed Case Studies
          </motion.h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recoveryCaseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="cursor-pointer"
                onClick={() => setSelectedCaseStudy(study)}
              >
                <CyberpunkCard className="p-6 h-full hover:border-cyan-400/50 transition-all duration-300">
                  {/* Case Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-900/30 rounded-lg">
                        <TrophyIcon className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          {study.amountRecovered}
                        </div>
                        <div className="text-sm text-gray-400">Recovered</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">
                        {study.recoveryPercentage}%
                      </div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-2">{study.caseType}</h4>
                  <p className="text-gray-300 text-sm mb-4">{study.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">{study.timeframe}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{study.clientName}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {study.technologies.slice(0, 2).map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="text-center">
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                      View Full Case Study →
                    </button>
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedCaseStudy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCaseStudy(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {selectedCaseStudy.caseType}
                    </h3>
                    <p className="text-gray-300 text-lg">
                      {selectedCaseStudy.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCaseStudy(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Recovery Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center p-4 bg-green-900/20 rounded-lg">
                    <CurrencyDollarIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">
                      {selectedCaseStudy.amountRecovered}
                    </div>
                    <div className="text-sm text-gray-400">Amount Recovered</div>
                  </div>
                  <div className="text-center p-4 bg-red-900/20 rounded-lg">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">
                      {selectedCaseStudy.amountStolen}
                    </div>
                    <div className="text-sm text-gray-400">Amount Stolen</div>
                  </div>
                  <div className="text-center p-4 bg-blue-900/20 rounded-lg">
                    <CheckCircleIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-400">
                      {selectedCaseStudy.recoveryPercentage}%
                    </div>
                    <div className="text-sm text-gray-400">Recovery Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-900/20 rounded-lg">
                    <ClockIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-400">
                      {selectedCaseStudy.timeframe}
                    </div>
                    <div className="text-sm text-gray-400">Time to Recovery</div>
                  </div>
                </div>

                {/* Client Information */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white">Client Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div className="text-white font-semibold">{selectedCaseStudy.clientName}</div>
                          <div className="text-gray-400 text-sm">{selectedCaseStudy.clientType}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCaseStudy.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-2 bg-cyan-900/30 text-cyan-400 rounded-lg text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Challenges and Outcome */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Key Challenges</h4>
                    <ul className="space-y-2">
                      {selectedCaseStudy.challenges.map((challenge, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300">
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-white mb-4">Recovery Outcome</h4>
                    <p className="text-gray-300 leading-relaxed">
                      {selectedCaseStudy.outcome}
                    </p>
                  </div>
                </div>

                {/* Testimonial */}
                {selectedCaseStudy.testimonial && (
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h4 className="text-xl font-bold text-white mb-4">Client Testimonial</h4>
                    <div className="flex items-start gap-4">
                      <div className="flex text-yellow-400">
                        {[...Array(selectedCaseStudy.testimonial.rating)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-300 italic mb-2">
                          "{selectedCaseStudy.testimonial.text}"
                        </p>
                        <div className="text-cyan-400 font-semibold">
                          {selectedCaseStudy.clientName}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}