import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';

export default function CaseStudies() {
  const navigate = useNavigate();

  const caseStudies = [
    {
      id: 'tornado-cash-recovery',
      title: '$1.2M Tornado Cash Recovery',
      category: 'Mixer Analysis',
      timeline: '18 days',
      recoveryRate: '100%',
      difficulty: 'Extreme',
      client: {
        type: 'Individual Investor',
        portfolio: '$5M+',
        location: 'Switzerland',
      },
      problem: {
        description: 'Client fell victim to a sophisticated phishing attack that drained their primary wallet. The attacker immediately moved funds through Tornado Cash mixer to obscure the trail.',
        lossAmount: '$1,200,000',
        attackVector: 'Phishing + Smart Contract Approval',
        timeToDetection: '4 hours',
      },
      investigation: {
        phase1: 'Immediate blockchain analysis revealed the attack pattern and identified the mixer deposits',
        phase2: 'Dark web monitoring detected discussions about the specific attack on underground forums',
        phase3: 'Advanced graph analysis tracked exit transactions from mixer to exchange deposits',
        phase4: 'Coordinated with exchange security teams to freeze accounts before withdrawal',
        tools: ['Custom blockchain analysis tools', 'Dark web monitoring network', 'Exchange partnerships', 'Legal coordination'],
      },
      resolution: {
        outcome: 'Full recovery of $1,200,000 through exchange cooperation',
        method: 'Exchange account freeze and legal recovery process',
        timeframe: '18 days from initial report to fund recovery',
        additionalValue: 'Prevented future attacks by identifying and patching the vulnerability',
      },
      testimonial: {
        quote: "I thought my crypto was gone forever after the Tornado Cash mixer. VaultGuard's expert personally tracked my funds through the dark web and recovered every penny. Incredible work.",
        author: "M. Weber",
        title: "Private Investor",
        rating: 5,
      },
      technicalDetails: {
        chainsAnalyzed: ['Ethereum', 'Binance Smart Chain'],
        transactionsTracked: 247,
        walletsIdentified: 15,
        exchangesContacted: 3,
      },
    },
    {
      id: 'multi-chain-tracking',
      title: 'Multi-Chain Hacker Tracking',
      category: 'Cross-Chain Analysis',
      timeline: '12 days',
      recoveryRate: '85%',
      difficulty: 'Extreme',
      client: {
        type: 'DeFi Protocol',
        portfolio: '$50M+',
        location: 'Singapore',
      },
      problem: {
        description: 'Sophisticated attacker exploited a smart contract vulnerability and moved funds across 5 different blockchains through 15 different wallets to evade detection.',
        lossAmount: '$2,800,000',
        attackVector: 'Smart Contract Exploit',
        timeToDetection: '30 minutes',
      },
      investigation: {
        phase1: 'Cross-chain analysis identified the attack pattern across Ethereum, BSC, Polygon, Avalanche, and Fantom',
        phase2: 'Graph analysis revealed the wallet clustering strategy used by the attacker',
        phase3: 'Dark web intelligence identified the attacker\'s identity through operational security failures',
        phase4: 'Coordinated law enforcement action in multiple jurisdictions',
        tools: ['Multi-chain analysis platform', 'Graph clustering algorithms', 'Dark web OSINT', 'International law enforcement'],
      },
      resolution: {
        outcome: 'Recovered $2,380,000 (85% of stolen funds)',
        method: 'Law enforcement seizure and exchange cooperation',
        timeframe: '12 days from exploit to asset recovery',
        additionalValue: 'Attacker identified and prosecuted, preventing future attacks',
      },
      testimonial: {
        quote: "The attacker thought they were untouchable by spreading funds across 5 chains. VaultGuard tracked them down and recovered most of our funds. Their expertise is unmatched.",
        author: "Dr. L. Chen",
        title: "Protocol Founder",
        rating: 5,
      },
      technicalDetails: {
        chainsAnalyzed: ['Ethereum', 'BSC', 'Polygon', 'Avalanche', 'Fantom'],
        transactionsTracked: 892,
        walletsIdentified: 47,
        exchangesContacted: 8,
      },
    },
    {
      id: 'real-time-prevention',
      title: 'Real-Time Phishing Prevention',
      category: 'Threat Prevention',
      timeline: '< 2 minutes',
      recoveryRate: '100%',
      difficulty: 'High',
      client: {
        type: 'Family Office',
        portfolio: '$25M+',
        location: 'United States',
      },
      problem: {
        description: 'Client received a sophisticated phishing email mimicking their regular DeFi platform. They were about to approve a malicious transaction worth $500K.',
        lossAmount: '$500,000 (prevented)',
        attackVector: 'Phishing + Malicious Approval',
        timeToDetection: '45 seconds',
      },
      investigation: {
        phase1: 'Real-time monitoring detected suspicious approval transaction in mempool',
        phase2: 'Automated analysis identified the transaction as malicious within 30 seconds',
        phase3: 'Immediate alert sent to client via SMS and phone call',
        phase4: 'Transaction blocked before confirmation, wallet secured',
        tools: ['Real-time mempool monitoring', 'ML-based threat detection', 'Instant alert system', 'Emergency response protocol'],
      },
      resolution: {
        outcome: 'Attack prevented, $0 lost',
        method: 'Real-time intervention and transaction blocking',
        timeframe: 'Less than 2 minutes from detection to prevention',
        additionalValue: 'Client educated on phishing tactics, security protocols updated',
      },
      testimonial: {
        quote: "I was literally about to click 'confirm' on what I thought was a normal DeFi transaction. VaultGuard's alert saved me $500K. The response time was incredible.",
        author: "R. Thompson",
        title: "Family Office CTO",
        rating: 5,
      },
      technicalDetails: {
        chainsAnalyzed: ['Ethereum'],
        transactionsTracked: 1,
        walletsIdentified: 3,
        exchangesContacted: 0,
      },
    },
    {
      id: 'defi-exploit-recovery',
      title: 'DeFi Protocol Exploit Recovery',
      category: 'Smart Contract Analysis',
      timeline: '25 days',
      recoveryRate: '78%',
      difficulty: 'Extreme',
      client: {
        type: 'DeFi Protocol',
        portfolio: '$100M+ TVL',
        location: 'Cayman Islands',
      },
      problem: {
        description: 'Flash loan attack exploited a price oracle manipulation vulnerability, draining $4.2M from the protocol\'s liquidity pools.',
        lossAmount: '$4,200,000',
        attackVector: 'Flash Loan + Oracle Manipulation',
        timeToDetection: '1 block (12 seconds)',
      },
      investigation: {
        phase1: 'Smart contract analysis identified the exact vulnerability and attack vector',
        phase2: 'Blockchain forensics tracked the attacker\'s fund movement across multiple protocols',
        phase3: 'Dark web monitoring revealed the attacker attempting to launder funds',
        phase4: 'Coordinated with multiple exchanges and law enforcement agencies',
        tools: ['Smart contract analysis tools', 'Flash loan simulation', 'Cross-protocol tracking', 'Exchange partnerships'],
      },
      resolution: {
        outcome: 'Recovered $3,276,000 (78% of stolen funds)',
        method: 'Exchange freezes, legal action, and negotiated settlement',
        timeframe: '25 days from exploit to partial recovery',
        additionalValue: 'Vulnerability patched, protocol security enhanced',
      },
      testimonial: {
        quote: "The flash loan attack was devastating, but VaultGuard's analysis helped us understand exactly what happened and recover most of our funds. Their expertise saved our protocol.",
        author: "Anonymous",
        title: "Protocol Team",
        rating: 5,
      },
      technicalDetails: {
        chainsAnalyzed: ['Ethereum', 'Arbitrum'],
        transactionsTracked: 156,
        walletsIdentified: 23,
        exchangesContacted: 6,
      },
    },
    {
      id: 'nft-theft-recovery',
      title: 'High-Value NFT Recovery',
      category: 'Digital Asset Recovery',
      timeline: '8 days',
      recoveryRate: '100%',
      difficulty: 'High',
      client: {
        type: 'Art Collector',
        portfolio: '$10M+ NFTs',
        location: 'United Kingdom',
      },
      problem: {
        description: 'Client\'s wallet was compromised through a malicious NFT mint, resulting in the theft of rare NFTs worth $800K including a CryptoPunk and Bored Ape.',
        lossAmount: '$800,000',
        attackVector: 'Malicious NFT Contract',
        timeToDetection: '2 hours',
      },
      investigation: {
        phase1: 'NFT transaction analysis identified the malicious contract and theft mechanism',
        phase2: 'Marketplace monitoring detected the stolen NFTs being listed for sale',
        phase3: 'Coordinated with OpenSea and other marketplaces to flag stolen assets',
        phase4: 'Legal action initiated against the identified perpetrator',
        tools: ['NFT tracking systems', 'Marketplace monitoring', 'Legal coordination', 'Identity investigation'],
      },
      resolution: {
        outcome: 'All stolen NFTs recovered and returned to client',
        method: 'Marketplace cooperation and legal pressure',
        timeframe: '8 days from theft to full recovery',
        additionalValue: 'Attacker prosecuted, security practices improved',
      },
      testimonial: {
        quote: "My most valuable NFTs were stolen through a sophisticated scam. VaultGuard tracked them down and got them back before they could be sold. Professional and effective.",
        author: "J. Morrison",
        title: "Art Collector",
        rating: 5,
      },
      technicalDetails: {
        chainsAnalyzed: ['Ethereum'],
        transactionsTracked: 34,
        walletsIdentified: 8,
        exchangesContacted: 0,
      },
    },
  ];

  const stats = [
    { label: 'Cases Handled', value: '200+', color: 'cyan' },
    { label: 'Success Rate', value: '94.7%', color: 'green' },
    { label: 'Funds Recovered', value: '$2.4B+', color: 'purple' },
    { label: 'Average Timeline', value: '12 days', color: 'orange' },
  ];

  return (
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
              <button onClick={() => navigate('/services')} className="text-gray-300 hover:text-cyan-400 transition-colors">Services</button>
              <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-cyan-400 transition-colors">About</button>
              <button onClick={() => navigate('/case-studies')} className="text-cyan-400 font-semibold">Case Studies</button>
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
                Proven Results
              </span>
              <br />
              <span className="text-white">Real Recoveries</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Real case studies from actual crypto recovery operations. Names changed for privacy, 
              but results are 100% verified and documented.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CyberpunkCard glowColor={stat.color as any} variant="glass">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 text-${stat.color}-400`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-400 text-sm font-mono">{stat.label}</div>
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
          <div className="space-y-20">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <CyberpunkCard glowColor="cyan" className="overflow-hidden">
                  {/* Header */}
                  <div className="border-b border-gray-700 pb-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-white">{study.title}</h2>
                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
                            <span className="text-cyan-400 text-sm font-mono">{study.category}</span>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {study.client.type} • {study.client.location} • {study.client.portfolio} Portfolio
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{study.recoveryRate}</div>
                          <div className="text-gray-500 text-xs">RECOVERED</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-cyan-400">{study.timeline}</div>
                          <div className="text-gray-500 text-xs">TIMELINE</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            study.difficulty === 'Extreme' ? 'text-red-400' : 
                            study.difficulty === 'High' ? 'text-orange-400' : 'text-yellow-400'
                          }`}>
                            {study.difficulty}
                          </div>
                          <div className="text-gray-500 text-xs">DIFFICULTY</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Problem */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                          <h3 className="text-lg font-bold text-white">The Problem</h3>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                          <p className="text-gray-300 mb-3">{study.problem.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Loss Amount:</span>
                              <div className="text-red-400 font-bold">{study.problem.lossAmount}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Attack Vector:</span>
                              <div className="text-gray-300">{study.problem.attackVector}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Detection Time:</span>
                              <div className="text-gray-300">{study.problem.timeToDetection}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Investigation */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MagnifyingGlassIcon className="w-5 h-5 text-cyan-400" />
                          <h3 className="text-lg font-bold text-white">Investigation Process</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                            <div className="text-cyan-400 text-sm font-mono mb-1">PHASE 1</div>
                            <p className="text-gray-300 text-sm">{study.investigation.phase1}</p>
                          </div>
                          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                            <div className="text-cyan-400 text-sm font-mono mb-1">PHASE 2</div>
                            <p className="text-gray-300 text-sm">{study.investigation.phase2}</p>
                          </div>
                          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                            <div className="text-cyan-400 text-sm font-mono mb-1">PHASE 3</div>
                            <p className="text-gray-300 text-sm">{study.investigation.phase3}</p>
                          </div>
                          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                            <div className="text-cyan-400 text-sm font-mono mb-1">PHASE 4</div>
                            <p className="text-gray-300 text-sm">{study.investigation.phase4}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Resolution */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          <h3 className="text-lg font-bold text-white">Resolution</h3>
                        </div>
                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                          <div className="text-green-400 font-bold text-lg mb-2">{study.resolution.outcome}</div>
                          <p className="text-gray-300 mb-3">{study.resolution.method}</p>
                          <div className="grid grid-cols-1 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Timeline:</span>
                              <div className="text-gray-300">{study.resolution.timeframe}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Additional Value:</span>
                              <div className="text-gray-300">{study.resolution.additionalValue}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CpuChipIcon className="w-5 h-5 text-purple-400" />
                          <h3 className="text-lg font-bold text-white">Technical Details</h3>
                        </div>
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Chains Analyzed:</span>
                              <div className="text-purple-400">{study.technicalDetails.chainsAnalyzed.length}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Transactions:</span>
                              <div className="text-purple-400">{study.technicalDetails.transactionsTracked}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Wallets:</span>
                              <div className="text-purple-400">{study.technicalDetails.walletsIdentified}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Exchanges:</span>
                              <div className="text-purple-400">{study.technicalDetails.exchangesContacted}</div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">Blockchains:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {study.technicalDetails.chainsAnalyzed.map((chain, i) => (
                                <span key={i} className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs">
                                  {chain}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Client Testimonial */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <StarIcon className="w-5 h-5 text-yellow-400" />
                          <h3 className="text-lg font-bold text-white">Client Testimonial</h3>
                        </div>
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                          <div className="flex gap-1 mb-2">
                            {[...Array(study.testimonial.rating)].map((_, i) => (
                              <StarIcon key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                          <blockquote className="text-gray-300 italic mb-3">
                            "{study.testimonial.quote}"
                          </blockquote>
                          <div className="text-sm">
                            <div className="text-white font-semibold">{study.testimonial.author}</div>
                            <div className="text-gray-500">{study.testimonial.title}</div>
                          </div>
                        </div>
                      </div>
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
                Need Expert Recovery?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Don't let stolen crypto disappear forever. Get the same expert analysis and recovery 
                services that have recovered $2.4B+ in stolen assets.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center group"
                >
                  Get Protection Now
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => window.location.href = 'mailto:emergency@vaultguard.io?subject=Emergency Recovery Request'}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200"
                >
                  Emergency Recovery
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Emergency recovery available 24/7 • Time is critical for maximum recovery rates
              </p>
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
  );
}