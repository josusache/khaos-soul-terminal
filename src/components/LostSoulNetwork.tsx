import React, { useState } from 'react';
import { LOST_SOULS_DATA } from '../data/valkhorData';
import { loadValkhorDb } from '../services/valkhorBackend';
import { LostSoulRecord, SoulState, TheRecordCategory } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface LostSoulNetworkProps {
  soulState: SoulState;
}

const RECORD_CATEGORIES: ('ALL' | TheRecordCategory)[] = [
  'ALL',
  'FIRST WITNESSES',
  'DISCOVERIES',
  'ARTIFACT KEEPERS',
  'DECODERS',
  'THE MARKED',
  'EVENT WITNESSES',
  'SPECIAL RECORDS',
];

// Map each Lost Soul to a specific individual crop of the uploaded Lost Soul white-mask photographs
const LOST_SOUL_PORTRAIT_CROPS: {
  src: string;
  pos: string;
  scale: number;
  rotate?: number;
}[] = [
  { src: './assets/valkhor/circle_soul_1.jpg', pos: '50% 50%', scale: 1.08 },
  { src: './assets/valkhor/circle_soul_2.jpg', pos: '50% 50%', scale: 1.08 },
  { src: './assets/valkhor/blur_soul_1.jpg', pos: '50% 42%', scale: 1.12 },
  { src: './assets/valkhor/circle_soul_3.jpg', pos: '50% 50%', scale: 1.08 },
  {
    src: './assets/valkhor/mask_closeup.jpg',
    pos: '50% 48%',
    scale: 1.14,
    rotate: -4.5,
  },
  { src: './assets/valkhor/circle_soul_4.jpg', pos: '50% 50%', scale: 1.08 },
  { src: './assets/valkhor/blur_soul_2.jpg', pos: '50% 42%', scale: 1.12 },
  { src: './assets/valkhor/circle_soul_5.jpg', pos: '50% 50%', scale: 1.08 },
  { src: './assets/valkhor/lost_soul_duo.jpg', pos: '23% 38%', scale: 1.55 },
  { src: './assets/valkhor/lost_soul_trio.jpg', pos: '20% 34%', scale: 1.95 },
  { src: './assets/valkhor/lost_soul_group.jpg', pos: '49% 58%', scale: 1.85 },
  { src: './assets/valkhor/lost_soul_trio.jpg', pos: '56% 35%', scale: 1.9 },
  { src: './assets/valkhor/lost_soul_group.jpg', pos: '72% 40%', scale: 2.35 },
  { src: './assets/valkhor/lost_soul_duo.jpg', pos: '75% 55%', scale: 1.85 },
  { src: './assets/valkhor/lost_soul_trio.jpg', pos: '82% 28%', scale: 1.65 },
  { src: './assets/valkhor/lost_soul_circle.jpg', pos: '50% 50%', scale: 1.18 },
];

const LostSoulPortrait: React.FC<{
  index: number;
  seed: number;
  status: LostSoulRecord['status'];
  signal: number;
  large?: boolean;
}> = ({ index, seed, status, signal, large = false }) => {
  const crop =
    LOST_SOUL_PORTRAIT_CROPS[index % LOST_SOUL_PORTRAIT_CROPS.length];
  const isAwake = status === 'AWAKE';
  const isLost = status === 'LOST';

  return (
    <div
      className={`w-full ${
        large ? 'h-52' : 'h-36'
      } bg-[#050505] border border-[#EDEDEA]/15 relative overflow-hidden group`}
    >
      <img
        src={crop.src}
        alt="Lost Soul Surveillance Capture"
        className={`w-full h-full object-cover transition-all duration-500 select-none pointer-events-none ${
          isAwake
            ? 'filter contrast-125 brightness-100'
            : isLost
            ? 'filter grayscale contrast-150 brightness-75'
            : 'filter grayscale contrast-125 brightness-90'
        }`}
        style={{
          objectPosition: crop.pos,
          transform: `scale(${crop.scale}) rotate(${crop.rotate || 0}deg)`,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, transparent 45%, rgba(5, 5, 5, 0.85) 100%)',
        }}
      />

      {isLost && (
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#EA1D25]/50 pointer-events-none" />
      )}
      {isAwake && (
        <div className="absolute inset-0 border border-[#D6BA72]/40 pointer-events-none" />
      )}

      <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#EDEDEA]/40 pointer-events-none" />
      <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#EDEDEA]/40 pointer-events-none" />
      <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-[#EDEDEA]/40 pointer-events-none" />
      <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#EDEDEA]/40 pointer-events-none" />

      <div className="absolute top-1.5 left-3 font-mono text-[8px] tracking-[0.2em] text-[#EDEDEA]/60 bg-[#050505]/75 px-1">
        CAM_0x{seed.toString(16).toUpperCase()}
      </div>
      <div className="absolute bottom-1.5 right-3 font-mono text-[9px] tracking-[0.18em] text-[#D6BA72] bg-[#050505]/80 px-1.5 py-[1px] border border-[#B99A53]/30">
        SIG:{signal}%
      </div>
    </div>
  );
};

