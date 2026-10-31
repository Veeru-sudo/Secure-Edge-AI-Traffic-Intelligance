import React from 'react';
import { db } from '../../services/db';
import { RouteMap } from '../map/RouteMap';
import {
  Ambulance,
  Gauge,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCw,
  Compass,
  Radio,
  Zap,
  Building2,
  TrendingDown
} from 'lucide-react';

export const AmbulancePortal: React.FC = () => {
  const activeTransfer = db.activeTransfer;
  const ambulance = db.ambulances.find(a => a.id === activeTransfer?.assignedAmbulanceId) || db.ambulances[0];
  const currentCheckpoint = db.checkpoints[activeTransfer?.activeCheckpointIndex || 0];

  const handleNextCheckpoint = () => {
    if (!activeTransfer) return;
    db.advanceCheckpoint(activeTransfer.activeCheckpointIndex);
  };

  const handleTriggerCongestion = () => {
    db.triggerCongestionAndReroute();
  };

  return (
    <div className="space-y-6">
      {/* Driver HUD Top Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950 text-red-400 border border-red-800/60">
            <Ambulance className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Ambulance Driver &amp; Paramedic HUD
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
                PORTAL 3: FLEET NAVIGATION
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Low-distraction tactical view with dynamic routing and camera checkpoint clearance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-950 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800">
            Unit: <strong className="text-white">{ambulance.id}</strong> ({ambulance.vehicleNumber.split(' ')[0]})
          </span>
          <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GPS LOCKED (±2.1m)
          </span>
        </div>
      </div>

      {/* Main HUD Gauge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Speedometer */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>Speed</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-black font-mono text-white tracking-tight">
              {ambulance.speedKmH}
            </span>
            <span className="text-xs font-mono text-slate-400 ml-1.5">KM/H</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            Corridor Speed Limit: 60 km/h
          </div>
        </div>

        {/* ETA Countdown */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>Estimated Time to Hospital B</span>
            <Navigation className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-black font-mono text-cyan-300 tracking-tight">
              {activeTransfer ? activeTransfer.currentEtaMinutes : '—'}
            </span>
            <span className="text-xs font-mono text-slate-400 ml-1.5">MINS</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Destination: Apex Trauma Institute
          </div>
        </div>

        {/* Next Checkpoint Distance */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>Next Checkpoint</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-xl font-bold font-mono text-amber-300">
              {currentCheckpoint ? `J${currentCheckpoint.junctionNumber} (${currentCheckpoint.roadSegment.split(' ')[0]})` : 'Complete'}
            </div>
            <div className="text-xs font-mono text-slate-300 mt-1">
              {currentCheckpoint?.ledState === 'CHECKPOINT_ACTIVE' ? 'LED STROBE ARMED' : 'STANDBY'}
            </div>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">
            GPIO {currentCheckpoint?.ledPin} Active
          </div>
        </div>

        {/* Hospital B Readiness */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xl flex flex-col justify-between">
          <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
            <span>Hospital Readiness</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-base font-bold text-emerald-300 uppercase block font-mono">
              {activeTransfer?.receivingHospitalStatus.replace(/_/g, ' ') || 'STANDBY'}
            </span>
            <span className="text-[11px] text-slate-400 block mt-1 truncate">
              {activeTransfer?.receivingNotes || 'OT 1 Scrubbed In'}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            Receiving Team Alerted
          </div>
        </div>
      </div>

      {/* DYNAMIC CONGESTION & REROUTE ALERT BANNER */}
      {activeTransfer?.isRerouted && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500 rounded-xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500 text-slate-950">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase font-mono px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                  DYNAMIC REROUTE RECOMMENDED &amp; ENGAGED
                </span>
                <span className="text-xs text-amber-300 font-mono">Time Saved: +4.2 mins</span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                {activeTransfer.rerouteReason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1 shadow">
              <CheckCircle className="w-4 h-4" />
              Bypass Route Accepted
            </span>
          </div>
        </div>
      )}

      {/* Route Map & Tactical Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Map */}
        <div className="lg:col-span-8 space-y-3">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Live Navigational Telemetry &amp; Route Corridor</span>
            <span className="text-[11px] font-mono text-cyan-400">
              {activeTransfer ? `Transfer Reference: ${activeTransfer.id}` : 'No Active Mission'}
            </span>
          </div>
          <RouteMap className="h-[440px]" />
        </div>

        {/* Academic Simulation & Stepping Controls */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              Mission Simulation Controls
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Viva Demonstration</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Use these controls to advance the emergency transport through the 4 camera checkpoints, simulate sudden congestion at Camera 2, or trigger route recalculation.
          </p>

          <div className="space-y-2.5">
            {activeTransfer ? (
              <>
                <button
                  onClick={handleNextCheckpoint}
                  disabled={activeTransfer.status === 'completed' || activeTransfer.status === 'arrived'}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {activeTransfer.activeCheckpointIndex >= 3
                    ? 'Arrive at Hospital B'
                    : `Pass Checkpoint ${activeTransfer.activeCheckpointIndex + 1} (Junction ${activeTransfer.activeCheckpointIndex + 1})`}
                </button>

                {!activeTransfer.isRerouted && (
                  <button
                    onClick={handleTriggerCongestion}
                    className="w-full py-2.5 px-3 bg-amber-950/80 hover:bg-amber-900 border border-amber-600 text-amber-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Simulate Bottleneck at Camera 2 &amp; Reroute
                  </button>
                )}
              </>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                To start the route simulation, visit the Hospital Portal (Hospital A) and click "Confirm Transfer &amp; Start Emergency Route".
              </div>
            )}
          </div>

          {/* Checkpoint Sequence Inspection */}
          <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-bold text-slate-300">
              Checkpoint Status Table
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              {db.checkpoints.map(cp => (
                <div
                  key={cp.id}
                  className={`p-2 rounded flex items-center justify-between border ${
                    cp.ledState === 'CHECKPOINT_ACTIVE'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                      : cp.isPassed
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : cp.ledState === 'ROUTE_CANCELLED'
                      ? 'bg-slate-950 border-slate-800 text-slate-600 line-through'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span>J{cp.junctionNumber}: {cp.name.split('/')[1] || cp.name}</span>
                  <span className="font-bold">
                    {cp.ledState === 'CHECKPOINT_ACTIVE' ? 'LED STROBE' : cp.isPassed ? 'PASSED ✓' : 'IDLE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
