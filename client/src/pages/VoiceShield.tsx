import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQuery } from '@tanstack/react-query'
import { voiceAPI, casesAPI } from '../api'
import { Mic, Upload, AlertTriangle, CheckCircle, Activity, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function RiskMeter({ score }: { score: number }) {
  const color = score >= 75 ? '#f43f5e' : score >= 55 ? '#f97316' : score >= 35 ? '#f59e0b' : '#10b981'
  const label = score >= 75 ? 'HIGH SUSPICION' : score >= 55 ? 'MEDIUM SUSPICION' : score >= 35 ? 'LOW SUSPICION' : 'MINIMAL'
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-300">Suspicion Score</span>
        <span className="text-2xl font-black" style={{ color }}>{score}/100</span>
      </div>
      <div className="risk-bar">
        <div className="risk-fill transition-all duration-1000" style={{ width: `${score}%`, background: color }} />
      </div>
      <div className="text-xs font-bold" style={{ color }}>{label}</div>
    </div>
  )
}

export default function VoiceShieldPage() {
  const [selectedCase, setSelectedCase] = useState('')
  const [result, setResult] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const { data: casesData } = useQuery({ queryKey: ['cases-select'], queryFn: () => casesAPI.getAll({ limit: 50 }) })

  const analyzeMutation = useMutation({
    mutationFn: (formData: FormData) => voiceAPI.analyze(formData),
    onSuccess: (res) => { setResult(res.data.data); toast.success('Voice analysis complete') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Analysis failed'),
  })

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) setUploadedFile(files[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.webm'] }, maxFiles: 1,
  })

  const handleAnalyze = () => {
    if (!uploadedFile) { toast.error('Please select an audio file'); return }
    const fd = new FormData()
    fd.append('audio', uploadedFile)
    if (selectedCase) fd.append('caseId', selectedCase)
    analyzeMutation.mutate(fd)
  }

  const { data: historyData } = useQuery({ queryKey: ['voice-history'], queryFn: () => voiceAPI.getHistory() })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <h1 className="page-title">VoiceShield AI</h1>
          </div>
          <p className="page-subtitle">SIH26104 — AI-Powered Voice Cloning Detection</p>
        </div>
      </div>

      <div className="ai-disclaimer">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        AI analysis is an investigative indicator only. Results require expert human review. NOT conclusive evidence.
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Upload panel */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-200">Upload Audio Sample</h2>

          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-purple-500 bg-purple-500/10' : uploadedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-600 hover:border-purple-500/50 hover:bg-slate-800/30'}`}>
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div>
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="font-semibold text-emerald-400">{uploadedFile.name}</p>
                <p className="text-xs text-slate-500 mt-1">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">{isDragActive ? 'Drop audio here...' : 'Drop audio file or click to browse'}</p>
                <p className="text-xs text-slate-500 mt-2">Supports: MP3, WAV, OGG, M4A (max 50MB)</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Link to Investigation (optional)</label>
            <select className="select" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
              <option value="">— Select case —</option>
              {(casesData?.data?.data || []).map((c: any) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          <button onClick={handleAnalyze} disabled={!uploadedFile || analyzeMutation.isPending} className="btn-primary w-full justify-center py-2.5">
            {analyzeMutation.isPending ? (
              <><div className="spinner w-4 h-4" /> Analyzing audio...</>
            ) : (
              <><Activity className="w-4 h-4" /> Analyze for Voice Cloning</>
            )}
          </button>
        </div>

        {/* Results panel */}
        <div className="card p-5 space-y-5">
          <h2 className="font-bold text-slate-200">Analysis Results</h2>
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <RiskMeter score={result.suspicionScore} />

              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1 font-semibold uppercase">Verdict</div>
                <div className={`text-sm font-bold ${result.suspicionScore >= 70 ? 'text-crimson-400' : result.suspicionScore >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.verdict}
                </div>
              </div>

              {result.indicators?.length > 0 && (
                <div>
                  <div className="section-label">Detection Indicators</div>
                  <div className="space-y-2">
                    {result.indicators.map((ind: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30">
                        <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${ind.severity === 'HIGH' ? 'text-crimson-400' : ind.severity === 'MEDIUM' ? 'text-amber-400' : 'text-cyber-400'}`} />
                        <div>
                          <div className="text-sm font-semibold text-slate-200">{ind.name}</div>
                          <div className="text-xs text-slate-400">{ind.description}</div>
                          <div className="text-xs text-slate-600 mt-1">Confidence: {ind.confidence}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ai-disclaimer text-xs">
                <Info className="w-3 h-3 flex-shrink-0" />
                {result.disclaimer}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Mic className="w-8 h-8" /></div>
              <p className="text-slate-400 text-sm">Upload an audio file to analyze</p>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-cyber-600/20">
          <h3 className="font-bold text-slate-200">Analysis History</h3>
        </div>
        <div className="divide-y divide-slate-800/50">
          {(historyData?.data?.data || []).length === 0 ? (
            <div className="p-6 text-center text-slate-600 text-sm">No analyses yet</div>
          ) : (historyData?.data?.data || []).map((a: any) => (
            <div key={a._id} className="flex items-center gap-4 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.suspicionScore >= 70 ? 'bg-crimson-600/20 text-crimson-400' : a.suspicionScore >= 50 ? 'bg-amber-600/20 text-amber-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{a.fileName}</div>
                <div className="text-xs text-slate-500 truncate">{a.verdict?.slice(0, 60)}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-black ${a.suspicionScore >= 70 ? 'text-crimson-400' : a.suspicionScore >= 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{a.suspicionScore}</div>
                <div className="text-xs text-slate-600">{format(new Date(a.createdAt), 'MMM d')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
