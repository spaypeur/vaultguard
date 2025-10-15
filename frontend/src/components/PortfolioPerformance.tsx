import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

interface PortfolioPerformanceProps {
  className?: string;
}

// Mock data - in real app, this would come from API
const performanceData = [
  { date: '2024-01', portfolio: 100000, btc: 95000, eth: 98000, sp500: 102000, nasdaq: 101500 },
  { date: '2024-02', portfolio: 105000, btc: 102000, eth: 100500, sp500: 103000, nasdaq: 102800 },
  { date: '2024-03', portfolio: 98000, btc: 92000, eth: 95000, sp500: 104500, nasdaq: 104200 },
  { date: '2024-04', portfolio: 110000, btc: 108000, eth: 105000, sp500: 105000, nasdaq: 105500 },
  { date: '2024-05', portfolio: 115000, btc: 112000, eth: 110000, sp500: 106000, nasdaq: 107000 },
  { date: '2024-06', portfolio: 108000, btc: 105000, eth: 102000, sp500: 108000, nasdaq: 109000 },
  { date: '2024-07', portfolio: 120000, btc: 118000, eth: 115000, sp500: 109500, nasdaq: 110500 },
  { date: '2024-08', portfolio: 125000, btc: 122000, eth: 120000, sp500: 110000, nasdaq: 111000 },
  { date: '2024-09', portfolio: 118000, btc: 115000, eth: 112000, sp500: 112000, nasdaq: 113000 },
  { date: '2024-10', portfolio: 130000, btc: 128000, eth: 125000, sp500: 113500, nasdaq: 114500 },
  { date: '2024-11', portfolio: 135000, btc: 132000, eth: 130000, sp500: 115000, nasdaq: 116000 },
  { date: '2024-12', portfolio: 142000, btc: 140000, eth: 138000, sp500: 116500, nasdaq: 117500 },
];

const allocationData = [
  { name: 'Bitcoin', value: 45, amount: 63900, color: '#f7931a' },
  { name: 'Ethereum', value: 30, amount: 42600, color: '#627eea' },
  { name: 'DeFi Tokens', value: 15, amount: 21300, color: '#9945ff' },
  { name: 'Stablecoins', value: 8, amount: 11360, color: '#26a69a' },
  { name: 'NFT/Collectibles', value: 2, amount: 2840, color: '#ff6b6b' },
];

const riskData = [
  { asset: 'BTC', volatility: 65, correlation: 0.8, liquidity: 95, risk: 'Medium' },
  { asset: 'ETH', volatility: 72, correlation: 0.85, liquidity: 90, risk: 'High' },
  { asset: 'DeFi', volatility: 85, correlation: 0.75, liquidity: 70, risk: 'High' },
  { asset: 'Stablecoins', volatility: 5, correlation: 0.1, liquidity: 98, risk: 'Low' },
  { asset: 'NFTs', volatility: 95, correlation: 0.3, liquidity: 45, risk: 'Very High' },
];

