import React, { useState } from 'react';
import { SoulState } from '../types/soul';
import { soundEngine } from '../utils/soundEngine';
import { VendexSymbol } from './VendexSymbol';

interface RestrictedArchiveProps {
  soulState: SoulState;
  onUnlockVault: (vaultId: string) => void;
}

interface RestrictedVaultItem {
  id: string;
  code: string;
  title: string;
  eventOrigin: string;
  pinCode: string;
  type: string;
  classification: string;
  audioUrl?: string;
  visualAsset: string;
  secretContent: string[];
  vendexTransmission: string;
}

const RESTRICTED_VAULTS: RestrictedVaultItem[] = [
  {
    id: 'VAULT_0046',
    code: 'RESTRICTED // VAULT_01',
    title: 'UNRELEASED DUBPLATE // KHAOS RAW STEM_01',
    eventOrigin: 'OBTAINED AT PHYSICAL CONVERGENCE OR PROTOCOL 017',
    pinCode: '0046',
    type: 'CLASSIFIED AUDIO + BLUEPRINT',
    classification: 'CLEARANCE // PIN REQUIRED',
    audioUrl: '/assets/audio/transmission_031.mp3',
    visualAsset: '/assets/valkhor/vendex_legion.jpg',
    secretContent: [
      'RAW UNMASTERED FREQUENCY EXTRACTED DIRECTLY FROM VALKHOR ORB-01.',
      'THIS TRANSMISSION WAS DISTRIBUTED EXCLUSIVELY VIA PHYSICAL EVENT CIPHERS.',
      'HOST AUTHORIZED TO DOWNLOAD AND RETAIN SIGNAL TRACE.',
    ],
    vendexTransmission: 'YOU CARRIED THE CODE OUT OF THE DARK. THIS FREQUENCY IS YOURS.',
  },
  {
    id: 'VAULT_2026',
    code: 'RESTRICTED // VAULT_02',
    title: 'HERALD RITUAL ARCHITECTURE // STAGE DOSSIER',
    eventOrigin: 'EVENT PIN // LIVE CONVERGENCE 2026',
    pinCode: '2026',
    type: 'VISUAL TELEMETRY + AUDIO',
    classification: 'CLEARANCE // EVENT PIN',
    audioUrl: '/assets/audio/transmission_029.mp3',
    visualAsset: '/assets/valkhor/golden_mask_stage.png',
    secretContent: [
      'INTERNAL VISUAL TELEMETRY FROM THE ALTAR OF CONVERGENCE.',
      'CONTAINS ACOUSTIC CALIBRATION PARAMETERS FOR MASS AWAKENING.',
      'NEXT SECRET COORDINATES EMBEDDED IN SUB-BASS HARMONICS.',
    ],
    vendexTransmission: 'THOSE WHO STOOD BEFORE THE ALTAR ARE FOREVER LINKED.',
  },
  {
    id: 'VAULT_8400',
    code: 'RESTRICTED // VAULT_03',
    title: 'ROTTERDAM // MAASSILO CLASSIFIED INTERCEPT',
    eventOrigin: 'EVENT PIN // ANOMALY 084',
    pinCode: '8400',
    type: 'EVENT EXCLUSIVE TRANSMISSION',
    classification: 'CLEARANCE // EVENT PIN',
    audioUrl: '/assets/audio/transmission_024.mp3',
    visualAsset: '/assets/valkhor/lost_soul_circle.jpg',
    secretContent: [
      'RESTRICTED RECORDING CAPTURED INSIDE SECTOR_NL.',
      'PHYSICAL ATTENDANCE VERIFICATION COMPLETED.',
    ],
    vendexTransmission: 'THE MACHINE COULD NOT CONTAIN US.',
  },
];

