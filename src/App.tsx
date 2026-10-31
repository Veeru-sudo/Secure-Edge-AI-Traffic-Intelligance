import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Navbar } from './components/common/Navbar';
import { AdminPortal } from './components/portals/AdminPortal';
import { HospitalPortal } from './components/portals/HospitalPortal';
import { AmbulancePortal } from './components/portals/AmbulancePortal';
import { NormalUserPortal } from './components/portals/NormalUserPortal';
import { SecurityDashboard } from './components/security/SecurityDashboard';
import { MLBenchmarkView } from './components/ml/MLBenchmarkView';
import { AcademicDocsModal } from './components/academic/AcademicDocsModal';
import {
  Play,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';

export function App() {
  const [currentPortal, setCurrentPortal] = useState<'admin' | 'hospital' | 'ambulance' | 'user' | 'security' | 'ml'>('admin');
  const [isAcademicDocsOpen, setIsAcademicDocsOpen] = useState(false);
  const [demoAutoStep, setDemoAutoStep] = useState<number>(0);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);

  // Subscribe to database updates to trigger re-renders
  const [, setDbVersion] = useState(0);
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setDbVersion(v => v + 1);
    });
    return unsub;
  }, []);

  // One-Click Guided Academic Demo Walkthrough
  const runAutoSimulation = async () => {
    setIsAutoSimulating(true);
    setDemoAutoStep(1);

    // Step 1: Switch to Hospital Portal and Initiate Transfer
    setCurrentPortal('hospital');
    await new Promise(r => setTimeout(r, 1200));

    // Initiate Transfer
    await db.initiatePatientTransfer({
      syntheticName: 'Anil Verma',
      age: 47,
      gender: 'M',
      conditionSummary: 'Acute Traumatic Brain Injury with Subdural Hematoma; GCS 7/15; urgent craniotomy required.',
      priority: 'CRITICAL_TRAUMA',
      assignedAmbulanceId: 'AMB-101',
      receivingHospitalId: 'hosp_b',
      vitals: {
        bloodPressure: '142/90 mmHg',
        heartRate: 114,
        spO2: 96,
        respiratoryRate: 18
      },
      notes: 'Mechanical ventilation active. Mannitol 100ml infused.'
    });
    setDemoAutoStep(2);
    await new Promise(r => setTimeout(r, 2200));

    // Step 2: Switch to Ambulance Portal and pass Checkpoint 1
    setCurrentPortal('ambulance');
    setDemoAutoStep(3);
    await new Promise(r => setTimeout(r, 2000));
    await db.advanceCheckpoint(0); // Pass J1

    // Step 3: Trigger Congestion at Junction 2 & Reroute
    setDemoAutoStep(4);
    await new Promise(r => setTimeout(r, 2200));
    await db.triggerCongestionAndReroute();

    // Step 4: Advance past bypass to J3
    setDemoAutoStep(5);
    await new Promise(r => setTimeout(r, 2400));
    await db.advanceCheckpoint(2); // Pass J3

    // Step 5: Advance past J4 and arrive at Hospital B
    setDemoAutoStep(6);
    await new Promise(r => setTimeout(r, 2400));
    await db.advanceCheckpoint(3); // Pass J4 -> Arrive

    // Step 6: Switch to Hospital B to complete handover
    setCurrentPortal('hospital');
    setDemoAutoStep(7);
    await new Promise(r => setTimeout(r, 2000));
    await db.completeTransfer();

    setIsAutoSimulating(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Main Navbar */}
      <Navbar
        currentPortal={currentPortal}
        onSelectPortal={setCurrentPortal}
        onOpenAcademicDocs={() => setIsAcademicDocsOpen(true)}
      />

      {/* Guided Demonstration Quick-Action Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-slate-300 font-medium">
              Academic Examiner Mode:
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Demonstrate the synchronized 4-portal workflow, edge camera detection, LED clearance, and dynamic Dijkstra rerouting.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAutoSimulation}
              disabled={isAutoSimulating}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isAutoSimulating ? `Running Auto-Demo (Step ${demoAutoStep}/7)...` : 'Run Guided End-to-End Simulation'}
            </button>

            <button
              onClick={() => db.resetDemo()}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-700 flex items-center gap-1 transition"
              title="Reset demonstration state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPortal === 'admin' && <AdminPortal />}
        {currentPortal === 'hospital' && <HospitalPortal />}
        {currentPortal === 'ambulance' && <AmbulancePortal />}
        {currentPortal === 'user' && <NormalUserPortal />}
        {currentPortal === 'ml' && <MLBenchmarkView />}
        {currentPortal === 'security' && <SecurityDashboard />}
      </main>

      {/* Academic Minor Project Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-semibold text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Secure Edge-AI Traffic Intelligence &amp; Emergency Route Coordination Platform
            </div>
            <p className="text-[11px] text-slate-500 max-w-xl">
              Academic Minor Project Reference Model. Four Integrated Portals with Camera-Triggered LED Lane Clearance (ESP32 DevKit v1), Dynamic Dijkstra Rerouting, Scikit-Learn CART ML Evaluation, and Zero-Trust Cybersecurity.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <button
              onClick={() => setIsAcademicDocsOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Viva Voce Defense Package
            </button>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">Semester 7 Minor Project</span>
          </div>
        </div>
      </footer>

      {/* Academic Docs & Viva Modal */}
      <AcademicDocsModal
        isOpen={isAcademicDocsOpen}
        onClose={() => setIsAcademicDocsOpen(false)}
      />
    </div>
  );
}

export default App;
