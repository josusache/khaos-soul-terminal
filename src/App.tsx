import React, { useEffect, useState } from 'react';
import { AdminControlPanel } from './components/AdminControlPanel';
import { Archive } from './components/Archive';
import { ArtifactStorage } from './components/ArtifactStorage';
import { CustomCursor } from './components/CustomCursor';
import { ExitSystem } from './components/ExitSystem';
import { KhaosEvents } from './components/KhaosEvents';
import { KhaosFrequencies } from './components/KhaosFrequencies';
import { KhaosLink } from './components/KhaosLink';
import { LoadingScreen } from './components/LoadingScreen';
import { LostSoulNetwork } from './components/LostSoulNetwork';
import { MaskSynchronization } from './components/MaskSynchronization';
import { Navigation } from './components/Navigation';
import {
  FinalCollapseModal,
  GlobalOverlays,
  VendexInterference,
} from './components/Overlays';
import { Protocols } from './components/Protocols';
import { RestrictedArchive } from './components/RestrictedArchive';
import { RunProtocol } from './components/RunProtocol';
import { SignalDecoder } from './components/SignalDecoder';
import { SoulProfile } from './components/SoulProfile';
import { SoulStatus } from './components/SoulStatus';
import { SystemDataPanel } from './components/SystemDataPanel';
import { SystemHeader } from './components/SystemHeader';
import { Transmissions } from './components/Transmissions';
import { ValkhorMap } from './components/ValkhorMap';
import { WitnessArchive } from './components/WitnessArchive';
import {
  addChronicleIfMissing,
  addDesignationIfMissing,
  formatUtcNow,
} from './services/valkhorBackend';
import { ResonanceWorld, SectionId, SoulState } from './types/soul';
import { soundEngine } from './utils/soundEngine';

const STORAGE_KEY = 'VALKHOR_SOUL_STATE_V1';

const createInitialSoulState = (): SoulState => ({
  soulId: 'SOUL_00478291',
  firstContactAt: formatUtcNow(),
  origin: 'EARTH',
  publicRecord: false,
  khaosConnection: 34,
  individualWill: 81,
  externalControl: 19,
  memoryOfValkhor: 3,
  maskSynchronization: 0,
  maskClaimed: false,
  resonance: null,
  vendexInterferenceLevel: 8,
  visitedSections: ['SOUL_STATUS'],
  protocolCompleted: false,
  completedProtocols: [],
  signalsDecoded: [],
  witnessedEvents: [],
  unlockedVaultIds: [],
  unlockedIds: [],
  designations: ['FIRST_CONTACT'],
  boundArtifacts: [],
  discoveries: [],
  triadUnlocked: false,
  markStatus: 'NONE',
  markVisibility: 'SOUL_ID_ONLY',
  chronicle: [
    {
      id: 'init-contact',
      label: `FIRST CONTACT // ${new Date().getFullYear()}`,
      detail: 'ESTABLISHED INITIAL TERMINAL CONNECTION WITH VALKHOR',
      timestamp: formatUtcNow(),
    },
  ],
});

