import axios from 'axios';

export async function fetchCoinbaseTransactions(accessToken: string) {
  const url = 'https://api.coinbase.com/v2/accounts';
  const headers = { Authorization: `Bearer ${accessToken}` };
  // Fetch accounts
  const accountsRes = await axios.get(url, { headers });
  const accounts = accountsRes.data.data;
  // Fetch transactions for each account
  let transactions: any[] = [];
  for (const account of accounts) {
    const txRes = await axios.get(`https://api.coinbase.com/v2/accounts/${account.id}/transactions`, { headers });
    transactions = transactions.concat(txRes.data.data);
  }
  return transactions;
}
