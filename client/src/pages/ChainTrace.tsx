import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { blockchainAPI, casesAPI } from '../api'
import { Bitcoin, Search, AlertTriangle, ArrowRight, Wallet, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const DEMO_WALLET = '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f'

export default function ChainTracePage() {
  const [wallet, setWallet] = useState('')
  const [blockchain, setBlockchain] = useState('ETH')
  const [selectedCase, setSelectedCase] = useState('')
  const [result, setResult] = useState<any>(null)

  const { data: casesData } = useQuery({ queryKey: ['cases-select'], queryFn: () => casesAPI.getAll({ limit: 50 }) })
  const { data: historyData } = useQuery({ queryKey: ['blockchain-history'], queryFn: () => blockchainAPI.getHistory() })

  const analyzeMutation = useMutation({
    mutationFn: (data: any) => blockchainAPI.analyze(data),
    onSuccess: (res) => { setResult(res.data.data); toast.success('Blockchain analysis complete') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Analysis failed'),
  })

  const riskColor = (s: number) => s >= 65 ? '#f43f5e' : s >= 40 ? '#f59e0b' : '#10b981'
  const riskClass = (s: number) => s >= 65 ? 'text-crimson-400' : s >= 40 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Bitcoin className="w-4 h-4 text-white" />
            </div>
            <h1 className="page-title">ChainTrace AI</h1>
          </div>
          <p className="page-subtitle">SIH26183 — Cryptocurrency Fraud & Exchange Tracing</p>
        </div>
      </div>

      <div className="ai-disclaimer">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Uses synthetic/demo blockchain data. Real deployments require licensed blockchain analytics API. Human review required.
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-200">Wallet Analysis</h2>
            <button onClick={() => setWallet(DEMO_WALLET)} className="text-xs text-cyber-400 border border-cyber-600/30 px-2 py-1 rounded">Demo Wallet</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Wallet Address *</label>
            <input className="input font-mono text-xs" placeholder="0x..." value={wallet} onChange={e => setWallet(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Blockchain</label>
              <select className="select" value={blockchain} onChange={e => setBlockchain(e.target.value)}>
                {['ETH', 'BTC', 'BNB', 'TRX', 'MATIC', 'USDT'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Link to Case</label>
              <select className="select" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
                <option value="">— Select —</option>
                {(casesData?.data?.data || []).map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <button onClick={() => analyzeMutation.mutate({ walletAddress: wallet, blockchain, caseId: selectedCase || undefined })}
            disabled={!wallet.trim() || analyzeMutation.isPending} className="btn-primary w-full justify-center">
            {analyzeMutation.isPending ? <><div className="spinner w-4 h-4" /> Tracing...</> : <><Search className="w-4 h-4" /> Trace Wallet</>}
          </button>
        </div>

        <div className="card p-5 space-y-4 overflow-y-auto max-h-[550px]">
          <h2 className="font-bold text-slate-200">Trace Results</h2>
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                  <div className="text-3xl font-black" style={{ color: riskColor(result.riskScore) }}>{result.riskScore}/100</div>
                </div>
                <div className="flex-1">
                  <div className="risk-bar"><div className="risk-fill" style={{ width: `${result.riskScore}%`, background: riskColor(result.riskScore) }} /></div>
                  <div className={`mt-2 text-xs font-bold ${riskClass(result.riskScore)}`}>{result.riskLevel}</div>
                  <div className="text-xs text-slate-500 mt-1 mono break-all">{result.walletAddress}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Transactions', value: result.transactionCount },
                  { label: 'Suspicious', value: result.suspiciousTransactions, red: true },
                  { label: 'Total Value (USD)', value: `$${(result.totalValueUSD || 0).toLocaleString()}` },
                ].map(s => (
                  <div key={s.label} className="p-3 rounded-lg bg-slate-800/30 text-center">
                    <div className={`text-xl font-black ${s.red ? 'text-crimson-400' : 'text-white'}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {result.indicators?.length > 0 && (
                <div>
                  <div className="section-label">Risk Indicators</div>
                  {result.indicators.map((ind: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-800/30 mb-2">
                      <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${ind.severity === 'HIGH' ? 'text-crimson-400' : 'text-amber-400'}`} />
                      <div><div className="text-xs font-semibold text-slate-200">{ind.name}</div><div className="text-xs text-slate-400">{ind.description}</div></div>
                    </div>
                  ))}
                </div>
              )}

              {result.transactions?.length > 0 && (
                <div>
                  <div className="section-label">Transactions ({result.transactions.length})</div>
                  <div className="space-y-2">
                    {result.transactions.map((tx: any, i: number) => (
                      <div key={i} className={`p-2 rounded text-xs ${tx.isSuspicious ? 'bg-crimson-600/10 border border-crimson-600/20' : 'bg-slate-800/30'}`}>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500 font-mono text-[10px]">{tx.txHash?.slice(0, 18)}...</span>
                          <span className={`font-bold ${tx.isSuspicious ? 'text-crimson-400' : 'text-emerald-400'}`}>${(tx.value || 0).toLocaleString()}</span>
                        </div>
                        {tx.isSuspicious && <div className="text-crimson-400 text-[10px]">⚠ {tx.suspicionReason}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.relatedWallets?.length > 0 && (
                <div>
                  <div className="section-label">Related Wallets</div>
                  {result.relatedWallets.map((rw: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-slate-800/30 mb-1">
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-xs text-slate-400 flex-1 truncate">{rw.address}</span>
                      <span className="text-xs text-slate-500">{rw.relationship}</span>
                      <span className={`text-xs font-bold ${rw.riskScore >= 65 ? 'text-crimson-400' : 'text-amber-400'}`}>{rw.riskScore}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="ai-disclaimer text-xs"><AlertTriangle className="w-3 h-3 flex-shrink-0" />{result.disclaimer}</div>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon"><Wallet className="w-8 h-8" /></div><p className="text-slate-400 text-sm">Enter wallet address to trace</p></div>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-cyber-600/20"><h3 className="font-bold text-slate-200">Analysis History</h3></div>
        <div className="divide-y divide-slate-800/50">
          {(historyData?.data?.data || []).length === 0 ? (
            <div className="p-6 text-center text-slate-600 text-sm">No analyses yet</div>
          ) : (historyData?.data?.data || []).map((a: any) => (
            <div key={a._id} className="flex items-center gap-4 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.riskScore >= 65 ? 'bg-crimson-600/20 text-crimson-400' : 'bg-amber-600/20 text-amber-400'}`}><Bitcoin className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 mono truncate">{a.walletAddress}</div>
                <div className="text-xs text-slate-500">{a.blockchain} · {a.transactionCount} txs · ${(a.totalValueUSD || 0).toLocaleString()}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-black ${riskClass(a.riskScore)}`}>{a.riskScore}</div>
                <div className="text-xs text-slate-600">{format(new Date(a.createdAt), 'MMM d')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