export const App: React.FC = () => {
  const [soulState, setSoulState] = useState<SoulState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SoulState;
        return {
          ...createInitialSoulState(),
          ...parsed,
        };
      }
    } catch {
      // Ignore storage read errors
    }
    return createInitialSoulState();
  });

  const [isReturningUser] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;
      const parsed = JSON.parse(saved) as SoulState;
      return parsed.visitedSections.length > 1 || Boolean(parsed.resonance);
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // Skip boot loader if opening /control directly
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/control' ||
        window.location.hash.includes('control'))
    ) {
      return false;
    }
    return true;
  });

  const [activeSection, setActiveSection] = useState<SectionId>(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/control' ||
        window.location.hash.includes('control'))
    ) {
      return 'CONTROL_PANEL';
    }
    return 'SOUL_STATUS';
  });

  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [runProtocolActive, setRunProtocolActive] = useState<boolean>(false);
  const [finalCollapseOpen, setFinalCollapseOpen] = useState<boolean>(false);
  const [whiteFlash, setWhiteFlash] = useState<boolean>(false);
  const [systemToast, setSystemToast] = useState<string | null>(null);

  // Activate interface audio engine by default on mount
  useEffect(() => {
    soundEngine.enable();
  }, []);

  // Persist SoulState to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(soulState));
    } catch {
      // Ignore storage write errors
    }
  }, [soulState]);

  const showSystemToast = (msg: string) => {
    setSystemToast(msg);
    window.setTimeout(() => {
      setSystemToast((curr) => (curr === msg ? null : curr));
    }, 3600);
  };

  const handleApplySoulPatch = (patch: Partial<SoulState>, toast?: string) => {
    setSoulState((prev) => ({
      ...prev,
      ...patch,
    }));
    if (toast) {
      showSystemToast(toast);
    }
  };

  const triggerMicroFlash = () => {
    setWhiteFlash(true);
    window.setTimeout(() => setWhiteFlash(false), 110);
  };

  const handleSelectSection = (section: SectionId) => {
    setActiveSection(section);

    setSoulState((prev) => {
      const alreadyVisited = prev.visitedSections.includes(section);
      const nextVisited = alreadyVisited
        ? prev.visitedSections
        : [...prev.visitedSections, section];

      let nextInterference = prev.vendexInterferenceLevel;
      if (!alreadyVisited) {
        nextInterference = Math.min(100, nextInterference + 5);
      }
      if (section === 'ARCHIVE' && nextInterference < 40) {
        nextInterference = 40;
      }

      return {
        ...prev,
        visitedSections: nextVisited,
        vendexInterferenceLevel: nextInterference,
        memoryOfValkhor:
          section === 'ARCHIVE' || section === 'VALKHOR'
            ? Math.min(100, prev.memoryOfValkhor + 9)
            : prev.memoryOfValkhor,
      };
    });
  };

  const handleCompleteResonance = (world: ResonanceWorld) => {
    triggerMicroFlash();
    const year = new Date().getFullYear();
    setSoulState((prev) => ({
      ...prev,
      resonance: world,
      khaosConnection: Math.max(prev.khaosConnection, 64),
      individualWill: Math.max(prev.individualWill, 87),
      externalControl: Math.min(prev.externalControl, 13),
      memoryOfValkhor: Math.max(prev.memoryOfValkhor, 38),
      vendexInterferenceLevel: Math.max(prev.vendexInterferenceLevel, 25),
      chronicle: addChronicleIfMissing(
        prev.chronicle,
        'resonance-calibrated',
        `RESONANCE: ${world} // ${year}`,
        `ALIGNED SOUL FREQUENCY WITH ${world} ARCHETYPE`
      ),
    }));
    showSystemToast('SOUL RECORD UPDATED.');
  };

  const handleUpdateMaskProgress = (progress: number) => {
    setSoulState((prev) => ({
      ...prev,
      maskSynchronization: Math.max(prev.maskSynchronization, progress),
    }));
  };

  const handleClaimMask = () => {
    triggerMicroFlash();
    const year = new Date().getFullYear();
    setSoulState((prev) => ({
      ...prev,
      maskSynchronization: 100,
      maskClaimed: true,
      khaosConnection: Math.max(prev.khaosConnection, 88),
      individualWill: Math.max(prev.individualWill, 94),
      externalControl: Math.min(prev.externalControl, 6),
      memoryOfValkhor: Math.max(prev.memoryOfValkhor, 76),
      vendexInterferenceLevel: Math.max(prev.vendexInterferenceLevel, 70),
      designations: addDesignationIfMissing(prev.designations, 'RECONNECTED'),
      chronicle: addChronicleIfMissing(
        prev.chronicle,
        'mask-synchronized',
        `MASK SYNCHRONIZED // ${year}`,
        'CLAIMED MASK CONDUIT — DESIGNATION GRANTED: RECONNECTED'
      ),
    }));
    showSystemToast('CONNECTION RESTORED // MASK SYNCHRONIZED.');
  };

  const handleReadArchiveDoc = (docId: string) => {
    if (docId === '0046') {
      setSoulState((prev) => ({
        ...prev,
        vendexInterferenceLevel: Math.max(prev.vendexInterferenceLevel, 55),
        memoryOfValkhor: Math.min(100, prev.memoryOfValkhor + 12),
        designations: addDesignationIfMissing(prev.designations, 'ARCHIVIST'),
      }));
    }
  };

  const handleTriggerFinalCollapse = () => {
    setSoulState((prev) => ({
      ...prev,
      vendexInterferenceLevel: 100,
      khaosConnection: 98,
      individualWill: 99,
      externalControl: 1,
      memoryOfValkhor: 96,
      protocolCompleted: true,
    }));
    setFinalCollapseOpen(true);
  };

  const handleToggleAudio = () => {
    const next = soundEngine.toggle();
    setAudioEnabled(next);
  };

  return (
    <div className="min-h-screen h-screen w-screen bg-[#050505] text-[#EDEDEA] flex flex-col overflow-hidden relative industrial-grid">
      {/* Custom Targeting Reticle Cursor */}
      <CustomCursor />

      {/* Global CRT, Noise, Glitch & Alarm Overlays */}
      <GlobalOverlays
        interferenceLevel={soulState.vendexInterferenceLevel}
        alarmActive={soulState.vendexInterferenceLevel >= 95}
        whiteFlash={whiteFlash}
      />

      {/* Diegetic Persistent Toast Notification */}
      {systemToast && (
        <div className="fixed bottom-5 right-5 z-50 border-2 border-[#D6BA72] bg-[#050505]/95 px-5 py-3 shadow-2xl font-mono text-xs tracking-[0.24em] text-[#D6BA72] font-bold flex items-center gap-3 animate-flicker pointer-events-none">
          <span className="w-2 h-2 bg-[#D6BA72] animate-pulse" />
          <span>{systemToast}</span>
        </div>
      )}

      {/* Initial / Returning Loading Screen */}
      {isLoading && (
        <LoadingScreen
          soulId={soulState.soulId}
          isReturningUser={isReturningUser}
          onComplete={() => {
            triggerMicroFlash();
            setIsLoading(false);
          }}
          onResetState={() => {
            const fresh = createInitialSoulState();
            setSoulState(fresh);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
          }}
        />
      )}

      {/* Automated 30-Second Video Demo Mode */}
      <RunProtocol
        isActive={runProtocolActive}
        soulState={soulState}
        onAbort={() => setRunProtocolActive(false)}
        onNavigate={(s) => setActiveSection(s)}
        onApplyDemoState={(partial) =>
          setSoulState((prev) => ({ ...prev, ...partial }))
        }
      />

      {/* Final Experience Awakening / Collapse Sequence */}
      <FinalCollapseModal
        isOpen={finalCollapseOpen}
        onClose={() => setFinalCollapseOpen(false)}
      />

      {/* Exit System Fullscreen Modal */}
      {activeSection === 'EXIT_SYSTEM' && (
        <ExitSystem onReturn={() => setActiveSection('SOUL_STATUS')} />
      )}

      {/* Top Global System Header */}
      <SystemHeader
        soulState={soulState}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
        onStartProtocol={() => setRunProtocolActive(true)}
        onOpenProfile={() => handleSelectSection('SOUL_PROFILE')}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
      />

      {/* Main Three-Column System Shell */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Column 1: Left Vertical Navigation */}
        <Navigation
          activeSection={activeSection}
          soulState={soulState}
          onSelectSection={handleSelectSection}
          onStartProtocol={() => setRunProtocolActive(true)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Column 2: Main Terminal Workspace */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 industrial-subgrid">
          {/* Global Vendex Interference Intercept Bar */}
          <VendexInterference
            interferenceLevel={soulState.vendexInterferenceLevel}
            sectionKey={activeSection}
          />

          {/* Active Section View */}
          {activeSection === 'SOUL_STATUS' && (
            <SoulStatus
              soulState={soulState}
              onNavigate={handleSelectSection}
            />
          )}

          {activeSection === 'KHAOS_LINK' && (
            <KhaosLink
              soulState={soulState}
              onCompleteResonance={handleCompleteResonance}
              onNavigate={handleSelectSection}
            />
          )}

          {activeSection === 'VALKHOR' && <ValkhorMap soulState={soulState} />}

          {activeSection === 'MASK' && (
            <MaskSynchronization
              soulState={soulState}
              onUpdateProgress={handleUpdateMaskProgress}
              onClaimMask={handleClaimMask}
              onNavigate={handleSelectSection}
              onTriggerFinalCollapse={handleTriggerFinalCollapse}
            />
          )}

          {activeSection === 'SIGNAL_DECODER' && (
            <SignalDecoder
              soulState={soulState}
              onApplySoulPatch={handleApplySoulPatch}
              onNavigate={handleSelectSection}
            />
          )}

          {activeSection === 'LOST_SOULS' && (
            <LostSoulNetwork soulState={soulState} />
          )}

          {activeSection === 'ARCHIVE' && (
            <Archive onReadDocument={handleReadArchiveDoc} />
          )}

          {activeSection === 'RESTRICTED_ARCHIVE' && (
            <RestrictedArchive
              soulState={soulState}
              onUnlockVault={(vaultId) => {
                setSoulState((prev) => {
                  const current = prev.unlockedVaultIds || [];
                  if (current.includes(vaultId)) return prev;
                  return {
                    ...prev,
                    unlockedVaultIds: [...current, vaultId],
                    designations: addDesignationIfMissing(
                      prev.designations,
                      'ARCHIVIST'
                    ),
                    memoryOfValkhor: Math.min(100, prev.memoryOfValkhor + 14),
                    khaosConnection: Math.min(99, prev.khaosConnection + 8),
                  };
                });
                showSystemToast('RESTRICTED ARCHIVE DECLASSIFIED.');
              }}
            />
          )}

          {activeSection === 'PROTOCOLS' && (
            <Protocols
              soulState={soulState}
              onApplySoulPatch={handleApplySoulPatch}
              onCompleteProtocol={(protId) =>
                setSoulState((prev) => {
                  const current = prev.completedProtocols || [];
                  if (current.includes(protId)) return prev;
                  return {
                    ...prev,
                    completedProtocols: [...current, protId],
                    khaosConnection: Math.min(99, prev.khaosConnection + 10),
                    individualWill: Math.min(99, prev.individualWill + 6),
                    externalControl: Math.max(1, prev.externalControl - 5),
                  };
                })
              }
            />
          )}

          {activeSection === 'KHAOS_FREQUENCIES' && (
            <KhaosFrequencies soulId={soulState.soulId} />
          )}

          {activeSection === 'TRANSMISSIONS' && (
            <Transmissions
              onAudioActivated={() => setAudioEnabled(soundEngine.isEnabled())}
            />
          )}

          {activeSection === 'KHAOS_EVENTS' && (
            <KhaosEvents soulState={soulState} />
          )}

          {activeSection === 'WITNESS' && (
            <WitnessArchive
              soulState={soulState}
              onNavigate={handleSelectSection}
              onToggleWitness={(stamp) => {
                setSoulState((prev) => {
                  const current = prev.witnessedEvents || [];
                  const exists = current.includes(stamp);
                  const next = exists
                    ? current.filter((s) => s !== stamp)
                    : [...current, stamp];
                  return {
                    ...prev,
                    witnessedEvents: next,
                    designations: exists
                      ? prev.designations
                      : addDesignationIfMissing(prev.designations, 'WITNESS'),
                    chronicle: exists
                      ? prev.chronicle
                      : addChronicleIfMissing(
                          prev.chronicle,
                          `wit-${stamp}`,
                          stamp,
                          'PHYSICAL CONVERGENCE ATTENDANCE LOGGED'
                        ),
                    memoryOfValkhor: exists
                      ? prev.memoryOfValkhor
                      : Math.min(100, prev.memoryOfValkhor + 12),
                  };
                });
                showSystemToast('PRESENCE REGISTERED.');
              }}
            />
          )}

          {activeSection === 'ARTIFACT_STORAGE' && (
            <ArtifactStorage
              soulState={soulState}
              onApplySoulPatch={handleApplySoulPatch}
            />
          )}

          {activeSection === 'SOUL_PROFILE' && (
            <SoulProfile
              soulState={soulState}
              onNavigate={handleSelectSection}
              onTriggerFinalCollapse={handleTriggerFinalCollapse}
              onApplySoulPatch={handleApplySoulPatch}
            />
          )}

          {activeSection === 'CONTROL_PANEL' && (
            <AdminControlPanel
              soulState={soulState}
              onApplySoulPatch={handleApplySoulPatch}
              onExitControl={() => handleSelectSection('SOUL_STATUS')}
            />
          )}
        </main>

        {/* Column 3: Right Contextual System Data Panel */}
        <SystemDataPanel
          soulState={soulState}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          onTriggerFinalCollapse={handleTriggerFinalCollapse}
        />
      </div>
    </div>
  );
};
export default App;
