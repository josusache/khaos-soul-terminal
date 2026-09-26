import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface KhaosFrequenciesProps {
  soulId: string;
}

interface SignalLayer {
  id: 'IGNHUM' | 'MECHANICAL' | 'ICE' | 'DESERT';
  name: string;
  subtitle: string;
  color: string;
  active: boolean;
  gain: number;
  variant: 0 | 1 | 2;
}

const INITIAL_LAYERS: SignalLayer[] = [
  {
    id: 'IGNHUM',
    name: 'IGNHUM SIGNAL',
    subtitle: 'SUB-TERRESTRIAL SCHRANZ PULSE // 45-120 HZ',
    color: '#EA1D25',
    active: true,
    gain: 85,
    variant: 0,
  },
  {
    id: 'MECHANICAL',
    name: 'MECHANICAL SIGNAL',
    subtitle: 'INDUSTRIAL METALLIC PERCUSSION // ANVIL LOOP',
    color: '#D6BA72',
    active: true,
    gain: 75,
    variant: 0,
  },
  {
    id: 'ICE',
    name: 'ICE SIGNAL',
    subtitle: 'CRYSTALLINE ACID SEQUENCE // HIGH-FREQ MATRIX',
    color: '#F5F5F0',
    active: false,
    gain: 65,
    variant: 1,
  },
  {
    id: 'DESERT',
    name: 'DESERT SIGNAL',
    subtitle: 'VOID CHOIR & VENDEX VOCAL STEM INTERCEPT',
    color: '#B99A53',
    active: true,
    gain: 70,
    variant: 0,
  },
];

