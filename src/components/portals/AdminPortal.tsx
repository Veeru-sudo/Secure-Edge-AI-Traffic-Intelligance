import React, { useState } from 'react';
import { db } from '../../services/db';
import {
  Building2,
  Ambulance as AmbulanceIcon,
  Users,
  Radio,
  Cpu,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import { RouteMap } from '../map/RouteMap';
import { LEDControllerPanel } from '../iot/LEDControllerPanel';
import { CameraSimulator } from '../edge/CameraSimulator';

export const AdminPortal: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'hospitals' | 'ambulances' | 'requests' | 'iot'>('overview');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const hospitals = db.hospitals;
  const ambulances = db.ambulances;
  const requests = db.emergencyRequests;
  const activeTransfer = db.activeTransfer;

  const handleApprove = (reqId: string) => {
    db.reviewEmergencyRequest(
      reqId,
      'VERIFY_DISPATCH',
      approvalNotes || 'Verified genuine by 24/7 central dispatch. Ambulance unit assigned.',
      'AMB-102'
    );
    setSelectedReqId(null);
    setApprovalNotes('');
  };

  const handleReject = (reqId: string) => {
    db.reviewEmergencyRequest(
      reqId,
      'REJECT',
      approvalNotes || 'Verification failed: non-critical or unreachable location.'
    );
    setSelectedReqId(null);
    setApprovalNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Hospitals</span>
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{hospitals.length}</div>
          <div className="text-[10px] text-emerald-400 font-medium">All Approved</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Ambulance Fleet</span>
            <AmbulanceIcon className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{ambulances.length}</div>
          <div className="text-[10px] text-slate-400">
            {ambulances.filter(a => a.status === 'on_route').length} on route
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Active Transfers</span>
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {activeTransfer && activeTransfer.status !== 'completed' ? 1 : 0}
          </div>
          <div className="text-[10px] text-cyan-400 truncate">
            {activeTransfer ? activeTransfer.priority.split('_')[0] : 'Standby'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Citizen Requests</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">{requests.length}</div>
          <div className="text-[10px] text-amber-400">
            {requests.filter(r => r.status === 'AWAITING_VERIFICATION').length} awaiting review
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Checkpoints / IoT</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">4 / 4</div>
          <div className="text-[10px] text-emerald-400">ESP32 Online (Ping 12ms)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow space-y-1">
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Security Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">0 Active</div>
          <div className="text-[10px] text-slate-400">Firewall & HMAC OK</div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'overview', label: 'Central Corridor GIS' },
            { id: 'hospitals', label: 'Hospital Network' },
            { id: 'ambulances', label: 'Ambulance Fleet' },
            { id: 'requests', label: 'Emergency Requests Queue' },
            { id: 'iot', label: 'IoT & Camera Nodes' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => db.resetDemo()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo State
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Real-Time Map */}
            <div className="lg:col-span-8">
              <RouteMap className="h-[460px]" />
            </div>

            {/* Live Operational Status & Active Corridor Feed */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Live Corridor Dispatch Feed
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono">LIVE EVENT BUS</span>
              </div>

              {activeTransfer ? (
                <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-800/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{activeTransfer.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {activeTransfer.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Priority: <span className="text-amber-400 font-bold">{activeTransfer.priority}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Transferring: <span className="text-slate-200">Hospital A ➔ Hospital B</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex justify-between pt-1 border-t border-slate-800">
                    <span>ETA Remaining:</span>
                    <span className="text-cyan-300 font-mono font-bold">{activeTransfer.currentEtaMinutes} mins</span>
                  </div>
                  {activeTransfer.isRerouted && (
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-800 text-[11px] text-amber-200">
                      ⚠ {activeTransfer.rerouteReason}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
                  No active emergency transfer right now.
                  <div className="text-slate-400 mt-1">
                    Switch to Hospital Portal to initiate Hospital A ➔ Hospital B patient transfer.
                  </div>
                </div>
              )}

              {/* Checkpoint Sequence Progress */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Checkpoint Clearance Sequence</div>
                <div className="space-y-1.5">
                  {db.checkpoints.map(cp => (
                    <div
                      key={cp.id}
                      className={`p-2 rounded text-xs flex items-center justify-between border ${
                        cp.ledState === 'CHECKPOINT_ACTIVE'
                          ? 'bg-amber-950/40 border-amber-500 text-amber-200'
                          : cp.isPassed
                          ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                          : cp.ledState === 'ROUTE_CANCELLED'
                          ? 'bg-rose-950/20 border-rose-900 text-slate-500 line-through'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[11px]">J{cp.junctionNumber}</span>
                        <span className="truncate max-w-[140px]">{cp.name.split('/')[1] || cp.name}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase font-semibold">
                        {cp.ledState === 'CHECKPOINT_ACTIVE' ? 'LED ACTIVE' : cp.isPassed ? 'PASSED ✓' : 'IDLE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* IoT Controller & Camera Panels */}
          <LEDControllerPanel />
          <CameraSimulator />
        </div>
      )}

      {/* Hospital Management Tab */}
      {selectedTab === 'hospitals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Registered Hospital Network & Resource Capacity
            </h3>
            <span className="text-xs text-slate-400 font-mono">3 Hospitals Online</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hospitals.map(h => (
              <div key={h.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {h.code}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Trauma Level {h.capabilities.traumaLevel}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{h.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{h.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Available ICU Beds</span>
                    <span className="font-bold font-mono text-cyan-300 text-sm">
                      {h.capabilities.icuBedsAvailable} / {h.capabilities.icuBedsTotal}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Neurosurgery 24/7</span>
                    <span className={`font-bold font-mono text-xs ${h.capabilities.neuroSurgery ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {h.capabilities.neuroSurgery ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Helpline:</span>
                  <span className="font-mono text-slate-300">{h.contactPhone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ambulance Fleet Tab */}
      {selectedTab === 'ambulances' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AmbulanceIcon className="w-5 h-5 text-red-400" />
              Connected Ambulance Fleet & IoT Telemetry
            </h3>
            <span className="text-xs text-slate-400 font-mono">GPS Precision &lt; 3m</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ambulances.map(a => (
              <div key={a.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-sm">{a.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    a.status === 'on_route'
                      ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {a.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-200">{a.vehicleNumber}</div>
                  <div className="text-xs text-slate-400">Driver / Paramedic: {a.driverName}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800">
                  <div className="bg-slate-900 p-2 rounded text-center">
                    <span className="text-[10px] text-slate-400 block">Speed</span>
                    <span className="font-bold font-mono text-cyan-300">{a.speedKmH} km/h</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded text-center">
                    <span className="text-[10px] text-slate-400 block">Battery</span>
                    <span className="font-bold font-mono text-emerald-400">{a.batteryLevel}%</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded text-center">
                    <span className="text-[10px] text-slate-400 block">GPS Error</span>
                    <span className="font-bold font-mono text-slate-300">{a.gpsAccuracyMeters}m</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono flex justify-between">
                  <span>Last Heartbeat:</span>
                  <span>{a.lastHeartbeat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Requests Dispatcher Approval Queue */}
      {selectedTab === 'requests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Citizen Emergency Requests — Triage & Dispatcher Verification
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Critical Safety Safeguard: Normal users cannot directly clear traffic or trigger LEDs. All citizen requests require dispatcher authorization.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
              DISPATCH WORKFLOW
            </span>
          </div>

          <div className="space-y-3">
            {requests.map(req => (
              <div
                key={req.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300 text-sm">{req.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {req.emergencyType}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    req.status === 'VERIFIED_DISPATCHED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : req.status === 'REJECTED'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                  }`}>
                    {req.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Citizen:</span>
                    <span className="font-semibold text-white">{req.userName} ({req.userPhone})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Location Reported:</span>
                    <span className="text-slate-200">{req.locationName}</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded border border-slate-800/80 text-slate-300 text-[11px]">
                  <span className="text-slate-400 font-medium">Description: </span>
                  {req.description}
                </div>

                {req.verificationNotes && (
                  <div className="text-[11px] text-cyan-400">
                    <span className="text-slate-500">Dispatcher Log: </span>
                    {req.verificationNotes}
                  </div>
                )}

                {/* Dispatcher Actions */}
                {req.status === 'AWAITING_VERIFICATION' && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Add dispatcher verification notes..."
                      value={selectedReqId === req.id ? approvalNotes : ''}
                      onChange={e => {
                        setSelectedReqId(req.id);
                        setApprovalNotes(e.target.value);
                      }}
                      className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-white placeholder-slate-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verify & Dispatch Route
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded text-xs transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IoT & Checkpoints Tab */}
      {selectedTab === 'iot' && (
        <div className="space-y-6">
          <LEDControllerPanel />
          <CameraSimulator />
        </div>
      )}
    </div>
  );
};
