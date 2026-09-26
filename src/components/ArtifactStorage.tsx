import React, { useState } from 'react';
import {
  bindPhysicalArtifact,
  loadValkhorDb,
  releasePhysicalArtifact,
  submitLegacyArtifactVerification,
} from '../services/valkhorBackend';
import { SoulState, UnlockItem } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface ArtifactStorageProps {
  soulState: SoulState;
  onApplySoulPatch?: (patch: Partial<SoulState>, toast?: string) => void;
}

export interface RelicCardMetadata {
  archetype: 'RUBY' | 'SAPPHIRE' | 'EMERALD';
  publicCode: string;
  title: string;
  cardTitle: string;
  entityName: string;
  elementCode: string;
  stars: number;
  bpm: string;
  cardScanUrl: string;
  artworkUrl: string;
  accentHex: string;
  borderClass: string;
  badgeClass: string;
  lore: string;
  abilityLine?: string;
}

export const RELIC_CARDS_CATALOG: RelicCardMetadata[] = [
  {
    archetype: 'RUBY',
    publicCode: 'VX-RUBY-0047',
    title: 'VENDEX // RUBY',
    cardTitle: 'VENDEX : RUBY',
    entityName: 'GROUDON // SEISMIC CONDUIT',
    elementCode: 'EARTH // 地 // IGNHUM-CORE',
    stars: 12,
    bpm: '160 BPM // SCHRANZ',
    cardScanUrl: '/assets/valkhor/card_ruby.jpg',
    artworkUrl: '/assets/valkhor/art_ruby.jpg',
    accentHex: '#EA1D25',
    borderClass: 'border-[#EA1D25]/60 hover:border-[#D6BA72]',
    badgeClass: 'border-[#EA1D25] text-[#EA1D25] bg-[#B5161B]/20',
    lore: "Rising from the planet's molten core, Groudon marches to the relentless rhythm of hard techno. Every step unleashes seismic basslines that crack continents apart, while rivers of magma pulse in perfect synchronization with an unforgiving 160 BPM Schranz beat.",
    abilityLine:
      'Once per turn, you can activate "Schranz Blades": All cards your opponent controls lose 5555 ATK/DEF.',
  },
  {
    archetype: 'SAPPHIRE',
    publicCode: 'VX-SAPPHIRE-0019',
    title: 'VENDEX // SAPPHIRE',
    cardTitle: 'VENDEX : SAPPHIRE',
    entityName: 'KYOGRE // ABYSSAL LEVIATHAN',
    elementCode: 'WATER // 水 // ABYSS-PULSE',
    stars: 10,
    bpm: '162 BPM // SCHRANZ',
    cardScanUrl: '/assets/valkhor/card_sapphire.jpg',
    artworkUrl: '/assets/valkhor/art_sapphire.jpg',
    accentHex: '#5B9BD5',
    borderClass: 'border-[#5B9BD5]/50 hover:border-[#D6BA72]',
    badgeClass: 'border-[#5B9BD5] text-[#8EC2F2] bg-[#5B9BD5]/15',
    lore: 'Kyogre, Abyssal Schranz Leviathan commands the ocean with overwhelming force. Every beat of its thunderous aquatic pulse echoes like a hard techno kick across the abyss, generating tidal storms capable of drowning entire battlefields.',
    abilityLine:
      'As the tempo rises, its power intensifies, unleashing chaotic Schranz frequencies that distort reality and overwhelm all opposing monsters.',
  },
  {
    archetype: 'EMERALD',
    publicCode: 'VX-EMERALD-0088',
    title: 'VENDEX // EMERALD',
    cardTitle: 'VENDEX : EMERALD',
    entityName: 'RAYQUAZA // EMBODIMENT OF KHAOS',
    elementCode: 'DIVINE // 神 // KHAOS-STORM',
    stars: 12,
    bpm: '165 BPM // KHAOS',
    cardScanUrl: '/assets/valkhor/card_emerald.jpg',
    artworkUrl: '/assets/valkhor/art_emerald.jpg',
    accentHex: '#68B07B',
    borderClass: 'border-[#68B07B]/50 hover:border-[#D6BA72]',
    badgeClass: 'border-[#68B07B] text-[#8CD49F] bg-[#68B07B]/15',
    lore: 'Forged within the endless storms above the world, Rayquaza transcended its role as guardian of the skies and became the living embodiment of KHAOS. Its serpentine body twists through dimensions like an infinite soundwave, fueled by relentless Hard Techno frequencies and the crushing pulse of Schranz.',
    abilityLine: 'As the BPM rises, reality itself begins to fracture.',
  },
];

