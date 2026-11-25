import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsAPI, casesAPI } from '../api'
import { format } from 'date-fns'
import {
  FileText, Plus, AlertTriangle, Download, RefreshCw, ChevronDown, ChevronUp, Cpu
} from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

export default function ReportsPage() {
  const queryClient = useQueryClient()
  const [selectedCase, setSelectedCase] = useState('')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  const { data: casesData } = useQuery({
    queryKey: ['cases-list'],
    queryFn: () => casesAPI.getAll({ limit: 50 }),
  })

  const cases = casesData?.data?.data || []

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', selectedCase],
    queryFn: () => selectedCase ? reportsAPI.getByCase(selectedCase) : null,
    enabled: !!selectedCase,
  })

  const reports = reportsData?.data?.data || []

  const generateMutation = useMutation({
    mutationFn: () => reportsAPI.generate({ caseId: selectedCase }),
    onSuccess: () => {
      toast.success('Report generated successfully')
      queryClient.invalidateQueries({ queryKey: ['reports', selectedCase] })
    },
    onError: () => toast.error('Failed to generate report'),
  })

  const downloadReport = (report: any) => {
    const content = report.sections?.map((s: any) => `## ${s.title}\n\n${s.content}`).join('\n\n---\n\n') || ''
    const fullText = `# ${report.title}\n\nGenerated: ${format(new Date(report.createdAt), 'PPP p')}\nAI Provider: ${report.aiProvider}\nOverall Risk: ${report.riskSummary?.overallRisk}\n\n---\n\n${content}`
    const blob = new Blob([fullText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title?.replace(/\s+/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Intelligence Reports</h1>
          <p className="page-subtitle">AI-generated investigation reports and summaries</p>
        </div>
      </div>

      {/* Case selector */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-200 mb-3">Select Investigation</h3>
        <div className="flex gap-3 flex-wrap">
          <select className="select flex-1 min-w-[200px]" value={selectedCase} onChange={(e) => setSelectedCase(e.target.value)}>
            <option value="">— Choose a case —</option>
            {cases.map((c: any) => (
              <option key={c._id} value={c._id}>{c.title} ({c.caseId})</option>
            ))}
          </select>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={!selectedCase || generateMutation.isPending}
            className="btn-primary"
          >
            <Cpu className="w-4 h-4" />
            {generateMutation.isPending ? 'Generating...' : 'Generate AI Report'}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="ai-disclaimer">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        Reports are AI-generated and require expert human review before any action is taken. They do not constitute legal evidence.
      </div>

      {/* Reports */}
      {!selectedCase ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText className="w-8 h-8" /></div>
          <p className="text-slate-300 font-medium">Select a case to view reports</p>
          <p className="text-slate-500 text-sm mt-1">Choose an investigation from the dropdown above</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-48"><div className="spinner w-8 h-8" /></div>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText className="w-8 h-8" /></div>
          <p className="text-slate-300 font-medium">No reports yet</p>
          <p className="text-slate-500 text-sm mt-1">Generate the first AI intelligence report for this case</p>
          <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn-primary mt-4">
            <Cpu className="w-4 h-4" /> Generate Intelligence Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r: any) => {
            const isExpanded = expandedReport === r._id
            return (
              <div key={r._id} className="card overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-100">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Generated {format(new Date(r.createdAt), 'PPP p')} · {r.aiProvider}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${r.riskSummary?.overallRisk === 'HIGH' || r.riskSummary?.overallRisk === 'CRITICAL' ? 'badge-high' : 'badge-medium'}`}>
                      {r.riskSummary?.overallRisk || 'UNKNOWN'} Risk
                    </span>
                    <button onClick={() => downloadReport(r)} className="btn-secondary text-xs py-1 px-2">
                      <Download className="w-3.5 h-3.5" /> Export
                    </button>
                    <button onClick={() => setExpandedReport(isExpanded ? null : r._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 space-y-5 animate-fade-in">
                    {/* Risk metrics */}
                    {r.riskSummary && (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Overall Risk', value: r.riskSummary.overallRisk },
                          { label: 'Threat Score', value: r.riskSummary.threatScore ?? '—' },
                          { label: 'Confidence', value: r.riskSummary.confidence ? `${Math.round(r.riskSummary.confidence * 100)}%` : '—' },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <div className="text-lg font-black text-slate-100">{value}</div>
                            <div className="text-xs text-slate-500">{label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sections */}
                    {(r.sections || []).map((s: any) => (
                      <div key={s.sectionId} className="border border-slate-800/60 rounded-xl overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-800/40 border-b border-slate-800/60 flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-200">{s.title}</h4>
                          {s.isAIGenerated && <span className="badge badge-info text-[10px]">AI Generated</span>}
                        </div>
                        <div className="p-4">
                          <div className="prose prose-invert prose-sm max-w-none [&>h1]:text-base [&>h2]:text-sm [&>table]:text-xs">
                            <ReactMarkdown>{s.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="ai-disclaimer">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      This report contains AI-generated content. All findings require human expert review before any action.
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
