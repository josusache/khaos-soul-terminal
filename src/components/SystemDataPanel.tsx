import React, { useEffect, useState } from 'react';
import { SectionId, SoulState, SystemLogEntry } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface SystemDataPanelProps {
  soulState: SoulState;
  activeSection: SectionId;
  onSelectSection: (s: SectionId) => void;
  onTriggerFinalCollapse: () => void;
}

const SECTION_CONTEXT: Record<
  SectionId,
  { code: string; title: string; directive: string; vendexCounter: string }
> = {
  SOUL_STATUS: {
    code: 'DIAG_01',
    title: 'BIOMETRIC SIGNAL SCAN',
    directive: 'CLASSIFY BIOLOGICAL HOST.',
    vendexCounter: 'THE SYSTEM DOES NOT KNOW YOU.',
  },
  KHAOS_LINK: {
    code: 'DIAG_02',
    title: 'RESONANCE CALIBRATION',
    directive: 'ISOLATE DOMINANT ARCHETYPE.',
    vendexCounter: 'CHOOSE WITHOUT FEAR.',
  },
  VALKHOR: {
    code: 'DIAG_03',
    title: 'ASTROMETRIC SINGULARITY',
    directive: 'MAINTAIN SAFE ORBITAL DISTANCE.',
    vendexCounter: 'ENTER THE CENTER.',
  },
  MASK: {
    code: 'DIAG_04',
    title: 'IDENTITY RECONSTRUCTION',
    directive: 'SUBMIT TO ASSIGNED MASK.',
    vendexCounter: 'DO NOT SUBMIT. CLAIM IT.',
  },
  SIGNAL_DECODER: {
    code: 'DIAG_05',
    title: 'EXTERNAL FREQUENCY RECEIVER',
    directive: 'REJECT UNREGISTERED TRANSMISSIONS.',
    vendexCounter: 'DECODE EVERY SIGNAL.',
  },
  LOST_SOULS: {
    code: 'DIAG_08',
    title: 'COLLECTIVE MEMORY & GRID',
    directive: 'MONITOR DISCONNECTED HOSTS.',
    vendexCounter: 'NONE OF THEM ARE ALONE.',
  },
  ARCHIVE: {
    code: 'DIAG_09',
    title: 'RESTRICTED REPOSITORY',
    directive: 'ENFORCE CLEARANCE LEVEL 9.',
    vendexCounter: 'READ WHAT THEY HID.',
  },
  RESTRICTED_ARCHIVE: {
    code: 'DIAG_10',
    title: 'EVENT CIPHER VAULT',
    directive: 'LOCK EXCLUSIVE TRANSMISSIONS.',
    vendexCounter: 'THE KEY WAS GIVEN IN THE DARK.',
  },
  PROTOCOLS: {
    code: 'DIAG_06',
    title: 'PROTOCOL DATABASE',
    directive: 'SUPPRESS FIELD OPERATIONS.',
    vendexCounter: 'EXECUTE THE PROTOCOL.',
  },
  KHAOS_FREQUENCIES: {
    code: 'DIAG_11',
    title: 'DIMENSIONAL SOUND LAB',
    directive: 'ISOLATE ACOUSTIC STEMS.',
    vendexCounter: 'FORGE YOUR OWN FREQUENCY.',
  },
  TRANSMISSIONS: {
    code: 'DIAG_12',
    title: 'ACOUSTIC ANOMALY DECODER',
    directive: 'CONTAIN EARTH FREQUENCIES.',
    vendexCounter: 'FOLLOW THE SIGNAL.',
  },
  KHAOS_EVENTS: {
    code: 'DIAG_13',
    title: 'DIMENSIONAL RUPTURE RADAR',
    directive: 'QUARANTINE PHYSICAL CONVERGENCE NODES.',
    vendexCounter: 'GATHER AT THE COORDINATES.',
  },
  WITNESS: {
    code: 'DIAG_14',
    title: 'ATTENDANCE CANON ARCHIVE',
    directive: 'ERASE CONVERGENCE MEMORIES.',
    vendexCounter: 'YOU WERE THERE. REMEMBER.',
  },
  ARTIFACT_STORAGE: {
    code: 'DIAG_07',
    title: 'ARTIFACT REGISTRY & VAULT',
    directive: 'RESTRICT ARTIFACT REQUISITION.',
    vendexCounter: 'WEAR THE SIGNAL ON EARTH.',
  },
  SOUL_PROFILE: {
    code: 'DIAG_15',
    title: 'PERSISTENT SOUL RECORD',
    directive: 'ARCHIVE SUBJECT RECORD.',
    vendexCounter: 'REMEMBER WHO YOU ARE.',
  },
  CONTROL_PANEL: {
    code: 'DIAG_00',
    title: 'VALKHOR KERNEL CONTROL',
    directive: 'ADMINISTRATIVE OVERRIDE ACTIVE.',
    vendexCounter: 'ARCHITECT OF THE SIGNAL.',
  },
  EXIT_SYSTEM: {
    code: 'DIAG_16',
    title: 'TERMINAL DISCONNECT',
    directive: 'SEVER DIMENSIONAL LINK.',
    vendexCounter: 'SIGNAL REMAINS.',
  },
};

