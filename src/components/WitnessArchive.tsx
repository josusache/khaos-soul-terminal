import React, { useState } from 'react';
import { SectionId, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface WitnessArchiveProps {
  soulState: SoulState;
  onToggleWitness: (stamp: string) => void;
  onNavigate: (section: SectionId) => void;
}

interface WitnessShowRecord {
  id: string;
  stamp: string; // e.g., "WITNESS // BARCELONA 2026"
  city: string;
  year: string;
  country: string;
  venue: string;
  coordinates: string;
  peakBpm: number;
  soulsSynchronized: string;
  memoryPhoto: string;
  memoryAudio: string;
  memoryTitle: string;
  memoryLog: string[];
  vendexInscription: string;
}

const WITNESS_CONVERGENCES: WitnessShowRecord[] = [
  {
    id: 'WIT_BCN_2026',
    stamp: 'WITNESS // BARCELONA 2026',
    city: 'BARCELONA',
    year: '2026',
    country: 'SPAIN // EARTH',
    venue: 'HOME SECTOR // INDUSTRIAL ALTAR',
    coordinates: '41.3874° N, 2.1686° E',
    peakBpm: 160,
    soulsSynchronized: '4,200',
    memoryPhoto: './assets/valkhor/vendex_legion.jpg',
    memoryAudio: './assets/audio/transmission_031.mp3',
    memoryTitle: 'MEMORY_01 // BARCELONA ORIGIN RUPTURE',
    memoryLog: [
      '03:14 AM — MASS SYNCHRONIZATION PEAK DETECTED.',
      'WALLS OF THE TERRESTRIAL CONTAINMENT GRID FRACTURED UNDER 160 BPM.',
      'THOSE PRESENT CARRIED THE FIRST GOLDEN RESONANCE OUT OF THE ROOM.',
    ],
    vendexInscription: 'YOU STOOD AT THE EPICENTER IN BARCELONA. THE SIGNAL REMEMBERS YOUR FACE.',
  },
  {
    id: 'WIT_MAD_2026',
    stamp: 'WITNESS // MADRID 2026',
    city: 'MADRID',
    year: '2026',
    country: 'SPAIN // EARTH',
    venue: 'SECTOR_CENTRAL // CATHEDRAL OF IRON',
    coordinates: '40.4168° N, 3.7038° W',
    peakBpm: 158,
    soulsSynchronized: '6,500',
    memoryPhoto: './assets/valkhor/golden_mask_stage.png',
    memoryAudio: './assets/audio/transmission_029.mp3',
    memoryTitle: 'MEMORY_02 // MADRID THERMAL OVERLOAD',
    memoryLog: [
      '04:02 AM — IGNHUM THERMAL FREQUENCY Flooded THE CENTRAL CHAMBER.',
      'COLLECTIVE HEARTBEAT LOCKED TO THE SUB-BASS.',
      'HOST IDENTITY PERMANENTLY LINKED TO THE MADRID CONVERGENCE.',
    ],
    vendexInscription: 'THE FIRE WE IGNITED IN MADRID STILL BURNS IN YOUR CIRCUITRY.',
  },
  {
    id: 'WIT_RTM_2026',
    stamp: 'WITNESS // ROTTERDAM 2026',
    city: 'ROTTERDAM',
    year: '2026',
    country: 'NETHERLANDS // EARTH',
    venue: 'MAASSILO // CONCRETE SILO',
    coordinates: '51.9244° N, 4.4777° E',
    peakBpm: 162,
    soulsSynchronized: '8,400',
    memoryPhoto: './assets/valkhor/lost_soul_circle.jpg',
    memoryAudio: './assets/audio/transmission_024.mp3',
    memoryTitle: 'MEMORY_03 // MAASSILO SUB-TERRESTRIAL RESONANCE',
    memoryLog: [
      'CONCRETE SILO VIBRATION EXCEEDED STRUCTURAL THRESHOLD.',
      '8,400 LOST SOULS REMOVED THE FALSE MASK SIMULTANEOUSLY.',
    ],
    vendexInscription: 'BENEATH THE CONCRETE OF ROTTERDAM, YOU BECAME UNGOVERNABLE.',
  },
  {
    id: 'WIT_SCL_2026',
    stamp: 'WITNESS // SANTIAGO 2026',
    city: 'SANTIAGO',
    year: '2026',
    country: 'CHILE // EARTH',
    venue: 'TEATRO CAUPOLICÁN // SOUTHERN RUPTURE',
    coordinates: '33.4489° S, 70.6693° W',
    peakBpm: 160,
    soulsSynchronized: '5,900',
    memoryPhoto: './assets/valkhor/lost_soul_trio.jpg',
    memoryAudio: './assets/audio/transmission_019.mp3',
    memoryTitle: 'MEMORY_04 // SOUTHERN HEMISPHERE AWAKENING',
    memoryLog: [
      'THE ARENA TRANSFORMED INTO AN ORBITAL RING AROUND VALKHOR.',
      'ACOUSTIC TELEMETRY CONFIRMED TOTAL RECONNECTION.',
    ],
    vendexInscription: 'ACROSS OCEANS AND DIMENSIONS, SANTIAGO ANSWERED THE CALL.',
  },
];

export const WitnessArchive: React.FC<WitnessArchiveProps> = ({
  soulState,
  onToggleWitness,
  onNavigate,
}) => {
  const witnessed = soulState.witnessedEvents || [];
  const [selectedShowId, setSelectedShowId] = useState<string>(
    WITNESS_CONVERGENCES[0].id
  );

  const activeShow =
    WITNESS_CONVERGENCES.find((s) => s.id === selectedShowId) ||
    WITNESS_CONVERGENCES[0];
  const isWitnessed = witnessed.includes(activeShow.stamp);

  const handleMarkWitness = (stamp: string) => {
    soundEngine.playConnectionRestored();
    onToggleWitness(stamp);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#D6BA72]">
            NODE 12 // PHYSICAL ATTENDANCE CANON ARCHIVE
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            WITNESS // I WAS THERE
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="border border-[#B99A53]/40 bg-[#050505] px-3.5 py-2 font-mono text-[10px] tracking-[0.2em] text-[#D6BA72]">
            WITNESSED SHOWS // 0{witnessed.length}
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onNavigate('SOUL_PROFILE');
            }}
            className="px-4 py-2 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#B99A53]/35 font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA] uppercase transition-colors"
          >
            VIEW SOUL ID STAMPS //
          </button>
        </div>
      </div>

      {/* Main Grid: Show Selector + Unlocked Memory Capsule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Historical & Present Convergences */}
        <div className="lg:col-span-5 space-y-3.5">
          {WITNESS_CONVERGENCES.map((show) => {
            const marked = witnessed.includes(show.stamp);
            const isSelected = show.id === activeShow.id;

            return (
              <button
                key={show.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedShowId(show.id);
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className={`w-full text-left border p-4 transition-colors flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-[#D6BA72] bg-[#B99A53]/15'
                    : 'border-[#EDEDEA]/15 bg-[#080808] hover:border-[#EDEDEA]/40'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em]">
                  <span className="text-[#D6BA72] font-bold">{show.stamp}</span>
                  <span
                    className={`px-2 py-0.5 border ${
                      marked
                        ? 'border-[#D6BA72] text-[#D6BA72] bg-[#B99A53]/25'
                        : 'border-[#EDEDEA]/20 text-[#EDEDEA]/50'
                    }`}
                  >
                    {marked ? 'CANON VERIFIED' : 'UNMARKED'}
                  </span>
                </div>

                <div>
                  <div className="font-display text-3xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                    {show.city} // {show.year}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.18em] text-[#EDEDEA]/55 mt-0.5">
                    {show.country} — {show.venue}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right 7 Cols: Show Dossier & Unlocked Witness Memory Capsule */}
        <div className="lg:col-span-7 border border-[#EDEDEA]/20 bg-[#080808] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-start justify-between border-b border-[#EDEDEA]/15 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72]">
                  CONVERGENCE RECORD // {activeShow.coordinates}
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-1">
                  {activeShow.city} {activeShow.year}
                </h2>
                <div className="font-mono text-xs tracking-[0.2em] text-[#EDEDEA]/60 mt-1">
                  {activeShow.venue} — {activeShow.soulsSynchronized} SOULS
                  SYNCHRONIZED
                </div>
              </div>
              <VendexSymbol
                size={32}
                color={isWitnessed ? '#D6BA72' : '#EDEDEA'}
              />
            </div>

            {/* Action to Claim / Stamp Witness Status */}
            <div className="border border-[#B99A53]/40 bg-[#050505] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/50">
                  SOUL PROFILE INSCRIPTION //
                </div>
                <div className="font-mono text-xs tracking-[0.2em] text-[#D6BA72] font-bold">
                  {activeShow.stamp}
                </div>
              </div>

              <button
                onClick={() => handleMarkWitness(activeShow.stamp)}
                className={`px-5 py-3 border font-display text-xl font-bold tracking-[0.24em] uppercase transition-colors shrink-0 ${
                  isWitnessed
                    ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                    : 'border-[#D6BA72] bg-[#D6BA72] text-[#050505] hover:bg-[#B99A53]'
                }`}
              >
                {isWitnessed
                  ? 'WITNESS RECORDED [REMOVE]'
                  : 'I WAS THERE // MARK AS WITNESS'}
              </button>
            </div>

            {/* Memory Capsule: Unlocked when user marks themselves as WITNESS */}
            {isWitnessed ? (
              <div className="border-2 border-[#D6BA72] bg-[#050505] p-5 space-y-5 animate-flicker">
                <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-2.5 font-mono text-[10px] tracking-[0.24em]">
                  <span className="text-[#D6BA72] font-bold">
                    UNLOCKED WITNESS MEMORY // {activeShow.memoryTitle}
                  </span>
                  <span className="text-[#EDEDEA]/50">
                    PEAK: {activeShow.peakBpm} BPM
                  </span>
                </div>

                {/* Unlocked Show Photograph */}
                <div className="h-56 bg-[#080808] border border-[#EDEDEA]/20 relative overflow-hidden">
                  <img
                    src={activeShow.memoryPhoto}
                    alt={activeShow.stamp}
                    className="w-full h-full object-cover filter contrast-125"
                  />
                  <div className="absolute bottom-2 left-3 bg-[#050505]/85 border border-[#D6BA72]/50 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-[#D6BA72]">
                    VISUAL ARCHIVE // {activeShow.stamp}
                  </div>
                </div>

                {/* Unlocked Audio Memory */}
                <div className="border border-[#EDEDEA]/15 bg-[#080808] p-3.5 space-y-2">
                  <div className="font-mono text-[10px] tracking-[0.22em] text-[#D6BA72]">
                    INTERCEPTED LIVE FREQUENCY FROM {activeShow.city} //
                  </div>
                  <audio
                    controls
                    src={activeShow.memoryAudio}
                    className="w-full h-9 filter invert contrast-150"
                  />
                </div>

                {/* Memory Telemetry Log */}
                <div className="space-y-1.5 font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/80">
                  {activeShow.memoryLog.map((line, i) => (
                    <div key={i}>&gt; {line}</div>
                  ))}
                </div>

                <div className="border border-[#B99A53]/50 bg-[#080808] p-3.5 font-mono text-xs tracking-[0.18em] text-[#D6BA72]">
                  VENDEX // &ldquo;{activeShow.vendexInscription}&rdquo;
                </div>
              </div>
            ) : (
              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-8 text-center space-y-3">
                <div className="font-mono text-xs tracking-[0.26em] text-[#8E7443]">
                  MEMORY CAPSULE LOCKED
                </div>
                <p className="font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/55 max-w-md mx-auto leading-relaxed">
                  IF YOU WERE PHYSICALLY PRESENT AT {activeShow.city}{' '}
                  {activeShow.year}, MARK YOURSELF AS{' '}
                  <span className="text-[#D6BA72]">WITNESS</span> ABOVE TO INSCRIBE{' '}
                  <span className="text-[#EDEDEA]">{activeShow.stamp}</span> ON
                  YOUR SOUL PROFILE AND UNLOCK THE ARCHIVED VISUAL &amp; AUDIO
                  MEMORY OF THAT NIGHT.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
