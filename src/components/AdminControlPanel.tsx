import React, { useState } from 'react';
import {
  addDesignationIfMissing,
  DESIGNATION_CATALOG,
  formatUtcNow,
  hashSecret,
  loadValkhorDb,
  reviewLegacyArtifactRequest,
  reviewMarkVerificationRequest,
  saveValkhorDb,
} from '../services/valkhorBackend';
import {
  DesignationId,
  PhysicalArtifactRecord,
  ProtocolDatabaseItem,
  SignalDefinition,
  SoulState,
  UnlockContentType,
  UnlockItem,
} from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface AdminControlPanelProps {
  soulState: SoulState;
  onApplySoulPatch: (patch: Partial<SoulState>, toast?: string) => void;
  onExitControl: () => void;
}

// Salted SHA-256 digests for "VALKHOR" or "KHAOS" admin clearance
const ADMIN_HASH_VALKHOR =
  'f2a04b195d75280df8c39f581a1006ef1063d37ff44592a01a130c7bf7f59d56';
const ADMIN_HASH_KHAOS =
  'b2c6daf26919fc924a28d843b9b5298b552f24076f4b604cfb3dea9b23b3b32c';

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  soulState,
  onApplySoulPatch,
  onExitControl,
}) => {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [clearanceInput, setClearanceInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    | 'PROTOCOLS'
    | 'SIGNALS'
    | 'EVENTS'
    | 'ARTIFACTS'
    | 'LEGACY_QUEUE'
    | 'MARK_QUEUE'
    | 'UNLOCKS'
  >('PROTOCOLS');

  const [dbState, setDbState] = useState(() => loadValkhorDb());
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // 1. New Protocol Form State
  const [protCode, setProtCode] = useState('PROTOCOL // 0112');
  const [protTitle, setProtTitle] = useState('');
  const [protCipher, setProtCipher] = useState('');
  const [protPrompt, setProtPrompt] = useState('');
  const [protPlainAnswer, setProtPlainAnswer] = useState('');
  const [protStatus, setProtStatus] =
    useState<ProtocolDatabaseItem['status']>('ACTIVE');
  const [protWitnessLimit, setProtWitnessLimit] = useState(5);
  const [protUnlockId, setProtUnlockId] = useState('');

  // 2. New Signal Form State
  const [sigRawCode, setSigRawCode] = useState('');
  const [sigMasked, setSigMasked] = useState('VX-████');
  const [sigSource, setSigSource] = useState('LIVE RITUAL VISUALS');
  const [sigOrigin, setSigOrigin] = useState('SECTOR_01');
  const [sigAction, setSigAction] =
    useState<SignalDefinition['actionType']>('UNLOCK_ARCHIVE');
  const [sigUnlockId, setSigUnlockId] = useState('');

  // 3. Event Witness Generator State
  const [evtCity, setEvtCity] = useState('MADRID');
  const [evtYear, setEvtYear] = useState('2026');
  const [evtCode, setEvtCode] = useState(
    () => `KHAOS-${Math.floor(1000 + Math.random() * 9000)}`
  );

  // 4. Physical Artifact Card Generator State
  const [artPublicCode, setArtPublicCode] = useState('VX-RUBY-0048');
  const [artPlainKey, setArtPlainKey] = useState(
    () =>
      `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  );
  const [artName, setArtName] = useState('VENDEX // RUBY');
  const [artArchetype, setArtArchetype] =
    useState<PhysicalArtifactRecord['archetype']>('RUBY');
  const [artSeries, setArtSeries] = useState('SERIES // 001');
  const [artSerial, setArtSerial] = useState('0048 / 0300');
  const [generatedCardsLog, setGeneratedCardsLog] = useState<
    { publicCode: string; privateKeyPlain: string; name: string }[]
  >([]);

  // 7. New Unlock Item State
  const [unlId, setUnlId] = useState('ARCHIVE_0200');
  const [unlCode, setUnlCode] = useState('ARCHIVE // 0200');
  const [unlTitle, setUnlTitle] = useState('');
  const [unlType, setUnlType] = useState<UnlockContentType>('ARCHIVE');
  const [unlDesc, setUnlDesc] = useState('');

  const notify = (msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => setStatusBanner(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const digest = await hashSecret(clearanceInput);
    if (digest === ADMIN_HASH_VALKHOR || digest === ADMIN_HASH_KHAOS) {
      soundEngine.playConnectionRestored();
      setAuthorized(true);
      setAuthError(null);
    } else {
      soundEngine.playAlarm();
      setAuthError('CLEARANCE DENIED // INVALID KERNEL SIGNATURE.');
    }
  };

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protTitle.trim() || !protPlainAnswer.trim()) return;
    const solutionHash = await hashSecret(protPlainAnswer);
    const db = loadValkhorDb();
    const id = protCode.replace(/[^A-Z0-9]/gi, '_').toUpperCase();

    const newItem: ProtocolDatabaseItem = {
      id,
      code: protCode.toUpperCase(),
      title: protTitle.toUpperCase(),
      source: 'VALKHOR CONTROL // DIRECTIVE',
      status: protStatus,
      cipherDisplay: protCipher.toUpperCase() || '████ // ENCRYPTED',
      prompt: protPrompt.toUpperCase() || 'RESOLVE THE INTERCEPTED SEQUENCE.',
      instructions: [
        'CRYPTOGRAPHIC VERIFICATION REQUIRED.',
        'SOLUTIONS ARE HASHED VIA SALTED SHA-256.',
      ],
      solutionHash,
      maxAttempts: 5,
      firstWitnessLimit: protWitnessLimit,
      unlockId: protUnlockId.trim() || undefined,
      opensAt: formatUtcNow(),
      firstWitnesses: [],
    };

    db.protocols = [newItem, ...db.protocols];
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: formatUtcNow(),
      actor: 'ADMIN_CONTROL',
      action: 'CREATE_PROTOCOL',
      detail: `CREATED ${newItem.code} (${newItem.title})`,
    });
    saveValkhorDb(db);
    setDbState(db);
    setProtTitle('');
    setProtPlainAnswer('');
    notify(`PROTOCOL [${newItem.code}] CREATED AND HASHED.`);
  };

  const handleToggleProtocolStatus = (
    id: string,
    nextStatus: ProtocolDatabaseItem['status']
  ) => {
    const db = loadValkhorDb();
    const p = db.protocols.find((x) => x.id === id);
    if (!p) return;
    p.status = nextStatus;
    saveValkhorDb(db);
    setDbState(db);
    notify(`UPDATED ${p.code} STATUS TO ${nextStatus}.`);
  };

  const handleCreateSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigRawCode.trim()) return;
    const codeHash = await hashSecret(sigRawCode);
    const db = loadValkhorDb();
    const newSig: SignalDefinition = {
      id: `SIG_${Date.now()}`,
      codeHash,
      maskedLabel: sigMasked.toUpperCase(),
      source: sigSource.toUpperCase(),
      origin: sigOrigin.toUpperCase(),
      actionType: sigAction,
      unlockId: sigUnlockId.trim() || undefined,
      activeFrom: formatUtcNow(),
      priorDiscoverersCount: 0,
      discoveredBy: [],
    };
    db.signals = [newSig, ...db.signals];
    saveValkhorDb(db);
    setDbState(db);
    setSigRawCode('');
    notify(`SIGNAL [${newSig.maskedLabel}] REGISTERED IN KERNEL.`);
  };

  const handleCreateEventWitness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtCity.trim() || !evtCode.trim()) return;
    const codeHash = await hashSecret(evtCode);
    const stamp = `WITNESS // ${evtCity.trim().toUpperCase()} // ${evtYear.trim()}`;
    const db = loadValkhorDb();

    const newSig: SignalDefinition = {
      id: `SIG_WIT_${Date.now()}`,
      codeHash,
      maskedLabel: 'KHAOS-████',
      source: 'EVENT CONVERGENCE RELAY',
      origin: `${evtCity.trim().toUpperCase()} // ${evtYear.trim()}`,
      actionType: 'REGISTER_WITNESS',
      witnessStamp: stamp,
      witnessCity: evtCity.trim().toUpperCase(),
      witnessDate: evtYear.trim(),
      activeFrom: formatUtcNow(),
      priorDiscoverersCount: 0,
      discoveredBy: [],
    };

    db.signals = [newSig, ...db.signals];
    saveValkhorDb(db);
    setDbState(db);
    notify(`EVENT WITNESS CODE [${evtCode}] CREATED FOR ${stamp}.`);
    setEvtCode(`KHAOS-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleCreateArtifactCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artPublicCode.trim() || !artPlainKey.trim()) return;
    const privateKeyHash = await hashSecret(artPlainKey);
    const db = loadValkhorDb();

    const newArt: PhysicalArtifactRecord = {
      publicCode: artPublicCode.trim().toUpperCase(),
      privateKeyHash,
      name: artName.trim().toUpperCase(),
      archetype: artArchetype,
      series: artSeries.trim().toUpperCase(),
      generation: 'GENERATION // 01',
      serialNumber: artSerial.trim().toUpperCase(),
      rarityType: artArchetype === 'OBSIDIAN' ? 'ONE_OF_ONE' : 'RELIC',
      status: 'UNCLAIMED',
      currentOwnerSoulId: null,
      history: [],
    };

    db.artifacts = [newArt, ...db.artifacts];
    saveValkhorDb(db);
    setDbState(db);

    setGeneratedCardsLog((prev) => [
      {
        publicCode: newArt.publicCode,
        privateKeyPlain: artPlainKey.trim().toUpperCase(),
        name: newArt.name,
      },
      ...prev,
    ]);

    notify(
      `ARTIFACT CARD [${newArt.publicCode}] GENERATED (KEY HASHED IN DB).`
    );
    setArtPlainKey(
      `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    );
  };

  const handleExportCardsCsv = () => {
    const rows = [
      ['PUBLIC_ARTIFACT_ID', 'PRIVATE_AUTHENTICATION_KEY', 'ARTIFACT_NAME'],
      ...generatedCardsLog.map((c) => [
        c.publicCode,
        c.privateKeyPlain,
        c.name,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VALKHOR_ARTIFACT_CARDS.csv';
    a.click();
  };

  const handleReviewLegacy = (
    reqId: string,
    decision: 'VERIFIED' | 'REJECTED'
  ) => {
    soundEngine.playConnectionRestored();
    const res = reviewLegacyArtifactRequest(reqId, decision, soulState);
    setDbState(loadValkhorDb());
    if (res.updatedSoulPatch) {
      onApplySoulPatch(
        res.updatedSoulPatch,
        res.triadTriggered
          ? 'ARTIFACT PATTERN DETECTED // THE TRIAD UNLOCKED.'
          : `GENERATION // 00 ${decision}.`
      );
    }
    notify(`LEGACY REQUEST ${reqId} MARKED AS ${decision}.`);
  };

  const handleReviewMark = (
    reqId: string,
    decision: 'VERIFIED' | 'REJECTED'
  ) => {
    soundEngine.playConnectionRestored();
    const res = reviewMarkVerificationRequest(reqId, decision, soulState);
    setDbState(loadValkhorDb());
    if (res.updatedSoulPatch) {
      onApplySoulPatch(res.updatedSoulPatch, `MARK VERIFICATION ${decision}.`);
    }
    notify(`MARK REQUEST ${reqId} MARKED AS ${decision}.`);
  };

  const handleCreateUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlId.trim() || !unlTitle.trim()) return;
    const db = loadValkhorDb();
    const item: UnlockItem = {
      id: unlId.trim().toUpperCase(),
      code: unlCode.trim().toUpperCase(),
      title: unlTitle.trim().toUpperCase(),
      type: unlType,
      ruleType: 'SIGNAL_DECODED',
      ruleCondition: 'CUSTOM',
      description: [unlDesc.trim().toUpperCase() || 'DECLASSIFIED BY ADMIN.'],
    };
    db.unlocks = [item, ...db.unlocks];
    saveValkhorDb(db);
    setDbState(db);
    setUnlTitle('');
    setUnlDesc('');
    notify(`UNLOCK ITEM [${item.id}] REGISTERED IN UNLOCK ENGINE.`);
  };

  const handleGrantDesignationToSelf = (des: DesignationId) => {
    const next = addDesignationIfMissing(soulState.designations, des);
    onApplySoulPatch({ designations: next }, `DESIGNATION [${des}] GRANTED.`);
    notify(`GRANTED DESIGNATION [${des}] TO ${soulState.soulId}.`);
  };

  if (!authorized) {
    return (
      <div className="max-w-xl mx-auto my-12 border-2 border-[#D6BA72] bg-[#080808] p-8 space-y-6 select-none">
        <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72]">
              RESTRICTED NODE // /CONTROL
            </div>
            <h1 className="font-display text-4xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-1">
              VALKHOR CONTROL PANEL
            </h1>
          </div>
          <VendexSymbol size={38} color="#D6BA72" />
        </div>

        <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/70 leading-relaxed">
          ADMINISTRATIVE CLEARANCE REQUIRED TO MANAGE PROTOCOLS, SIGNALS,
          WITNESS CODES, ARTIFACT SERIALS, LEGACY VERIFICATIONS, AND THE MARKED.
        </p>

        <form onSubmit={handleLogin} className="space-y-4 font-mono">
          <div className="space-y-1.5">
            <label className="block text-[10px] tracking-[0.22em] text-[#EDEDEA]/50">
              ENTER KERNEL PASSPHRASE (DEFAULT: VALKHOR)
            </label>
            <input
              type="password"
              value={clearanceInput}
              onChange={(e) => setClearanceInput(e.target.value)}
              placeholder="ENTER CLEARANCE KEY"
              className="w-full border border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#050505] px-4 py-3.5 text-sm tracking-[0.24em] text-[#EDEDEA] focus:outline-none uppercase"
            />
          </div>

          {authError && (
            <div className="border border-[#EA1D25] bg-[#B5161B]/20 p-3 text-xs tracking-[0.2em] text-[#EA1D25]">
              {authError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3.5 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] font-display text-2xl font-bold tracking-[0.26em] uppercase"
            >
              AUTHENTICATE
            </button>
            <button
              type="button"
              onClick={onExitControl}
              className="px-5 py-3.5 border border-[#EDEDEA]/25 text-xs tracking-[0.2em] text-[#EDEDEA]/70 hover:text-[#EDEDEA]"
            >
              RETURN
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border-2 border-[#D6BA72] bg-[#080808] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#D6BA72]">
            VALKHOR KERNEL ADMINISTRATION // /CONTROL
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            SYSTEM CONTROL PANEL
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
          {(
            [
              ['PROTOCOLS', 'PROTOCOLS'],
              ['SIGNALS', 'SIGNALS'],
              ['EVENTS', 'EVENT WITNESS'],
              ['ARTIFACTS', 'ARTIFACTS'],
              [
                'LEGACY_QUEUE',
                `GEN // 00 (${
                  dbState.legacyRequests.filter(
                    (r) => r.status === 'PENDING REVIEW'
                  ).length
                })`,
              ],
              [
                'MARK_QUEUE',
                `THE MARKED (${
                  dbState.markRequests.filter(
                    (r) => r.status === 'PENDING REVIEW'
                  ).length
                })`,
              ],
              ['UNLOCKS', 'UNLOCKS & ROLES'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveTab(k)}
              className={`px-3 py-2 border transition-colors ${
                activeTab === k
                  ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72] font-bold'
                  : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/65'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={onExitControl}
            className="px-3 py-2 border border-[#EA1D25] text-[#EA1D25] hover:bg-[#B5161B]/20"
          >
            EXIT /CONTROL
          </button>
        </div>
      </div>

      {statusBanner && (
        <div className="border-2 border-[#D6BA72] bg-[#B99A53]/20 p-4 font-mono text-xs tracking-[0.22em] text-[#D6BA72] font-bold">
          &gt; {statusBanner}
        </div>
      )}

      {/* 1. PROTOCOLS MANAGEMENT */}
      {activeTab === 'PROTOCOLS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
          <form
            onSubmit={handleCreateProtocol}
            className="lg:col-span-5 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-3.5 text-xs"
          >
            <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              CREATE NEW PROTOCOL (AUTO SHA-256)
            </div>
            <input
              type="text"
              value={protCode}
              onChange={(e) => setProtCode(e.target.value)}
              placeholder="PROTOCOL // 0112"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={protTitle}
              onChange={(e) => setProtTitle(e.target.value)}
              placeholder="PROTOCOL TITLE"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={protCipher}
              onChange={(e) => setProtCipher(e.target.value)}
              placeholder="CIPHER DISPLAY (E.G. ████ 15 22 05 18)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <textarea
              value={protPrompt}
              onChange={(e) => setProtPrompt(e.target.value)}
              placeholder="DIRECTIVE PROMPT"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA] h-20"
            />
            <input
              type="text"
              value={protPlainAnswer}
              onChange={(e) => setProtPlainAnswer(e.target.value)}
              placeholder="SOLUTION (HASHED BEFORE STORAGE)"
              className="w-full border border-[#D6BA72]/60 bg-[#050505] px-3 py-2 text-[#D6BA72]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={protStatus}
                onChange={(e) =>
                  setProtStatus(
                    e.target.value as ProtocolDatabaseItem['status']
                  )
                }
                className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLASSIFIED">CLASSIFIED</option>
                <option value="UNDISCOVERED">UNDISCOVERED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <input
                type="number"
                value={protWitnessLimit}
                onChange={(e) => setProtWitnessLimit(Number(e.target.value))}
                placeholder="FIRST WITNESS LIMIT"
                className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
              />
            </div>
            <input
              type="text"
              value={protUnlockId}
              onChange={(e) => setProtUnlockId(e.target.value)}
              placeholder="OPTIONAL UNLOCK ID (E.G. ARCHIVE_0091)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#D6BA72] text-[#050505] font-bold tracking-[0.22em] uppercase"
            >
              DEPLOY PROTOCOL
            </button>
          </form>

          <div className="lg:col-span-7 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-3">
            <div className="text-xs text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              EXISTING PROTOCOLS ({dbState.protocols.length})
            </div>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {dbState.protocols.map((p) => (
                <div
                  key={p.id}
                  className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="text-[#D6BA72] font-bold">
                      {p.code} — {p.title}
                    </div>
                    <div className="text-[10px] text-[#EDEDEA]/50">
                      STATUS: {p.status} // WITNESSES: {p.firstWitnesses.length}
                      /{p.firstWitnessLimit}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      ['ACTIVE', 'CLASSIFIED', 'ARCHIVED', 'UNDISCOVERED'] as const
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleToggleProtocolStatus(p.id, st)}
                        className={`px-2 py-1 border text-[9px] ${
                          p.status === st
                            ? 'border-[#D6BA72] text-[#D6BA72]'
                            : 'border-[#EDEDEA]/20 text-[#EDEDEA]/45'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SIGNALS MANAGEMENT */}
      {activeTab === 'SIGNALS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
          <form
            onSubmit={handleCreateSignal}
            className="lg:col-span-5 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-3.5 text-xs"
          >
            <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              REGISTER NEW SIGNAL (AUTO SHA-256)
            </div>
            <input
              type="text"
              value={sigRawCode}
              onChange={(e) => setSigRawCode(e.target.value.toUpperCase())}
              placeholder="SECRET SIGNAL CODE (E.G. VX-808)"
              className="w-full border border-[#D6BA72]/60 bg-[#050505] px-3 py-2 text-[#D6BA72]"
            />
            <input
              type="text"
              value={sigMasked}
              onChange={(e) => setSigMasked(e.target.value)}
              placeholder="MASKED DISPLAY (E.G. VX-███)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={sigSource}
              onChange={(e) => setSigSource(e.target.value)}
              placeholder="SOURCE (E.G. SOUNDCLOUD DESCRIPTION)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={sigOrigin}
              onChange={(e) => setSigOrigin(e.target.value)}
              placeholder="ORIGIN SECTOR"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <select
              value={sigAction}
              onChange={(e) =>
                setSigAction(e.target.value as SignalDefinition['actionType'])
              }
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            >
              <option value="UNLOCK_ARCHIVE">UNLOCK_ARCHIVE</option>
              <option value="ACTIVATE_TRANSMISSION">
                ACTIVATE_TRANSMISSION
              </option>
              <option value="REGISTER_DISCOVERY">REGISTER_DISCOVERY</option>
            </select>
            <input
              type="text"
              value={sigUnlockId}
              onChange={(e) => setSigUnlockId(e.target.value)}
              placeholder="UNLOCK ID (E.G. ARCHIVE_0091)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#D6BA72] text-[#050505] font-bold tracking-[0.22em] uppercase"
            >
              REGISTER SIGNAL
            </button>
          </form>

          <div className="lg:col-span-7 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-3 text-xs">
            <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              ACTIVE SIGNALS ({dbState.signals.length})
            </div>
            {dbState.signals.map((s) => (
              <div
                key={s.id}
                className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 flex justify-between items-center"
              >
                <div>
                  <div className="text-[#D6BA72] font-bold">
                    {s.maskedLabel} // {s.actionType}
                  </div>
                  <div className="text-[10px] text-[#EDEDEA]/55">
                    {s.source} ({s.origin})
                  </div>
                </div>
                <span className="text-[10px] text-[#D6BA72]">
                  DETECTIONS: {s.priorDiscoverersCount + s.discoveredBy.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EVENT WITNESS CODE GENERATOR */}
      {activeTab === 'EVENTS' && (
        <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-5 font-mono text-xs">
          <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
            GENERATE LIVE EVENT WITNESS CODE
          </div>
          <form
            onSubmit={handleCreateEventWitness}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              value={evtCity}
              onChange={(e) => setEvtCity(e.target.value.toUpperCase())}
              placeholder="CITY (E.G. MADRID)"
              className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2.5 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={evtYear}
              onChange={(e) => setEvtYear(e.target.value)}
              placeholder="YEAR (2026)"
              className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2.5 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={evtCode}
              onChange={(e) => setEvtCode(e.target.value.toUpperCase())}
              placeholder="KHAOS-XXXX"
              className="border border-[#D6BA72] bg-[#050505] px-3 py-2.5 text-[#D6BA72] font-bold"
            />
            <button
              type="submit"
              className="bg-[#D6BA72] text-[#050505] font-bold tracking-[0.2em] uppercase px-4 py-2.5"
            >
              DEPLOY WITNESS CODE
            </button>
          </form>
        </div>
      )}

      {/* 4. ARTIFACT REGISTRY & CARD GENERATOR */}
      {activeTab === 'ARTIFACTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          <form
            onSubmit={handleCreateArtifactCard}
            className="lg:col-span-5 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-3.5"
          >
            <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              MINT PHYSICAL ARTIFACT AUTHENTICATION CARD
            </div>
            <input
              type="text"
              value={artPublicCode}
              onChange={(e) => setArtPublicCode(e.target.value.toUpperCase())}
              placeholder="PUBLIC ID (VX-RUBY-0048)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={artPlainKey}
              onChange={(e) => setArtPlainKey(e.target.value.toUpperCase())}
              placeholder="PRIVATE KEY (XXXX-XXXX-XXXX)"
              className="w-full border border-[#D6BA72] bg-[#050505] px-3 py-2 text-[#D6BA72] font-bold"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={artArchetype}
                onChange={(e) => {
                  const arch = e.target
                    .value as PhysicalArtifactRecord['archetype'];
                  setArtArchetype(arch);
                  setArtName(`VENDEX // ${arch}`);
                }}
                className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
              >
                <option value="RUBY">RUBY</option>
                <option value="SAPPHIRE">SAPPHIRE</option>
                <option value="EMERALD">EMERALD</option>
                <option value="OBSIDIAN">OBSIDIAN (1/1)</option>
              </select>
              <input
                type="text"
                value={artSerial}
                onChange={(e) => setArtSerial(e.target.value)}
                placeholder="0048 / 0300"
                className="border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
              />
            </div>
            <input
              type="text"
              value={artSeries}
              onChange={(e) => setArtSeries(e.target.value)}
              placeholder="SERIES // 001"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#D6BA72] text-[#050505] font-bold tracking-[0.22em] uppercase"
            >
              GENERATE & HASH ARTIFACT CARD
            </button>

            {generatedCardsLog.length > 0 && (
              <button
                type="button"
                onClick={handleExportCardsCsv}
                className="w-full py-2.5 border border-[#D6BA72] text-[#D6BA72] uppercase tracking-[0.2em]"
              >
                EXPORT PRINTABLE CARDS CSV ({generatedCardsLog.length})
              </button>
            )}
          </form>

          <div className="lg:col-span-7 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-3">
            <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              REGISTERED PHYSICAL ARTIFACTS ({dbState.artifacts.length})
            </div>
            {dbState.artifacts.map((a) => (
              <div
                key={a.publicCode}
                className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 flex justify-between items-center"
              >
                <div>
                  <div className="text-[#EDEDEA] font-bold">
                    {a.name} — {a.publicCode}
                  </div>
                  <div className="text-[10px] text-[#EDEDEA]/50">
                    {a.series} // {a.serialNumber} // OWNER:{' '}
                    {a.currentOwnerSoulId || 'NONE'}
                  </div>
                </div>
                <span className="px-2 py-0.5 border border-[#D6BA72]/50 text-[#D6BA72] text-[10px]">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. GENERATION // 00 LEGACY CLAIMS REVIEW */}
      {activeTab === 'LEGACY_QUEUE' && (
        <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-4 font-mono text-xs">
          <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
            GENERATION // 00 VERIFICATION REQUESTS (
            {dbState.legacyRequests.length})
          </div>
          {dbState.legacyRequests.length === 0 ? (
            <div className="text-[#EDEDEA]/45 py-4">
              NO GENERATION // 00 REQUESTS IN QUEUE.
            </div>
          ) : (
            <div className="space-y-3">
              {dbState.legacyRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-[#EDEDEA]/15 bg-[#050505] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[#D6BA72] font-bold">
                      {req.artifactName} // TOKEN: {req.verificationToken}
                    </div>
                    <div className="text-[#EDEDEA]/70">
                      SOUL: {req.soulId} // STATUS: {req.status}
                    </div>
                    <div className="text-[10px] text-[#EDEDEA]/45">
                      PHOTOS: {req.photoFrontName} | {req.photoBackName} |{' '}
                      {req.photoTokenName}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReviewLegacy(req.id, 'VERIFIED')}
                      className="px-4 py-2 border border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72] font-bold"
                    >
                      APPROVE // VERIFY
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewLegacy(req.id, 'REJECTED')}
                      className="px-4 py-2 border border-[#EA1D25] text-[#EA1D25]"
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. THE MARKED VERIFICATION QUEUE */}
      {activeTab === 'MARK_QUEUE' && (
        <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-4 font-mono text-xs">
          <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
            THE MARKED // TATTOO VERIFICATION QUEUE (
            {dbState.markRequests.length})
          </div>
          {dbState.markRequests.length === 0 ? (
            <div className="text-[#EDEDEA]/45 py-4">
              NO MARK VERIFICATION REQUESTS IN QUEUE.
            </div>
          ) : (
            <div className="space-y-3">
              {dbState.markRequests.map((req) => (
                <div
                  key={req.id}
                  className="border border-[#EDEDEA]/15 bg-[#050505] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-[#D6BA72] font-bold">
                      MARK CODE: {req.verificationCode} // VISIBILITY:{' '}
                      {req.visibility}
                    </div>
                    <div className="text-[#EDEDEA]/70">
                      SOUL: {req.soulId} // STATUS: {req.status} // FILE:{' '}
                      {req.photoName}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReviewMark(req.id, 'VERIFIED')}
                      className="px-4 py-2 border border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72] font-bold"
                    >
                      APPROVE // GRANT MARKED
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewMark(req.id, 'REJECTED')}
                      className="px-4 py-2 border border-[#EA1D25] text-[#EA1D25]"
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. UNLOCKS & DESIGNATIONS */}
      {activeTab === 'UNLOCKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
          <form
            onSubmit={handleCreateUnlock}
            className="lg:col-span-6 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-3.5"
          >
            <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              CREATE UNLOCK ENGINE CONTENT
            </div>
            <input
              type="text"
              value={unlId}
              onChange={(e) => setUnlId(e.target.value.toUpperCase())}
              placeholder="UNLOCK ID (ARCHIVE_0200)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={unlCode}
              onChange={(e) => setUnlCode(e.target.value)}
              placeholder="DISPLAY CODE (ARCHIVE // 0200)"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <input
              type="text"
              value={unlTitle}
              onChange={(e) => setUnlTitle(e.target.value)}
              placeholder="CONTENT TITLE"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            />
            <select
              value={unlType}
              onChange={(e) => setUnlType(e.target.value as UnlockContentType)}
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA]"
            >
              <option value="ARCHIVE">ARCHIVE</option>
              <option value="TRANSMISSION">TRANSMISSION</option>
              <option value="DIGITAL_ARTIFACT">DIGITAL_ARTIFACT</option>
              <option value="SECRET_PAGE">SECRET_PAGE</option>
            </select>
            <textarea
              value={unlDesc}
              onChange={(e) => setUnlDesc(e.target.value)}
              placeholder="DECLASSIFIED CONTENT BODY"
              className="w-full border border-[#EDEDEA]/20 bg-[#050505] px-3 py-2 text-[#EDEDEA] h-20"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#D6BA72] text-[#050505] font-bold tracking-[0.22em] uppercase"
            >
              SAVE UNLOCK ITEM
            </button>
          </form>

          <div className="lg:col-span-6 border border-[#EDEDEA]/15 bg-[#080808] p-5 space-y-4">
            <div className="text-[#D6BA72] font-bold tracking-[0.22em] border-b border-[#EDEDEA]/15 pb-2">
              GRANT DESIGNATION TO ACTIVE HOST ({soulState.soulId})
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DESIGNATION_CATALOG.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleGrantDesignationToSelf(d.id)}
                  className="p-2.5 border border-[#EDEDEA]/20 hover:border-[#D6BA72] bg-[#050505] text-left"
                >
                  <div className="text-[#D6BA72] font-bold">{d.id}</div>
                  <div className="text-[9px] text-[#EDEDEA]/50 truncate">
                    {d.classification}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
