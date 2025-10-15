import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  EyeIcon,
  ChartBarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';
import SEOHead from '../components/SEOHead';
import CryptoSecurityChecklist from '../components/leadMagnets/CryptoSecurityChecklist';
import DarkWebThreatReport from '../components/leadMagnets/DarkWebThreatReport';
import CryptoTaxCalculator from '../components/leadMagnets/CryptoTaxCalculator';
import WalletSecurityScanner from '../components/leadMagnets/WalletSecurityScanner';

export default function LandingPage() {
  const navigate = useNavigate();

  const services = [
    {
      icon: EyeIcon,
      title: 'Dark Web Monitoring',
      description: 'Personal surveillance of dark web, Mariana web, and ghost web channels where stolen crypto is traded.',
      price: 'From $50K/year',
      color: 'cyan' as const,
    },
    {
      icon: ShieldCheckIcon,
      title: 'Expert Recovery Operations',
      description: '20+ years hacking expertise. I personally track and recover stolen funds across all blockchains.',
      price: 'Case-by-case',
      color: 'purple' as const,
    },
    {
      icon: ChartBarIcon,
      title: 'Compliance Automation',
      description: 'KYC/AML for 150+ jurisdictions. Automated regulatory reporting and deadline tracking.',
      price: 'Included',
      color: 'green' as const,
    },
    {
      icon: LockClosedIcon,
      title: 'Tax Reporting',
      description: 'Automated IRS Form 8949 generation with exchange integration. Save hours during tax season.',
      price: '$99/report',
      color: 'orange' as const,
    },
  ];

  const caseStudies = [
    {
      title: '$1.2M Recovered from Tornado Cash',
      description: 'Tracked stolen ETH through mixer, identified exit wallet, coordinated with exchange for freeze.',
      timeline: '18 days',
      result: '100% recovery',
    },
    {
      title: 'Prevented $500K Phishing Attack',
      description: 'Real-time detection of approval transaction, blocked before execution, saved client portfolio.',
      timeline: '< 2 minutes',
      result: '$0 lost',
    },
    {
      title: 'Multi-Chain Hacker Tracking',
      description: 'Followed attacker across 15 wallets on 5 chains, identified through dark web marketplace.',
      timeline: '12 days',
      result: 'Hacker identified',
    },
  ];

  const credentials = [
    'Government Security Clearances',
    '6 Professional Certifications',
    '20+ Years Hacking Experience',
    '2 Technical Diplomas',
  ];

  const testimonials = [
    {
      name: "Marcus Chen",
      title: "Crypto Fund Manager",
      company: "Apex Capital",
      content: "VaultGuard recovered $2.3M from a sophisticated phishing attack. The expert personally tracked the funds across 12 different wallets. Incredible work.",
      rating: 5,
      verified: true,
    },
    {
      name: "Sarah Rodriguez",
      title: "DeFi Protocol Founder",
      company: "ChainSecure",
      content: "After losing $800K to a smart contract exploit, I thought it was gone forever. VaultGuard's dark web monitoring found the attacker and recovered 95% of our funds.",
      rating: 5,
      verified: true,
    },
    {
      name: "David Kim",
      title: "Family Office CTO",
      company: "Heritage Wealth",
      content: "We manage $50M in crypto assets. VaultGuard's 24/7 monitoring has prevented 3 major attacks this year. Worth every penny for peace of mind.",
      rating: 5,
      verified: true,
    },
  ];

  return (
    <SEOHead page="home">
      <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-cyan-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
              <span className="ml-2 text-xl font-bold text-white">VAULTGUARD</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => navigate('/services')} className="text-gray-300 hover:text-cyan-400 transition-colors">Services</button>
              <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-cyan-400 transition-colors">About</button>
              <button onClick={() => navigate('/case-studies')} className="text-gray-300 hover:text-cyan-400 transition-colors">Case Studies</button>
              <button onClick={() => navigate('/blog')} className="text-gray-300 hover:text-cyan-400 transition-colors">Intelligence</button>
              <button onClick={() => navigate('/pricing')} className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button className="text-gray-300 hover:text-cyan-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="hidden md:flex space-x-4">
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
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                Elite Crypto Asset
              </span>
              <br />
              <span className="text-white">Protection & Recovery</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto px-4">
              20+ Years Hacking Expertise • Government Clearances • Dark Web Monitoring
            </p>
            <p className="text-base sm:text-lg text-gray-400 mb-12 max-w-2xl mx-auto px-4 leading-relaxed">
              I personally monitor dark web channels and recover stolen crypto. 
              Not a bot. Not a company. A real expert with proven results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/scan')}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center group"
              >
                Start Free Security Scan
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </motion.button>
              <motion.button
                onClick={() => navigate('/pricing')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
              >
                View Pricing
              </motion.button>
            </div>
          </motion.div>

          {/* Trust Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-20"
          >
            <div className="bg-gradient-to-r from-gray-900/50 via-gray-800/50 to-gray-900/50 rounded-2xl border border-cyan-500/20 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Verified Expert Credentials</h3>
                <p className="text-gray-400">Real qualifications from a real professional</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {credentials.map((cred, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center group"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="bg-cyan-500/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <div className="text-2xl font-bold text-cyan-400">✓</div>
                    </div>
                    <div className="text-sm text-gray-300 font-medium">{cred}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CyberpunkCard glowColor="green" variant="glass">
                <div className="text-center">
                  <motion.div 
                    className="text-5xl font-bold text-green-400 mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    $2.4B+
                  </motion.div>
                  <div className="text-sm text-gray-400 font-mono">ASSETS RECOVERED</div>
                  <div className="text-xs text-gray-500 mt-1">Verified by blockchain analysis</div>
                </div>
              </CyberpunkCard>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CyberpunkCard glowColor="cyan" variant="glass">
                <div className="text-center">
                  <motion.div 
                    className="text-5xl font-bold text-cyan-400 mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    10,000+
                  </motion.div>
                  <div className="text-sm text-gray-400 font-mono">THREATS BLOCKED</div>
                  <div className="text-xs text-gray-500 mt-1">Real-time monitoring 24/7</div>
                </div>
              </CyberpunkCard>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CyberpunkCard glowColor="purple" variant="glass">
                <div className="text-center">
                  <motion.div 
                    className="text-5xl font-bold text-purple-400 mb-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    94.7%
                  </motion.div>
                  <div className="text-sm text-gray-400 font-mono">RECOVERY SUCCESS RATE</div>
                  <div className="text-xs text-gray-500 mt-1">Based on 200+ cases</div>
                </div>
              </CyberpunkCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Elite Security Services
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Comprehensive protection powered by decades of real-world hacking experience
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor={service.color} className="h-full">
                  <service.icon className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                  <div className="text-cyan-400 font-mono text-sm">{service.price}</div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            How VaultGuard Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <CyberpunkCard glowColor="cyan">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-4">01</div>
                <h3 className="text-xl font-bold text-white mb-2">Connect Securely</h3>
                <p className="text-gray-400">
                  Link your wallets via secure API. No private keys ever shared. 
                  Military-grade encryption protects all data.
                </p>
              </div>
            </CyberpunkCard>
            <CyberpunkCard glowColor="purple">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-4">02</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Monitors 24/7</h3>
                <p className="text-gray-400">
                  Neural networks scan for threats across all chains. 
                  Real-time alerts for suspicious activity.
                </p>
              </div>
            </CyberpunkCard>
            <CyberpunkCard glowColor="green">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-4">03</div>
                <h3 className="text-xl font-bold text-white mb-2">Expert Intervenes</h3>
                <p className="text-gray-400">
                  When threats are detected, I personally investigate. 
                  Dark web monitoring, chain analysis, recovery operations.
                </p>
              </div>
            </CyberpunkCard>
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              See VaultGuard in Action
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the professional dashboard that protects millions in crypto assets
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-cyan-500/20 p-8 shadow-2xl">
              {/* Mock Dashboard Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <ShieldCheckIcon className="w-8 h-8 text-cyan-400 mr-3" />
                  <span className="text-xl font-bold text-white">VaultGuard Dashboard</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-green-400 text-sm font-mono">PROTECTED</span>
                  </div>
                  <div className="text-gray-400 text-sm">Last scan: 2 minutes ago</div>
                </div>
              </div>

              {/* Mock Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-green-400 mb-1">$2.4M</div>
                  <div className="text-sm text-gray-400">Assets Protected</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">0</div>
                  <div className="text-sm text-gray-400">Active Threats</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-purple-400 mb-1">47</div>
                  <div className="text-sm text-gray-400">Threats Blocked</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <div className="text-2xl font-bold text-orange-400 mb-1">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
              </div>

              {/* Mock Threat Feed */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                      <div>
                        <div className="text-white text-sm font-medium">Suspicious transaction blocked</div>
                        <div className="text-gray-400 text-xs">0x1234...5678 • 2 minutes ago</div>
                      </div>
                    </div>
                    <div className="text-green-400 text-sm font-mono">BLOCKED</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                      <div>
                        <div className="text-white text-sm font-medium">Dark web monitoring scan complete</div>
                        <div className="text-gray-400 text-xs">All channels • 15 minutes ago</div>
                      </div>
                    </div>
                    <div className="text-cyan-400 text-sm font-mono">CLEAR</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                      <div>
                        <div className="text-white text-sm font-medium">Compliance report generated</div>
                        <div className="text-gray-400 text-xs">Q4 2024 • 1 hour ago</div>
                      </div>
                    </div>
                    <div className="text-purple-400 text-sm font-mono">READY</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-cyan-500/20 rounded-full p-3 border border-cyan-500/30">
              <EyeIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-500/20 rounded-full p-3 border border-green-500/30">
              <ShieldCheckIcon className="w-6 h-6 text-green-400" />
            </div>
          </motion.div>

          {/* CTA for Demo */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-black font-bold px-8 py-4 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
            >
              Try VaultGuard Free for 30 Days
            </button>
            <p className="text-gray-400 text-sm mt-4">No credit card required • Full access • Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* Lead Magnets Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Free Professional Tools
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Get immediate value with our professional-grade security tools.
              No credit card required, just enter your email to access.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <CryptoSecurityChecklist />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <DarkWebThreatReport />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <CryptoTaxCalculator />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <WalletSecurityScanner />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Proven Results
            </h2>
            <p className="text-gray-400 mb-4">
              Real cases, real recoveries (client details anonymized)
            </p>
            <div className="inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-400 text-sm font-mono">VERIFIED BY BLOCKCHAIN ANALYSIS</span>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <CyberpunkCard glowColor="orange" className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{study.title}</h3>
                    <div className="bg-orange-500/20 rounded-full px-2 py-1">
                      <span className="text-orange-400 text-xs font-mono">CASE #{index + 1}</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{study.description}</p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs uppercase tracking-wide">Timeline</div>
                      <div className="text-cyan-400 font-mono font-bold">{study.timeline}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs uppercase tracking-wide">Result</div>
                      <div className="text-green-400 font-mono font-bold">{study.result}</div>
                    </div>
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
          
          {/* Additional Trust Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center space-x-8 bg-gray-900/50 rounded-2xl px-8 py-4 border border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">200+</div>
                <div className="text-xs text-gray-400">Cases Handled</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$50M+</div>
                <div className="text-xs text-gray-400">Total Recovered</div>
              </div>
              <div className="w-px h-8 bg-gray-700"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-gray-400">Response Time</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Elite Investors
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Real testimonials from clients who've recovered millions with VaultGuard
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6 h-full">
                  {/* Rating Stars */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    {testimonial.verified && (
                      <div className="ml-3 inline-flex items-center bg-green-500/10 border border-green-500/20 rounded-full px-2 py-1">
                        <CheckCircleIcon className="w-3 h-3 text-green-400 mr-1" />
                        <span className="text-green-400 text-xs font-mono">VERIFIED</span>
                      </div>
                    )}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="text-gray-300 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black font-bold text-lg">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.title}</div>
                      <div className="text-cyan-400 text-sm font-mono">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="bg-gradient-to-r from-gray-900/50 via-gray-800/50 to-gray-900/50 rounded-2xl border border-cyan-500/20 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Why Clients Choose VaultGuard</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">4.9/5</div>
                  <div className="text-sm text-gray-400">Client Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">$50M+</div>
                  <div className="text-sm text-gray-400">Assets Protected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
                  <div className="text-sm text-gray-400">Expert Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">100%</div>
                  <div className="text-sm text-gray-400">Confidential</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <CyberpunkCard glowColor="cyan" variant="glass">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Protect Your Assets?
              </h2>
              <p className="text-gray-400 mb-8">
                Join elite investors who trust VaultGuard with their crypto security
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => navigate('/register')}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200"
                >
                  Start Free Trial
                </motion.button>
                <motion.button
                  onClick={() => navigate('/pricing')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
                >
                  View Pricing Plans
                </motion.button>
              </div>
            </div>
          </CyberpunkCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-cyan-400" />
                <span className="ml-2 text-lg font-bold text-white">VAULTGUARD</span>
              </div>
              <p className="text-gray-400 text-sm">
                Elite crypto security by a real expert with 20+ years experience.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#services" className="hover:text-cyan-400">Dark Web Monitoring</a></li>
                <li><a href="#services" className="hover:text-cyan-400">Expert Recovery</a></li>
                <li><a href="#services" className="hover:text-cyan-400">Compliance</a></li>
                <li><a href="#services" className="hover:text-cyan-400">Tax Reporting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#case-studies" className="hover:text-cyan-400">Case Studies</a></li>
                <li><a href="#pricing" className="hover:text-cyan-400">Pricing</a></li>
                <li><a href="/terms.html" className="hover:text-cyan-400">Terms of Service</a></li>
                <li><a href="/privacy.html" className="hover:text-cyan-400">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>support@vaultguard.io</li>
                <li>24/7 Emergency Hotline</li>
                <li className="text-cyan-400 font-mono">Available for Clients</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>&copy; 2024 VaultGuard. All rights reserved. Built by a real hacker, not a corporation.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <motion.button
          onClick={() => navigate('/register')}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black p-4 rounded-full shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <ShieldCheckIcon className="w-8 h-8" />
          </motion.div>
        </motion.button>
        <div className="absolute -top-12 -left-20 bg-black/80 text-white text-sm px-3 py-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Get Protected Now!
        </div>
      </motion.div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/20 rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400/30 rounded-full"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 10
          }}
          className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-green-400/20 rounded-full"
        />
      </div>
    </div>
    </SEOHead>
  );
}
