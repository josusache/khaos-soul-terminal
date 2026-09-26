import React, { useEffect, useRef, useState } from 'react';
import {
  DESIGNATION_CATALOG,
  loadValkhorDb,
  submitMarkVerification,
} from '../services/valkhorBackend';
import { SectionId, SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VENDEX_SVG_PATH, VendexSymbol } from './VendexSymbol';

interface SoulProfileProps {
  soulState: SoulState;
  onNavigate: (section: SectionId) => void;
  onTriggerFinalCollapse: () => void;
  onApplySoulPatch?: (patch: Partial<SoulState>, toast?: string) => void;
}

export const SoulProfile: React.FC<SoulProfileProps> = ({
  soulState,
  onNavigate,
  onTriggerFinalCollapse,
  onApplySoulPatch,
}) => {
  const storyCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exportedNotice, setExportedNotice] = useState<boolean>(false);

  // Magic Link Auth / Restore Connection State
  const [emailInput, setEmailInput] = useState<string>(soulState.email || '');
  const [magicLinkStep, setMagicLinkStep] = useState<
    'IDLE' | 'SENT' | 'LINKED'
  >(soulState.authLinked ? 'LINKED' : 'IDLE');
  const [magicTokenInput, setMagicTokenInput] = useState<string>('');
  const [generatedMagicCode, setGeneratedMagicCode] = useState<string>('');

  // Optional Identity Metadata State
  const [aliasInput, setAliasInput] = useState<string>(soulState.alias || '');
  const [countryInput, setCountryInput] = useState<string>(
    soulState.country || ''
  );
  const [cityInput, setCityInput] = useState<string>(soulState.city || '');
  const [publicRecordToggle, setPublicRecordToggle] = useState<boolean>(
    Boolean(soulState.publicRecord)
  );
  const [identitySavedNotice, setIdentitySavedNotice] =
    useState<boolean>(false);

  // THE MARKED (Tattoo Documentary Registry) State
  const [markVerificationCode, setMarkVerificationCode] = useState<string>(
    () => soulState.markCode || `VM-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [markPhotoName, setMarkPhotoName] = useState<string>('');
  const [markVisibility, setMarkVisibility] = useState<
    'PRIVATE' | 'SOUL_ID_ONLY' | 'PUBLIC_PHOTO'
  >(soulState.markVisibility || 'SOUL_ID_ONLY');
  const [markFeedback, setMarkFeedback] = useState<string | null>(null);

  const db = loadValkhorDb();
  const resonanceLabel = soulState.resonance || 'IGNHUM';
  const statusLabel = soulState.maskClaimed ? 'RECONNECTED' : 'LOST SOUL';

  const earnedDesignations = new Set(
    soulState.designations && soulState.designations.length > 0
      ? soulState.designations
      : ['FIRST_CONTACT', ...(soulState.maskClaimed ? ['RECONNECTED' as const] : [])]
  );

  const unlockedItems = db.unlocks.filter((u) =>
    (soulState.unlockedIds || []).includes(u.id)
  );
  const boundArtifacts = soulState.boundArtifacts || [];
  const chronicleEntries =
    soulState.chronicle && soulState.chronicle.length > 0
      ? soulState.chronicle
      : [
          {
            id: 'init-contact',
            label: 'FIRST CONTACT // 2026',
            detail: `INITIALIZED TERMINAL LINK AS ${soulState.soulId}`,
            timestamp: soulState.firstContactAt || '2026-09-26 00:00 UTC',
          },
        ];

  // Render high-resolution 9:16 (1080x1920) Story Record on Canvas
  useEffect(() => {
    const canvas = storyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1080;
    const h = 1920;
    canvas.width = w;
    canvas.height = h;

    const drawCard = (maskImg?: HTMLImageElement) => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(237, 237, 234, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(237, 237, 234, 0.28)';
      ctx.lineWidth = 3;
      ctx.strokeRect(56, 56, w - 112, h - 112);

      ctx.strokeStyle = '#B99A53';
      ctx.lineWidth = 2;
      ctx.strokeRect(72, 72, w - 144, h - 144);

      ctx.fillStyle = '#D6BA72';
      ctx.font = 'bold 24px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('KHAOS // SOUL TERMINAL', 115, 145);

      ctx.fillStyle = 'rgba(237, 237, 234, 0.55)';
      ctx.font = '20px "JetBrains Mono", monospace';
      ctx.fillText('VALKHOR RECOVERY SYSTEM // SOUL RECORD', 115, 182);

      ctx.save();
      ctx.translate(w - 195, 92);
      ctx.scale(0.16, 0.16);
      ctx.fillStyle = '#D6BA72';
      const sigilPath = new Path2D(VENDEX_SVG_PATH);
      ctx.fill(sigilPath);
      ctx.restore();

      ctx.strokeStyle = 'rgba(237, 237, 234, 0.2)';
      ctx.beginPath();
      ctx.moveTo(115, 215);
      ctx.lineTo(w - 115, 215);
      ctx.stroke();

      const cx = w / 2;
      const cy = 635;
      const boxW = 640;
      const boxH = 680;
      const boxX = cx - boxW / 2;
      const boxY = cy - boxH / 2;

      if (maskImg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(boxX, boxY, boxW, boxH);
        ctx.clip();

        ctx.translate(cx, cy);
        ctx.rotate((-4.5 * Math.PI) / 180);
        ctx.scale(1.14, 1.14);
        ctx.filter = soulState.maskClaimed
          ? 'contrast(130%) brightness(102%) sepia(32%)'
          : 'grayscale(100%) contrast(140%) brightness(82%)';
        ctx.drawImage(maskImg, -boxW / 2, -boxH / 2, boxW, boxH);
        ctx.filter = 'none';
        ctx.restore();

        const radGrad = ctx.createRadialGradient(
          cx,
          cy,
          boxW * 0.2,
          cx,
          cy,
          boxW * 0.62
        );
        radGrad.addColorStop(0, 'rgba(5, 5, 5, 0)');
        radGrad.addColorStop(1, '#050505');
        ctx.fillStyle = radGrad;
        ctx.fillRect(boxX, boxY, boxW, boxH);
      }

      ctx.strokeStyle = 'rgba(214, 186, 114, 0.38)';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      for (let i = 0; i < 3200; i++) {
        const gx = Math.random() * w;
        const gy = Math.random() * h;
        ctx.fillStyle =
          Math.random() > 0.8
            ? 'rgba(214, 186, 114, 0.08)'
            : 'rgba(237, 237, 234, 0.04)';
        ctx.fillRect(gx, gy, 2, 2);
      }

      ctx.fillStyle = '#EDEDEA';
      ctx.font = 'bold 76px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(soulState.soulId, cx, 1075);

      ctx.fillStyle = '#D6BA72';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillText(
        `STATUS // ${statusLabel}${soulState.alias ? ` // ${soulState.alias}` : ''}`,
        cx,
        1130
      );

      ctx.textAlign = 'left';
      const rows = [
        [
          'ORIGIN',
          soulState.city || soulState.country
            ? `${soulState.city || ''} ${soulState.country || ''}`.trim()
            : 'EARTH',
        ],
        ['VALKHOR RESONANCE', resonanceLabel],
        ['KHAOS CONNECTION', `${soulState.khaosConnection}%`],
        [
          'DESIGNATIONS',
          Array.from(earnedDesignations).slice(0, 3).join(' • '),
        ],
        [
          'KNOWN ARTIFACTS',
          boundArtifacts.length > 0
            ? boundArtifacts.map((a) => a.archetype).join(' + ')
            : 'NONE BOUND',
        ],
        [
          'EXTERNAL CONTROL',
          `${String(soulState.externalControl).padStart(2, '0')}%`,
        ],
      ];

      let startY = 1215;
      rows.forEach(([label, val]) => {
        ctx.fillStyle = 'rgba(237, 237, 234, 0.06)';
        ctx.fillRect(115, startY - 38, w - 230, 56);
        ctx.strokeStyle = 'rgba(237, 237, 234, 0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(115, startY - 38, w - 230, 56);

        ctx.fillStyle = 'rgba(237, 237, 234, 0.6)';
        ctx.font = '22px "JetBrains Mono", monospace';
        ctx.fillText(`${label} //`, 140, startY - 2);

        ctx.textAlign = 'right';
        ctx.fillStyle =
          label === 'VALKHOR RESONANCE' || label === 'DESIGNATIONS'
            ? '#D6BA72'
            : '#EDEDEA';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillText(val, w - 140, startY - 2);
        ctx.textAlign = 'left';

        startY += 74;
      });

      const witnessedList = soulState.witnessedEvents || [];
      if (witnessedList.length > 0) {
        ctx.fillStyle = 'rgba(185, 154, 83, 0.16)';
        ctx.fillRect(115, startY - 32, w - 230, 56);
        ctx.strokeStyle = '#D6BA72';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(115, startY - 32, w - 230, 56);

        ctx.fillStyle = '#D6BA72';
        ctx.font = 'bold 21px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(witnessedList.slice(0, 2).join('  •  '), cx, startY + 3);
        ctx.textAlign = 'left';
      }

      const nowIso = new Date().toISOString().replace('T', ' // ').slice(0, 22);
      ctx.fillStyle = 'rgba(237, 237, 234, 0.45)';
      ctx.font = '18px "JetBrains Mono", monospace';
      ctx.fillText('COORDS // X:04.918 Y:88.002 Z:KHAOS', 115, 1745);
      ctx.fillText(`TIMESTAMP // ${nowIso}`, 115, 1780);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#D6BA72';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillText('VENDEX // VALKHOR RECOVERY SYSTEM', w - 115, 1780);
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => drawCard(img);
    img.onerror = () => drawCard();
    img.src = './assets/valkhor/mask_closeup.jpg';
  }, [soulState, resonanceLabel, statusLabel, boundArtifacts]);

  const handleExportPng = () => {
    soundEngine.playConnectionRestored();
    const canvas = storyCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `VALKHOR_${soulState.soulId}_RECORD.png`;
    link.href = dataUrl;
    link.click();

    setExportedNotice(true);
    window.setTimeout(() => setExportedNotice(false), 3000);
  };

  const handleSendMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    soundEngine.playVendexPulse();
    const code = `VK-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedMagicCode(code);
    setMagicTokenInput(code);
    setMagicLinkStep('SENT');
  };

  const handleVerifyMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicTokenInput.trim()) return;
    soundEngine.playConnectionRestored();
    setMagicLinkStep('LINKED');
    if (onApplySoulPatch) {
      onApplySoulPatch(
        {
          email: emailInput.trim(),
          authLinked: true,
        },
        'CONNECTION RESTORED // PERSISTENT LINK ESTABLISHED.'
      );
    }
  };

  const handleSaveIdentityMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    if (onApplySoulPatch) {
      onApplySoulPatch(
        {
          alias: aliasInput.trim().toUpperCase() || undefined,
          country: countryInput.trim().toUpperCase() || undefined,
          city: cityInput.trim().toUpperCase() || undefined,
          publicRecord: publicRecordToggle,
        },
        'SOUL RECORD UPDATED.'
      );
    }
    setIdentitySavedNotice(true);
    window.setTimeout(() => setIdentitySavedNotice(false), 2500);
  };

  const handleRegisterMark = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playConnectionRestored();
    const res = submitMarkVerification(
      soulState,
      markVerificationCode,
      markPhotoName || `MARK_${markVerificationCode}.JPG`,
      markVisibility
    );
    if (onApplySoulPatch) {
      onApplySoulPatch(
        res.updatedSoulPatch,
        'MARK VERIFICATION LOGGED // PENDING REVIEW.'
      );
    }
    setMarkFeedback(
      `MARK VERIFICATION [${res.request.verificationCode}] LOGGED AS PENDING REVIEW.`
    );
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.26em] text-[#D6BA72]">
            SOUL RECORD // PERSISTENT ARCHIVAL DOSSIER
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            {soulState.soulId}
          </h1>
          <div className="font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/50 mt-1">
            FIRST CONTACT // 2026 • ORIGIN // EARTH • STATUS // {statusLabel}
          </div>
        </div>

        <button
          onClick={handleExportPng}
          className="px-5 py-3 border-2 border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] font-mono text-xs tracking-[0.24em] uppercase font-bold transition-colors"
        >
          EXPORT RECORD (9:16 PNG)
        </button>
      </div>

      {/* Main Dossier + 9:16 Share Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Diegetic Soul Record & Persistent Identity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Core Classification Telemetry */}
          <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.24em] text-[#EDEDEA]/45">
                  VALKHOR RECOVERY SYSTEM
                </div>
                <h2 className="font-display text-3xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-1">
                  SOUL RECORD // TELEMETRY
                </h2>
              </div>
              <VendexSymbol size={34} color="#D6BA72" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono text-xs tracking-[0.18em]">
              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4">
                <div className="text-[#EDEDEA]/45 text-[10px] mb-1">
                  FIRST CONTACT //
                </div>
                <div className="text-[#EDEDEA] font-bold text-base">2026</div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4">
                <div className="text-[#EDEDEA]/45 text-[10px] mb-1">
                  VALKHOR RESONANCE //
                </div>
                <div className="text-[#D6BA72] font-bold text-base">
                  {resonanceLabel}
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4">
                <div className="text-[#EDEDEA]/45 text-[10px] mb-1">
                  KHAOS CONNECTION //
                </div>
                <div className="text-[#D6BA72] font-bold text-base">
                  {soulState.khaosConnection}%
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4">
                <div className="text-[#EDEDEA]/45 text-[10px] mb-1">MASK //</div>
                <div className="text-[#EDEDEA] font-bold text-base">
                  {soulState.maskClaimed ? 'SYNCHRONIZED' : 'OFFLINE'}
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4">
                <div className="text-[#EDEDEA]/45 text-[10px] mb-1">
                  INDIVIDUAL WILL //
                </div>
                <div className="text-[#EDEDEA] font-bold text-base">
                  {soulState.individualWill}%
                </div>
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4">
                <div className="text-[#EDEDEA]/45 text-[10px] mb-1">
                  EXTERNAL CONTROL //
                </div>
                <div className="text-[#EA1D25] font-bold text-base">
                  {String(soulState.externalControl).padStart(2, '0')}%
                </div>
              </div>
            </div>

            {/* DESIGNATIONS (Non-gamified qualitative identities) */}
            <div className="border border-[#B99A53]/40 bg-[#050505] p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.24em]">
                <span className="text-[#D6BA72] font-bold">
                  DESIGNATIONS // ARCHIVAL IDENTITIES
                </span>
                <span className="text-[#EDEDEA]/45">
                  {earnedDesignations.size} GRANTED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[10px] tracking-[0.18em]">
                {DESIGNATION_CATALOG.map((des) => {
                  const hasIt = earnedDesignations.has(des.id);
                  return (
                    <div
                      key={des.id}
                      title={des.conditionSummary}
                      className={`border p-2.5 space-y-0.5 ${
                        hasIt
                          ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72]'
                          : 'border-[#EDEDEA]/10 bg-[#080808] text-[#EDEDEA]/30'
                      }`}
                    >
                      <div className="font-bold">{des.id}</div>
                      <div className="text-[8px] truncate">
                        {hasIt ? des.classification : 'UNRECORDED'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CHRONOLOGICAL BIOGRAPHY (LIVING ARCHIVE) */}
            <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-3">
              <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.24em]">
                <span className="text-[#D6BA72]">
                  CHRONOLOGICAL BIOGRAPHY // LIVING TRACE
                </span>
                <span className="text-[#EDEDEA]/45">IMMUTABLE LOG</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 font-mono text-xs">
                {chronicleEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-[#EDEDEA]/10 bg-[#080808] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <div>
                      <div className="text-[#D6BA72] font-bold tracking-[0.2em]">
                        {entry.label}
                      </div>
                      <div className="text-[10px] tracking-[0.16em] text-[#EDEDEA]/70">
                        {entry.detail}
                      </div>
                    </div>
                    <span className="text-[10px] tracking-[0.16em] text-[#EDEDEA]/40 shrink-0">
                      {entry.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* KNOWN ARTIFACTS & WITNESS RECORDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-2.5 font-mono">
                <div className="flex items-center justify-between text-[10px] tracking-[0.22em]">
                  <span className="text-[#D6BA72]">KNOWN ARTIFACTS</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('ARTIFACT_STORAGE')}
                    className="text-[#EDEDEA]/55 hover:text-[#D6BA72] underline"
                  >
                    [BIND]
                  </button>
                </div>
                {boundArtifacts.length === 0 ? (
                  <div className="text-[11px] tracking-[0.16em] text-[#EDEDEA]/45">
                    NO PHYSICAL ARTIFACTS VERIFIED YET.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs tracking-[0.18em]">
                    {boundArtifacts.map((a) => {
                      const cardImg =
                        a.archetype === 'RUBY'
                          ? './assets/valkhor/card_ruby.jpg'
                          : a.archetype === 'SAPPHIRE'
                          ? './assets/valkhor/card_sapphire.jpg'
                          : a.archetype === 'EMERALD'
                          ? './assets/valkhor/card_emerald.jpg'
                          : null;
                      return (
                        <div
                          key={a.publicCode}
                          className="border border-[#D6BA72]/50 bg-[#B99A53]/10 p-2 flex items-center gap-2.5 text-[#D6BA72] font-bold"
                        >
                          {cardImg && (
                            <img
                              src={cardImg}
                              alt={a.name}
                              className="w-8 h-11 object-cover border border-[#D6BA72]/60 shrink-0"
                            />
                          )}
                          <div>
                            <div>{a.name}</div>
                            <div className="text-[10px] text-[#EDEDEA]/70 font-normal">
                              {a.publicCode} // {a.series}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-2.5 font-mono">
                <div className="flex items-center justify-between text-[10px] tracking-[0.22em]">
                  <span className="text-[#D6BA72]">WITNESS RECORDS</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('WITNESS')}
                    className="text-[#EDEDEA]/55 hover:text-[#D6BA72] underline"
                  >
                    [MANAGE]
                  </button>
                </div>
                {soulState.witnessedEvents &&
                soulState.witnessedEvents.length > 0 ? (
                  <div className="space-y-1.5 text-xs tracking-[0.18em]">
                    {soulState.witnessedEvents.map((stamp) => (
                      <div
                        key={stamp}
                        className="border border-[#D6BA72]/50 bg-[#B99A53]/10 px-2.5 py-1.5 text-[#D6BA72] font-bold"
                      >
                        {stamp}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] tracking-[0.16em] text-[#EDEDEA]/45">
                    NO PHYSICAL CONVERGENCES LOGGED YET.
                  </div>
                )}
              </div>
            </div>

            {/* UNLOCKED ARCHIVES */}
            {unlockedItems.length > 0 && (
              <div className="border border-[#EDEDEA]/15 bg-[#050505] p-4 space-y-2.5 font-mono">
                <div className="text-[10px] tracking-[0.22em] text-[#D6BA72]">
                  UNLOCKED ARCHIVES & TRANSMISSIONS ({unlockedItems.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {unlockedItems.map((u) => (
                    <div
                      key={u.id}
                      className="border border-[#D6BA72]/40 bg-[#080808] p-2.5 text-xs tracking-[0.16em]"
                    >
                      <div className="text-[#D6BA72] font-bold">{u.code}</div>
                      <div className="text-[#EDEDEA]/80 text-[11px] truncate">
                        {u.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DIEGETIC AUTHENTICATION (RESTORE CONNECTION // MAGIC LINK) & METADATA */}
          <div className="border border-[#EDEDEA]/15 bg-[#080808] p-6 space-y-6">
            <div className="border-b border-[#EDEDEA]/15 pb-3 font-mono">
              <div className="text-[10px] tracking-[0.24em] text-[#D6BA72]">
                CROSS-DEVICE PERSISTENCE // DIEGETIC AUTHENTICATION
              </div>
              <h3 className="font-display text-2xl font-bold tracking-[0.22em] text-[#EDEDEA] mt-0.5">
                RESTORE CONNECTION // LINK SIGNAL ADDRESS
              </h3>
            </div>

            {magicLinkStep === 'LINKED' ? (
              <div className="border border-[#D6BA72] bg-[#B99A53]/15 p-4 font-mono text-xs tracking-[0.2em] text-[#D6BA72] flex items-center justify-between">
                <span>
                  SIGNAL ADDRESS LINKED // {soulState.email || emailInput}
                </span>
                <span className="font-bold">[VERIFIED]</span>
              </div>
            ) : magicLinkStep === 'IDLE' ? (
              <form onSubmit={handleSendMagicLink} className="space-y-3 font-mono">
                <label className="block text-[10px] tracking-[0.22em] text-[#EDEDEA]/55">
                  ENTER SIGNAL ADDRESS (EMAIL FOR MAGIC LINK RECOVERY)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ENTER SIGNAL ADDRESS (SOUL@DOMAIN)"
                    className="flex-1 border border-[#EDEDEA]/25 focus:border-[#D6BA72] bg-[#050505] px-4 py-3 text-xs tracking-[0.2em] text-[#EDEDEA] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] text-xs tracking-[0.22em] font-bold uppercase"
                  >
                    RESTORE CONNECTION
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleVerifyMagicLink}
                className="border border-[#D6BA72]/60 bg-[#050505] p-4 space-y-3 font-mono"
              >
                <div className="text-[10px] tracking-[0.22em] text-[#D6BA72]">
                  TRANSMISSION DISPATCHED TO {emailInput} // INTERCEPT CODE:{' '}
                  <span className="font-bold">{generatedMagicCode}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={magicTokenInput}
                    onChange={(e) =>
                      setMagicTokenInput(e.target.value.toUpperCase())
                    }
                    placeholder="VK-XXXX"
                    className="flex-1 border border-[#EDEDEA]/25 bg-[#080808] px-4 py-2.5 text-xs tracking-[0.22em] text-[#EDEDEA]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] text-xs tracking-[0.22em] font-bold uppercase"
                  >
                    VERIFY CONNECTION
                  </button>
                </div>
              </form>
            )}

            {/* Optional Identity Fields */}
            <form
              onSubmit={handleSaveIdentityMetadata}
              className="pt-4 border-t border-[#EDEDEA]/15 space-y-4 font-mono"
            >
              <div className="text-[10px] tracking-[0.22em] text-[#EDEDEA]/50">
                OPTIONAL ARCHIVAL IDENTIFIERS (SOUL_ID IS ALWAYS PRIMARY)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-[#EDEDEA]/45 mb-1">
                    PUBLIC ALIAS (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value.toUpperCase())}
                    placeholder="NONE"
                    className="w-full border border-[#EDEDEA]/20 focus:border-[#D6BA72] bg-[#050505] px-3 py-2 text-xs tracking-[0.18em] text-[#EDEDEA] focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-[#EDEDEA]/45 mb-1">
                    COUNTRY (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={countryInput}
                    onChange={(e) =>
                      setCountryInput(e.target.value.toUpperCase())
                    }
                    placeholder="EARTH"
                    className="w-full border border-[#EDEDEA]/20 focus:border-[#D6BA72] bg-[#050505] px-3 py-2 text-xs tracking-[0.18em] text-[#EDEDEA] focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[9px] tracking-[0.2em] text-[#EDEDEA]/45 mb-1">
                    CITY (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value.toUpperCase())}
                    placeholder="SECTOR"
                    className="w-full border border-[#EDEDEA]/20 focus:border-[#D6BA72] bg-[#050505] px-3 py-2 text-xs tracking-[0.18em] text-[#EDEDEA] focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPublicRecordToggle((v) => !v)}
                  className={`px-4 py-2 border text-xs tracking-[0.2em] font-bold ${
                    publicRecordToggle
                      ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72]'
                      : 'border-[#EDEDEA]/20 bg-[#050505] text-[#EDEDEA]/60'
                  }`}
                >
                  PUBLIC RECORD // {publicRecordToggle ? 'ON' : 'OFF'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] text-xs tracking-[0.22em] font-bold uppercase transition-colors"
                >
                  UPDATE SOUL RECORD
                </button>
              </div>

              {identitySavedNotice && (
                <div className="text-[10px] tracking-[0.22em] text-[#D6BA72]">
                  &gt; SOUL RECORD PARAMETERS SAVED.
                </div>
              )}
            </form>
          </div>

          {/* THE MARKED (Voluntary Documentary Registry for Physical Vendex Tattoos) */}
          <div className="border border-[#B99A53]/40 bg-[#080808] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3">
              <div>
                <div className="font-mono text-[10px] tracking-[0.24em] text-[#D6BA72]">
                  THE MARKED // PERMANENT PHYSICAL INSCRIPTION REGISTRY
                </div>
                <h3 className="font-display text-2xl font-bold tracking-[0.22em] text-[#EDEDEA] mt-0.5">
                  REGISTER MARK (DOCUMENTARY ARCHIVE)
                </h3>
              </div>
              <span className="font-mono text-[10px] tracking-[0.2em] border border-[#D6BA72]/50 px-2.5 py-1 text-[#D6BA72]">
                STATUS // {soulState.markStatus || 'UNREGISTERED'}
              </span>
            </div>

            <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/70 leading-relaxed">
              VOLUNTARY DOCUMENTARY REGISTRY FOR LOST SOULS WHO ALREADY CARRY A
              PERMANENT VENDEX SIGIL INSCRIPTION ON SKIN. WRITE YOUR ASSIGNED
              MARK VERIFICATION CODE ON PAPER NEXT TO THE MARK AND UPLOAD
              PHOTOGRAPHIC PROOF.
            </p>

            <form onSubmit={handleRegisterMark} className="space-y-4 font-mono">
              <div className="border border-[#D6BA72]/50 bg-[#050505] p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.22em] text-[#EDEDEA]/50">
                    ASSIGNED MARK VERIFICATION CODE
                  </div>
                  <div className="text-xl font-bold tracking-[0.26em] text-[#D6BA72]">
                    {markVerificationCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setMarkVerificationCode(
                      `VM-${Math.floor(10000 + Math.random() * 90000)}`
                    )
                  }
                  className="px-3 py-1 border border-[#EDEDEA]/20 text-[10px] tracking-[0.2em] text-[#EDEDEA]/60 hover:text-[#D6BA72]"
                >
                  NEW CODE
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="border border-[#EDEDEA]/20 hover:border-[#D6BA72] bg-[#050505] p-3.5 cursor-pointer flex flex-col justify-between space-y-1">
                  <span className="text-[10px] tracking-[0.2em] text-[#D6BA72]">
                    UPLOAD PHOTO WITH {markVerificationCode}
                  </span>
                  <span className="text-xs tracking-[0.16em] text-[#EDEDEA]/65 truncate">
                    {markPhotoName || 'SELECT EVIDENCE IMAGE'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setMarkPhotoName(e.target.files?.[0]?.name || '')
                    }
                    className="hidden"
                  />
                </label>

                <div className="border border-[#EDEDEA]/20 bg-[#050505] p-3.5 space-y-1.5">
                  <div className="text-[10px] tracking-[0.2em] text-[#D6BA72]">
                    ARCHIVE VISIBILITY
                  </div>
                  <div className="flex gap-1.5">
                    {(
                      ['PRIVATE', 'SOUL_ID_ONLY', 'PUBLIC_PHOTO'] as const
                    ).map((vis) => (
                      <button
                        key={vis}
                        type="button"
                        onClick={() => setMarkVisibility(vis)}
                        className={`flex-1 py-1.5 border text-[9px] tracking-[0.14em] ${
                          markVisibility === vis
                            ? 'border-[#D6BA72] bg-[#B99A53]/25 text-[#D6BA72] font-bold'
                            : 'border-[#EDEDEA]/15 text-[#EDEDEA]/50'
                        }`}
                      >
                        {vis.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] font-display text-xl font-bold tracking-[0.26em] uppercase transition-colors"
              >
                REGISTER MARK FOR VERIFICATION
              </button>

              {markFeedback && (
                <div className="border border-[#D6BA72] bg-[#B99A53]/15 p-3 text-xs tracking-[0.18em] text-[#D6BA72]">
                  &gt; {markFeedback}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right 5 Cols: 9:16 Vertical Export Card Preview */}
        <div className="lg:col-span-5 border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col items-center space-y-4">
          <div className="w-full flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-[#EDEDEA]/50 border-b border-[#EDEDEA]/10 pb-2.5">
            <span>EXPORT SOUL ID // 9:16 FORMAT</span>
            <span className="text-[#D6BA72]">1080x1920</span>
          </div>

          <div className="w-full max-w-[270px] aspect-[9/16] border border-[#EDEDEA]/20 bg-[#050505] overflow-hidden shadow-2xl">
            <canvas
              ref={storyCanvasRef}
              className="w-full h-full block object-contain"
            />
          </div>

          {exportedNotice && (
            <div className="w-full border border-[#D6BA72] bg-[#B99A53]/20 p-2.5 text-center font-mono text-[10px] tracking-[0.22em] text-[#D6BA72]">
              RECORD EXPORTED TO LOCAL STORAGE DEVICE.
            </div>
          )}

          <button
            onClick={handleExportPng}
            className="w-full py-3.5 border border-[#D6BA72] bg-[#B99A53]/20 hover:bg-[#D6BA72] text-[#EDEDEA] hover:text-[#050505] font-display text-xl font-bold tracking-[0.26em] uppercase transition-colors"
          >
            EXPORT RECORD
          </button>

          <div className="w-full pt-3 border-t border-[#EDEDEA]/15 flex flex-wrap gap-2">
            {!soulState.resonance && (
              <button
                onClick={() => onNavigate('KHAOS_LINK')}
                className="flex-1 py-2.5 border border-[#EDEDEA]/25 hover:border-[#D6BA72] font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]"
              >
                CALIBRATE RESONANCE
              </button>
            )}
            {!soulState.maskClaimed && (
              <button
                onClick={() => onNavigate('MASK')}
                className="flex-1 py-2.5 border border-[#D6BA72] bg-[#B99A53]/15 font-mono text-[10px] tracking-[0.2em] text-[#D6BA72]"
              >
                CLAIM MASK CONDUIT
              </button>
            )}
            {soulState.maskClaimed && (
              <button
                onClick={onTriggerFinalCollapse}
                className="w-full py-2.5 border border-[#EA1D25] bg-[#B5161B]/20 hover:bg-[#EA1D25] font-mono text-[10px] tracking-[0.2em] text-[#EDEDEA]"
              >
                TRIGGER FINAL AWAKENING
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
