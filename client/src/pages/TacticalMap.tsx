import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { geoAPI, cctvAPI } from '../api'
import {
  MapPin, Shield, Video, Radio, Layers, Plus, Filter, Navigation, Compass,
  AlertTriangle, Crosshair, ZoomIn, ZoomOut, RotateCcw, Car, ShieldAlert,
  Clock, Eye, CheckCircle, ExternalLink, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface GeoIncident {
  _id: string
  incidentId: string
  title: string
  description: string
  crimeType: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  coordinates: { lat: number; lng: number }
  address: string
  sector: string
  status: string
  radiusMeters: number
  threatScore: number
  assignedUnits: string[]
  reportedAt: string
}

interface PatrolUnit {
  _id: string
  unitId: string
  callSign: string
  vehicleType: string
  officerInCharge: string
  contactRadio: string
  coordinates: { lat: number; lng: number }
  heading: number
  speedKmH: number
  status: string
  sector: string
}

interface CameraNode {
  _id: string
  cameraId: string
  name: string
  sector: string
  status: string
  coordinates: { lat: number; lng: number }
}

export default function TacticalMapPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Layer toggles
  const [showIncidents, setShowIncidents] = useState(true)
  const [showPatrols, setShowPatrols] = useState(true)
  const [showCameras, setShowCameras] = useState(true)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showSuspectTrail, setShowSuspectTrail] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL')

  // Selected item inspector
  const [selectedItem, setSelectedItem] = useState<{
    type: 'INCIDENT' | 'PATROL' | 'CAMERA' | 'WAYPOINT'
    data: any
  } | null>(null)

  // Pin incident modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [newPinCoords, setNewPinCoords] = useState<{ lat: number; lng: number }>({ lat: 28.625, lng: 77.215 })
  const [newPinTitle, setNewPinTitle] = useState('')
  const [newPinType, setNewPinType] = useState('SURVEILLANCE_FLAG')
  const [newPinSeverity, setNewPinSeverity] = useState('HIGH')

  // Map viewport transform (Pan & Zoom)
  const [zoom, setZoom] = useState(1.1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cursorCoords, setCursorCoords] = useState({ lat: 28.625, lng: 77.215 })

  // Data fetching
  const { data: incidentsRes } = useQuery({
    queryKey: ['geo-incidents'],
    queryFn: () => geoAPI.getIncidents(),
    refetchInterval: 12000,
  })

  const { data: patrolsRes } = useQuery({
    queryKey: ['geo-patrols'],
    queryFn: () => geoAPI.getPatrolUnits(),
    refetchInterval: 6000,
  })

  const { data: camerasRes } = useQuery({
    queryKey: ['cctv-cameras-map'],
    queryFn: () => cctvAPI.getAll(),
    refetchInterval: 15000,
  })

  const { data: trailRes } = useQuery({
    queryKey: ['geo-suspect-trail'],
    queryFn: () => geoAPI.getSuspectTrail('CV-PHOENIX-2024-001'),
  })

  const incidents: GeoIncident[] = incidentsRes?.data?.data || []
  const patrols: PatrolUnit[] = patrolsRes?.data?.data || []
  const cameras: CameraNode[] = camerasRes?.data?.data || []
  const suspectTrail = trailRes?.data?.data || []

  // Filtered incidents
  const filteredIncidents = incidents.filter(
    (inc) => filterSeverity === 'ALL' || inc.severity === filterSeverity
  )

  // Bounds reference for mapping coordinates to SVG canvas space:
  // Center roughly at Delhi/Metro Sector: Lat 28.53 to 28.66, Lng 77.08 to 77.26
  const mapBounds = {
    minLat: 28.54,
    maxLat: 28.66,
    minLng: 77.08,
    maxLng: 77.26,
  }

  // Convert lat/lng to canvas pixels (800x600 coordinate plane)
  const toMapX = (lng: number) => ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 800
  const toMapY = (lat: number) => (1 - (lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 600

  // Inverse from pixel to lat/lng
  const toLatLng = (x: number, y: number) => ({
    lat: mapBounds.minLat + (1 - y / 600) * (mapBounds.maxLat - mapBounds.minLat),
    lng: mapBounds.minLng + (x / 800) * (mapBounds.maxLng - mapBounds.minLng),
  })

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  // Create incident pin
  const createPinMutation = useMutation({
    mutationFn: (data: any) => geoAPI.createIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo-incidents'] })
      setIsPinModalOpen(false)
      toast.success('Tactical incident pinned on map', { icon: '📍' })
    },
  })

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault()
    createPinMutation.mutate({
      title: newPinTitle || 'Suspicious Activity Sighted',
      crimeType: newPinType,
      severity: newPinSeverity,
      coordinates: newPinCoords,
      address: 'Reported Sector Sighting',
      sector: 'Central Metro Corridor',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Compass className="w-4 h-4 animate-spin" />
            <span>CRIMEVERSE GEOSPATIAL INTELLIGENCE & TACTICAL TRACKER</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            Tactical Operations Crime Map
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
              {incidents.length} GEOTAGGED ZONES
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial vector command center tracking multi-sector incidents, patrol positions, CCTV nodes, and suspect movement trails.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyber-600 to-cyan-600 hover:from-cyber-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyber-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Pin New Sighting
          </button>

          <button
            onClick={() => navigate('/cctv')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Video className="w-4 h-4 text-cyan-400" />
            Switch to CCTV Grid
          </button>

          <button
            onClick={() => navigate('/dispatch')}
            className="px-3.5 py-2 rounded-xl bg-crimson-600/20 border border-crimson-500/40 hover:bg-crimson-600/30 text-crimson-300 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Radio className="w-4 h-4" />
            Dispatch SMS Alert
          </button>
        </div>
      </div>

      {/* Control Strip (Layer Toggles & Severity Filters) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl text-xs font-medium">
        {/* Layer Checkboxes */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyber-400" />
            Layers:
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyber-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-crimson-400" />
              Incidents ({incidents.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showPatrols}
              onChange={(e) => setShowPatrols(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyber-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Patrol Units ({patrols.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showCameras}
              onChange={(e) => setShowCameras(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyber-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              CCTV Nodes ({cameras.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showSuspectTrail}
              onChange={(e) => setShowSuspectTrail(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyber-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Suspect Trail
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyber-500 focus:ring-0"
            />
            <span>Crime Heatmap</span>
          </label>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 text-[11px] uppercase">SEVERITY:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                filterSeverity === sev
                  ? 'bg-cyber-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Map Viewport Area (3 columns) */}
        <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border-2 border-cyber-500/40 bg-slate-950 shadow-2xl h-[620px] select-none">
          {/* Zoom & Reset HUD Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700 rounded-xl p-1 backdrop-blur-md shadow-lg">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1.1)
                setPan({ x: 0, y: 0 })
              }}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Coordinate Readout HUD */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-300 backdrop-blur-md flex items-center gap-3">
            <span className="flex items-center gap-1 text-cyan-400">
              <Crosshair className="w-3.5 h-3.5" />
              ZOOM: {(zoom * 100).toFixed(0)}%
            </span>
            <span>LAT: {cursorCoords.lat.toFixed(4)}° N</span>
            <span>LNG: {cursorCoords.lng.toFixed(4)}° E</span>
            <span className="text-emerald-400">GRID: SEC-04 TACTICAL</span>
          </div>

          {/* Interactive Tactical SVG Map Canvas */}
          <div
            className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              viewBox="0 0 800 600"
              className="w-full h-full pointer-events-auto transition-transform duration-75"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <defs>
                {/* Radar Grid Pattern */}
                <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
                </pattern>

                {/* Heatmap Radial Gradients */}
                <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#ef4444" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>

                {/* Radar Sweep Gradient */}
                <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0.25)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Background Grid */}
              <rect width="800" height="600" fill="#070c16" />
              <rect width="800" height="600" fill="url(#tacticalGrid)" />

              {/* Major Highway Corridors & Metro River Vectors */}
              <g stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" fill="none">
                <path d="M 0,200 Q 250,220 500,180 T 800,240" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="2.5" />
                <path d="M 150,0 Q 220,300 320,600" />
                <path d="M 600,0 L 520,350 L 680,600" />
                <path d="M 280,180 L 520,350" strokeDasharray="4 4" stroke="rgba(148, 163, 184, 0.25)" />
              </g>

              {/* Sector Labels */}
              <text x="220" y="140" fill="rgba(148, 163, 184, 0.3)" fontSize="11" fontFamily="monospace" fontWeight="bold">
                SECTOR 1: FINANCIAL DISTRICT
              </text>
              <text x="480" y="140" fill="rgba(148, 163, 184, 0.3)" fontSize="11" fontFamily="monospace" fontWeight="bold">
                SECTOR 2: TRANSIT CONCOURSE
              </text>
              <text x="480" y="440" fill="rgba(148, 163, 184, 0.3)" fontSize="11" fontFamily="monospace" fontWeight="bold">
                SECTOR 3: INDUSTRIAL SAFEHOUSES
              </text>
              <text x="120" y="480" fill="rgba(148, 163, 184, 0.3)" fontSize="11" fontFamily="monospace" fontWeight="bold">
                SECTOR 4: AIRPORT & VIP CORRIDOR
              </text>

              {/* Heatmap Density Clusters */}
              {showHeatmap && (
                <g>
                  {filteredIncidents.map((inc) => {
                    const cx = toMapX(inc.coordinates.lng)
                    const cy = toMapY(inc.coordinates.lat)
                    const r = inc.severity === 'CRITICAL' ? 70 : 50
                    return (
                      <circle
                        key={`heat-${inc._id}`}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill={inc.severity === 'CRITICAL' ? 'url(#heatCritical)' : 'url(#heatHigh)'}
                      />
                    )
                  })}
                </g>
              )}

              {/* Suspect Movement Trail */}
              {showSuspectTrail && suspectTrail.length > 1 && (
                <g>
                  {/* Trail Path */}
                  <path
                    d={suspectTrail
                      .map((p: any, idx: number) => {
                        const x = toMapX(p.lng)
                        const y = toMapY(p.lat)
                        return `${idx === 0 ? 'M' : 'L'} ${x},${y}`
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />

                  {/* Waypoint Markers */}
                  {suspectTrail.map((p: any, idx: number) => {
                    const x = toMapX(p.lng)
                    const y = toMapY(p.lat)
                    return (
                      <g
                        key={`wp-${idx}`}
                        className="cursor-pointer"
                        onClick={() => setSelectedItem({ type: 'WAYPOINT', data: p })}
                      >
                        <circle cx={x} cy={y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        <text
                          x={x + 10}
                          y={y + 4}
                          fill="#fcd34d"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          T{idx + 1}: {p.locationName.split('-')[0]}
                        </text>
                      </g>
                    )
                  })}
                </g>
              )}

              {/* CCTV Camera Node Markers */}
              {showCameras &&
                cameras.map((cam) => {
                  const x = toMapX(cam.coordinates.lng)
                  const y = toMapY(cam.coordinates.lat)
                  const isAlert = cam.status === 'ALERT'
                  return (
                    <g
                      key={`cam-${cam._id}`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedItem({ type: 'CAMERA', data: cam })}
                    >
                      {/* FOV Cone */}
                      <path
                        d={`M ${x},${y} L ${x - 25},${y - 45} A 30 30 0 0 1 ${x + 25},${y - 45} Z`}
                        fill={isAlert ? 'rgba(244, 63, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)'}
                        stroke={isAlert ? 'rgba(244, 63, 94, 0.3)' : 'rgba(168, 85, 247, 0.3)'}
                        strokeWidth="1"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="7"
                        fill={isAlert ? '#f43f5e' : '#a855f7'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text x={x} y={y - 12} textAnchor="middle" fill="#d8b4fe" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        {cam.cameraId}
                      </text>
                    </g>
                  )
                })}

              {/* Active Patrol Units */}
              {showPatrols &&
                patrols.map((pat) => {
                  const x = toMapX(pat.coordinates.lng)
                  const y = toMapY(pat.coordinates.lat)
                  return (
                    <g
                      key={`pat-${pat._id}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedItem({ type: 'PATROL', data: pat })}
                    >
                      <circle cx={x} cy={y} r="14" fill="rgba(6, 182, 212, 0.2)" className="animate-ping" />
                      <circle cx={x} cy={y} r="8" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                      {/* Direction Arrow */}
                      <line
                        x1={x}
                        y1={y}
                        x2={x + Math.sin((pat.heading * Math.PI) / 180) * 16}
                        y2={y - Math.cos((pat.heading * Math.PI) / 180) * 16}
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />
                      <text x={x} y={y + 18} textAnchor="middle" fill="#67e8f9" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        {pat.callSign.split(' ')[0]}
                      </text>
                    </g>
                  )
                })}

              {/* Crime Incident Pins */}
              {showIncidents &&
                filteredIncidents.map((inc) => {
                  const x = toMapX(inc.coordinates.lng)
                  const y = toMapY(inc.coordinates.lat)
                  const isCritical = inc.severity === 'CRITICAL'
                  return (
                    <g
                      key={`inc-${inc._id}`}
                      className="cursor-pointer"
                      onClick={() => setSelectedItem({ type: 'INCIDENT', data: inc })}
                    >
                      {/* Pulsing ring for critical */}
                      {isCritical && (
                        <circle cx={x} cy={y} r="18" fill="none" stroke="#f43f5e" strokeWidth="1.5" className="animate-ping" />
                      )}

                      <circle
                        cx={x}
                        cy={y}
                        r="9"
                        fill={isCritical ? '#f43f5e' : inc.severity === 'HIGH' ? '#f97316' : '#eab308'}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                      <text x={x} y={y + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        !
                      </text>
                      <text x={x} y={y - 14} textAnchor="middle" fill="#fca5a5" fontSize="8" fontFamily="monospace" fontWeight="bold">
                        {inc.incidentId}
                      </text>
                    </g>
                  )
                })}
            </svg>
          </div>
        </div>

        {/* Right Inspector Drawer (1 column) */}
        <div className="space-y-4">
          {selectedItem ? (
            <div className="bg-slate-900/90 border border-cyber-600/30 rounded-2xl p-5 space-y-4 shadow-glass animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyber-500/20 text-cyber-300 border border-cyber-500/30">
                  {selectedItem.type} DOSSIER
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Item Details */}
              {selectedItem.type === 'INCIDENT' && (
                <div className="space-y-3">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedItem.data.severity === 'CRITICAL' ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/40' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {selectedItem.data.severity} SEVERITY
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{selectedItem.data.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedItem.data.description}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Crime Classification:</span>
                      <span className="text-white">{selectedItem.data.crimeType}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Address:</span>
                      <span className="text-slate-300 text-right">{selectedItem.data.address}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Threat Index:</span>
                      <span className="text-crimson-400 font-bold">{selectedItem.data.threatScore}/100</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => navigate('/dispatch')}
                      className="w-full py-2 px-3 rounded-xl bg-crimson-600/20 hover:bg-crimson-600/30 border border-crimson-500/40 text-crimson-300 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      Dispatch Sector SMS Alert
                    </button>
                    {selectedItem.data.caseId && (
                      <button
                        onClick={() => navigate(`/investigations/${selectedItem.data.caseId._id || selectedItem.data.caseId}`)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Investigation Dossier
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedItem.type === 'PATROL' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {selectedItem.data.status}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{selectedItem.data.callSign}</h3>
                    <p className="text-xs text-slate-400">Officer: {selectedItem.data.officerInCharge}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Vehicle Class:</span>
                      <span className="text-white">{selectedItem.data.vehicleType}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Current Speed:</span>
                      <span className="text-cyan-400">{selectedItem.data.speedKmH} km/h</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Radio Channel:</span>
                      <span className="text-emerald-400">{selectedItem.data.contactRadio}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Assigned Sector:</span>
                      <span className="text-slate-300">{selectedItem.data.sector}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/dispatch')}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Send Direct Patrol Unit SMS
                  </button>
                </div>
              )}

              {selectedItem.type === 'CAMERA' && (
                <div className="space-y-3">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      selectedItem.data.status === 'ALERT' ? 'bg-crimson-500/20 text-crimson-400 border border-crimson-500/40' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {selectedItem.data.status}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{selectedItem.data.name}</h3>
                    <p className="text-xs text-slate-400">{selectedItem.data.cameraId} • {selectedItem.data.sector}</p>
                  </div>

                  <button
                    onClick={() => navigate('/cctv')}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950"
                  >
                    <Video className="w-4 h-4" />
                    Open Live Video Stream & PTZ
                  </button>
                </div>
              )}

              {selectedItem.type === 'WAYPOINT' && (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      SUSPECT TRANSIT SIGHTING
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1.5">{selectedItem.data.locationName}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedItem.data.activity}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Confirmed By:</span>
                      <span className="text-emerald-400">{selectedItem.data.confirmedBy}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/dispatch')}
                    className="w-full py-2 px-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Broadcast Sighting APB
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                <Crosshair className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tactical Inspector</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Click any marker (Incident, Patrol car, CCTV camera, or Suspect waypoint) on the map to inspect its real-time dossier.
                </p>
              </div>
            </div>
          )}

          {/* Quick Stats Widget */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs font-mono">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sector Readiness</h4>
            <div className="flex justify-between text-slate-400">
              <span>Active Interceptors:</span>
              <span className="text-cyan-400 font-bold">{patrols.length} Units</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>CCTV Node Coverage:</span>
              <span className="text-purple-400 font-bold">98.4% Urban</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Containment Perimeter:</span>
              <span className="text-emerald-400 font-bold">SEC-04 SECURE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pin Sighting Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-cyber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Pin Sighting on Tactical Map
              </h3>
              <button onClick={() => setIsPinModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePin} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Unidentified Drone Sighting over Vault"
                  value={newPinTitle}
                  onChange={(e) => setNewPinTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Crime Type</label>
                  <select
                    value={newPinType}
                    onChange={(e) => setNewPinType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500"
                  >
                    <option value="SURVEILLANCE_FLAG">Surveillance Flag</option>
                    <option value="CYBER_HEIST">Cyber Heist</option>
                    <option value="FINANCIAL_FRAUD">Financial Fraud</option>
                    <option value="ARMED_ROBBERY">Armed Threat</option>
                    <option value="NARCOTICS">Narcotics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Severity</label>
                  <select
                    value={newPinSeverity}
                    onChange={(e) => setNewPinSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newPinCoords.lat}
                    onChange={(e) => setNewPinCoords({ ...newPinCoords, lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newPinCoords.lng}
                    onChange={(e) => setNewPinCoords({ ...newPinCoords, lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPinMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-cyber-600 hover:bg-cyber-500 text-white font-bold"
                >
                  {createPinMutation.isPending ? 'Pinning...' : 'Confirm Pin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
