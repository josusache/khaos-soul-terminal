import React, { useState } from 'react';
import {
  decodeUnknownSignal,
  loadValkhorDb,
  triggerSubKernelDiscovery,
} from '../services/valkhorBackend';
import { SectionId, SoulState, UnlockItem } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface SignalDecoderProps {
  soulState: SoulState;
  onApplySoulPatch: (patch: Partial<SoulState>, toast?: string) => void;
  onNavigate: (section: SectionId) => void;
}

export const SignalDecoder: React.FC<SignalDecoderProps> = ({
  soulState,
  onApplySoulPatch,
  onNavigate,
}) => {
  const [signalInput, setSignalInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [resultState, setResultState] = useState<{
    ok: boolean;
    banner: string;
    message: string;
    unlocked?: UnlockItem;
  } | null>(null);
  const [anomalyPulseCount, setAnomalyPulseCount] = useState<number>(0);

  const db = loadValkhorDb();
  const decodedSignalIds = soulState.signalsDecoded || [];
  const unlockedItems = db.unlocks.filter((u) =>
    (soulState.unlockedIds || []).includes(u.id)
  );

  const handleDecodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signalInput.trim() || isScanning) return;

    soundEngine.playVendexPulse();
    setIsScanning(true);
    setResultState(null);

    const res = await decodeUnknownSignal(soulState, signalInput);
    setIsScanning(false);

    if (res.ok) {
      soundEngine.playConnectionRestored();
      setResultState({
        ok: true,
        banner: res.terminalBanner,
        message: res.message,
        unlocked: res.unlockedItem,
      });
      if (res.updatedSoulPatch) {
        onApplySoulPatch(res.updatedSoulPatch, res.terminalBanner);
      }
      setSignalInput('');
    } else {
      soundEngine.playAlarm();
      setResultState({
        ok: false,
        banner: res.terminalBanner,
        message: res.message,
      });
    }
  };

  // Hidden anomaly discovery trigger: clicking the telemetry frequency node 3 times reveals PROTOCOL // 0999
  const handleInspectSubKernelNode = () => {
    soundEngine.playGlitch(0.4);
    const next = anomalyPulseCount + 1;
    setAnomalyPulseCount(next);
    if (next >= 3) {
      soundEngine.playConnectionRestored();
      const disc = triggerSubKernelDiscovery(soulState);
      onApplySoulPatch(
        disc.updatedSoulPatch,
        'ANOMALY DETECTED // SUB-KERNEL NODE UNLOCKED.'
      );
      setResultState({
        ok: true,
        banner: 'SUB-KERNEL ANOMALY ISOLATED.',
        message:
          'UNDISCOVERED PROTOCOL // 0999 HAS BEEN REVEALED IN THE PROTOCOL DATABASE.',
      });
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#D6BA72]">
            SIGNAL DECODER // EXTERNAL FREQUENCY RECEIVER
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            SIGNAL DECODER
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-mono text-[10px] tracking-[0.22em] border border-[#B99A53]/40 bg-[#050505] px-4 py-2 text-[#D6BA72]">
            SIGNALS IDENTIFIED // {decodedSignalIds.length}
          </div>
          <button
            type="button"
            onClick={handleInspectSubKernelNode}
            title="SUB-KERNEL CARRIER WAVE"
            className="px-3 py-2 border border-[#EDEDEA]/15 hover:border-[#D6BA72]/60 bg-[#050505] font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/45 hover:text-[#D6BA72] transition-colors"
          >
            0x00.{anomalyPulseCount}
          </button>
        </div>
      </div>

      {/* Main Decoder Terminal Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 border border-[#B99A53]/50 bg-[#080808] p-6 sm:p-8 space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-4">
            <div className="space-y-1">
              <div className="font-mono text-[10px] tracking-[0.25em] text-[#D6BA72]">
                VALKHOR CRYPTOGRAPHIC INTERCEPTOR
              </div>
              <h2 className="font-display text-3xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                ENTER UNKNOWN SIGNAL
              </h2>
            </div>
            <VendexSymbol size={36} color="#D6BA72" />
          </div>

          <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/70 leading-relaxed">
            TRANSMIT SIGNALS INTERCEPTED FROM LIVE VISUALS, PHYSICAL VINYL
            ETCHINGS, APPAREL TAGS, POSTERS, SOUNDCLOUD SPECTROGRAMS, OR LIVE
            EVENT WITNESS DISPLAYS.
          </p>

          <form onSubmit={handleDecodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/50">
                SIGNAL INPUT STREAM // SHA-256 VERIFICATION
              </label>
              <input
                type="text"
                value={signalInput}
                onChange={(e) => setSignalInput(e.target.value.toUpperCase())}
                placeholder="ENTER UNKNOWN SIGNAL"
                className="w-full border-2 border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#050505] px-5 py-4 font-mono text-base sm:text-lg tracking-[0.26em] text-[#EDEDEA] placeholder:text-[#EDEDEA]/25 focus:outline-none uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={isScanning}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full py-4 border border-[#D6BA72] bg-[#D6BA72] hover:bg-[#B99A53] text-[#050505] font-display text-2xl font-bold tracking-[0.28em] uppercase transition-colors"
            >
              {isScanning ? 'VERIFYING SIGNAL HASH...' : 'DECODE'}
            </button>
          </form>

          {/* Decoder Response Banner */}
          {resultState && (
            <div
              className={`border-2 p-5 space-y-2.5 font-mono transition-all ${
                resultState.ok
                  ? 'border-[#D6BA72] bg-[#B99A53]/15 text-[#EDEDEA]'
                  : 'border-[#EA1D25] bg-[#B5161B]/20 text-[#EA1D25]'
              }`}
            >
              <div className="flex items-center justify-between text-xs tracking-[0.24em] font-bold">
                <span className={resultState.ok ? 'text-[#D6BA72]' : 'text-[#EA1D25]'}>
                  {resultState.banner}
                </span>
                <span>[KERNEL_RESPONSE]</span>
              </div>
              <div className="text-xs sm:text-sm tracking-[0.18em]">
                &gt; {resultState.message}
              </div>

              {resultState.unlocked && (
                <div className="mt-3 pt-3 border-t border-[#D6BA72]/40 space-y-2">
                  <div className="text-[10px] tracking-[0.24em] text-[#D6BA72] font-bold">
                    UNLOCKED CONTENT // {resultState.unlocked.code} —{' '}
                    {resultState.unlocked.title}
                  </div>
                  {resultState.unlocked.description.map((line, i) => (
                    <div
                      key={i}
                      className="text-xs tracking-[0.15em] text-[#EDEDEA]/85"
                    >
                      {line}
                    </div>
                  ))}
                  {resultState.unlocked.audioUrl && (
                    <audio
                      controls
                      src={resultState.unlocked.audioUrl}
                      className="w-full mt-2 h-9 filter invert contrast-125"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active Signal Vectors Reference */}
          <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-3">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/50 border-b border-[#EDEDEA]/10 pb-2">
              <span>MONITORED SIGNAL CHANNELS</span>
              <span className="text-[#D6BA72]">ACTIVE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[10px] tracking-[0.16em]">
              {db.signals.map((sig) => {
                const isDecoded = decodedSignalIds.includes(sig.id);
                return (
                  <div
                    key={sig.id}
                    className={`border p-3 space-y-1 ${
                      isDecoded
                        ? 'border-[#D6BA72]/70 bg-[#B99A53]/10'
                        : 'border-[#EDEDEA]/10 bg-[#080808]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#D6BA72] font-bold">
                        {sig.maskedLabel}
                      </span>
                      <span
                        className={
                          isDecoded ? 'text-[#D6BA72]' : 'text-[#EDEDEA]/40'
                        }
                      >
                        {isDecoded ? 'DECODED' : 'ENCRYPTED'}
                      </span>
                    </div>
                    <div className="text-[#EDEDEA]/65 truncate">
                      {sig.source}
                    </div>
                    <div className="text-[#EDEDEA]/40 text-[9px]">
                      ORIGIN: {sig.origin} // PRIOR DETECTIONS:{' '}
                      {sig.priorDiscoverersCount + sig.discoveredBy.length}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Decoded Unlocks & Cross-Module Links */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
              <span className="text-[#D6BA72]">UNLOCK ENGINE // RECOVERED</span>
              <span className="text-[#EDEDEA]/50">
                {unlockedItems.length} RECORDS
              </span>
            </div>

            {unlockedItems.length === 0 ? (
              <div className="border border-[#EDEDEA]/10 bg-[#050505] p-6 text-center font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/45 space-y-2">
                <div>NO EXTERNAL SIGNALS OR ARCHIVES UNLOCKED YET.</div>
                <div className="text-[10px] text-[#EDEDEA]/35">
                  INTERCEPT CODES IN PROTOCOLS, EVENTS, OR PHYSICAL ARTIFACTS.
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                {unlockedItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#D6BA72]/60 bg-[#050505] p-4 space-y-2 font-mono"
                  >
                    <div className="flex items-center justify-between text-[10px] tracking-[0.22em]">
                      <span className="text-[#D6BA72] font-bold">
                        {item.code}
                      </span>
                      <span className="border border-[#D6BA72]/40 px-1.5 py-0.5 text-[9px] text-[#D6BA72]">
                        {item.type}
                      </span>
                    </div>
                    <div className="font-display text-2xl font-bold tracking-[0.2em] text-[#EDEDEA]">
                      {item.title}
                    </div>
                    <div className="space-y-1 text-[11px] tracking-[0.15em] text-[#EDEDEA]/75">
                      {item.description.map((line, idx) => (
                        <div key={idx}>&gt; {line}</div>
                      ))}
                    </div>
                    {item.audioUrl && (
                      <audio
                        controls
                        src={item.audioUrl}
                        className="w-full mt-2 h-8 filter invert contrast-125"
                      />
                    )}
                    {item.vendexNote && (
                      <div className="pt-1.5 border-t border-[#EDEDEA]/10 text-[10px] tracking-[0.2em] text-[#D6BA72]">
                        VENDEX // &ldquo;{item.vendexNote}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation shortcuts to related nodes */}
          <div className="border border-[#EDEDEA]/15 bg-[#080808] p-4 space-y-2.5 font-mono text-xs tracking-[0.2em]">
            <div className="text-[10px] text-[#EDEDEA]/45">
              CONNECTED OPERATIONS //
            </div>
            <button
              type="button"
              onClick={() => onNavigate('PROTOCOLS')}
              className="w-full py-2.5 px-3 border border-[#EDEDEA]/20 hover:border-[#D6BA72] text-left flex justify-between items-center text-[#EDEDEA]/80 hover:text-[#D6BA72] transition-colors"
            >
              <span>OPEN PROTOCOL DATABASE</span>
              <span>[NODE 08]</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ARTIFACT_STORAGE')}
              className="w-full py-2.5 px-3 border border-[#EDEDEA]/20 hover:border-[#D6BA72] text-left flex justify-between items-center text-[#EDEDEA]/80 hover:text-[#D6BA72] transition-colors"
            >
              <span>AUTHENTICATE PHYSICAL ARTIFACT</span>
              <span>[NODE 13]</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('SOUL_PROFILE')}
              className="w-full py-2.5 px-3 border border-[#EDEDEA]/20 hover:border-[#D6BA72] text-left flex justify-between items-center text-[#EDEDEA]/80 hover:text-[#D6BA72] transition-colors"
            >
              <span>INSPECT SOUL RECORD</span>
              <span>[DOSSIER]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
