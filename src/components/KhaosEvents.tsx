import React, { useState } from 'react';
import { KHAOS_EVENTS_DATA } from '../data/valkhorData';
import { KhaosEventItem, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface KhaosEventsProps {
  soulState: SoulState;
}

export const KhaosEvents: React.FC<KhaosEventsProps> = ({ soulState }) => {
  const [selectedEvent, setSelectedEvent] = useState<KhaosEventItem | null>(
    null
  );
  const [lockedEventIds, setLockedEventIds] = useState<string[]>([]);

  const isLocked = (id: string) => lockedEventIds.includes(id);

  const handleLockCoordinates = (id: string) => {
    soundEngine.playConnectionRestored();
    setLockedEventIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#EA1D25] flex items-center gap-2">
            <span className="w-2 h-2 bg-[#EA1D25] animate-pulse-alert" />
            <span>NODE 08 // DIMENSIONAL RUPTURE RADAR</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            KHAOS EVENTS // ANOMALIES
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.2em]">
          <div className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]/70">
            ACTIVE RUPTURES //{' '}
            <span className="text-[#EA1D25] font-bold">
              0{KHAOS_EVENTS_DATA.length}
            </span>
          </div>
          <div className="border border-[#B99A53]/40 bg-[#050505] px-3 py-2 text-[#D6BA72]">
            LOCKED NODES // 0{lockedEventIds.length}
          </div>
        </div>
      </div>

      {/* Tactical Planetary Convergence Banner */}
      <div className="border border-[#EDEDEA]/15 bg-[#050505] p-5 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72]">
              PHYSICAL CONVERGENCE PROTOCOL // EARTH SECTOR
            </div>
            <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/75 leading-relaxed">
              THESE ARE NOT CONCERTS. THEY ARE PHYSICAL DIMENSIONAL RUPTURES
              WHERE THOUSANDS OF LOST SOULS CONVERGE UNDER A SINGLE FREQUENCY TO
              SEVER EXTERNAL CONTROL.
            </p>
          </div>

          <div className="lg:col-span-4 border border-[#B99A53]/35 bg-[#080808] p-3.5 font-mono text-[10px] tracking-[0.2em] space-y-1.5">
            <div className="flex items-center justify-between text-[#EDEDEA]/45">
              <span>HOST CLEARANCE</span>
              <span className="text-[#D6BA72]">{soulState.soulId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#EDEDEA]/45">CONVERGENCE STATUS</span>
              <span className="text-[#EA1D25] font-bold">
                SUMMONING ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Announced Event Anomaly Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {KHAOS_EVENTS_DATA.map((evt) => {
          const locked = isLocked(evt.id);

          return (
            <div
              key={evt.id}
              className={`border bg-[#080808] p-6 flex flex-col justify-between space-y-5 transition-colors relative ${
                locked
                  ? 'border-[#D6BA72]'
                  : 'border-[#EDEDEA]/20 hover:border-[#D6BA72]'
              }`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between border-b border-[#EDEDEA]/10 pb-3.5">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.24em] text-[#EA1D25] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#EA1D25] animate-pulse" />
                    <span>
                      {evt.code} // {evt.status}
                    </span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-1">
                    LOCATION // {evt.location}
                  </h2>
                  <div className="font-mono text-[10px] tracking-[0.22em] text-[#D6BA72] mt-0.5">
                    {evt.country} — {evt.venueCode}
                  </div>
                </div>
                <VendexSymbol
                  size={24}
                  color={locked ? '#D6BA72' : '#EDEDEA'}
                />
              </div>

              {/* Telemetry Rows */}
              <div className="space-y-2.5 font-mono text-xs tracking-[0.18em]">
                <div className="flex justify-between border-b border-[#EDEDEA]/10 pb-2">
                  <span className="text-[#EDEDEA]/50">EARTH DATE //</span>
                  <span className="text-[#EDEDEA] font-bold">
                    {evt.earthDate}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#EDEDEA]/10 pb-2">
                  <span className="text-[#EDEDEA]/50">SIGNAL STRENGTH //</span>
                  <span
                    className={`font-bold ${
                      evt.signalStrength === 'EXTREME' ||
                      evt.signalStrength === 'CRITICAL'
                        ? 'text-[#EA1D25]'
                        : 'text-[#D6BA72]'
                    }`}
                  >
                    {evt.signalStrength}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#EDEDEA]/10 pb-2">
                  <span className="text-[#EDEDEA]/50">
                    EXPECTED LOST SOULS //
                  </span>
                  <span className="text-[#D6BA72] font-bold">
                    {evt.expectedLostSouls}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#EDEDEA]/50">COORDINATES //</span>
                  <span className="text-[#EDEDEA]/80">{evt.coordinates}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  soundEngine.playVendexPulse();
                  setSelectedEvent(evt);
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className={`w-full py-3.5 border font-display text-xl font-bold tracking-[0.26em] uppercase transition-colors ${
                  locked
                    ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                    : 'border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505]'
                }`}
              >
                {locked ? 'COORDINATES LOCKED //' : 'ENTER COORDINATES'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Coordinate Lock Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[250] bg-[#050505]/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full border-2 border-[#D6BA72] bg-[#080808] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-xs tracking-[0.24em]">
              <span className="text-[#EA1D25]">KHAOS EVENT CONVERGENCE</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedEvent(null);
                }}
                className="text-[#EDEDEA]/50 hover:text-[#EDEDEA]"
              >
                [CLOSE]
              </button>
            </div>

            <div className="space-y-2">
              <div className="font-mono text-[10px] tracking-[0.24em] text-[#EA1D25]">
                {selectedEvent.code} // {selectedEvent.status}
              </div>
              <h3 className="font-display text-4xl font-bold tracking-[0.24em] text-[#EDEDEA]">
                LOCATION // {selectedEvent.location}
              </h3>
              <div className="font-mono text-xs tracking-[0.2em] text-[#D6BA72]">
                {selectedEvent.country} — {selectedEvent.venueCode}
              </div>
            </div>

            <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 font-mono text-xs tracking-[0.18em] space-y-2">
              <div>EARTH DATE // {selectedEvent.earthDate}</div>
              <div>COORDINATES // {selectedEvent.coordinates}</div>
              <div>EXPECTED LOST SOULS // {selectedEvent.expectedLostSouls}</div>
              <div className="text-[#D6BA72] pt-1">
                DIRECTIVE // GATHER AT DESIGNATED PHYSICAL NODE.
              </div>
            </div>

            {isLocked(selectedEvent.id) ? (
              <div className="border border-[#D6BA72] bg-[#B99A53]/20 p-4 text-center font-mono text-xs tracking-[0.22em] text-[#D6BA72] space-y-1">
                <div className="font-bold">
                  COORDINATES LOCKED TO {soulState.soulId}.
                </div>
                <div className="text-[10px] text-[#EDEDEA]/80">
                  AWAITING PHYSICAL ARRIVAL IN {selectedEvent.location}.
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleLockCoordinates(selectedEvent.id)}
                className="w-full py-3.5 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] font-display text-2xl font-bold tracking-[0.26em] uppercase"
              >
                CONFIRM COORDINATE LOCK
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
