import React, { useEffect, useState } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface ExitSystemProps {
  onReturn: () => void;
}

export const ExitSystem: React.FC<ExitSystemProps> = ({ onReturn }) => {
  // 'PROMPT' | 'SHUTTING_DOWN' | 'TERMINATED' | 'SIGNAL_REMAINS'
  const [phase, setPhase] = useState<
    'PROMPT' | 'SHUTTING_DOWN' | 'TERMINATED' | 'SIGNAL_REMAINS'
  >('PROMPT');

  useEffect(() => {
    if (phase !== 'SHUTTING_DOWN') return;

    soundEngine.playGlitch(1.2);
    const t1 = window.setTimeout(() => {
      soundEngine.disable();
      setPhase('TERMINATED');
    }, 2000);

    const t2 = window.setTimeout(() => {
      setPhase('SIGNAL_REMAINS');
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  return (
    <div className="fixed inset-0 z-[350] bg-[#050505] flex flex-col items-center justify-center p-6 select-none">
      {phase === 'PROMPT' && (
        <div className="max-w-md w-full border border-[#EDEDEA]/25 bg-[#080808] p-8 sm:p-10 text-center space-y-8">
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#EA1D25]">
            WARNING // CONNECTION CANNOT BE UNLEARNED.
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-[0.28em] text-[#EDEDEA]">
            DISCONNECT?
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => {
                soundEngine.playAlarm();
                setPhase('SHUTTING_DOWN');
              }}
              className="w-full py-3.5 border border-[#EA1D25] bg-[#B5161B]/20 hover:bg-[#EA1D25] text-[#EDEDEA] font-mono text-xs tracking-[0.24em] uppercase transition-colors"
            >
              DISCONNECT
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onReturn();
              }}
              className="w-full py-3.5 border border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#B99A53]/35 text-[#D6BA72] font-mono text-xs tracking-[0.24em] uppercase transition-colors"
            >
              RETURN
            </button>
          </div>
        </div>
      )}

      {phase === 'SHUTTING_DOWN' && (
        <div className="w-full max-w-lg text-center space-y-4 animate-glitch-slice">
          <div className="w-full h-[2px] bg-[#EDEDEA] animate-pulse" />
          <div className="font-mono text-xs tracking-[0.32em] text-[#EDEDEA]/60">
            CLOSING DIMENSIONAL CHANNEL...
          </div>
        </div>
      )}

      {(phase === 'TERMINATED' || phase === 'SIGNAL_REMAINS') && (
        <div className="text-center space-y-6">
          <div className="font-mono text-xs tracking-[0.32em] text-[#EDEDEA]/50">
            SESSION TERMINATED.
          </div>

          {phase === 'SIGNAL_REMAINS' && (
            <div className="space-y-8 pt-2 animate-flicker">
              <div className="font-mono text-sm sm:text-base tracking-[0.36em] text-[#D6BA72] font-bold gold-phosphor">
                SIGNAL REMAINS.
              </div>

              <div className="flex justify-center opacity-50">
                <VendexSymbol size={36} color="#D6BA72" />
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onReturn();
                }}
                className="mt-10 px-4 py-2 border border-[#EDEDEA]/15 hover:border-[#D6BA72]/60 text-[#EDEDEA]/35 hover:text-[#D6BA72] font-mono text-[10px] tracking-[0.26em] uppercase transition-colors"
              >
                RE-ESTABLISH LINK
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
