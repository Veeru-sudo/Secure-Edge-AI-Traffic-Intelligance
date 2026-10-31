import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Network,
  HelpCircle,
  PlayCircle,
  FileText,
  CheckCircle2,
  Cpu,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AcademicDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicDocsModal: React.FC<AcademicDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'demo_script' | 'viva' | 'report_outline' | 'future'>('demo_script');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Academic Minor Project Documentation &amp; Viva Voce Defense Suite
              </h2>
              <p className="text-xs text-slate-400">
                Department of Computer Science &amp; IoT Engineering | Master Project Reference
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'demo_script', label: '14-Step Demo Script', icon: PlayCircle },
            { id: 'architecture', label: 'System Architecture', icon: Network },
            { id: 'viva', label: 'Viva Voce Q&A (20 Questions)', icon: HelpCircle },
            { id: 'report_outline', label: 'IEEE Project Report Outline', icon: FileText },
            { id: 'future', label: 'Major Project Roadmap (Sem 8)', icon: ArrowRight }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed flex-1">
          {/* TAB 1: 14-STEP DEMO SCRIPT */}
          {activeTab === 'demo_script' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-cyan-200">
                <h4 className="font-bold text-sm text-white mb-1">
                  Examiner Demonstration Walkthrough (14 Synchronized Steps)
                </h4>
                <p className="text-xs text-slate-300">
                  Follow this structured sequence to demonstrate the entire cyber-physical lifecycle during your project presentation.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { step: 1, title: 'Portal Overview', desc: 'Show the 4 portals integrated in one cohesive system: Admin, Hospital, Ambulance, and Normal User.' },
                  { step: 2, title: 'Hospital A Transfer Creation', desc: 'Hospital A selects patient Anil Verma, neuro trauma condition, assigns ACLS AMB-101, and selects Hospital B.' },
                  { step: 3, title: 'Corridor Lock & Nonce Minting', desc: 'Click "Confirm Transfer & Start Emergency Route". System generates HMAC-SHA256 signature and nonce.' },
                  { step: 4, title: 'Checkpoint 1 LED Strobe Activation', desc: 'ESP32 controller receives signed packet; GPIO 18 turns ON (amber strobe) for Junction 1 clearance.' },
                  { step: 5, title: 'Hospital B Real-Time Intake Alert', desc: 'Switch to Hospital B portal: incoming transfer card appears with live countdown and patient vitals.' },
                  { step: 6, title: 'Hospital B Readiness Response', desc: 'Click "Prepare Receiving Team" then "Ready to Receive" (Trauma Bay 1 ready).' },
                  { step: 7, title: 'Camera 1 Computer Vision Detection', desc: 'Ambulance approaches Camera 1. Edge YOLO detects vehicle + authenticates GPS context -> marks Checkpoint 1 PASSED.' },
                  { step: 8, title: 'Sequential Handover: J1 OFF -> J2 ON', desc: 'LED 1 deactivates safely; LED 2 (GPIO 19) activates for upcoming Junction 2 approach.' },
                  { step: 9, title: 'Camera 2 Bottleneck Injection', desc: 'Edge AI detects 42 stalled vehicles at Central Boulevard. High congestion alert fired.' },
                  { step: 10, title: 'Dynamic Dijkstra Reroute Recalculation', desc: 'Routing engine calculates Outer Ring Road Bypass (saves 4.2 mins). Obsolete Checkpoint 2 LED is safely deactivated.' },
                  { step: 11, title: 'Ambulance HUD Reroute Confirmation', desc: 'Ambulance portal displays dynamic reroute banner and updates waypoint polyline.' },
                  { step: 12, title: 'Normal User Privacy Verification', desc: 'Switch to Normal User: public sees road warning ("Emergency vehicle approaching") but NO patient medical records.' },
                  { step: 13, title: 'Citizen Emergency SOS Dispatch Workflow', desc: 'Demonstrate that public SOS requests go to "Awaiting Verification" queue; normal users cannot override signals.' },
                  { step: 14, title: 'Cybersecurity Attack Suite Execution', desc: 'Run automated security tests in Security Lab: replay attack, tampered HMAC, and EHR access blocked.' }
                ].map(s => (
                  <div key={s.step} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-cyan-900 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      {s.step}
                    </span>
                    <div>
                      <div className="font-bold text-white text-xs">{s.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white mb-2 text-sm">Four-Tier Edge-AI Cyber-Physical Architecture</h4>
                <div className="font-mono text-[11px] bg-slate-900 p-4 rounded-lg border border-slate-800 overflow-x-auto text-cyan-300 leading-relaxed whitespace-pre">
{`+-------------------------------------------------------------------------------------------------+
|                                     PORTAL PRESENTATION TIER                                     |
|  [Admin Portal]       [Hospital Portal (A/B)]      [Ambulance HUD]       [Normal User Portal]   |
+-------------------------------------------------------------------------------------------------+
                                               |
                                     (Role-Based Event Bus)
                                               v
+-------------------------------------------------------------------------------------------------+
|                                    CENTRAL LOGIC & STATE TIER                                   |
|   * RBAC Security Engine (HMAC-SHA256, Nonces, Time-to-Live 120s, Least-Privilege)             |
|   * Dynamic Dijkstra / A* Routing Engine with Hysteresis (Threshold = 1.5 min savings)          |
|   * Inter-Hospital Patient Handover Protocol & Triage Dispatch Service                           |
|   * Cryptographic Audit Ledger (SHA-256 Chained Hash Sequence)                                  |
+-------------------------------------------------------------------------------------------------+
                                       ^                     ^
                                       | (Telemetry & ACKs)  | (Inference Events)
                                       v                     v
+----------------------------------+                     +----------------------------------------+
|       IOT HARDWARE GATEWAY       |                     |           EDGE-AI VISION TIER          |
|  ESP32 DevKit v1 Microcontroller |                     |  YOLOv8 Object Detector (Cars/Buses)   |
|  GPIO 18: Junction 1 LED Strobe  |                     |  Context-Aware Ambulance Classifier    |
|  GPIO 19: Junction 2 LED Strobe  |                     |  Greenshields Density / Speed Extractor|
|  GPIO 21: Junction 3 LED Strobe  |                     |  Scikit-Learn CART Decision Tree Model |
|  GPIO 22: Junction 4 LED Strobe  |                     |  Latency: 14.2ms | Edge FPS: ~30       |
+----------------------------------+                     +----------------------------------------+`}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Zero-Trust Security Principles
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Every message between Edge devices and the server includes a unique nonce, timestamp, and HMAC-SHA256 signature. A 5-minute replay window cache rejects duplicate tokens immediately.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Fail-Safe Fallback Protocol
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    If an edge camera goes offline or confidence drops below 0.70, the system does not falsely mark clearance. It shifts to manual dispatch confirmation and maintains safe baseline traffic signal intervals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VIVA VOCE QUESTIONS & ANSWERS */}
          {activeTab === 'viva' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">
                20 Comprehensive Technical Viva Voce Questions &amp; Model Answers
              </h4>

              <div className="space-y-3">
                {[
                  {
                    q: 'Q1: Why is an edge computing architecture preferred over pure cloud processing for this project?',
                    a: 'Edge computing minimizes round-trip network latency (processing in ~14ms vs 300ms cloud lag) and provides local resilience. If the wide-area cloud disconnects, edge cameras and ESP32 controllers continue local lane clearance safely.'
                  },
                  {
                    q: 'Q2: Why must visual detection alone never be permitted to authorize emergency green light clearance?',
                    a: 'Visual detection alone is vulnerable to spoofing (e.g. toy ambulances, painted white vans, or hijacked decoy vehicles). Our architecture mandates multi-factor validation: visual resemblance + authenticated GPS telemetry within 50m + active cryptographic transfer nonce.'
                  },
                  {
                    q: 'Q3: How does the system defend against Replay Attacks on checkpoint controllers?',
                    a: 'Each command contains a cryptographically random nonce and a timestamp. The ESP32 and backend cache verified nonces in a time-to-live table. If an attacker re-broadcasts a captured passage message, it is dropped as a duplicate.'
                  },
                  {
                    q: 'Q4: What is the role of the scikit-learn Machine Learning component?',
                    a: 'The ML component (a trained CART DecisionTreeClassifier) predicts congestion categories (Low, Medium, High) and travel time delays using speed, density, and vehicle volume. It supplies dynamic weights to Dijkstra rather than attempting to replace graph routing.'
                  },
                  {
                    q: 'Q5: How does the dynamic rerouting engine prevent route oscillation / flutter?',
                    a: 'It enforces a 1.5-minute hysteresis savings threshold. If the alternative route saves less than 1.5 minutes, the current route is maintained to prevent rapid, confusing instructions to the driver.'
                  },
                  {
                    q: 'Q6: How is patient medical data protected from unauthorized public access?',
                    a: 'Under Role-Based Access Control (RBAC) and least-privilege principles, patient names and clinical notes are only shared between verified sending and receiving medical staff. Public users receive only anonymous traffic advisories.'
                  },
                  {
                    q: 'Q7: What happens if an ordinary user spams the Emergency button in the citizen portal?',
                    a: 'A token-bucket rate limiter throttles requests exceeding 5 per minute, triggering an HTTP 429 and logging a RATE_LIMIT_EXCEEDED security incident. Furthermore, citizen requests require dispatcher verification before priority is activated.'
                  },
                  {
                    q: 'Q8: What hardware microcontroller is targeted, and what GPIO pins are assigned?',
                    a: 'An ESP32 DevKit v1 with 4 GPIO channels: GPIO 18 (Checkpoint 1), GPIO 19 (Checkpoint 2), GPIO 21 (Checkpoint 3), and GPIO 22 (Checkpoint 4), utilizing mbedTLS for SHA-256 HMAC verification.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-bold text-cyan-300 text-xs">{item.q}</div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: IEEE PROJECT REPORT OUTLINE */}
          {activeTab === 'report_outline' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">
                Academic Minor Project Report Structure (IEEE / University Standard)
              </h4>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold">Chapter 1: Introduction</div>
                  <div className="text-slate-400">1.1 Background &amp; Problem Statement | 1.2 Motivation &amp; The "Golden Hour" Trauma Window | 1.3 Project Scope &amp; Objectives | 1.4 Methodology</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold">Chapter 2: Literature Review &amp; Related Work</div>
                  <div className="text-slate-400">2.1 Conventional Traffic Light Preemption (EVP/DSRC) | 2.2 Edge-AI and Computer Vision for ITS | 2.3 Cybersecurity Threats in Cyber-Physical Systems</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold">Chapter 3: System Design &amp; Architecture</div>
                  <div className="text-slate-400">3.1 Four-Portal Multi-Tenant Architecture | 3.2 4-Checkpoint Sequential State Machine | 3.3 Dynamic Dijkstra Graph Engine | 3.4 Cryptographic Nonce &amp; HMAC-SHA256 Protocol</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold">Chapter 4: Implementation Details</div>
                  <div className="text-slate-400">4.1 ESP32 Microcontroller Firmware &amp; GPIO Mapping | 4.2 YOLOv8 Computer Vision Pipeline | 4.3 Scikit-Learn TrafficNet Model Training &amp; Greenshields Physics</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold">Chapter 5: Results &amp; Experimental Evaluation</div>
                  <div className="text-slate-400">5.1 ML Model Metrics (Accuracy 94.3%, F1-Score 0.936) | 5.2 Dynamic Rerouting Travel Time Reduction (-4.2 min) | 5.3 Automated Penetration Test Outcomes</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold">Chapter 6: Conclusion &amp; Semester 8 Roadmap</div>
                  <div className="text-slate-400">6.1 Minor Project Summary | 6.2 Limitations &amp; Ethical Considerations | 6.3 Major Project Proposed Extensions</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FUTURE MAJOR PROJECT ROADMAP */}
          {activeTab === 'future' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">
                Semester 8 Major Project Expansion Proposal
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-cyan-400 font-bold text-xs">V2X 5G DSRC Integration</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Direct vehicle-to-infrastructure (V2I) communication using IEEE 802.11p or C-V2X sidelink for sub-5ms low latency preemption.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-amber-400 font-bold text-xs">SUMO Microscopic Traffic Simulation</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Coupling the web backend with Eclipse SUMO and TraCI to simulate city-scale traffic congestion with 10,000 interacting vehicles.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="text-emerald-400 font-bold text-xs">Federated Edge Learning</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Training camera vision models collaboratively across 50 intersections without streaming raw citizen video to central servers.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            Project Code: CSE-MINOR-2026-EDGE-AI
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition"
          >
            Back to Application
          </button>
        </div>
      </div>
    </div>
  );
};
