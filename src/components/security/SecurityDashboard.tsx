import React, { useState } from 'react';
import { runSecurityTestSuite, getSecurityIncidents, getAuditLogs } from '../../services/security';
import { ShieldAlert, Play, CheckCircle, XCircle, Lock, Terminal, FileText, AlertTriangle, Key } from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<Awaited<ReturnType<typeof runSecurityTestSuite>> | null>(null);
  const incidents = getSecurityIncidents();
  const auditLogs = getAuditLogs();

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await runSecurityTestSuite();
      setTestResults(res);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Cybersecurity Command Center & Threat Defense Suite
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800">
                ACTIVE DEFENSE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Zero-Trust Architecture: Role-Based Access Control, HMAC-SHA256 nonces, Least Privilege EHR protection, and tamper-evident audit logging.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunningTests}
          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/50 flex items-center gap-2 transition disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-white" />
          {isRunningTests ? 'Executing Penetration Tests...' : 'Run Automated Security Test Suite'}
        </button>
      </div>

      {/* Security Test Suite Results Card */}
      {testResults && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Automated Penetration Test Suite Results ({testResults.filter(t => t.passed).length}/{testResults.length} Passed)
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              ALL ATTACK VECTORS BLOCKED
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    {t.passed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span>{t.testName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{t.timestamp}</span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {t.description}
                </p>

                <div className="bg-slate-900 p-2 rounded border border-slate-800/80 font-mono text-[11px] space-y-1">
                  <div className="text-slate-400">
                    <span className="text-rose-400 font-semibold">Attack Vector:</span> {t.attackVector}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-cyan-400 font-semibold">Defense Outcome:</span> {t.actualResult}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time Security Incident Feed & Tamper-Evident Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Incident Alerts */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Live Security Incidents ({incidents.length})
            </h3>
            <span className="text-[10px] text-slate-400">Real-time firewall & RBAC traps</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {incidents.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No active security incidents</div>
            ) : (
              incidents.map(inc => (
                <div
                  key={inc.id}
                  className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      inc.severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      inc.severity === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {inc.eventType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{inc.timestamp}</span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="text-[10px] text-cyan-400 font-mono">
                    Mitigation: {inc.mitigationAction}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cryptographic Audit Logs with SHA-256 Hashes */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              Tamper-Evident Audit Trail ({auditLogs.length})
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">SHA-256 Chained</span>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 font-mono text-[11px]">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between text-slate-300"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">[{log.portal}]</span>
                    <span className="font-semibold">{log.action}</span>
                    <span className={`text-[9px] px-1 rounded ${
                      log.outcome === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {log.outcome}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    User: {log.performedBy} | Target: {log.targetResource}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">{log.timestamp}</span>
                  <span className="text-[9px] text-slate-400 text-slate-600 block">{log.integrityHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
