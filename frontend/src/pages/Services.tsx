import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  ChartBarIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  CpuChipIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';
import SEOHead from '../components/SEOHead';

export default function Services() {
  const navigate = useNavigate();

  const mainServices = [
    {
      icon: EyeIcon,
      title: 'Dark Web Monitoring',
      subtitle: 'Personal Surveillance of Underground Markets',
      description: 'I personally monitor dark web forums, Mariana web marketplaces, and ghost web channels where stolen crypto is traded. This isn\'t automated - it\'s real human intelligence.',
      features: [
        'Personal monitoring of 50+ dark web forums',
        'Mariana web marketplace surveillance',
        'Ghost web channel infiltration',
        'Real-time alerts when your assets appear',
        'Direct communication with threat actors (when legal)',
        'Coordination with law enforcement agencies',
      ],
      methodology: [
        'Daily manual checks of known marketplaces',
        'Automated keyword monitoring for your wallet addresses',
        'Social engineering to gather intelligence',
        'Cross-referencing with blockchain analysis',
      ],
      pricing: 'From $50K/year',
      color: 'cyan' as const,
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Blockchain Forensics',
      subtitle: 'Advanced Chain Analysis & Tracking',
      description: 'Comprehensive blockchain analysis across 50+ networks. I trace funds through mixers, tumblers, and complex transaction patterns that automated tools miss.',
      features: [
        'Cross-chain transaction tracing',
        'Mixer/tumbler analysis (Tornado Cash, etc.)',
        'Exchange deposit tracking',
        'Wallet clustering and identification',
        'Smart contract interaction analysis',
        'DeFi protocol fund tracking',
      ],
      methodology: [
        'Manual graph analysis of transaction flows',
        'Pattern recognition across multiple chains',
        'Exchange cooperation for KYC data',
        'Time-based correlation analysis',
      ],
      pricing: 'Included in all plans',
      color: 'purple' as const,
    },
    {
      icon: ShieldCheckIcon,
      title: 'Expert Recovery Operations',
      subtitle: 'Personal Intervention for High-Value Cases',
      description: 'When automated systems fail, I personally intervene. 20+ years of hacking experience applied to recover your stolen assets through legal channels.',
      features: [
        'Personal case management by founder',
        'Direct negotiation with threat actors',
        'Law enforcement coordination',
        'Exchange freeze requests',
        'Legal documentation preparation',
        'Court testimony when required',
      ],
      methodology: [
        'Immediate threat assessment within 1 hour',
        'Multi-vector investigation approach',
        'Real-time blockchain monitoring',
        'Strategic recovery planning',
      ],
      pricing: 'Case-by-case (10-20% success fee)',
      color: 'green' as const,
    },
    {
      icon: ChartBarIcon,
      title: 'Compliance Automation',
      subtitle: 'KYC/AML for 150+ Jurisdictions',
      description: 'Automated regulatory compliance across global jurisdictions. Stay compliant with evolving regulations while focusing on your investments.',
      features: [
        'KYC/AML compliance for 150+ countries',
        'Automated regulatory reporting',
        'Deadline tracking and alerts',
        'Document generation and filing',
        'Regulatory change notifications',
        'Audit trail maintenance',
      ],
      methodology: [
        'Real-time regulation monitoring',
        'Automated compliance scoring',
        'Risk assessment algorithms',
        'Regulatory sandbox testing',
      ],
      pricing: 'Included in Guardian+ plans',
      color: 'orange' as const,
    },
  ];

  const additionalServices = [
    {
      icon: DocumentTextIcon,
      title: 'Tax Reporting',
      description: 'Automated IRS Form 8949 generation with exchange integration',
      price: '$99/report',
    },
    {
      icon: CpuChipIcon,
      title: 'Security Audits',
      description: 'Smart contract audits, wallet security reviews, penetration testing',
      price: 'From $10K',
    },
    {
      icon: UserGroupIcon,
      title: 'Team Training',
      description: 'Security awareness training for your team and family',
      price: 'From $5K',
    },
  ];

  const credentials = [
    {
      title: 'Government Security Clearances',
      description: 'Active clearances with multiple agencies',
      verified: true,
    },
    {
      title: '6 Professional Certifications',
      description: 'CISSP, CEH, OSCP, GCIH, GPEN, GCFA',
      verified: true,
    },
    {
      title: '20+ Years Hacking Experience',
      description: 'Both offensive and defensive security expertise',
      verified: true,
    },
    {
      title: '2 Technical Diplomas',
      description: 'Computer Science and Cybersecurity specializations',
      verified: true,
    },
  ];

  const caseStudies = [
    {
      title: '$1.2M Tornado Cash Recovery',
      challenge: 'Client lost funds to sophisticated mixer attack',
      approach: 'Traced exit transactions, identified exchange deposits, coordinated freeze',
      result: '100% recovery in 18 days',
      timeline: '18 days',
    },
    {
      title: 'Multi-Chain Hacker Tracking',
      challenge: 'Attacker moved funds across 15 wallets on 5 different chains',
      approach: 'Cross-chain analysis, dark web monitoring, social engineering',
      result: 'Hacker identified and funds recovered',
      timeline: '12 days',
    },
    {
      title: 'Real-Time Phishing Prevention',
      challenge: '$500K approval transaction detected in real-time',
      approach: 'Automated monitoring triggered alert, manual intervention blocked tx',
      result: '$0 lost, attack prevented',
      timeline: '< 2 minutes',
    },
  ];

  return (
    <SEOHead page="services">
      <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-cyan-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
              <span className="ml-2 text-xl font-bold text-white">VAULTGUARD</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => navigate('/')} className="text-gray-300 hover:text-cyan-400 transition-colors">Home</button>
              <button onClick={() => navigate('/services')} className="text-cyan-400 font-semibold">Services</button>
              <button onClick={() => navigate('/pricing')} className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</button>
              <button onClick={() => navigate('/blog')} className="text-gray-300 hover:text-cyan-400 transition-colors">Intelligence</button>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                Elite Security Services
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Real expertise. Real results. Personal attention from a cybersecurity professional 
              with 20+ years of proven experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/pricing')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center group"
              >
                View Pricing
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => window.location.href = 'mailto:sales@vaultguard.io'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
              >
                Schedule Consultation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-20">
            {mainServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <CyberpunkCard glowColor={service.color} className="h-full">
                    <service.icon className="w-16 h-16 text-cyan-400 mb-6" />
                    <h3 className="text-3xl font-bold text-white mb-2">{service.title}</h3>
                    <p className="text-cyan-400 text-lg font-semibold mb-4">{service.subtitle}</p>
                    <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                    <div className="text-2xl font-bold text-cyan-400 mb-6">{service.pricing}</div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                              <span className="text-gray-400 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-bold text-white mb-3">Methodology</h4>
                        <ul className="space-y-2">
                          {service.methodology.map((method, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2"></div>
                              <span className="text-gray-400 text-sm">{method}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CyberpunkCard>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-4">
                          {index === 0 ? '24/7' : index === 1 ? '50+' : index === 2 ? '94.7%' : '150+'}
                        </div>
                        <div className="text-gray-400 font-mono text-sm">
                          {index === 0 ? 'DARK WEB MONITORING' : 
                           index === 1 ? 'BLOCKCHAIN NETWORKS' : 
                           index === 2 ? 'RECOVERY SUCCESS RATE' : 
                           'JURISDICTIONS COVERED'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Additional Services
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Specialized services available to complement your security strategy
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor="orange" className="h-full text-center">
                  <service.icon className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                  <div className="text-orange-400 font-mono text-lg font-bold">{service.price}</div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Verified Expert Credentials
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Real qualifications from a real cybersecurity professional
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {credentials.map((cred, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor="green" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-500/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{cred.title}</h3>
                      <p className="text-gray-400 text-sm">{cred.description}</p>
                      {cred.verified && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-400 text-xs font-mono">VERIFIED</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Proven Results
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Real cases, real recoveries, real expertise in action
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor="purple" className="h-full">
                  <h3 className="text-xl font-bold text-white mb-3">{study.title}</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 font-mono">CHALLENGE:</span>
                      <p className="text-gray-400 mt-1">{study.challenge}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-mono">APPROACH:</span>
                      <p className="text-gray-400 mt-1">{study.approach}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-mono">RESULT:</span>
                      <p className="text-green-400 mt-1 font-semibold">{study.result}</p>
                    </div>
                    <div className="pt-2 border-t border-gray-700">
                      <span className="text-cyan-400 font-mono text-lg">{study.timeline}</span>
                    </div>
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <CyberpunkCard glowColor="cyan" variant="glass">
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Secure Your Assets?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Don't wait for an attack. Get elite protection from a real cybersecurity expert.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200"
                >
                  View Pricing Plans
                </button>
                <button
                  onClick={() => window.location.href = 'mailto:sales@vaultguard.io'}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  Schedule Consultation
                </button>
              </div>
            </div>
          </CyberpunkCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2024 VaultGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </SEOHead>
  );
}