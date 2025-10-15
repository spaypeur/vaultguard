import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  StarIcon,
  ChartBarIcon,
  CalculatorIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from '../components/CyberpunkCard';

export default function TaxReportsLanding() {
  const navigate = useNavigate();
  const [reportCount, setReportCount] = useState(1);
  const [showSamplePreview, setShowSamplePreview] = useState(false);

  const basePrice = 99;
  const bulkDiscount = reportCount >= 5 ? 0.2 : 0;
  const totalPrice = reportCount * basePrice * (1 - bulkDiscount);
  const savings = reportCount * basePrice - totalPrice;

  const supportedExchanges = [
    { name: 'Coinbase', logo: '🟦', status: 'Full Integration' },
    { name: 'Binance', logo: '🟨', status: 'Full Integration' },
    { name: 'Kraken', logo: '🟪', status: 'Full Integration' },
    { name: 'Gemini', logo: '🟩', status: 'Full Integration' },
    { name: 'KuCoin', logo: '🟫', status: 'Full Integration' },
    { name: 'Bitfinex', logo: '⬜', status: 'Full Integration' },
    { name: 'Huobi', logo: '🔴', status: 'Full Integration' },
    { name: 'OKX', logo: '🔵', status: 'Full Integration' },
    { name: 'Bybit', logo: '🟡', status: 'Full Integration' },
    { name: 'Gate.io', logo: '⚫', status: 'Full Integration' },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'DeFi Investor',
      content: 'Saved me 40+ hours during tax season. The automated FIFO calculations were perfect for my complex trading history.',
      rating: 5,
      amount: '$2.4M Portfolio',
    },
    {
      name: 'Michael R.',
      role: 'Crypto Trader',
      content: 'Generated my Form 8949 in minutes. My CPA was impressed with the accuracy and professional formatting.',
      rating: 5,
      amount: '$850K Portfolio',
    },
    {
      name: 'Jennifer L.',
      role: 'Investment Manager',
      content: 'The bulk discount for multiple clients made this incredibly cost-effective. Flawless integration with all major exchanges.',
      rating: 5,
      amount: '$12M+ Managed',
    },
  ];

  const beforeAfterData = {
    manual: {
      time: '40+ hours',
      accuracy: '~85%',
      cost: '$2,000+ (CPA fees)',
      stress: 'High',
      errors: 'Common',
      compliance: 'Uncertain',
    },
    automated: {
      time: '5 minutes',
      accuracy: '99.9%',
      cost: '$99',
      stress: 'None',
      errors: 'Eliminated',
      compliance: 'IRS Compliant',
    },
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
              Professional Tax Reports
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Generate IRS-compliant Form 8949 reports in minutes, not weeks. 
              Automated cost basis calculations with 99.9% accuracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={() => navigate('/dashboard/tax-report')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
              >
                Generate Report Now
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSamplePreview(true)}
                className="border border-cyan-400 text-cyan-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-cyan-400 hover:text-black transition-all duration-300 flex items-center gap-2"
              >
                View Sample Report
                <DocumentArrowDownIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <span>IRS Form 8949 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-purple-400" />
                <span>5-Minute Generation</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Before/After Comparison */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Manual vs Automated: The Difference is Clear
            </h2>
            <p className="text-xl text-gray-300">
              Stop wasting time on manual calculations and spreadsheet errors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Manual Process */}
            <CyberpunkCard className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-red-400 mb-2">Manual Process</h3>
                <p className="text-gray-400">The old way of doing taxes</p>
              </div>
              <div className="space-y-4">
                {Object.entries(beforeAfterData.manual).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{key}:</span>
                    <span className="text-red-400 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </CyberpunkCard>

            {/* Automated Process */}
            <CyberpunkCard className="p-8 border-2 border-green-400">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-green-400 mb-2">VaultGuard Automated</h3>
                <p className="text-gray-400">The smart way to handle crypto taxes</p>
              </div>
              <div className="space-y-4">
                {Object.entries(beforeAfterData.automated).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{key}:</span>
                    <span className="text-green-400 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </CyberpunkCard>
          </div>
        </div>
      </section>

      {/* Supported Exchanges */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Seamless Exchange Integrations
            </h2>
            <p className="text-xl text-gray-300">
              Connect to all major exchanges with one-click API integration
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {supportedExchanges.map((exchange, index) => (
              <motion.div
                key={exchange.name}
                className="bg-gray-800/50 rounded-lg p-6 text-center hover:bg-gray-700/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl mb-3">{exchange.logo}</div>
                <h3 className="text-white font-semibold mb-1">{exchange.name}</h3>
                <p className="text-green-400 text-sm">{exchange.status}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing with Bulk Discount */}
      <section className="py-20 bg-black/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Volume discounts available for multiple reports
            </p>
          </motion.div>

          <CyberpunkCard className="p-8">
            <div className="mb-8">
              <label className="block text-white text-lg font-semibold mb-4">
                Number of Reports Needed:
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={reportCount}
                  onChange={(e) => setReportCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-2xl font-bold text-cyan-400 min-w-[3rem]">
                  {reportCount}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Pricing Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Price per Report:</span>
                    <span className="text-white">${basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Quantity:</span>
                    <span className="text-white">{reportCount}</span>
                  </div>
                  {bulkDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Bulk Discount (20%):</span>
                      <span>-${savings.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="border-gray-600" />
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Total:</span>
                    <span className="text-cyan-400">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4">What's Included</h3>
                <ul className="space-y-2">
                  {[
                    'IRS Form 8949 compliant PDF',
                    'FIFO cost basis calculations',
                    'All exchange transaction imports',
                    'Gain/loss calculations',
                    'Professional formatting',
                    'Instant download',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-300">
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {reportCount >= 5 && (
              <div className="mt-6 p-4 bg-green-900/30 border border-green-400 rounded-lg">
                <div className="flex items-center gap-2 text-green-400">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span className="font-semibold">
                    Bulk Discount Applied! You're saving ${savings.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/tax-report')}
              className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
            >
              Generate {reportCount} Report{reportCount > 1 ? 's' : ''} - ${totalPrice.toFixed(2)}
            </button>
          </CyberpunkCard>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Crypto Investors
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands who've simplified their crypto taxes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <CyberpunkCard className="p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="mt-auto">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    <div className="text-cyan-400 text-sm font-semibold">{testimonial.amount}</div>
                  </div>
                </CyberpunkCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Preview Modal */}
      {showSamplePreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Sample Tax Report Preview</h3>
                <button
                  onClick={() => setShowSamplePreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {/* Sample Report Content */}
              <div className="bg-white text-black p-8 rounded-lg">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">IRS Form 8949</h1>
                  <h2 className="text-lg">Sales and Other Dispositions of Capital Assets</h2>
                  <p className="text-sm text-gray-600 mt-2">Generated by VaultGuard Professional Tax Service</p>
                </div>
                
                <div className="mb-6">
                  <p><strong>Taxpayer:</strong> John Doe</p>
                  <p><strong>Tax Year:</strong> 2024</p>
                  <p><strong>Report Generated:</strong> {new Date().toLocaleDateString()}</p>
                </div>

                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Asset</th>
                      <th className="border border-gray-300 p-2 text-left">Date Acquired</th>
                      <th className="border border-gray-300 p-2 text-left">Date Sold</th>
                      <th className="border border-gray-300 p-2 text-right">Proceeds</th>
                      <th className="border border-gray-300 p-2 text-right">Cost Basis</th>
                      <th className="border border-gray-300 p-2 text-right">Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2">BTC</td>
                      <td className="border border-gray-300 p-2">01/15/2024</td>
                      <td className="border border-gray-300 p-2">03/20/2024</td>
                      <td className="border border-gray-300 p-2 text-right">$12,450.00</td>
                      <td className="border border-gray-300 p-2 text-right">$10,200.00</td>
                      <td className="border border-gray-300 p-2 text-right text-green-600">$2,250.00</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2">ETH</td>
                      <td className="border border-gray-300 p-2">02/10/2024</td>
                      <td className="border border-gray-300 p-2">04/15/2024</td>
                      <td className="border border-gray-300 p-2 text-right">$8,750.00</td>
                      <td className="border border-gray-300 p-2 text-right">$9,100.00</td>
                      <td className="border border-gray-300 p-2 text-right text-red-600">($350.00)</td>
                    </tr>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-gray-300 p-2" colSpan={3}>TOTALS</td>
                      <td className="border border-gray-300 p-2 text-right">$21,200.00</td>
                      <td className="border border-gray-300 p-2 text-right">$19,300.00</td>
                      <td className="border border-gray-300 p-2 text-right text-green-600">$1,900.00</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-6 text-xs text-gray-500">
                  <p>* Cost basis calculated using FIFO (First In, First Out) method</p>
                  <p>* All transactions imported from connected exchanges</p>
                  <p>* Report complies with IRS Publication 544 guidelines</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/dashboard/tax-report')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                >
                  Generate Your Report Now
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
            Ready to Simplify Your Crypto Taxes?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of investors who trust VaultGuard for accurate, professional tax reporting
          </p>
          <button
            onClick={() => navigate('/dashboard/tax-report')}
            className="bg-white text-blue-900 px-12 py-4 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            Start Your Tax Report - $99
          </button>
        </div>
      </section>
    </div>
  );
}