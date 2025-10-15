import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  CodeBracketIcon,
  CpuChipIcon,
  GlobeAltIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';

interface AuditService {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  pricing: {
    min: number;
    max: number;
  };
  duration: string;
  complexity: 'Basic' | 'Advanced' | 'Enterprise';
}

export default function SecurityAudits() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    projectDetails: '',
    timeline: '',
    budget: '',
  });

  const auditServices: AuditService[] = [
    {
      id: 'smart-contract',
      name: 'Smart Contract Audits',
      description: 'Comprehensive security analysis of smart contracts to identify vulnerabilities, logic flaws, and potential exploits.',
      icon: CodeBracketIcon,
      features: [
        'Manual code review by security experts',
        'Automated vulnerability scanning',
        'Gas optimization analysis',
        'Business logic verification',
        'Reentrancy attack prevention',
        'Access control validation',
        'Detailed security report with remediation',
        'Post-fix verification testing',
      ],
      pricing: { min: 15000, max: 50000 },
      duration: '2-4 weeks',
      complexity: 'Advanced',
    },
    {
      id: 'wallet-security',
      name: 'Wallet Security Reviews',
      description: 'In-depth security assessment of cryptocurrency wallets, including mobile, desktop, and hardware implementations.',
      icon: ShieldCheckIcon,
      features: [
        'Cryptographic implementation review',
        'Key management security analysis',
        'Seed phrase generation validation',
        'Multi-signature setup verification',
        'Hardware security module testing',
        'Mobile app security assessment',
        'Recovery mechanism evaluation',
        'Compliance with security standards',
      ],
      pricing: { min: 10000, max: 30000 },
      duration: '1-3 weeks',
      complexity: 'Advanced',
    },
    {
      id: 'exchange-security',
      name: 'Exchange Security Assessments',
      description: 'Comprehensive security evaluation of cryptocurrency exchanges, including infrastructure, APIs, and operational security.',
      icon: GlobeAltIcon,
      features: [
        'Infrastructure security assessment',
        'API security testing',
        'Cold storage validation',
        'Hot wallet security review',
        'Trading engine security analysis',
        'User authentication systems',
        'Regulatory compliance verification',
        'Incident response planning',
      ],
      pricing: { min: 25000, max: 75000 },
      duration: '3-6 weeks',
      complexity: 'Enterprise',
    },
    {
      id: 'penetration-testing',
      name: 'Penetration Testing',
      description: 'Ethical hacking and penetration testing services to identify security weaknesses in your systems.',
      icon: CpuChipIcon,
      features: [
        'Network penetration testing',
        'Web application security testing',
        'Mobile application testing',
        'Wireless network assessment',
        'Social engineering simulation',
        'Physical security evaluation',
        'Red team exercises',
        'Vulnerability exploitation proof-of-concept',
      ],
      pricing: { min: 12000, max: 40000 },
      duration: '1-4 weeks',
      complexity: 'Advanced',
    },
    {
      id: 'social-engineering',
      name: 'Social Engineering Tests',
      description: 'Simulated social engineering attacks to test your organization\'s human security defenses.',
      icon: UserGroupIcon,
      features: [
        'Phishing email campaigns',
        'Vishing (voice phishing) tests',
        'Physical security testing',
        'USB drop attacks',
        'Pretexting scenarios',
        'Employee security awareness evaluation',
        'Training recommendations',
        'Incident response testing',
      ],
      pricing: { min: 8000, max: 25000 },
      duration: '1-2 weeks',
      complexity: 'Basic',
    },
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    const service = auditServices.find(s => s.id === serviceId);
    if (service) {
      setContactForm(prev => ({ ...prev, service: service.name }));
    }
  };

  const handleContactSubmit = async () => {
    // Here you would submit to your backend
    console.log('Submitting contact form:', contactForm);
    // Show success message or redirect
    alert('Thank you! We\'ll contact you within 24 hours to discuss your security audit needs.');
    setShowContactForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text mb-6">
              Security Audits
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Professional security assessments by experts with 20+ years of experience. 
              Protect your crypto assets with enterprise-grade security audits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => setShowContactForm(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
              >
                Get Security Assessment
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <a
                href="tel:+15557326837"
                className="border border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-cyan-400 hover:text-black transition-all duration-300 flex items-center gap-2"
              >
                <PhoneIcon className="w-5 h-5" />
                Emergency Security Hotline
              </a>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span>20+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                <span>Government Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-400" />
                <span>Detailed Reports</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Comprehensive Security Services
            </h2>
            <p className="text-xl text-gray-300">
              Choose from our range of professional security audit services
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {auditServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <CyberpunkCard 
                  className={`p-8 h-full cursor-pointer transition-all duration-300 ${
                    selectedService === service.id ? 'border-2 border-cyan-400' : 'hover:border-gray-600'
                  }`}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
                      <p className="text-gray-300 mb-4">{service.description}</p>
                      
                      <div className="flex flex-wrap gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-1">
                          <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300">
                            ${service.pricing.min.toLocaleString()} - ${service.pricing.max.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300">{service.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">{service.complexity}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white mb-3">What's Included:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceSelect(service.id);
                      setShowContactForm(true);
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Request Quote
                  </button>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose VaultGuard Security Audits?
            </h2>
            <p className="text-xl text-gray-300">
              Leverage our expertise to protect your crypto assets
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheckIcon,
                title: 'Government Certified',
                description: 'Our team holds certifications from leading security organizations and has worked with government agencies.',
              },
              {
                icon: CpuChipIcon,
                title: 'Cutting-Edge Tools',
                description: 'We use the latest security testing tools and methodologies to identify even the most sophisticated vulnerabilities.',
              },
              {
                icon: DocumentTextIcon,
                title: 'Detailed Reporting',
                description: 'Receive comprehensive reports with clear explanations, risk ratings, and actionable remediation steps.',
              },
              {
                icon: ClockIcon,
                title: 'Fast Turnaround',
                description: 'We understand the urgency of security issues and provide rapid assessment and reporting.',
              },
              {
                icon: UserGroupIcon,
                title: 'Expert Team',
                description: '20+ years of combined experience in cybersecurity, blockchain technology, and ethical hacking.',
              },
              {
                icon: CheckCircleIcon,
                title: 'Proven Track Record',
                description: 'Successfully identified and helped remediate thousands of security vulnerabilities across various platforms.',
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <CyberpunkCard className="p-6 text-center h-full">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg w-fit mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-300">{benefit.description}</p>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Request Security Audit</h3>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Company/Organization</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Service Needed *</label>
                  <select
                    value={contactForm.service}
                    onChange={(e) => setContactForm({...contactForm, service: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="">Select a service...</option>
                    {auditServices.map((service) => (
                      <option key={service.id} value={service.name}>{service.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Timeline</label>
                    <select
                      value={contactForm.timeline}
                      onChange={(e) => setContactForm({...contactForm, timeline: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="">Select timeline...</option>
                      <option value="urgent">Urgent (ASAP)</option>
                      <option value="1-2weeks">1-2 weeks</option>
                      <option value="1month">Within 1 month</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Budget Range</label>
                    <select
                      value={contactForm.budget}
                      onChange={(e) => setContactForm({...contactForm, budget: e.target.value})}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="">Select budget...</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value="25k-50k">$25,000 - $50,000</option>
                      <option value="50k+">$50,000+</option>
                      <option value="discuss">Prefer to discuss</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Project Details *</label>
                  <textarea
                    value={contactForm.projectDetails}
                    onChange={(e) => setContactForm({...contactForm, projectDetails: e.target.value})}
                    placeholder="Please describe your project, security concerns, and any specific requirements..."
                    rows={4}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleContactSubmit}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-900 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Secure Your Crypto Assets Today
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Don't wait for a security breach. Get a professional security audit and protect your investments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowContactForm(true)}
              className="bg-white text-blue-900 px-12 py-4 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Get Security Audit Quote
            </button>
            <a
              href="tel:+15557326837"
              className="border-2 border-white text-white px-12 py-4 rounded-lg font-bold text-xl hover:bg-white hover:text-blue-900 transition-all duration-300"
            >
              Emergency Security Hotline
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}