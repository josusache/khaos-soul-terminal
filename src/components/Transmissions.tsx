import React, { useEffect, useRef, useState } from 'react';
import { TRANSMISSIONS_DATA } from '../data/valkhorData';
import { TransmissionItem } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';

interface TransmissionsProps {
  onAudioActivated?: () => void;
}

const formatTime = (secs: number): string => {
  if (!Number.isFinite(secs) || secs < 0) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const Transmissions: React.FC<TransmissionsProps> = ({
  onAudioActivated,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [spectrum, setSpectrum] = useState<number[]>(Array(40).fill(18));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const startSpectrumLoop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const update = () => {
      const analyser = analyserRef.current;
      const audio = audioRef.current;

      if (analyser && audio && !audio.paused) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);

        const bars: number[] = [];
        const numBars = 40;
        const step = Math.max(1, Math.floor((data.length * 0.65) / numBars));
        for (let i = 0; i < numBars; i++) {
          const val = data[i * step] || 0;
          bars.push(Math.max(10, Math.min(98, Math.round((val / 255) * 98))));
        }
        setSpectrum(bars);
        setCurrentTime(audio.currentTime);
        if (audio.duration) setDuration(audio.duration);
        rafRef.current = requestAnimationFrame(update);
      }
    };

    rafRef.current = requestAnimationFrame(update);
  };

  const handleStopAudio = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingId(null);
  };

  const handleTogglePlay = (tx: TransmissionItem) => {
    // Stop procedural synth if any was active
    soundEngine.stopTransmission();

    if (playingId === tx.id) {
      handleStopAudio();
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setCurrentTime(0);
      });
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (audio.src !== window.location.origin + tx.audioUrl) {
      audio.src = tx.audioUrl;
      setCurrentTime(0);
    }

    // Set up Web Audio API AnalyserNode for real-time frequency bars
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!sourceNodeRef.current) {
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.76;
        const source = audioCtxRef.current.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
        analyserRef.current = analyser;
        sourceNodeRef.current = source;
      }
    } catch {
      // Fallback if MediaElementSource already attached
    }

    audio
      .play()
      .then(() => {
        setPlayingId(tx.id);
        startSpectrumLoop();
        if (onAudioActivated) onAudioActivated();
      })
      .catch(() => {
        // Fallback if play blocked
      });
  };

  const handleSeek = (
    e: React.MouseEvent<HTMLDivElement>,
    tx: TransmissionItem
  ) => {
    if (playingId !== tx.id || !audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width)
    );
    audioRef.current.currentTime = ratio * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Section 27: TRANSMISSIONS RECEIVED FROM EARTH */}
      <div className="space-y-5">
        <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.26em] text-[#8E7443]">
              NODE 07 // ACOUSTIC TELEMETRY DECODER
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
              TRANSMISSIONS RECEIVED FROM EARTH
            </h1>
          </div>

          {playingId && (
            <button
              onClick={handleStopAudio}
              className="border border-[#EA1D25] bg-[#B5161B]/20 px-4 py-2 font-mono text-xs tracking-[0.22em] text-[#EA1D25] uppercase flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-[#EA1D25] animate-pulse-alert" />
              <span>HALT ACOUSTIC SIGNAL</span>
            </button>
          )}
        </div>

        {/* Scientific Signal Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {TRANSMISSIONS_DATA.map((tx) => {
            const isPlaying = playingId === tx.id;
            const progressRatio =
              isPlaying && duration > 0 ? currentTime / duration : 0;

            const bars = Array.from({ length: 40 }, (_, i) => {
              if (isPlaying) {
                return spectrum[i] || 15;
              }
              return 18 + ((tx.waveformSeed * (i + 5) * 23) % 72);
            });

            return (
              <div
                key={tx.id}
                className={`border bg-[#080808] p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isPlaying ? 'border-[#D6BA72]' : 'border-[#EDEDEA]/15'
                }`}
              >
                {/* Top Header */}
                <div className="flex items-start justify-between gap-4 border-b border-[#EDEDEA]/10 pb-3">
                  <div>
                    <div className="font-mono text-xs tracking-[0.24em] text-[#D6BA72] font-bold">
                      {tx.code}
                    </div>
                    <div className="font-display text-2xl font-bold tracking-[0.2em] text-[#EDEDEA] mt-0.5">
                      {tx.title}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[10px] tracking-[0.2em] px-2 py-0.5 border ${
                      isPlaying
                        ? 'border-[#EA1D25] text-[#EA1D25] animate-pulse'
                        : 'border-[#EDEDEA]/25 text-[#EDEDEA]/65'
                    }`}
                  >
                    STATUS // {isPlaying ? 'DECODING LIVE' : tx.status}
                  </span>
                </div>

                {/* Middle: Cover Specimen + Scientific Telemetry */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Cover Specimen */}
                  <div className="sm:col-span-4 h-36 bg-[#050505] border border-[#EDEDEA]/15 relative overflow-hidden">
                    <img
                      src={tx.coverAsset}
                      alt={tx.code}
                      className={`w-full h-full object-cover filter grayscale contrast-125 transition-transform duration-300 ${
                        isPlaying ? 'scale-105 opacity-95' : 'opacity-65'
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    <div className="absolute bottom-1.5 left-2 font-mono text-[9px] tracking-[0.2em] text-[#D6BA72]">
                      {tx.date} // {tx.duration}
                    </div>
                  </div>

                  {/* Metadata Matrix */}
                  <div className="sm:col-span-8 grid grid-cols-2 gap-2 font-mono text-[11px] tracking-[0.16em]">
                    <div className="border border-[#EDEDEA]/10 bg-[#050505] p-2.5">
                      <div className="text-[#EDEDEA]/40 text-[9px]">SOURCE //</div>
                      <div className="text-[#EDEDEA] font-bold mt-0.5">
                        {tx.source}
                      </div>
                    </div>
                    <div className="border border-[#EDEDEA]/10 bg-[#050505] p-2.5">
                      <div className="text-[#EDEDEA]/40 text-[9px]">ENTITY //</div>
                      <div className="text-[#D6BA72] font-bold mt-0.5">
                        {tx.entity}
                      </div>
                    </div>
                    <div className="border border-[#EDEDEA]/10 bg-[#050505] p-2.5">
                      <div className="text-[#EDEDEA]/40 text-[9px]">TYPE //</div>
                      <div className="text-[#EDEDEA] font-bold mt-0.5">
                        {tx.type}
                      </div>
                    </div>
                    <div className="border border-[#EDEDEA]/10 bg-[#050505] p-2.5">
                      <div className="text-[#EDEDEA]/40 text-[9px]">
                        FREQUENCY //
                      </div>
                      <div className="text-[#D6BA72] font-bold mt-0.5">
                        {tx.bpm} BPM
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-Time Waveform & Play/Scrub Trigger */}
                <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 flex items-center gap-4">
                  <button
                    onClick={() => handleTogglePlay(tx)}
                    className={`px-4 py-2.5 border font-mono text-xs tracking-[0.22em] uppercase shrink-0 transition-colors ${
                      isPlaying
                        ? 'border-[#EA1D25] bg-[#B5161B]/30 text-[#EDEDEA]'
                        : 'border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#B99A53]/35 text-[#EDEDEA]'
                    }`}
                  >
                    {isPlaying ? 'PAUSE //' : 'DECODE // PLAY'}
                  </button>

                  {/* Interactive Spectrum / Waveform Seek Bar */}
                  <div
                    onClick={(e) => handleSeek(e, tx)}
                    data-interactive="true"
                    data-tooltip={
                      isPlaying ? 'CLICK WAVEFORM TO SCRUB SIGNAL' : undefined
                    }
                    className="flex-1 h-11 flex items-end gap-[2px] overflow-hidden relative py-0.5"
                  >
                    {bars.map((h, i) => {
                      const barPos = i / bars.length;
                      const isPassed = isPlaying && barPos <= progressRatio;
                      return (
                        <div
                          key={i}
                          className={`flex-1 transition-all duration-75 ${
                            isPlaying
                              ? isPassed
                                ? i % 5 === 0
                                  ? 'bg-[#EA1D25]'
                                  : 'bg-[#D6BA72]'
                                : 'bg-[#D6BA72]/35'
                              : 'bg-[#EDEDEA]/25'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      );
                    })}
                  </div>

                  <div className="font-mono text-[10px] tracking-[0.18em] text-[#D6BA72] shrink-0 text-right min-w-[76px]">
                    {isPlaying
                      ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                      : tx.duration}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
