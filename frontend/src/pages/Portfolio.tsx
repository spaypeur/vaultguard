import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  currency: string;
  riskLevel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  amount: number;
  value: number;
  currency: string;
  blockchain?: string;
  address?: string;
  exchange?: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export default function Portfolio() {
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    name: '',
    description: '',
    currency: 'USD',
    riskLevel: 'moderate',
  });
  const [assetForm, setAssetForm] = useState({
    symbol: '',
    name: '',
    type: 'cryptocurrency',
    amount: '',
    value: '',
    currency: 'USD',
    blockchain: '',
    address: '',
    exchange: '',
  });

  const queryClient = useQueryClient();

  // Fetch portfolios
  const { data: portfolios, isLoading: portfoliosLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const { data } = await api.get('/portfolio');
      return data.data;
    },
  });

  // Fetch portfolio assets
  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['portfolios', selectedPortfolio?.id, 'assets'],
    queryFn: async () => {
      if (!selectedPortfolio) return [];
      const { data } = await api.get(`/portfolio/${selectedPortfolio.id}/assets`);
      return data.data;
    },
    enabled: !!selectedPortfolio,
  });

  // Create portfolio mutation
  const createPortfolioMutation = useMutation({
    mutationFn: async (portfolioData: typeof portfolioForm) => {
      const { data } = await api.post('/portfolio', portfolioData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      setShowCreateForm(false);
      setPortfolioForm({
        name: '',
        description: '',
        currency: 'USD',
        riskLevel: 'moderate',
      });
      toast.success('Portfolio created successfully');
    },
    onError: () => {
      toast.error('Failed to create portfolio');
    },
  });

  // Add asset mutation
  const addAssetMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const { data } = await api.post(`/portfolio/${selectedPortfolio?.id}/assets`, assetData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios', selectedPortfolio?.id, 'assets'] });
      setShowAddAssetForm(false);
      setAssetForm({
        symbol: '',
        name: '',
        type: 'cryptocurrency',
        amount: '',
        value: '',
        currency: 'USD',
        blockchain: '',
        address: '',
        exchange: '',
      });
      toast.success('Asset added successfully');
    },
    onError: () => {
      toast.error('Failed to add asset');
    },
  });

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    createPortfolioMutation.mutate(portfolioForm);
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const assetData = {
      ...assetForm,
      amount: parseFloat(assetForm.amount),
      value: parseFloat(assetForm.value),
    };
    addAssetMutation.mutate(assetData);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getAssetTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cryptocurrency: 'text-orange-400',
      token: 'text-blue-400',
      nft: 'text-purple-400',
      defi_position: 'text-green-400',
      stock: 'text-yellow-400',
      bond: 'text-red-400',
    };
    return colors[type] || 'text-gray-400';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Portfolio Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Portfolio
        </button>
      </div>

      {/* Portfolios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {portfoliosLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="text-gray-400">Loading portfolios...</div>
          </div>
        ) : portfolios?.length > 0 ? (
          portfolios.map((portfolio: Portfolio) => (
            <div
              key={portfolio.id}
              onClick={() => setSelectedPortfolio(portfolio)}
              className={`card cursor-pointer transition-all duration-200 hover:border-primary-500 ${
                selectedPortfolio?.id === portfolio.id ? 'border-primary-500 bg-primary-500 bg-opacity-10' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg">
                    <CurrencyDollarIcon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{portfolio.name}</h3>
                    <p className="text-sm text-gray-400">{portfolio.currency}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  portfolio.riskLevel === 'conservative' ? 'bg-green-900 text-green-200' :
                  portfolio.riskLevel === 'moderate' ? 'bg-yellow-900 text-yellow-200' :
                  portfolio.riskLevel === 'aggressive' ? 'bg-orange-900 text-orange-200' :
                  'bg-red-900 text-red-200'
                }`}>
                  {portfolio.riskLevel}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Value</span>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(portfolio.totalValue, portfolio.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Assets</span>
                  <span className="text-sm font-medium text-white">
                    0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Risk Level</span>
                  <span className="text-sm font-medium text-white capitalize">
                    {portfolio.riskLevel.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card text-center py-12">
            <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No portfolios yet</h3>
            <p className="text-gray-400 mb-4">Create your first portfolio to start managing your assets</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Portfolio
            </button>
          </div>
        )}
      </div>

      {/* Portfolio Details */}
      {selectedPortfolio && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">{selectedPortfolio.name}</h2>
              <p className="text-gray-400 text-sm">{selectedPortfolio.description}</p>
            </div>
            <button
              onClick={() => setShowAddAssetForm(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Asset
            </button>
          </div>

          {/* Assets List */}
          <div className="space-y-3">
            {assetsLoading ? (
              <div className="text-center py-8 text-gray-400">Loading assets...</div>
            ) : assets?.length > 0 ? (
              assets.map((asset: Asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-400">
                        {asset.symbol.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{asset.name}</h4>
                      <p className="text-sm text-gray-400">{asset.symbol}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${getAssetTypeColor(asset.type)}`}>
                        {formatCurrency(asset.value, asset.currency)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {asset.amount} {asset.symbol}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-3">No assets in this portfolio yet</p>
                <button
                  onClick={() => setShowAddAssetForm(true)}
                  className="btn-secondary"
                >
                  Add Your First Asset
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Portfolio Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Portfolio</h3>
            <form onSubmit={handleCreatePortfolio}>
              <div className="space-y-4">
                <div>
                  <label className="label">Portfolio Name</label>
                  <input
                    type="text"
                    value={portfolioForm.name}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Currency</label>
                    <select
                      value={portfolioForm.currency}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, currency: e.target.value })}
                      className="input"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Risk Level</label>
                    <select
                      value={portfolioForm.riskLevel}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, riskLevel: e.target.value })}
                      className="input"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                      <option value="very_aggressive">Very Aggressive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createPortfolioMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {createPortfolioMutation.isPending ? 'Creating...' : 'Create Portfolio'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddAssetForm && selectedPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Add Asset to {selectedPortfolio.name}</h3>
            <form onSubmit={handleAddAsset}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Symbol</label>
                    <input
                      type="text"
                      value={assetForm.symbol}
                      onChange={(e) => setAssetForm({ ...assetForm, symbol: e.target.value.toUpperCase() })}
                      className="input"
                      placeholder="BTC"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Asset Type</label>
                    <select
                      value={assetForm.type}
                      onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })}
                      className="input"
                    >
                      <option value="cryptocurrency">Cryptocurrency</option>
                      <option value="token">Token</option>
                      <option value="nft">NFT</option>
                      <option value="defi_position">DeFi Position</option>
                      <option value="staked">Staked</option>
                      <option value="stock">Stock</option>
                      <option value="bond">Bond</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Asset Name</label>
                  <input
                    type="text"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    className="input"
                    placeholder="Bitcoin"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Amount</label>
                    <input
                      type="number"
                      step="any"
                      value={assetForm.amount}
                      onChange={(e) => setAssetForm({ ...assetForm, amount: e.target.value })}
                      className="input"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Value ({assetForm.currency})</label>
                    <input
                      type="number"
                      step="any"
                      value={assetForm.value}
                      onChange={(e) => setAssetForm({ ...assetForm, value: e.target.value })}
                      className="input"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {assetForm.type === 'cryptocurrency' && (
                  <div>
                    <label className="label">Blockchain</label>
                    <select
                      value={assetForm.blockchain}
                      onChange={(e) => setAssetForm({ ...assetForm, blockchain: e.target.value })}
                      className="input"
                    >
                      <option value="">Select Blockchain</option>
                      <option value="bitcoin">Bitcoin</option>
                      <option value="ethereum">Ethereum</option>
                      <option value="solana">Solana</option>
                      <option value="polygon">Polygon</option>
                      <option value="avalanche">Avalanche</option>
                      <option value="binance_smart_chain">BSC</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddAssetForm(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addAssetMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {addAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