export const LostSoulNetwork: React.FC<LostSoulNetworkProps> = ({
  soulState,
}) => {
  const [viewMode, setViewMode] = useState<'THE_RECORD' | 'SURVEILLANCE_GRID'>(
    'THE_RECORD'
  );
  const [selectedRecordCategory, setSelectedRecordCategory] = useState<
    'ALL' | TheRecordCategory
  >('ALL');

  const [souls, setSouls] = useState<LostSoulRecord[]>(LOST_SOULS_DATA);
  const [selectedSoulId, setSelectedSoulId] = useState<string>(
    LOST_SOULS_DATA[0].id
  );
  const [filterOrigin, setFilterOrigin] = useState<string>('ALL');
  const [pingNotice, setPingNotice] = useState<string | null>(null);

  const db = loadValkhorDb();
  const filteredHistoricalRecords =
    selectedRecordCategory === 'ALL'
      ? db.historicalRecords
      : db.historicalRecords.filter(
          (r) => r.category === selectedRecordCategory
        );

  // Include the user's own Soul record at the top of the network
  const userRecord: LostSoulRecord = {
    id: soulState.soulId,
    origin: 'EARTH',
    signal: soulState.khaosConnection,
    lastKnownThought: soulState.maskClaimed
      ? 'THE MASK IS SYNCHRONIZED.\nTHE SYSTEM NO LONGER DEFINES THIS HOST.'
      : 'CONNECTION ESTABLISHED.\nATTEMPTING TO REMEMBER VALKHOR.',
    controlExposure: soulState.externalControl,
    selfRecognition: soulState.individualWill,
    status: soulState.maskClaimed ? 'AWAKE' : 'INTERCEPTED',
    maskStatus: soulState.maskClaimed ? 'MASK ACCEPTED' : 'SYNCHRONIZING',
    resonance: soulState.resonance || 'UNRESOLVED',
    scanSeed: 777,
    coordinates: 'ACTIVE TERMINAL // LOCAL HOST',
  };

  const allRecords = [userRecord, ...souls];
  const filteredRecords =
    filterOrigin === 'ALL'
      ? allRecords
      : allRecords.filter((s) => s.origin.includes(filterOrigin));

  const selectedIndex = Math.max(
    0,
    allRecords.findIndex((s) => s.id === selectedSoulId)
  );
  const selectedSoul = allRecords[selectedIndex] || allRecords[0];

  const handleTransmitWakeup = (id: string) => {
    soundEngine.playVendexPulse();
    setSouls((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextSignal = Math.min(99, s.signal + 24);
        const isNowAwake = nextSignal >= 75;
        return {
          ...s,
          signal: nextSignal,
          controlExposure: Math.max(3, s.controlExposure - 28),
          selfRecognition: Math.min(98, s.selfRecognition + 31),
          status: isNowAwake ? 'AWAKE' : 'INTERCEPTED',
          maskStatus: isNowAwake ? 'MASK ACCEPTED' : 'SYNCHRONIZING',
        };
      })
    );
    setPingNotice(`WAKEUP FREQUENCY TRANSMITTED TO ${id}`);
    window.setTimeout(() => setPingNotice(null), 2600);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72]">
            NODE 05 // THE COLLECTIVE MEMORY OF VENDEX
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            {viewMode === 'THE_RECORD' ? 'THE RECORD' : 'LOST SOUL NETWORK'}
          </h1>
          <div className="font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/50 mt-1">
            A LIVING ARCHIVE OF THE LOST SOULS // DISCOVER → VERIFY → RECORD →
            UNLOCK → LEAVE A TRACE
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.22em]">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setViewMode('THE_RECORD');
            }}
            className={`px-4 py-2.5 border transition-colors ${
              viewMode === 'THE_RECORD'
                ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72] font-bold'
                : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/65 hover:text-[#EDEDEA]'
            }`}
          >
            THE RECORD (HISTORICAL ARCHIVE)
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setViewMode('SURVEILLANCE_GRID');
            }}
            className={`px-4 py-2.5 border transition-colors ${
              viewMode === 'SURVEILLANCE_GRID'
                ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72] font-bold'
                : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/65 hover:text-[#EDEDEA]'
            }`}
          >
            SURVEILLANCE GRID ({allRecords.length} SOULS)
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODE 1: THE RECORD (HISTORICAL ARCHIVE OF THE LOST SOULS)           */}
      {/* =================================================================== */}
      {viewMode === 'THE_RECORD' && (
        <div className="space-y-5">
          {/* Category Filters */}
          <div className="border border-[#EDEDEA]/15 bg-[#080808] p-4 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
            {RECORD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedRecordCategory(cat);
                }}
                className={`px-3 py-1.5 border transition-colors ${
                  selectedRecordCategory === cat
                    ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72] font-bold'
                    : 'border-[#EDEDEA]/15 bg-[#050505] text-[#EDEDEA]/60 hover:text-[#EDEDEA]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistoricalRecords.map((entry) => {
              const isUserEntry = entry.soulId === soulState.soulId;
              return (
                <div
                  key={entry.id}
                  className={`border p-5 space-y-3 font-mono ${
                    isUserEntry
                      ? 'border-[#D6BA72] bg-[#B99A53]/10'
                      : 'border-[#EDEDEA]/15 bg-[#080808]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] tracking-[0.22em] border-b border-[#EDEDEA]/10 pb-2">
                    <span className="text-[#D6BA72] font-bold">
                      {entry.category}
                    </span>
                    <span className="text-[#EDEDEA]/45">
                      {entry.timestampUtc}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-2xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                        {entry.headline}
                      </div>
                      <div className="text-xs tracking-[0.2em] text-[#D6BA72] mt-0.5">
                        RECORDED HOST // {entry.soulId}
                        {entry.alias ? ` (${entry.alias})` : ''}
                        {isUserEntry ? ' [YOU]' : ''}
                      </div>
                    </div>
                    <VendexSymbol size={24} color="#D6BA72" />
                  </div>

                  <div className="border border-[#EDEDEA]/10 bg-[#050505] p-3 space-y-1 text-[11px] tracking-[0.16em] text-[#EDEDEA]/75">
                    {entry.details.map((d, idx) => (
                      <div key={idx}>&gt; {d}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODE 2: SURVEILLANCE GRID (LIVE WHITE-MASK HOST MONITOR)            */}
      {/* =================================================================== */}
      {viewMode === 'SURVEILLANCE_GRID' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[#EDEDEA]/15 bg-[#080808] p-3.5 font-mono text-[10px] tracking-[0.2em]">
            <span className="text-[#EDEDEA]/55">
              FILTER HOSTS BY ORIGIN SECTOR //
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'EARTH', 'NEW GEA', 'UNKNOWN'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setFilterOrigin(f);
                  }}
                  className={`px-3 py-1.5 border transition-colors ${
                    filterOrigin === f
                      ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72]'
                      : 'border-[#EDEDEA]/20 text-[#EDEDEA]/60 hover:text-[#EDEDEA]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 max-h-[660px] overflow-y-auto pr-1">
              {filteredRecords.map((soul) => {
                const globalIdx = allRecords.findIndex((r) => r.id === soul.id);
                const isSelected = soul.id === selectedSoul.id;
                const isAwake = soul.status === 'AWAKE';
                const isUser = soul.id === soulState.soulId;

                return (
                  <button
                    key={soul.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedSoulId(soul.id);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`text-left border p-3.5 flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-[#D6BA72] bg-[#B99A53]/10'
                        : 'border-[#EDEDEA]/15 bg-[#080808] hover:border-[#EDEDEA]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-xs tracking-[0.18em] mb-2">
                        <span className="font-bold text-[#EDEDEA]">
                          {soul.id} {isUser && '[YOU]'}
                        </span>
                        <span
                          className={`w-2 h-2 ${
                            isAwake
                              ? 'bg-[#D6BA72]'
                              : soul.status === 'LOST'
                              ? 'bg-[#EA1D25] animate-pulse'
                              : 'bg-[#EDEDEA]/60'
                          }`}
                        />
                      </div>

                      <LostSoulPortrait
                        index={globalIdx}
                        seed={soul.scanSeed}
                        status={soul.status}
                        signal={soul.signal}
                      />
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#EDEDEA]/10 space-y-1 font-mono text-[10px] tracking-[0.18em]">
                      <div className="text-[#EDEDEA]/60 truncate">
                        {soul.origin}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#D6BA72] font-bold">
                          SIGNAL // {soul.signal}%
                        </span>
                        <span
                          className={
                            isAwake
                              ? 'text-[#D6BA72]'
                              : soul.status === 'LOST'
                              ? 'text-[#EA1D25]'
                              : 'text-[#EDEDEA]/60'
                          }
                        >
                          {soul.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-4 border border-[#EDEDEA]/20 bg-[#080808] p-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
                  <span className="text-[#D6BA72]">SUBJECT DOSSIER</span>
                  <span className="text-[#EDEDEA]/45">
                    {selectedSoul.coordinates}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-3xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                      {selectedSoul.id}
                    </h2>
                    <div className="font-mono text-xs tracking-[0.2em] text-[#EDEDEA]/55 mt-0.5">
                      {selectedSoul.origin}
                    </div>
                  </div>
                  <VendexSymbol
                    size={28}
                    color={
                      selectedSoul.status === 'AWAKE' ? '#D6BA72' : '#EDEDEA'
                    }
                  />
                </div>

                <LostSoulPortrait
                  index={selectedIndex}
                  seed={selectedSoul.scanSeed}
                  status={selectedSoul.status}
                  signal={selectedSoul.signal}
                  large
                />

                <div className="border border-[#B99A53]/40 bg-[#050505] p-4 space-y-2">
                  <div className="font-mono text-[10px] tracking-[0.24em] text-[#8E7443]">
                    LAST KNOWN THOUGHT:
                  </div>
                  <blockquote className="font-mono text-xs sm:text-sm tracking-[0.16em] text-[#EDEDEA] whitespace-pre-line leading-relaxed italic">
                    &ldquo;{selectedSoul.lastKnownThought}&rdquo;
                  </blockquote>
                </div>

                <div className="space-y-2.5 font-mono text-xs tracking-[0.18em]">
                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/55">
                      CONTROL EXPOSURE //
                    </span>
                    <span
                      className={
                        selectedSoul.controlExposure > 60
                          ? 'text-[#EA1D25] font-bold'
                          : 'text-[#EDEDEA] font-bold'
                      }
                    >
                      {String(selectedSoul.controlExposure).padStart(2, '0')}%
                    </span>
                  </div>

                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/55">
                      SELF RECOGNITION //
                    </span>
                    <span className="text-[#D6BA72] font-bold">
                      {String(selectedSoul.selfRecognition).padStart(2, '0')}%
                    </span>
                  </div>

                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/55">CONDUIT //</span>
                    <span className="text-[#EDEDEA] font-bold">
                      {selectedSoul.maskStatus}
                    </span>
                  </div>

                  {selectedSoul.status === 'AWAKE' && (
                    <div className="border border-[#D6BA72]/60 bg-[#B99A53]/15 p-3 text-center font-mono text-xs tracking-[0.22em] text-[#D6BA72] font-bold">
                      CONNECTION RESTORED
                    </div>
                  )}

                  <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex justify-between">
                    <span className="text-[#EDEDEA]/55">STATUS //</span>
                    <span
                      className={`font-bold ${
                        selectedSoul.status === 'AWAKE'
                          ? 'text-[#D6BA72]'
                          : selectedSoul.status === 'LOST'
                          ? 'text-[#EA1D25]'
                          : 'text-[#EDEDEA]'
                      }`}
                    >
                      {selectedSoul.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EDEDEA]/15 space-y-2">
                {pingNotice && (
                  <div className="bg-[#B99A53]/20 border border-[#D6BA72] p-2 text-center font-mono text-[10px] tracking-[0.2em] text-[#D6BA72]">
                    {pingNotice}
                  </div>
                )}

                {selectedSoul.id !== soulState.soulId &&
                  selectedSoul.status !== 'AWAKE' && (
                    <button
                      type="button"
                      onClick={() => handleTransmitWakeup(selectedSoul.id)}
                      className="w-full py-3 border border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#B99A53]/35 text-[#EDEDEA] font-mono text-xs tracking-[0.22em] uppercase transition-colors"
                    >
                      TRANSMIT WAKEUP SIGNAL
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
