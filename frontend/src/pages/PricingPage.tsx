import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: 'foundation',
      name: 'Foundation',
      description: 'For individual crypto investors',
      price: {
        annual: 50000,
        monthly: 5000,
      },
      features: [
        'Real-time threat monitoring',
        'Basic compliance reporting',
        'Email & SMS alerts',
        'Portfolio tracking (up to $1M)',
        'Community support',
        'Monthly security reports',
        'Basic dark web monitoring',
      ],
      notIncluded: [
        'Priority support',
        'Custom integrations',
        'Expert consultations',
        'Dedicated account manager',
      ],
      color: 'cyan' as const,
      popular: false,
    },
    {
      id: 'guardian',
      name: 'Guardian',
      description: 'For high-net-worth individuals',
      price: {
        annual: 250000,
        monthly: 25000,
      },
      features: [
        'All Foundation features',
        'Advanced dark web monitoring',
        'Automated KYC/AML compliance',
        'Priority support (4-hour response)',
        'Custom integrations',
        'Quarterly expert consultations',
        'Portfolio tracking (unlimited)',
        'Dedicated account manager',
        'White-glove onboarding',
      ],
      notIncluded: [
        '24/7 phone support',
        'On-site security audits',
        'Direct emergency access',
      ],
      color: 'purple' as const,
      popular: true,
    },
    {
      id: 'sovereign',
      name: 'Sovereign',
      description: 'For family offices & institutions',
      price: {
        annual: 1000000,
        monthly: 100000,
      },
      features: [
        'All Guardian features',
        'Dedicated security team',
        '24/7 phone support',
        'On-site security audits',
        'Legacy planning',
        'Institutional features',
        'Direct emergency access to founder',
        'Custom SLA agreements',
        'Multi-user team access',
        'API access for integrations',
      ],
      notIncluded: [],
      color: 'green' as const,
      popular: false,
    },
  ];

  const addOns = [
    {
      name: 'Tax Report (IRS Form 8949)',
      price: 99,
      description: 'Automated crypto tax report with exchange integration',
    },
    {
      name: 'Expert Recovery Operation',
      price: 'Custom',
      description: 'Personal investigation and recovery of stolen funds (10-20% success fee)',
    },
    {
      name: 'Security Audit',
      price: 'From $10,000',
      description: 'Smart contract audit, wallet security review, penetration testing',
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login or register first');
      navigate('/register');
      return;
    }

    setLoading(planId);

    try {
      // Create payment session
      const { data } = await api.post('/payments/create-session', {
        planId,
        paymentMethod: 'fiat', // Default to Stripe, can add crypto option
      });

      if (data.success && data.data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.data.url;
      } else {
        toast.error('Failed to create payment session');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to process payment');
    } finally {
      setLoading(null);
    }
  };

  const handleContactSales = () => {
    // For Sovereign plan, redirect to contact form or email
    window.location.href = 'mailto:sales@vaultguard.io?subject=Sovereign Plan Inquiry';
  };

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
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              Protection Level
            </span>
          </motion.h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Elite crypto security backed by 20+ years of real hacking experience. 
            All plans include 30-day money-back guarantee.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'annual' ? 'monthly' : 'annual')}
              className="relative w-16 h-8 bg-gray-700 rounded-full transition-colors"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-cyan-500 rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-8' : ''
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'annual' ? 'text-white' : 'text-gray-500'}`}>
              Annual
              <span className="ml-2 text-sm text-green-400">(Save 20%)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}
                <CyberpunkCard
                  glowColor={plan.color}
                  className={`h-full ${plan.popular ? 'scale-105' : ''}`}
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                    <div className="text-4xl font-bold text-white mb-2">
                      ${(plan.price[billingCycle] / (billingCycle === 'annual' ? 1 : 1)).toLocaleString()}
                    </div>
                    <div className="text-gray-400 text-sm">
                      per {billingCycle === 'annual' ? 'year' : 'month'}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 opacity-50">
                        <XMarkIcon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      plan.id === 'sovereign'
                        ? handleContactSales()
                        : handleSelectPlan(plan.id)
                    }
                    disabled={loading === plan.id}
                    className={`w-full py-3 rounded-lg font-bold transition-colors ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white border border-cyan-500/30'
                    } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === plan.id
                      ? 'Processing...'
                      : plan.id === 'sovereign'
                      ? 'Contact Sales'
                      : 'Select Plan'}
                  </button>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Additional Services
          </h2>
          <p className="text-center text-gray-400 mb-12">
            One-time services available to all plan tiers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {addOns.map((addon, index) => (
              <CyberpunkCard key={index} glowColor="orange">
                <h3 className="text-xl font-bold text-white mb-2">{addon.name}</h3>
                <div className="text-2xl font-bold text-cyan-400 mb-3">
                  {typeof addon.price === 'number' ? `$${addon.price}` : addon.price}
                </div>
                <p className="text-gray-400 text-sm">{addon.description}</p>
              </CyberpunkCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <CyberpunkCard glowColor="cyan">
              <h3 className="text-lg font-bold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400">
                We accept credit cards (via Stripe) and cryptocurrency (BTC, ETH, USDT, SOL, ADA, DOT). 
                Crypto payments are verified within 24-48 hours.
              </p>
            </CyberpunkCard>

            <CyberpunkCard glowColor="purple">
              <h3 className="text-lg font-bold text-white mb-2">
                Is there a money-back guarantee?
              </h3>
              <p className="text-gray-400">
                Yes! All plans include a 30-day money-back guarantee. If you're not satisfied, 
                we'll refund your payment in full, no questions asked.
              </p>
            </CyberpunkCard>

            <CyberpunkCard glowColor="green">
              <h3 className="text-lg font-bold text-white mb-2">
                How does dark web monitoring work?
              </h3>
              <p className="text-gray-400">
                I personally monitor dark web forums, Mariana web marketplaces, and ghost web channels 
                where stolen crypto is traded. When your assets appear, you're alerted immediately.
              </p>
            </CyberpunkCard>

            <CyberpunkCard glowColor="orange">
              <h3 className="text-lg font-bold text-white mb-2">
                What's your recovery success rate?
              </h3>
              <p className="text-gray-400">
                Our recovery success rate is 94.7% for cases where we're contacted within 48 hours 
                of the theft. Time is critical - the faster you act, the better the chances.
              </p>
            </CyberpunkCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <CyberpunkCard glowColor="cyan" variant="glass">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Still Have Questions?
              </h2>
              <p className="text-gray-400 mb-8">
                Schedule a free consultation to discuss your security needs
              </p>
              <button
                onClick={() => window.location.href = 'mailto:sales@vaultguard.io'}
                className="bg-cyan-500 hover:bg-cyan-600 text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                Contact Sales
              </button>
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
