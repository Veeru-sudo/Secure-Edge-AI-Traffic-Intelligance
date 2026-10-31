import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../services/db';
import { runEdgeCameraInference } from '../../services/mlEngine';
import { Camera, Cpu, Activity, ShieldCheck, AlertTriangle, Play, Pause, RefreshCw } from 'lucide-react';

export const CameraSimulator: React.FC = () => {
  const [selectedJunction, setSelectedJunction] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  const checkpoint = db.checkpoints.find(cp => cp.junctionNumber === selectedJunction) || db.checkpoints[0];

  // Canvas-based real-time bounding box simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const renderFrame = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark asphalt road background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Perspective road lanes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.1, canvas.height);
      ctx.lineTo(canvas.width * 0.35, canvas.height * 0.3);
      ctx.lineTo(canvas.width * 0.65, canvas.height * 0.3);
      ctx.lineTo(canvas.width * 0.9, canvas.height);
      ctx.closePath();
      ctx.fill();

      // Lane dividing dashed lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 16]);
      ctx.lineDashOffset = -tick * 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.5, canvas.height * 0.3);
      ctx.lineTo(canvas.width * 0.5, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Horizon sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.3);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3);

      // Simulated cars
      const isCongested = checkpoint.trafficDensity === 'high' || checkpoint.vehicleCount > 30;
      const carCount = isCongested ? 7 : 3;

      for (let i = 0; i < carCount; i++) {
        const laneOffset = i % 2 === 0 ? -1 : 1;
        const speed = isCongested ? 0.4 : 1.4;
        const progress = ((tick * speed + i * 80) % 300) / 300;
        const y = canvas.height * 0.35 + progress * (canvas.height * 0.55);
        const scale = 0.4 + progress * 0.8;
        const x = canvas.width * 0.5 + laneOffset * (30 + progress * 80);

        const w = 48 * scale;
        const h = 28 * scale;

        // Draw vehicle body
        ctx.fillStyle = i === 1 && checkpoint.ambulanceDetected ? '#dc2626' : (i % 3 === 0 ? '#3b82f6' : '#94a3b8');
        ctx.fillRect(x - w / 2, y - h / 2, w, h);

        // Draw YOLO Detection Bounding Box
        ctx.strokeStyle = i === 1 && checkpoint.ambulanceDetected ? '#ef4444' : '#22c55e';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - w / 2 - 4, y - h / 2 - 4, w + 8, h + 8);

        // Bounding box label
        ctx.fillStyle = i === 1 && checkpoint.ambulanceDetected ? '#ef4444' : '#22c55e';
        ctx.font = '10px "JetBrains Mono", monospace';
        const label = i === 1 && checkpoint.ambulanceDetected 
          ? `AMBULANCE 0.95 [AUTH]` 
          : `car 0.${88 + (i % 10)}`;
        ctx.fillText(label, x - w / 2 - 4, y - h / 2 - 8);

        // Flashing emergency beacon on ambulance
        if (i === 1 && checkpoint.ambulanceDetected && Math.floor(tick / 8) % 2 === 0) {
          ctx.fillStyle = '#60a5fa';
          ctx.beginPath();
          ctx.arc(x, y - h / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Camera HUD Overlay
      ctx.fillStyle = '#0284c7';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`CAM-0${selectedJunction} // JUNCTION_${selectedJunction}`, 14, 22);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`REC [30.2 FPS] 1920x1080 H.264`, 14, 38);
      ctx.fillText(`YOLOv8-EdgeAI | LATENCY: ${checkpoint.inferenceLatencyMs}ms`, 14, 54);

      if (checkpoint.ambulanceDetected) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(canvas.width - 200, 12, 186, 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`🚨 AMBULANCE DETECTED`, canvas.width - 192, 29);
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      }
    };

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [selectedJunction, isPlaying, checkpoint]);

  const handleSimulateCongestion = () => {
    checkpoint.vehicleCount = 44;
    checkpoint.trafficDensity = 'high';
    const inf = runEdgeCameraInference(checkpoint.id, 44, 12);
    checkpoint.inferenceLatencyMs = inf.inferenceTimeMs;
    db.notify();
  };

  const handleClearCongestion = () => {
    checkpoint.vehicleCount = 14;
    checkpoint.trafficDensity = 'low';
    const inf = runEdgeCameraInference(checkpoint.id, 14, 48);
    checkpoint.inferenceLatencyMs = inf.inferenceTimeMs;
    db.notify();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Edge-AI Camera Feed & Vision Analyzer
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                EDGE NODE ONLINE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Local YOLOv8 inference with multi-factor cryptographic ambulance authorization
            </p>
          </div>
        </div>

        {/* Junction Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {[1, 2, 3, 4].map(j => (
            <button
              key={j}
              onClick={() => setSelectedJunction(j)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                selectedJunction === j
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Camera {j}
            </button>
          ))}
        </div>
      </div>

      {/* Main Video & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Canvas Camera Stream */}
        <div className="lg:col-span-8 relative rounded-lg overflow-hidden border border-slate-800 bg-black">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-auto aspect-video block"
          />

          {/* Control Bar Overlay */}
          <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-md border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-medium"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause Feed' : 'Resume Feed'}
              </button>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                Segment: <span className="text-slate-200 font-mono">{checkpoint.roadSegment}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${checkpoint.cameraStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              <span className="text-slate-300 capitalize font-medium">{checkpoint.cameraStatus}</span>
            </div>
          </div>
        </div>

        {/* Edge Telemetry & Diagnostics */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Edge Computing Telemetry
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Inference Latency</div>
                <div className="text-sm font-mono font-bold text-cyan-300">{checkpoint.inferenceLatencyMs} ms</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Vehicle Count</div>
                <div className="text-sm font-mono font-bold text-amber-300">{checkpoint.vehicleCount} veh/min</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Traffic Density</div>
                <div className={`text-sm font-mono font-bold uppercase ${
                  checkpoint.trafficDensity === 'high' ? 'text-rose-400' : checkpoint.trafficDensity === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {checkpoint.trafficDensity}
                </div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <div className="text-[10px] text-slate-400">Detection Confidence</div>
                <div className="text-sm font-mono font-bold text-slate-200">
                  {checkpoint.ambulanceDetected ? `${(checkpoint.detectionConfidence * 100).toFixed(0)}% (High)` : '0%'}
                </div>
              </div>
            </div>

            {/* Verification Security Policy Banner */}
            <div className="p-2.5 rounded bg-blue-950/40 border border-blue-900/60 text-[11px] text-blue-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-blue-300">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Anti-Spoofing Protocol Active
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Computer vision visual detection is combined with authenticated GPS telemetry, active route nonce, and dispatch signature before the lane clearance signal is permitted.
              </p>
            </div>
          </div>

          {/* Edge Injection / Simulation Controls */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Experiment & Stress Testing
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSimulateCongestion}
                className="w-full py-2 px-3 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800 rounded text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Inject Traffic Bottleneck (44 Vehicles)
              </button>

              <button
                onClick={handleClearCongestion}
                className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3 text-slate-400" />
                Reset Segment to Free Flow (14 Vehicles)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
