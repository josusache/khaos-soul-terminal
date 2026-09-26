import React, { useEffect, useState } from 'react';
import { ARCHIVE_DOCUMENTS } from '../data/valkhorData';
import { ArchiveDocument } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface ArchiveProps {
  onReadDocument: (docId: string) => void;
}

export const Archive: React.FC<ArchiveProps> = ({ onReadDocument }) => {
  const [selectedDoc, setSelectedDoc] = useState<ArchiveDocument>(
    ARCHIVE_DOCUMENTS[6] // Default to ARCHIVE_0044 // VENIRIS or 0001
  );
  const [decryptedIds, setDecryptedIds] = useState<string[]>([]);

  // Special state for ARCHIVE_0046 // VENDEX superposition animation (Section 25)
  // 0: V E N I R I S
  // 1: D E X T R A L E
  // 2: Superposition + Glitch
  // 3: # VENDEX
  const [superpositionStage, setSuperpositionStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    onReadDocument(selectedDoc.id);

    if (selectedDoc.id === '0046') {
      setSuperpositionStage(0);
      const t1 = window.setTimeout(() => {
        soundEngine.playClick(900);
        setSuperpositionStage(1);
      }, 1100);
      const t2 = window.setTimeout(() => {
        soundEngine.playGlitch(1.2);
        setSuperpositionStage(2);
      }, 2200);
      const t3 = window.setTimeout(() => {
        soundEngine.playVendexPulse();
        setSuperpositionStage(3);
      }, 3100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [selectedDoc.id]);

  const isDenied =
    selectedDoc.clearance === 'DENIED' &&
    !decryptedIds.includes(selectedDoc.id) &&
    selectedDoc.id !== '0046';

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.26em] text-[#8E7443]">
            NODE 06 // CLASSIFIED REPOSITORY
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            ARCHIVE
          </h1>
        </div>

        <div className="font-mono text-xs tracking-[0.22em] border border-[#EDEDEA]/20 bg-[#050505] px-4 py-2">
          <span className="text-[#EDEDEA]/45">INTEGRITY // </span>
          <span className="text-[#EA1D25] font-bold">PARTIALLY CORRUPTED</span>
        </div>
      </div>

      {/* Main Two-Column Database Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Directory Index */}
        <div className="lg:col-span-5 border border-[#EDEDEA]/15 bg-[#080808] divide-y divide-[#EDEDEA]/10">
          <div className="px-4 py-3 font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/45 flex justify-between">
            <span>DOCUMENT INDEX</span>
            <span>10 RECORDS</span>
          </div>

          {ARCHIVE_DOCUMENTS.map((doc) => {
            const isSelected = doc.id === selectedDoc.id;
            const isDocUnlocked = decryptedIds.includes(doc.id);

            return (
              <button
                key={doc.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedDoc(doc);
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-2 font-mono text-xs tracking-[0.18em] transition-colors ${
                  isSelected
                    ? 'bg-[#B99A53]/15 text-[#EDEDEA] border-l-2 border-[#D6BA72]'
                    : 'text-[#EDEDEA]/70 hover:bg-[#EDEDEA]/[0.04] hover:text-[#EDEDEA]'
                }`}
              >
                <span className="truncate font-medium">{doc.code}</span>

                <span
                  className={`text-[9px] px-1.5 py-0.5 border shrink-0 ${
                    doc.clearance === 'DENIED' && !isDocUnlocked
                      ? 'border-[#EA1D25]/60 text-[#EA1D25]'
                      : doc.clearance === 'CORRUPTED'
                      ? 'border-[#B99A53]/60 text-[#D6BA72]'
                      : 'border-[#EDEDEA]/25 text-[#EDEDEA]/60'
                  }`}
                >
                  {doc.clearance === 'DENIED' && !isDocUnlocked
                    ? 'CLEARANCE // DENIED'
                    : doc.clearance === 'CORRUPTED'
                    ? `DATA // ${doc.corruptionPercentage}% CORRUPTED`
                    : 'DECLASSIFIED'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right 7 Cols: Archaeological Document Terminal */}
        <div className="lg:col-span-7 border border-[#EDEDEA]/15 bg-[#050505] p-6 sm:p-8 flex flex-col justify-between min-h-[520px] relative overflow-hidden">
          {/* Top Document Metadata */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EDEDEA]/15 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72]">
                  {selectedDoc.code}
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-1">
                  {selectedDoc.title}
                </h2>
              </div>

              <div
                className={`font-mono text-[10px] tracking-[0.22em] px-3 py-1.5 border ${
                  isDenied
                    ? 'border-[#EA1D25] text-[#EA1D25] bg-[#B5161B]/15'
                    : selectedDoc.clearance === 'CORRUPTED'
                    ? 'border-[#D6BA72] text-[#D6BA72]'
                    : 'border-[#EDEDEA]/30 text-[#EDEDEA]'
                }`}
              >
                {isDenied
                  ? 'CLEARANCE // DENIED'
                  : selectedDoc.clearance === 'CORRUPTED'
                  ? `DATA // ${selectedDoc.corruptionPercentage}% CORRUPTED`
                  : 'ACCESS // VERIFIED'}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedDoc.metadata.map((m) => (
                <div
                  key={m.label}
                  className="border border-[#EDEDEA]/15 bg-[#080808] p-3 font-mono text-[10px] tracking-[0.18em]"
                >
                  <div className="text-[#EDEDEA]/40 mb-1">{m.label} //</div>
                  <div className="text-[#EDEDEA] font-bold">{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Content Area */}
          <div className="my-auto py-8">
            {selectedDoc.isSpecialSuperposition ? (
              /* Special ARCHIVE_0046 // VENDEX Superposition Animation (Section 25) */
              <div className="border border-[#D6BA72]/40 bg-[#080808] p-8 text-center space-y-6 relative overflow-hidden">
                <div className="font-mono text-[10px] tracking-[0.28em] text-[#8E7443]">
                  ETYMOLOGICAL CONVERGENCE // 0044 + 0045
                </div>

                <div className="min-h-[140px] flex flex-col items-center justify-center relative">
                  {superpositionStage === 0 && (
                    <div className="font-mono text-2xl sm:text-4xl tracking-[0.45em] text-[#EDEDEA]">
                      V E N I R I S
                    </div>
                  )}

                  {superpositionStage === 1 && (
                    <div className="space-y-3">
                      <div className="font-mono text-xl sm:text-2xl tracking-[0.45em] text-[#EDEDEA]/55">
                        V E N I R I S
                      </div>
                      <div className="font-mono text-2xl sm:text-4xl tracking-[0.45em] text-[#D6BA72]">
                        D E X T R A L E
                      </div>
                    </div>
                  )}

                  {superpositionStage === 2 && (
                    <div className="relative flex items-center justify-center animate-glitch-slice">
                      <div className="font-mono text-3xl sm:text-5xl tracking-[0.4em] text-[#EA1D25] opacity-80">
                        V E N I R I S
                      </div>
                      <div className="absolute font-mono text-3xl sm:text-5xl tracking-[0.4em] text-[#D6BA72] translate-x-2 -translate-y-1">
                        D E X T R A L E
                      </div>
                    </div>
                  )}

                  {superpositionStage === 3 && (
                    <div className="flex flex-col items-center space-y-4 animate-flicker">
                      <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.35em] text-[#EDEDEA]/40">
                        <span>VENIRIS</span>
                        <span>+</span>
                        <span>DEXTRALE</span>
                      </div>
                      <h3 className="font-display text-6xl sm:text-7xl font-extrabold tracking-[0.32em] text-[#D6BA72] gold-phosphor">
                        VENDEX
                      </h3>
                      <VendexSymbol size={44} color="#D6BA72" />
                    </div>
                  )}
                </div>

                {superpositionStage === 3 && (
                  <div className="pt-4 border-t border-[#EDEDEA]/10 space-y-2 text-left font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/80">
                    {selectedDoc.fragments.map((frag, idx) => (
                      <div key={idx}>&gt; {frag}</div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setSuperpositionStage(0);
                    window.setTimeout(() => setSuperpositionStage(1), 800);
                    window.setTimeout(() => setSuperpositionStage(2), 1600);
                    window.setTimeout(() => setSuperpositionStage(3), 2300);
                  }}
                  className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72] underline uppercase"
                >
                  REPLAY CONVERGENCE
                </button>
              </div>
            ) : isDenied ? (
              /* Restricted / Denied State with Vendex Override Button */
              <div className="border-2 border-[#EA1D25] bg-[#080808] p-8 text-center space-y-5">
                <div className="font-display text-3xl sm:text-4xl font-bold tracking-[0.26em] text-[#EA1D25]">
                  CLEARANCE // DENIED
                </div>
                <p className="font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/65 max-w-md mx-auto">
                  THIS RECORD IS SEALED UNDER LABORATORY DIRECTIVE 09. UNAUTHORIZED HOSTS ARE PROHIBITED FROM READING THIS FILE.
                </p>
                <button
                  onClick={() => {
                    soundEngine.playVendexPulse();
                    setDecryptedIds((prev) => [...prev, selectedDoc.id]);
                  }}
                  className="px-6 py-3 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#B99A53]/40 text-[#D6BA72] font-mono text-xs tracking-[0.24em] uppercase font-bold transition-colors"
                >
                  EXECUTE VENDEX OVERRIDE // DECRYPT
                </button>
              </div>
            ) : (
              /* Archaeological Short Fragments (Section 25) */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div
                  className={`${
                    selectedDoc.visualAsset ? 'md:col-span-7' : 'md:col-span-12'
                  } border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-3`}
                >
                  <div className="font-mono text-[10px] tracking-[0.24em] text-[#8E7443] mb-2">
                    RECOVERED FRAGMENT //
                  </div>
                  {selectedDoc.fragments.map((line, i) => (
                    <div
                      key={i}
                      className={`font-mono text-xs sm:text-sm tracking-[0.2em] leading-relaxed ${
                        line.includes('CORRUPTED')
                          ? 'text-[#EA1D25]'
                          : i === 0
                          ? 'text-[#F5F5F0] font-bold'
                          : 'text-[#EDEDEA]/80'
                      }`}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {selectedDoc.visualAsset && (
                  <div className="md:col-span-5 border border-[#EDEDEA]/15 bg-[#080808] p-2 relative overflow-hidden">
                    <img
                      src={selectedDoc.visualAsset}
                      alt={selectedDoc.title}
                      className="w-full h-56 object-cover filter grayscale contrast-125 opacity-80"
                    />
                    <div className="mt-2 font-mono text-[9px] tracking-[0.2em] text-[#D6BA72] flex justify-between px-1">
                      <span>EVIDENCE // {selectedDoc.id}</span>
                      <span>VERIFIED</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Vendex Inscription */}
          {selectedDoc.vendexNote && (
            <div className="border-t border-[#EDEDEA]/15 pt-4 flex items-center justify-between font-mono text-xs tracking-[0.22em]">
              <div className="flex items-center gap-2 text-[#D6BA72] gold-phosphor">
                <span className="w-1.5 h-1.5 bg-[#D6BA72]" />
                <span>VENDEX // {selectedDoc.vendexNote}</span>
              </div>
              <span className="text-[#EDEDEA]/30 text-[10px]">
                REC_{selectedDoc.id}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
