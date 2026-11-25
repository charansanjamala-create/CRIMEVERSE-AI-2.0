import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQuery } from '@tanstack/react-query'
import { identityAPI, casesAPI } from '../api'
import { Shield, Upload, AlertTriangle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const DEMO_FIELDS = {
  documentNumber: 'A12345678', surname: 'Lazarov', givenNames: 'Viktor',
  nationality: 'Unknown', dateOfBirth: '1979-03-15',
  issueDate: '2017-01-01', expiryDate: '2030-01-01',
  issuingAuthority: 'Unknown Ministry',
}

export default function VeriTrustPage() {
  const [documentType, setDocumentType] = useState('PASSPORT')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [selectedCase, setSelectedCase] = useState('')
  const [result, setResult] = useState<any>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const { data: casesData } = useQuery({ queryKey: ['cases-select'], queryFn: () => casesAPI.getAll({ limit: 50 }) })
  const { data: historyData } = useQuery({ queryKey: ['identity-history'], queryFn: () => identityAPI.getHistory() })

  const onDrop = useCallback((files: File[]) => { if (files[0]) setUploadedFile(files[0]) }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }, maxFiles: 1 })

  const analyzeMutation = useMutation({
    mutationFn: (formData: FormData) => identityAPI.analyze(formData),
    onSuccess: (res) => { setResult(res.data.data); toast.success('Identity analysis complete') },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Analysis failed'),
  })

  const handleAnalyze = () => {
    const fd = new FormData()
    fd.append('documentType', documentType)
    fd.append('fields', JSON.stringify(fields))
    if (selectedCase) fd.append('caseId', selectedCase)
    if (uploadedFile) fd.append('document', uploadedFile)
    analyzeMutation.mutate(fd)
  }

  const riskColor = (s: number) => s >= 70 ? 'text-crimson-400' : s >= 40 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="page-title">VeriTrust AI</h1>
          </div>
          <p className="page-subtitle">SIH26188 — Fake Identity & Document Screening</p>
        </div>
      </div>

      <div className="ai-disclaimer">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Results indicate inconsistencies requiring verification. Does NOT declare any document fake. Human expert review is mandatory.
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-200">Document Analysis</h2>
            <button onClick={() => setFields(DEMO_FIELDS)} className="text-xs text-cyber-400 hover:text-cyber-300 border border-cyber-600/30 px-2 py-1 rounded">Load Demo</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Document Type</label>
            <select className="select" value={documentType} onChange={e => setDocumentType(e.target.value)}>
              {['PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'BIRTH_CERTIFICATE', 'OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Upload */}
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${uploadedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-600 hover:border-emerald-500/50'}`}>
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div><CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" /><p className="text-xs text-emerald-400">{uploadedFile.name}</p></div>
            ) : (
              <div><Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" /><p className="text-xs text-slate-400">Drop document image/PDF (optional)</p></div>
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-2">
            {['documentNumber', 'surname', 'givenNames', 'nationality', 'dateOfBirth', 'issueDate', 'expiryDate', 'issuingAuthority'].map(field => (
              <div key={field}>
                <label className="block text-[11px] font-medium text-slate-400 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input className="input text-xs" value={fields[field] || ''} onChange={e => setFields(prev => ({...prev, [field]: e.target.value}))} placeholder={field} />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Link to Case (optional)</label>
            <select className="select" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
              <option value="">— Select case —</option>
              {(casesData?.data?.data || []).map((c: any) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>

          <button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="btn-primary w-full justify-center">
            {analyzeMutation.isPending ? <><div className="spinner w-4 h-4" /> Analyzing...</> : <><Shield className="w-4 h-4" /> Analyze Document</>}
          </button>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-200">Verification Results</h2>
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Risk Score</div>
                  <div className={`text-3xl font-black ${riskColor(result.riskScore)}`}>{result.riskScore}/100</div>
                </div>
                <div className="flex-1">
                  <div className="risk-bar"><div className="risk-fill" style={{ width: `${result.riskScore}%`, background: result.riskScore >= 70 ? '#f43f5e' : result.riskScore >= 40 ? '#f59e0b' : '#10b981' }} /></div>
                  <div className={`mt-2 text-xs font-bold ${riskColor(result.riskScore)}`}>{result.verificationStatus}</div>
                </div>
              </div>

              {result.inconsistencies?.length > 0 && (
                <div>
                  <div className="section-label">Field Inconsistencies ({result.inconsistencies.length})</div>
                  {result.inconsistencies.map((inc: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-crimson-600/5 border border-crimson-600/20 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-crimson-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-crimson-400 capitalize">{inc.field}</div>
                        <div className="text-xs text-slate-400">{inc.description}</div>
                      </div>
                      <span className={`ml-auto badge text-[10px] ${inc.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>{inc.severity}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.metadataFlags?.length > 0 && (
                <div>
                  <div className="section-label">Metadata Flags</div>
                  {result.metadataFlags.map((f: string, i: number) => (
                    <div key={i} className="text-xs text-amber-400 flex items-center gap-2 p-2 bg-amber-600/5 rounded mb-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              )}

              <div className="ai-disclaimer text-xs"><AlertTriangle className="w-3 h-3 flex-shrink-0" />{result.disclaimer}</div>
            </div>
          ) : (
            <div className="empty-state"><div className="empty-state-icon"><Shield className="w-8 h-8" /></div><p className="text-slate-400 text-sm">Fill in document fields to analyze</p></div>
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
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.riskScore >= 60 ? 'bg-crimson-600/20 text-crimson-400' : 'bg-emerald-600/20 text-emerald-400'}`}><Shield className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-200">{a.documentType} — {a.subjectName || 'Unknown'}</div>
                <div className="text-xs text-slate-500">{a.verificationStatus}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-lg font-black ${riskColor(a.riskScore)}`}>{a.riskScore}</div>
                <div className="text-xs text-slate-600">{format(new Date(a.createdAt), 'MMM d')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
