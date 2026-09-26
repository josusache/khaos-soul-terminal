export type ResonanceWorld = 'IGNHUM' | 'DESERT' | 'ICE' | 'MECHANICAL';

export type DesignationId =
  | 'FIRST_CONTACT'
  | 'RECONNECTED'
  | 'DECODER'
  | 'WITNESS'
  | 'KEEPER'
  | 'ARCHIVIST'
  | 'FIRST_WITNESS'
  | 'MARKED'
  | 'TRIAD_HOLDER'
  | 'DISCOVERER';

export interface SoulChronicleEntry {
  id: string;
  label: string; // e.g. "FIRST CONTACT // 2026", "TRIAD COMPLETED // 2026"
  detail: string;
  timestamp: string;
}

export interface BoundArtifactSummary {
  publicCode: string; // e.g. VX-RUBY-0047 or GEN00-RUBY
  name: string; // VENDEX // RUBY
  archetype: 'RUBY' | 'SAPPHIRE' | 'EMERALD' | 'OBSIDIAN' | 'OTHER';
  series: string;
  generation: string; // GENERATION // 00 or SERIES // 001
  serialNumber: string;
  verifiedAt: string;
}

export type SoulState = {
  soulId: string;
  email?: string;
  authLinked?: boolean;
  firstContactAt?: string;
  origin?: string;
  alias?: string;
  country?: string;
  city?: string;
  publicRecord?: boolean; // OFF by default
  khaosConnection: number;
  individualWill: number;
  externalControl: number;
  memoryOfValkhor: number;
  maskSynchronization: number;
  maskClaimed: boolean;
  resonance: ResonanceWorld | null;
  vendexInterferenceLevel: number;
  visitedSections: string[];
  protocolCompleted: boolean;
  completedProtocols?: string[];
  signalsDecoded?: string[];
  witnessedEvents?: string[];
  unlockedVaultIds?: string[];
  unlockedIds?: string[];
  designations?: DesignationId[];
  boundArtifacts?: BoundArtifactSummary[];
  discoveries?: string[];
  triadUnlocked?: boolean;
  markStatus?: 'NONE' | 'PENDING REVIEW' | 'VERIFIED' | 'REJECTED';
  markVisibility?: 'PRIVATE' | 'SOUL_ID_ONLY' | 'PUBLIC_PHOTO';
  markCode?: string;
  chronicle?: SoulChronicleEntry[];
};

export type SectionId =
  | 'SOUL_STATUS'
  | 'KHAOS_LINK'
  | 'VALKHOR'
  | 'MASK'
  | 'SIGNAL_DECODER'
  | 'PROTOCOLS'
  | 'ARTIFACT_STORAGE'
  | 'ARCHIVE'
  | 'RESTRICTED_ARCHIVE'
  | 'KHAOS_FREQUENCIES'
  | 'TRANSMISSIONS'
  | 'KHAOS_EVENTS'
  | 'WITNESS'
  | 'LOST_SOULS'
  | 'SOUL_PROFILE'
  | 'CONTROL_PANEL'
  | 'EXIT_SYSTEM';

export interface ResonanceOption {
  label: string;
  subcode: string;
  weights: Record<ResonanceWorld, number>;
  vendexWhisper?: string;
}

export interface ResonanceQuestionData {
  id: number;
  code: string;
  left: ResonanceOption;
  right: ResonanceOption;
}

export interface WorldProfile {
  id: ResonanceWorld;
  name: string;
  primaryForce: string;
  metrics: { label: string; value: string }[];
  quote: string[];
  accentColor: string;
  secondaryColor: string;
  frequency: string;
  coordinates: string;
  description: string[];
}

export interface LostSoulRecord {
  id: string;
  origin: 'EARTH' | 'NEW GEA' | 'LOCATION // UNKNOWN' | 'SECTOR_09';
  signal: number;
  lastKnownThought: string;
  controlExposure: number;
  selfRecognition: number;
  status: 'LOST' | 'AWAKE' | 'FRAGMENTED' | 'INTERCEPTED';
  maskStatus: 'UNASSIGNED' | 'MASK ACCEPTED' | 'REJECTED' | 'SYNCHRONIZING';
  resonance: ResonanceWorld | 'UNRESOLVED';
  scanSeed: number;
  coordinates: string;
}

export interface ArchiveDocument {
  id: string;
  code: string;
  title: string;
  clearance: 'GRANTED' | 'DENIED' | 'CORRUPTED' | 'VENDEX_OVERRIDE';
  corruptionPercentage?: number;
  metadata: { label: string; value: string }[];
  fragments: string[];
  vendexNote?: string;
  isSpecialSuperposition?: boolean;
  visualAsset?: string;
}

export interface TransmissionItem {
  id: string;
  code: string;
  title: string;
  source: string;
  entity: string;
  type: string;
  bpm: number;
  status: 'DECODED' | 'INTERCEPTED' | 'ACTIVE SIGNAL';
  duration: string;
  date: string;
  coverAsset: string;
  audioUrl: string;
  waveformSeed: number;
  subLabel: string;
}

export interface KhaosEventItem {
  id: string;
  code: string;
  location: string;
  country: string;
  earthDate: string;
  signalStrength: 'EXTREME' | 'CRITICAL' | 'HIGH' | 'UNSTABLE';
  expectedLostSouls: string;
  coordinates: string;
  venueCode: string;
  status: 'ANOMALY DETECTED' | 'CONVERGENCE IMMINENT' | 'ACTIVE';
}