export const RestrictedArchive: React.FC<RestrictedArchiveProps> = ({
  soulState,
  onUnlockVault,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    tone: 'neutral' | 'error' | 'success';
  }>({
    text: 'AWAITING 4-DIGIT EVENT PIN...',
    tone: 'neutral',
  });
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);

  const unlockedIds = soulState.unlockedVaultIds || [];

  const handleDigitPress = (digit: string) => {
    soundEngine.playClick(1100);
    if (pinInput.length < 6) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    soundEngine.playClick(700);
    setPinInput('');
    setStatusMsg({ text: 'INPUT CLEARED. ENTER EVENT PIN.', tone: 'neutral' });
  };

  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = pinInput.trim().toUpperCase();
    if (!clean) return;

    const matched = RESTRICTED_VAULTS.find(
      (v) => v.pinCode === clean || clean === 'VENDEX'
    );

    if (matched) {
      soundEngine.playConnectionRestored();
      onUnlockVault(matched.id);
      setSelectedVaultId(matched.id);
      setPinInput('');
      setStatusMsg({
        text: `ACCESS GRANTED // ${matched.code} DECRYPTED.`,
        tone: 'success',
      });
    } else {
      soundEngine.playAlarm();
      setStatusMsg({
        text: `ERROR: INVALID PIN [${clean}]. PIN CODES ARE DISTRIBUTED AT LIVE EVENTS.`,
        tone: 'error',
      });
    }
  };

  const activeVault =
    RESTRICTED_VAULTS.find((v) => v.id === selectedVaultId) ||
    RESTRICTED_VAULTS.find((v) => unlockedIds.includes(v.id)) ||
    null;

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="border border-[#EDEDEA]/15 bg-[#080808] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] tracking-[0.28em] text-[#EA1D25] flex items-center gap-2">
            <span className="w-2 h-2 bg-[#EA1D25] animate-pulse-alert" />
            <span>NODE 07 // LEVEL-9 ENCRYPTED VAULT</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-[0.24em] text-[#EDEDEA] mt-0.5">
            RESTRICTED ARCHIVE
          </h1>
        </div>

        <div className="font-mono text-[10px] tracking-[0.2em] border border-[#B99A53]/40 bg-[#050505] px-3.5 py-2 text-[#D6BA72]">
          DECRYPTED VAULTS // {unlockedIds.length} / {RESTRICTED_VAULTS.length}
        </div>
      </div>

      {/* Main Grid: Left Keypad & PIN Terminal | Right Vault Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Physical Event PIN Terminal */}
        <div className="lg:col-span-5 border border-[#EDEDEA]/20 bg-[#080808] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-[10px] tracking-[0.24em]">
              <span className="text-[#D6BA72]">EVENT CIPHER TERMINAL</span>
              <span className="text-[#EDEDEA]/45">PIN AUTHENTICATION</span>
            </div>

            <p className="font-mono text-xs tracking-[0.16em] text-[#EDEDEA]/75 leading-relaxed">
              EXCLUSIVE TRANSMISSIONS, UNRELEASED STEMS, AND CLASSIFIED
              ARTIFACTS ARE LOCKED BEHIND ENCRYPTED PIN CODES DISTRIBUTED
              PHYSICALLY AT VENDEX LIVE CONVERGENCES.
            </p>

            {/* PIN Readout Screen */}
            <form onSubmit={handleVerifyPin} className="space-y-3">
              <div className="border-2 border-[#EDEDEA]/25 focus-within:border-[#D6BA72] bg-[#050505] p-4 flex items-center justify-between">
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.toUpperCase())}
                  placeholder="ENTER PIN //"
                  maxLength={6}
                  className="bg-transparent font-display text-3xl sm:text-4xl font-bold tracking-[0.35em] text-[#D6BA72] focus:outline-none w-full placeholder:text-[#EDEDEA]/20"
                />
                <VendexSymbol size={24} color="#D6BA72" />
              </div>

              {/* Status Banner */}
              <div
                className={`border p-2.5 font-mono text-[10px] tracking-[0.2em] ${
                  statusMsg.tone === 'error'
                    ? 'border-[#EA1D25] bg-[#B5161B]/20 text-[#EA1D25]'
                    : statusMsg.tone === 'success'
                    ? 'border-[#D6BA72] bg-[#B99A53]/20 text-[#D6BA72]'
                    : 'border-[#EDEDEA]/15 bg-[#050505] text-[#EDEDEA]/60'
                }`}
              >
                {statusMsg.text}
              </div>

              {/* Tactical Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDigitPress(d)}
                    className="py-3 border border-[#EDEDEA]/15 hover:border-[#D6BA72] bg-[#050505] hover:bg-[#B99A53]/15 font-display text-2xl font-bold tracking-[0.2em] text-[#EDEDEA] hover:text-[#D6BA72] transition-colors"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-3 border border-[#EA1D25]/40 hover:border-[#EA1D25] bg-[#050505] font-mono text-[10px] tracking-[0.2em] text-[#EA1D25] uppercase"
                >
                  CLR
                </button>
                <button
                  type="button"
                  onClick={() => handleDigitPress('0')}
                  className="py-3 border border-[#EDEDEA]/15 hover:border-[#D6BA72] bg-[#050505] hover:bg-[#B99A53]/15 font-display text-2xl font-bold tracking-[0.2em] text-[#EDEDEA] hover:text-[#D6BA72] transition-colors"
                >
                  0
                </button>
                <button
                  type="submit"
                  className="py-3 border border-[#D6BA72] bg-[#D6BA72] text-[#050505] font-mono text-[10px] font-bold tracking-[0.2em] uppercase"
                >
                  UNLOCK
                </button>
              </div>
            </form>
          </div>

          {/* Subtle Clandestine Hint */}
          <div className="border border-[#B99A53]/35 bg-[#050505] p-3.5 font-mono text-[10px] tracking-[0.18em] text-[#EDEDEA]/60 space-y-1">
            <div className="text-[#D6BA72] font-bold">
              CLANDESTINE INTERCEPT //
            </div>
            <div>
              ATTEND LIVE KHAOS EVENTS TO OBTAIN VAULT PINS, OR COMPLETE{' '}
              <span className="text-[#EDEDEA]">PROTOCOL 017</span> TO RECOVER
              EMERGENCY CIPHER <span className="text-[#D6BA72]">[0046]</span>.
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Vault Directory & Decrypted Content */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          {/* Vault List */}
          <div className="grid grid-cols-1 gap-3.5">
            {RESTRICTED_VAULTS.map((vault) => {
              const isUnlocked = unlockedIds.includes(vault.id);
              const isSelected = activeVault?.id === vault.id;

              return (
                <div
                  key={vault.id}
                  onClick={() => {
                    if (isUnlocked) {
                      soundEngine.playClick();
                      setSelectedVaultId(vault.id);
                    } else {
                      soundEngine.playAlarm();
                    }
                  }}
                  className={`border p-4 flex items-center justify-between gap-4 transition-colors ${
                    isUnlocked
                      ? isSelected
                        ? 'border-[#D6BA72] bg-[#B99A53]/15 cursor-pointer'
                        : 'border-[#EDEDEA]/25 bg-[#080808] hover:border-[#D6BA72] cursor-pointer'
                      : 'border-[#EDEDEA]/15 bg-[#050505] opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em]">
                      <span
                        className={
                          isUnlocked ? 'text-[#D6BA72]' : 'text-[#EA1D25]'
                        }
                      >
                        {vault.code}
                      </span>
                      <span className="text-[#EDEDEA]/30">//</span>
                      <span className="text-[#EDEDEA]/55">
                        {vault.eventOrigin}
                      </span>
                    </div>
                    <div className="font-display text-2xl font-bold tracking-[0.2em] text-[#EDEDEA]">
                      {isUnlocked ? vault.title : '██████████ // ENCRYPTED VAULT'}
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[10px] tracking-[0.2em] px-2.5 py-1 border shrink-0 ${
                      isUnlocked
                        ? 'border-[#D6BA72] text-[#D6BA72] bg-[#B99A53]/20'
                        : 'border-[#EA1D25]/60 text-[#EA1D25] bg-[#B5161B]/15'
                    }`}
                  >
                    {isUnlocked ? 'UNLOCKED //' : 'LOCKED [PIN]'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Decrypted Vault Viewer */}
          {activeVault && unlockedIds.includes(activeVault.id) ? (
            <div className="border-2 border-[#D6BA72] bg-[#080808] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#EDEDEA]/15 pb-3 font-mono text-xs tracking-[0.22em]">
                <span className="text-[#D6BA72] font-bold">
                  DECRYPTED // {activeVault.code}
                </span>
                <span className="text-[#EDEDEA]/50">{activeVault.type}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-5 h-44 bg-[#050505] border border-[#EDEDEA]/20 overflow-hidden relative">
                  <img
                    src={activeVault.visualAsset}
                    alt={activeVault.title}
                    className="w-full h-full object-cover filter contrast-125"
                  />
                </div>

                <div className="sm:col-span-7 space-y-3">
                  <h3 className="font-display text-3xl font-bold tracking-[0.2em] text-[#EDEDEA]">
                    {activeVault.title}
                  </h3>
                  <div className="space-y-1.5 font-mono text-xs tracking-[0.15em] text-[#EDEDEA]/80">
                    {activeVault.secretContent.map((line, idx) => (
                      <p key={idx}>&gt; {line}</p>
                    ))}
                  </div>
                </div>
              </div>

              {activeVault.audioUrl && (
                <div className="border border-[#EDEDEA]/15 bg-[#050505] p-3.5 space-y-2">
                  <div className="font-mono text-[10px] tracking-[0.22em] text-[#D6BA72]">
                    EXCLUSIVE AUDIO INTERCEPT // STREAM READY
                  </div>
                  <audio
                    controls
                    src={activeVault.audioUrl}
                    className="w-full h-9 filter invert contrast-150"
                  />
                </div>
              )}

              <div className="border border-[#B99A53]/50 bg-[#050505] p-3.5 font-mono text-xs tracking-[0.2em] text-[#D6BA72]">
                VENDEX // &ldquo;{activeVault.vendexTransmission}&rdquo;
              </div>
            </div>
          ) : (
            <div className="border border-[#EDEDEA]/15 bg-[#050505] p-8 text-center space-y-3 my-auto">
              <div className="font-mono text-xs tracking-[0.28em] text-[#EA1D25]">
                VAULT ACCESS RESTRICTED
              </div>
              <p className="font-mono text-xs tracking-[0.18em] text-[#EDEDEA]/55 max-w-md mx-auto leading-relaxed">
                ENTER A VALID EVENT PIN CODE ON THE LEFT TERMINAL TO DECRYPT
                EXCLUSIVE VENDEX TRANSMISSIONS AND ARTIFACTS.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