const COLORS = ['#f7931a', '#627eea', '#9945ff', '#26a69a', '#ff6b6b'];

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({ className = '' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  const currentPortfolioValue = performanceData[performanceData.length - 1].portfolio;
  const previousPortfolioValue = performanceData[performanceData.length - 2].portfolio;
  const portfolioChange = currentPortfolioValue - previousPortfolioValue;
  const portfolioChangePercent = (portfolioChange / previousPortfolioValue) * 100;

  const totalValue = allocationData.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-900/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'High': return 'text-orange-400 bg-orange-900/20';
      case 'Very High': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Portfolio Performance</h2>
          <p className="text-gray-400">Advanced analytics and risk assessment</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="1M">1 Month</option>
            <option value="3M">3 Months</option>
            <option value="6M">6 Months</option>
            <option value="1Y">1 Year</option>
            <option value="ALL">All Time</option>
          </select>
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(['line', 'area', 'bar'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 text-xs rounded ${
                  chartType === type
                    ? 'bg-cyan-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-600'
                } transition-colors`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(currentPortfolioValue)}</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-center gap-1">
            {portfolioChange >= 0 ? (
              <ArrowUpIcon className="w-4 h-4 text-green-400" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              portfolioChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatCurrency(Math.abs(portfolioChange))} ({formatPercent(portfolioChangePercent)})
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Best Performer</p>
              <p className="text-lg font-bold text-green-400">Bitcoin</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">30D</p>
              <p className="text-green-400 font-bold">+18.5%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Risk Level</p>
              <p className="text-lg font-bold text-yellow-400">Medium</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sharpe Ratio</p>
              <p className="text-lg font-bold text-cyan-400">1.84</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">vs S&P 500</p>
              <p className="text-cyan-400 font-bold">+0.32</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-800/50 rounded-lg border border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Performance vs Benchmarks</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <>
              {chartType === 'line' && (
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="portfolio"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    name="Your Portfolio"
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="btc"
                    stroke="#f7931a"
                    strokeWidth={2}
                    name="Bitcoin"
                    dot={{ fill: '#f7931a', strokeWidth: 2, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sp500"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="S&P 500"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              )}
              {chartType === 'area' && (
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="portfolio"
                    stackId="1"
                    stroke="#06b6d4"
                    fill="#06b6d4"
                    fillOpacity={0.6}
                    name="Your Portfolio"
                  />
                  <Area
                    type="monotone"
                    dataKey="btc"
                    stackId="2"
                    stroke="#f7931a"
                    fill="#f7931a"
                    fillOpacity={0.4}
                    name="Bitcoin"
                  />
                </AreaChart>
              )}
              {chartType === 'bar' && (
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="portfolio" fill="#06b6d4" name="Your Portfolio" />
                  <Bar dataKey="btc" fill="#f7931a" name="Bitcoin" />
                  <Bar dataKey="sp500" fill="#10b981" name="S&P 500" />
                </BarChart>
              )}
            </>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/50 rounded-lg border border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-purple-400" />
            Portfolio Allocation
          </h3>
          <div className="flex items-center gap-6">
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {allocationData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">{item.value}%</p>
                  </div>
                  <p className="text-white font-mono text-sm">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Risk Assessment Heat Map */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/50 rounded-lg border border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-orange-400" />
            Risk Assessment Matrix
          </h3>
          <div className="space-y-3">
            {riskData.map((asset) => (
              <div key={asset.asset} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{asset.asset}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(asset.risk)}`}>
                      {asset.risk}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-gray-400">Volatility</p>
                      <p className="text-white font-mono">{asset.volatility}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Liquidity</p>
                      <p className="text-white font-mono">{asset.liquidity}%</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-400">Volatility</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-green-400 to-red-400 h-2 rounded-full"
                        style={{ width: `${asset.volatility}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-400">Correlation</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                        style={{ width: `${asset.correlation * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <p className="text-xs text-gray-400">Liquidity</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-red-400 to-green-400 h-2 rounded-full"
                        style={{ width: `${asset.liquidity}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Benchmark Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-800/50 rounded-lg border border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Benchmark Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Your Portfolio', value: 42, change: '+42%', color: 'text-cyan-400' },
            { name: 'Bitcoin', value: 47.3, change: '+47.3%', color: 'text-orange-400' },
            { name: 'S&P 500', value: 16.5, change: '+16.5%', color: 'text-green-400' },
            { name: 'NASDAQ', value: 17.2, change: '+17.2%', color: 'text-purple-400' },
          ].map((benchmark, index) => (
            <div key={benchmark.name} className="bg-gray-700/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm mb-1">{benchmark.name}</p>
              <p className="text-2xl font-bold text-white mb-1">{benchmark.value}%</p>
              <p className={`text-sm font-semibold ${benchmark.color}`}>{benchmark.change}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PortfolioPerformance;