export interface SystemLogEntry {
  id: string;
  timestamp: string;
  source: 'SYSTEM' | 'VENDEX' | 'KERNEL' | 'ALERT';
  text: string;
  corruptedReplacement?: string;
}

// ============================================================================
// LOST SOUL NETWORK — PERSISTENT ECOSYSTEM TYPES
// ============================================================================

export type UnlockContentType =
  | 'ARCHIVE'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'TEXT'
  | 'TRANSMISSION'
  | 'SECRET_PAGE'
  | 'PROTOCOL'
  | 'DOWNLOAD'
  | 'DIGITAL_ARTIFACT'
  | 'CUSTOM_EXPERIENCE';

export interface UnlockItem {
  id: string; // e.g. ARCHIVE_0091, THE_TRIAD, TRANSMISSION_041
  code: string;
  title: string;
  type: UnlockContentType;
  ruleType:
    | 'PROTOCOL_COMPLETED'
    | 'SIGNAL_DECODED'
    | 'ARTIFACT_COMBINATION'
    | 'WITNESS_CLAIMED'
    | 'DISCOVERY';
  ruleCondition: string;
  description: string[];
  mediaUrl?: string;
  audioUrl?: string;
  vendexNote?: string;
}

export interface ProtocolDatabaseItem {
  id: string; // e.g. PROTOCOL_0047
  code: string; // PROTOCOL // 0047
  title: string;
  source: string;
  status: 'ACTIVE' | 'SOLVED' | 'CLASSIFIED' | 'ARCHIVED' | 'UNDISCOVERED';
  cipherDisplay: string;
  prompt: string;
  instructions: string[];
  solutionHash: string; // Salted SHA-256 hex digest
  maxAttempts: number;
  firstWitnessLimit: number;
  unlockId?: string;
  opensAt: string;
  closesAt?: string;
  firstWitnesses: {
    position: number;
    soulId: string;
    solvedAt: string;
  }[];
}

export interface CollectiveFragmentItem {
  key: 'FRAGMENT A' | 'FRAGMENT B' | 'FRAGMENT C' | 'FRAGMENT D';
  sourceHint: string;
  solutionHash: string;
  found: boolean;
  foundBySoulId?: string;
  foundAt?: string;
}

export interface CollectiveProtocolItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  fragments: CollectiveFragmentItem[];
  unlockId?: string;
  participants: string[];
}

export interface SignalDefinition {
  id: string;
  codeHash: string; // Salted SHA-256 hex digest of signal code
  maskedLabel: string;
  source: string;
  origin: string;
  actionType:
    | 'UNLOCK_ARCHIVE'
    | 'UNLOCK_PROTOCOL'
    | 'REGISTER_DISCOVERY'
    | 'ACTIVATE_TRANSMISSION'
    | 'REGISTER_WITNESS';
  unlockId?: string;
  targetProtocolId?: string;
  witnessStamp?: string;
  witnessCity?: string;
  witnessDate?: string;
  activeFrom: string;
  activeUntil?: string;
  priorDiscoverersCount: number;
  discoveredBy: { soulId: string; discoveredAt: string }[];
}

export interface PhysicalArtifactRecord {
  publicCode: string; // e.g. VX-RUBY-0047
  privateKeyHash: string; // Salted SHA-256 hex digest
  name: string; // VENDEX // RUBY
  archetype: 'RUBY' | 'SAPPHIRE' | 'EMERALD' | 'OBSIDIAN' | 'OTHER';
  series: string;
  generation: string;
  serialNumber: string;
  rarityType: 'GEN_00' | 'RELIC' | 'RARE' | 'ONE_OF_ONE';
  status: 'UNCLAIMED' | 'VERIFIED' | 'RELEASED' | 'INVALIDATED';
  currentOwnerSoulId: string | null;
  history: {
    year: number;
    soulId: string;
    event: 'BOUND' | 'RELEASED' | 'CLAIMED' | 'LEGACY_VERIFIED';
    timestamp: string;
  }[];
}

export interface LegacyArtifactRequest {
  id: string;
  soulId: string;
  artifactName: 'VENDEX // RUBY' | 'VENDEX // SAPPHIRE' | 'VENDEX // EMERALD';
  archetype: 'RUBY' | 'SAPPHIRE' | 'EMERALD';
  generation: string;
  verificationToken: string; // e.g. LS-48192
  photoFrontName: string;
  photoBackName: string;
  photoTokenName: string;
  status: 'PENDING REVIEW' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
}

export interface MarkVerificationRequest {
  id: string;
  soulId: string;
  verificationCode: string; // e.g. VM-82914
  photoName: string;
  visibility: 'PRIVATE' | 'SOUL_ID_ONLY' | 'PUBLIC_PHOTO';
  status: 'PENDING REVIEW' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
}

export type TheRecordCategory =
  | 'FIRST WITNESSES'
  | 'DISCOVERIES'
  | 'ARTIFACT KEEPERS'
  | 'DECODERS'
  | 'THE MARKED'
  | 'EVENT WITNESSES'
  | 'SPECIAL RECORDS';

export interface HistoricalRecordEntry {
  id: string;
  category: TheRecordCategory;
  soulId: string;
  alias?: string;
  headline: string; // e.g. FIRST DETECTION // PROTOCOL 001
  details: string[];
  timestampUtc: string;
}