// Generate a real 15-second 16-bit PCM WAV file from the user's 4-layer configuration
function renderPersonalTransmissionWav(
  layers: SignalLayer[],
  bpm: number
): Blob {
  const sampleRate = 22050;
  const durationSec = 15;
  const numSamples = sampleRate * durationSec;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const ignhum = layers.find((l) => l.id === 'IGNHUM');
  const mech = layers.find((l) => l.id === 'MECHANICAL');
  const ice = layers.find((l) => l.id === 'ICE');
  const desert = layers.find((l) => l.id === 'DESERT');

  const beatDuration = 60 / bpm;
  const stepDuration = beatDuration / 4;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const step = Math.floor(t / stepDuration);
    const stepTime = t % stepDuration;
    const beatTime = t % beatDuration;

    let sample = 0;

    // 1. IGNHUM: Hard distorted kick + sub rumble
    if (ignhum?.active) {
      const g = ignhum.gain / 100;
      const kickEnv = Math.exp(-beatTime * 14);
      const kickFreq = 44 + 115 * Math.exp(-beatTime * 38);
      const kick = Math.tanh(Math.sin(2 * Math.PI * kickFreq * beatTime) * 2.6) * kickEnv;
      const rumble =
        Math.sin(2 * Math.PI * (38 + ignhum.variant * 4) * t) *
        0.35 *
        (beatTime > beatDuration * 0.4 ? 1 : 0.2);
      sample += (kick * 0.65 + rumble) * g;
    }

    // 2. MECHANICAL: Metallic offbeat anvil & industrial 16th clatter
    if (mech?.active) {
      const g = mech.gain / 100;
      const isOffbeat = step % 4 === 2;
      const hatEnv = Math.exp(-stepTime * (isOffbeat ? 22 : 55));
      const metallic =
        (Math.sin(2 * Math.PI * 840 * t) *
          Math.sin(2 * Math.PI * (1930 + mech.variant * 310) * t) +
          (Math.random() * 2 - 1) * 0.5) *
        hatEnv;
      sample += metallic * 0.38 * g;
    }

    // 3. ICE: Crystalline acid arpeggio
    if (ice?.active) {
      const g = ice.gain / 100;
      const notes = [110, 116.54, 130.81, 146.83, 164.81, 110, 98, 130.81];
      const freq =
        notes[(step + ice.variant * 2) % notes.length] *
        (ice.variant === 2 ? 2 : 1);
      const env = Math.exp(-stepTime * 18);
      const saw = ((t * freq) % 1) * 2 - 1;
      sample += Math.tanh(saw * 2.2) * env * 0.32 * g;
    }

    // 4. DESERT: Deep dimensional choir / drone pad
    if (desert?.active) {
      const g = desert.gain / 100;
      const dFreq = 55 + desert.variant * 13.75;
      const drone =
        (Math.sin(2 * Math.PI * dFreq * t) +
          0.5 * Math.sin(2 * Math.PI * dFreq * 1.5 * t) +
          0.3 * Math.sin(2 * Math.PI * (dFreq * 2.01) * t)) *
        0.22;
      sample += drone * g;
    }

    const clamped = Math.max(-1, Math.min(1, Math.tanh(sample * 1.25)));
    view.setInt16(44 + i * 2, clamped * 32767, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export const KhaosFrequencies: React.FC<KhaosFrequenciesProps> = ({
  soulId,
}) => {
  const [layers, setLayers] = useState<SignalLayer[]>(INITIAL_LAYERS);
  const [bpm, setBpm] = useState<number>(156);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genSeconds, setGenSeconds] = useState<number>(0);
  const [generatedWavUrl, setGeneratedWavUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stepTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const layersRef = useRef(layers);
  layersRef.current = layers;

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (vocalAudioRef.current) {
        vocalAudioRef.current.pause();
      }
    };
  }, []);

  // Sync live step sequencer when isRunning or bpm changes
  useEffect(() => {
    if (!isRunning) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      if (vocalAudioRef.current) vocalAudioRef.current.pause();
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!audioCtxRef.current && AudioCtx) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }

    // Play low-level Vendex stem loop if DESERT layer is active
    if (!vocalAudioRef.current) {
      const a = new Audio('/assets/audio/transmission_031.mp3');
      a.loop = true;
      vocalAudioRef.current = a;
    }

    let stepIdx = 0;
    const stepMs = (60 / bpm / 4) * 1000;

    const triggerStep = () => {
      if (!ctx) return;
      const now = ctx.currentTime;
      const s = stepIdx % 16;
      const currentLayers = layersRef.current;

      const ignhum = currentLayers.find((l) => l.id === 'IGNHUM');
      const mech = currentLayers.find((l) => l.id === 'MECHANICAL');
      const ice = currentLayers.find((l) => l.id === 'ICE');
      const desert = currentLayers.find((l) => l.id === 'DESERT');

      // Sync vocal stem volume with DESERT layer
      if (vocalAudioRef.current) {
        if (desert?.active) {
          vocalAudioRef.current.volume = Math.min(1, (desert.gain / 100) * 0.55);
          if (vocalAudioRef.current.paused) {
            vocalAudioRef.current.play().catch(() => {});
          }
        } else if (!vocalAudioRef.current.paused) {
          vocalAudioRef.current.pause();
        }
      }

      // 1. IGNHUM: 4x4 Schranz Kick & Sub Rumble
      if (ignhum?.active && s % 4 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(155 + ignhum.variant * 20, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(26, now + 0.24);

        gain.gain.setValueAtTime((ignhum.gain / 100) * 0.34, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      }

      // 2. MECHANICAL: Metallic off-beat & industrial percussion
      if (mech?.active && (s % 4 === 2 || (mech.variant > 0 && s % 2 === 1))) {
        const bufSize = Math.floor(ctx.sampleRate * 0.055);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;

        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(3200 + mech.variant * 1400, now);
        bp.Q.setValueAtTime(3.5, now);

        const g = ctx.createGain();
        g.gain.setValueAtTime((mech.gain / 100) * 0.12, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

        noise.connect(bp);
        bp.connect(g);
        g.connect(ctx.destination);
        noise.start(now);
      }

      // 3. ICE: Crystalline Acid Synth
      if (ice?.active) {
        const pattern = [
          110, 0, 116.5, 130.8, 110, 146.8, 0, 164.8, 110, 0, 116.5, 130.8,
          174.6, 146.8, 130.8, 98,
        ];
        const note = pattern[(s + ice.variant * 3) % pattern.length];
        if (note > 0) {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const g = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(
            note * (ice.variant === 2 ? 2 : 1),
            now
          );

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(900 + (s % 6) * 320, now);
          filter.Q.setValueAtTime(7, now);

          g.gain.setValueAtTime((ice.gain / 100) * 0.09, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

          osc.connect(filter);
          filter.connect(g);
          g.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.11);
        }
      }

      stepIdx++;
    };

    triggerStep();
    stepTimerRef.current = window.setInterval(triggerStep, stepMs);

    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, [isRunning, bpm]);

  // 4-Layer Visual Oscilloscope Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const renderScope = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = 'rgba(5, 5, 5, 0.32)';
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(237, 237, 234, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      layersRef.current.forEach((layer, idx) => {
        if (!layer.active) return;
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();

        const amp =
          (layer.gain / 100) * (isRunning ? h * 0.28 : h * 0.06);
        const freq = 0.012 * (idx + 1) + layer.variant * 0.005;
        const speed = isRunning ? time * 0.008 * (idx + 1) : time * 0.001;

        for (let x = 0; x < w; x += 3) {
          const y =
            h / 2 +
            Math.sin(x * freq + speed) * amp * Math.sin(x * 0.004 - speed * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderScope);
    };

    animId = requestAnimationFrame(renderScope);
    return () => cancelAnimationFrame(animId);
  }, [isRunning]);

  const toggleLayer = (id: SignalLayer['id']) => {
    soundEngine.playClick(1100);
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  const updateGain = (id: SignalLayer['id'], gain: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, gain } : l))
    );
  };

  const cycleVariant = (id: SignalLayer['id']) => {
    soundEngine.playClick(1400);
    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, variant: ((l.variant + 1) % 3) as 0 | 1 | 2 }
          : l
      )
    );
  };

  const handleGenerate15s = () => {
    if (isGenerating) return;
    soundEngine.playVendexPulse();
    if (!isRunning) setIsRunning(true);
    setIsGenerating(true);
    setGenSeconds(0);
    setGeneratedWavUrl(null);

    let sec = 0;
    const timer = window.setInterval(() => {
      sec += 1;
      setGenSeconds(sec);
      if (sec >= 15) {
        clearInterval(timer);
        const wavBlob = renderPersonalTransmissionWav(layersRef.current, bpm);
        const url = URL.createObjectURL(wavBlob);
        setGeneratedWavUrl(url);
        setIsGenerating(false);
        soundEngine.playConnectionRestored();
      }
    }, 220); // Fast-forwarded diegetic 15s synthesis in ~3.3s real time so it's immediate!
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#D6BA72]">
            NODE 09 // INTERDIMENSIONAL ACOUSTIC LABORATORY
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            KHAOS FREQUENCIES
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* BPM Control */}
          <div className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 flex items-center gap-3 font-mono text-xs tracking-[0.2em]">
            <span className="text-[#EDEDEA]/50">PULSE:</span>
            <button
              onClick={() => setBpm((b) => Math.max(145, b - 2))}
              className="text-[#D6BA72] px-1"
            >
              -
            </button>
            <span className="text-[#EDEDEA] font-bold">{bpm} BPM</span>
            <button
              onClick={() => setBpm((b) => Math.min(168, b + 2))}
              className="text-[#D6BA72] px-1"
            >
              +
            </button>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsRunning((r) => !r);
            }}
            className={`px-5 py-2.5 border font-display text-xl font-bold tracking-[0.24em] uppercase transition-colors ${
              isRunning
                ? 'border-[#EA1D25] bg-[#B5161B]/30 text-[#EDEDEA]'
                : 'border-[#D6BA72] bg-[#D6BA72] text-[#050505]'
            }`}
          >
            {isRunning ? 'HALT MATRIX //' : 'ENGAGE SIGNAL LAB //'}
          </button>
        </div>
      </div>

      {/* Live Multi-Layer Oscilloscope Display */}
      <div className="border border-[#EDEDEA]/20 bg-[#050505] relative h-48 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/60 flex items-center gap-2">
          <span
            className={`w-2 h-2 ${
              isRunning ? 'bg-[#EA1D25] animate-pulse' : 'bg-[#D6BA72]'
            }`}
          />
          <span>
            4-CHANNEL DIMENSIONAL INTERFERENCE SCOPE //{' '}
            {isRunning ? 'LIVE STREAM' : 'STANDBY'}
          </span>
        </div>
        <div className="absolute bottom-3 right-4 font-mono text-[10px] tracking-[0.22em] text-[#D6BA72]">
          ACTIVE LAYERS: {layers.filter((l) => l.active).length} / 04
        </div>
      </div>

      {/* 4 Dimensional Signal Stems */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`border p-5 flex flex-col justify-between space-y-4 transition-colors ${
              layer.active
                ? 'border-[#D6BA72] bg-[#080808]'
                : 'border-[#EDEDEA]/15 bg-[#050505] opacity-65'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/55">
                  {layer.subtitle}
                </div>
                <h2
                  className="font-display text-3xl font-bold tracking-[0.22em] mt-0.5"
                  style={{ color: layer.active ? layer.color : '#EDEDEA' }}
                >
                  {layer.name}
                </h2>
              </div>

              <button
                onClick={() => toggleLayer(layer.id)}
                className={`px-3.5 py-1.5 border font-mono text-[10px] tracking-[0.22em] uppercase ${
                  layer.active
                    ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                    : 'border-[#EDEDEA]/25 text-[#EDEDEA]/50'
                }`}
              >
                {layer.active ? 'SIGNAL // ON' : 'MUTED'}
              </button>
            </div>

            {/* Gain Slider + Variant Selector */}
            <div className="space-y-3 pt-2 border-t border-[#EDEDEA]/10">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em]">
                <span className="text-[#EDEDEA]/60">SIGNAL AMPLITUDE</span>
                <span className="text-[#D6BA72] font-bold">{layer.gain}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={layer.gain}
                onChange={(e) => updateGain(layer.id, Number(e.target.value))}
                className="w-full accent-[#D6BA72] cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/50">
                  DIMENSIONAL PATTERN //
                </span>
                <button
                  onClick={() => cycleVariant(layer.id)}
                  className="border border-[#EDEDEA]/25 hover:border-[#D6BA72] px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA] hover:text-[#D6BA72]"
                >
                  PATTERN 0{layer.variant + 1} [SWITCH]
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generate 15-Second Personal Transmission Panel */}
      <div className="border border-[#B99A53]/50 bg-[#080808] p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72] flex items-center gap-2">
            <VendexSymbol size={16} color="#D6BA72" />
            <span>PERSONAL TRANSMISSION SYNTHESIZER // 15.0 SECONDS</span>
          </div>
          <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/75">
            ENCODE YOUR ACTIVE 4-LAYER DIMENSIONAL MIX INTO A 15-SECOND PERSONAL
            AUDIO TRANSMISSION TIED TO {soulId}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {generatedWavUrl && (
            <a
              href={generatedWavUrl}
              download={`KHAOS_TX_${soulId}_15S.wav`}
              onClick={() => soundEngine.playClick()}
              className="px-5 py-3 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#B99A53]/40 font-mono text-xs tracking-[0.22em] text-[#D6BA72] uppercase"
            >
              DOWNLOAD 15S .WAV //
            </a>
          )}

          <button
            onClick={handleGenerate15s}
            disabled={isGenerating}
            className="px-6 py-3.5 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] font-display text-2xl font-bold tracking-[0.24em] uppercase"
          >
            {isGenerating
              ? `ENCODING MIX... [${genSeconds}S / 15S]`
              : 'GENERATE 15S TRANSMISSION'}
          </button>
        </div>
      </div>
    </div>
  );
};
