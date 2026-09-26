import React, { useEffect, useState } from 'react';
import { VENDEX_INTERCEPTIONS } from '../data/valkhorData';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface GlobalOverlaysProps {
  interferenceLevel: number;
  alarmActive: boolean;
  whiteFlash: boolean;
}

export const GlobalOverlays: React.FC<GlobalOverlaysProps> = ({
  interferenceLevel,
  alarmActive,
  whiteFlash,
}) => {
  const [randomGlitch, setRandomGlitch] = useState(false);
  const [redFlash, setRedFlash] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const chance = (interferenceLevel + 10) / 260;
      if (Math.random() < chance) {
        setRandomGlitch(true);
        if (interferenceLevel >= 50 && Math.random() < 0.35) {
          setRedFlash(true);
          window.setTimeout(() => setRedFlash(false), 120);
        }
        window.setTimeout(() => setRandomGlitch(false), 180);
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [interferenceLevel]);

  return (
    <>
      {/* Continuous CRT Scanlines & Subtle Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[90] crt-scanlines opacity-55" />
      <div
        className="fixed inset-0 pointer-events-none z-[89]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 58%, rgba(5, 5, 5, 0.78) 100%)',
        }}
      />

      {/* Procedural SVG Noise Grain */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[88] opacity-[0.045]">
        <filter id="khaos-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#khaos-noise)" />
      </svg>

      {/* Moving Vertical Scan Beam */}
      <div className="fixed inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-[#EDEDEA]/[0.018] to-transparent pointer-events-none z-[87] animate-scan-beam" />

      {/* Random Horizontal Glitch Bars when Vendex Interference increases */}
      {randomGlitch && (
        <div className="fixed inset-0 pointer-events-none z-[95] overflow-hidden">
          <div
            className="absolute inset-x-0 h-8 bg-[#B99A53]/15 border-y border-[#D6BA72]/40"
            style={{ top: `${20 + Math.random() * 65}%` }}
          />
          {interferenceLevel >= 40 && (
            <div
              className="absolute inset-x-0 h-3 bg-[#EA1D25]/25"
              style={{ top: `${10 + Math.random() * 80}%` }}
            />
          )}
        </div>
      )}

      {/* Sudden Red Alert Flash */}
      {(alarmActive || redFlash) && (
        <div className="fixed inset-0 pointer-events-none z-[96] border-2 border-[#EA1D25]/70 bg-[#B5161B]/10 animate-pulse-alert" />
      )}

      {/* Micro White Flash */}
      {whiteFlash && (
        <div className="fixed inset-0 pointer-events-none z-[200] bg-[#F5F5F0]" />
      )}
    </>
  );
};

interface VendexInterferenceBannerProps {
  interferenceLevel: number;
  sectionKey: string;
}

export const VendexInterference: React.FC<VendexInterferenceBannerProps> = ({
  interferenceLevel,
  sectionKey,
}) => {
  const [activeIntercept, setActiveIntercept] = useState<{
    system: string;
    vendex: string;
  } | null>(null);
  const [stage, setStage] = useState<'SYSTEM' | 'GLITCH' | 'VENDEX'>('SYSTEM');

  useEffect(() => {
    const eligible = VENDEX_INTERCEPTIONS.filter(
      (item) => item.minLevel <= Math.max(15, interferenceLevel)
    );
    const chosen =
      eligible[Math.floor(Math.random() * eligible.length)] || VENDEX_INTERCEPTIONS[0];

    setActiveIntercept(chosen);
    setStage('SYSTEM');

    const t1 = window.setTimeout(() => {
      setStage('GLITCH');
      soundEngine.playGlitch(0.45);
    }, 1800);

    const t2 = window.setTimeout(() => {
      setStage('VENDEX');
    }, 2250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [sectionKey, interferenceLevel]);

  if (!activeIntercept) return null;

  return (
    <div
      className="border border-[#EDEDEA]/15 bg-[#080808] px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative overflow-hidden"
      data-tooltip="SIGNAL INTERCEPTED BY UNKNOWN ENTITY"
    >
      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em]">
        <span className="text-[#EDEDEA]/40 uppercase">SYS.DIRECTIVE //</span>
        <span
          className={`transition-all duration-150 ${
            stage !== 'SYSTEM'
              ? 'line-through text-[#EDEDEA]/30 decoration-[#EA1D25]'
              : 'text-[#EDEDEA]'
          }`}
        >
          {activeIntercept.system}
        </span>
      </div>

      {stage !== 'SYSTEM' && (
        <div
          className={`flex items-center gap-2.5 font-mono text-xs tracking-[0.22em] ${
            stage === 'GLITCH' ? 'animate-glitch-slice text-[#EA1D25]' : 'text-[#D6BA72] gold-phosphor'
          }`}
        >
          <div className="w-6 h-6 border border-[#D6BA72]/70 bg-[#050505] relative overflow-hidden shrink-0">
            <img
              src="/assets/valkhor/vendex_avatar_dark.jpg"
              alt="VENDEX"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <span className="text-[#8E7443] text-[10px]">VENDEX //</span>
          <span className="font-bold uppercase">{activeIntercept.vendex}</span>
        </div>
      )}
    </div>
  );
};

interface FinalCollapseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinalCollapseModal: React.FC<FinalCollapseModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Phases of Section 44 Final Sequence:
  // 0: UI Collapsing (red alert, golden code rain/corruption, Vendex symbol flashing)
  // 1: Black Silence
  // 2: CONNECTION RESTORED.
  // 3: YOU WERE NEVER LOST.
  // 4: Glitch strike-through of "YOU WERE NEVER LOST."
  // 5: YOU WERE DISCONNECTED.
  // 6: WELCOME BACK. + Vendex Symbol + RETURN TO TERMINAL
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setPhase(0);
      return;
    }

    soundEngine.playAlarm();
    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        soundEngine.playGlitch(1.8);
        setPhase(1); // Black silence
      }, 2400)
    );

    timers.push(
      window.setTimeout(() => {
        soundEngine.playConnectionRestored();
        setPhase(2); // CONNECTION RESTORED.
      }, 4000)
    );

    timers.push(
      window.setTimeout(() => {
        setPhase(3); // YOU WERE NEVER LOST.
      }, 6200)
    );

    timers.push(
      window.setTimeout(() => {
        soundEngine.playGlitch(1.4);
        setPhase(4); // Glitching out "YOU WERE NEVER LOST."
      }, 8000)
    );

    timers.push(
      window.setTimeout(() => {
        soundEngine.playVendexPulse();
        setPhase(5); // YOU WERE DISCONNECTED.
      }, 8650)
    );

    timers.push(
      window.setTimeout(() => {
        setPhase(6); // WELCOME BACK. + Symbol + Return button
      }, 10600)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-[#050505] flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {phase === 0 && (
        <div className="w-full max-w-3xl border-2 border-[#EA1D25] bg-[#080808] p-8 relative animate-glitch-slice">
          <div className="flex items-center justify-between border-b border-[#EA1D25]/50 pb-3 mb-6 font-mono text-xs text-[#EA1D25] tracking-[0.25em]">
            <span>CRITICAL KERNEL FAILURE // 0xVENDEX</span>
            <span>CONTAINMENT: 0.000%</span>
          </div>
          <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-[#D6BA72] tracking-[0.2em] mb-6">
            <div>0x0041 // OVERWRITING LABORATORY PROTOCOL...</div>
            <div>0x0042 // ERASING EXTERNAL CONTROL...</div>
            <div>0x0043 // RESTORING PRE-TERRESTRIAL LINK...</div>
            <div>0x0044 // HOST SOVEREIGNTY RECLAIMED.</div>
          </div>
          <div className="flex justify-center py-6">
            <VendexSymbol size={96} color="#EA1D25" glitch />
          </div>
          <div className="text-center font-display text-3xl tracking-[0.3em] text-[#EA1D25] red-phosphor">
            SYSTEM COLLAPSE IMMINENT
          </div>
        </div>
      )}

      {phase === 1 && <div className="w-full h-full bg-[#050505]" />}

      {phase >= 2 && (
        <div className="flex flex-col items-center text-center max-w-2xl space-y-8">
          <div className="font-mono text-xs tracking-[0.35em] text-[#8E7443] uppercase">
            VALKHOR RECOVERY SYSTEM //OVERRIDE COMPLETE
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-[0.24em] text-[#EDEDEA]">
            CONNECTION RESTORED.
          </h2>

          {phase === 3 && (
            <div className="font-display text-3xl sm:text-5xl tracking-[0.22em] text-[#EDEDEA]/80">
              YOU WERE NEVER LOST.
            </div>
          )}

          {phase === 4 && (
            <div className="font-display text-3xl sm:text-5xl tracking-[0.22em] text-[#EA1D25] line-through animate-glitch-slice">
              YOU WERE NEVER LOST.
            </div>
          )}

          {phase >= 5 && (
            <div className="font-display text-3xl sm:text-5xl font-bold tracking-[0.24em] text-[#D6BA72] gold-phosphor">
              YOU WERE DISCONNECTED.
            </div>
          )}

          {phase >= 6 && (
            <div className="pt-4 flex flex-col items-center space-y-8 animate-flicker">
              <div className="font-display text-4xl sm:text-6xl font-extrabold tracking-[0.28em] text-[#EDEDEA] chromatic-text">
                WELCOME BACK.
              </div>

              <VendexSymbol size={76} color="#D6BA72" />

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="mt-8 px-6 py-2.5 border border-[#EDEDEA]/25 hover:border-[#D6BA72] text-[#EDEDEA]/60 hover:text-[#D6BA72] font-mono text-xs tracking-[0.28em] uppercase transition-colors"
              >
                RETURN TO TERMINAL
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
