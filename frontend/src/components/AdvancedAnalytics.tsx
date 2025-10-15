import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  CpuChipIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface AnalyticsData {
  portfolioHealth: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    factors: string[];
  };
  riskAssessment: {
    overall: number;
    categories: {
      technical: number;
      market: number;
      regulatory: number;
      operational: number;
    };
  };
  threatPredictions: {
    next24h: number;
    next7d: number;
    confidence: number;
    topThreats: string[];
  };
  performanceMetrics: {
    responseTime: number;
    uptime: number;
    accuracy: number;
    falsePositives: number;
  };
  aiInsights: {
    id: string;
    type: 'optimization' | 'warning' | 'opportunity' | 'prediction';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
  }[];
}

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Simulate AI analytics processing
    const loadAnalytics = async () => {
      setIsProcessing(true);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalytics: AnalyticsData = {
        portfolioHealth: {
          score: 87,
          trend: 'up',
          factors: [
            'Diversification improved by 12%',
            'Risk exposure reduced',
            'Security posture strengthened',
            'Compliance score increased'
          ]
        },
        riskAssessment: {
          overall: 23, // Lower is better for risk
          categories: {
            technical: 15,
            market: 35,
            regulatory: 18,
            operational: 25
          }
        },
        threatPredictions: {
          next24h: 3,
          next7d: 12,
          confidence: 89,
          topThreats: [
            'Phishing campaigns targeting MetaMask',
            'DeFi protocol vulnerabilities',
            'Social engineering attacks',
            'Regulatory compliance changes'
          ]
        },
        performanceMetrics: {
          responseTime: 0.23,
          uptime: 99.97,
          accuracy: 94.7,
          falsePositives: 2.1
        },
        aiInsights: [
          {
            id: '1',
            type: 'warning',
            title: 'Unusual Transaction Pattern Detected',
            description: 'AI detected 15% increase in transaction frequency from your primary wallet. This pattern matches pre-attack behavior in 67% of historical cases.',
            confidence: 82,
            impact: 'high',
            actionable: true
          },
          {
            id: '2',
            type: 'optimization',
            title: 'Portfolio Rebalancing Opportunity',
            description: 'Current allocation shows 23% concentration risk in DeFi protocols. Suggest diversifying into blue-chip assets.',
            confidence: 91,
            impact: 'medium',
            actionable: true
          },
          {
            id: '3',
            type: 'prediction',
            title: 'Market Volatility Forecast',
            description: 'AI models predict 34% probability of significant market movement in next 72 hours based on on-chain metrics.',
            confidence: 76,
            impact: 'medium',
            actionable: false
          },
          {
            id: '4',
            type: 'opportunity',
            title: 'Security Enhancement Available',
            description: 'New quantum-resistant encryption protocol available. Upgrading would improve security score by estimated 15 points.',
            confidence: 95,
            impact: 'high',
            actionable: true
          }
        ]
      };
      
      setAnalytics(mockAnalytics);
      setIsProcessing(false);
    };

    loadAnalytics();
  }, [selectedTimeframe]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return ExclamationTriangleIcon;
      case 'optimization': return ArrowTrendingUpIcon;
      case 'opportunity': return LightBulbIcon;
      case 'prediction': return CpuChipIcon;
      default: return ChartBarIcon;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'red';
      case 'optimization': return 'blue';
      case 'opportunity': return 'green';
      case 'prediction': return 'purple';
      default: return 'gray';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  if (isProcessing) {
    return (
      <CyberpunkCard glowColor="cyan" className="h-full flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <CpuChipIcon className="w-16 h-16 text-cyan-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">AI Analytics Processing</h3>
          <p className="text-gray-400">Neural networks analyzing your security posture...</p>
          <div className="mt-4 w-64 bg-gray-700 rounded-full h-2 mx-auto">
            <motion.div
              className="bg-cyan-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </CyberpunkCard>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Selector */}
      <CyberpunkCard glowColor="cyan" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Advanced Analytics Command Center</h3>
          </div>
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['24h', '7d', '30d', '90d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-cyan-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-2xl font-bold text-green-400">{analytics.portfolioHealth.score}</div>
              {analytics.portfolioHealth.trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
              ) : analytics.portfolioHealth.trend === 'down' ? (
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
              ) : (
                <div className="w-5 h-5" />
              )}
            </div>
            <div className="text-gray-400 text-xs">PORTFOLIO HEALTH</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{analytics.riskAssessment.overall}%</div>
            <div className="text-gray-400 text-xs">RISK SCORE</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{analytics.performanceMetrics.accuracy}%</div>
            <div className="text-gray-400 text-xs">AI ACCURACY</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{analytics.performanceMetrics.uptime}%</div>
            <div className="text-gray-400 text-xs">UPTIME</div>
          </div>
        </div>
      </CyberpunkCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Assessment Breakdown */}
        <CyberpunkCard glowColor="orange" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-400" />
            <h4 className="text-lg font-bold text-white">Risk Assessment Matrix</h4>
          </div>
          
          <div className="space-y-4">
            {Object.entries(analytics.riskAssessment.categories).map(([category, value]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 capitalize">{category} Risk</span>
                  <span className={`font-semibold ${
                    value < 20 ? 'text-green-400' :
                    value < 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {value}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      value < 20 ? 'bg-green-500' :
                      value < 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="text-orange-400 text-sm font-semibold mb-1">Risk Factors</div>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Market volatility exposure: High</li>
              <li>• Smart contract dependencies: Medium</li>
              <li>• Regulatory compliance gaps: Low</li>
              <li>• Operational security risks: Medium</li>
            </ul>
          </div>
        </CyberpunkCard>

        {/* Threat Predictions */}
        <CyberpunkCard glowColor="red" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <CpuChipIcon className="w-6 h-6 text-red-400" />
            <h4 className="text-lg font-bold text-white">AI Threat Predictions</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-400">{analytics.threatPredictions.next24h}</div>
              <div className="text-gray-400 text-xs">NEXT 24H</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-orange-400">{analytics.threatPredictions.next7d}</div>
              <div className="text-gray-400 text-xs">NEXT 7 DAYS</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">Prediction Confidence</span>
              <span className="text-cyan-400 font-semibold">{analytics.threatPredictions.confidence}%</span>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="text-red-400 text-sm font-semibold mb-2">Top Predicted Threats</div>
            <ul className="text-xs text-gray-300 space-y-1">
              {analytics.threatPredictions.topThreats.map((threat, index) => (
                <li key={index}>• {threat}</li>
              ))}
            </ul>
          </div>
        </CyberpunkCard>
      </div>

      {/* AI Insights */}
      <CyberpunkCard glowColor="purple" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <LightBulbIcon className="w-6 h-6 text-purple-400" />
          <h4 className="text-lg font-bold text-white">AI-Generated Insights</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.aiInsights.map((insight, index) => {
            const IconComponent = getInsightIcon(insight.type);
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-l-4 border-${getInsightColor(insight.type)}-500 bg-gray-800/30 rounded-r-lg p-4 hover:bg-gray-800/50 transition-colors`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-5 h-5 text-${getInsightColor(insight.type)}-400`} />
                    <span className={`text-${getInsightColor(insight.type)}-400 text-xs font-mono uppercase px-2 py-1 bg-${getInsightColor(insight.type)}-500/10 rounded`}>
                      {insight.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded bg-${getImpactColor(insight.impact)}-500/20 text-${getImpactColor(insight.impact)}-400`}>
                      {insight.impact.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <h5 className="text-white font-semibold mb-2">{insight.title}</h5>
                <p className="text-gray-400 text-sm mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CpuChipIcon className="w-3 h-3" />
                    <span>{insight.confidence}% confidence</span>
                  </div>
                  {insight.actionable && (
                    <button className={`text-xs px-3 py-1 rounded bg-${getInsightColor(insight.type)}-500/20 text-${getInsightColor(insight.type)}-400 hover:bg-${getInsightColor(insight.type)}-500/30 transition-colors`}>
                      Take Action
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CyberpunkCard>

      {/* Performance Metrics */}
      <CyberpunkCard glowColor="green" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ClockIcon className="w-6 h-6 text-green-400" />
          <h4 className="text-lg font-bold text-white">System Performance Metrics</h4>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {analytics.performanceMetrics.responseTime}s
            </div>
            <div className="text-gray-400 text-sm">Avg Response Time</div>
            <div className="text-xs text-green-400 mt-1">↓ 15% from last week</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {analytics.performanceMetrics.uptime}%
            </div>
            <div className="text-gray-400 text-sm">System Uptime</div>
            <div className="text-xs text-cyan-400 mt-1">99.9% SLA maintained</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {analytics.performanceMetrics.accuracy}%
            </div>
            <div className="text-gray-400 text-sm">Detection Accuracy</div>
            <div className="text-xs text-purple-400 mt-1">↑ 2.3% improvement</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {analytics.performanceMetrics.falsePositives}%
            </div>
            <div className="text-gray-400 text-sm">False Positive Rate</div>
            <div className="text-xs text-yellow-400 mt-1">↓ 0.8% reduction</div>
          </div>
        </div>
      </CyberpunkCard>
    </div>
  );
}