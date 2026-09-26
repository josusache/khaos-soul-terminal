import React, { useEffect, useState } from 'react';
import { SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface SystemHeaderProps {
  soulState: SoulState;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onStartProtocol: () => void;
  onOpenProfile: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  soulState,
  audioEnabled,
  onToggleAudio,
  onStartProtocol,
  onOpenProfile,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [jitterConn, setJitterConn] = useState(72.443);
  const [drift, setDrift] = useState(0.0037);

  useEffect(() => {
    const base = Math.max(34, soulState.khaosConnection);
    const interval = window.setInterval(() => {
      const delta = (Math.random() - 0.48) * 0.085;
      setJitterConn(Number((base + 38.443 + delta).toFixed(3)));
      setDrift(
        Number((0.0037 + (soulState.vendexInterferenceLevel * 0.00004) + (Math.random() - 0.5) * 0.0003).toFixed(4))
      );
    }, 1100);

    return () => clearInterval(interval);
  }, [soulState.khaosConnection, soulState.vendexInterferenceLevel]);

  const isCorrupted = soulState.vendexInterferenceLevel >= 70;

  return (
    <header className="w-full border-b border-[#EDEDEA]/15 bg-[#050505] px-4 lg:px-6 py-3 flex items-center justify-between gap-4 relative z-40 select-none">
      {/* Left: VALKHOR // KHAOS DIMENSION NETWORK */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleMobileMenu();
          }}
          className="lg:hidden border border-[#EDEDEA]/25 px-2.5 py-1.5 font-mono text-[11px] tracking-[0.2em] text-[#EDEDEA] hover:border-[#D6BA72] hover:text-[#D6BA72]"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? 'CLOSE //' : 'MENU //'}
        </button>

        <div
          className="flex items-center gap-3"
          data-tooltip="VALKHOR RECOVERY SYSTEM // KERNEL"
        >
          <VendexSymbol
            size={20}
            color={isCorrupted ? '#D6BA72' : '#EDEDEA'}
            glitch={isCorrupted}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.28em] text-[#EDEDEA] leading-none">
                VALKHOR
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono tracking-[0.2em] px-1.5 py-0.5 border border-[#B99A53]/40 text-[#D6BA72]">
                KHAOS // SOUL TERMINAL
              </span>
            </div>
            <div className="font-mono text-[9px] tracking-[0.24em] text-[#EDEDEA]/50 mt-0.5">
              KHAOS DIMENSION NETWORK
            </div>
          </div>
        </div>
      </div>

      {/* Center: Telemetry Readouts */}
      <div className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.2em]">
        <div
          className="flex items-center gap-2.5 border-l border-[#EDEDEA]/15 pl-4"
          data-tooltip="SIGNAL DEGRADATION // 0.004%/MIN"
        >
          <span className="w-1.5 h-1.5 bg-[#D6BA72] animate-pulse" />
          <div>
            <span className="text-[#EDEDEA]/45">CONNECTION: </span>
            <span className="text-[#EDEDEA] font-bold">
              {Math.min(99.999, jitterConn).toFixed(3)}%
            </span>
          </div>
        </div>

        <div
          className="border-l border-[#EDEDEA]/15 pl-4"
          data-tooltip="DATA SOURCE // UNKNOWN"
        >
          <span className="text-[#EDEDEA]/45">DIMENSIONAL DRIFT: </span>
          <span
            className={
              soulState.vendexInterferenceLevel >= 50
                ? 'text-[#EA1D25] font-bold'
                : 'text-[#D6BA72]'
            }
          >
            {drift.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Right: Soul ID, Vendex Status, Audio, Run Protocol */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Run Protocol Discrete Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick(1400);
            onStartProtocol();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          data-tooltip="EXECUTE 30S AUTOMATED SEQUENCE"
          className="hidden sm:flex items-center gap-1.5 border border-[#B99A53]/40 hover:border-[#D6BA72] bg-[#B99A53]/5 hover:bg-[#B99A53]/20 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-[#D6BA72] transition-colors"
        >
          <span className="w-1.5 h-1.5 bg-[#EA1D25]" />
          <span>RUN PROTOCOL</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleAudio}
          onMouseEnter={() => soundEngine.playHover()}
          data-tooltip="MACHINE FREQUENCY GENERATOR"
          className={`border px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] transition-colors ${
            audioEnabled
              ? 'border-[#D6BA72] text-[#D6BA72] bg-[#B99A53]/15'
              : 'border-[#EDEDEA]/20 text-[#EDEDEA]/55 hover:border-[#EDEDEA]/50 hover:text-[#EDEDEA]'
          }`}
        >
          AUDIO // {audioEnabled ? 'ON' : 'OFF'}
        </button>

        {/* Vendex Online Profile Badge + Soul ID */}
        <div className="flex items-center gap-3 border-l border-[#EDEDEA]/15 pl-3 sm:pl-4">
          {/* Vendex Cropped Profile Avatar ("VENDEX // ONLINE") */}
          <div
            className="flex items-center gap-2.5 border border-[#B99A53]/45 bg-[#080808] px-2 py-1 relative group"
            data-tooltip="ENTITY CANNOT BE DISCONNECTED"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[#D6BA72]/70 bg-[#050505] relative overflow-hidden shrink-0">
              <img
                src="./assets/valkhor/vendex_avatar_dark.jpg"
                alt="VENDEX // ONLINE"
                className="w-full h-full object-cover object-top filter contrast-125"
              />
              <span
                className={`absolute bottom-0.5 right-0.5 w-2 h-2 border border-[#050505] ${
                  soulState.vendexInterferenceLevel >= 60
                    ? 'bg-[#EA1D25] animate-pulse-alert'
                    : 'bg-[#D6BA72] animate-pulse'
                }`}
              />
            </div>

            <div className="hidden sm:block text-left">
              <div className="font-mono text-[10px] font-bold tracking-[0.22em] text-[#D6BA72] leading-tight">
                VENDEX
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.22em] text-[#EDEDEA]/75 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 ${
                    soulState.vendexInterferenceLevel >= 60
                      ? 'bg-[#EA1D25] animate-pulse-alert'
                      : 'bg-[#D6BA72] animate-pulse'
                  }`}
                />
                <span>ONLINE</span>
              </div>
            </div>
          </div>

          {/* Soul ID Profile Trigger */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenProfile();
            }}
            data-tooltip="IDENTITY // TEMPORARY"
            className="text-right group"
          >
            <div className="flex items-center justify-end gap-2 font-mono text-[11px] tracking-[0.18em]">
              <span className="text-[#EDEDEA] group-hover:text-[#D6BA72] font-bold transition-colors">
                {soulState.soulId}
              </span>
              <span
                className={`text-[9px] px-1 py-[1px] border ${
                  soulState.maskClaimed
                    ? 'border-[#D6BA72] text-[#D6BA72]'
                    : 'border-[#EDEDEA]/25 text-[#EDEDEA]/60'
                }`}
              >
                {soulState.maskClaimed
                  ? 'RECONNECTED'
                  : soulState.resonance
                  ? soulState.resonance
                  : 'UNIDENTIFIED'}
              </span>
            </div>
            <div className="font-mono text-[8px] tracking-[0.22em] text-[#EDEDEA]/45 mt-0.5">
              SOUL DOSSIER //
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
