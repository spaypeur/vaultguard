import axios from 'axios';
import crypto from 'crypto';

export async function fetchBinanceTransactions(apiKey: string, apiSecret: string) {
  const endpoint = 'https://api.binance.com/api/v3/account';
  const timestamp = Date.now();
  const query = `timestamp=${timestamp}`;
  const signature = crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
  const url = `${endpoint}?${query}&signature=${signature}`;
  const headers = { 'X-MBX-APIKEY': apiKey };
  const res = await axios.get(url, { headers });
  // You may need to fetch trades/withdrawals/deposits for full tax reporting
  return res.data;
}
