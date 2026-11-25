import { useState } from 'react'
import { X, AlertOctagon, Radio, ShieldAlert, CheckCircle2, Siren, Volume2 } from 'lucide-react'
import { smsAPI } from '../api'
import toast from 'react-hot-toast'

interface SosBroadcastModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SosBroadcastModal({ isOpen, onClose }: SosBroadcastModalProps) {
  const [reason, setReason] = useState('Critical Suspect Containment / Hostile Threat')
  const [sector, setSector] = useState('Sector 4 - Central Transit & Financial Corridor')
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastDone, setBroadcastDone] = useState(false)

  if (!isOpen) return null

  const handleBroadcast = async () => {
    setIsBroadcasting(true)
    try {
      await smsAPI.triggerSos({
        reason,
        sector,
        coordinates: { lat: 28.6289, lng: 77.2065 },
      })
      setIsBroadcasting(false)
      setBroadcastDone(true)
      toast.success('🚨 CODE RED LOCKDOWN BROADCAST DELIVERED TO ALL 76 UNITS', {
        duration: 6000,
      })
    } catch (err: any) {
      toast.error('Emergency broadcast failure')
      setIsBroadcasting(false)
    }
  }

  const handleReset = () => {
    setBroadcastDone(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-crimson-500 rounded-2xl shadow-2xl shadow-crimson-900/60 overflow-hidden flex flex-col">
        {/* Siren Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-crimson-500 to-amber-500 animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-crimson-900/50 bg-crimson-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-crimson-600/30 border border-crimson-500 flex items-center justify-center text-crimson-400 animate-pulse">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
                Code Red Emergency SOS
                <span className="text-[10px] px-2 py-0.5 rounded bg-crimson-500 text-white font-mono font-bold">
                  PRIORITY 0
                </span>
              </h2>
              <p className="text-xs text-crimson-200">
                Direct tactical command override & multi-unit SMS broadcast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {broadcastDone ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Emergency Broadcast Dispatched</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Code Red signal successfully relayed to 76 active tactical interceptors, SWAT vans, and drone sentinels.
                </p>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 max-w-sm mx-auto text-xs font-mono text-emerald-300">
                TELEMETRY: GATEWAY ACK 100% • 65ms LATENCY
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close Emergency Console
              </button>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-crimson-950/30 border border-crimson-500/30 flex items-start gap-3">
                <AlertOctagon className="w-5 h-5 text-crimson-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-crimson-300">Warning: </strong>
                  Triggering Code Red will instantly dispatch priority push SMS messages to all on-duty officers, ring tactical base stations, and set all surveillance cameras in the selected sector to <span className="text-crimson-400 font-bold">ALERT MODE</span>.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                    Emergency Situation Directive
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-crimson-500"
                  >
                    <option value="Critical Suspect Containment / Hostile Threat">Critical Suspect Containment / Hostile Threat</option>
                    <option value="Officer in Distress / Immediate Backup Requested">Officer in Distress / Immediate Backup Requested</option>
                    <option value="Active Cyber Infrastructure Hijack / Wire Freeze">Active Cyber Infrastructure Hijack / Wire Freeze</option>
                    <option value="High-Risk Fugitive Armed Sighting (Viktor Lazarov)">High-Risk Fugitive Armed Sighting (Viktor Lazarov)</option>
                    <option value="Hostage / Biohazard Tactical Perimeter Lockdown">Hostage / Biohazard Tactical Perimeter Lockdown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider">
                    Target Containment Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-crimson-500"
                  >
                    <option value="ALL SECTORS (City-Wide Lockdown)">ALL SECTORS (City-Wide Lockdown)</option>
                    <option value="Sector 4 - Central Transit & Financial Corridor">Sector 4 - Central Transit & Financial Corridor</option>
                    <option value="Industrial Sector - Warehouse 14 Bypass">Industrial Sector - Warehouse 14 Bypass</option>
                    <option value="Airport International Terminal & VIP Perimeter">Airport International Terminal & VIP Perimeter</option>
                    <option value="Harbor Freight & Maritime Cargo Depot">Harbor Freight & Maritime Cargo Depot</option>
                  </select>
                </div>

                {/* Scope breakdown */}
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Targeted Units:</span>
                    <span className="text-white font-bold">16 SWAT • 48 Patrol • 12 Cyber Cell (76 Total)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Transmission Channel:</span>
                    <span className="text-crimson-400">GOV-PRIORITY-0 SMS & VHF RADIO BURST</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBroadcast}
                  disabled={isBroadcasting}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-600 via-crimson-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-900/50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Radio className={`w-4 h-4 ${isBroadcasting ? 'animate-spin' : 'animate-pulse'}`} />
                  {isBroadcasting ? 'TRANSMITTING CODE RED...' : 'CONFIRM CODE RED BROADCAST'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
