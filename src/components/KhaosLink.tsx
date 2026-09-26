import React, { useEffect, useRef, useState } from 'react';
import { RESONANCE_QUESTIONS, WORLD_PROFILES } from '../data/valkhorData';
import { ResonanceOption, ResonanceWorld, SectionId, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface KhaosLinkProps {
  soulState: SoulState;
  onCompleteResonance: (
    world: ResonanceWorld,
    scores: Record<ResonanceWorld, number>
  ) => void;
  onNavigate: (section: SectionId) => void;
}

export const KhaosLink: React.FC<KhaosLinkProps> = ({
  soulState,
  onCompleteResonance,
  onNavigate,
}) => {
  const [mode, setMode] = useState<'QUESTIONS' | 'ANALYZING' | 'RESULT'>(
    soulState.resonance ? 'RESULT' : 'QUESTIONS'
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<ResonanceWorld, number>>({
    IGNHUM: 2,
    DESERT: 2,
    ICE: 2,
    MECHANICAL: 2,
  });
  const [whisper, setWhisper] = useState<string | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<number>(0);
  const [selectedWorld, setSelectedWorld] = useState<ResonanceWorld>(
    soulState.resonance || 'IGNHUM'
  );

  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (soulState.resonance) {
      setSelectedWorld(soulState.resonance);
    }
  }, [soulState.resonance]);

  const handleSelectOption = (option: ResonanceOption) => {
    if (whisper) return; // Prevent double-click during transition
    soundEngine.playVendexPulse();

    const nextScores: Record<ResonanceWorld, number> = {
      IGNHUM: scores.IGNHUM + option.weights.IGNHUM,
      DESERT: scores.DESERT + option.weights.DESERT,
      ICE: scores.ICE + option.weights.ICE,
      MECHANICAL: scores.MECHANICAL + option.weights.MECHANICAL,
    };
    setScores(nextScores);
    setWhisper(option.vendexWhisper || 'SIGNAL RECORDED.');

    window.setTimeout(() => {
      setWhisper(null);
      if (currentIdx + 1 < RESONANCE_QUESTIONS.length) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        // Trigger Analysis Sequence (Section 15)
        setMode('ANALYZING');
        setAnalysisPhase(0);

        const dominant = (Object.keys(nextScores) as ResonanceWorld[]).reduce(
          (a, b) => (nextScores[a] >= nextScores[b] ? a : b)
        );

        window.setTimeout(() => {
          soundEngine.playGlitch(0.8);
          setAnalysisPhase(1); // SIGNAL ISOLATED
        }, 1200);

        window.setTimeout(() => {
          soundEngine.playConnectionRestored();
          setAnalysisPhase(2); // RESONANCE FOUND
        }, 2400);

        window.setTimeout(() => {
          setSelectedWorld(dominant);
          onCompleteResonance(dominant, nextScores);
          setMode('RESULT');
        }, 3700);
      }
    }, 950);
  };

  // Procedural Canvas Visualizer for the 4 Worlds (Sections 16–19)
  useEffect(() => {
    if (mode !== 'RESULT') return;
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      size: 1 + Math.random() * 2.5,
    }));

    const renderWorld = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      if (selectedWorld === 'IGNHUM') {
        // IGNHUM: Dark crimson thermal distortion, rising embers & aggressive energy waves
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.65);
        grad.addColorStop(0, 'rgba(181, 22, 27, 0.28)');
        grad.addColorStop(0.6, 'rgba(234, 29, 37, 0.08)');
        grad.addColorStop(1, 'rgba(5, 5, 5, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Thermal wave rings
        for (let r = 0; r < 6; r++) {
          ctx.strokeStyle =
            r % 2 === 0 ? 'rgba(234, 29, 37, 0.28)' : 'rgba(214, 186, 114, 0.16)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.08) {
            const rad =
              60 +
              r * 32 +
              Math.sin(a * 6 + time * 0.005 + r) * 16 +
              Math.cos(a * 9 - time * 0.008) * 9;
            const px = cx + Math.cos(a) * rad;
            const py = cy + Math.sin(a) * rad;
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        // Rising thermal particles
        particles.forEach((p) => {
          p.y -= 0.0035 + p.size * 0.001;
          p.x += Math.sin(time * 0.004 + p.y * 10) * 0.0015;
          if (p.y < 0) {
            p.y = 1;
            p.x = Math.random();
          }
          ctx.fillStyle = p.size > 2.2 ? '#EA1D25' : '#D6BA72';
          ctx.fillRect(p.x * w, p.y * h, p.size, p.size * 2.2);
        });
      } else if (selectedWorld === 'DESERT') {
        // DESERT: Deep void, abstract shifting sand horizons & internal consciousness rings
        for (let line = 0; line < 14; line++) {
          const yBase = h * 0.25 + line * (h * 0.045);
          ctx.strokeStyle = `rgba(185, 154, 83, ${0.08 + (line / 14) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 12) {
            const y =
              yBase +
              Math.sin(x * 0.008 + time * 0.0012 + line * 0.5) * 14 +
              Math.cos(x * 0.02 - time * 0.0008) * 5;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Stillness void eclipse in upper center
        ctx.strokeStyle = 'rgba(214, 186, 114, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy * 0.72, 48, 0, Math.PI * 2);
        ctx.stroke();

        particles.forEach((p) => {
          p.x += 0.0012;
          if (p.x > 1) p.x = 0;
          ctx.fillStyle = 'rgba(214, 186, 114, 0.45)';
          ctx.fillRect(p.x * w, p.y * h, 1.5, 1.5);
        });
      } else if (selectedWorld === 'ICE') {
        // ICE: Black mineral crystalline structures & sharp geometric shards
        ctx.strokeStyle = 'rgba(237, 237, 234, 0.25)';
        ctx.lineWidth = 1;

        for (let i = 0; i < 8; i++) {
          const rot = (i * Math.PI) / 4 + time * 0.0004;
          const rOuter = Math.min(w, h) * 0.38;
          const rInner = Math.min(w, h) * 0.14;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(rot) * rInner, cy + Math.sin(rot) * rInner);
          ctx.lineTo(cx + Math.cos(rot) * rOuter, cy + Math.sin(rot) * rOuter);
          ctx.lineTo(
            cx + Math.cos(rot + 0.35) * (rOuter * 0.7),
            cy + Math.sin(rot + 0.35) * (rOuter * 0.7)
          );
          ctx.closePath();
          ctx.stroke();
        }

        // Concentric hexagonal mineral lattice
        for (let ring = 1; ring <= 4; ring++) {
          const rad = ring * 42;
          ctx.strokeStyle =
            ring % 2 === 0
              ? 'rgba(237, 237, 234, 0.35)'
              : 'rgba(185, 154, 83, 0.22)';
          ctx.beginPath();
          for (let s = 0; s <= 6; s++) {
            const ang = (s * Math.PI) / 3 - time * 0.0003 * (ring % 2 === 0 ? 1 : -1);
            const px = cx + Math.cos(ang) * rad;
            const py = cy + Math.sin(ang) * rad;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      } else {
        // MECHANICAL: Technical schematics, rotating architectural matrices & data nodes
        ctx.strokeStyle = 'rgba(214, 186, 114, 0.22)';
        ctx.lineWidth = 1;

        const gridStep = 40;
        for (let x = 0; x < w; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Rotating technical CAD squares
        for (let sq = 1; sq <= 4; sq++) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(time * 0.0006 * (sq % 2 === 0 ? 1 : -1) * sq);
          const sz = sq * 52;
          ctx.strokeStyle = sq === 2 ? '#D6BA72' : 'rgba(237, 237, 234, 0.35)';
          ctx.strokeRect(-sz / 2, -sz / 2, sz, sz);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(renderWorld);
    };

    animId = requestAnimationFrame(renderWorld);
    return () => cancelAnimationFrame(animId);
  }, [mode, selectedWorld]);

  const currentQuestion = RESONANCE_QUESTIONS[currentIdx];
  const worldProfile = WORLD_PROFILES[selectedWorld];

  if (mode === 'ANALYZING') {
    return (
      <div className="min-h-[560px] border border-[#EDEDEA]/15 bg-[#050505] flex flex-col items-center justify-center p-8 text-center select-none">
        <VendexSymbol
          size={56}
          color={analysisPhase === 2 ? '#D6BA72' : '#EDEDEA'}
          glitch
        />
        <div className="mt-8 space-y-4">
          {analysisPhase === 0 && (
            <div className="font-mono text-sm tracking-[0.32em] text-[#EDEDEA] animate-pulse">
              ANALYZING RESONANCE
            </div>
          )}
          {analysisPhase === 1 && (
            <div className="font-mono text-sm tracking-[0.32em] text-[#D6BA72] animate-glitch-slice">
              SIGNAL ISOLATED
            </div>
          )}
          {analysisPhase >= 2 && (
            <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-[0.28em] text-[#EDEDEA] chromatic-text">
              RESONANCE FOUND
            </h2>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'RESULT') {
    const totalScore =
      scores.IGNHUM + scores.DESERT + scores.ICE + scores.MECHANICAL || 1;

    return (
      <div className="space-y-6 select-none">
        {/* Top Bar */}
        <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72]">
              KHAOS LINK // RESONANCE ISOLATED
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
              VALKHOR ARCHETYPE MATRIX
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                setCurrentIdx(0);
                setScores({ IGNHUM: 1, DESERT: 1, ICE: 1, MECHANICAL: 1 });
                setMode('QUESTIONS');
              }}
              className="px-3.5 py-2 border border-[#EDEDEA]/25 hover:border-[#D6BA72] font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/70 hover:text-[#D6BA72] uppercase transition-colors"
            >
              RE-RUN RESONANCE
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onNavigate('MASK');
              }}
              className="px-4 py-2 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#B99A53]/35 font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA] uppercase transition-colors"
            >
              PROCEED TO MASK //
            </button>
          </div>
        </div>

        {/* Main Result Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Procedural World Resonance Chamber */}
          <div className="lg:col-span-7 border border-[#EDEDEA]/15 bg-[#050505] relative min-h-[440px] flex flex-col justify-between overflow-hidden">
            <canvas
              ref={resultCanvasRef}
              className="absolute inset-0 w-full h-full block"
            />

            {/* Top Overlay Info */}
            <div className="relative z-10 p-5 flex items-center justify-between border-b border-[#EDEDEA]/10 bg-[#050505]/70">
              <div className="font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/70">
                {worldProfile.coordinates}
              </div>
              <div className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72]">
                {worldProfile.frequency}
              </div>
            </div>

            {/* Center World Title & Quote */}
            <div className="relative z-10 p-6 sm:p-10 my-auto text-center space-y-6">
              <div className="inline-block border border-[#EDEDEA]/20 bg-[#050505]/85 px-3 py-1 font-mono text-[10px] tracking-[0.3em] text-[#D6BA72]">
                DOMINANT FREQUENCY
              </div>

              <h2
                className="font-display text-6xl sm:text-8xl font-extrabold tracking-[0.26em] leading-none"
                style={{
                  color:
                    selectedWorld === 'IGNHUM'
                      ? '#EA1D25'
                      : selectedWorld === 'DESERT' || selectedWorld === 'MECHANICAL'
                      ? '#D6BA72'
                      : '#F5F5F0',
                }}
              >
                {worldProfile.name}
              </h2>

              <div className="max-w-md mx-auto bg-[#050505]/90 border border-[#EDEDEA]/20 p-4 space-y-1">
                {worldProfile.quote.map((line, i) => (
                  <div
                    key={i}
                    className="font-mono text-xs sm:text-sm tracking-[0.22em] text-[#EDEDEA] font-bold"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 4-Force Frequency Selector (Non-hierarchical per Section 20) */}
            <div className="relative z-10 border-t border-[#EDEDEA]/15 bg-[#080808]/95 p-3">
              <div className="font-mono text-[9px] tracking-[0.22em] text-[#EDEDEA]/40 mb-2 flex justify-between">
                <span>FOUR FORCES DISTRIBUTION (INSPECT SIGNAL)</span>
                <span>PRIMARY: {soulState.resonance || selectedWorld}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['IGNHUM', 'DESERT', 'ICE', 'MECHANICAL'] as ResonanceWorld[]).map(
                  (wId) => {
                    const pct = Math.round((scores[wId] / totalScore) * 100);
                    const isCurrent = selectedWorld === wId;
                    return (
                      <button
                        key={wId}
                        onClick={() => {
                          soundEngine.playClick();
                          setSelectedWorld(wId);
                        }}
                        className={`p-2 border text-left font-mono transition-colors ${
                          isCurrent
                            ? 'border-[#D6BA72] bg-[#B99A53]/15 text-[#EDEDEA]'
                            : 'border-[#EDEDEA]/15 bg-[#050505] text-[#EDEDEA]/55 hover:border-[#EDEDEA]/40'
                        }`}
                      >
                        <div className="text-[10px] tracking-[0.18em] font-bold">
                          {wId}
                        </div>
                        <div className="text-[9px] text-[#D6BA72] mt-0.5">
                          {pct}% SIGNAL
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: World Telemetry & Analysis */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-4">
              <div className="font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/45 border-b border-[#EDEDEA]/15 pb-2.5 flex justify-between">
                <span>RESONANCE TELEMETRY</span>
                <span>{worldProfile.name}</span>
              </div>

              <div className="space-y-3">
                {worldProfile.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex items-center justify-between font-mono text-xs tracking-[0.18em]"
                  >
                    <span className="text-[#EDEDEA]/55">{m.label} //</span>
                    <span
                      className={`font-bold ${
                        m.value === 'UNSTABLE' || m.value === 'CRITICAL'
                          ? 'text-[#EA1D25]'
                          : 'text-[#D6BA72]'
                      }`}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-2 border-t border-[#EDEDEA]/10">
                <div className="font-mono text-[10px] tracking-[0.2em] text-[#8E7443]">
                  ARCHETYPE OBSERVATION //
                </div>
                {worldProfile.description.map((desc, idx) => (
                  <p
                    key={idx}
                    className="font-mono text-[11px] tracking-[0.15em] text-[#EDEDEA]/75 leading-relaxed"
                  >
                    &gt; {desc}
                  </p>
                ))}
              </div>
            </div>

            {/* Vendex Interception Box */}
            <div className="border border-[#B99A53]/50 bg-[#050505] p-5 space-y-3">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-[#D6BA72]">
                <span className="w-1.5 h-1.5 bg-[#D6BA72]" />
                <span>VENDEX // TRANSMISSION</span>
              </div>
              <p className="font-mono text-xs tracking-[0.18em] text-[#EDEDEA] leading-relaxed">
                THE SYSTEM CLASSIFIES YOU TO PREDICT YOU.{' '}
                <span className="text-[#D6BA72] font-bold">
                  {worldProfile.name} IS NOT A CAGE. IT IS YOUR WEAPON.
                </span>
              </p>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onNavigate('MASK');
                }}
                className="w-full py-3 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#B99A53]/35 font-mono text-xs tracking-[0.24em] text-[#EDEDEA] uppercase transition-colors"
              >
                RECONSTRUCT MASK CONDUIT
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Binary Conceptual Choice Screen (Section 14)
  return (
    <div className="min-h-[560px] border border-[#EDEDEA]/15 bg-[#050505] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      {/* Top Progress Bar */}
      <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-4 font-mono text-xs tracking-[0.22em]">
        <div className="flex items-center gap-3">
          <span className="text-[#D6BA72] font-bold">KHAOS LINK</span>
          <span className="text-[#EDEDEA]/30">//</span>
          <span className="text-[#EDEDEA]/65">{currentQuestion.code}</span>
        </div>
        <div className="text-[#EDEDEA]/50">
          STEP {String(currentIdx + 1).padStart(2, '0')} /{' '}
          {String(RESONANCE_QUESTIONS.length).padStart(2, '0')}
        </div>
      </div>

      {/* Center Prompt: # CHOOSE. */}
      <div className="my-auto py-8 flex flex-col items-center justify-center">
        <div className="font-mono text-[10px] tracking-[0.32em] text-[#EDEDEA]/40 uppercase mb-2">
          RESONANCE ISOLATION PROTOCOL
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-[0.3em] text-[#EDEDEA] mb-10">
          CHOOSE.
        </h1>

        {whisper ? (
          <div className="my-12 py-8 px-10 border border-[#D6BA72] bg-[#080808] text-center animate-glitch-slice">
            <div className="font-mono text-[10px] tracking-[0.28em] text-[#8E7443] mb-2">
              VENDEX // INTERCEPT
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold tracking-[0.26em] text-[#D6BA72] gold-phosphor">
              {whisper}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Left Option */}
            <button
              onClick={() => handleSelectOption(currentQuestion.left)}
              onMouseEnter={() => soundEngine.playHover()}
              className="md:col-span-5 border border-[#EDEDEA]/25 hover:border-[#D6BA72] bg-[#080808] hover:bg-[#B99A53]/10 p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all group min-h-[200px]"
            >
              <span className="font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/35 group-hover:text-[#D6BA72] mb-3">
                {currentQuestion.left.subcode}
              </span>
              <span className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] group-hover:text-[#D6BA72] transition-colors">
                {currentQuestion.left.label}
              </span>
            </button>

            {/* VERSUS Divider */}
            <div className="md:col-span-1 flex flex-col items-center justify-center py-2 font-mono text-[10px] tracking-[0.3em] text-[#EDEDEA]/35">
              <span>VERSUS</span>
            </div>

            {/* Right Option */}
            <button
              onClick={() => handleSelectOption(currentQuestion.right)}
              onMouseEnter={() => soundEngine.playHover()}
              className="md:col-span-5 border border-[#EDEDEA]/25 hover:border-[#D6BA72] bg-[#080808] hover:bg-[#B99A53]/10 p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all group min-h-[200px]"
            >
              <span className="font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/35 group-hover:text-[#D6BA72] mb-3">
                {currentQuestion.right.subcode}
              </span>
              <span className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] group-hover:text-[#D6BA72] transition-colors">
                {currentQuestion.right.label}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between border-t border-[#EDEDEA]/15 pt-4 font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/40">
        <span>DO NOT DELIBERATE. RESPOND BY INSTINCT.</span>
        <span>SIGNAL LOCK // ACTIVE</span>
      </div>
    </div>
  );
};
