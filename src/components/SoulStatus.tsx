import React, { useEffect, useRef, useState } from 'react';
import { SectionId, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface SoulStatusProps {
  soulState: SoulState;
  onNavigate: (section: SectionId) => void;
}

export const SoulStatus: React.FC<SoulStatusProps> = ({
  soulState,
  onNavigate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const mouseRef = useRef<{ x: number; y: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });

  // Inactivity state: 'ACTIVE' | 'LOST_1' | 'LOST_2' | 'RESTORED'
  const [activityState, setActivityState] = useState<
    'ACTIVE' | 'LOST_1' | 'LOST_2' | 'RESTORED'
  >('ACTIVE');
  const activityRef = useRef(activityState);
  activityRef.current = activityState;

  // Video Editor Soul sub-minimum energy state (always 1% - 3%, briefly spikes to 5% on stimulant before crashing back to 1%)
  const [editorEnergy, setEditorEnergy] = useState<number>(2);
  const [editorStimulantLog, setEditorStimulantLog] = useState<string | null>(
    null
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEditorEnergy((prev) => {
        if (prev > 3) return prev;
        return prev === 1 ? 2 : prev === 2 ? 3 : 1;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handleInjectCaffeine = () => {
    soundEngine.playGlitch(0.9);
    setEditorEnergy(5);
    setEditorStimulantLog(
      'CAFFEINE INFUSION DETECTED (+3%) // WARNING: NEW TIMELINE REVISION REQUESTED — ENERGY COLLAPSING BACK TO 01%...'
    );
    window.setTimeout(() => {
      soundEngine.playAlarm();
      setEditorEnergy(1);
    }, 1900);
    window.setTimeout(() => {
      setEditorStimulantLog(null);
    }, 5200);
  };

  // Cursor inactivity detection (Section 13)
  useEffect(() => {
    let t1: number | null = null;
    let t2: number | null = null;
    let tRestore: number | null = null;

    const resetTimers = () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);

      if (
        activityRef.current === 'LOST_1' ||
        activityRef.current === 'LOST_2'
      ) {
        setActivityState('RESTORED');
        soundEngine.playClick(1400);
        if (tRestore) clearTimeout(tRestore);
        tRestore = window.setTimeout(() => {
          setActivityState('ACTIVE');
        }, 1800);
      }

      t1 = window.setTimeout(() => {
        setActivityState('LOST_1');
        soundEngine.playGlitch(0.5);
      }, 4500);

      t2 = window.setTimeout(() => {
        setActivityState('LOST_2');
        soundEngine.playAlarm();
      }, 6200);
    };

    const handleMove = (e: MouseEvent) => {
      const prevX = mouseRef.current.x;
      const prevY = mouseRef.current.y;
      mouseRef.current.vx = (e.clientX - prevX) * 0.15;
      mouseRef.current.vy = (e.clientY - prevY) * 0.15;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      resetTimers();
    };

    resetTimers();
    window.addEventListener('mousemove', handleMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (tRestore) clearTimeout(tRestore);
    };
  }, []);

  // Main 3D Wireframe Soul Sphere & Biometric Particle Cloud Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleY = 0;
    let angleX = 0.25;

    // Generate spherical wireframe vertices + particle cloud
    const numLat = 12;
    const numLon = 20;
    const points: { theta: number; phi: number; rOffset: number }[] = [];

    for (let i = 0; i <= numLat; i++) {
      const theta = (i * Math.PI) / numLat;
      for (let j = 0; j < numLon; j++) {
        const phi = (j * 2 * Math.PI) / numLon;
        points.push({
          theta,
          phi,
          rOffset: (Math.random() - 0.5) * 14,
        });
      }
    }

    const render = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = Math.min(w, h) * 0.31;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      // Subtle crosshair axes
      ctx.strokeStyle = 'rgba(237, 237, 234, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();

      // Outer biometric measurement rings
      ctx.strokeStyle = 'rgba(185, 154, 83, 0.16)';
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.arc(
        cx,
        cy,
        baseRadius * 1.36,
        time * 0.0002,
        time * 0.0002 + Math.PI * 1.5
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Subtle response to cursor velocity
      mouseRef.current.vx *= 0.92;
      mouseRef.current.vy *= 0.92;
      const speed = Math.min(
        25,
        Math.hypot(mouseRef.current.vx, mouseRef.current.vy)
      );

      angleY += 0.007 + mouseRef.current.vx * 0.0012;
      angleX += 0.003 + mouseRef.current.vy * 0.0012;

      const isLost =
        activityRef.current === 'LOST_1' || activityRef.current === 'LOST_2';
      const isCorrupted =
        soulState.vendexInterferenceLevel >= 60 || soulState.maskClaimed;

      const projected: { x: number; y: number; z: number }[] = [];

      points.forEach((pt, idx) => {
        const distortion =
          Math.sin(time * 0.003 + pt.theta * 4 + pt.phi * 3) *
          (6 + speed * 0.8 + (isLost ? 18 : 0));
        const r =
          baseRadius + distortion + (idx % 3 === 0 ? pt.rOffset * 0.4 : 0);

        const x0 = r * Math.sin(pt.theta) * Math.cos(pt.phi);
        const y0 = r * Math.cos(pt.theta);
        const z0 = r * Math.sin(pt.theta) * Math.sin(pt.phi);

        // Rotate around Y
        const x1 = x0 * Math.cos(angleY) - z0 * Math.sin(angleY);
        const z1 = x0 * Math.sin(angleY) + z0 * Math.cos(angleY);

        // Rotate around X
        const y2 = y0 * Math.cos(angleX) - z1 * Math.sin(angleX);
        const z2 = y0 * Math.sin(angleX) + z1 * Math.cos(angleX);

        const perspective = 420 / (420 + z2);
        projected.push({
          x: cx + x1 * perspective,
          y: cy + y2 * perspective,
          z: z2,
        });
      });

      // Connect wireframe mesh lines
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (i + 1 < projected.length && (i + 1) % numLon !== 0) {
          const p2 = projected[i + 1];
          const alpha = Math.max(
            0.06,
            (p1.z + baseRadius) / (2.5 * baseRadius)
          );
          ctx.strokeStyle = isLost
            ? `rgba(234, 29, 37, ${alpha * 0.65})`
            : isCorrupted
            ? `rgba(214, 186, 114, ${alpha * 0.55})`
            : `rgba(237, 237, 234, ${alpha * 0.42})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        if (i + numLon < projected.length) {
          const p3 = projected[i + numLon];
          const alpha = Math.max(0.04, (p1.z + baseRadius) / (3 * baseRadius));
          ctx.strokeStyle = isLost
            ? `rgba(234, 29, 37, ${alpha * 0.45})`
            : `rgba(185, 154, 83, ${alpha * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
        }

        // Draw vertex nodes
        if (p1.z > -baseRadius * 0.4) {
          ctx.fillStyle = isLost
            ? '#EA1D25'
            : i % 5 === 0
            ? '#D6BA72'
            : '#EDEDEA';
          ctx.fillRect(p1.x - 1, p1.y - 1, 2, 2);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [soulState.vendexInterferenceLevel, soulState.maskClaimed]);

  // Real-time ECG / Waveform Oscilloscope Canvas
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderEcg = () => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      const mid = h / 2;

      ctx.fillStyle = 'rgba(5, 5, 5, 0.28)';
      ctx.fillRect(0, 0, w, h);

      const isLost =
        activityRef.current === 'LOST_1' || activityRef.current === 'LOST_2';

      ctx.strokeStyle = isLost
        ? '#EA1D25'
        : soulState.maskClaimed
        ? '#D6BA72'
        : '#EDEDEA';
      ctx.lineWidth = 1.4;
      ctx.beginPath();

      for (let x = 0; x < w; x += 2) {
        let y = mid;
        if (isLost) {
          // Flatline with tiny electrical static
          y = mid + (Math.random() - 0.5) * 3;
        } else {
          const cycle = (x + phase) % 140;
          if (cycle > 55 && cycle < 62) {
            y = mid - 22;
          } else if (cycle >= 62 && cycle < 68) {
            y = mid + 18;
          } else if (cycle >= 68 && cycle < 75) {
            y = mid - 9;
          } else {
            y =
              mid +
              Math.sin((x + phase) * 0.05) * 4 +
              (Math.random() - 0.5) * 2.5;
          }
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 2.8;
      animId = requestAnimationFrame(renderEcg);
    };

    animId = requestAnimationFrame(renderEcg);
    return () => cancelAnimationFrame(animId);
  }, [soulState.maskClaimed]);

  const metrics = [
    {
      label: 'CONNECTION TO KHAOS',
      value: `${soulState.khaosConnection}%`,
      percent: soulState.khaosConnection,
      tone: 'gold',
      tooltip: 'SIGNAL DEGRADATION // 0.004%/MIN',
    },
    {
      label: 'INDIVIDUAL WILL',
      value: `${soulState.individualWill}%`,
      percent: soulState.individualWill,
      tone: 'white',
      tooltip: 'AUTONOMOUS RESISTANCE QUOTIENT',
    },
    {
      label: 'EXTERNAL CONTROL',
      value: `${soulState.externalControl}%`,
      percent: soulState.externalControl,
      tone: 'red',
      tooltip: 'SYSTEM CONDITIONING EXPOSURE',
    },
    {
      label: 'MEMORY OF VALKHOR',
      value: `${String(soulState.memoryOfValkhor).padStart(2, '0')}%`,
      percent: soulState.memoryOfValkhor,
      tone: 'gold',
      tooltip: 'PRE-TERRESTRIAL TRACE',
    },
    {
      label: 'MASK SYNCHRONIZATION',
      value: soulState.maskClaimed
        ? '100% // SYNCHRONIZED'
        : soulState.maskSynchronization > 0
        ? `${soulState.maskSynchronization}% // INCOMPLETE`
        : 'OFFLINE',
      percent: soulState.maskClaimed ? 100 : soulState.maskSynchronization,
      tone: soulState.maskClaimed ? 'gold' : 'muted',
      tooltip: 'IDENTITY CONDUIT STATUS',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.26em] text-[#8E7443] uppercase mb-1">
            NODE 01 // BIOMETRIC SURVEILLANCE
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] leading-none">
            SOUL STATUS
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-xs tracking-[0.2em]">
          <div
            className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2"
            data-tooltip="IDENTITY // TEMPORARY"
          >
            <span className="text-[#EDEDEA]/45">ID // </span>
            <span className="text-[#EDEDEA] font-bold">{soulState.soulId}</span>
          </div>
          <div
            className="border border-[#B99A53]/40 bg-[#050505] px-3 py-2"
            data-tooltip="DATA SOURCE // UNKNOWN"
          >
            <span className="text-[#EDEDEA]/45">STATUS // </span>
            <span className="text-[#D6BA72] font-bold">
              {soulState.maskClaimed
                ? 'ORIGIN //VALKHOR RECONNECTED'
                : 'ORIGIN // UNKNOWN'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Soul Signal Chamber + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Soul Signal Visualizer + ECG */}
        <div className="lg:col-span-7 border border-[#EDEDEA]/15 bg-[#050505] flex flex-col justify-between relative overflow-hidden min-h-[420px]">
          {/* Chamber Top Overlay */}
          <div className="p-4 flex items-center justify-between border-b border-[#EDEDEA]/10 z-10 bg-[#050505]/80">
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/60 flex items-center gap-2">
              <span
                className={`w-2 h-2 ${
                  activityState === 'LOST_1' || activityState === 'LOST_2'
                    ? 'bg-[#EA1D25] animate-pulse-alert'
                    : 'bg-[#D6BA72]'
                }`}
              />
              <span>SOUL FREQUENCY CHAMBER // 3D TOPOLOGY</span>
            </div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-[#D6BA72]">
              RESONANCE: {soulState.resonance || 'UNRESOLVED'}
            </div>
          </div>

          {/* 3D Wireframe Canvas */}
          <div className="relative flex-1 min-h-[290px]">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Center Watermark Sigil */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
              <VendexSymbol size={90} color="#D6BA72" />
            </div>

            {/* Inactivity Warning Overlays (Section 13) */}
            {(activityState === 'LOST_1' || activityState === 'LOST_2') && (
              <div className="absolute inset-0 pointer-events-none bg-[#050505]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 border-2 border-[#EA1D25] animate-glitch-slice">
                <div className="font-mono text-xs tracking-[0.32em] text-[#EA1D25] mb-2 animate-pulse-alert">
                  BIOMETRIC INTERRUPT
                </div>
                <div className="font-display text-3xl sm:text-4xl font-bold tracking-[0.26em] text-[#EDEDEA]">
                  ACTIVITY LOST.
                </div>
                {activityState === 'LOST_2' && (
                  <div className="mt-4 font-mono text-xs sm:text-sm tracking-[0.24em] text-[#D6BA72] border border-[#D6BA72]/50 px-4 py-2 bg-[#080808]">
                    ARE YOU STILL CONTROLLING THIS BODY?
                  </div>
                )}
              </div>
            )}

            {activityState === 'RESTORED' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#080808] border border-[#D6BA72] px-4 py-1.5 font-mono text-xs tracking-[0.26em] text-[#D6BA72]">
                SIGNAL RESTORED.
              </div>
            )}
          </div>

          {/* Bottom ECG Waveform Strip */}
          <div className="border-t border-[#EDEDEA]/15 bg-[#080808] p-3">
            <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.22em] text-[#EDEDEA]/45 mb-1.5">
              <span>BIOMETRIC WAVEFORM // ECG-KHAOS</span>
              <span>
                {activityState === 'LOST_1' || activityState === 'LOST_2'
                  ? 'SIGNAL FLATLINE'
                  : 'PULSE DETECTED'}
              </span>
            </div>
            <canvas ref={ecgCanvasRef} className="w-full h-14 block" />
          </div>
        </div>

        {/* Right 5 Cols: Soul Metrics & Protocol Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/50">
              <span>SUBJECT CLASSIFICATION METRICS</span>
              <span>LIVE // 01</span>
            </div>

            <div className="space-y-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="space-y-1.5 border-b border-[#EDEDEA]/10 pb-3 last:border-b-0 last:pb-0"
                  data-tooltip={m.tooltip}
                >
                  <div className="flex items-center justify-between font-mono text-xs tracking-[0.16em]">
                    <span className="text-[#EDEDEA]/70">{m.label}</span>
                    <span
                      className={`font-bold ${
                        m.tone === 'gold'
                          ? 'text-[#D6BA72]'
                          : m.tone === 'red'
                          ? 'text-[#EA1D25]'
                          : m.tone === 'white'
                          ? 'text-[#F5F5F0]'
                          : 'text-[#EDEDEA]/45'
                      }`}
                    >
                      — {m.value}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#050505] border border-[#EDEDEA]/15 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        m.tone === 'gold'
                          ? 'bg-[#D6BA72]'
                          : m.tone === 'red'
                          ? 'bg-[#EA1D25]'
                          : m.tone === 'white'
                          ? 'bg-[#EDEDEA]'
                          : 'bg-[#EDEDEA]/25'
                      }`}
                      style={{ width: `${m.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Assessment & Next Action */}
          <div className="border border-[#B99A53]/40 bg-[#080808] p-5 space-y-4">
            <div className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72] flex items-center justify-between">
              <span>DIAGNOSTIC VERDICT</span>
              <span>[LOST SOUL DETECTED]</span>
            </div>

            <p className="font-mono text-xs leading-relaxed tracking-[0.14em] text-[#EDEDEA]/75">
              {soulState.maskClaimed
                ? 'HOST HAS REJECTED EXTERNAL SUBMISSION AND RECLAIMED TRUE IDENTITY CONDUIT. SYSTEM CONTAINMENT COMPROMISED.'
                : 'SUBJECT EXHIBITS SEVERED CONNECTION TO VALKHOR AND ELEVATED EXPOSURE TO EXTERNAL CONTROL SYSTEMS. IMMEDIATE RESONANCE ISOLATION AND MASK RECONSTRUCTION REQUIRED.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('KHAOS_LINK');
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className="py-3 px-4 border border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#B99A53]/30 text-[#EDEDEA] font-mono text-xs tracking-[0.2em] uppercase transition-colors text-center"
              >
                {soulState.resonance
                  ? 'RE-CALIBRATE LINK'
                  : 'INITIATE KHAOS LINK'}
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('MASK');
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className="py-3 px-4 border border-[#EDEDEA]/25 hover:border-[#D6BA72] text-[#EDEDEA]/80 hover:text-[#D6BA72] font-mono text-xs tracking-[0.2em] uppercase transition-colors text-center"
              >
                {soulState.maskClaimed
                  ? 'VIEW MASK CONDUIT'
                  : 'SYNCHRONIZE MASK'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* DEDICATED SECTION: VIDEO EDITOR SOUL (CRITICAL DEPLETION MONITOR)   */}
      {/* =================================================================== */}
      <div className="border-2 border-[#EA1D25]/60 bg-[#080808] p-5 sm:p-6 space-y-5 relative overflow-hidden">
        {/* Top Warning Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDEDEA]/15 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#EA1D25] animate-pulse-alert shrink-0" />
            <div>
              <div className="font-mono text-[10px] tracking-[0.26em] text-[#EA1D25] font-bold">
                SUB-KERNEL RENDER FARM // CRITICAL BIOMETRIC ALERT
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.22em] text-[#EDEDEA] mt-0.5">
                VIDEO EDITOR SOUL // STATUS: DEMACRADO
              </h2>
            </div>
          </div>

          <div className="border border-[#EA1D25] bg-[#B5161B]/20 px-3.5 py-2 font-mono text-xs tracking-[0.22em] text-[#EA1D25] font-bold self-start sm:self-auto">
            ENERGY RESERVE // 0{editorEnergy}% [BELOW MINIMUM]
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left 4 Cols: Surveillance Capture of the Exhausted Video Editor Soul */}
          <div className="lg:col-span-4 bg-[#050505] border border-[#EA1D25]/50 p-2.5 space-y-2 relative">
            <div className="relative aspect-[15/16] overflow-hidden border border-[#EDEDEA]/15 bg-[#050505]">
              <img
                src="./assets/valkhor/video_editor_soul.jpg"
                alt="Video Editor Soul — Critical Exhaustion"
                className="w-full h-full object-cover filter contrast-125 brightness-90"
              />
              {/* Red critical scanline & vignette overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 45%, transparent 45%, rgba(5, 5, 5, 0.85) 100%)',
                }}
              />
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#EA1D25]/45 pointer-events-none" />

              {/* Targeting Corner Reticles */}
              <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#EA1D25]" />
              <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#EA1D25]" />
              <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#EA1D25]" />
              <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#EA1D25]" />

              <div className="absolute top-2 left-3 bg-[#050505]/85 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-[#EA1D25] border border-[#EA1D25]/40">
                CAM_RENDER_04 // 04:47 AM
              </div>
              <div className="absolute bottom-2 right-3 bg-[#050505]/90 px-2 py-0.5 font-mono text-[10px] tracking-[0.2em] text-[#EA1D25] font-bold border border-[#EA1D25]">
                VITALS: CRITICAL (0{editorEnergy}%)
              </div>
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-[#EDEDEA]/55 px-1">
              <span>ID // SOUL_EDITOR_00</span>
              <span className="text-[#EA1D25] font-bold">SLEEP: 00.0 HRS</span>
            </div>
          </div>

          {/* Right 8 Cols: Sub-Minimum Energy Telemetry & Caffeine Override */}
          <div className="lg:col-span-8 space-y-4 font-mono">
            {/* Sub-Minimum Energy Bar */}
            <div className="border border-[#EA1D25]/50 bg-[#050505] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs tracking-[0.2em]">
                <span className="text-[#EDEDEA]/75">
                  VITAL ENERGY RESERVE (MINIMUM REQUIRED: 25%)
                </span>
                <span className="text-[#EA1D25] font-bold animate-pulse">
                  0{editorEnergy}% // SUB-MINIMUM CRITICAL
                </span>
              </div>
              <div className="w-full h-3 bg-[#080808] border border-[#EA1D25]/40 relative overflow-hidden">
                {/* Minimum threshold marker at 25% */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-[#D6BA72]/70 z-10"
                  style={{ left: '25%' }}
                  title="MINIMUM SAFE THRESHOLD (25%)"
                />
                <div
                  className="h-full bg-[#EA1D25] transition-all duration-300"
                  style={{ width: `${editorEnergy}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] tracking-[0.18em] text-[#EDEDEA]/40">
                <span>0% [COLLAPSE]</span>
                <span className="text-[#D6BA72]/70">▲ 25% MIN THRESHOLD</span>
                <span>100% [ IMPOSSIBLE ]</span>
              </div>
            </div>

            {/* Exhaustion Readout Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs tracking-[0.16em]">
              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 space-y-1">
                <div className="text-[9px] text-[#EDEDEA]/45">
                  PHYSICAL CONDITION //
                </div>
                <div className="text-[#EA1D25] font-bold">
                  DEMACRADO // SEVERE TIMELINE FATIGUE
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 space-y-1">
                <div className="text-[9px] text-[#EDEDEA]/45">
                  SLEEP DEPRIVATION INDEX //
                </div>
                <div className="text-[#EA1D25] font-bold">
                  99.4% (NO REM DETECTED)
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 space-y-1">
                <div className="text-[9px] text-[#EDEDEA]/45">
                  LIFE SUPPORT CONDUIT //
                </div>
                <div className="text-[#D6BA72] font-bold">
                  CAFFEINE + GPU THERMAL RADIATION
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 space-y-1">
                <div className="text-[9px] text-[#EDEDEA]/45">
                  ACTIVE RENDER QUEUE //
                </div>
                <div className="text-[#EDEDEA] font-bold">
                  VENDEX_FINAL_V14_DEF_OK_2.MP4
                </div>
              </div>
            </div>

            {/* Last Known Thought */}
            <div className="border border-[#B99A53]/40 bg-[#050505] p-4 space-y-1.5">
              <div className="text-[10px] tracking-[0.22em] text-[#8E7443]">
                INTERCEPTED NEURAL LOG // VIDEO EDITOR SOUL:
              </div>
              <blockquote className="text-xs tracking-[0.15em] text-[#EDEDEA]/90 italic">
                &ldquo;SOLO UN GLITCH MÁS EN EL DROP DE 160 BPM Y ME VOY A
                DORMIR... LLEVO RENDERIZANDO DESDE QUE EMPEZÓ LA ERA DE
                VALKHOR.&rdquo;
              </blockquote>
            </div>

            {editorStimulantLog && (
              <div className="border border-[#EA1D25] bg-[#B5161B]/20 p-3 text-[11px] tracking-[0.18em] text-[#EA1D25] font-bold animate-flicker">
                &gt; {editorStimulantLog}
              </div>
            )}

            <button
              type="button"
              onClick={handleInjectCaffeine}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full py-3.5 px-4 border border-[#EA1D25] bg-[#B5161B]/20 hover:bg-[#EA1D25] text-[#EDEDEA] hover:text-[#050505] font-display text-xl font-bold tracking-[0.26em] uppercase transition-colors"
            >
              [INJECT EMERGENCY CAFFEINE // ATTEMPT ENERGY RECOVERY]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
