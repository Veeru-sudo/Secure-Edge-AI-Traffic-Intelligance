import React, { useState } from 'react';
import { db } from '../../services/db';
import { NormalUserEmergencyRequest } from '../../types';
import {
  Users,
  AlertTriangle,
  Siren,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Radio,
  MapPin,
  Car
} from 'lucide-react';

export const NormalUserPortal: React.FC = () => {
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyType, setEmergencyType] = useState<NormalUserEmergencyRequest['emergencyType']>('Medical');
  const [locationName, setLocationName] = useState('Ring Road Junction 2, Near Outer Flyover Pier 14');
  const [description, setDescription] = useState('Elderly relative experiencing severe chest tightness and shortness of breath; conscious but distress increasing.');
  const [contactPhone, setContactPhone] = useState('+91 98444 88990');
  const [isGenuineConfirmed, setIsGenuineConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTransfer = db.activeTransfer;
  const userRequests = db.emergencyRequests;

  const handleSubmitRequest = async () => {
    if (!isGenuineConfirmed || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await db.submitEmergencyRequest({
        userId: 'usr_citizen_01',
        userName: 'Vikram Malhotra',
        userPhone: contactPhone,
        locationName,
        lat: 28.6180,
        lng: 77.2100,
        emergencyType,
        description
      });
      setShowEmergencyModal(false);
      setDescription('');
      setIsGenuineConfirmed(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Citizen Driver &amp; Commuter Advisory Portal
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                PORTAL 4: PUBLIC TRAFFIC ADVISORY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Privacy-preserving real-time emergency corridor advisories and controlled citizen SOS workflow
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEmergencyModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-950/60 flex items-center gap-2 transition animate-pulse"
        >
          <Siren className="w-4 h-4 fill-white" />
          Request Emergency Assistance (SOS)
        </button>
      </div>

      {/* PRIVACY-PRESERVING CORRIDOR WARNING BANNER */}
      {activeTransfer && activeTransfer.status === 'route_active' ? (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-lg animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                LIVE TRAFFIC CLEARANCE ADVISORY
              </span>
              <h3 className="text-lg font-black text-white">
                Emergency Ambulance En Route — Yield Left &amp; Keep Lane Clear
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Active Corridor</span>
              <span className="text-white font-bold font-mono">
                {activeTransfer.isRerouted ? 'Ring Road Transit Arc (Bypass)' : 'Central Boulevard Arterial (J1 ➔ J4)'}
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Active Junction Clearance</span>
              <span className="text-amber-300 font-bold font-mono">
                Junction {activeTransfer.activeCheckpointIndex + 1} (LED Amber Strobe Armed)
              </span>
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Safe Driver Action</span>
              <span className="text-emerald-400 font-bold">
                Keep extreme right emergency lane open
              </span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Privacy Protection Enforced:</strong> Medical condition, patient identity, and raw GPS logs are confidential and restricted under least-privilege RBAC.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow text-xs flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2.5">
            <Car className="w-4 h-4 text-emerald-400" />
            <span>No active emergency vehicle corridors in your immediate 5km radius. Traffic flowing normally.</span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold">ALL CLEAR</span>
        </div>
      )}

      {/* Safety Safeguard Explanatory Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Critical Emergency Authorization &amp; Anti-Abuse Architecture
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          In compliance with smart city cyber-physical standards, <strong>citizens and private vehicles cannot directly trigger green traffic signals, strobe LEDs, or reroute other drivers</strong>. Any citizen emergency request enters an authorized 5-stage dispatch triage pipeline:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono pt-1">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Stage 1</span>
            <span className="font-bold text-cyan-300">Request Submitted</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Stage 2</span>
            <span className="font-bold text-amber-300">Dispatcher Review</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Stage 3</span>
            <span className="font-bold text-indigo-300">Triage &amp; Verify</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Stage 4</span>
            <span className="font-bold text-emerald-300">Fleet Dispatched</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
            <span className="text-slate-500 text-[10px] block">Stage 5</span>
            <span className="font-bold text-slate-400">Mission Finalized</span>
          </div>
        </div>
      </div>

      {/* Citizen's Active Emergency Requests Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            Your Submitted Emergency Requests ({userRequests.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Status Tracking</span>
        </div>

        <div className="space-y-3">
          {userRequests.map(req => (
            <div
              key={req.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-300">{req.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    {req.emergencyType}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                  req.status === 'VERIFIED_DISPATCHED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : req.status === 'REJECTED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                }`}>
                  {req.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{req.locationName}</span>
              </div>

              <p className="text-slate-400 text-[11px] bg-slate-900 p-2 rounded border border-slate-800/80">
                "{req.description}"
              </p>

              {req.verificationNotes && (
                <div className="text-[11px] text-cyan-400 font-mono">
                  Dispatch Note: {req.verificationNotes}
                </div>
              )}

              {req.assignedAmbulanceId && (
                <div className="text-[11px] text-emerald-400 font-mono font-semibold">
                  Ambulance Dispatched: {req.assignedAmbulanceId}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Request Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-400" />
                Submit Emergency Assistance Request (SOS)
              </h4>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Nature of Emergency
                </label>
                <select
                  value={emergencyType}
                  onChange={e => setEmergencyType(e.target.value as typeof emergencyType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 text-xs font-bold"
                >
                  <option value="Medical">Medical Emergency (Heart Attack, Stroke, Seizure)</option>
                  <option value="Vehicle Accident">Vehicle Roadside Accident</option>
                  <option value="Cardiac">Cardiac Event</option>
                  <option value="Severe Injury">Severe Trauma / Hemorrhage</option>
                  <option value="Other">Other Life-Threatening Situation</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Current Location / Landmark
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Description of Situation &amp; Casualties
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe patient status, injuries, or road blockage..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs font-mono"
                />
              </div>

              {/* Anti-Abuse Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/30 border border-red-900/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGenuineConfirmed}
                  onChange={e => setIsGenuineConfirmed(e.target.checked)}
                  className="mt-0.5 accent-red-500 rounded"
                />
                <span className="text-[11px] text-slate-300 leading-tight">
                  I confirm that this is a genuine medical emergency. Misuse of the emergency clearance network is subject to penalties under Section 194E of the Motor Vehicles Act.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!isGenuineConfirmed || isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <Siren className="w-4 h-4 fill-white" />
                {isSubmitting ? 'Submitting to Dispatch...' : 'Submit Emergency Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
