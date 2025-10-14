import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Exchange {
  name: string;
  connected: boolean;
  apiKey?: string;
  apiSecret?: string;
}

const TaxReport: React.FC = () => {
  const navigate = useNavigate();
  const [exchanges] = useState<Exchange[]>([
    { name: 'Coinbase', connected: false },
    { name: 'Binance', connected: false },
  ]);
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // Initiate payment for tax report
  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/payments/tax-report/create-session', {
        paymentMethod,
      });
      
      if (response.data.success) {
        const { url, wallets } = response.data.data;
        
        if (paymentMethod === 'fiat' && url) {
          // Redirect to Stripe checkout
          window.location.href = url;
        } else if (paymentMethod === 'crypto' && wallets) {
          // Show crypto payment modal with wallet addresses
          navigate('/tax-report/crypto-payment', { 
            state: { wallets, amount: 99, product: 'tax_report' } 
          });
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create payment session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Generate Tax Report (IRS Form 8949)</h1>
      
      {/* Exchange Connection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Connect Your Exchanges</h2>
        <div className="space-y-4">
          {exchanges.map((exchange) => (
            <div key={exchange.name} className="flex items-center justify-between">
              <div>
                <span className="font-medium">{exchange.name}</span>
                {exchange.connected && (
                  <span className="ml-2 text-green-500">✓ Connected</span>
                )}
              </div>
              {!exchange.connected && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => {
                    // Show modal/form to input API keys
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">2. Payment ($99)</h2>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded ${
                paymentMethod === 'fiat' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setPaymentMethod('fiat')}
            >
              Credit Card
            </button>
            <button
              className={`px-4 py-2 rounded ${
                paymentMethod === 'crypto' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setPaymentMethod('crypto')}
            >
              Cryptocurrency
            </button>
          </div>

          <button
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
            onClick={handlePayment}
            disabled={loading || !exchanges.some(e => e.connected)}
          >
            {loading ? 'Processing...' : 'Pay & Generate Report'}
          </button>

          {error && (
            <div className="text-red-500 mt-2">{error}</div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium mb-2">What's included:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Automatic transaction import from connected exchanges</li>
          <li>Cost basis calculation using FIFO method</li>
          <li>IRS Form 8949 compliant PDF report</li>
          <li>Gains/losses calculation for all trades</li>
          <li>Ready to use for tax filing</li>
        </ul>
      </div>
    </div>
  );
};

export default TaxReport;
