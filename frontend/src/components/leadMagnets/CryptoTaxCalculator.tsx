import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalculatorIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import EmailCaptureModal from './EmailCaptureModal';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'trade' | 'mining' | 'staking' | 'airdrop';
  asset: string;
  amount: number;
  usdValue: number;
  date: string;
  fees: number;
}

interface TaxCalculation {
  shortTermGains: number;
  longTermGains: number;
  totalGains: number;
  taxableIncome: number;
  estimatedTax: number;
  effectiveRate: number;
}

const taxBrackets = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11601, max: 47150, rate: 0.12 },
  { min: 47151, max: 100525, rate: 0.22 },
  { min: 100526, max: 191950, rate: 0.24 },
  { min: 191951, max: 243725, rate: 0.32 },
  { min: 243726, max: 609350, rate: 0.35 },
  { min: 609351, max: Infinity, rate: 0.37 }
];

export default function CryptoTaxCalculator() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'buy',
      asset: 'BTC',
      amount: 0.5,
      usdValue: 30000,
      date: '2024-01-15',
      fees: 15
    }
  ]);

  const [filingStatus, setFilingStatus] = useState<'single' | 'married' | 'head'>('single');
  const [taxYear, setTaxYear] = useState('2024');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [calculation, setCalculation] = useState<TaxCalculation>({
    shortTermGains: 0,
    longTermGains: 0,
    totalGains: 0,
    taxableIncome: 0,
    estimatedTax: 0,
    effectiveRate: 0
  });

  // Simple tax calculation logic (for demo purposes)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${taxYear}-01-01`);

    const shortTermGains = transactions
      .filter(t => t.type === 'sell' || t.type === 'trade')
      .filter(t => {
        const transactionDate = new Date(t.date);
        const daysHeld = (new Date().getTime() - transactionDate.getTime()) / (1000 * 3600 * 24);
        return daysHeld < 365;
      })
      .reduce((sum, t) => sum + (t.usdValue - (t.usdValue * 0.7)), 0); // Simplified calculation

    const longTermGains = transactions
      .filter(t => t.type === 'sell' || t.type === 'trade')
      .filter(t => {
        const transactionDate = new Date(t.date);
        const daysHeld = (new Date().getTime() - transactionDate.getTime()) / (1000 * 3600 * 24);
        return daysHeld >= 365;
      })
      .reduce((sum, t) => sum + (t.usdValue - (t.usdValue * 0.7)), 0); // Simplified calculation

    const totalGains = shortTermGains + longTermGains;
    const taxableIncome = Math.max(0, totalGains);

    // Calculate estimated tax based on brackets
    let estimatedTax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of taxBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      estimatedTax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    const effectiveRate = taxableIncome > 0 ? (estimatedTax / taxableIncome) * 100 : 0;

    setCalculation({
      shortTermGains,
      longTermGains,
      totalGains,
      taxableIncome,
      estimatedTax,
      effectiveRate
    });
  }, [transactions, taxYear]);

  const addTransaction = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'buy',
      asset: 'BTC',
      amount: 1,
      usdValue: 50000,
      date: new Date().toISOString().split('T')[0],
      fees: 10
    };
    setTransactions([...transactions, newTransaction]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, field: keyof Transaction, value: any) => {
    setTransactions(transactions.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const generateReport = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setShowEmailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-full mb-4">
            <CalculatorIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Crypto Tax Calculator & Guide
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Calculate your crypto tax liability and get personalized optimization strategies.
            Understand short-term vs long-term capital gains and IRS reporting requirements.
          </p>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tax Year
            </label>
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filing Status
            </label>
            <select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="head">Head of Household</option>
            </select>
          </div>
        </div>

        {/* Transactions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Transactions</h3>
            <button
              onClick={addTransaction}
              className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Transaction
            </button>
          </div>

          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                    <select
                      value={transaction.type}
                      onChange={(e) => updateTransaction(transaction.id, 'type', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                      <option value="trade">Trade</option>
                      <option value="mining">Mining</option>
                      <option value="staking">Staking</option>
                      <option value="airdrop">Airdrop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Asset</label>
                    <input
                      type="text"
                      value={transaction.asset}
                      onChange={(e) => updateTransaction(transaction.id, 'asset', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                      placeholder="BTC"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={transaction.amount}
                      onChange={(e) => updateTransaction(transaction.id, 'amount', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">USD Value</label>
                    <input
                      type="number"
                      value={transaction.usdValue}
                      onChange={(e) => updateTransaction(transaction.id, 'usdValue', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={transaction.date}
                      onChange={(e) => updateTransaction(transaction.id, 'date', e.target.value)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => removeTransaction(transaction.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                      title="Remove transaction"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tax Calculation Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-4">Tax Calculation Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center mb-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Short-term Gains</span>
              </div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(calculation.shortTermGains)}
              </div>
              <div className="text-xs text-gray-400">Taxed at ordinary income rates</div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center mb-2">
                <ArrowTrendingDownIcon className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Long-term Gains</span>
              </div>
              <div className="text-xl font-bold text-blue-400">
                {formatCurrency(calculation.longTermGains)}
              </div>
              <div className="text-xs text-gray-400">Taxed at capital gains rates</div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-gray-300">Est. Tax Liability</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">
                {formatCurrency(calculation.estimatedTax)}
              </div>
              <div className="text-xs text-gray-400">{calculation.effectiveRate.toFixed(1)}% effective rate</div>
            </div>
          </div>

          {/* Tax Optimization Tips */}
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
            <div className="flex items-start mb-3">
              <InformationCircleIcon className="w-5 h-5 text-cyan-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-cyan-400 mb-1">
                  Tax Optimization Strategies
                </h4>
                <p className="text-sm text-gray-300">
                  Consider tax-loss harvesting to offset gains, hold assets for over a year for long-term capital gains treatment,
                  and maintain detailed records of all transactions for accurate reporting.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={generateReport}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold px-8 py-4 rounded-lg transition-all duration-200 flex items-center justify-center group"
          >
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Generating Report...
                </motion.div>
              ) : (
                <motion.div
                  key="generate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform" />
                  Get Detailed Tax Guide
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 border border-cyan-500/30 hover:border-cyan-500/50"
          >
            Back to Top
          </motion.button>
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-lg"
        >
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">
            Professional Tax Guidance
          </h3>
          <p className="text-sm text-gray-300">
            This calculator provides estimates only. Get the complete guide with IRS form examples,
            <span className="text-cyan-400 font-semibold"> cost basis tracking strategies</span>, and
            optimization techniques used by crypto professionals.
          </p>
        </motion.div>
      </div>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        leadMagnet="Crypto Tax Guide & Calculator"
        onEmailCaptured={() => {
          console.log('Email captured, downloading tax guide...');
          setShowEmailModal(false);
        }}
      />
    </>
  );
}