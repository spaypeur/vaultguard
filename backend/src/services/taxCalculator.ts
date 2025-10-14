import { fetchCoinbaseTransactions } from '../integrations/coinbase';
import { fetchBinanceTransactions } from '../integrations/binance';

export type Transaction = {
  id: string;
  type: string;
  asset: string;
  amount: number;
  date: string;
  price?: number;
  fee?: number;
  exchange: string;
};

export type GainLoss = {
  asset: string;
  proceeds: number;
  costBasis: number;
  gainOrLoss: number;
  dateAcquired: string;
  dateSold: string;
  txId: string;
  exchange: string;
};

// FIFO cost basis calculation for simplicity
export function calculateGainsLosses(transactions: Transaction[]): GainLoss[] {
  const buys: { [asset: string]: Transaction[] } = {};
  const results: GainLoss[] = [];
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  for (const tx of sorted) {
    if (tx.type === 'buy') {
      if (!buys[tx.asset]) buys[tx.asset] = [];
      buys[tx.asset].push(tx);
    } else if (tx.type === 'sell') {
      let amountToMatch = tx.amount;
      while (amountToMatch > 0 && buys[tx.asset] && buys[tx.asset].length > 0) {
        const buyTx = buys[tx.asset][0];
        const matchedAmount = Math.min(buyTx.amount, amountToMatch);
        results.push({
          asset: tx.asset,
          proceeds: matchedAmount * (tx.price || 0),
          costBasis: matchedAmount * (buyTx.price || 0),
          gainOrLoss: matchedAmount * ((tx.price || 0) - (buyTx.price || 0)),
          dateAcquired: buyTx.date,
          dateSold: tx.date,
          txId: tx.id,
          exchange: tx.exchange,
        });
        buyTx.amount -= matchedAmount;
        amountToMatch -= matchedAmount;
        if (buyTx.amount === 0) buys[tx.asset].shift();
      }
    }
  }
  return results;
}

// Example: fetch and aggregate all transactions for a user
export async function getAllUserTransactions(user: any) {
  let txs: Transaction[] = [];
  if (user.coinbaseAccessToken) {
    const coinbaseTxs = await fetchCoinbaseTransactions(user.coinbaseAccessToken);
    // Map to Transaction type as needed
    txs = txs.concat(coinbaseTxs.map((t: any) => ({
      id: t.id,
      type: t.type,
      asset: t.amount?.currency,
      amount: parseFloat(t.amount?.amount),
      date: t.created_at,
      price: t.native_amount ? Math.abs(parseFloat(t.native_amount.amount)) / Math.abs(parseFloat(t.amount.amount)) : undefined,
      fee: t.fee ? parseFloat(t.fee.amount) : undefined,
      exchange: 'coinbase',
    })));
  }
  if (user.binanceApiKey && user.binanceApiSecret) {
    const binanceData = await fetchBinanceTransactions(user.binanceApiKey, user.binanceApiSecret);
    // Map to Transaction type as needed (simplified)
    // ...
  }
  return txs;
}
