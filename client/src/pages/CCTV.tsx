import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cctvAPI } from '../api'
import FaceMatcherModal from '../components/FaceMatcherModal'
import {
  Video, Grid2X2, Grid3X3, Maximize2, ShieldAlert, Eye, Sun, Camera as CameraIcon,
  Crosshair, Radio, RefreshCw, AlertTriangle, CheckCircle, ZoomIn, ZoomOut,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass, ShieldCheck, Flame, Sliders
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface Detection {
  id: string
  type: string
  label: string
  confidence: number
  bbox: [number, number, number, number]
  threatSeverity: string
  suspectMatch?: {
    name: string
    alias: string
    similarity: number
  }
}

interface CameraItem {
  _id: string
  cameraId: string
  name: string
  sector: string
  locationName: string
  coordinates: {
    lat: number
    lng: number
  }
  status: 'ONLINE' | 'ALERT' | 'DEGRADED' | 'OFFLINE'
  resolution: string
  fps: number
  bitrateMbps: number
  ptzCapable: boolean
  currentPan: number
  currentTilt: number
  currentZoom: number
  nightVision: boolean
  thermalMode: boolean
  activeDetections: Detection[]
  streamUrl?: string
}

export default function CCTVPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [selectedSector, setSelectedSector] = useState<string>('ALL')
  const [viewLayout, setViewLayout] = useState<'grid-2x2' | 'grid-3x3' | 'single'>('grid-2x2')
  const [focusedCameraId, setFocusedCameraId] = useState<string | null>(null)
  const [visionMode, setVisionMode] = useState<'normal' | 'night' | 'thermal'>('normal')
  const [overlayDetections, setOverlayDetections] = useState<boolean>(true)
  const [faceModalOpen, setFaceModalOpen] = useState(false)
  const [suspectHintForModal, setSuspectHintForModal] = useState<string>('Viktor Lazarov')

  // Clock for camera OSD
  const [currentTime, setCurrentTime] = useState(new Date().toISOString())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toISOString()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch cameras
  const { data: camerasResponse, isLoading, refetch } = useQuery({
    queryKey: ['cctv-cameras', selectedSector],
    queryFn: () => cctvAPI.getAll(selectedSector !== 'ALL' ? { sector: selectedSector } : {}),
    refetchInterval: 10000,
  })

  const cameras: CameraItem[] = camerasResponse?.data?.data || []
  const meta = camerasResponse?.data?.meta || { total: 0, onlineCount: 0, alertCount: 0 }

  // Default focus to first camera if not set
  useEffect(() => {
    if (cameras.length > 0 && !focusedCameraId) {
      setFocusedCameraId(cameras[0]._id)
    }
  }, [cameras, focusedCameraId])

  const focusedCamera = cameras.find((c) => c._id === focusedCameraId) || cameras[0]

  // PTZ mutation
  const ptzMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cctvAPI.updatePTZ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctv-cameras'] })
    },
  })

  const handlePTZ = (axis: 'pan' | 'tilt' | 'zoom', delta: number) => {
    if (!focusedCamera) return
    const newPan = axis === 'pan' ? focusedCamera.currentPan + delta : focusedCamera.currentPan
    const newTilt = axis === 'tilt' ? focusedCamera.currentTilt + delta : focusedCamera.currentTilt
    const newZoom = axis === 'zoom' ? Math.max(1, Math.min(8, focusedCamera.currentZoom + delta)) : focusedCamera.currentZoom

    ptzMutation.mutate({
      id: focusedCamera._id,
      data: { pan: newPan, tilt: newTilt, zoom: newZoom },
    })
  }

  // Snapshot frame to evidence center
  const snapshotMutation = useMutation({
    mutationFn: (data: any) => cctvAPI.saveSnapshot(data),
    onSuccess: (res) => {
      toast.success(`CCTV Frame archived to Evidence Center!`, { icon: '📸' })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to archive frame')
    },
  })

  const handleSnapshot = () => {
    if (!focusedCamera) return
    snapshotMutation.mutate({
      cameraId: focusedCamera.cameraId,
      title: `Surveillance Frame Capture [${focusedCamera.cameraId}]`,
      description: `Captured live optical frame from ${focusedCamera.name} at ${focusedCamera.locationName}. Threat level: ${focusedCamera.status}. Detections: ${focusedCamera.activeDetections.length}.`,
      tags: ['cctv', focusedCamera.sector.toLowerCase(), 'vision-ai'],
    })
  }

  // Trigger Vision AI Threat Detection
  const detectMutation = useMutation({
    mutationFn: (cameraId: string) => cctvAPI.detectThreats({ cameraId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cctv-cameras'] })
      toast.success('Vision AI detection refreshed: Threat alert updated', { icon: '🚨' })
    },
  })

  const sectors = ['ALL', 'Financial District', 'Transit Hub', 'Industrial Sector', 'Airport Sector', 'Harbor & Port', 'Cyber Tech Park']

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyber-400 mb-1">
            <Video className="w-4 h-4 animate-pulse" />
            <span>CRIMEVERSE LIVE OPTICAL SURVEILLANCE & AI SENTINEL</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            Live CCTV Surveillance Grid
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-crimson-500/20 text-crimson-400 border border-crimson-500/40 font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-crimson-400 animate-ping" />
              {meta.alertCount} THREATS FLAGGED
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time urban surveillance wall, automated computer vision anomaly detection & PTZ teleoperation.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layout buttons */}
          <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-xl p-1">
            <button
              onClick={() => setViewLayout('grid-2x2')}
              title="2x2 Grid (4 Feeds)"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewLayout === 'grid-2x2' ? 'bg-cyber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('grid-3x3')}
              title="3x3 Grid (9 Feeds)"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewLayout === 'grid-3x3' ? 'bg-cyber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('single')}
              title="Single Feed Deep Focus"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewLayout === 'single' ? 'bg-cyber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Vision mode switch */}
          <div className="flex items-center bg-slate-900 border border-slate-700/60 rounded-xl p-1 text-xs">
            <button
              onClick={() => setVisionMode('normal')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                visionMode === 'normal' ? 'bg-cyber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Optical
            </button>
            <button
              onClick={() => setVisionMode('night')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                visionMode === 'night' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Night IR
            </button>
            <button
              onClick={() => setVisionMode('thermal')}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                visionMode === 'thermal' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Thermal
            </button>
          </div>

          {/* Face Matcher Trigger */}
          <button
            onClick={() => {
              setSuspectHintForModal('Viktor Lazarov')
              setFaceModalOpen(true)
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Biometric Face Scan
          </button>
        </div>
      </div>

      {/* Sector Filter Pills & Telemetry Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">SECTOR:</span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSector === sec
                  ? 'bg-cyber-500/20 border border-cyber-500 text-cyber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ONLINE: <strong className="text-white">{meta.onlineCount}</strong>
          </span>
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-crimson-400 animate-pulse" />
            ALERTS: <strong className="text-crimson-400">{meta.alertCount}</strong>
          </span>
          <button
            onClick={() => refetch()}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Refresh Camera Nodes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Surveillance Display Grid & Control Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column (3 cols): Camera Feeds */}
        <div className="lg:col-span-3 space-y-4">
          {viewLayout === 'single' ? (
            /* Single Feed Focus Mode */
            focusedCamera && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-cyber-500/40 bg-black shadow-2xl">
                <CameraFeedCard
                  camera={focusedCamera}
                  isFocused={true}
                  visionMode={visionMode}
                  overlayDetections={overlayDetections}
                  currentTime={currentTime}
                  onSelect={() => {}}
                  onTriggerFaceMatch={(suspectName) => {
                    setSuspectHintForModal(suspectName || 'Viktor Lazarov')
                    setFaceModalOpen(true)
                  }}
                />
              </div>
            )
          ) : (
            /* Grid View (2x2 or 3x3) */
            <div
              className={`grid gap-4 ${
                viewLayout === 'grid-2x2' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {cameras.map((cam) => (
                <div
                  key={cam._id}
                  onClick={() => setFocusedCameraId(cam._id)}
                  className={`cursor-pointer transition-all rounded-xl overflow-hidden ${
                    focusedCameraId === cam._id
                      ? 'ring-2 ring-cyber-400 shadow-xl shadow-cyber-950/60'
                      : 'border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <CameraFeedCard
                    camera={cam}
                    isFocused={focusedCameraId === cam._id}
                    visionMode={visionMode}
                    overlayDetections={overlayDetections}
                    currentTime={currentTime}
                    onSelect={() => setFocusedCameraId(cam._id)}
                    onTriggerFaceMatch={(suspectName) => {
                      setSuspectHintForModal(suspectName || 'Viktor Lazarov')
                      setFaceModalOpen(true)
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Selected Camera Telemetry & PTZ Teleoperator */}
        <div className="space-y-4">
          {focusedCamera ? (
            <div className="bg-slate-900/90 border border-cyber-600/30 rounded-2xl p-5 space-y-5 shadow-glass">
              {/* Camera Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-cyber-400">{focusedCamera.cameraId}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      focusedCamera.status === 'ALERT'
                        ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {focusedCamera.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{focusedCamera.name}</h3>
                <p className="text-xs text-slate-400">{focusedCamera.locationName} • {focusedCamera.sector}</p>
              </div>

              {/* Live Telemetry Info */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Stream Quality:</span>
                  <span className="text-white">{focusedCamera.resolution}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frame Rate:</span>
                  <span className="text-emerald-400">{focusedCamera.fps} FPS (Stable)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Bitrate:</span>
                  <span className="text-cyber-400">{focusedCamera.bitrateMbps} Mbps</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Coordinates:</span>
                  <span className="text-slate-300">
                    {focusedCamera.coordinates.lat.toFixed(4)}, {focusedCamera.coordinates.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* PTZ Teleoperator Controller */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyber-400" />
                    PTZ Teleoperation
                  </span>
                  <span className="text-[11px] font-mono text-cyber-400">
                    P:{focusedCamera.currentPan}° T:{focusedCamera.currentTilt}° Z:{focusedCamera.currentZoom.toFixed(1)}x
                  </span>
                </div>

                {/* D-Pad Controller */}
                <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => handlePTZ('tilt', 5)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors mb-1 active:scale-95"
                    title="Tilt Up"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePTZ('pan', -10)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors active:scale-95"
                      title="Pan Left"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full border border-cyber-500/40 bg-cyber-500/10 flex items-center justify-center text-cyber-400 font-mono text-xs">
                      PTZ
                    </div>

                    <button
                      onClick={() => handlePTZ('pan', 10)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors active:scale-95"
                      title="Pan Right"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handlePTZ('tilt', -5)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors mt-1 active:scale-95"
                    title="Tilt Down"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center justify-between gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400 font-medium">OPTICAL ZOOM:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePTZ('zoom', -0.5)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-white min-w-[36px] text-center font-bold">
                      {focusedCamera.currentZoom.toFixed(1)}x
                    </span>
                    <button
                      onClick={() => handlePTZ('zoom', 0.5)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleSnapshot}
                  disabled={snapshotMutation.isPending}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  <CameraIcon className="w-4 h-4 text-cyan-400" />
                  {snapshotMutation.isPending ? 'Archiving...' : 'Save Frame to Evidence Center'}
                </button>

                <button
                  onClick={() => detectMutation.mutate(focusedCamera.cameraId)}
                  disabled={detectMutation.isPending}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyber-600/20 hover:bg-cyber-600/30 border border-cyber-500/40 text-cyber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  <Crosshair className="w-4 h-4 text-cyber-400" />
                  {detectMutation.isPending ? 'Analyzing Video Stream...' : 'Run Real-Time Vision AI Threat Scan'}
                </button>

                <button
                  onClick={() => navigate('/dispatch')}
                  className="w-full py-2.5 px-3 rounded-xl bg-crimson-600/20 hover:bg-crimson-600/30 border border-crimson-500/40 text-crimson-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  <Radio className="w-4 h-4 text-crimson-400" />
                  Issue Sector Emergency SMS Alert
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm bg-slate-900 rounded-2xl border border-slate-800">
              Select a camera feed to view telemetry
            </div>
          )}
        </div>
      </div>

      {/* Face Matcher Modal */}
      <FaceMatcherModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        suspectHint={suspectHintForModal}
        sourceCamera={focusedCamera?.cameraId}
      />
    </div>
  )
}

/* ─── Camera Feed Card Component with Canvas Simulation & Vision AI Overlay ─── */
function CameraFeedCard({
  camera,
  isFocused,
  visionMode,
  overlayDetections,
  currentTime,
  onSelect,
  onTriggerFaceMatch,
}: {
  camera: CameraItem
  isFocused: boolean
  visionMode: 'normal' | 'night' | 'thermal'
  overlayDetections: boolean
  currentTime: string
  onSelect: () => void
  onTriggerFaceMatch: (suspectName?: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Canvas visual loop for simulated live CCTV stream
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let frameCount = 0

    const render = () => {
      frameCount++
      const w = canvas.width
      const h = canvas.height

      // Background theme according to visionMode
      if (visionMode === 'night') {
        ctx.fillStyle = '#051809'
        ctx.fillRect(0, 0, w, h)
      } else if (visionMode === 'thermal') {
        ctx.fillStyle = '#180424'
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.fillStyle = '#0a101d'
        ctx.fillRect(0, 0, w, h)
      }

      // Simulated urban perspective & building silhouette
      ctx.strokeStyle = visionMode === 'night' ? 'rgba(74, 222, 128, 0.15)' : visionMode === 'thermal' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.15)'
      ctx.lineWidth = 1

      // Grid / Ground lines
      ctx.beginPath()
      ctx.moveTo(0, h * 0.75)
      ctx.lineTo(w, h * 0.75)
      for (let x = 0; x <= w; x += 40) {
        ctx.moveTo(x, h * 0.75)
        ctx.lineTo(w / 2 + (x - w / 2) * 1.8, h)
      }
      ctx.stroke()

      // Moving pedestrian silhouette or heat signature
      const posX = (w * 0.35 + Math.sin(frameCount * 0.02) * 40) % w
      const posY = h * 0.62

      if (visionMode === 'thermal') {
        // FLIR gradient blob
        const rad = ctx.createRadialGradient(posX, posY, 5, posX, posY, 35)
        rad.addColorStop(0, '#ffffff')
        rad.addColorStop(0.3, '#f59e0b')
        rad.addColorStop(0.7, '#ef4444')
        rad.addColorStop(1, 'transparent')
        ctx.fillStyle = rad
        ctx.beginPath()
        ctx.arc(posX, posY, 35, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Optical silhouette
        ctx.fillStyle = visionMode === 'night' ? 'rgba(34, 197, 94, 0.7)' : 'rgba(148, 163, 184, 0.6)'
        ctx.beginPath()
        ctx.arc(posX, posY - 20, 10, 0, Math.PI * 2) // Head
        ctx.rect(posX - 8, posY - 10, 16, 32) // Torso
        ctx.fill()
      }

      // Scanline noise overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1)
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(animationFrameId)
  }, [visionMode])

  const hasAlert = camera.status === 'ALERT'

  return (
    <div className="relative aspect-video w-full bg-black select-none overflow-hidden group">
      {/* Canvas Stream Render */}
      <canvas
        ref={canvasRef}
        width={480}
        height={270}
        className={`w-full h-full object-cover transition-filter ${
          visionMode === 'night' ? 'brightness-125 contrast-125 hue-rotate-60' : visionMode === 'thermal' ? 'contrast-150' : ''
        }`}
      />

      {/* Optical HUD Vignette */}
      <div className="absolute inset-0 pointer-events-none border border-cyber-500/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />

      {/* Camera OSD Header */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between text-[11px] font-mono pointer-events-none z-10">
        <div className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-2 border border-slate-800">
          <span className={`w-2 h-2 rounded-full ${hasAlert ? 'bg-crimson-400 animate-ping' : 'bg-emerald-400'}`} />
          <span className="font-bold text-white">{camera.cameraId}</span>
          <span className="text-slate-400 hidden sm:inline">{camera.name}</span>
        </div>

        <div className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm font-bold text-slate-300 border border-slate-800">
          {currentTime.slice(0, 19).replace('T', ' ')}
        </div>
      </div>

      {/* Vision AI Bounding Boxes Overlay */}
      {overlayDetections && camera.activeDetections && camera.activeDetections.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {camera.activeDetections.map((det) => (
            <div
              key={det.id}
              className={`absolute border-2 transition-all ${
                det.threatSeverity === 'CRITICAL'
                  ? 'border-crimson-500 bg-crimson-500/10 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                  : det.threatSeverity === 'HIGH'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-cyan-400 bg-cyan-400/10'
              }`}
              style={{
                left: `${det.bbox[0]}%`,
                top: `${det.bbox[1]}%`,
                width: `${det.bbox[2]}%`,
                height: `${det.bbox[3]}%`,
              }}
            >
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />

              {/* Tag Pill */}
              <div
                className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider text-white whitespace-nowrap ${
                  det.threatSeverity === 'CRITICAL' ? 'bg-crimson-600' : 'bg-slate-900 border border-slate-700'
                }`}
              >
                {det.label} ({(det.confidence * 100).toFixed(0)}%)
              </div>

              {/* Quick Biometric Face Match Button if Person detected */}
              {det.suspectMatch && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onTriggerFaceMatch(det.suspectMatch?.name)
                  }}
                  className="pointer-events-auto absolute -bottom-6 left-0 px-2 py-0.5 rounded bg-purple-700 hover:bg-purple-600 text-[9px] font-mono font-bold text-white shadow flex items-center gap-1"
                >
                  <Crosshair className="w-2.5 h-2.5" />
                  MATCH: {det.suspectMatch.name}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Camera OSD Footer */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono pointer-events-none z-10">
        <div className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm text-slate-300 border border-slate-800">
          PTZ: P{camera.currentPan}° T{camera.currentTilt}° Z{camera.currentZoom.toFixed(1)}x
        </div>

        <div className="bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm text-slate-400 border border-slate-800">
          {camera.resolution.split(' ')[0]} • {camera.fps}FPS
        </div>
      </div>
    </div>
  )
}
