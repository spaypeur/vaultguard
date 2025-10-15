import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalculatorIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface ROIData {
  stolenAmount: number;
  recoveryCost: {
    min: number;
    max: number;
    successFee: number;
  };
  potentialRecovery: {
    amount: number;
    percentage: number;
  };
  roi: {
    bestCase: number;
    worstCase: number;
    breakEven: number;
  };
  timeValue: {
    dailyLoss: number;
    weeklyLoss: number;
    monthlyLoss: number;
  };
}

interface ROICalculatorProps {
  variant?: 'modal' | 'inline';
  defaultAmount?: string;
  onCalculate?: (data: ROIData) => void;
}

export default function ROICalculator({
  variant = 'inline',
  defaultAmount = '',
  onCalculate
}: ROICalculatorProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [showResults, setShowResults] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  // Constants based on business model
  const SUCCESS_RATE = 0.947;
  const AVG_RECOVERY_RATE = 0.85;

  const calculateROI = (stolenAmount: number): ROIData => {
    // Calculate recovery costs based on amount
    let baseCost = { min: 5000, max: 15000 };
    let successFee = 20;

    if (stolenAmount >= 100000) {
      baseCost = { min: 10000, max: 25000 };
      successFee = 15;
    }
    if (stolenAmount >= 1000000) {
      baseCost = { min: 20000, max: 40000 };
      successFee = 10;
    }
    if (stolenAmount >= 5000000) {
      baseCost = { min: 30000, max: 50000 };
      successFee = 8;
    }

    const avgInvestigationCost = (baseCost.min + baseCost.max) / 2;
    const potentialRecoveryAmount = stolenAmount * AVG_RECOVERY_RATE * SUCCESS_RATE;

    // ROI Calculations
    const bestCaseROI = (potentialRecoveryAmount - baseCost.min) / baseCost.min;
    const worstCaseROI = (potentialRecoveryAmount * 0.6 - baseCost.max) / baseCost.max;
    const breakEvenRecovery = (avgInvestigationCost / successFee) * 100;

    // Time value of money (assuming funds would be invested elsewhere)
    const annualReturnRate = 0.15; // 15% annual return assumption
    const dailyLoss = (stolenAmount * annualReturnRate) / 365;
    const weeklyLoss = dailyLoss * 7;
    const monthlyLoss = dailyLoss * 30;

    return {
      stolenAmount,
      recoveryCost: {
        min: baseCost.min,
        max: baseCost.max,
        successFee
      },
      potentialRecovery: {
        amount: potentialRecoveryAmount,
        percentage: AVG_RECOVERY_RATE * SUCCESS_RATE * 100
      },
      roi: {
        bestCase: bestCaseROI,
        worstCase: worstCaseROI,
        breakEven: breakEvenRecovery
      },
      timeValue: {
        dailyLoss,
        weeklyLoss,
        monthlyLoss
      }
    };
  };

  const handleCalculate = () => {
    const numAmount = parseFloat(amount.replace(/[$,]/g, ''));
    if (numAmount > 0) {
      setAnimationKey(prev => prev + 1);
      setShowResults(true);
      if (onCalculate) {
        onCalculate(calculateROI(numAmount));
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const roiData = amount ? calculateROI(parseFloat(amount.replace(/[$,]/g, ''))) : null;

  if (variant === 'modal') {
    return (
      <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <CalculatorIcon className="w-6 h-6 text-cyan-400" />
          Recovery ROI Calculator
        </h3>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Amount Stolen (USD)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="$50,000"
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'low', label: 'Low', desc: 'Standard timeline' },
                  { key: 'medium', label: 'Medium', desc: 'Priority handling' },
                  { key: 'high', label: 'High', desc: 'Emergency response' }
                ].map((level) => (
                  <button
                    key={level.key}
                    onClick={() => setUrgency(level.key as any)}
                    className={`p-3 rounded-lg border transition-all ${
                      urgency === level.key
                        ? 'border-cyan-400 bg-cyan-900/30 text-cyan-400'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-xs opacity-75">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
            >
              Calculate ROI
            </button>
          </div>

          {roiData && (
            <motion.div
              key={animationKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Success Rate Visualization */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Success Probability</h4>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${SUCCESS_RATE * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                    />
                  </div>
                  <div className="text-green-400 font-bold">
                    {formatPercentage(SUCCESS_RATE)}
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Based on 500+ successful recovery operations
                </p>
              </div>

              {/* ROI Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="text-green-400 font-bold text-xl">
                    {formatCurrency(roiData.potentialRecovery.amount)}
                  </div>
                  <div className="text-sm text-gray-300">Expected Recovery</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="text-blue-400 font-bold text-xl">
                    {formatPercentage(roiData.roi.bestCase)}
                  </div>
                  <div className="text-sm text-gray-300">Best Case ROI</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-4">
          Recovery ROI Calculator
        </h3>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Calculate the potential return on investment for crypto recovery services
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-white font-semibold mb-3 text-lg">
              Amount Lost (USD)
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g., $50,000)"
                className="w-full p-4 pl-12 bg-gray-800 border border-gray-600 rounded-lg text-white text-xl focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-white font-semibold mb-3 text-lg">
              Case Complexity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'low', label: 'Simple', desc: 'Direct transfer', color: 'green' },
                { key: 'medium', label: 'Moderate', desc: 'Some mixing', color: 'yellow' },
                { key: 'high', label: 'Complex', desc: 'Multiple hops', color: 'red' }
              ].map((level) => (
                <button
                  key={level.key}
                  onClick={() => setUrgency(level.key as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    urgency === level.key
                      ? `border-${level.color}-400 bg-${level.color}-900/30`
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className={`text-${level.color}-400 font-semibold`}>{level.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <CalculatorIcon className="w-6 h-6" />
            Calculate Recovery ROI
          </motion.button>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {showResults && roiData && (
            <motion.div
              key={animationKey}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Success Rate Circle */}
              <div className="relative">
                <div className="w-32 h-32 mx-auto bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-700">
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: SUCCESS_RATE }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="absolute inset-0"
                  >
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${SUCCESS_RATE * 100}, 100`}
                        className="text-green-400"
                      />
                    </svg>
                  </motion.div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {formatPercentage(SUCCESS_RATE)}
                    </div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center"
                >
                  <ArrowTrendingUpIcon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-green-400">
                    {formatCurrency(roiData.potentialRecovery.amount)}
                  </div>
                  <div className="text-sm text-gray-300">Expected Recovery</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center"
                >
                  <ChartBarIcon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-blue-400">
                    {formatPercentage(roiData.roi.bestCase)}
                  </div>
                  <div className="text-sm text-gray-300">Best ROI</div>
                </motion.div>
              </div>

              {/* Cost Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gray-800/50 rounded-lg p-4"
              >
                <h4 className="text-white font-semibold mb-3">Cost Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Investigation Cost:</span>
                    <span className="text-white">
                      {formatCurrency(roiData.recoveryCost.min)} - {formatCurrency(roiData.recoveryCost.max)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Success Fee:</span>
                    <span className="text-cyan-400">{roiData.recoveryCost.successFee}% of recovery</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-300">Total Cost:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(roiData.recoveryCost.min)} - {formatCurrency(roiData.recoveryCost.max)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Time Value Warning */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-semibold mb-2">Time Value of Money</h4>
                    <p className="text-sm text-gray-300 mb-2">
                      Every day delayed costs you approximately:
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-red-400 font-bold">{formatCurrency(roiData.timeValue.dailyLoss)}</div>
                        <div className="text-gray-400">Daily</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 font-bold">{formatCurrency(roiData.timeValue.weeklyLoss)}</div>
                        <div className="text-gray-400">Weekly</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-400 font-bold">{formatCurrency(roiData.timeValue.monthlyLoss)}</div>
                        <div className="text-gray-400">Monthly</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8 p-8 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600"
        >
          <CalculatorIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">
            Enter the amount you've lost to see your potential recovery ROI
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}