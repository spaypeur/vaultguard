import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  WalletIcon,
  UserGroupIcon,
  KeyIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  CogIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import CyberpunkCard from './CyberpunkCard';

interface MultiSigWallet {
  id: string;
  name: string;
  address: string;
  requiredSignatures: number;
  totalSigners: number;
  balance: number;
  currency: string;
  network: string;
  status: 'active' | 'pending' | 'compromised';
  signers: {
    address: string;
    name: string;
    status: 'active' | 'pending' | 'revoked';
    lastActivity: string;
  }[];
  pendingTransactions: number;
  securityLevel: 'standard' | 'enhanced' | 'quantum';
}

interface PendingTransaction {
  id: string;
  walletId: string;
  to: string;
  amount: number;
  currency: string;
  description: string;
  requiredSignatures: number;
  currentSignatures: number;
  signers: string[];
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}

export default function MultiSigWalletManager() {
  const [wallets, setWallets] = useState<MultiSigWallet[]>([]);
  const [pendingTxs, setPendingTxs] = useState<PendingTransaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<MultiSigWallet | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Mock data for multi-sig wallets
    const mockWallets: MultiSigWallet[] = [
      {
        id: '1',
        name: 'Treasury Vault',
        address: '0x742d35cc6bf4c4c8f3a9b8f2e1d4a5b6c7d8e9f0',
        requiredSignatures: 3,
        totalSigners: 5,
        balance: 2500000,
        currency: 'USDC',
        network: 'Ethereum',
        status: 'active',
        signers: [
          { address: '0x123...abc', name: 'CEO Wallet', status: 'active', lastActivity: '2024-01-15T10:30:00Z' },
          { address: '0x456...def', name: 'CFO Wallet', status: 'active', lastActivity: '2024-01-15T09:15:00Z' },
          { address: '0x789...ghi', name: 'CTO Wallet', status: 'active', lastActivity: '2024-01-14T16:45:00Z' },
          { address: '0xabc...123', name: 'Board Member 1', status: 'active', lastActivity: '2024-01-13T14:20:00Z' },
          { address: '0xdef...456', name: 'Board Member 2', status: 'pending', lastActivity: '2024-01-10T11:30:00Z' },
        ],
        pendingTransactions: 2,
        securityLevel: 'quantum',
      },
      {
        id: '2',
        name: 'Operations Fund',
        address: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
        requiredSignatures: 2,
        totalSigners: 3,
        balance: 850000,
        currency: 'ETH',
        network: 'Ethereum',
        status: 'active',
        signers: [
          { address: '0x111...aaa', name: 'Operations Lead', status: 'active', lastActivity: '2024-01-15T08:00:00Z' },
          { address: '0x222...bbb', name: 'Finance Manager', status: 'active', lastActivity: '2024-01-14T17:30:00Z' },
          { address: '0x333...ccc', name: 'Security Officer', status: 'active', lastActivity: '2024-01-14T12:15:00Z' },
        ],
        pendingTransactions: 1,
        securityLevel: 'enhanced',
      },
      {
        id: '3',
        name: 'Emergency Reserve',
        address: '0x9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c',
        requiredSignatures: 4,
        totalSigners: 7,
        balance: 5000000,
        currency: 'USDT',
        network: 'Ethereum',
        status: 'active',
        signers: [
          { address: '0xaaa...111', name: 'Emergency Contact 1', status: 'active', lastActivity: '2024-01-12T10:00:00Z' },
          { address: '0xbbb...222', name: 'Emergency Contact 2', status: 'active', lastActivity: '2024-01-11T15:30:00Z' },
          { address: '0xccc...333', name: 'Legal Counsel', status: 'active', lastActivity: '2024-01-10T09:45:00Z' },
          { address: '0xddd...444', name: 'Compliance Officer', status: 'active', lastActivity: '2024-01-09T14:20:00Z' },
          { address: '0xeee...555', name: 'External Auditor', status: 'active', lastActivity: '2024-01-08T11:10:00Z' },
          { address: '0xfff...666', name: 'Board Chair', status: 'active', lastActivity: '2024-01-07T16:00:00Z' },
          { address: '0x000...777', name: 'Independent Director', status: 'revoked', lastActivity: '2024-01-01T12:00:00Z' },
        ],
        pendingTransactions: 0,
        securityLevel: 'quantum',
      },
    ];

    const mockPendingTxs: PendingTransaction[] = [
      {
        id: '1',
        walletId: '1',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        amount: 100000,
        currency: 'USDC',
        description: 'Q1 Marketing Budget Transfer',
        requiredSignatures: 3,
        currentSignatures: 2,
        signers: ['CEO Wallet', 'CFO Wallet'],
        createdAt: '2024-01-15T09:00:00Z',
        expiresAt: '2024-01-18T09:00:00Z',
        status: 'pending',
      },
      {
        id: '2',
        walletId: '1',
        to: '0xabcdef1234567890abcdef1234567890abcdef12',
        amount: 50000,
        currency: 'USDC',
        description: 'Vendor Payment - Security Audit',
        requiredSignatures: 3,
        currentSignatures: 1,
        signers: ['CTO Wallet'],
        createdAt: '2024-01-15T11:30:00Z',
        expiresAt: '2024-01-19T11:30:00Z',
        status: 'pending',
      },
      {
        id: '3',
        walletId: '2',
        to: '0x9876543210fedcba9876543210fedcba98765432',
        amount: 25,
        currency: 'ETH',
        description: 'Infrastructure Costs',
        requiredSignatures: 2,
        currentSignatures: 1,
        signers: ['Operations Lead'],
        createdAt: '2024-01-15T14:15:00Z',
        expiresAt: '2024-01-17T14:15:00Z',
        status: 'pending',
      },
    ];

    setWallets(mockWallets);
    setPendingTxs(mockPendingTxs);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'compromised': return 'red';
      case 'revoked': return 'gray';
      default: return 'gray';
    }
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'quantum': return 'purple';
      case 'enhanced': return 'cyan';
      case 'standard': return 'blue';
      default: return 'gray';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <CyberpunkCard glowColor="cyan" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <WalletIcon className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white">Multi-Signature Wallet Management</h3>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Create Wallet
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{wallets.length}</div>
            <div className="text-gray-400 text-xs">ACTIVE WALLETS</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              ${wallets.reduce((sum, w) => sum + w.balance, 0).toLocaleString()}
            </div>
            <div className="text-gray-400 text-xs">TOTAL VALUE</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{pendingTxs.length}</div>
            <div className="text-gray-400 text-xs">PENDING TXS</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {wallets.filter(w => w.securityLevel === 'quantum').length}
            </div>
            <div className="text-gray-400 text-xs">QUANTUM SECURED</div>
          </div>
        </div>
      </CyberpunkCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet List */}
        <CyberpunkCard glowColor="purple" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserGroupIcon className="w-6 h-6 text-purple-400" />
            <h4 className="text-lg font-bold text-white">Multi-Sig Wallets</h4>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {wallets.map((wallet, index) => (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-colors cursor-pointer ${
                  selectedWallet?.id === wallet.id ? 'border-purple-500 bg-purple-500/10' : ''
                }`}
                onClick={() => setSelectedWallet(wallet)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="text-white font-semibold">{wallet.name}</h5>
                    <p className="text-gray-400 text-sm font-mono">
                      {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${getStatusColor(wallet.status)}-400`}></span>
                    <span className={`text-xs px-2 py-1 rounded bg-${getSecurityLevelColor(wallet.securityLevel)}-500/20 text-${getSecurityLevelColor(wallet.securityLevel)}-400`}>
                      {wallet.securityLevel.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Signatures:</span>
                    <div className="text-white font-semibold">
                      {wallet.requiredSignatures}/{wallet.totalSigners}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Balance:</span>
                    <div className="text-green-400 font-semibold">
                      {wallet.balance.toLocaleString()} {wallet.currency}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Network:</span>
                    <div className="text-white">{wallet.network}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Pending:</span>
                    <div className="text-yellow-400 font-semibold">
                      {wallet.pendingTransactions} txs
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CyberpunkCard>

        {/* Pending Transactions */}
        <CyberpunkCard glowColor="orange" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ClockIcon className="w-6 h-6 text-orange-400" />
            <h4 className="text-lg font-bold text-white">Pending Transactions</h4>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pendingTxs.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h5 className="text-white font-semibold">{tx.description}</h5>
                    <p className="text-gray-400 text-sm">
                      To: {tx.to.slice(0, 10)}...{tx.to.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-bold">
                      {tx.amount.toLocaleString()} {tx.currency}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(tx.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-400">Signatures:</div>
                    <div className="text-white font-semibold">
                      {tx.currentSignatures}/{tx.requiredSignatures}
                    </div>
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(tx.currentSignatures / tx.requiredSignatures) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires: {formatTimeAgo(tx.expiresAt)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {tx.signers.map((signer, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center"
                        title={signer}
                      >
                        <CheckCircleIcon className="w-3 h-3 text-white" />
                      </div>
                    ))}
                    {Array.from({ length: tx.requiredSignatures - tx.currentSignatures }).map((_, i) => (
                      <div
                        key={`pending-${i}`}
                        className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center"
                      >
                        <ClockIcon className="w-3 h-3 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                      Sign
                    </button>
                    <button className="text-xs px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CyberpunkCard>
      </div>

      {/* Wallet Details Modal */}
      {selectedWallet && (
        <CyberpunkCard glowColor="cyan" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-white">Wallet Details: {selectedWallet.name}</h4>
            <button
              onClick={() => setSelectedWallet(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-white font-semibold mb-3">Signers</h5>
              <div className="space-y-2">
                {selectedWallet.signers.map((signer, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <div>
                      <div className="text-white text-sm font-semibold">{signer.name}</div>
                      <div className="text-gray-400 text-xs font-mono">
                        {signer.address.slice(0, 10)}...{signer.address.slice(-6)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full bg-${getStatusColor(signer.status)}-400`}></span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(signer.lastActivity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-3">Security Settings</h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Security Level:</span>
                  <span className={`px-2 py-1 rounded text-xs bg-${getSecurityLevelColor(selectedWallet.securityLevel)}-500/20 text-${getSecurityLevelColor(selectedWallet.securityLevel)}-400`}>
                    {selectedWallet.securityLevel.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Required Signatures:</span>
                  <span className="text-white">{selectedWallet.requiredSignatures}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Signers:</span>
                  <span className="text-white">{selectedWallet.totalSigners}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">{selectedWallet.network}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  <CogIcon className="w-4 h-4 inline mr-2" />
                  Configure
                </button>
                <button className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  <KeyIcon className="w-4 h-4 inline mr-2" />
                  Add Signer
                </button>
              </div>
            </div>
          </div>
        </CyberpunkCard>
      )}
    </div>
  );
}