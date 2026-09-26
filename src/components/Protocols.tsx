import React, { useEffect, useRef, useState } from 'react';
import {
  addChronicleIfMissing,
  addDesignationIfMissing,
  loadValkhorDb,
  submitCollectiveFragment,
  verifyProtocolSubmission,
} from '../services/valkhorBackend';
import { SoulState, UnlockItem } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface ProtocolsProps {
  soulState: SoulState;
  onCompleteProtocol: (protocolId: string) => void;
  onApplySoulPatch?: (patch: Partial<SoulState>, toast?: string) => void;
}

interface ClandestineProtocol {
  id: string;
  code: string;
  title: string;
  originCell: string;
  directive: string;
  instructions: string[];
  actionLabel: string;
  unlockedFileTitle: string;
  unlockedContent: string[];
  unlockedCipher?: string;
}

const CLANDESTINE_PROTOCOLS: ClandestineProtocol[] = [
  {
    id: 'PROT_017',
    code: 'PROTOCOL 017 // FIND THE SYMBOL',
    title: 'FIND THE SYMBOL',
    originCell: 'VALKHOR UNDERGROUND CELL // NODE_01',
    directive:
      'LOCATE OR INSCRIBE THE VENDEX SIGIL IN THE PHYSICAL ENVIRONMENT AND VERIFY ITS GEOMETRY.',
    instructions: [
      'THE SYMBOL IS AN ANCHOR BETWEEN SENSIBLE MATTER AND THE KHAOS DIMENSION.',
      'DRAW, PHOTOGRAPH, OR LOCATE THE SIGIL IN YOUR SECTOR.',
      'UPLOAD VISUAL EVIDENCE OR LOCK THE 4 VECTOR NODES BELOW TO TRANSMIT PROOF.',
    ],
    actionLabel: 'VERIFY SIGIL GEOMETRY',
    unlockedFileTitle: 'DECLASSIFIED // EMERGENCY VAULT CIPHER [0046]',
    unlockedContent: [
      'SIGIL VERIFICATION ACCEPTED BY VALKHOR KERNEL.',
      'RESTRICTED ARCHIVE EMERGENCY PIN CODE RECOVERED: [ 0046 ]',
      'USE PIN 0046 IN NODE 07 // RESTRICTED ARCHIVE TO DECRYPT VAULT_01.',
    ],
    unlockedCipher: '0046',
  },
  {
    id: 'PROT_023',
    code: 'PROTOCOL 023 // RECORD 10 SECONDS OF INDUSTRIAL NOISE',
    title: 'RECORD 10 SECONDS OF INDUSTRIAL NOISE',
    originCell: 'ACOUSTIC RECONNAISSANCE // EARTH SECTOR',
    directive:
      'CAPTURE 10.0 SECONDS OF RAW MECHANICAL OR URBAN ACOUSTIC NOISE FROM YOUR SURROUNDINGS.',
    instructions: [
      'EARTH CITIES EMIT CONSTANT SUB-HARMONIC MACHINERY FREQUENCIES.',
      'ACTIVATE THE ACOUSTIC TRANSDUCER BELOW FOR 10.0 SECONDS TO SAMPLE YOUR ENVIRONMENT.',
      'THE SYSTEM WILL EXTRACT THE INDUSTRIAL RESONANCE SIGNATURE.',
    ],
    actionLabel: 'INITIATE 10.0S ACOUSTIC CAPTURE',
    unlockedFileTitle: 'DECLASSIFIED // EARTH INDUSTRIAL HARMONIC REPORT',
    unlockedContent: [
      '10.0S ACOUSTIC SAMPLE ANALYZED // PEAK RESONANCE: 156.4 HZ.',
      'HIDDEN HARMONIC DETECTED BENEATH URBAN NOISE FLOOR.',
      'NEW FREQUENCY CALIBRATION APPLIED TO KHAOS FREQUENCIES LAB.',
    ],
  },
  {
    id: 'PROT_031',
    code: 'PROTOCOL 031 // LOCATE ANOTHER LOST SOUL',
    title: 'LOCATE ANOTHER LOST SOUL',
    originCell: 'LOST SOUL NETWORK // RELAY_09',
    directive:
      'ESTABLISH A DIRECT FREQUENCY HANDSHAKE WITH ANOTHER DISCONNECTED HOST.',
    instructions: [
      'ISOLATION IS THE PRIMARY INSTRUMENT OF EXTERNAL CONTROL.',
      'LOCATE ANOTHER LOST SOUL ID FROM THE SURVEILLANCE GRID (E.G. SOUL_00194822) OR SHARE YOUR OWN.',
      'ENTER THE TARGET SOUL IDENTIFIER BELOW TO ESTABLISH A CLANDESTINE LINK.',
    ],
    actionLabel: 'ESTABLISH PEER HANDSHAKE',
    unlockedFileTitle: 'DECLASSIFIED // CELL SYNCHRONIZATION MANIFESTO',
    unlockedContent: [
      'PEER HANDSHAKE VERIFIED // DUAL SIGNAL LOCK ESTABLISHED.',
      '"WHEN TWO LOST SOULS RECOGNIZE EACH OTHER, THE MASK BECOMES IRREVERSIBLE."',
      'RESTRICTED EVENT ARCHIVE PIN RECOVERED: [ 2026 ]',
    ],
    unlockedCipher: '2026',
  },
];

