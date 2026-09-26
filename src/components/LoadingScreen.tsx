import React, { useEffect, useState } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface LoadingScreenProps {
  soulId: string;
  isReturningUser: boolean;
  onComplete: () => void;
  onResetState?: () => void;
}

const SEQUENCE_STEPS = [
  { delay: 300, text: 'Locating consciousness...', tone: 'normal' },
  { delay: 950, text: 'Detecting biological host...', tone: 'normal' },
  { delay: 1650, text: 'HOST LOCATED.', tone: 'white' },
  { delay: 2300, text: 'Searching for Valkhor signature...', tone: 'normal' },
  { delay: 2950, text: 'SIGNAL FOUND.', tone: 'gold' },
  { delay: 3550, text: 'Determining origin...', tone: 'normal' },
  { delay: 4150, text: 'ERROR: MEMORY CORRUPTED.', tone: 'red' },
  { delay: 4800, text: 'Searching pre-terrestrial records...', tone: 'normal' },
  { delay: 5750, text: 'MATCH FOUND.', tone: 'gold' },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  soulId,
  isReturningUser,
  onComplete,
  onResetState,
}) => {
  const [returningPrompt, setReturningPrompt] = useState(isReturningUser);
  const [returningStage, setReturningStage] = useState(0);

  const [visibleLogs, setVisibleLogs] = useState<typeof SEQUENCE_STEPS>([]);
  const [phase, setPhase] = useState<
    'LOGS' | 'BEEN_HERE' | 'UNKNOWN_ENTITY' | 'VENDEX_ENTERED' | 'FLASH'
  >('LOGS');
  const [canSkip, setCanSkip] = useState(false);
  const [symbolStage, setSymbolStage] = useState<0 | 1 | 2>(0);

  // Returning user short sequence (Section 35)
  useEffect(() => {
    if (!returningPrompt) return;
    const t1 = window.setTimeout(() => setReturningStage(1), 700);
    const t2 = window.setTimeout(() => setReturningStage(2), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [returningPrompt]);

  // Main Initialization Sequence (Section 9)
  useEffect(() => {
    if (returningPrompt) return;

    const timers: number[] = [];

    // Enable skip after 2 seconds
    timers.push(window.setTimeout(() => setCanSkip(true), 2000));

    // Sequential log lines
    SEQUENCE_STEPS.forEach((step) => {
      timers.push(
        window.setTimeout(() => {
          setVisibleLogs((prev) => [...prev, step]);
          if (step.tone === 'red') {
            soundEngine.playGlitch(0.8);
          } else {
            soundEngine.playClick(1000);
          }
        }, step.delay)
      );
    });

    // Progress geometric symbol from tiny seed to full Vendex sigil
    timers.push(window.setTimeout(() => setSymbolStage(1), 3200));
    timers.push(window.setTimeout(() => setSymbolStage(2), 5750));

    // Climax messages
    timers.push(
      window.setTimeout(() => {
        soundEngine.playGlitch(0.9);
        setPhase('BEEN_HERE');
      }, 6250)
    );

    timers.push(
      window.setTimeout(() => {
        soundEngine.playAlarm();
        setPhase('UNKNOWN_ENTITY');
      }, 7050)
    );

    timers.push(
      window.setTimeout(() => {
        soundEngine.playVendexPulse();
        setPhase('VENDEX_ENTERED');
      }, 7700)
    );

    timers.push(
      window.setTimeout(() => {
        setPhase('FLASH');
      }, 8500)
    );

    timers.push(
      window.setTimeout(() => {
        onComplete();
      }, 8680)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, [returningPrompt, onComplete]);

  if (returningPrompt) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#050505] flex flex-col items-center justify-center p-6 select-none">
        <div className="max-w-lg w-full border border-[#EDEDEA]/20 bg-[#080808] p-8 flex flex-col items-center text-center space-y-6">
          <VendexSymbol size={42} color="#B99A53" />

          <div className="font-mono text-xs tracking-[0.28em] text-[#8E7443] uppercase">
            KHAOS DIMENSION LINK // ACTIVE TRACE
          </div>

          <div className="space-y-3 min-h-[72px] flex flex-col justify-center">
            <div className="font-mono text-sm tracking-[0.24em] text-[#EDEDEA]">
              PREVIOUS SIGNAL DETECTED.
            </div>
            {returningStage >= 1 && (
              <div className="font-display text-3xl sm:text-4xl font-bold tracking-[0.22em] text-[#D6BA72] gold-phosphor animate-flicker">
                WELCOME BACK, {soulId}.
              </div>
            )}
          </div>

          {returningStage >= 2 && (
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onComplete();
                }}
                className="w-full py-3 border border-[#D6BA72] bg-[#B99A53]/10 hover:bg-[#B99A53]/25 text-[#EDEDEA] font-mono text-xs tracking-[0.25em] uppercase transition-colors"
              >
                ENTER TERMINAL
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick(700);
                  if (onResetState) onResetState();
                  setReturningPrompt(false);
                }}
                className="w-full py-3 border border-[#EDEDEA]/20 hover:border-[#EDEDEA]/50 text-[#EDEDEA]/60 hover:text-[#EDEDEA] font-mono text-xs tracking-[0.22em] uppercase transition-colors"
              >
                RE-INITIALIZE LINK
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'FLASH') {
    return <div className="fixed inset-0 z-[400] bg-[#F5F5F0]" />;
  }

  return (
    <div className="fixed inset-0 z-[300] bg-[#050505] flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden">
      {/* Top Diagnostic Bar */}
      <div className="flex items-start justify-between border-b border-[#EDEDEA]/15 pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-[0.26em] text-[#EDEDEA]">
            KHAOS DIMENSION LINK
          </h1>
          <div className="flex items-center gap-2 mt-1 font-mono text-xs tracking-[0.22em] text-[#EA1D25]">
            <span className="w-1.5 h-1.5 bg-[#EA1D25] animate-pulse-alert" />
            <span>STATUS: UNSTABLE</span>
          </div>
        </div>

        <div className="text-right font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/45 hidden sm:block">
          <div>VALKHOR RECOVERY SYSTEM // KERNEL 0.94</div>
          <div>FREQ: 43.2008 HZ // INTERDIMENSIONAL</div>
        </div>
      </div>

      {/* Center Minimal Geometric Element / Emerging Vendex Symbol & Climax Prompts */}
      <div className="my-auto flex flex-col items-center justify-center relative py-8">
        <div
          className={`transition-all duration-300 mb-10 ${
            phase === 'UNKNOWN_ENTITY' || phase === 'VENDEX_ENTERED'
              ? 'scale-125 animate-glitch-slice'
              : ''
          }`}
        >
          <VendexSymbol
            size={symbolStage === 0 ? 22 : symbolStage === 1 ? 38 : 64}
            color={
              phase === 'UNKNOWN_ENTITY'
                ? '#EA1D25'
                : phase === 'VENDEX_ENTERED'
                ? '#D6BA72'
                : '#EDEDEA'
            }
            abstractStage={symbolStage}
            glitch={phase !== 'LOGS'}
          />
        </div>

        {/* Sequential Terminal Log Window */}
        {phase === 'LOGS' && (
          <div className="w-full max-w-md border border-[#EDEDEA]/15 bg-[#080808]/90 p-5 font-mono text-xs space-y-2 min-h-[230px]">
            {visibleLogs.map((log, i) => (
              <div
                key={i}
                className={`tracking-[0.18em] flex items-center gap-2 ${
                  log.tone === 'red'
                    ? 'text-[#EA1D25] font-bold animate-glitch-slice'
                    : log.tone === 'gold'
                    ? 'text-[#D6BA72] font-bold'
                    : log.tone === 'white'
                    ? 'text-[#F5F5F0] font-bold'
                    : 'text-[#EDEDEA]/65'
                }`}
              >
                <span className="text-[#EDEDEA]/25">&gt;</span>
                <span>{log.text}</span>
              </div>
            ))}
            <div className="w-2 h-3.5 bg-[#EDEDEA]/70 animate-pulse inline-block ml-4" />
          </div>
        )}

        {phase === 'BEEN_HERE' && (
          <div className="text-center space-y-3 animate-glitch-slice">
            <div className="font-mono text-xs tracking-[0.3em] text-[#D6BA72]">
              RECORD VERIFIED // ARCHIVE MATCH
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-[0.24em] text-[#EDEDEA] chromatic-text">
              YOU HAVE BEEN HERE BEFORE.
            </h2>
          </div>
        )}

        {phase === 'UNKNOWN_ENTITY' && (
          <div className="text-center space-y-3 border-y border-[#EA1D25] py-6 px-10 bg-[#B5161B]/15 animate-glitch-slice">
            <div className="font-mono text-xs tracking-[0.35em] text-[#EA1D25] animate-pulse-alert">
              SECURITY BREACH // KERNEL INTERRUPT
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-[0.28em] text-[#EA1D25] red-phosphor">
              UNKNOWN ENTITY DETECTED
            </h2>
          </div>
        )}

        {phase === 'VENDEX_ENTERED' && (
          <div className="text-center space-y-4 animate-glitch-slice">
            <div className="font-mono text-xs tracking-[0.35em] text-[#8E7443]">
              PROTOCOL HIJACKED
            </div>
            <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-[0.26em] text-[#D6BA72] gold-phosphor">
              VENDEX HAS ENTERED THE SYSTEM
            </h2>
          </div>
        )}
      </div>

      {/* Bottom Bar with Discrete Skip */}
      <div className="flex items-center justify-between border-t border-[#EDEDEA]/15 pt-4 font-mono text-[11px] tracking-[0.2em]">
        <div className="text-[#EDEDEA]/40">
          TARGET HOST // <span className="text-[#EDEDEA]">{soulId}</span>
        </div>

        {canSkip ? (
          <button
            onClick={() => {
              soundEngine.playClick();
              onComplete();
            }}
            className="text-[#EDEDEA]/50 hover:text-[#D6BA72] border border-[#EDEDEA]/20 hover:border-[#D6BA72] px-3 py-1 transition-colors uppercase tracking-[0.22em]"
          >
            SKIP INITIALIZATION
          </button>
        ) : (
          <span className="text-[#EDEDEA]/25">ESTABLISHING HANDSHAKE...</span>
        )}
      </div>
    </div>
  );
};
