import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { emailAPI, casesAPI } from '../api'
import { Mail, Send, AlertTriangle, Globe, Link, Wallet, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const DEMO_EMAIL = `From: "Bank Security" <sender.phoenix@tempmail.io>
To: victim@example.com
Reply-To: recovery@secure-bank-verify.com
Subject: URGENT: Account Suspended - Verify Now

Dear Customer,

Your account has been suspended. Verify immediately:
http://secure-bank-verify.com/verify?id=892hfj2

Send $500 in Bitcoin to: 0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f

X-Originating-IP: 185.220.101.42

Bank Security Team`

export default function MailGuardPage() {
  const [content, setContent] = useState('')
  const [selectedCase, setSelectedCase] = useState('')
  const [result, setResult] = useState<any>(null)

  const { data: casesData } = useQuery({ queryKey: ['cases-select'], queryFn: () => casesAPI.getAll({ limit: 50 }) })

  const analyzeMutation = useMutation({
    mutationFn: (data: any) => emailAPI.analyze(data),
    onSuccess: (res) => { setResult(res.data.data); toast.success('Email analysis complete') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Analysis failed'),
  })

  const { data: historyData } = useQuery({ queryKey: ['email-history'], queryFn: () => emailAPI.getHistory() })

  const scoreColor = (s: number) => s >= 70 ? 'text-crimson-400' : s >= 45 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <h1 className="page-title">MailGuard Intelligence</h1>
          </div>
          <p className="page-subtitle">SIH26106 — Email Threat Detection & Forensic Analysis</p>
        </div>
      </div>

      <div className="ai-disclaimer">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Analyzes supplied/demo email data only. No unauthorized access. All findings require human verification.
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-200">Email Content</h2>
            <button onClick={() => setContent(DEMO_EMAIL)} className="text-xs text-cyber-400 hover:text-cyber-300 border border-cyber-600/30 px-2 py-1 rounded">
              Load Demo Email
            </button>
          </div>
          <textarea
            className="textarea text-xs font-mono"
            rows={14}
            placeholder="Paste email content or headers here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Link to Investigation (optional)</label>
            <select className="select" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
              <option value="">— Select case —</option>
              {(casesData?.data?.data || []).map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <button onClick={() => analyzeMutation.mutate({ content, caseId: selectedCase || undefined })}
            disabled={!content.trim() || analyzeMutation.isPending} className="btn-primary w-full justify-center">
            {analyzeMutation.isPending ? <><div className="spinner w-4 h-4" /> Analyzing...</> : <><Send className="w-4 h-4" /> Analyze Email</>}
          </button>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-200">Forensic Results</h2>
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Threat Score</div>
                  <div className={`text-3xl font-black ${scoreColor(result.threatScore)}`}>{result.threatScore}/100</div>
                </div>
                <div className="flex-1">
                  <div className="risk-bar"><div className="risk-fill" style={{ width: `${result.threatScore}%`, background: result.threatScore >= 70 ? '#f43f5e' : result.threatScore >= 45 ? '#f59e0b' : '#10b981' }} /></div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(result.threatCategories || []).map((c: string) => <span key={c} className="badge-high badge text-[10px]">{c}</span>)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-xs text-slate-500 mb-1">Sender</div>
                  <div className="text-xs text-slate-200 truncate">{result.senderEmail || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-xs text-slate-500 mb-1">Subject</div>
                  <div className="text-xs text-slate-200 truncate">{result.subject || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-xs text-slate-500 mb-1">SPF / DKIM / DMARC</div>
                  <div className="text-xs font-mono">{result.spfStatus} / {result.dkimStatus} / {result.dmarcStatus}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-xs text-slate-500 mb-1">Reply-To Mismatch</div>
                  <div className={`text-xs font-semibold ${result.replyTo && result.replyTo !== result.senderEmail ? 'text-crimson-400' : 'text-emerald-400'}`}>
                    {result.replyTo && result.replyTo !== result.senderEmail ? '⚠ Yes — Suspicious' : 'None'}
                  </div>
                </div>
              </div>

              {result.extractedIPs?.length > 0 && (
                <div>
                  <div className="section-label flex items-center gap-1"><Globe className="w-3 h-3" /> Extracted IPs</div>
                  {result.extractedIPs.map((ip: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded bg-slate-800/30 mb-1">
                      <span className="mono">{ip.ip}</span>
                      {ip.geolocation?.country && <span className="text-xs text-slate-400">{ip.geolocation.country}</span>}
                      {ip.isSuspicious && <span className="badge-critical badge ml-auto">⚠ Suspicious</span>}
                    </div>
                  ))}
                </div>
              )}

              {result.extractedWallets?.length > 0 && (
                <div>
                  <div className="section-label flex items-center gap-1"><Wallet className="w-3 h-3" /> Cryptocurrency Wallets Detected</div>
                  {result.extractedWallets.map((w: string, i: number) => (
                    <div key={i} className="mono p-2 rounded bg-crimson-600/10 border border-crimson-600/20 text-crimson-400 text-xs mb-1 break-all">{w}</div>
                  ))}
                </div>
              )}

              {result.indicators?.length > 0 && (
                <div>
                  <div className="section-label">Threat Indicators</div>
                  <div className="space-y-2">
                    {result.indicators.map((ind: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-800/30">
                        <AlertTriangle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${ind.severity === 'HIGH' ? 'text-crimson-400' : 'text-amber-400'}`} />
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{ind.name}</div>
                          <div className="text-xs text-slate-400">{ind.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="text-xs text-slate-500 mb-1 font-semibold">Forensic Summary</div>
                <p className="text-xs text-slate-300">{result.forensicSummary}</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Mail className="w-8 h-8" /></div>
              <p className="text-slate-400 text-sm">Paste email content to analyze</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-cyber-600/20"><h3 className="font-bold text-slate-200">Analysis History</h3></div>
        <div className="divide-y divide-slate-800/50">
          {(historyData?.data?.data || []).length === 0 ? (
            <div className="p-6 text-center text-slate-600 text-sm">No analyses yet</div>
          ) : (historyData?.data?.data || []).map((a: any) => (
            <div key={a._id} className="flex items-center gap-4 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.threatScore >= 70 ? 'bg-crimson-600/20 text-crimson-400' : 'bg-amber-600/20 text-amber-400'}`}>
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{a.subject || a.senderEmail || 'Unknown email'}</div>
                <div className="text-xs text-slate-500 flex gap-3 mt-0.5">
                  <span>From: {a.senderEmail?.slice(0, 30) || 'N/A'}</span>
                  <span>IPs: {a.extractedIPs?.length || 0}</span>
                  <span>Wallets: {a.extractedWallets?.length || 0}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-black ${scoreColor(a.threatScore)}`}>{a.threatScore}</div>
                <div className="text-xs text-slate-600">{format(new Date(a.createdAt), 'MMM d')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
