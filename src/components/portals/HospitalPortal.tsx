import React, { useState } from 'react';
import { db } from '../../services/db';
import { PatientTransfer, TransferPriority } from '../../types';
import { RouteMap } from '../map/RouteMap';
import {
  Building2,
  Ambulance,
  HeartPulse,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  FileText,
  Shield,
  Activity,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const HospitalPortal: React.FC = () => {
  // Hospital View Toggle: Hospital A (Sending) vs Hospital B (Receiving)
  const [activeHospitalId, setActiveHospitalId] = useState<'hosp_a' | 'hosp_b'>('hosp_a');

  // Form State for Hospital A
  const [patientName, setPatientName] = useState('Anil Verma');
  const [age, setAge] = useState<number>(47);
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [conditionSummary, setConditionSummary] = useState('Acute Traumatic Brain Injury with Subdural Hematoma following RTA; Glasgow Coma Scale 7/15; requires immediate neurosurgical craniotomy unavailable at Hospital A.');
  const [priority, setPriority] = useState<TransferPriority>('CRITICAL_TRAUMA');
  const [receivingHospitalId, setReceivingHospitalId] = useState('hosp_b');
  const [assignedAmbulanceId, setAssignedAmbulanceId] = useState('AMB-101');
  const [handoverNotes, setHandoverNotes] = useState('Intubated on mechanical ventilator (FiO2 60%, PEEP 5). IV Mannitol 100ml infused. Continuous arterial line monitoring active.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const activeTransfer = db.activeTransfer;
  const isHospitalB = activeHospitalId === 'hosp_b';
  const receivingHospital = db.hospitals.find(h => h.id === 'hosp_b');

  const handleConfirmTransfer = async () => {
    if (isSubmitting) return; // Prevent duplicate clicks
    setIsSubmitting(true);

    try {
      await db.initiatePatientTransfer({
        syntheticName: patientName,
        age,
        gender,
        conditionSummary,
        priority,
        assignedAmbulanceId,
        receivingHospitalId,
        vitals: {
          bloodPressure: '142/90 mmHg',
          heartRate: 114,
          spO2: 96,
          respiratoryRate: 18
        },
        notes: handoverNotes
      });
      setShowReviewModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hospital Role Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Hospital Emergency Transfer Coordination
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                PORTAL 2: HOSPITAL NETWORK
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Inter-facility acute care transfer orchestration with end-to-end corridor priority
            </p>
          </div>
        </div>

        {/* Hospital View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveHospitalId('hosp_a')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeHospitalId === 'hosp_a'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Hospital A (Sending Hub)</span>
            <span className="w-2 h-2 rounded-full bg-blue-300"></span>
          </button>
          <button
            onClick={() => setActiveHospitalId('hosp_b')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              activeHospitalId === 'hosp_b'
                ? 'bg-rose-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Hospital B (Receiving Trauma Hub)</span>
            {activeTransfer && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* HOSPITAL A WORKFLOW: SENDING HOSPITAL */}
      {!isHospitalB && (
        <div className="space-y-6">
          {activeTransfer && activeTransfer.status !== 'completed' ? (
            /* Active Transfer in Progress Banner */
            <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-800/80 rounded-xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500 text-slate-950">
                    TRANSFER IN PROGRESS
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">{activeTransfer.id}</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Patient: {activeTransfer.syntheticName} ({activeTransfer.priority.replace(/_/g, ' ')})
                </h3>
                <p className="text-xs text-slate-300">
                  En route to Apex Trauma Center via {activeTransfer.assignedAmbulanceId}. Current ETA: <span className="font-mono text-cyan-300 font-bold">{activeTransfer.currentEtaMinutes} mins</span>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveHospitalId('hosp_b')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                >
                  <span>Switch to Hospital B Intake View</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Transfer Initiation Form */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-rose-400" />
                    Initiate Critical Emergency Transfer (Hospital A ➔ Hospital B)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Prepare structured clinical handover notes, assign ACLS fleet, and lock cryptographic corridor
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
                  METRO GENERAL OT-2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Patient Synthetic Name */}
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Synthetic Patient Name (Academic Demo)
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs font-medium"
                  />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as typeof gender)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs font-medium"
                    >
                      <option value="M">Male (M)</option>
                      <option value="F">Female (F)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Emergency Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as TransferPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 text-xs font-bold"
                  >
                    <option value="CRITICAL_TRAUMA">CRITICAL TRAUMA (Immediate Surgery)</option>
                    <option value="CARDIAC_ARREST">CARDIAC ARREST (Cath Lab Prep)</option>
                    <option value="STROKE_CODE_FAST">STROKE CODE FAST (Thrombolysis)</option>
                    <option value="URGENT_TRANSFER">URGENT TRANSFER (Monitored)</option>
                  </select>
                </div>
              </div>

              {/* Clinical Condition Summary */}
              <div className="text-xs">
                <label className="text-slate-400 font-semibold block mb-1">
                  Medical Condition Summary & Justification for Transfer
                </label>
                <textarea
                  rows={3}
                  value={conditionSummary}
                  onChange={e => setConditionSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs leading-relaxed"
                />
              </div>

              {/* Fleet & Receiving Hospital Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Select Receiving Hospital (Capability Checked)
                  </label>
                  <select
                    value={receivingHospitalId}
                    onChange={e => setReceivingHospitalId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-cyan-300 text-xs font-semibold"
                  >
                    <option value="hosp_b">
                      Hospital B: Apex Trauma & Research (Level 1 Trauma, 24/7 Neuro ICU, 14 Beds Available)
                    </option>
                    <option value="hosp_c">
                      Hospital C: St. Jude Community Health (Level 3 Trauma, 2 Beds Available)
                    </option>
                  </select>
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    ✓ Matched capability: Neurosurgical Craniotomy &amp; Trauma ICU confirmed online.
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Assign Emergency Ambulance Unit
                  </label>
                  <select
                    value={assignedAmbulanceId}
                    onChange={e => setAssignedAmbulanceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 text-xs font-semibold"
                  >
                    <option value="AMB-101">AMB-101 (ACLS Mobile ICU - Driver: Rajesh Kumar)</option>
                    <option value="AMB-103">AMB-103 (Cardiac Support Unit - Driver: Amit Verma)</option>
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Telemetry: 98% battery, GPS precision 2.1m, ventilator onboard.
                  </span>
                </div>
              </div>

              {/* Handover Observations */}
              <div className="text-xs">
                <label className="text-slate-400 font-semibold block mb-1">
                  En-Route Clinical Observations & Handover Notes
                </label>
                <textarea
                  rows={2}
                  value={handoverNotes}
                  onChange={e => setHandoverNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs leading-relaxed"
                />
              </div>

              {/* Review & Launch Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>HMAC-SHA256 signature will be minted upon confirmation.</span>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-xl shadow-cyan-950/50 flex items-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  Review &amp; Confirm Emergency Route
                </button>
              </div>
            </div>
          )}

          {/* Corridor GIS Preview */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300">Corridor Route & Checkpoint Map</div>
            <RouteMap className="h-[400px]" />
          </div>
        </div>
      )}

      {/* HOSPITAL B WORKFLOW: RECEIVING HOSPITAL */}
      {isHospitalB && (
        <div className="space-y-6">
          {activeTransfer ? (
            /* Prominent Incoming Transfer Card */
            <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-2 border-rose-600 rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-900/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-rose-600 text-white rounded-xl shadow-lg animate-pulse">
                    <Ambulance className="w-6 h-6" />
                  </span>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-rose-400 tracking-wider">
                      INCOMING EMERGENCY TRAUMA TRANSFER
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {activeTransfer.id} — {activeTransfer.syntheticName} (Age: {activeTransfer.age}, {activeTransfer.gender})
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-rose-800 text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">ESTIMATED ARRIVAL</span>
                  <span className="text-2xl font-black font-mono text-cyan-300">
                    {activeTransfer.currentEtaMinutes} MINS
                  </span>
                </div>
              </div>

              {/* Status & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Transfer Priority</span>
                  <span className="text-rose-400 font-bold font-mono text-sm">
                    {activeTransfer.priority.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Assigned Fleet</span>
                  <span className="text-amber-300 font-bold font-mono text-sm">
                    {activeTransfer.assignedAmbulanceId} (ACLS)
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Sending Facility</span>
                  <span className="text-slate-200 font-bold text-sm">
                    Metro General (Hosp A)
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Receiving Status</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm capitalize">
                    {activeTransfer.receivingHospitalStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Vitals & Clinical Handover */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>En-Route Clinical Observations & Vitals</span>
                  <span className="text-cyan-400 font-mono">Continuous Telemetry</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">BP</span>
                    <span className="text-white font-bold">{activeTransfer.vitalSigns.bloodPressure}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Pulse</span>
                    <span className="text-rose-400 font-bold">{activeTransfer.vitalSigns.heartRate} bpm</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">SpO2</span>
                    <span className="text-cyan-400 font-bold">{activeTransfer.vitalSigns.spO2}%</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Resp Rate</span>
                    <span className="text-emerald-400 font-bold">{activeTransfer.vitalSigns.respiratoryRate}/min</span>
                  </div>
                </div>
                <p className="text-slate-300 text-xs mt-2 italic leading-relaxed">
                  "{activeTransfer.conditionSummary}"
                </p>
                {activeTransfer.receivingNotes && (
                  <p className="text-cyan-300 text-[11px] font-mono">
                    Handover: {activeTransfer.receivingNotes}
                  </p>
                )}
              </div>

              {/* Live Checkpoint Progress Tracker */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Live Corridor Progress: 4 Monitored Junctions</span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Active Junction: J{activeTransfer.activeCheckpointIndex + 1}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs">
                  {db.checkpoints.map((cp, idx) => {
                    const isCurrent = cp.ledState === 'CHECKPOINT_ACTIVE';
                    const isPassed = cp.isPassed;
                    return (
                      <div
                        key={cp.id}
                        className={`p-2.5 rounded-lg border text-center transition ${
                          isCurrent
                            ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-lg animate-pulse'
                            : isPassed
                            ? 'bg-emerald-950/50 border-emerald-700 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="font-mono font-bold text-xs">Junction {cp.junctionNumber}</div>
                        <div className="text-[10px] uppercase mt-0.5 font-semibold">
                          {isCurrent ? 'Approaching' : isPassed ? 'Passed ✓' : 'Pending'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Response Actions Buttons for Hospital B */}
              <div className="pt-3 border-t border-rose-900/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => db.updateReceivingReadiness('acknowledged', 'Transfer intake acknowledged by Charge Nurse.')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                  >
                    Acknowledge Notification
                  </button>
                  <button
                    onClick={() => db.updateReceivingReadiness('team_preparing', 'Trauma Resuscitation Team & Neuro-Surgical OT 1 Prepared.')}
                    className="px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Prepare Receiving Team
                  </button>
                  <button
                    onClick={() => db.updateReceivingReadiness('ready_to_receive', 'Trauma Bay 1 Ready. Craniotomy team scrubbed in.')}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready to Receive
                  </button>
                </div>

                {activeTransfer.status === 'arrived' && (
                  <button
                    onClick={() => db.completeTransfer()}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Finalize Patient Handover &amp; Complete Transfer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">Hospital B Receiving Desk Standby</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active incoming ambulance transfer right now. Switch to Hospital A tab to dispatch a patient transfer, and Hospital B will receive immediate real-time incoming alerts.
              </p>
              <button
                onClick={() => setActiveHospitalId('hosp_a')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition"
              >
                Go to Hospital A Dispatch Form
              </button>
            </div>
          )}

          {/* Interactive Route Map */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-300">Live Hospital B Intake Map</div>
            <RouteMap className="h-[420px]" />
          </div>
        </div>
      )}

      {/* Review Modal before submission */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Review &amp; Authorize Emergency Route Priority
              </h4>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-white">Patient: {patientName} (Age: {age}, {gender})</div>
                <div className="text-amber-400 font-mono font-semibold">Priority: {priority}</div>
                <div className="text-slate-400 leading-relaxed">{conditionSummary}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 block">Destination:</span>
                  <span className="font-semibold text-white">Hospital B (Apex Trauma)</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-500 block">Ambulance Fleet:</span>
                  <span className="font-semibold text-amber-300">{assignedAmbulanceId} (ACLS)</span>
                </div>
              </div>

              <p className="text-[11px] text-cyan-300 bg-cyan-950/40 p-2.5 rounded border border-cyan-900 leading-relaxed">
                Notice: Confirming will generate a cryptographic nonce, lock the 4-checkpoint clearance corridor, and illuminate LED 1 (GPIO 18) for upcoming emergency approach.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting ? 'Authorizing Route...' : 'Confirm Transfer & Start Emergency Route'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
