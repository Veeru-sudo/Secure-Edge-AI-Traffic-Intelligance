import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import {
  Shield,
  Building2,
  Ambulance,
  Users,
  BrainCircuit,
  Lock,
  GraduationCap,
  Bell,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentPortal: 'admin' | 'hospital' | 'ambulance' | 'user' | 'security' | 'ml';
  onSelectPortal: (portal: 'admin' | 'hospital' | 'ambulance' | 'user' | 'security' | 'ml') => void;
  onOpenAcademicDocs: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPortal,
  onSelectPortal,
  onOpenAcademicDocs
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showEventDrawer, setShowEventDrawer] = useState(false);
  const events = db.events;
  const activeTransfer = db.activeTransfer;

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toLocaleTimeString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-[1500] bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40">
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Edge<span className="text-cyan-400">AI</span> TrafficNet
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  v2.4 ACADEMIC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[260px]">
                Four-Portal Emergency Coordination System
              </p>
            </div>
          </div>

          {/* Four Primary Portals & Lab Switcher */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => onSelectPortal('admin')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'admin'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              onClick={() => onSelectPortal('hospital')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'hospital'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital</span>
              {activeTransfer && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => onSelectPortal('ambulance')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'ambulance'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>Ambulance</span>
              {activeTransfer && (
                <span className="text-[10px] font-mono text-white bg-red-950 px-1.5 rounded">
                  {activeTransfer.currentEtaMinutes}m
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectPortal('user')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'user'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Normal User</span>
            </button>

            <span className="h-4 w-px bg-slate-800 mx-0.5 hidden md:block"></span>

            <button
              onClick={() => onSelectPortal('ml')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'ml'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>ML Benchmark</span>
            </button>

            <button
              onClick={() => onSelectPortal('security')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                currentPortal === 'security'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security Lab</span>
            </button>
          </nav>

          {/* Right Controls: Academic Docs & Real-Time Event Drawer */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAcademicDocs}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow flex items-center gap-1.5 transition"
              title="Open Academic Minor Project Viva & Docs"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Viva / Docs</span>
            </button>

            <button
              onClick={() => setShowEventDrawer(!showEventDrawer)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
              title="Real-Time Event Stream"
            >
              <Bell className="w-4 h-4" />
              {events.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              )}
            </button>

            <div className="hidden lg:block text-right font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-3">
              <span className="text-white block font-semibold">{timeStr}</span>
              <span className="text-emerald-400 text-[10px]">SYNC 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Event Bus Drawer Modal */}
      {showEventDrawer && (
        <div className="bg-slate-900 border-b border-slate-800 p-4 shadow-2xl transition">
          <div className="max-w-7xl mx-auto flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              Real-Time WebSocket Event Bus (Role-Filtered Audit Broadcast)
            </span>
            <button
              onClick={() => setShowEventDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="max-w-7xl mx-auto space-y-1.5 max-h-44 overflow-y-auto text-xs font-mono">
            {events.slice(0, 8).map(evt => (
              <div
                key={evt.id}
                className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-cyan-400 font-bold">[{evt.type}]</span>
                  <span className="text-slate-300 truncate">{evt.message}</span>
                </div>
                <div className="text-slate-500 shrink-0 ml-3">{evt.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
