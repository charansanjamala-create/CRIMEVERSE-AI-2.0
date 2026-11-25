import { useState, useEffect } from 'react'
import { X, Scan, UserCheck, ShieldAlert, Radio, MapPin, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { cctvAPI } from '../api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface FaceMatcherModalProps {
  isOpen: boolean
  onClose: () => void
  initialImage?: string
  suspectHint?: string
  sourceCamera?: string
}

export default function FaceMatcherModal({
  isOpen,
  onClose,
  initialImage,
  suspectHint,
  sourceCamera,
}: FaceMatcherModalProps) {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [selectedSuspect, setSelectedSuspect] = useState(suspectHint || 'Viktor Lazarov')

  const samplePhotos = [
    { name: 'Viktor Lazarov', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80', alias: 'The Ghost Broker' },
    { name: 'Maria Santos', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80', alias: 'Cipher M' },
    { name: 'James Vance', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80', alias: 'Spectre' },
    { name: 'Priya Sharma', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80', alias: 'Kali' },
  ]

  const runBiometricScan = async (hint?: string) => {
    setScanning(true)
    setResult(null)
    try {
      // Small simulated neural-net delay
      setTimeout(async () => {
        const res = await cctvAPI.matchFace({ suspectHint: hint || selectedSuspect })
        setResult(res.data.data)
        setScanning(false)
      }, 1200)
    } catch (err: any) {
      toast.error('Biometric matching service error')
      setScanning(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      runBiometricScan(suspectHint)
    }
  }, [isOpen, suspectHint])

  if (!isOpen) return null

  const handleBroadcastSms = () => {
    onClose()
    navigate('/dispatch')
    toast.success(`Redirected to Emergency SMS Hub with suspect APB prefilled`)
  }

  const handleViewOnMap = () => {
    onClose()
    navigate('/map')
    toast.success(`Viewing latest sighting coordinates on Tactical Map`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyber-500/40 rounded-2xl shadow-2xl shadow-cyber-900/50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-600/30 bg-slate-850/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyber-500/20 border border-cyber-500/50 flex items-center justify-center text-cyber-400">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Biometric Suspect Face Matcher
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyber-500/10 border border-cyber-500/30 text-cyber-300">
                  AI DEEP-VECTOR V4
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cross-matching captured optical landmarks against Interpol & National Criminal Mugshot Database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Quick Selectors */}
          <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400">Target Suspect Profile:</span>
            <div className="flex gap-2">
              {samplePhotos.map((s) => (
                <button
                  key={s.name}
                  onClick={() => {
                    setSelectedSuspect(s.name)
                    runBiometricScan(s.name)
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedSuspect === s.name
                      ? 'bg-cyber-600 text-white shadow-lg shadow-cyber-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Frame Scan Analysis */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>CCTV Optical Feed Analysis</span>
                {sourceCamera && (
                  <span className="text-cyber-400 font-mono text-[11px]">{sourceCamera}</span>
                )}
              </div>

              <div className="relative aspect-square max-h-[300px] w-full rounded-xl overflow-hidden border border-cyber-500/30 bg-slate-950 flex items-center justify-center group">
                <img
                  src={
                    initialImage ||
                    samplePhotos.find((p) => p.name === selectedSuspect)?.url ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80'
                  }
                  alt="Suspect Frame"
                  className="w-full h-full object-cover filter contrast-125"
                />

                {/* Laser Scanning Line */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-bounce top-1/2" />
                )}

                {/* Facial Reticle Overlay */}
                <div className="absolute inset-8 border-2 border-cyber-400/60 rounded-xl pointer-events-none">
                  {/* Corner brackets */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-300">
                    ALIGNMENT: LOCK 99.4%
                  </div>
                </div>

                {/* Status Watermark */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-[10px] font-mono text-slate-400">
                  <span>RES: 1080p DCI</span>
                  <span className={scanning ? 'text-amber-400' : 'text-emerald-400'}>
                    {scanning ? 'EXTRACTING BIOMETRIC HASH...' : 'IDENTIFICATION VERIFIED'}
                  </span>
                </div>
              </div>

              {/* Landmark Telemetry */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Inter-pupillary Distance:</span>
                  <span className="text-white">63.4 mm (±0.2)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Jawline Contour Confidence:</span>
                  <span className="text-emerald-400">96.8% MATCH</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Database Hash:</span>
                  <span className="text-cyber-400">SHA256:7f8a9...b4c2</span>
                </div>
              </div>
            </div>

            {/* Right: Database Match Dossier */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Database Match Dossier</span>
                <button
                  onClick={() => runBiometricScan()}
                  className="flex items-center gap-1 text-[11px] text-cyber-400 hover:text-cyber-300"
                >
                  <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} /> Rescan
                </button>
              </div>

              {scanning ? (
                <div className="h-64 flex flex-col items-center justify-center rounded-xl border border-cyber-600/30 bg-slate-950/50 p-6 text-center">
                  <div className="w-10 h-10 border-2 border-cyber-600/30 border-t-cyber-400 rounded-full animate-spin mb-4" />
                  <p className="text-sm font-semibold text-white">Comparing 128-dimensional embedding vectors...</p>
                  <p className="text-xs text-slate-400 mt-1">Filtering against 48,000 national records</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  {/* Top Match Card */}
                  <div className="p-4 rounded-xl border border-crimson-500/40 bg-crimson-950/20 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-white">{result.suspect.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-crimson-500/20 text-crimson-300 border border-crimson-500/40 font-bold">
                            {result.suspect.threatLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Alias: <span className="text-slate-200 font-medium">"{result.suspect.alias}"</span> • Age: {result.suspect.age} • {result.suspect.nationality}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-black text-emerald-400 font-mono">
                          {result.similarityScore}%
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          {result.confidenceRating}
                        </div>
                      </div>
                    </div>

                    {/* Similarity Bar */}
                    <div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyber-500 via-emerald-400 to-emerald-300 rounded-full transition-all duration-700"
                          style={{ width: `${result.similarityScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Warrants */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Outstanding Warrants:</span>
                      <ul className="space-y-1">
                        {result.suspect.warrants.map((w: string, idx: number) => (
                          <li key={idx} className="text-xs text-crimson-300 flex items-center gap-1.5 font-mono">
                            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Linked Case */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Linked Case:</span>
                      <span className="text-cyber-400 font-mono font-semibold">{result.suspect.caseIdTag}</span>
                    </div>
                  </div>

                  {/* Recommendation Box */}
                  <div className="p-3 rounded-lg bg-cyber-950/30 border border-cyber-600/30 text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyber-300">Tactical Directive: </strong>
                      {result.recommendedAction}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-cyber-600/30 bg-slate-850/90">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Biometric Neural Link Active
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleViewOnMap}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-cyber-400" />
              Pin on Tactical Map
            </button>

            <button
              onClick={handleBroadcastSms}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-crimson-600 to-red-600 hover:from-crimson-500 hover:to-red-500 shadow-lg shadow-crimson-900/40 flex items-center gap-1.5 transition-all"
            >
              <Radio className="w-3.5 h-3.5" />
              Broadcast APB SMS Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