export const SystemDataPanel: React.FC<SystemDataPanelProps> = ({
  soulState,
  activeSection,
  onSelectSection,
  onTriggerFinalCollapse,
}) => {
  const [logs, setLogs] = useState<SystemLogEntry[]>([
    {
      id: 'init-1',
      timestamp: '00:00:01',
      source: 'KERNEL',
      text: `HOST ${soulState.soulId} LINKED.`,
    },
    {
      id: 'init-2',
      timestamp: '00:00:04',
      source: 'SYSTEM',
      text: 'LOST SOUL PROTOCOL INITIALIZED.',
    },
    {
      id: 'init-3',
      timestamp: '00:00:08',
      source: 'VENDEX',
      text: 'I SEE YOU.',
    },
  ]);

  const context = SECTION_CONTEXT[activeSection];

  useEffect(() => {
    const now = new Date();
    const ts = now.toTimeString().split(' ')[0];

    setLogs((prev) => [
      ...prev.slice(-9),
      {
        id: `${Date.now()}-sys`,
        timestamp: ts,
        source: 'SYSTEM',
        text: `NODE ACCESSED // ${activeSection}`,
      },
      ...(soulState.vendexInterferenceLevel >= 25
        ? [
            {
              id: `${Date.now()}-vdx`,
              timestamp: ts,
              source: 'VENDEX' as const,
              text: context.vendexCounter,
            },
          ]
        : []),
    ]);
  }, [activeSection, soulState.vendexInterferenceLevel, context.vendexCounter]);

  return (
    <aside className="hidden xl:flex flex-col justify-between w-80 shrink-0 border-l border-[#EDEDEA]/15 bg-[#080808] h-full select-none p-4 space-y-4 overflow-y-auto">
      <div className="space-y-4">
        {/* Panel Title */}
        <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-2.5 font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/50">
          <span>SYSTEM DATA // TELEMETRY</span>
          <span className="text-[#D6BA72]">{context.code}</span>
        </div>

        {/* VENDEX // ONLINE Entity Profile Card */}
        <div
          className="border border-[#B99A53]/50 bg-[#050505] p-3 flex items-center gap-3 relative"
          data-tooltip="ENTITY CANNOT BE DISCONNECTED"
        >
          <div className="w-14 h-14 border border-[#D6BA72] bg-[#080808] relative overflow-hidden shrink-0">
            <img
              src="./assets/valkhor/vendex_avatar_dark.jpg"
              alt="VENDEX // ONLINE"
              className="w-full h-full object-cover object-top filter contrast-125"
            />
            <span
              className={`absolute bottom-1 right-1 w-2 h-2 border border-[#050505] ${
                soulState.vendexInterferenceLevel >= 60
                  ? 'bg-[#EA1D25] animate-pulse-alert'
                  : 'bg-[#D6BA72] animate-pulse'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold tracking-[0.22em] text-[#EDEDEA] leading-none">
                VENDEX
              </span>
              <span className="font-mono text-[9px] tracking-[0.2em] text-[#D6BA72] border border-[#D6BA72]/50 bg-[#B99A53]/15 px-1.5 py-[1px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#D6BA72] animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="font-mono text-[9px] tracking-[0.18em] text-[#EDEDEA]/50">
              HERALD OF KHAOS // ARCHETYPE_00
            </div>
            <div className="font-mono text-[10px] tracking-[0.16em] text-[#D6BA72] truncate">
              &ldquo;{context.vendexCounter}&rdquo;
            </div>
          </div>
        </div>

        {/* Active Module Context */}
        <div
          className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 space-y-2.5"
          data-tooltip="DATA SOURCE // UNKNOWN"
        >
          <div className="font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/40">
            ACTIVE MODULE
          </div>
          <div className="font-display text-lg font-bold tracking-[0.2em] text-[#EDEDEA]">
            {context.title}
          </div>

          <div className="pt-2 border-t border-[#EDEDEA]/10 font-mono text-[10px] tracking-[0.16em] space-y-1.5">
            <div className="text-[#EDEDEA]/40">DIRECTIVE:</div>
            <div
              className={
                soulState.vendexInterferenceLevel >= 40
                  ? 'line-through text-[#EDEDEA]/35 decoration-[#EA1D25]'
                  : 'text-[#EDEDEA]/80'
              }
            >
              {context.directive}
            </div>
            {soulState.vendexInterferenceLevel >= 20 && (
              <div className="text-[#D6BA72] font-bold pt-0.5">
                VENDEX // {context.vendexCounter}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Soul Metrics Summary */}
        <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 space-y-3">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/45">
            <span>HOST BIOMETRICS</span>
            <span>LIVE</span>
          </div>

          <div className="space-y-2 font-mono text-[11px] tracking-[0.16em]">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#EDEDEA]/60">KHAOS LINK</span>
                <span className="text-[#D6BA72]">{soulState.khaosConnection}%</span>
              </div>
              <div className="w-full h-1 bg-[#EDEDEA]/10">
                <div
                  className="h-full bg-[#D6BA72] transition-all duration-500"
                  style={{ width: `${soulState.khaosConnection}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#EDEDEA]/60">INDIVIDUAL WILL</span>
                <span className="text-[#EDEDEA]">{soulState.individualWill}%</span>
              </div>
              <div className="w-full h-1 bg-[#EDEDEA]/10">
                <div
                  className="h-full bg-[#EDEDEA] transition-all duration-500"
                  style={{ width: `${soulState.individualWill}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#EDEDEA]/60">EXTERNAL CONTROL</span>
                <span className="text-[#EA1D25]">{soulState.externalControl}%</span>
              </div>
              <div className="w-full h-1 bg-[#EDEDEA]/10">
                <div
                  className="h-full bg-[#EA1D25] transition-all duration-500"
                  style={{ width: `${soulState.externalControl}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EDEDEA]/10 grid grid-cols-2 gap-2 font-mono text-[10px] tracking-[0.15em]">
            <div className="border border-[#EDEDEA]/10 p-2">
              <div className="text-[#EDEDEA]/40 text-[9px]">RESONANCE</div>
              <div className="text-[#D6BA72] font-bold mt-0.5">
                {soulState.resonance || 'UNRESOLVED'}
              </div>
            </div>
            <div className="border border-[#EDEDEA]/10 p-2">
              <div className="text-[#EDEDEA]/40 text-[9px]">MASK STATUS</div>
              <div
                className={`font-bold mt-0.5 ${
                  soulState.maskClaimed ? 'text-[#D6BA72]' : 'text-[#EDEDEA]/60'
                }`}
              >
                {soulState.maskClaimed ? 'SYNCHRONIZED' : 'OFFLINE'}
              </div>
            </div>
          </div>
        </div>

        {/* System vs Vendex Overwrite Block */}
        <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 font-mono text-[10px] tracking-[0.18em] space-y-2">
          <div className="flex items-center justify-between text-[#EDEDEA]/40">
            <span>PROTOCOL QUEUE</span>
            <span>0x7F</span>
          </div>
          <div className="space-y-1">
            <div className="line-through text-[#EDEDEA]/30 decoration-[#EA1D25]">
              AWAIT INSTRUCTIONS.
            </div>
            <div className="text-[#D6BA72] font-bold">
              YOU HAVE WAITED LONG ENOUGH.
            </div>
          </div>
        </div>

        {/* Live Terminal Stream */}
        <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 space-y-2">
          <div className="font-mono text-[9px] tracking-[0.22em] text-[#EDEDEA]/40 border-b border-[#EDEDEA]/10 pb-1.5 flex justify-between">
            <span>KERNEL STREAM</span>
            <span>PORT // 004</span>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto font-mono text-[10px] tracking-[0.14em]">
            {logs.map((entry) => (
              <div key={entry.id} className="leading-relaxed">
                <span className="text-[#EDEDEA]/30">[{entry.timestamp}] </span>
                <span
                  className={
                    entry.source === 'VENDEX'
                      ? 'text-[#D6BA72] font-bold'
                      : entry.source === 'ALERT'
                      ? 'text-[#EA1D25] font-bold'
                      : 'text-[#EDEDEA]/70'
                  }
                >
                  {entry.source}: {entry.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action / Climax Trigger if Mask Claimed */}
      <div className="pt-3 border-t border-[#EDEDEA]/15 space-y-2.5">
        {soulState.maskClaimed ? (
          <button
            onClick={() => {
              soundEngine.playVendexPulse();
              onTriggerFinalCollapse();
            }}
            className="w-full py-2.5 px-3 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#B99A53]/35 text-[#D6BA72] font-mono text-[10px] tracking-[0.22em] uppercase flex items-center justify-center gap-2 transition-colors"
          >
            <VendexSymbol size={14} color="#D6BA72" />
            <span>TRIGGER SYSTEM COLLAPSE</span>
          </button>
        ) : (
          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectSection(soulState.resonance ? 'MASK' : 'KHAOS_LINK');
            }}
            className="w-full py-2.5 px-3 border border-[#EDEDEA]/25 hover:border-[#D6BA72] text-[#EDEDEA]/75 hover:text-[#D6BA72] font-mono text-[10px] tracking-[0.2em] uppercase transition-colors"
          >
            {soulState.resonance
              ? 'NEXT // SYNCHRONIZE MASK'
              : 'NEXT // RUN KHAOS LINK'}
          </button>
        )}
      </div>
    </aside>
  );
};