export const Protocols: React.FC<ProtocolsProps> = ({
  soulState,
  onCompleteProtocol,
  onApplySoulPatch,
}) => {
  const [activeTab, setActiveTab] = useState<
    'DATABASE' | 'COLLECTIVE' | 'FIELD_OPS'
  >('DATABASE');
  const [dbState, setDbState] = useState(() => loadValkhorDb());

  const completed = soulState.completedProtocols || [];

  // Protocol Database state
  const visibleProtocols = dbState.protocols.filter(
    (p) =>
      p.status !== 'UNDISCOVERED' ||
      (soulState.discoveries || []).includes('VOID_NODE_01') ||
      completed.includes(p.id)
  );
  const [selectedDbProtId, setSelectedDbProtId] = useState<string>(
    visibleProtocols[0]?.id || 'PROTOCOL_0047'
  );
  const [solutionInput, setSolutionInput] = useState<string>('');
  const [dbFeedback, setDbFeedback] = useState<{
    ok: boolean;
    message: string;
    unlocked?: UnlockItem;
  } | null>(null);

  // Collective Protocol state
  const [fragmentInputs, setFragmentInputs] = useState<Record<string, string>>(
    {}
  );
  const [collectiveFeedback, setCollectiveFeedback] = useState<{
    ok: boolean;
    message: string;
    unlocked?: UnlockItem;
  } | null>(null);

  // Field Ops (existing 017 / 023 / 031) state
  const [selectedFieldId, setSelectedFieldId] = useState<string>(
    CLANDESTINE_PROTOCOLS[0].id
  );
  const [sigilNodes, setSigilNodes] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [noiseBars, setNoiseBars] = useState<number[]>(Array(28).fill(15));
  const recTimerRef = useRef<number | null>(null);
  const [peerSoulInput, setPeerSoulInput] = useState<string>('SOUL_00194822');

  useEffect(() => {
    return () => {
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, []);

  const selectedDbProtocol =
    visibleProtocols.find((p) => p.id === selectedDbProtId) ||
    visibleProtocols[0];
  const isDbProtSolved = selectedDbProtocol
    ? completed.includes(selectedDbProtocol.id)
    : false;
  const attemptKey = selectedDbProtocol
    ? `${soulState.soulId}:${selectedDbProtocol.id}`
    : '';
  const usedAttempts = dbState.attemptCounts[attemptKey] || 0;

  const handleVerifyDatabaseProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDbProtocol || !solutionInput.trim()) return;

    soundEngine.playVendexPulse();
    const res = await verifyProtocolSubmission(
      soulState,
      selectedDbProtocol.id,
      solutionInput
    );
    setDbState(loadValkhorDb());

    if (res.ok) {
      soundEngine.playConnectionRestored();
      setDbFeedback({
        ok: true,
        message: res.message,
        unlocked: res.unlockedItem,
      });
      setSolutionInput('');
      onCompleteProtocol(selectedDbProtocol.id);
      if (res.updatedSoulPatch && onApplySoulPatch) {
        onApplySoulPatch(res.updatedSoulPatch, res.terminalNotice);
      }
    } else {
      soundEngine.playAlarm();
      setDbFeedback({
        ok: false,
        message: res.message,
      });
    }
  };

  const handleCollectiveSubmit = async (
    collectiveId: string,
    fragmentKey: 'FRAGMENT A' | 'FRAGMENT B' | 'FRAGMENT C' | 'FRAGMENT D'
  ) => {
    const raw = fragmentInputs[fragmentKey] || '';
    if (!raw.trim()) return;

    soundEngine.playVendexPulse();
    const res = await submitCollectiveFragment(
      soulState,
      collectiveId,
      fragmentKey,
      raw
    );
    setDbState(loadValkhorDb());

    if (res.ok) {
      soundEngine.playConnectionRestored();
      setCollectiveFeedback({
        ok: true,
        message: res.message,
        unlocked: res.unlockedItem,
      });
      setFragmentInputs((prev) => ({ ...prev, [fragmentKey]: '' }));
      if (res.updatedSoulPatch && onApplySoulPatch) {
        onApplySoulPatch(res.updatedSoulPatch, 'SOUL RECORD UPDATED.');
      }
    } else {
      soundEngine.playAlarm();
      setCollectiveFeedback({
        ok: false,
        message: res.message,
      });
    }
  };

  // Field Ops handlers
  const activeFieldProtocol =
    CLANDESTINE_PROTOCOLS.find((p) => p.id === selectedFieldId) ||
    CLANDESTINE_PROTOCOLS[0];
  const isFieldCompleted = completed.includes(activeFieldProtocol.id);

  const markFieldCompleted = (protId: string, protTitle: string) => {
    onCompleteProtocol(protId);
    if (onApplySoulPatch) {
      const year = new Date().getFullYear();
      const designations = addDesignationIfMissing(
        soulState.designations,
        'DECODER'
      );
      const chronicle = addChronicleIfMissing(
        soulState.chronicle,
        `field-${protId}`,
        `${protId} EXECUTED // ${year}`,
        `COMPLETED FIELD DIRECTIVE: ${protTitle}`
      );
      onApplySoulPatch(
        { designations, chronicle },
        'SOUL RECORD UPDATED.'
      );
    }
  };

  const handleToggleNode = (idx: number) => {
    soundEngine.playClick(1000 + idx * 180);
    const next = [...sigilNodes];
    next[idx] = !next[idx];
    setSigilNodes(next);

    if (next.every(Boolean)) {
      soundEngine.playConnectionRestored();
      markFieldCompleted('PROT_017', 'FIND THE SYMBOL');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setSigilNodes([true, true, true, true]);
    soundEngine.playConnectionRestored();
    markFieldCompleted('PROT_017', 'FIND THE SYMBOL');
  };

  const handleStartRecording = () => {
    if (isRecording) return;
    soundEngine.playVendexPulse();
    setIsRecording(true);
    setRecordSeconds(0);

    let elapsed = 0;
    if (recTimerRef.current) clearInterval(recTimerRef.current);

    recTimerRef.current = window.setInterval(() => {
      elapsed += 0.2;
      setRecordSeconds(Number(Math.min(10, elapsed).toFixed(1)));
      setNoiseBars(
        Array.from({ length: 28 }, () => Math.floor(20 + Math.random() * 78))
      );

      if (Math.round(elapsed * 5) % 5 === 0) {
        soundEngine.playGlitch(0.35);
      }

      if (elapsed >= 10) {
        if (recTimerRef.current) clearInterval(recTimerRef.current);
        setIsRecording(false);
        soundEngine.playConnectionRestored();
        markFieldCompleted('PROT_023', 'RECORD 10 SECONDS OF INDUSTRIAL NOISE');
      }
    }, 200);
  };

  const handlePeerHandshake = (e: React.FormEvent) => {
    e.preventDefault();
    if (peerSoulInput.trim().length < 4) return;
    soundEngine.playConnectionRestored();
    markFieldCompleted('PROT_031', 'LOCATE ANOTHER LOST SOUL');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#8E7443]">
            NODE 08 // PROTOCOL DATABASE & CLANDESTINE OPERATIONS
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            PROTOCOL DATABASE
          </h1>
        </div>

        {/* Mode Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.22em]">
          {(
            [
              ['DATABASE', 'CIPHER PROTOCOLS'],
              ['COLLECTIVE', 'COLLECTIVE // 0091'],
              ['FIELD_OPS', 'FIELD DIRECTIVES'],
            ] as const
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveTab(tabKey);
              }}
              className={`px-3.5 py-2 border transition-colors ${
                activeTab === tabKey
                  ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72] font-bold'
                  : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/65 hover:text-[#EDEDEA]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PROTOCOL DATABASE (ENCRYPTED PUZZLES & FIRST WITNESSES)      */}
      {/* =================================================================== */}
      {activeTab === 'DATABASE' && selectedDbProtocol && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Protocol Database List */}
          <div className="lg:col-span-5 space-y-3.5">
            {visibleProtocols.map((prot) => {
              const isSolvedByMe = completed.includes(prot.id);
              const isSelected = prot.id === selectedDbProtocol.id;
              const displayStatus = isSolvedByMe ? 'SOLVED' : prot.status;

              return (
                <button
                  key={prot.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedDbProtId(prot.id);
                    setDbFeedback(null);
                    setSolutionInput('');
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`w-full text-left border p-4 transition-colors flex flex-col justify-between space-y-2.5 ${
                    isSelected
                      ? 'border-[#D6BA72] bg-[#B99A53]/15'
                      : 'border-[#EDEDEA]/15 bg-[#080808] hover:border-[#EDEDEA]/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em]">
                    <span className="text-[#D6BA72] font-bold">
                      {prot.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 border ${
                        displayStatus === 'SOLVED'
                          ? 'border-[#D6BA72] text-[#D6BA72] bg-[#B99A53]/20'
                          : displayStatus === 'ACTIVE'
                          ? 'border-[#EDEDEA]/40 text-[#EDEDEA]'
                          : displayStatus === 'CLASSIFIED'
                          ? 'border-[#EA1D25]/60 text-[#EA1D25]'
                          : 'border-[#EDEDEA]/20 text-[#EDEDEA]/45'
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  <div className="font-display text-2xl font-bold tracking-[0.2em] text-[#EDEDEA]">
                    {prot.title}
                  </div>

                  <div className="font-mono text-xs tracking-[0.22em] text-[#D6BA72]/90 bg-[#050505] border border-[#EDEDEA]/10 px-3 py-1.5 truncate">
                    {prot.cipherDisplay}
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-[#EDEDEA]/45 pt-1">
                    <span>{prot.source}</span>
                    <span>
                      WITNESSES: {prot.firstWitnesses.length}/
                      {prot.firstWitnessLimit}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 7 Cols: Active Cipher Terminal & First Witnesses */}
          <div className="lg:col-span-7 border border-[#EDEDEA]/20 bg-[#080808] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
              <span className="text-[#D6BA72]">
                {selectedDbProtocol.code} // STATUS:{' '}
                {isDbProtSolved ? 'SOLVED' : selectedDbProtocol.status}
              </span>
              <span className="text-[#EDEDEA]/50">
                ATTEMPTS // {usedAttempts} / {selectedDbProtocol.maxAttempts}
              </span>
            </div>

            {/* Encrypted Display Box */}
            <div className="border border-[#B99A53]/50 bg-[#050505] p-5 space-y-3">
              <div className="font-mono text-[10px] tracking-[0.24em] text-[#8E7443]">
                INTERCEPTED CIPHER STREAM //
              </div>
              <div className="font-mono text-lg sm:text-2xl font-bold tracking-[0.26em] text-[#D6BA72] break-all">
                {selectedDbProtocol.cipherDisplay}
              </div>
              <div className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/80 pt-2 border-t border-[#EDEDEA]/10">
                {selectedDbProtocol.prompt}
              </div>
            </div>

            <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-1.5 font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/70">
              {selectedDbProtocol.instructions.map((inst, i) => (
                <div key={i}>&gt; {inst}</div>
              ))}
            </div>

            {/* Solution Input Form */}
            {selectedDbProtocol.status !== 'ARCHIVED' && (
              <form
                onSubmit={handleVerifyDatabaseProtocol}
                className="border border-[#EDEDEA]/15 bg-[#050505] p-5 space-y-4"
              >
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em]">
                  <span className="text-[#D6BA72]">ENTER SOLUTION</span>
                  <span className="text-[#EDEDEA]/45">
                    SHA-256 KERNEL VERIFICATION
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={solutionInput}
                    onChange={(e) =>
                      setSolutionInput(e.target.value.toUpperCase())
                    }
                    placeholder="ENTER SOLUTION"
                    className="flex-1 border border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#080808] px-4 py-3.5 font-mono text-sm sm:text-base tracking-[0.24em] text-[#EDEDEA] focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3.5 border border-[#D6BA72] bg-[#D6BA72] hover:bg-[#B99A53] text-[#050505] font-display text-2xl font-bold tracking-[0.26em] uppercase transition-colors"
                  >
                    TRANSMIT
                  </button>
                </div>
              </form>
            )}

            {/* Verification Feedback */}
            {dbFeedback && (
              <div
                className={`border-2 p-4 font-mono text-xs tracking-[0.2em] space-y-2 ${
                  dbFeedback.ok
                    ? 'border-[#D6BA72] bg-[#B99A53]/15 text-[#D6BA72]'
                    : 'border-[#EA1D25] bg-[#B5161B]/20 text-[#EA1D25]'
                }`}
              >
                <div className="font-bold">&gt; {dbFeedback.message}</div>
                {dbFeedback.unlocked && (
                  <div className="pt-2 border-t border-[#D6BA72]/40 text-[#EDEDEA] space-y-1">
                    <div className="text-[#D6BA72] font-bold">
                      DECLASSIFIED // {dbFeedback.unlocked.code} —{' '}
                      {dbFeedback.unlocked.title}
                    </div>
                    {dbFeedback.unlocked.description.map((line, i) => (
                      <div key={i}>&gt; {line}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* First Witnesses Historical Log */}
            <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.24em] border-b border-[#EDEDEA]/10 pb-2">
                <span className="text-[#D6BA72]">
                  FIRST WITNESSES // {selectedDbProtocol.code}
                </span>
                <span className="text-[#EDEDEA]/45">
                  LIMIT: FIRST {selectedDbProtocol.firstWitnessLimit} SOULS
                </span>
              </div>

              {selectedDbProtocol.firstWitnesses.length === 0 ? (
                <div className="font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/45 py-2">
                  NO WITNESSES RECORDED YET. BE THE FIRST TO RESOLVE THIS
                  PROTOCOL.
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-xs tracking-[0.18em]">
                  {selectedDbProtocol.firstWitnesses.map((w) => (
                    <div
                      key={`${w.position}-${w.soulId}`}
                      className="flex items-center justify-between border border-[#EDEDEA]/10 bg-[#080808] px-3 py-2"
                    >
                      <span className="text-[#D6BA72] font-bold">
                        {w.position === 1
                          ? '1ST WITNESS'
                          : w.position === 2
                          ? '2ND WITNESS'
                          : w.position === 3
                          ? '3RD WITNESS'
                          : `${w.position}TH WITNESS`}{' '}
                        — {w.soulId}
                        {w.soulId === soulState.soulId ? ' [YOU]' : ''}
                      </span>
                      <span className="text-[#EDEDEA]/50 text-[10px]">
                        {w.solvedAt}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: COLLECTIVE PROTOCOLS (PROTOCOL // 0091 MULTI-FRAGMENT)       */}
      {/* =================================================================== */}
      {activeTab === 'COLLECTIVE' && (
        <div className="space-y-6">
          {dbState.collectiveProtocols.map((coll) => {
            const foundCount = coll.fragments.filter((f) => f.found).length;
            const allResolved = foundCount === coll.fragments.length;

            return (
              <div
                key={coll.id}
                className="border border-[#B99A53]/50 bg-[#080808] p-6 space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EDEDEA]/15 pb-4">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72]">
                      COLLECTIVE PROTOCOL // DISTRIBUTED NETWORK SYNCHRONIZATION
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.22em] text-[#EDEDEA] mt-1">
                      {coll.code} — {coll.title}
                    </h2>
                    <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/65 mt-1">
                      {coll.subtitle}
                    </p>
                  </div>

                  <div className="border border-[#D6BA72] bg-[#050505] px-4 py-2.5 font-mono text-xs tracking-[0.22em] text-[#D6BA72] font-bold shrink-0">
                    SYNCHRONIZED // {foundCount} / {coll.fragments.length}{' '}
                    FRAGMENTS
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coll.fragments.map((frag) => (
                    <div
                      key={frag.key}
                      className={`border p-5 space-y-3 ${
                        frag.found
                          ? 'border-[#D6BA72]/60 bg-[#B99A53]/10'
                          : 'border-[#EDEDEA]/20 bg-[#050505]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-xs tracking-[0.22em]">
                        <span className="font-bold text-[#EDEDEA]">
                          {frag.key}
                        </span>
                        <span
                          className={`px-2 py-0.5 border text-[10px] ${
                            frag.found
                              ? 'border-[#D6BA72] text-[#D6BA72]'
                              : 'border-[#EA1D25] text-[#EA1D25]'
                          }`}
                        >
                          {frag.found ? 'FOUND' : 'MISSING'}
                        </span>
                      </div>

                      <div className="font-mono text-[11px] tracking-[0.16em] text-[#EDEDEA]/70">
                        {frag.sourceHint}
                      </div>

                      {frag.found ? (
                        <div className="pt-2 border-t border-[#EDEDEA]/10 font-mono text-[10px] tracking-[0.18em] text-[#D6BA72]">
                          RECOVERED BY // {frag.foundBySoulId} AT {frag.foundAt}
                        </div>
                      ) : (
                        <div className="pt-2 flex gap-2">
                          <input
                            type="text"
                            value={fragmentInputs[frag.key] || ''}
                            onChange={(e) =>
                              setFragmentInputs((prev) => ({
                                ...prev,
                                [frag.key]: e.target.value.toUpperCase(),
                              }))
                            }
                            placeholder={`ENTER ${frag.key} CODE`}
                            className="flex-1 border border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#080808] px-3 py-2 font-mono text-xs tracking-[0.2em] text-[#EDEDEA] focus:outline-none uppercase"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleCollectiveSubmit(coll.id, frag.key)
                            }
                            className="px-4 py-2 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] font-mono text-xs tracking-[0.2em] font-bold uppercase"
                          >
                            BIND
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {collectiveFeedback && (
                  <div
                    className={`border p-4 font-mono text-xs tracking-[0.2em] ${
                      collectiveFeedback.ok
                        ? 'border-[#D6BA72] bg-[#B99A53]/15 text-[#D6BA72]'
                        : 'border-[#EA1D25] bg-[#B5161B]/20 text-[#EA1D25]'
                    }`}
                  >
                    &gt; {collectiveFeedback.message}
                  </div>
                )}

                {allResolved && (
                  <div className="border-2 border-[#D6BA72] bg-[#050505] p-5 space-y-2 font-mono">
                    <div className="text-xs tracking-[0.24em] text-[#D6BA72] font-bold">
                      COLLECTIVE ARCHIVE DECLASSIFIED // {coll.code}
                    </div>
                    <div className="text-xs tracking-[0.16em] text-[#EDEDEA]/85">
                      &gt; ALL FOUR FRAGMENTS HAVE BEEN ANCHORED BY THE LOST
                      SOUL NETWORK. PARTICIPATING HOSTS:{' '}
                      {coll.participants.join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: CLANDESTINE FIELD DIRECTIVES (ORIGINAL 017 / 023 / 031)      */}
      {/* =================================================================== */}
      {activeTab === 'FIELD_OPS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3.5">
            {CLANDESTINE_PROTOCOLS.map((prot) => {
              const isDone = completed.includes(prot.id);
              const isSelected = prot.id === selectedFieldId;

              return (
                <button
                  key={prot.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedFieldId(prot.id);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className={`w-full text-left border p-4 transition-colors flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#D6BA72] bg-[#B99A53]/15'
                      : 'border-[#EDEDEA]/15 bg-[#080808] hover:border-[#EDEDEA]/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em]">
                    <span className="text-[#D6BA72] font-bold">
                      {prot.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 border ${
                        isDone
                          ? 'border-[#D6BA72] text-[#D6BA72] bg-[#B99A53]/20'
                          : 'border-[#EDEDEA]/20 text-[#EDEDEA]/55'
                      }`}
                    >
                      {isDone ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </div>

                  <div className="font-display text-2xl font-bold tracking-[0.2em] text-[#EDEDEA]">
                    {prot.title}
                  </div>

                  <div className="font-mono text-[10px] tracking-[0.16em] text-[#EDEDEA]/50">
                    {prot.originCell}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 border border-[#EDEDEA]/20 bg-[#080808] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
                <span className="text-[#D6BA72]">
                  {activeFieldProtocol.code}
                </span>
                <span className="text-[#EDEDEA]/45">
                  ASSIGNED TO // {soulState.soulId}
                </span>
              </div>

              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#EA1D25] mb-1">
                  OPERATIONAL DIRECTIVE //
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                  {activeFieldProtocol.directive}
                </h2>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-2 font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/75">
                {activeFieldProtocol.instructions.map((inst, i) => (
                  <div key={i}>&gt; {inst}</div>
                ))}
              </div>

              {activeFieldProtocol.id === 'PROT_017' && (
                <div className="border border-[#B99A53]/40 bg-[#050505] p-5 space-y-4">
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-[#D6BA72]">
                    <span>METHOD A // ALIGN SIGIL VECTORS</span>
                    <span>
                      {sigilNodes.filter(Boolean).length} / 4 NODES LOCKED
                    </span>
                  </div>

                  <div className="flex items-center justify-around py-3">
                    <VendexSymbol
                      size={54}
                      color={isFieldCompleted ? '#D6BA72' : '#EDEDEA'}
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        'UPPER CROWN',
                        'CROSS AXIS',
                        'LEFT BLADE',
                        'RIGHT BLADE',
                      ].map((label, idx) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleToggleNode(idx)}
                          className={`px-3.5 py-2.5 border font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${
                            sigilNodes[idx] || isFieldCompleted
                              ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                              : 'border-[#EDEDEA]/20 bg-[#080808] text-[#EDEDEA]/65 hover:border-[#D6BA72]'
                          }`}
                        >
                          [
                          {sigilNodes[idx] || isFieldCompleted
                            ? 'LOCKED'
                            : 'ALIGN'}
                          ] {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EDEDEA]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-[#EDEDEA]/60">
                      {uploadedFileName
                        ? `EVIDENCE LOGGED: ${uploadedFileName}`
                        : 'METHOD B // UPLOAD PHYSICAL SIGIL PHOTOGRAPH'}
                    </div>
                    <label className="cursor-pointer px-4 py-2 border border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#B99A53]/30 font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA] uppercase text-center">
                      UPLOAD PHOTO EVIDENCE
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {activeFieldProtocol.id === 'PROT_023' && (
                <div className="border border-[#B99A53]/40 bg-[#050505] p-5 space-y-4">
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em]">
                    <span className="text-[#D6BA72]">
                      ACOUSTIC FIELD TRANSDUCER
                    </span>
                    <span
                      className={
                        isRecording
                          ? 'text-[#EA1D25] animate-pulse'
                          : 'text-[#EDEDEA]/60'
                      }
                    >
                      {isRecording
                        ? `SAMPLING // ${recordSeconds.toFixed(1)}S / 10.0S`
                        : isFieldCompleted
                        ? '10.0S SAMPLE VERIFIED'
                        : 'STANDBY // 00.0S'}
                    </span>
                  </div>

                  <div className="h-20 bg-[#080808] border border-[#EDEDEA]/15 p-2 flex items-end gap-1">
                    {noiseBars.map((h, i) => (
                      <div
                        key={i}
                        className={`flex-1 transition-all duration-150 ${
                          isRecording
                            ? i % 4 === 0
                              ? 'bg-[#EA1D25]'
                              : 'bg-[#D6BA72]'
                            : isFieldCompleted
                            ? 'bg-[#D6BA72]/70'
                            : 'bg-[#EDEDEA]/20'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className="w-full py-3.5 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] font-display text-xl font-bold tracking-[0.24em] uppercase transition-colors"
                  >
                    {isRecording
                      ? `CAPTURING INDUSTRIAL NOISE... [${recordSeconds.toFixed(1)}S]`
                      : isFieldCompleted
                      ? 'RE-SAMPLE 10 SECONDS OF NOISE'
                      : 'INITIATE 10.0S ACOUSTIC CAPTURE'}
                  </button>
                </div>
              )}

              {activeFieldProtocol.id === 'PROT_031' && (
                <form
                  onSubmit={handlePeerHandshake}
                  className="border border-[#B99A53]/40 bg-[#050505] p-5 space-y-4"
                >
                  <div className="font-mono text-[10px] tracking-[0.22em] text-[#D6BA72]">
                    PEER LOST SOUL SYNCHRONIZATION
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={peerSoulInput}
                      onChange={(e) =>
                        setPeerSoulInput(e.target.value.toUpperCase())
                      }
                      placeholder="SOUL_XXXXXXXX"
                      className="flex-1 border border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#080808] px-4 py-3 font-mono text-sm tracking-[0.22em] text-[#EDEDEA] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] font-display text-xl font-bold tracking-[0.24em] uppercase"
                    >
                      LINK SOUL
                    </button>
                  </div>
                </form>
              )}

              {isFieldCompleted && (
                <div className="border-2 border-[#D6BA72] bg-[#050505] p-5 space-y-2.5 animate-flicker">
                  <div className="font-mono text-xs tracking-[0.24em] text-[#D6BA72] font-bold">
                    {activeFieldProtocol.unlockedFileTitle}
                  </div>
                  <div className="space-y-1 font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/85">
                    {activeFieldProtocol.unlockedContent.map((line, idx) => (
                      <div key={idx}>&gt; {line}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
