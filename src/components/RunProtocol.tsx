import React, { useEffect, useState } from 'react';
import { ResonanceWorld, SectionId, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface RunProtocolProps {
  isActive: boolean;
  soulState: SoulState;
  onAbort: () => void;
  onNavigate: (section: SectionId) => void;
  onApplyDemoState: (partial: Partial<SoulState>) => void;
}

export const RunProtocol: React.FC<RunProtocolProps> = ({
  isActive,
  soulState,
  onAbort,
  onNavigate,
  onApplyDemoState,
}) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    if (!isActive) {
      setElapsedMs(0);
      return;
    }

    const startTime = Date.now();
    soundEngine.playVendexPulse();

    const interval = window.setInterval(() => {
      const diff = Date.now() - startTime;
      setElapsedMs(diff);

      if (diff >= 31500) {
        clearInterval(interval);
        onAbort();
      }
    }, 60);

    // Choreographed timeline actions (Section 32)
    const timers: number[] = [];

    // 00:06 — Soul Status
    timers.push(
      window.setTimeout(() => {
        soundEngine.playClick(1200);
        onNavigate('SOUL_STATUS');
      }, 6000)
    );

    // 00:09 — Valkhor Dimensional Map
    timers.push(
      window.setTimeout(() => {
        soundEngine.playClick(1400);
        onNavigate('VALKHOR');
      }, 9000)
    );

    // 00:12 — Rapid Resonance Test
    timers.push(
      window.setTimeout(() => {
        soundEngine.playGlitch(0.8);
        onNavigate('KHAOS_LINK');
      }, 12000)
    );

    // 00:16 — IGNHUM Result
    timers.push(
      window.setTimeout(() => {
        soundEngine.playVendexPulse();
        onApplyDemoState({
          resonance: 'IGNHUM' as ResonanceWorld,
          khaosConnection: 68,
          vendexInterferenceLevel: 45,
        });
      }, 16000)
    );

    // 00:19 — Mask Synchronization
    timers.push(
      window.setTimeout(() => {
        soundEngine.playClick(1000);
        onNavigate('MASK');
        onApplyDemoState({
          maskSynchronization: 64,
          vendexInterferenceLevel: 65,
        });
      }, 19000)
    );

    // 00:23 — Vendex Interference
    timers.push(
      window.setTimeout(() => {
        soundEngine.playVendexPulse();
        onApplyDemoState({
          maskSynchronization: 90,
          vendexInterferenceLevel: 85,
        });
      }, 23000)
    );

    // 00:26 — System Alarm / Glitch
    timers.push(
      window.setTimeout(() => {
        soundEngine.playAlarm();
        onApplyDemoState({
          vendexInterferenceLevel: 100,
        });
      }, 26000)
    );

    // 00:28 — Golden Mask & Final Awakening
    timers.push(
      window.setTimeout(() => {
        soundEngine.playConnectionRestored();
        onApplyDemoState({
          maskClaimed: true,
          maskSynchronization: 100,
          khaosConnection: 94,
          individualWill: 96,
          externalControl: 4,
          memoryOfValkhor: 89,
          protocolCompleted: true,
        });
      }, 28000)
    );

    return () => {
      clearInterval(interval);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isActive]);

  if (!isActive) return null;

  const seconds = Math.min(30, Math.floor(elapsedMs / 1000));
  const frames = Math.floor((elapsedMs % 1000) / 16.6);
  const timecode = `00:${String(seconds).padStart(2, '0')}:${String(
    frames
  ).padStart(2, '0')}`;

  // Determine active cinematic overlay stage for 00:00-00:06 and 00:12-00:30
  let phaseLabel = 'INITIALIZING KHAOS LINK';
  if (seconds >= 3 && seconds < 6) phaseLabel = 'LOST SOUL DETECTED';
  else if (seconds >= 6 && seconds < 9) phaseLabel = 'BIOMETRIC SOUL STATUS';
  else if (seconds >= 9 && seconds < 12) phaseLabel = 'VALKHOR DIMENSIONAL MAP';
  else if (seconds >= 12 && seconds < 16) phaseLabel = 'RESONANCE ISOLATION';
  else if (seconds >= 16 && seconds < 19) phaseLabel = 'RESONANCE // IGNHUM';
  else if (seconds >= 19 && seconds < 23) phaseLabel = 'MASK SYNCHRONIZATION';
  else if (seconds >= 23 && seconds < 26) phaseLabel = 'VENDEX INTERFERENCE';
  else if (seconds >= 26 && seconds < 28) phaseLabel = 'SYSTEM ALARM // COLLAPSE';
  else if (seconds >= 28) phaseLabel = 'CONNECTION RESTORED';

  const rapidChoices = [
    ['CONTROL', 'FREEDOM', 'FREEDOM'],
    ['ENDURE', 'BURN', 'BURN'],
    ['ORDER', 'INSTINCT', 'INSTINCT'],
    ['SURVIVE', 'TRANSFORM', 'TRANSFORM'],
  ];
  const choiceIdx = Math.min(3, Math.floor(((elapsedMs - 12000) / 4000) * 4));

  return (
    <div className="fixed inset-0 z-[450] pointer-events-auto flex flex-col justify-between p-6 select-none">
      {/* Top Recording HUD Bar */}
      <div className="bg-[#050505]/95 border border-[#D6BA72] px-4 py-2.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 font-mono text-xs tracking-[0.24em]">
          <span className="w-2.5 h-2.5 bg-[#EA1D25] animate-pulse-alert" />
          <span className="text-[#EDEDEA] font-bold">
            RUN PROTOCOL // {timecode}
          </span>
          <span className="hidden sm:inline text-[#D6BA72]">
            [{phaseLabel}]
          </span>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            onAbort();
          }}
          className="px-3.5 py-1 border border-[#EA1D25] bg-[#B5161B]/25 hover:bg-[#EA1D25] text-[#EDEDEA] font-mono text-[10px] tracking-[0.24em] uppercase transition-colors"
        >
          ABORT PROTOCOL
        </button>
      </div>

      {/* Stage-Specific Full/Center Overlays */}
      <div className="my-auto flex items-center justify-center pointer-events-none">
        {/* 00:00–00:03: Loading / Khaos Connection */}
        {seconds < 3 && (
          <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center space-y-6 z-[-1]">
            <VendexSymbol size={48} color="#EDEDEA" abstractStage={1} glitch />
            <div className="text-center space-y-2">
              <div className="font-display text-4xl sm:text-6xl font-bold tracking-[0.28em] text-[#EDEDEA]">
                KHAOS DIMENSION LINK
              </div>
              <div className="font-mono text-xs tracking-[0.28em] text-[#EA1D25]">
                STATUS: UNSTABLE // LOCATING CONSCIOUSNESS...
              </div>
            </div>
          </div>
        )}

        {/* 00:03–00:06: Soul Detected */}
        {seconds >= 3 && seconds < 6 && (
          <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center space-y-6 z-[-1] animate-glitch-slice">
            <VendexSymbol size={68} color="#D6BA72" />
            <div className="text-center space-y-3">
              <div className="font-mono text-xs tracking-[0.32em] text-[#D6BA72]">
                HOST LOCATED // {soulState.soulId}
              </div>
              <div className="font-display text-5xl sm:text-7xl font-extrabold tracking-[0.26em] text-[#EDEDEA] chromatic-text">
                YOU HAVE BEEN HERE BEFORE.
              </div>
              <div className="font-mono text-sm tracking-[0.28em] text-[#EA1D25] font-bold">
                VENDEX HAS ENTERED THE SYSTEM
              </div>
            </div>
          </div>
        )}

        {/* 00:12–00:16: Rapid Resonance Test */}
        {seconds >= 12 && seconds < 16 && (
          <div className="bg-[#050505]/95 border-2 border-[#EDEDEA] p-8 sm:p-12 max-w-2xl w-full text-center space-y-6 shadow-2xl">
            <div className="font-mono text-xs tracking-[0.3em] text-[#D6BA72]">
              RAPID RESONANCE ISOLATION // STEP 0{choiceIdx + 1}
            </div>
            <div className="font-display text-4xl font-bold tracking-[0.3em] text-[#EDEDEA]">
              CHOOSE.
            </div>
            <div className="grid grid-cols-2 gap-6 pt-2">
              <div
                className={`p-6 border font-display text-3xl font-bold tracking-[0.24em] ${
                  rapidChoices[choiceIdx][2] === rapidChoices[choiceIdx][0]
                    ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                    : 'border-[#EDEDEA]/20 text-[#EDEDEA]/40'
                }`}
              >
                {rapidChoices[choiceIdx][0]}
              </div>
              <div
                className={`p-6 border font-display text-3xl font-bold tracking-[0.24em] ${
                  rapidChoices[choiceIdx][2] === rapidChoices[choiceIdx][1]
                    ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                    : 'border-[#EDEDEA]/20 text-[#EDEDEA]/40'
                }`}
              >
                {rapidChoices[choiceIdx][1]}
              </div>
            </div>
          </div>
        )}

        {/* 00:16–00:19: Resultado IGNHUM */}
        {seconds >= 16 && seconds < 19 && (
          <div className="bg-[#050505]/95 border-2 border-[#EA1D25] p-8 sm:p-12 max-w-2xl w-full text-center space-y-4 shadow-2xl animate-glitch-slice">
            <div className="font-mono text-xs tracking-[0.32em] text-[#D6BA72]">
              RESONANCE FOUND
            </div>
            <div className="font-display text-6xl sm:text-8xl font-extrabold tracking-[0.28em] text-[#EA1D25] red-phosphor">
              IGNHUM
            </div>
            <div className="font-mono text-xs tracking-[0.24em] text-[#EDEDEA]">
              PRIMARY FORCE // PASSION — KHAOS RESONANCE // 87%
            </div>
            <div className="font-mono text-sm tracking-[0.22em] text-[#D6BA72] font-bold pt-2">
              YOU DO NOT CONTAIN THE FIRE. YOU GIVE IT DIRECTION.
            </div>
          </div>
        )}

        {/* 00:23–00:26: Vendex Interference */}
        {seconds >= 23 && seconds < 26 && (
          <div className="bg-[#050505]/95 border-2 border-[#D6BA72] p-8 sm:p-12 max-w-2xl w-full text-center space-y-4 shadow-2xl animate-glitch-slice">
            <div className="font-mono text-xs tracking-[0.28em] line-through text-[#EDEDEA]/35 decoration-[#EA1D25]">
              SYSTEM // SUBMISSION REGISTERED.
            </div>
            <div className="font-display text-6xl font-extrabold tracking-[0.3em] text-[#EA1D25]">
              NO.
            </div>
            <div className="font-mono text-sm tracking-[0.24em] text-[#D6BA72] font-bold">
              A MASK CANNOT BE IMPOSED. SUBMISSION IS NOT RECONNECTION.
            </div>
            <div className="font-display text-4xl font-bold tracking-[0.28em] text-[#EDEDEA] pt-2">
              CLAIM MASK.
            </div>
          </div>
        )}

        {/* 00:26–00:28: System Alarm / Glitch */}
        {seconds >= 26 && seconds < 28 && (
          <div className="fixed inset-0 bg-[#B5161B]/25 border-4 border-[#EA1D25] flex flex-col items-center justify-center space-y-4 z-[-1] animate-glitch-slice">
            <VendexSymbol size={92} color="#EA1D25" glitch />
            <div className="font-display text-5xl sm:text-7xl font-extrabold tracking-[0.3em] text-[#EA1D25] bg-[#050505] px-8 py-4 border border-[#EA1D25]">
              SYSTEM OVERRIDE // 100%
            </div>
          </div>
        )}

        {/* 00:28–00:30: Golden Mask + CONNECTION RESTORED + WELCOME BACK */}
        {seconds >= 28 && (
          <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center space-y-6 z-[-1]">
            <VendexSymbol size={88} color="#D6BA72" />
            <div className="text-center space-y-3">
              <div className="font-display text-5xl sm:text-7xl font-extrabold tracking-[0.26em] text-[#D6BA72] gold-phosphor">
                CONNECTION RESTORED.
              </div>
              {elapsedMs >= 29000 && (
                <div className="font-display text-4xl sm:text-6xl font-bold tracking-[0.3em] text-[#EDEDEA] chromatic-text">
                  WELCOME BACK.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Progress Timeline Bar */}
      <div className="bg-[#050505]/95 border border-[#EDEDEA]/20 p-3 space-y-1.5">
        <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/60">
          <span>AUTOMATED PROTOCOL CAPTURE</span>
          <span>{Math.min(100, Math.round((elapsedMs / 30000) * 100))}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#EDEDEA]/10 overflow-hidden">
          <div
            className="h-full bg-[#D6BA72] transition-all duration-75"
            style={{ width: `${Math.min(100, (elapsedMs / 30000) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
