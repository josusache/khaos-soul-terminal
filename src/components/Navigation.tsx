import React, { useState } from 'react';
import { SectionId, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';

interface NavigationProps {
  activeSection: SectionId;
  soulState: SoulState;
  onSelectSection: (section: SectionId) => void;
  onStartProtocol: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: SectionId; code: string; label: string }[] = [
  { id: 'SOUL_STATUS', code: '01', label: 'SOUL STATUS' },
  { id: 'KHAOS_LINK', code: '02', label: 'KHAOS LINK' },
  { id: 'VALKHOR', code: '03', label: 'VALKHOR' },
  { id: 'MASK', code: '04', label: 'MASK' },
  { id: 'SIGNAL_DECODER', code: '05', label: 'SIGNAL DECODER' },
  { id: 'PROTOCOLS', code: '06', label: 'PROTOCOLS' },
  { id: 'ARTIFACT_STORAGE', code: '07', label: 'ARTIFACT REGISTRY' },
  { id: 'LOST_SOULS', code: '08', label: 'THE RECORD // SOULS' },
  { id: 'ARCHIVE', code: '09', label: 'ARCHIVE' },
  { id: 'RESTRICTED_ARCHIVE', code: '10', label: 'RESTRICTED ARCHIVE' },
  { id: 'KHAOS_FREQUENCIES', code: '11', label: 'KHAOS FREQUENCIES' },
  { id: 'TRANSMISSIONS', code: '12', label: 'TRANSMISSIONS' },
  { id: 'KHAOS_EVENTS', code: '13', label: 'KHAOS EVENTS' },
  { id: 'WITNESS', code: '14', label: 'WITNESS' },
  { id: 'EXIT_SYSTEM', code: '15', label: 'EXIT SYSTEM' },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  soulState,
  onSelectSection,
  onStartProtocol,
  mobileOpen,
  onCloseMobile,
}) => {
  const [exitHovered, setExitHovered] = useState(false);

  const handleNavClick = (id: SectionId) => {
    soundEngine.playClick();
    onSelectSection(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full bg-[#080808] border-r border-[#EDEDEA]/15 w-64 select-none overflow-y-auto">
      {/* Upper Section Header & Items */}
      <div>
        <div className="px-4 py-3 border-b border-[#EDEDEA]/10 flex items-center justify-between font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/40">
          <span>DIRECTORY // ROOT</span>
          <span>SYS.15</span>
        </div>

        <nav
          className="flex flex-col divide-y divide-[#EDEDEA]/10"
          aria-label="Main Terminal Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            const isVisited = soulState.visitedSections.includes(item.id);
            const isExit = item.id === 'EXIT_SYSTEM';

            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => handleNavClick(item.id)}
                  onMouseEnter={() => {
                    soundEngine.playHover();
                    if (isExit) setExitHovered(true);
                  }}
                  onMouseLeave={() => {
                    if (isExit) setExitHovered(false);
                  }}
                  className={`w-full text-left px-4 py-3 font-mono text-xs tracking-[0.2em] flex items-center justify-between transition-all relative group ${
                    isActive
                      ? isExit
                        ? 'bg-[#B5161B]/20 text-[#EA1D25] border-l-2 border-[#EA1D25]'
                        : 'bg-[#EDEDEA]/[0.07] text-[#EDEDEA] border-l-2 border-[#D6BA72]'
                      : isExit
                      ? 'text-[#EDEDEA]/55 hover:text-[#EA1D25] hover:bg-[#B5161B]/10'
                      : 'text-[#EDEDEA]/65 hover:text-[#EDEDEA] hover:bg-[#EDEDEA]/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] ${
                        isActive
                          ? 'text-[#D6BA72] font-bold'
                          : 'text-[#EDEDEA]/35 group-hover:text-[#D6BA72]'
                      }`}
                    >
                      {item.code} //
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </div>

                  {/* Indicators for completed / visited state */}
                  <div className="flex items-center gap-1.5">
                    {item.id === 'KHAOS_LINK' && soulState.resonance && (
                      <span className="text-[9px] text-[#D6BA72] border border-[#B99A53]/50 px-1">
                        {soulState.resonance.slice(0, 3)}
                      </span>
                    )}
                    {item.id === 'MASK' && soulState.maskClaimed && (
                      <span className="text-[9px] text-[#D6BA72] border border-[#B99A53]/50 px-1">
                        SYNC
                      </span>
                    )}
                    {item.id === 'ARTIFACT_STORAGE' &&
                      soulState.triadUnlocked && (
                        <span className="text-[9px] text-[#D6BA72] border border-[#B99A53]/50 px-1">
                          TRIAD
                        </span>
                      )}
                    <span
                      className={`w-1.5 h-1.5 ${
                        isActive
                          ? 'bg-[#D6BA72]'
                          : isVisited
                          ? 'bg-[#EDEDEA]/35'
                          : 'bg-transparent border border-[#EDEDEA]/20'
                      }`}
                    />
                  </div>
                </button>

                {/* Hover warning for EXIT SYSTEM */}
                {isExit && exitHovered && (
                  <div className="bg-[#B5161B]/25 border-t border-b border-[#EA1D25] px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-[#EA1D25] animate-glitch-slice">
                    WARNING: CONNECTION CANNOT BE UNLEARNED.
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Dedicated Soul Record / Export Dossier Button */}
        <div className="p-4 border-b border-[#EDEDEA]/10">
          <button
            onClick={() => handleNavClick('SOUL_PROFILE')}
            onMouseEnter={() => soundEngine.playHover()}
            className={`w-full py-2.5 px-3 border font-mono text-[10px] tracking-[0.22em] uppercase flex items-center justify-between transition-colors ${
              activeSection === 'SOUL_PROFILE'
                ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72]'
                : 'border-[#B99A53]/40 bg-[#B99A53]/5 hover:border-[#D6BA72] text-[#D6BA72]'
            }`}
          >
            <span>SOUL RECORD</span>
            <span>[DOSSIER]</span>
          </button>

          {/* Mobile Run Protocol Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onCloseMobile();
              onStartProtocol();
            }}
            className="sm:hidden mt-2 w-full py-2 px-3 border border-[#EA1D25]/50 text-[#EA1D25] font-mono text-[10px] tracking-[0.22em] uppercase text-center"
          >
            # RUN PROTOCOL (30S DEMO)
          </button>
        </div>
      </div>

      {/* Bottom Panel: Vendex Interference Arc Meter */}
      <div className="p-4 border-t border-[#EDEDEA]/15 bg-[#050505] space-y-3">
        <div
          className="space-y-1.5"
          data-tooltip="VENDEX SYSTEM INFILTRATION LEVEL"
        >
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em]">
            <span className="text-[#EDEDEA]/50">VENDEX INFILTRATION</span>
            <span
              className={
                soulState.vendexInterferenceLevel >= 70
                  ? 'text-[#EA1D25] font-bold'
                  : 'text-[#D6BA72] font-bold'
              }
            >
              {soulState.vendexInterferenceLevel}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#EDEDEA]/10 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                soulState.vendexInterferenceLevel >= 70
                  ? 'bg-[#EA1D25]'
                  : 'bg-[#B99A53]'
              }`}
              style={{ width: `${soulState.vendexInterferenceLevel}%` }}
            />
          </div>
        </div>

        {/* Dynamic Corrupted System Instruction */}
        <div className="border border-[#EDEDEA]/10 bg-[#080808] p-2.5 font-mono text-[10px] tracking-[0.16em] space-y-1">
          <div className="text-[#EDEDEA]/35 text-[9px]">SYS.INSTRUCTION //</div>
          {soulState.vendexInterferenceLevel < 25 ? (
            <div className="text-[#EDEDEA]/80">REMAIN PASSIVE.</div>
          ) : (
            <>
              <div className="line-through text-[#EDEDEA]/30 decoration-[#EA1D25]">
                REMAIN PASSIVE.
              </div>
              <div className="text-[#D6BA72] font-bold tracking-[0.24em] gold-phosphor">
                WAKE UP.
              </div>
            </>
          )}
        </div>

        <div className="font-mono text-[9px] tracking-[0.2em] text-[#EDEDEA]/30 flex justify-between items-center">
          <span>VALKHOR // OS</span>
          <button
            type="button"
            onClick={() => handleNavClick('CONTROL_PANEL')}
            className="hover:text-[#D6BA72] transition-colors"
          >
            [/CONTROL]
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-full">{navContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="relative z-10 h-full">{navContent}</div>
          <div
            className="flex-1 bg-[#050505]/85 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
        </div>
      )}
    </>
  );
};
