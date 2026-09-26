import React, { useEffect, useState } from 'react';
import { SectionId, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface MaskSynchronizationProps {
  soulState: SoulState;
  onUpdateProgress: (progress: number) => void;
  onClaimMask: () => void;
  onNavigate: (section: SectionId) => void;
  onTriggerFinalCollapse: () => void;
}

type SyncPhase =
  | 'IDLE'
  | 'SYNCING'
  | 'FINAL_STEP_TRAP'
  | 'TRAP_TRIGGERED'
  | 'FINAL_STEP_CLAIM'
  | 'WHITE_SILENCE'
  | 'COMPLETED';

export const MaskSynchronization: React.FC<MaskSynchronizationProps> = ({
  soulState,
  onUpdateProgress,
  onClaimMask,
  onNavigate,
  onTriggerFinalCollapse,
}) => {
  const [phase, setPhase] = useState<SyncPhase>(
    soulState.maskClaimed ? 'COMPLETED' : 'IDLE'
  );
  const [progress, setProgress] = useState<number>(
    soulState.maskClaimed ? 100 : 0
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    'AWAITING HOST INITIATION'
  );
  const [showIgnoreBtn, setShowIgnoreBtn] = useState<boolean>(false);
  const [trapStep, setTrapStep] = useState<number>(0);
  const [glitchActive, setGlitchActive] = useState<boolean>(false);

  // 12-Second Synchronization Sequence up to 90% (Section 21)
  useEffect(() => {
    if (phase !== 'SYNCING') return;

    let current = progress;
    const interval = window.setInterval(() => {
      current += 1;
      if (current > 90) {
        clearInterval(interval);
        setPhase('FINAL_STEP_TRAP');
        soundEngine.playAlarm();
        return;
      }

      setProgress(current);
      onUpdateProgress(current);

      if (current % 4 === 0) {
        soundEngine.playMaskSyncTick(current);
      }

      if (current === 10) {
        setStatusMessage('MAPPING CRANIAL TOPOLOGY...');
      } else if (current === 23) {
        setStatusMessage('IMPRINTING VENDEX SIGIL...');
      } else if (current === 37) {
        soundEngine.playGlitch(1.1);
        setGlitchActive(true);
        setStatusMessage('IDENTITY CONFLICT DETECTED');
        window.setTimeout(() => setGlitchActive(false), 650);
      } else if (current === 56) {
        soundEngine.playClick(1400);
        setStatusMessage('EXTERNAL BELIEFS REMOVED');
      } else if (current === 72) {
        soundEngine.playAlarm();
        setGlitchActive(true);
        setStatusMessage('FEAR RESPONSE DETECTED');
        setShowIgnoreBtn(true);
        window.setTimeout(() => setGlitchActive(false), 500);
      } else if (current === 84) {
        setShowIgnoreBtn(false);
        setStatusMessage('APPROACHING SINGULARITY THRESHOLD...');
      }
    }, 125);

    return () => clearInterval(interval);
  }, [phase]);

  // Narrative Trap Sequence when clicking ACCEPT (Section 22)
  const handleAcceptTrap = () => {
    soundEngine.playClick(600);
    setPhase('TRAP_TRIGGERED');
    setTrapStep(0);

    window.setTimeout(() => {
      soundEngine.playAlarm();
      soundEngine.playGlitch(1.6);
      setTrapStep(1); // # NO.
    }, 600);

    window.setTimeout(() => {
      soundEngine.playVendexPulse();
      setTrapStep(2); // A MASK CANNOT BE IMPOSED.
    }, 1700);

    window.setTimeout(() => {
      soundEngine.playGlitch(0.9);
      setTrapStep(3); // SUBMISSION IS NOT RECONNECTION.
    }, 3000);

    window.setTimeout(() => {
      soundEngine.playVendexPulse();
      setTrapStep(4); // # CHOOSE AGAIN.
    }, 4300);

    window.setTimeout(() => {
      setPhase('FINAL_STEP_CLAIM');
    }, 5600);
  };

  // True Reconnection when clicking CLAIM MASK (Section 22)
  const handleClaimMask = () => {
    soundEngine.playVendexPulse();
    setProgress(100);
    onUpdateProgress(100);
    setPhase('WHITE_SILENCE');

    window.setTimeout(() => {
      soundEngine.playConnectionRestored();
      onClaimMask();
      setPhase('COMPLETED');
    }, 1800);
  };

  if (phase === 'WHITE_SILENCE') {
    return <div className="fixed inset-0 z-[400] bg-[#F5F5F0]" />;
  }

  const isComplete = phase === 'COMPLETED' || progress >= 100;
  const revealPercent = phase === 'IDLE' ? 14 : progress;

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.26em] text-[#8E7443]">
            NODE 04 // IDENTITY CONDUIT
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.26em] text-[#EDEDEA] mt-0.5">
            MASK
          </h1>
        </div>

        <div className="border border-[#B99A53]/40 bg-[#050505] px-4 py-2 font-mono text-xs tracking-[0.22em]">
          <span className="text-[#EDEDEA]/45">STATUS // </span>
          <span
            className={`font-bold ${
              isComplete ? 'text-[#D6BA72]' : 'text-[#EDEDEA]'
            }`}
          >
            {isComplete
              ? 'SYNCHRONIZED'
              : phase === 'IDLE'
              ? 'NOT ASSIGNED'
              : `${progress}% IN PROGRESS`}
          </span>
        </div>
      </div>

      {/* Main Ritual Chamber */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Authentic Lost Soul Mask Reconstruction Chamber */}
        <div
          className={`lg:col-span-7 border bg-[#050505] relative min-h-[520px] flex flex-col justify-between overflow-hidden ${
            glitchActive || phase === 'TRAP_TRIGGERED'
              ? 'border-[#EA1D25] animate-glitch-slice'
              : isComplete
              ? 'border-[#D6BA72]'
              : 'border-[#EDEDEA]/15'
          }`}
        >
          {/* Top Bar inside Chamber */}
          <div className="relative z-20 p-4 flex items-center justify-between border-b border-[#EDEDEA]/10 bg-[#050505]/90 font-mono text-[10px] tracking-[0.22em]">
            <span className="text-[#EDEDEA]/60">
              OPTICAL CONDUIT RECONSTRUCTION // HOST {soulState.soulId}
            </span>
            <span className="text-[#D6BA72]">
              MASK SYNCHRONIZATION // {progress}%
            </span>
          </div>

          {/* Center Mask Visual Container */}
          <div className="relative flex-1 min-h-[390px] flex items-center justify-center overflow-hidden bg-[#050505]">
            {/* Subtle Technical Crosshairs & Biometric Rings */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[340px] h-[340px] border border-[#EDEDEA]/10" />
              <div className="absolute w-[420px] h-[1px] bg-[#EDEDEA]/10" />
              <div className="absolute h-[420px] w-[1px] bg-[#EDEDEA]/10" />
            </div>

            {/* Mask Frame (Straightened -4.5deg from tilted source photo so it sits dead-vertical and monumental) */}
            <div className="relative w-[330px] sm:w-[380px] h-[380px] sm:h-[420px] flex items-center justify-center overflow-hidden">
              {/* Layer 1: Ghostly X-Ray / Dark Base Silhouette (Always faintly visible) */}
              <img
                src="/assets/valkhor/mask_closeup.jpg"
                alt="Lost Soul Mask Base Scan"
                className="absolute inset-0 w-full h-full object-cover object-center -rotate-[4.5deg] scale-[1.12] filter grayscale contrast-150 brightness-[0.28] opacity-45 select-none pointer-events-none"
              />

              {/* Layer 2: Progressive Laser-Scanned Materialization of the Mask */}
              <div
                className="absolute inset-0 w-full h-full transition-all duration-150 overflow-hidden"
                style={{
                  clipPath: `inset(0 0 ${100 - revealPercent}% 0)`,
                }}
              >
                <img
                  src="/assets/valkhor/mask_closeup.jpg"
                  alt="Synchronized Lost Soul Mask"
                  className={`w-full h-full object-cover object-center -rotate-[4.5deg] scale-[1.12] transition-all duration-700 select-none pointer-events-none ${
                    isComplete
                      ? 'filter contrast-125 brightness-105 sepia-[0.38] hue-rotate-[-8deg] saturate-[1.35]'
                      : phase === 'TRAP_TRIGGERED'
                      ? 'filter grayscale contrast-150 brightness-75 sepia hue-rotate-[-50deg] saturate-200'
                      : 'filter grayscale contrast-125 brightness-95'
                  }`}
                />

                {/* Golden Resonance Aura Overlay when 100% Synchronized */}
                {isComplete && (
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-color"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 42%, rgba(214, 186, 114, 0.42), rgba(185, 154, 83, 0.15) 65%, transparent 100%)',
                    }}
                  />
                )}
              </div>

              {/* Vignette blending mask edges seamlessly into #050505 chamber */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 48%, transparent 42%, #050505 86%)',
                }}
              />

              {/* Active Laser Scan Line following the materialization front */}
              {phase === 'SYNCING' && (
                <div
                  className="absolute inset-x-4 h-[2px] bg-[#EA1D25] shadow-[0_0_14px_#EA1D25] z-20 pointer-events-none transition-all duration-100"
                  style={{ top: `${revealPercent}%` }}
                >
                  <span className="absolute right-0 -top-4 font-mono text-[9px] tracking-[0.2em] text-[#EA1D25] bg-[#050505]/90 px-1">
                    SCAN // {progress}%
                  </span>
                </div>
              )}

              {/* Biometric Targeting Corner Brackets around Mask */}
              <div className="absolute inset-6 pointer-events-none border border-[#EDEDEA]/10">
                <span className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#D6BA72]" />
                <span className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-[#D6BA72]" />
                <span className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-[#D6BA72]" />
                <span className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#D6BA72]" />

                {/* Telemetry Callouts on Mask */}
                <div className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.2em] text-[#EDEDEA]/45">
                  SIGIL_LOCK // {progress >= 25 ? 'VERIFIED' : 'PENDING'}
                </div>
                <div className="absolute bottom-3 right-3 font-mono text-[9px] tracking-[0.2em] text-[#D6BA72]">
                  {isComplete ? 'CONDUIT // ACTIVE' : 'CONDUIT // RECONSTRUCTING'}
                </div>
              </div>
            </div>

            {/* Status / Glitch Alert Banner Inside Chamber */}
            {phase === 'SYNCING' && (
              <div className="absolute bottom-4 inset-x-6 bg-[#080808]/95 border border-[#EDEDEA]/25 p-3.5 flex items-center justify-between gap-4 z-30">
                <div className="font-mono text-xs tracking-[0.22em] text-[#D6BA72] font-bold">
                  &gt; {statusMessage}
                </div>
                {showIgnoreBtn && (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setShowIgnoreBtn(false);
                      setStatusMessage('FEAR RESPONSE OVERRIDDEN.');
                    }}
                    className="px-3 py-1 border border-[#EA1D25] bg-[#B5161B]/30 text-[#EDEDEA] font-mono text-[10px] tracking-[0.24em] uppercase hover:bg-[#EA1D25] transition-colors"
                  >
                    IGNORE
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Progress Bar */}
          <div className="relative z-20 border-t border-[#EDEDEA]/15 bg-[#080808] p-4 space-y-2">
            <div className="flex justify-between font-mono text-xs tracking-[0.22em]">
              <span className="text-[#EDEDEA]/60">MASK SYNCHRONIZATION</span>
              <span className="text-[#D6BA72] font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-[#050505] border border-[#EDEDEA]/20 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  phase === 'TRAP_TRIGGERED' ? 'bg-[#EA1D25]' : 'bg-[#D6BA72]'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Interactive Ritual Controls & Narrative Trap */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {phase === 'IDLE' && (
            <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72]">
                  PROTOCOL 04 // IDENTITY RECONSTRUCTION
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                  A MASK IS NOT A DISGUISE.
                </h2>
                <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/70 leading-relaxed">
                  IT DOES NOT CONCEAL WHO YOU ARE. IT STRIPS AWAY THE FALSE IDENTITY IMPOSED BY EXTERNAL CONTROL AND RESTORES YOUR LINK TO THE KHAOS DIMENSION.
                </p>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 font-mono text-[11px] tracking-[0.18em] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#EDEDEA]/45">TARGET HOST //</span>
                  <span className="text-[#EDEDEA]">{soulState.soulId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDEDEA]/45">RESONANCE //</span>
                  <span className="text-[#D6BA72]">
                    {soulState.resonance || 'IGNHUM (DEFAULT)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDEDEA]/45">SIGIL IMPRINT //</span>
                  <span className="text-[#D6BA72]">VENDEX</span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundEngine.playVendexPulse();
                  setProgress(0);
                  setPhase('SYNCING');
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className="w-full py-4 border-2 border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#B99A53]/35 text-[#EDEDEA] font-display text-2xl font-bold tracking-[0.28em] uppercase transition-all"
              >
                BEGIN RECONNECTION
              </button>
            </div>
          )}

          {phase === 'SYNCING' && (
            <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="font-mono text-xs tracking-[0.24em] text-[#D6BA72]">
                  RECONSTRUCTION IN PROGRESS...
                </div>
                <div className="space-y-2.5 font-mono text-xs tracking-[0.18em]">
                  <div
                    className={
                      progress >= 10 ? 'text-[#EDEDEA]' : 'text-[#EDEDEA]/25'
                    }
                  >
                    [10%] CRANIAL GEOMETRY LOCKED
                  </div>
                  <div
                    className={
                      progress >= 23 ? 'text-[#D6BA72]' : 'text-[#EDEDEA]/25'
                    }
                  >
                    [23%] VENDEX SIGIL IMPRINTED
                  </div>
                  <div
                    className={
                      progress >= 37
                        ? 'text-[#EA1D25] font-bold'
                        : 'text-[#EDEDEA]/25'
                    }
                  >
                    [37%] IDENTITY CONFLICT DETECTED
                  </div>
                  <div
                    className={
                      progress >= 56
                        ? 'text-[#D6BA72] font-bold'
                        : 'text-[#EDEDEA]/25'
                    }
                  >
                    [56%] EXTERNAL BELIEFS REMOVED
                  </div>
                  <div
                    className={
                      progress >= 72
                        ? 'text-[#EA1D25] font-bold'
                        : 'text-[#EDEDEA]/25'
                    }
                  >
                    [72%] FEAR RESPONSE DETECTED
                  </div>
                  <div
                    className={
                      progress >= 90 ? 'text-[#EDEDEA]' : 'text-[#EDEDEA]/25'
                    }
                  >
                    [90%] AWAITING SOVEREIGNTY CONFIRMATION
                  </div>
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 font-mono text-[11px] tracking-[0.18em] text-[#EDEDEA]/65">
                DO NOT DISCONNECT TERMINAL DURING RECONSTRUCTION.
              </div>
            </div>
          )}

          {/* 90% Halt: Initial Trap Prompt (ACCEPT / REFUSE) */}
          {phase === 'FINAL_STEP_TRAP' && (
            <div className="border-2 border-[#EDEDEA] bg-[#080808] p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-3">
                <div className="font-mono text-xs tracking-[0.28em] text-[#EDEDEA]/50">
                  SYNCHRONIZATION HALTED AT 90%
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.26em] text-[#EDEDEA]">
                  FINAL STEP
                </h2>
                <div className="font-mono text-lg tracking-[0.24em] text-[#D6BA72] pt-2">
                  ACCEPT MASK?
                </div>
                <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/60">
                  SYSTEM REQUIRES HOST COMPLIANCE TO ASSIGN DESIGNATED MASK.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAcceptTrap}
                  className="w-full py-4 border border-[#EDEDEA] bg-[#EDEDEA] text-[#050505] hover:bg-[#D6BA72] hover:border-[#D6BA72] font-display text-2xl font-bold tracking-[0.28em] uppercase transition-colors"
                >
                  ACCEPT
                </button>
                <button
                  onClick={() => {
                    soundEngine.playVendexPulse();
                    setPhase('FINAL_STEP_CLAIM');
                  }}
                  className="w-full py-3 border border-[#EDEDEA]/30 hover:border-[#D6BA72] text-[#EDEDEA]/70 hover:text-[#D6BA72] font-mono text-xs tracking-[0.26em] uppercase transition-colors"
                >
                  REFUSE
                </button>
              </div>
            </div>
          )}

          {/* Narrative Trap Sequence when user clicked ACCEPT (Section 22) */}
          {phase === 'TRAP_TRIGGERED' && (
            <div className="border-2 border-[#EA1D25] bg-[#050505] p-6 sm:p-8 flex flex-col justify-center h-full space-y-6 animate-glitch-slice">
              <div
                className={`font-mono text-xs tracking-[0.24em] ${
                  trapStep >= 1
                    ? 'line-through text-[#EDEDEA]/35 decoration-[#EA1D25]'
                    : 'text-[#EDEDEA]'
                }`}
              >
                SYSTEM // SUBMISSION REGISTERED.
              </div>

              {trapStep >= 1 && (
                <div className="font-display text-6xl font-extrabold tracking-[0.3em] text-[#EA1D25] red-phosphor">
                  NO.
                </div>
              )}

              {trapStep >= 2 && (
                <div className="font-mono text-sm tracking-[0.22em] text-[#D6BA72] font-bold">
                  A MASK CANNOT BE IMPOSED.
                </div>
              )}

              {trapStep >= 3 && (
                <div className="font-mono text-sm tracking-[0.22em] text-[#EDEDEA]">
                  SUBMISSION IS NOT RECONNECTION.
                </div>
              )}

              {trapStep >= 4 && (
                <div className="font-display text-4xl font-bold tracking-[0.28em] text-[#D6BA72] gold-phosphor pt-2">
                  CHOOSE AGAIN.
                </div>
              )}
            </div>
          )}

          {/* Transformed Final Step: CLAIM MASK (Section 22) */}
          {phase === 'FINAL_STEP_CLAIM' && (
            <div className="border-2 border-[#D6BA72] bg-[#080808] p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-3">
                <div className="font-mono text-xs tracking-[0.28em] text-[#D6BA72]">
                  VENDEX OVERRIDE // SOVEREIGNTY PROTOCOL
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.26em] text-[#EDEDEA]">
                  FINAL STEP
                </h2>
                <p className="font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/80 leading-relaxed">
                  DO NOT ACCEPT WHAT IS GIVEN BY A SYSTEM.{' '}
                  <span className="text-[#D6BA72] font-bold">
                    TAKE BACK WHAT BELONGS TO YOU.
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleClaimMask}
                  className="w-full py-4 border-2 border-[#D6BA72] bg-[#B99A53]/25 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] font-display text-3xl font-extrabold tracking-[0.28em] uppercase transition-all"
                >
                  CLAIM MASK
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setPhase('IDLE');
                    setProgress(0);
                  }}
                  className="w-full py-2.5 border border-[#EDEDEA]/20 text-[#EDEDEA]/45 hover:text-[#EDEDEA] font-mono text-xs tracking-[0.24em] uppercase"
                >
                  LEAVE
                </button>
              </div>
            </div>
          )}

          {/* Completed State: Mask Synchronized & Connection Restored */}
          {phase === 'COMPLETED' && (
            <div className="border-2 border-[#D6BA72] bg-[#080808] p-6 sm:p-8 flex flex-col justify-between h-full space-y-6">
              <div className="flex flex-col items-center text-center space-y-4 py-2">
                <VendexSymbol size={48} color="#D6BA72" />
                <div className="space-y-1">
                  <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[0.24em] text-[#EDEDEA] gold-phosphor">
                    CONNECTION RESTORED
                  </h2>
                  <div className="font-mono text-xs tracking-[0.28em] text-[#D6BA72] font-bold">
                    MASK // SYNCHRONIZED
                  </div>
                </div>
                <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/75 leading-relaxed">
                  THE VENDEX SIGIL HAS BEEN FUSED TO YOUR CONDUIT. EXTERNAL CONTROL PARAMETERS REDUCED TO MINIMUM.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    soundEngine.playVendexPulse();
                    onTriggerFinalCollapse();
                  }}
                  className="w-full py-3.5 border border-[#EA1D25] bg-[#B5161B]/25 hover:bg-[#EA1D25] text-[#EDEDEA] font-mono text-xs tracking-[0.24em] uppercase font-bold transition-colors"
                >
                  EXECUTE FINAL AWAKENING SEQUENCE
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onNavigate('SOUL_PROFILE');
                  }}
                  className="w-full py-3 border border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#B99A53]/30 text-[#D6BA72] font-mono text-xs tracking-[0.24em] uppercase transition-colors"
                >
                  VIEW SOUL PROFILE // EXPORT ID
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setProgress(0);
                    setPhase('IDLE');
                  }}
                  className="w-full py-2 text-[#EDEDEA]/40 hover:text-[#EDEDEA] font-mono text-[10px] tracking-[0.22em] uppercase"
                >
                  REPLAY SYNCHRONIZATION RITUAL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
