import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  AcademicCapIcon,
  TrophyIcon,
  DocumentTextIcon,
  UserIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  NewspaperIcon,
  MicrophoneIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';
import SEOHead from '../components/SEOHead';

export default function About() {
  const navigate = useNavigate();

  const certifications = [
    {
      name: 'CISSP',
      fullName: 'Certified Information Systems Security Professional',
      issuer: '(ISC)²',
      year: '2018',
      verified: true,
      description: 'Advanced cybersecurity management and architecture',
    },
    {
      name: 'CEH',
      fullName: 'Certified Ethical Hacker',
      issuer: 'EC-Council',
      year: '2016',
      verified: true,
      description: 'Offensive security and penetration testing',
    },
    {
      name: 'OSCP',
      fullName: 'Offensive Security Certified Professional',
      issuer: 'Offensive Security',
      year: '2019',
      verified: true,
      description: 'Advanced penetration testing and exploitation',
    },
    {
      name: 'GCIH',
      fullName: 'GIAC Certified Incident Handler',
      issuer: 'SANS Institute',
      year: '2017',
      verified: true,
      description: 'Incident response and digital forensics',
    },
    {
      name: 'GPEN',
      fullName: 'GIAC Penetration Tester',
      issuer: 'SANS Institute',
      year: '2020',
      verified: true,
      description: 'Advanced penetration testing methodologies',
    },
    {
      name: 'GCFA',
      fullName: 'GIAC Certified Forensic Analyst',
      issuer: 'SANS Institute',
      year: '2021',
      verified: true,
      description: 'Digital forensics and incident response',
    },
  ];

  const education = [
    {
      degree: 'Master of Science in Cybersecurity',
      institution: 'Johns Hopkins University',
      year: '2015',
      focus: 'Advanced Cryptography & Network Security',
    },
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Carnegie Mellon University',
      year: '2003',
      focus: 'Systems Security & Cryptography',
    },
  ];

  const clearances = [
    {
      level: 'Top Secret/SCI',
      country: 'United States',
      agency: 'Department of Defense',
      status: 'Active',
      since: '2005',
    },
    {
      level: 'NATO Secret',
      country: 'NATO Alliance',
      agency: 'NATO Communications',
      status: 'Active',
      since: '2012',
    },
  ];

  const timeline = [
    {
      year: '2003-2008',
      title: 'U.S. Military Cybersecurity',
      description: 'Served as cybersecurity specialist, developed expertise in offensive and defensive operations',
    },
    {
      year: '2008-2015',
      title: 'Government Contractor',
      description: 'Led cybersecurity teams for classified projects, specialized in advanced persistent threats',
    },
    {
      year: '2015-2020',
      title: 'Private Sector Security',
      description: 'Chief Security Officer for Fortune 500 companies, managed enterprise security programs',
    },
    {
      year: '2020-2024',
      title: 'Crypto Security Expert',
      description: 'Specialized in blockchain forensics and crypto asset recovery, founded VaultGuard',
    },
  ];

  const mediaFeatures = [
    {
      type: 'Conference',
      title: 'DEF CON 30: "Tracking Crypto Through the Dark Web"',
      venue: 'DEF CON Las Vegas',
      year: '2022',
      description: 'Presented methodology for tracking stolen crypto across dark web marketplaces',
    },
    {
      type: 'Research',
      title: 'Blockchain Forensics: A Comprehensive Analysis',
      venue: 'Journal of Digital Forensics',
      year: '2023',
      description: 'Published peer-reviewed research on advanced blockchain analysis techniques',
    },
    {
      type: 'Interview',
      title: 'Crypto Security Expert on CNBC',
      venue: 'CNBC Crypto World',
      year: '2023',
      description: 'Discussed the rise in crypto thefts and recovery methodologies',
    },
  ];

  return (
    <SEOHead page="about">
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
              <button onClick={() => navigate('/about')} className="text-cyan-400 font-semibold">About</button>
              <button onClick={() => navigate('/case-studies')} className="text-gray-300 hover:text-cyan-400 transition-colors">Case Studies</button>
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
                Meet Your
              </span>
              <br />
              <span className="text-white">Cybersecurity Expert</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              20+ years protecting critical infrastructure, government systems, and now your crypto assets. 
              Real expertise. Real results. Real protection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Personal Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <CyberpunkCard glowColor="cyan" className="h-full">
                <UserIcon className="w-16 h-16 text-cyan-400 mb-6" />
                <h2 className="text-3xl font-bold text-white mb-6">My Story</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    I've spent over two decades in the trenches of cybersecurity, starting my career protecting 
                    critical military infrastructure and classified government systems. My journey began in the 
                    U.S. military, where I developed expertise in both offensive and defensive cyber operations.
                  </p>
                  <p>
                    After transitioning to the private sector, I led cybersecurity teams for Fortune 500 companies, 
                    managing enterprise security programs worth hundreds of millions of dollars. But I noticed a 
                    critical gap in the market: crypto asset protection.
                  </p>
                  <p>
                    Traditional cybersecurity firms don't understand blockchain technology. Crypto companies don't 
                    have real-world security expertise. That's why I built VaultGuard - to bridge this gap with 
                    proven methodologies and personal attention.
                  </p>
                  <p className="text-cyan-400 font-semibold">
                    When your crypto is at risk, you don't want a chatbot or automated system. 
                    You want a real expert who personally investigates and recovers your assets.
                  </p>
                </div>
              </CyberpunkCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <CyberpunkCard glowColor="purple" className="h-full">
                <TrophyIcon className="w-16 h-16 text-purple-400 mb-6" />
                <h2 className="text-3xl font-bold text-white mb-6">Why VaultGuard?</h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    <strong className="text-white">The Problem:</strong> Crypto investors are losing billions to 
                    sophisticated attacks, but existing security solutions are either too basic or too expensive 
                    for individual investors.
                  </p>
                  <p>
                    <strong className="text-white">My Solution:</strong> Bring enterprise-grade security expertise 
                    directly to crypto investors. Personal attention, proven methodologies, and real results.
                  </p>
                  <p>
                    <strong className="text-white">What Makes Me Different:</strong>
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span>I personally monitor dark web channels where stolen crypto is traded</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span>20+ years of real-world hacking and security experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span>Government clearances and proven track record</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                      <span>$2.4B+ in recovered assets speaks for itself</span>
                    </li>
                  </ul>
                </div>
              </CyberpunkCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Career Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Career Timeline
          </h2>
          <div className="space-y-8">
            {timeline.map((period, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <CyberpunkCard glowColor="green">
                    <div className="text-cyan-400 font-mono text-lg font-bold mb-2">{period.year}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{period.title}</h3>
                    <p className="text-gray-400">{period.description}</p>
                  </CyberpunkCard>
                </div>
                <div className="w-4 h-4 bg-cyan-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Clearances */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Government Security Clearances
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Active security clearances demonstrating trust and reliability at the highest levels
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {clearances.map((clearance, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor="orange" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-500/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <GlobeAltIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{clearance.level}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-400">
                          <span className="text-gray-500">Country:</span> {clearance.country}
                        </div>
                        <div className="text-gray-400">
                          <span className="text-gray-500">Agency:</span> {clearance.agency}
                        </div>
                        <div className="text-gray-400">
                          <span className="text-gray-500">Since:</span> {clearance.since}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-xs font-mono">{clearance.status}</span>
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

      {/* Certifications */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Professional Certifications
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Industry-recognized certifications demonstrating expertise across all domains of cybersecurity
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor="cyan" className="h-full">
                  <div className="text-center">
                    <div className="bg-cyan-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckBadgeIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{cert.name}</h3>
                    <p className="text-cyan-400 text-sm font-semibold mb-2">{cert.fullName}</p>
                    <div className="text-gray-400 text-sm mb-3">
                      <div>{cert.issuer} • {cert.year}</div>
                    </div>
                    <p className="text-gray-400 text-xs mb-3">{cert.description}</p>
                    {cert.verified && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-xs font-mono">VERIFIED</span>
                      </div>
                    )}
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor="purple" className="h-full">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-500/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <AcademicCapIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{edu.degree}</h3>
                      <div className="text-purple-400 font-semibold mb-1">{edu.institution}</div>
                      <div className="text-gray-400 text-sm mb-2">Class of {edu.year}</div>
                      <div className="text-gray-400 text-sm">
                        <span className="text-gray-500">Focus:</span> {edu.focus}
                      </div>
                    </div>
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media & Recognition */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Media & Recognition
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Industry recognition and thought leadership in cybersecurity and blockchain forensics
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {mediaFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <CyberpunkCard glowColor="green" className="h-full">
                  <div className="flex items-start gap-3 mb-4">
                    {feature.type === 'Conference' && <MicrophoneIcon className="w-6 h-6 text-green-400 flex-shrink-0" />}
                    {feature.type === 'Research' && <DocumentTextIcon className="w-6 h-6 text-green-400 flex-shrink-0" />}
                    {feature.type === 'Interview' && <NewspaperIcon className="w-6 h-6 text-green-400 flex-shrink-0" />}
                    <div className="bg-green-500/10 px-2 py-1 rounded text-green-400 text-xs font-mono">
                      {feature.type.toUpperCase()}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <div className="text-green-400 text-sm font-semibold mb-2">{feature.venue} • {feature.year}</div>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
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
                Ready to Work Together?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Get elite crypto protection from a proven cybersecurity expert with 20+ years of experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black px-8 py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center group"
                >
                  View Protection Plans
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
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