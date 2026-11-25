// ChainTrace AI — Mock Blockchain Transaction Analysis Service
// Uses synthetic/demo data only. No real blockchain API required.
// IMPORTANT: Never automatically labels any wallet/person as criminal.

export interface BlockchainAnalysisResult {
  walletAddress: string;
  blockchain: string;
  riskScore: number;
  riskLevel: string;
  transactionCount: number;
  totalValueUSD: number;
  suspiciousTransactions: number;
  indicators: { name: string; description: string; severity: string }[];
  transactions: {
    txHash: string;
    from: string;
    to: string;
    value: number;
    timestamp: Date;
    isSuspicious: boolean;
    suspicionReason?: string;
  }[];
  relatedWallets: { address: string; relationship: string; riskScore: number }[];
  exchangeConnections: { name: string; type: string; flagged: boolean }[];
  patternAnalysis: Record<string, any>;
  investigationTimeline: { date: Date; event: string; details: string }[];
  disclaimer: string;
  requiresHumanReview: boolean;
}

function deterministicRandom(seed: number, max: number = 1): number {
  const x = Math.sin(seed + 1) * 10000;
  return ((x - Math.floor(x)) * max);
}

function generateTxHash(seed: number): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(deterministicRandom(seed * i + i, 16))];
  }
  return hash;
}

function shortenAddress(addr: string): string {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export async function analyzeWallet(walletAddress: string, blockchain: string = 'ETH'): Promise<BlockchainAnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const seed = walletAddress.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const riskScore = Math.round(20 + deterministicRandom(seed, 70));
  const riskLevel = riskScore >= 75 ? 'HIGH' : riskScore >= 55 ? 'MEDIUM' : riskScore >= 30 ? 'LOW' : 'MINIMAL';
  const txCount = Math.round(10 + deterministicRandom(seed * 3, 200));
  const suspiciousTxCount = Math.round((riskScore / 100) * txCount * 0.4);
  const totalValueUSD = Math.round(1000 + deterministicRandom(seed * 7, 500000));

  const indicators: { name: string; description: string; severity: string }[] = [];

  if (riskScore > 70) {
    indicators.push({ name: 'Rapid Fund Movement', description: 'Funds transferred to multiple wallets within short time windows — potential layering activity', severity: 'HIGH' });
    indicators.push({ name: 'Mixer Interaction', description: 'Transaction history shows possible interaction with cryptocurrency mixing services', severity: 'HIGH' });
  }
  if (riskScore > 50) {
    indicators.push({ name: 'High-Volume Low-Value Transactions', description: 'Unusual pattern of many small transactions consistent with structuring', severity: 'MEDIUM' });
  }
  if (riskScore > 35) {
    indicators.push({ name: 'Peer-to-Peer Exchange Activity', description: 'Connections to unregulated exchange platforms detected', severity: 'MEDIUM' });
  }

  const now = Date.now();
  const transactions = Array.from({ length: Math.min(txCount, 15) }, (_, i) => {
    const isSuspicious = i < suspiciousTxCount;
    const daysAgo = Math.round(deterministicRandom(seed + i * 13, 90));
    return {
      txHash: generateTxHash(seed + i),
      from: i % 2 === 0 ? walletAddress : `0x${generateTxHash(seed + i * 3).slice(2, 42)}`,
      to: i % 2 !== 0 ? walletAddress : `0x${generateTxHash(seed + i * 7).slice(2, 42)}`,
      value: Math.round(deterministicRandom(seed + i, isSuspicious ? 50000 : 5000) * 100) / 100,
      timestamp: new Date(now - daysAgo * 86400000),
      isSuspicious,
      suspicionReason: isSuspicious ? ['Rapid sequence transfer', 'Round number transaction', 'Known suspicious address interaction'][i % 3] : undefined,
    };
  });

  const relatedWallets = Array.from({ length: Math.round(2 + deterministicRandom(seed, 5)) }, (_, i) => ({
    address: `0x${generateTxHash(seed + i * 100).slice(2, 42)}`,
    relationship: ['Sent funds to', 'Received funds from', 'Co-transacted with', 'Shares common intermediary with'][i % 4],
    riskScore: Math.round(deterministicRandom(seed + i * 200, 100)),
  }));

  const exchangeNames = ['Binance', 'Kraken', 'LocalBitcoins', 'Paxful', 'HitBTC'];
  const exchangeConnections = Array.from({ length: Math.round(1 + deterministicRandom(seed, 3)) }, (_, i) => ({
    name: exchangeNames[i % exchangeNames.length],
    type: i === 0 ? 'REGULATED' : 'PEER_TO_PEER',
    flagged: deterministicRandom(seed + i * 50) > 0.6,
  }));

  const timeline = transactions.slice(0, 5).map((tx, i) => ({
    date: tx.timestamp,
    event: tx.isSuspicious ? 'SUSPICIOUS_TRANSACTION' : 'TRANSACTION',
    details: `${tx.value.toFixed(4)} ${blockchain} transferred ${tx.from === walletAddress ? 'out' : 'in'}`,
  }));

  return {
    walletAddress,
    blockchain,
    riskScore,
    riskLevel,
    transactionCount: txCount,
    totalValueUSD,
    suspiciousTransactions: suspiciousTxCount,
    indicators,
    transactions,
    relatedWallets,
    exchangeConnections,
    patternAnalysis: {
      averageTransactionValue: (totalValueUSD / txCount).toFixed(2),
      transactionFrequency: `${(txCount / 90).toFixed(2)} tx/day`,
      dormancyPeriods: Math.round(deterministicRandom(seed * 11, 5)),
      concentrationRisk: riskScore > 60 ? 'HIGH' : 'MODERATE',
      layeringIndicators: riskScore > 70 ? 'DETECTED' : 'NOT_DETECTED',
    },
    investigationTimeline: timeline,
    disclaimer: 'This analysis is based on synthetic/demo data. Blockchain wallet analysis is an investigative indicator only. A high risk score does not constitute proof of criminal activity. Human expert review and legal process are required before any action.',
    requiresHumanReview: true,
  };
}