export const ArtifactStorage: React.FC<ArtifactStorageProps> = ({
  soulState,
  onApplySoulPatch,
}) => {
  const [activeTab, setActiveTab] = useState<
    'REGISTRY' | 'GEN_00' | 'EXTERNAL_STORAGE'
  >('REGISTRY');
  const [dbState, setDbState] = useState(() => loadValkhorDb());

  // Card Render Mode: 'SCAN' (Dark-graded physical card scan) vs 'TERMINAL' (Brutalist OS Conduit reconstruction)
  const [cardDisplayMode, setCardDisplayMode] = useState<'SCAN' | 'TERMINAL'>(
    'SCAN'
  );
  const [inspectedCard, setInspectedCard] = useState<RelicCardMetadata | null>(
    null
  );

  // Dual-Code Physical Artifact Bind State
  const [publicCodeInput, setPublicCodeInput] = useState<string>('');
  const [privateKeyInput, setPrivateKeyInput] = useState<string>('');
  const [bindFeedback, setBindFeedback] = useState<{
    ok: boolean;
    message: string;
    triadTriggered?: boolean;
    triadUnlock?: UnlockItem;
  } | null>(null);

  // Generation // 00 Legacy Verification State
  const [legacyArtifactName, setLegacyArtifactName] = useState<
    'VENDEX // RUBY' | 'VENDEX // SAPPHIRE' | 'VENDEX // EMERALD'
  >('VENDEX // RUBY');
  const [verificationToken, setVerificationToken] = useState<string>(
    () => `LS-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [frontFileName, setFrontFileName] = useState<string>('');
  const [backFileName, setBackFileName] = useState<string>('');
  const [tokenFileName, setTokenFileName] = useState<string>('');
  const [legacySubmittedMsg, setLegacySubmittedMsg] = useState<string | null>(
    null
  );

  const boundArtifacts = soulState.boundArtifacts || [];
  const hasRuby = boundArtifacts.some((a) => a.archetype === 'RUBY');
  const hasSapphire = boundArtifacts.some((a) => a.archetype === 'SAPPHIRE');
  const hasEmerald = boundArtifacts.some((a) => a.archetype === 'EMERALD');
  const triadComplete =
    Boolean(soulState.triadUnlocked) || (hasRuby && hasSapphire && hasEmerald);

  const myLegacyRequests = dbState.legacyRequests.filter(
    (r) => r.soulId === soulState.soulId
  );

  const selectedLegacyCard =
    RELIC_CARDS_CATALOG.find((c) => c.title === legacyArtifactName) ||
    RELIC_CARDS_CATALOG[0];

  const handleOpenMerch = () => {
    soundEngine.playVendexPulse();
    window.open(
      'https://vendexofficial.com/#merch',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleBindSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicCodeInput.trim() || !privateKeyInput.trim()) return;

    soundEngine.playVendexPulse();
    const res = await bindPhysicalArtifact(
      soulState,
      publicCodeInput,
      privateKeyInput
    );
    setDbState(loadValkhorDb());

    if (res.ok) {
      soundEngine.playConnectionRestored();
      setBindFeedback({
        ok: true,
        message: res.message,
        triadTriggered: res.triadTriggered,
        triadUnlock: res.triadUnlockItem,
      });
      setPublicCodeInput('');
      setPrivateKeyInput('');
      if (res.updatedSoulPatch && onApplySoulPatch) {
        onApplySoulPatch(
          res.updatedSoulPatch,
          res.triadTriggered
            ? 'ARTIFACT PATTERN DETECTED // THE TRIAD UNLOCKED.'
            : 'ARTIFACT VERIFIED.'
        );
      }
    } else {
      soundEngine.playAlarm();
      setBindFeedback({
        ok: false,
        message: res.message,
      });
    }
  };

  const handleReleaseArtifact = (publicCode: string) => {
    soundEngine.playClick();
    const res = releasePhysicalArtifact(soulState, publicCode);
    setDbState(loadValkhorDb());
    if (res.ok) {
      setBindFeedback({
        ok: true,
        message: res.message,
      });
      if (res.updatedSoulPatch && onApplySoulPatch) {
        onApplySoulPatch(res.updatedSoulPatch, 'ARTIFACT RELEASED.');
      }
    } else {
      setBindFeedback({
        ok: false,
        message: res.message,
      });
    }
  };

  const handleSubmitLegacy = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playConnectionRestored();
    const res = submitLegacyArtifactVerification(
      soulState,
      legacyArtifactName,
      verificationToken,
      frontFileName || 'GARMENT_FRONT.JPG',
      backFileName || 'GARMENT_BACK.JPG',
      tokenFileName || `TOKEN_${verificationToken}.JPG`
    );
    setDbState(loadValkhorDb());
    setLegacySubmittedMsg(
      `VERIFICATION REQUEST [${res.request.verificationToken}] LOGGED AS PENDING REVIEW.`
    );
    setVerificationToken(`LS-${Math.floor(10000 + Math.random() * 90000)}`);
    setFrontFileName('');
    setBackFileName('');
    setTokenFileName('');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Fullscreen Relic Card Inspection Modal */}
      {inspectedCard && (
        <div
          className="fixed inset-0 z-50 bg-[#050505]/92 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setInspectedCard(null)}
        >
          <div
            className="max-w-4xl w-full border-2 border-[#D6BA72] bg-[#080808] p-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:col-span-5 bg-[#050505] border border-[#D6BA72]/50 p-2 relative">
              <img
                src={inspectedCard.cardScanUrl}
                alt={inspectedCard.cardTitle}
                className="w-full h-auto block object-contain"
              />
              <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D6BA72]" />
              <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D6BA72]" />
              <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D6BA72]" />
              <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D6BA72]" />
            </div>

            <div className="md:col-span-7 flex flex-col justify-between space-y-4 font-mono">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3">
                  <div>
                    <div className="text-[10px] tracking-[0.26em] text-[#D6BA72]">
                      VALKHOR RELIC DOSSIER // {inspectedCard.publicCode}
                    </div>
                    <h2 className="font-display text-4xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
                      {inspectedCard.cardTitle}
                    </h2>
                  </div>
                  <VendexSymbol size={36} color="#D6BA72" />
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] tracking-[0.2em]">
                  <span className="border border-[#D6BA72]/50 bg-[#B99A53]/15 px-2.5 py-1 text-[#D6BA72]">
                    {inspectedCard.elementCode}
                  </span>
                  <span className="border border-[#EDEDEA]/20 bg-[#050505] px-2.5 py-1 text-[#EDEDEA]/80">
                    {inspectedCard.bpm}
                  </span>
                  <span className="border border-[#EDEDEA]/20 bg-[#050505] px-2.5 py-1 text-[#D6BA72]">
                    {'★'.repeat(inspectedCard.stars)}
                  </span>
                </div>

                <div className="border border-[#B99A53]/40 bg-[#050505] p-4 space-y-2.5">
                  <div className="text-[10px] tracking-[0.24em] text-[#8E7443]">
                    ARCHIVAL INSCRIPTION //
                  </div>
                  <p className="text-xs tracking-[0.15em] text-[#EDEDEA]/90 leading-relaxed">
                    {inspectedCard.lore}
                  </p>
                  {inspectedCard.abilityLine && (
                    <p className="text-xs tracking-[0.15em] text-[#D6BA72] pt-2 border-t border-[#EDEDEA]/10 leading-relaxed">
                      &gt; {inspectedCard.abilityLine}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-3 border-t border-[#EDEDEA]/15">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setPublicCodeInput(inspectedCard.publicCode);
                    setActiveTab('REGISTRY');
                    setInspectedCard(null);
                  }}
                  className="flex-1 py-3 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] font-display text-xl font-bold tracking-[0.24em] uppercase"
                >
                  LOAD ID [{inspectedCard.publicCode}] IN BIND TERMINAL
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedCard(null)}
                  className="px-5 py-3 border border-[#EDEDEA]/25 text-xs tracking-[0.22em] text-[#EDEDEA]/70 hover:text-[#EDEDEA]"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#D6BA72]">
            NODE 07 // ARTIFACT REGISTRY & PHYSICAL CONDUITS
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            ARTIFACT REGISTRY
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.22em]">
          {(
            [
              ['REGISTRY', 'BIND & RELIC CARDS'],
              ['GEN_00', 'VERIFY GENERATION // 00'],
              ['EXTERNAL_STORAGE', 'ARTIFACT STORAGE (MERCH)'],
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

      {/* THE TRIAD CONVERGENCE BANNER */}
      {triadComplete && (
        <div className="border-2 border-[#D6BA72] bg-[#050505] p-6 space-y-4 relative overflow-hidden animate-flicker">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D6BA72]/30 pb-4">
            <div>
              <div className="font-mono text-xs tracking-[0.28em] text-[#D6BA72] font-bold">
                ARTIFACT PATTERN DETECTED. // UNREGISTERED CONFIGURATION FOUND.
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-[0.24em] text-[#EDEDEA] mt-1">
                THE TRIAD // RUBY + SAPPHIRE + EMERALD
              </h2>
            </div>
            <span className="border border-[#D6BA72] bg-[#B99A53]/25 px-4 py-2 font-mono text-xs tracking-[0.24em] text-[#D6BA72] font-bold">
              DESIGNATION // TRIAD_HOLDER
            </span>
          </div>

          <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/85 leading-relaxed">
            ALL THREE PRIMORDIAL RELICS ARE ANCHORED TO {soulState.soulId}. THE
            TRIAD SANCTUM ARCHIVE AND EXCLUSIVE FREQUENCY HAVE BEEN PERMANENTLY
            UNLOCKED IN YOUR SOUL RECORD.
          </p>

          <audio
            controls
            src="/assets/audio/vendex_track_2.mp3"
            className="w-full h-9 filter invert contrast-125"
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* PRIMORDIAL RELIC CARDS SHOWCASE (RUBY / SAPPHIRE / EMERALD)         */}
      {/* =================================================================== */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDEDEA]/15 pb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-[#D6BA72]">
              PRIMORDIAL RELIC CONDUITS // THE TRIAD SERIES
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-[0.22em] text-[#EDEDEA] mt-0.5">
              VENDEX : RUBY • SAPPHIRE • EMERALD
            </h2>
          </div>

          {/* Toggle between Rectified Dark Card Scan vs Native Terminal Frame */}
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
            <span className="text-[#EDEDEA]/45">OPTIC MODE //</span>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCardDisplayMode('SCAN');
              }}
              className={`px-3 py-1.5 border ${
                cardDisplayMode === 'SCAN'
                  ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72] font-bold'
                  : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/60'
              }`}
            >
              RELIC CARD SCAN
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCardDisplayMode('TERMINAL');
              }}
              className={`px-3 py-1.5 border ${
                cardDisplayMode === 'TERMINAL'
                  ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72] font-bold'
                  : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/60'
              }`}
            >
              TERMINAL DOSSIER
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {RELIC_CARDS_CATALOG.map((card) => {
            const isBound = boundArtifacts.some(
              (a) => a.archetype === card.archetype
            );

            return (
              <div
                key={card.archetype}
                className={`border bg-[#050505] p-4 flex flex-col justify-between space-y-4 transition-all relative group ${
                  isBound
                    ? 'border-[#D6BA72] shadow-[0_0_25px_rgba(214,186,114,0.12)]'
                    : card.borderClass
                }`}
              >
                {/* Top Card Status Bar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em]">
                    <span className="text-[#D6BA72] font-bold">
                      {card.publicCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-[9px] font-bold ${
                        isBound
                          ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                          : 'border-[#EDEDEA]/20 text-[#EDEDEA]/50'
                      }`}
                    >
                      {isBound ? 'BOUND // VERIFIED' : 'UNBOUND RELIC'}
                    </span>
                  </div>

                  {cardDisplayMode === 'SCAN' ? (
                    /* MODE 1: VALKHOR DARK-GRADED PHYSICAL CARD SCAN */
                    <div
                      onClick={() => {
                        soundEngine.playClick();
                        setInspectedCard(card);
                      }}
                      className="cursor-pointer relative bg-[#080808] border border-[#EDEDEA]/15 overflow-hidden aspect-[640/920]"
                    >
                      <img
                        src={card.cardScanUrl}
                        alt={card.cardTitle}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
                          isBound ? 'brightness-105 contrast-110' : 'opacity-90'
                        }`}
                      />
                      {/* Subtle Dark Terminal Vignette & Targeting Reticles */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(circle at 50% 45%, transparent 55%, rgba(5, 5, 5, 0.75) 100%)',
                        }}
                      />
                      <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#D6BA72]/60 pointer-events-none" />
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#D6BA72]/60 pointer-events-none" />
                      <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-[#D6BA72]/60 pointer-events-none" />
                      <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-[#D6BA72]/60 pointer-events-none" />

                      <div className="absolute bottom-2 right-2.5 bg-[#050505]/90 border border-[#D6BA72]/50 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-[#D6BA72]">
                        [INSPECT RELIC]
                      </div>
                    </div>
                  ) : (
                    /* MODE 2: BRUTALIST TERMINAL CONDUIT RECONSTRUCTION */
                    <div
                      onClick={() => {
                        soundEngine.playClick();
                        setInspectedCard(card);
                      }}
                      className="cursor-pointer border border-[#B99A53]/40 bg-[#080808] p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-2">
                        <div>
                          <div className="font-display text-2xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                            {card.cardTitle}
                          </div>
                          <div className="font-mono text-[9px] tracking-[0.2em] text-[#D6BA72]">
                            {card.elementCode}
                          </div>
                        </div>
                        <VendexSymbol size={24} color="#D6BA72" />
                      </div>

                      <div className="font-mono text-[10px] tracking-[0.22em] text-[#D6BA72] text-right">
                        {'★'.repeat(card.stars)}
                      </div>

                      <div className="aspect-square bg-[#050505] border border-[#D6BA72]/40 relative overflow-hidden">
                        <img
                          src={card.artworkUrl}
                          alt={card.cardTitle}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1.5 left-2 bg-[#050505]/85 border border-[#EDEDEA]/20 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.2em] text-[#D6BA72]">
                          {card.bpm}
                        </div>
                      </div>

                      <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3 font-mono text-[10px] tracking-[0.14em] text-[#EDEDEA]/80 space-y-1.5 leading-relaxed">
                        <div className="text-[#D6BA72] font-bold text-[9px] tracking-[0.2em]">
                          [{card.entityName}]
                        </div>
                        <p>{card.lore}</p>
                        {card.abilityLine && (
                          <p className="text-[#D6BA72] pt-1 border-t border-[#EDEDEA]/10">
                            &gt; {card.abilityLine}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-2 border-t border-[#EDEDEA]/10 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setPublicCodeInput(card.publicCode);
                      setActiveTab('REGISTRY');
                    }}
                    className="flex-1 py-2.5 border border-[#D6BA72]/60 hover:border-[#D6BA72] bg-[#B99A53]/15 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] font-bold uppercase transition-colors"
                  >
                    {isBound ? 'RELIC BOUND' : `SELECT [${card.publicCode}]`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setInspectedCard(card);
                    }}
                    className="px-3 py-2.5 border border-[#EDEDEA]/20 hover:border-[#D6BA72] text-[#EDEDEA]/70 hover:text-[#D6BA72]"
                  >
                    VIEW
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: ARTIFACT REGISTRY (DUAL-CODE BIND + CUSTODY + TRANSFERS)     */}
      {/* =================================================================== */}
      {activeTab === 'REGISTRY' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 Cols: Dual-Code Physical Card Authentication */}
          <div className="lg:col-span-6 border border-[#B99A53]/50 bg-[#080808] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72]">
                  PHYSICAL AUTHENTICATION CARD
                </div>
                <h2 className="font-display text-3xl font-bold tracking-[0.22em] text-[#EDEDEA] mt-0.5">
                  BIND ARTIFACT TO SOUL
                </h2>
              </div>
              <VendexSymbol size={34} color="#D6BA72" />
            </div>

            <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/70 leading-relaxed">
              EACH PHYSICAL ARTIFACT INCLUDES AN AUTHENTICATION CARD WITH A
              PUBLIC ARTIFACT ID AND A PRIVATE AUTHENTICATION KEY. ENTER BOTH
              BELOW TO ANCHOR CUSTODY TO {soulState.soulId}.
            </p>

            <form onSubmit={handleBindSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/55">
                  PUBLIC ARTIFACT ID (E.G. VX-RUBY-0047)
                </label>
                <input
                  type="text"
                  value={publicCodeInput}
                  onChange={(e) =>
                    setPublicCodeInput(e.target.value.toUpperCase())
                  }
                  placeholder="VX-XXXX-0000"
                  className="w-full border border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#050505] px-4 py-3.5 font-mono text-sm tracking-[0.24em] text-[#EDEDEA] focus:outline-none uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/55">
                  PRIVATE AUTHENTICATION KEY
                </label>
                <input
                  type="password"
                  value={privateKeyInput}
                  onChange={(e) =>
                    setPrivateKeyInput(e.target.value.toUpperCase())
                  }
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full border border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#050505] px-4 py-3.5 font-mono text-sm tracking-[0.24em] text-[#EDEDEA] focus:outline-none uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 border border-[#D6BA72] bg-[#D6BA72] hover:bg-[#B99A53] text-[#050505] font-display text-2xl font-bold tracking-[0.28em] uppercase transition-colors"
              >
                [BIND]
              </button>
            </form>

            {bindFeedback && (
              <div
                className={`border-2 p-4 font-mono text-xs tracking-[0.2em] ${
                  bindFeedback.ok
                    ? 'border-[#D6BA72] bg-[#B99A53]/15 text-[#D6BA72]'
                    : 'border-[#EA1D25] bg-[#B5161B]/20 text-[#EA1D25]'
                }`}
              >
                &gt; {bindFeedback.message}
              </div>
            )}
          </div>

          {/* Right 6 Cols: Bound Artifacts & Ownership Transfer Ledger */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
                <span className="text-[#D6BA72]">
                  KNOWN ARTIFACTS // {soulState.soulId}
                </span>
                <span className="text-[#EDEDEA]/50">
                  {boundArtifacts.length} VERIFIED
                </span>
              </div>

              {boundArtifacts.length === 0 ? (
                <div className="border border-[#EDEDEA]/10 bg-[#050505] p-6 text-center font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/45">
                  NO PHYSICAL ARTIFACTS CURRENTLY BOUND TO THIS SOUL. BIND A
                  CARD OR VERIFY A GENERATION // 00 GARMENT.
                </div>
              ) : (
                <div className="space-y-3">
                  {boundArtifacts.map((art) => {
                    const cardMeta = RELIC_CARDS_CATALOG.find(
                      (c) => c.archetype === art.archetype
                    );
                    return (
                      <div
                        key={art.publicCode}
                        className="border border-[#D6BA72]/60 bg-[#050505] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
                      >
                        <div className="flex items-center gap-3">
                          {cardMeta && (
                            <img
                              src={cardMeta.cardScanUrl}
                              alt={art.name}
                              className="w-12 h-16 object-cover border border-[#D6BA72]/50 shrink-0"
                            />
                          )}
                          <div className="space-y-1">
                            <div className="text-xs tracking-[0.22em] text-[#D6BA72] font-bold">
                              {art.name} — {art.series}
                            </div>
                            <div className="text-[11px] tracking-[0.18em] text-[#EDEDEA]/80">
                              ID: {art.publicCode} // SERIAL: {art.serialNumber}{' '}
                              // STATUS: VERIFIED
                            </div>
                          </div>
                        </div>

                        {!art.publicCode.startsWith('GEN00-') && (
                          <button
                            type="button"
                            onClick={() =>
                              handleReleaseArtifact(art.publicCode)
                            }
                            className="px-3 py-2 border border-[#EA1D25]/60 hover:border-[#EA1D25] bg-[#B5161B]/15 text-[#EA1D25] text-[10px] tracking-[0.2em] uppercase shrink-0"
                          >
                            RELEASE ARTIFACT
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ownership & Transfer History Ledger */}
            <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
                <span className="text-[#D6BA72]">
                  ARTIFACT CUSTODY & TRANSFER LEDGER
                </span>
                <span className="text-[#EDEDEA]/45">CHAIN OF CUSTODY</span>
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {dbState.artifacts.map((art) => (
                  <div
                    key={art.publicCode}
                    className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-2.5 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between tracking-[0.2em]">
                      <span className="text-[#EDEDEA] font-bold">
                        {art.name} ({art.publicCode})
                      </span>
                      <span
                        className={`px-2 py-0.5 border text-[10px] ${
                          art.status === 'VERIFIED'
                            ? 'border-[#D6BA72] text-[#D6BA72]'
                            : art.status === 'RELEASED'
                            ? 'border-[#EA1D25] text-[#EA1D25]'
                            : 'border-[#EDEDEA]/25 text-[#EDEDEA]/55'
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>

                    <div className="text-[10px] tracking-[0.18em] text-[#EDEDEA]/55">
                      {art.series} // {art.generation} // SERIAL:{' '}
                      {art.serialNumber} // CURRENT CUSTODIAN:{' '}
                      <span className="text-[#D6BA72]">
                        {art.currentOwnerSoulId || 'NONE (CLAIMABLE)'}
                      </span>
                    </div>

                    {art.history.length > 0 && (
                      <div className="pt-2 border-t border-[#EDEDEA]/10 space-y-1 text-[10px] tracking-[0.16em] text-[#EDEDEA]/70">
                        <div className="text-[#EDEDEA]/40">
                          HISTORICAL CUSTODY TRACE:
                        </div>
                        {art.history.map((h, i) => (
                          <div key={i}>
                            &gt; {h.year} // {h.soulId} [{h.event}]
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: GENERATION // 00 LEGACY VERIFICATION                         */}
      {/* =================================================================== */}
      {activeTab === 'GEN_00' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 border border-[#B99A53]/50 bg-[#080808] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.25em] text-[#D6BA72]">
                  GENERATION // 00 — PRE-CARD ARCHIVE VERIFICATION
                </div>
                <h2 className="font-display text-3xl font-bold tracking-[0.22em] text-[#EDEDEA] mt-0.5">
                  VERIFY GENERATION // 00 ARTIFACT
                </h2>
              </div>
              <VendexSymbol size={34} color="#D6BA72" />
            </div>

            <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/70 leading-relaxed">
              ORIGINAL VENDEX // RUBY, SAPPHIRE, AND EMERALD GARMENTS ISSUED
              PRIOR TO CRYPTOGRAPHIC CARDS ARE CLASSIFIED AS GENERATION // 00.
              WRITE THE GENERATED VERIFICATION TOKEN ON PAPER NEXT TO YOUR
              ARTIFACT AND SUBMIT 3 PHOTOGRAPHS FOR MANUAL ARCHIVE VERIFICATION.
            </p>

            <form onSubmit={handleSubmitLegacy} className="space-y-5">
              {/* Step 1: Select Artifact */}
              <div className="space-y-2">
                <label className="block font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/55">
                  01 // SELECT GENERATION 00 ARTIFACT
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      'VENDEX // RUBY',
                      'VENDEX // SAPPHIRE',
                      'VENDEX // EMERALD',
                    ] as const
                  ).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setLegacyArtifactName(name);
                      }}
                      className={`py-3 px-3 border font-mono text-xs tracking-[0.2em] font-bold transition-colors ${
                        legacyArtifactName === name
                          ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72]'
                          : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/65 hover:border-[#EDEDEA]/40'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Unique Verification Token */}
              <div className="border border-[#D6BA72]/60 bg-[#050505] p-4 flex items-center justify-between font-mono">
                <div>
                  <div className="text-[10px] tracking-[0.24em] text-[#EDEDEA]/50">
                    02 // ASSIGNED VERIFICATION TOKEN (WRITE ON PAPER WITH DATE)
                  </div>
                  <div className="text-2xl font-bold tracking-[0.28em] text-[#D6BA72] mt-1">
                    VERIFICATION TOKEN // {verificationToken}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setVerificationToken(
                      `LS-${Math.floor(10000 + Math.random() * 90000)}`
                    )
                  }
                  className="px-3 py-1.5 border border-[#EDEDEA]/20 text-[10px] tracking-[0.2em] text-[#EDEDEA]/60 hover:text-[#D6BA72]"
                >
                  REGENERATE
                </button>
              </div>

              {/* Step 3: 3 Photo Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[10px] tracking-[0.18em]">
                <label className="border border-[#EDEDEA]/20 hover:border-[#D6BA72] bg-[#050505] p-4 cursor-pointer flex flex-col justify-between space-y-2">
                  <span className="text-[#D6BA72]">PHOTO 01 // FRONT</span>
                  <span className="text-[#EDEDEA]/60 truncate">
                    {frontFileName || 'SELECT GARMENT FRONT'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFrontFileName(e.target.files?.[0]?.name || '')
                    }
                    className="hidden"
                  />
                </label>

                <label className="border border-[#EDEDEA]/20 hover:border-[#D6BA72] bg-[#050505] p-4 cursor-pointer flex flex-col justify-between space-y-2">
                  <span className="text-[#D6BA72]">PHOTO 02 // BACK</span>
                  <span className="text-[#EDEDEA]/60 truncate">
                    {backFileName || 'SELECT GARMENT BACK'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setBackFileName(e.target.files?.[0]?.name || '')
                    }
                    className="hidden"
                  />
                </label>

                <label className="border border-[#EDEDEA]/20 hover:border-[#D6BA72] bg-[#050505] p-4 cursor-pointer flex flex-col justify-between space-y-2">
                  <span className="text-[#D6BA72]">
                    PHOTO 03 // WITH {verificationToken}
                  </span>
                  <span className="text-[#EDEDEA]/60 truncate">
                    {tokenFileName || 'GARMENT + WRITTEN TOKEN'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setTokenFileName(e.target.files?.[0]?.name || '')
                    }
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-4 border border-[#D6BA72] bg-[#D6BA72] hover:bg-[#B99A53] text-[#050505] font-display text-2xl font-bold tracking-[0.26em] uppercase transition-colors"
              >
                SUBMIT GENERATION // 00 FOR VERIFICATION
              </button>
            </form>

            {legacySubmittedMsg && (
              <div className="border-2 border-[#D6BA72] bg-[#B99A53]/15 p-4 font-mono text-xs tracking-[0.2em] text-[#D6BA72]">
                &gt; {legacySubmittedMsg}
              </div>
            )}
          </div>

          {/* Right 5 Cols: Selected Relic Preview & Queue */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex items-center gap-4">
              <img
                src={selectedLegacyCard.cardScanUrl}
                alt={selectedLegacyCard.cardTitle}
                className="w-28 h-auto border border-[#D6BA72]/60 shrink-0"
              />
              <div className="font-mono space-y-1.5">
                <div className="text-[10px] tracking-[0.22em] text-[#D6BA72]">
                  SELECTED ARCHETYPE // GENERATION 00
                </div>
                <div className="font-display text-2xl font-bold tracking-[0.22em] text-[#EDEDEA]">
                  {selectedLegacyCard.cardTitle}
                </div>
                <p className="text-[10px] tracking-[0.14em] text-[#EDEDEA]/65 line-clamp-4">
                  {selectedLegacyCard.lore}
                </p>
              </div>
            </div>

            <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
                <span className="text-[#D6BA72]">
                  GENERATION // 00 VERIFICATION QUEUE
                </span>
                <span className="text-[#EDEDEA]/50">
                  {myLegacyRequests.length} SUBMISSIONS
                </span>
              </div>

              {myLegacyRequests.length === 0 ? (
                <div className="border border-[#EDEDEA]/10 bg-[#050505] p-6 text-center font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/45">
                  NO GENERATION // 00 VERIFICATION REQUESTS SUBMITTED YET.
                </div>
              ) : (
                <div className="space-y-3">
                  {myLegacyRequests.map((req) => (
                    <div
                      key={req.id}
                      className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-2 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between tracking-[0.2em]">
                        <span className="text-[#EDEDEA] font-bold">
                          {req.artifactName}
                        </span>
                        <span
                          className={`px-2 py-0.5 border text-[10px] ${
                            req.status === 'VERIFIED'
                              ? 'border-[#D6BA72] text-[#D6BA72]'
                              : req.status === 'REJECTED'
                              ? 'border-[#EA1D25] text-[#EA1D25]'
                              : 'border-[#B99A53]/60 text-[#D6BA72]'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <div className="text-[10px] tracking-[0.18em] text-[#EDEDEA]/60">
                        {req.generation} // TOKEN: {req.verificationToken}
                      </div>
                      <div className="text-[10px] tracking-[0.16em] text-[#EDEDEA]/40">
                        EVIDENCE: {req.photoFrontName}, {req.photoBackName},{' '}
                        {req.photoTokenName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: EXTERNAL ARTIFACT STORAGE (OFFICIAL MERCH PORTAL)            */}
      {/* =================================================================== */}
      {activeTab === 'EXTERNAL_STORAGE' && (
        <div className="space-y-6">
          <div className="border border-[#B99A53]/50 bg-[#050505] p-6 sm:p-8 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 border border-[#D6BA72]/40 bg-[#080808] px-3 py-1 font-mono text-[10px] tracking-[0.25em] text-[#D6BA72]">
                  <span className="w-1.5 h-1.5 bg-[#D6BA72] animate-pulse" />
                  <span>PHYSICAL CONDUIT REQUISITION // ACTIVE</span>
                </div>

                <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-[0.22em] text-[#EDEDEA] leading-tight">
                  CARRY THE SIGNAL INTO THE PHYSICAL WORLD.
                </h2>

                <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/75 leading-relaxed max-w-2xl">
                  ARTIFACTS STORED IN THIS VAULT ARE PHYSICAL IDENTIFIERS FOR
                  LOST SOULS OPERATING ON EARTH. REQUISITIONING AN ARTIFACT
                  REDIRECTS YOUR TERMINAL TO THE OFFICIAL VENDEX SUPPLY NODE.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleOpenMerch}
                    onMouseEnter={() => soundEngine.playHover()}
                    className="px-6 py-3.5 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] font-display text-2xl font-bold tracking-[0.26em] uppercase transition-colors"
                  >
                    ACCESS ARTIFACT STORAGE [VENDEXOFFICIAL.COM]
                  </button>

                  <div className="font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]/45">
                    AUTHORIZED FOR // {soulState.soulId}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-4">
                <VendexSymbol size={72} color="#D6BA72" />
                <div className="text-center font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/60 space-y-1">
                  <div>DESTINATION // VENDEXOFFICIAL.COM/#MERCH</div>
                  <div className="text-[#D6BA72]">ENCRYPTED EXTERNAL BRIDGE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
