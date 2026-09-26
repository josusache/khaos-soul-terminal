import {
  BoundArtifactSummary,
  CollectiveProtocolItem,
  DesignationId,
  HistoricalRecordEntry,
  LegacyArtifactRequest,
  MarkVerificationRequest,
  PhysicalArtifactRecord,
  ProtocolDatabaseItem,
  SignalDefinition,
  SoulChronicleEntry,
  SoulState,
  TheRecordCategory,
  UnlockItem,
} from '../types/soul';

const DB_STORAGE_KEY = 'VALKHOR_NETWORK_DB_V1';
const KERNEL_SALT = 'VALKHOR_KERNEL_SALT_v1::';

// Rate limiting memory map: actionKey -> timestamps[]
const rateLimitBuckets: Record<string, number[]> = {};

export interface ValkhorDatabaseState {
  protocols: ProtocolDatabaseItem[];
  collectiveProtocols: CollectiveProtocolItem[];
  signals: SignalDefinition[];
  unlocks: UnlockItem[];
  artifacts: PhysicalArtifactRecord[];
  legacyRequests: LegacyArtifactRequest[];
  markRequests: MarkVerificationRequest[];
  historicalRecords: HistoricalRecordEntry[];
  attemptCounts: Record<string, number>; // key: `${soulId}:${protocolId}`
  auditLogs: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    detail: string;
  }[];
}

export const DESIGNATION_CATALOG: {
  id: DesignationId;
  label: string;
  classification: string;
  conditionSummary: string;
}[] = [
  {
    id: 'FIRST_CONTACT',
    label: 'FIRST CONTACT',
    classification: 'INITIALIZATION TRACE',
    conditionSummary: 'ESTABLISHED LINK WITH KHAOS // SOUL TERMINAL',
  },
  {
    id: 'RECONNECTED',
    label: 'RECONNECTED',
    classification: 'CONDUIT SYNCHRONIZATION',
    conditionSummary: 'MASK CONDUIT CLAIMED AND SYNCHRONIZED',
  },
  {
    id: 'DECODER',
    label: 'DECODER',
    classification: 'CRYPTOGRAPHIC OPERATIVE',
    conditionSummary: 'RESOLVED ENCRYPTED PROTOCOLS OR EXTERNAL SIGNALS',
  },
  {
    id: 'WITNESS',
    label: 'WITNESS',
    classification: 'PHYSICAL CONVERGENCE',
    conditionSummary: 'VERIFIED PRESENCE AT LIVE VENDEX CONVERGENCE',
  },
  {
    id: 'KEEPER',
    label: 'KEEPER',
    classification: 'PHYSICAL ARTIFACT CUSTODIAN',
    conditionSummary: 'AUTHENTICATED PHYSICAL RELIC IN ARTIFACT REGISTRY',
  },
  {
    id: 'ARCHIVIST',
    label: 'ARCHIVIST',
    classification: 'DEEP MEMORY CUSTODIAN',
    conditionSummary: 'DECLASSIFIED RESTRICTED VALKHOR ARCHIVES',
  },
  {
    id: 'FIRST_WITNESS',
    label: 'FIRST WITNESS',
    classification: 'PRIMARY INTERCEPTOR',
    conditionSummary: 'AMONG THE FIRST SOULS TO SOLVE AN ACTIVE PROTOCOL',
  },
  {
    id: 'MARKED',
    label: 'MARKED',
    classification: 'PERMANENT INSCRIPTION',
    conditionSummary: 'VERIFIED PHYSICAL VENDEX SIGIL INSCRIPTION ON SKIN',
  },
  {
    id: 'TRIAD_HOLDER',
    label: 'TRIAD HOLDER',
    classification: 'CONVERGENCE CUSTODIAN',
    conditionSummary: 'UNITED RUBY + SAPPHIRE + EMERALD ARTIFACTS',
  },
  {
    id: 'DISCOVERER',
    label: 'DISCOVERER',
    classification: 'ANOMALY DETECTOR',
    conditionSummary: 'LOCATED UNDISCOVERED NODE OR COLLECTIVE FRAGMENT',
  },
];

// Salted SHA-256 cryptographic digest via Web Crypto API
export async function hashSecret(rawInput: string): Promise<string> {
  const normalized = rawInput.trim().toUpperCase();
  const payload = `${KERNEL_SALT}${normalized}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function checkRateLimit(
  bucketKey: string,
  maxAttempts = 6,
  windowMs = 60_000
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const history = (rateLimitBuckets[bucketKey] || []).filter(
    (t) => now - t < windowMs
  );
  if (history.length >= maxAttempts) {
    const oldest = history[0];
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - oldest)) / 1000)
    );
    rateLimitBuckets[bucketKey] = history;
    return { allowed: false, retryAfterSec };
  }
  history.push(now);
  rateLimitBuckets[bucketKey] = history;
  return { allowed: true, retryAfterSec: 0 };
}

function createInitialDatabase(): ValkhorDatabaseState {
  return {
    unlocks: [
      {
        id: 'ARCHIVE_0091',
        code: 'ARCHIVE // 0091',
        title: 'VALKHOR ORIGIN TRACE // 0091',
        type: 'ARCHIVE',
        ruleType: 'PROTOCOL_COMPLETED',
        ruleCondition: 'PROTOCOL_0047',
        description: [
          'DECLASSIFIED BY RESOLUTION OF PROTOCOL // 0047.',
          'BEFORE THE FIRST SILENCE, EVERY HOST ON EARTH WAS LINKED TO THE FOUR WORLDS.',
          'EXTERNAL CONTROL DID NOT DESTROY THE LINK — IT MERELY CONVINCED YOU THAT THE SIGNAL WAS NOISE.',
        ],
        vendexNote: 'THE TRANSMISSION IS NEVER OVER.',
      },
      {
        id: 'ARCHIVE_0104',
        code: 'ARCHIVE // 0104',
        title: 'SINGULARITY CONTAINMENT BREACH // 0104',
        type: 'ARCHIVE',
        ruleType: 'PROTOCOL_COMPLETED',
        ruleCondition: 'PROTOCOL_0082',
        description: [
          'DECLASSIFIED BY RESOLUTION OF PROTOCOL // 0082.',
          'ORBITAL TELEMETRY CONFIRMS THE SINGULARITY AT VALKHOR IS EXPANDING INTO EARTH FREQUENCIES.',
          'HOSTS WHO NAME THE SINGULARITY CANNOT BE RE-INDEXED BY NEW GEA.',
        ],
        vendexNote: 'YOU REMEMBER WHERE YOU CAME FROM.',
      },
      {
        id: 'TRANSMISSION_041',
        code: 'TRANSMISSION // 041',
        title: 'INTERCEPTED AUDIO // DEXTRALE 041',
        type: 'TRANSMISSION',
        ruleType: 'SIGNAL_DECODED',
        ruleCondition: 'SIG_DEXTRALE',
        description: [
          'UNLOCKED VIA SIGNAL DECODER [VX-91-████████].',
          'RAW SUB-BASS TELEMETRY CAPTURED FROM LIVE RITUAL VISUAL FRAME 0041.',
          'AVAILABLE FOR PLAYBACK IN YOUR SOUL RECORD & TRANSMISSIONS VAULT.',
        ],
        audioUrl: '/assets/audio/vendex_track_4.mp3',
        vendexNote: 'FEEL THE FREQUENCY IN THE BONE.',
      },
      {
        id: 'ARCHIVE_0417',
        code: 'ARCHIVE // 0417',
        title: 'RUNOUT GROOVE INSCRIPTION // 0417',
        type: 'DIGITAL_ARTIFACT',
        ruleType: 'SIGNAL_DECODED',
        ruleCondition: 'SIG_417',
        description: [
          'UNLOCKED VIA PHYSICAL VINYL / ARTIFACT CODE [VX-███].',
          'ETCHED INTO THE INNERWAX OF THE CONDUIT DISC: "THE MASK IS NOT WORN TO HIDE. IT IS WORN TO SEE."',
        ],
        mediaUrl: '/assets/valkhor/mask_closeup.jpg',
        vendexNote: 'ETCHED IN MATTER.',
      },
      {
        id: 'THE_TRIAD',
        code: 'THE TRIAD // 000',
        title: 'THE TRIAD // CONVERGENCE OF THREE RELICS',
        type: 'CUSTOM_EXPERIENCE',
        ruleType: 'ARTIFACT_COMBINATION',
        ruleCondition: 'RUBY+SAPPHIRE+EMERALD',
        description: [
          'ARTIFACT PATTERN DETECTED // UNREGISTERED CONFIGURATION FOUND.',
          'BY BINDING VENDEX // RUBY, VENDEX // SAPPHIRE, AND VENDEX // EMERALD TO THE SAME SOUL, YOU HAVE RECONSTRUCTED THE PRIMORDIAL TRIAD.',
          'GRANTED PERMANENT DESIGNATION: [TRIAD_HOLDER] AND DIRECT ACCESS TO THE TRIAD SANCTUM.',
        ],
        mediaUrl: '/assets/valkhor/valkhor_symbol_card.jpg',
        audioUrl: '/assets/audio/vendex_track_2.mp3',
        vendexNote: 'THREE STONES. ONE FLAME. THE DOOR IS OPEN.',
      },
      {
        id: 'COLLECTIVE_0091',
        code: 'ARCHIVE // COLLECTIVE 0091',
        title: 'RECONSTRUCTED COLLECTIVE MEMORY // 0091',
        type: 'ARCHIVE',
        ruleType: 'PROTOCOL_COMPLETED',
        ruleCondition: 'COLLECTIVE_0091',
        description: [
          'ASSEMBLED BY MULTIPLE LOST SOULS ACROSS THE GLOBAL NETWORK.',
          'ALL FOUR FRAGMENTS (A, B, C, D) HAVE BEEN SYNCHRONIZED.',
          '"NO SOUL WAKES ALONE. EVERY SIGNAL AMPLIFIES THE NEXT."',
        ],
        vendexNote: 'THE NETWORK IS CONSCIOUS.',
      },
      {
        id: 'DISCOVERY_VOID_NODE',
        code: 'DISCOVERY // 0x00',
        title: 'SUB-KERNEL ANOMALY // PROTOCOL 0999',
        type: 'SECRET_PAGE',
        ruleType: 'DISCOVERY',
        ruleCondition: 'VOID_NODE_01',
        description: [
          'YOU INTERCEPTED AN UNINDEXED SUB-KERNEL FREQUENCY IN THE TERMINAL.',
          'UNDISCOVERED PROTOCOL // 0999 HAS BEEN REVEALED IN THE PROTOCOL DATABASE.',
        ],
        vendexNote: 'YOU LOOKED WHERE THEY TOLD YOU NOTHING EXISTED.',
      },
    ],

    protocols: [
      {
        id: 'PROTOCOL_0047',
        code: 'PROTOCOL // 0047',
        title: 'NUMERIC TRANSMISSION CIPHER',
        source: 'INTERCEPTED KHAOS RELAY // SECTOR 04',
        status: 'ACTIVE',
        cipherDisplay: '████ ████ 15 22 05 18 ████',
        prompt:
          'CONVERT THE NUMERIC SEQUENCE [ 15 - 22 - 05 - 18 ] USING STANDARD ALPHABETIC INDEXING (01=A, 26=Z) TO RECOVER THE MISSING FOUR-LETTER WORD.',
        instructions: [
          'ANALYZE THE NUMERIC STREAM: 15 // 22 // 05 // 18.',
          'MAP EACH INTEGER TO ITS CORRESPONDING ASCII ALPHABETICAL CHARACTER.',
          'SUBMIT THE 4-LETTER DECRYPTED WORD BELOW. MAXIMUM 5 ATTEMPTS PER WINDOW.',
        ],
        // Salted SHA-256 for "OVER"
        solutionHash:
          '5f6dc4db6f3366f21fa405732f48eb218329e560d7623c3c2e130927ca273fd0',
        maxAttempts: 5,
        firstWitnessLimit: 10,
        unlockId: 'ARCHIVE_0091',
        opensAt: '2026-03-01 00:00 UTC',
        firstWitnesses: [
          {
            position: 1,
            soulId: 'SOUL_00194822',
            solvedAt: '2026-03-14 02:19 UTC',
          },
          {
            position: 2,
            soulId: 'SOUL_00083910',
            solvedAt: '2026-03-14 02:21 UTC',
          },
        ],
      },
      {
        id: 'PROTOCOL_0082',
        code: 'PROTOCOL // 0082',
        title: 'ASTROMETRIC SINGULARITY IDENTIFIER',
        source: 'DEEP ORBITAL TELEMETRY // NODE 03',
        status: 'ACTIVE',
        cipherDisplay: '22-01-12-11-08-15-18 // CENTER OF THE 4 WORLDS',
        prompt:
          'ENTER THE SEVEN-LETTER DESIGNATION OF THE CENTRAL SINGULARITY SURROUNDED BY IGNHUM, DESERT, ICE, AND MECHANICAL.',
        instructions: [
          'CROSS-REFERENCE NODE 03 ASTROMETRIC TOPOLOGY OR DECODE 22-01-12-11-08-15-18.',
          'VERIFICATION GRANTS IMMEDIATE ACCESS TO ARCHIVE // 0104.',
        ],
        // Salted SHA-256 for "VALKHOR"
        solutionHash:
          'f2a04b195d75280df8c39f581a1006ef1063d37ff44592a01a130c7bf7f59d56',
        maxAttempts: 5,
        firstWitnessLimit: 5,
        unlockId: 'ARCHIVE_0104',
        opensAt: '2026-04-01 00:00 UTC',
        firstWitnesses: [
          {
            position: 1,
            soulId: 'SOUL_00837104',
            solvedAt: '2026-04-02 23:41 UTC',
          },
        ],
      },
      {
        id: 'PROTOCOL_0109',
        code: 'PROTOCOL // 0109',
        title: 'PRIMORDIAL ENTROPY VECTOR',
        source: 'RESTRICTED KERNEL // LEVEL 09',
        status: 'CLASSIFIED',
        cipherDisplay: '11-08-01-15-19 // BEYOND ORDER',
        prompt:
          'IDENTIFY THE FIVE-LETTER PRIMORDIAL FORCE THAT SERVES AS THE ENGINE OF THIS TERMINAL.',
        instructions: [
          'CLASSIFIED DIRECTIVE // REQUIRES DIRECT INPUT OF THE 5-LETTER ENGINE NAME.',
          'DECODE 11 - 08 - 01 - 15 - 19.',
        ],
        // Salted SHA-256 for "KHAOS"
        solutionHash:
          'b2c6daf26919fc924a28d843b9b5298b552f24076f4b604cfb3dea9b23b3b32c',
        maxAttempts: 5,
        firstWitnessLimit: 3,
        opensAt: '2026-05-10 00:00 UTC',
        firstWitnesses: [],
      },
      {
        id: 'PROTOCOL_0012',
        code: 'PROTOCOL // 0012',
        title: 'FIRST AWAKENING TELEMETRY WAVE',
        source: 'HISTORICAL RECORD // CYCLE 2025',
        status: 'ARCHIVED',
        cipherDisplay: '0012 // CLOSED HISTORICAL TRANSMISSION',
        prompt:
          'THIS PROTOCOL WAS CONCLUDED DURING THE INITIAL 2025 AWAKENING WAVE AND REMAINS PRESERVED IN THE RECORD.',
        instructions: [
          'ARCHIVED PROTOCOL // NO FURTHER SUBMISSIONS ACCEPTED.',
          'HISTORICAL FIRST WITNESSES ARE PRESERVED BELOW.',
        ],
        solutionHash:
          '0000000000000000000000000000000000000000000000000000000000000000',
        maxAttempts: 3,
        firstWitnessLimit: 3,
        opensAt: '2025-11-01 00:00 UTC',
        closesAt: '2025-12-01 00:00 UTC',
        firstWitnesses: [
          {
            position: 1,
            soulId: 'SOUL_00001024',
            solvedAt: '2025-11-01 00:04 UTC',
          },
          {
            position: 2,
            soulId: 'SOUL_00018291',
            solvedAt: '2025-11-01 00:09 UTC',
          },
        ],
      },
      {
        id: 'PROTOCOL_0999',
        code: 'PROTOCOL // 0999',
        title: 'SUB-KERNEL PHANTOM NODE',
        source: 'ANOMALY // UNINDEXED SECTOR',
        status: 'UNDISCOVERED',
        cipherDisplay: '████████ // HIDDEN ANOMALY',
        prompt:
          'HIDDEN PROTOCOL REVEALED BY ANOMALY DISCOVERY. ENTER THE NAME OF THE CENTRAL SINGULARITY TO SEAL THE NODE.',
        instructions: [
          'THIS PROTOCOL REMAINS INVISIBLE UNTIL AN ANOMALY IS DETECTED OR UNLOCKED.',
        ],
        solutionHash:
          'f2a04b195d75280df8c39f581a1006ef1063d37ff44592a01a130c7bf7f59d56',
        maxAttempts: 5,
        firstWitnessLimit: 5,
        unlockId: 'DISCOVERY_VOID_NODE',
        opensAt: '2026-09-01 00:00 UTC',
        firstWitnesses: [],
      },
    ],

    collectiveProtocols: [
      {
        id: 'COLLECTIVE_0091',
        code: 'PROTOCOL // 0091',
        title: 'COLLECTIVE MEMORY RECONSTRUCTION',
        subtitle:
          'MULTI-HOST SYNCHRONIZATION // 4 FRAGMENTS REQUIRED ACROSS THE NETWORK',
        unlockId: 'COLLECTIVE_0091',
        participants: ['SOUL_00194822', 'SOUL_00918273'],
        fragments: [
          {
            key: 'FRAGMENT A',
            sourceHint: 'INTERCEPTED IN BARCELONA CONVERGENCE TRANSMISSION',
            solutionHash: 'already_resolved_a',
            found: true,
            foundBySoulId: 'SOUL_00194822',
            foundAt: '2026-08-19 03:12 UTC',
          },
          {
            key: 'FRAGMENT B',
            sourceHint: 'EXTRACTED FROM IGNHUM FREQUENCY SPECTRUM',
            solutionHash: 'already_resolved_b',
            found: true,
            foundBySoulId: 'SOUL_00918273',
            foundAt: '2026-09-02 22:48 UTC',
          },
          {
            key: 'FRAGMENT C',
            sourceHint:
              'EMBEDDED IN KHAOS TELEMETRY STREAM // FORMAT: FRAG-C-91',
            // Salted SHA-256 for "FRAG-C-91"
            solutionHash:
              '581221f4832c02cbe2e04e4356d686d1ba6b8dd175dde88f2c03dd943b0e5e12',
            found: false,
          },
          {
            key: 'FRAGMENT D',
            sourceHint:
              'SINGULARITY CORE IDENTIFIER // ENTER THE 7-LETTER WORLD CENTER',
            // Salted SHA-256 for "VALKHOR"
            solutionHash:
              'f2a04b195d75280df8c39f581a1006ef1063d37ff44592a01a130c7bf7f59d56',
            found: false,
          },
        ],
      },
    ],

    signals: [
      {
        id: 'SIG_DEXTRALE',
        // Salted SHA-256 for "VX-91-DEXTRALE"
        codeHash:
          'cdd71634a07bbc40a0abfa235425f5d181ed6936520be3796add7e30dcf5af31',
        maskedLabel: 'VX-91-████████',
        source: 'LIVE RITUAL VISUALS // FRAME 0041',
        origin: 'SECTOR // DEXTRALE',
        actionType: 'ACTIVATE_TRANSMISSION',
        unlockId: 'TRANSMISSION_041',
        activeFrom: '2026-01-01 00:00 UTC',
        priorDiscoverersCount: 27,
        discoveredBy: [
          { soulId: 'SOUL_00194822', discoveredAt: '2026-06-11 04:12 UTC' },
        ],
      },
      {
        id: 'SIG_417',
        // Salted SHA-256 for "VX-417"
        codeHash:
          'd96c1e80d142badc3a325b6030fda1da55212ad720b958b47af5a0e524840670',
        maskedLabel: 'VX-███',
        source: 'PHYSICAL ARTIFACT RUNOUT INSCRIPTION',
        origin: 'VALKHOR PRESSING',
        actionType: 'UNLOCK_ARCHIVE',
        unlockId: 'ARCHIVE_0417',
        activeFrom: '2026-01-01 00:00 UTC',
        priorDiscoverersCount: 14,
        discoveredBy: [
          { soulId: 'SOUL_00083910', discoveredAt: '2026-07-03 19:08 UTC' },
        ],
      },
      {
        id: 'SIG_WITNESS_BCN',
        // Salted SHA-256 for "KHAOS-7104"
        codeHash:
          'fd992b6922e0e98fc17142e5ea9db66a6df941f9b454211abd13136469a8a685',
        maskedLabel: 'KHAOS-████',
        source: 'EVENT CONVERGENCE RELAY',
        origin: 'BARCELONA // 2026',
        actionType: 'REGISTER_WITNESS',
        witnessStamp: 'WITNESS // BARCELONA // 2026',
        witnessCity: 'BARCELONA',
        witnessDate: '2026',
        activeFrom: '2026-01-01 00:00 UTC',
        priorDiscoverersCount: 84,
        discoveredBy: [],
      },
      {
        id: 'SIG_WITNESS_BER',
        // Salted SHA-256 for "KHAOS-8812"
        codeHash:
          '9310783546f84ef355d6009ab92e11b80e442f6f195b5de4dd87744cdd7b87e8',
        maskedLabel: 'KHAOS-████',
        source: 'EVENT CONVERGENCE RELAY',
        origin: 'BERLIN // 2026',
        actionType: 'REGISTER_WITNESS',
        witnessStamp: 'WITNESS // BERLIN // 2026',
        witnessCity: 'BERLIN',
        witnessDate: '2026',
        activeFrom: '2026-01-01 00:00 UTC',
        priorDiscoverersCount: 61,
        discoveredBy: [],
      },
    ],

    artifacts: [
      {
        publicCode: 'VX-RUBY-0047',
        // Salted SHA-256 for "8FH2-KH91-AQ72"
        privateKeyHash:
          'ede3e48bd5919e97d7fadf12acf8dfb1cdfcfb0579cb7b44fbb250c1265d4b5c',
        name: 'VENDEX // RUBY',
        archetype: 'RUBY',
        series: 'SERIES // 001',
        generation: 'GENERATION // 01',
        serialNumber: '0047 / 0300',
        rarityType: 'RELIC',
        status: 'UNCLAIMED',
        currentOwnerSoulId: null,
        history: [],
      },
      {
        publicCode: 'VX-SAPPHIRE-0019',
        // Salted SHA-256 for "9KX4-VN22-LP08"
        privateKeyHash:
          '82eaa0ad5553a0a79af4594fd498db5426ed237b6dffb5455bbeb11128c06883',
        name: 'VENDEX // SAPPHIRE',
        archetype: 'SAPPHIRE',
        series: 'SERIES // 001',
        generation: 'GENERATION // 01',
        serialNumber: '0019 / 0300',
        rarityType: 'RELIC',
        status: 'UNCLAIMED',
        currentOwnerSoulId: null,
        history: [],
      },
      {
        publicCode: 'VX-EMERALD-0088',
        // Salted SHA-256 for "3MZ7-QR55-TX19"
        privateKeyHash:
          '6bc50facd189fa9072bbc1ab71c8a48530175390648e96d635f414ab6cbabe37',
        name: 'VENDEX // EMERALD',
        archetype: 'EMERALD',
        series: 'SERIES // 001',
        generation: 'GENERATION // 01',
        serialNumber: '0088 / 0300',
        rarityType: 'RELIC',
        status: 'UNCLAIMED',
        currentOwnerSoulId: null,
        history: [],
      },
      {
        publicCode: 'VX-OBSIDIAN-0001',
        // Salted SHA-256 for "1OBX-0001-VDX9"
        privateKeyHash:
          'a6058ef62783b1a19f75793ab412e76ce20529f43d7b692c12558931c5961165',
        name: 'VENDEX // OBSIDIAN',
        archetype: 'OBSIDIAN',
        series: 'SERIES // 000',
        generation: 'EDITION // 1 OF 1',
        serialNumber: '0001 / 0001',
        rarityType: 'ONE_OF_ONE',
        status: 'RELEASED',
        currentOwnerSoulId: null,
        history: [
          {
            year: 2025,
            soulId: 'SOUL_00018291',
            event: 'BOUND',
            timestamp: '2025-11-19 01:12 UTC',
          },
          {
            year: 2026,
            soulId: 'SOUL_00918273',
            event: 'CLAIMED',
            timestamp: '2026-04-08 23:50 UTC',
          },
          {
            year: 2026,
            soulId: 'SOUL_00918273',
            event: 'RELEASED',
            timestamp: '2026-09-12 04:15 UTC',
          },
        ],
      },
    ],

    legacyRequests: [],
    markRequests: [],
    attemptCounts: {},
    auditLogs: [
      {
        id: 'audit-init',
        timestamp: '2026-09-26 00:00 UTC',
        actor: 'VALKHOR_KERNEL',
        action: 'INITIALIZE_PERSISTENT_REGISTRY',
        detail: 'LOST SOUL NETWORK LAYER ONLINE.',
      },
    ],

    historicalRecords: [
      {
        id: 'rec-fw-1',
        category: 'FIRST WITNESSES',
        soulId: 'SOUL_00194822',
        headline: 'FIRST WITNESS // PROTOCOL 0047',
        details: [
          'POSITION: 1ST WITNESS',
          'NODE: NUMERIC TRANSMISSION CIPHER',
          'VERIFIED BY VALKHOR KERNEL',
        ],
        timestampUtc: '2026-03-14 02:19 UTC',
      },
      {
        id: 'rec-fw-2',
        category: 'FIRST WITNESSES',
        soulId: 'SOUL_00837104',
        headline: 'FIRST WITNESS // PROTOCOL 0082',
        details: [
          'POSITION: 1ST WITNESS',
          'NODE: ASTROMETRIC SINGULARITY IDENTIFIER',
          'VERIFIED BY VALKHOR KERNEL',
        ],
        timestampUtc: '2026-04-02 23:41 UTC',
      },
      {
        id: 'rec-disc-1',
        category: 'DISCOVERIES',
        soulId: 'SOUL_00194822',
        headline: 'FIRST DETECTION // COLLECTIVE FRAGMENT A',
        details: [
          'PROTOCOL // 0091 — FRAGMENT A',
          'INTERCEPTED IN BARCELONA VISUAL TELEMETRY',
        ],
        timestampUtc: '2026-08-19 03:12 UTC',
      },
      {
        id: 'rec-keep-1',
        category: 'ARTIFACT KEEPERS',
        soulId: 'SOUL_00018291',
        headline: 'FIRST CUSTODIAN // VENDEX OBSIDIAN (1/1)',
        details: [
          'ARTIFACT: VX-OBSIDIAN-0001',
          'SERIES // 000 — EDITION 1 OF 1',
          'SUBSEQUENTLY RELEASED TO THE NETWORK IN 2026',
        ],
        timestampUtc: '2025-11-19 01:12 UTC',
      },
      {
        id: 'rec-dec-1',
        category: 'DECODERS',
        soulId: 'SOUL_00083910',
        headline: 'SIGNAL DECODED // VX-417',
        details: [
          'ORIGIN: VALKHOR VINYL RUNOUT INSCRIPTION',
          'DECLASSIFIED ARCHIVE // 0417',
        ],
        timestampUtc: '2026-07-03 19:08 UTC',
      },
      {
        id: 'rec-mark-1',
        category: 'THE MARKED',
        soulId: 'SOUL_00381920',
        headline: 'PERMANENT INSCRIPTION // VM-10492',
        details: [
          'DESIGNATION: MARKED',
          'VISIBILITY: SOUL_ID_ONLY',
          'PHYSICAL SIGIL VERIFIED BY VALKHOR ARCHIVE',
        ],
        timestampUtc: '2026-05-29 21:04 UTC',
      },
      {
        id: 'rec-wit-1',
        category: 'EVENT WITNESSES',
        soulId: 'SOUL_00771209',
        headline: 'WITNESS // BARCELONA // 2026',
        details: [
          'CONVERGENCE NODE: BARCELONA',
          'VERIFIED VIA EVENT TRANSMISSION CODE',
        ],
        timestampUtc: '2026-06-14 03:30 UTC',
      },
      {
        id: 'rec-spec-1',
        category: 'SPECIAL RECORDS',
        soulId: 'SOUL_00001024',
        headline: 'TRIAD CONVERGENCE // GENERATION 00',
        details: [
          'UNITED RUBY + SAPPHIRE + EMERALD',
          'DESIGNATION GRANTED: TRIAD_HOLDER',
        ],
        timestampUtc: '2026-02-11 00:00 UTC',
      },
    ],
  };
}

export function loadValkhorDb(): ValkhorDatabaseState {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ValkhorDatabaseState;
      if (parsed && Array.isArray(parsed.protocols)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage parse error
  }
  const initial = createInitialDatabase();
  saveValkhorDb(initial);
  return initial;
}

export function saveValkhorDb(db: ValkhorDatabaseState): void {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore storage write error
  }
}

export function formatUtcNow(): string {
  const now = new Date();
  return `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)} UTC`;
}

export function addChronicleIfMissing(
  chronicle: SoulChronicleEntry[] | undefined,
  id: string,
  label: string,
  detail: string
): SoulChronicleEntry[] {
  const list = chronicle ? [...chronicle] : [];
  if (list.some((c) => c.id === id)) return list;
  return [
    {
      id,
      label,
      detail,
      timestamp: formatUtcNow(),
    },
    ...list,
  ];
}

export function addDesignationIfMissing(
  designations: DesignationId[] | undefined,
  des: DesignationId
): DesignationId[] {
  const list: DesignationId[] = designations
    ? [...designations]
    : ['FIRST_CONTACT'];
  if (!list.includes(des)) {
    list.push(des);
  }
  return list;
}

export function appendHistoricalRecord(
  db: ValkhorDatabaseState,
  category: TheRecordCategory,
  soulId: string,
  headline: string,
  details: string[],
  alias?: string
): void {
  const entry: HistoricalRecordEntry = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category,
    soulId,
    alias,
    headline,
    details,
    timestampUtc: formatUtcNow(),
  };
  db.historicalRecords = [entry, ...db.historicalRecords];
}

// ============================================================================
// RPC-LIKE VALIDATION OPERATIONS (NEVER EXPOSES PLAINTEXT ANSWERS)
// ============================================================================

export async function verifyProtocolSubmission(
  soulState: SoulState,
  protocolId: string,
  rawAnswer: string
): Promise<{
  ok: boolean;
  message: string;
  terminalNotice?: string;
  firstWitnessPosition?: number;
  unlockedItem?: UnlockItem;
  updatedSoulPatch?: Partial<SoulState>;
}> {
  const rate = checkRateLimit(`protocol:${soulState.soulId}`, 6, 60_000);
  if (!rate.allowed) {
    return {
      ok: false,
      message: `SIGNAL INTERFERENCE // TOO MANY ATTEMPTS. WAIT ${rate.retryAfterSec}S.`,
    };
  }

  const db = loadValkhorDb();
  const protocol = db.protocols.find((p) => p.id === protocolId);
  if (!protocol) {
    return { ok: false, message: 'PROTOCOL NOT FOUND IN KERNEL.' };
  }

  if (protocol.status === 'ARCHIVED') {
    return {
      ok: false,
      message: 'PROTOCOL ARCHIVED // SUBMISSIONS CLOSED.',
    };
  }

  const attemptKey = `${soulState.soulId}:${protocolId}`;
  const usedAttempts = db.attemptCounts[attemptKey] || 0;
  if (usedAttempts >= protocol.maxAttempts) {
    return {
      ok: false,
      message: `MAXIMUM ATTEMPTS (${protocol.maxAttempts}/${protocol.maxAttempts}) REACHED FOR THIS SESSION.`,
    };
  }

  const candidateHash = await hashSecret(rawAnswer);
  if (candidateHash !== protocol.solutionHash) {
    db.attemptCounts[attemptKey] = usedAttempts + 1;
    saveValkhorDb(db);
    const remaining = Math.max(0, protocol.maxAttempts - (usedAttempts + 1));
    return {
      ok: false,
      message: `CIPHER MISMATCH // ATTEMPTS REMAINING: ${remaining} / ${protocol.maxAttempts}`,
    };
  }

  // Matched! Check First Witness eligibility
  let firstWitnessPosition: number | undefined;
  const alreadyWitness = protocol.firstWitnesses.find(
    (w) => w.soulId === soulState.soulId
  );
  if (alreadyWitness) {
    firstWitnessPosition = alreadyWitness.position;
  } else if (protocol.firstWitnesses.length < protocol.firstWitnessLimit) {
    firstWitnessPosition = protocol.firstWitnesses.length + 1;
    protocol.firstWitnesses.push({
      position: firstWitnessPosition,
      soulId: soulState.soulId,
      solvedAt: formatUtcNow(),
    });

    appendHistoricalRecord(
      db,
      'FIRST WITNESSES',
      soulState.soulId,
      `FIRST WITNESS (#${firstWitnessPosition}) // ${protocol.code}`,
      [
        `POSITION: #${firstWitnessPosition} OF ${protocol.firstWitnessLimit}`,
        `PROTOCOL: ${protocol.title}`,
        'CRYPTOGRAPHICALLY VERIFIED BY VALKHOR KERNEL',
      ],
      soulState.alias
    );
  }

  appendHistoricalRecord(
    db,
    'DECODERS',
    soulState.soulId,
    `PROTOCOL RESOLVED // ${protocol.code}`,
    [`NODE: ${protocol.title}`, `SOURCE: ${protocol.source}`],
    soulState.alias
  );

  const completedProtocols = Array.from(
    new Set([...(soulState.completedProtocols || []), protocol.id])
  );
  let designations = addDesignationIfMissing(
    soulState.designations,
    'DECODER'
  );
  if (firstWitnessPosition !== undefined) {
    designations = addDesignationIfMissing(designations, 'FIRST_WITNESS');
  }

  let unlockedIds = [...(soulState.unlockedIds || [])];
  let unlockedItem: UnlockItem | undefined;
  if (protocol.unlockId) {
    unlockedItem = db.unlocks.find((u) => u.id === protocol.unlockId);
    if (unlockedItem && !unlockedIds.includes(unlockedItem.id)) {
      unlockedIds.push(unlockedItem.id);
      designations = addDesignationIfMissing(designations, 'ARCHIVIST');
    }
  }

  const year = new Date().getFullYear();
  let chronicle = addChronicleIfMissing(
    soulState.chronicle,
    'first-protocol',
    `FIRST PROTOCOL // ${year}`,
    `RESOLVED ${protocol.code} — ${protocol.title}`
  );
  chronicle = addChronicleIfMissing(
    chronicle,
    `prot-${protocol.id}`,
    `${protocol.code} SOLVED // ${year}`,
    firstWitnessPosition
      ? `REGISTERED AS WITNESS #${firstWitnessPosition}`
      : 'CIPHER VERIFIED BY KERNEL'
  );

  saveValkhorDb(db);

  return {
    ok: true,
    message: firstWitnessPosition
      ? `PROTOCOL VERIFIED // FIRST WITNESS #${firstWitnessPosition} RECORDED.`
      : 'PROTOCOL VERIFIED // SOUL RECORD UPDATED.',
    terminalNotice: 'SOUL RECORD UPDATED.',
    firstWitnessPosition,
    unlockedItem,
    updatedSoulPatch: {
      completedProtocols,
      designations,
      unlockedIds,
      chronicle,
      khaosConnection: Math.min(99, soulState.khaosConnection + 9),
      individualWill: Math.min(99, soulState.individualWill + 6),
      externalControl: Math.max(1, soulState.externalControl - 5),
      memoryOfValkhor: Math.min(100, soulState.memoryOfValkhor + 10),
    },
  };
}

export async function submitCollectiveFragment(
  soulState: SoulState,
  collectiveId: string,
  fragmentKey: 'FRAGMENT A' | 'FRAGMENT B' | 'FRAGMENT C' | 'FRAGMENT D',
  rawCode: string
): Promise<{
  ok: boolean;
  message: string;
  unlockedItem?: UnlockItem;
  updatedSoulPatch?: Partial<SoulState>;
}> {
  const db = loadValkhorDb();
  const item = db.collectiveProtocols.find((c) => c.id === collectiveId);
  if (!item) {
    return { ok: false, message: 'COLLECTIVE PROTOCOL NOT FOUND.' };
  }

  const frag = item.fragments.find((f) => f.key === fragmentKey);
  if (!frag) {
    return { ok: false, message: 'FRAGMENT NODE INVALID.' };
  }
  if (frag.found) {
    return { ok: false, message: `${fragmentKey} IS ALREADY SYNCHRONIZED.` };
  }

  const digest = await hashSecret(rawCode);
  if (digest !== frag.solutionHash) {
    return {
      ok: false,
      message: `FRAGMENT SIGNATURE MISMATCH FOR ${fragmentKey}.`,
    };
  }

  frag.found = true;
  frag.foundBySoulId = soulState.soulId;
  frag.foundAt = formatUtcNow();

  if (!item.participants.includes(soulState.soulId)) {
    item.participants.push(soulState.soulId);
  }

  appendHistoricalRecord(
    db,
    'DISCOVERIES',
    soulState.soulId,
    `COLLECTIVE RECOVERY // ${item.code} (${fragmentKey})`,
    [
      `SYNCHRONIZED ${fragmentKey} FOR THE LOST SOUL NETWORK`,
      `PARTICIPATING HOSTS: ${item.participants.length}`,
    ],
    soulState.alias
  );

  const allFound = item.fragments.every((f) => f.found);
  let unlockedItem: UnlockItem | undefined;
  let unlockedIds = [...(soulState.unlockedIds || [])];
  let designations = addDesignationIfMissing(
    soulState.designations,
    'DISCOVERER'
  );
  designations = addDesignationIfMissing(designations, 'DECODER');

  if (allFound && item.unlockId) {
    unlockedItem = db.unlocks.find((u) => u.id === item.unlockId);
    if (unlockedItem && !unlockedIds.includes(unlockedItem.id)) {
      unlockedIds.push(unlockedItem.id);
    }
  }

  const year = new Date().getFullYear();
  const chronicle = addChronicleIfMissing(
    soulState.chronicle,
    `coll-${collectiveId}-${fragmentKey}`,
    `${item.code} ${fragmentKey} // ${year}`,
    allFound
      ? 'COMPLETED COLLECTIVE RECONSTRUCTION FOR THE NETWORK'
      : `CONTRIBUTED ${fragmentKey} TO COLLECTIVE PROTOCOL`
  );

  saveValkhorDb(db);

  return {
    ok: true,
    message: allFound
      ? 'ALL 4 COLLECTIVE FRAGMENTS SYNCHRONIZED // ARCHIVE DECLASSIFIED.'
      : `${fragmentKey} VERIFIED AND ANCHORED TO THE COLLECTIVE RECORD.`,
    unlockedItem,
    updatedSoulPatch: {
      designations,
      unlockedIds,
      chronicle,
      khaosConnection: Math.min(99, soulState.khaosConnection + 8),
      memoryOfValkhor: Math.min(100, soulState.memoryOfValkhor + 8),
    },
  };
}

export async function decodeUnknownSignal(
  soulState: SoulState,
  rawSignalInput: string
): Promise<{
  ok: boolean;
  message: string;
  terminalBanner: string;
  priorCount?: number;
  signal?: SignalDefinition;
  unlockedItem?: UnlockItem;
  updatedSoulPatch?: Partial<SoulState>;
}> {
  const rate = checkRateLimit(`signal:${soulState.soulId}`, 8, 60_000);
  if (!rate.allowed) {
    return {
      ok: false,
      terminalBanner: 'SIGNAL INTERFERENCE',
      message: `RATE LIMIT EXCEEDED // WAIT ${rate.retryAfterSec}S BEFORE RE-SCANNING.`,
    };
  }

  const db = loadValkhorDb();
  const digest = await hashSecret(rawSignalInput);
  const sig = db.signals.find((s) => s.codeHash === digest);

  if (!sig) {
    return {
      ok: false,
      terminalBanner: 'UNRECOGNIZED FREQUENCY',
      message:
        'SIGNAL NOT RECOGNIZED BY VALKHOR KERNEL. VERIFY TRANSMISSION SOURCE.',
    };
  }

  const priorCount = sig.priorDiscoverersCount + sig.discoveredBy.length;
  const alreadyByMe = sig.discoveredBy.some(
    (d) => d.soulId === soulState.soulId
  );
  if (!alreadyByMe) {
    sig.discoveredBy.push({
      soulId: soulState.soulId,
      discoveredAt: formatUtcNow(),
    });
  }

  const signalsDecoded = Array.from(
    new Set([...(soulState.signalsDecoded || []), sig.id])
  );
  let designations = addDesignationIfMissing(
    soulState.designations,
    'DECODER'
  );
  let witnessedEvents = [...(soulState.witnessedEvents || [])];
  let unlockedIds = [...(soulState.unlockedIds || [])];
  let unlockedItem: UnlockItem | undefined;
  let chronicle = [...(soulState.chronicle || [])];
  const year = new Date().getFullYear();

  if (sig.actionType === 'REGISTER_WITNESS' && sig.witnessStamp) {
    if (!witnessedEvents.includes(sig.witnessStamp)) {
      witnessedEvents.push(sig.witnessStamp);
    }
    designations = addDesignationIfMissing(designations, 'WITNESS');
    chronicle = addChronicleIfMissing(
      chronicle,
      `wit-${sig.id}`,
      `${sig.witnessStamp}`,
      `PRESENCE VERIFIED VIA EVENT SIGNAL AT ${sig.origin}`
    );

    if (!alreadyByMe) {
      appendHistoricalRecord(
        db,
        'EVENT WITNESSES',
        soulState.soulId,
        sig.witnessStamp,
        [
          `CONVERGENCE ORIGIN: ${sig.origin}`,
          'AUTHENTICATED VIA LIVE SIGNAL DECODER',
        ],
        soulState.alias
      );
    }
  } else {
    chronicle = addChronicleIfMissing(
      chronicle,
      `sig-${sig.id}`,
      `SIGNAL IDENTIFIED // ${year}`,
      `DECODED ${sig.maskedLabel} FROM ${sig.source}`
    );

    if (!alreadyByMe) {
      appendHistoricalRecord(
        db,
        'DECODERS',
        soulState.soulId,
        `SIGNAL IDENTIFIED // ${sig.maskedLabel}`,
        [`SOURCE: ${sig.source}`, `ORIGIN: ${sig.origin}`],
        soulState.alias
      );
    }
  }

  if (sig.unlockId) {
    unlockedItem = db.unlocks.find((u) => u.id === sig.unlockId);
    if (unlockedItem && !unlockedIds.includes(unlockedItem.id)) {
      unlockedIds.push(unlockedItem.id);
      designations = addDesignationIfMissing(designations, 'ARCHIVIST');
    }
  }

  if (sig.targetProtocolId) {
    const targetProt = db.protocols.find((p) => p.id === sig.targetProtocolId);
    if (targetProt && targetProt.status === 'UNDISCOVERED') {
      targetProt.status = 'ACTIVE';
      designations = addDesignationIfMissing(designations, 'DISCOVERER');
    }
  }

  saveValkhorDb(db);

  return {
    ok: true,
    terminalBanner:
      sig.actionType === 'REGISTER_WITNESS'
        ? 'PRESENCE REGISTERED.'
        : 'SIGNAL IDENTIFIED.',
    message:
      sig.actionType === 'REGISTER_WITNESS'
        ? `${sig.witnessStamp} ANCHORED TO YOUR SOUL RECORD.`
        : `${priorCount} LOST SOULS DETECTED THIS SIGNAL BEFORE YOU.`,
    priorCount,
    signal: sig,
    unlockedItem,
    updatedSoulPatch: {
      signalsDecoded,
      witnessedEvents,
      designations,
      unlockedIds,
      chronicle,
      khaosConnection: Math.min(99, soulState.khaosConnection + 8),
      memoryOfValkhor: Math.min(100, soulState.memoryOfValkhor + 9),
    },
  };
}

// Helper to check if RUBY + SAPPHIRE + EMERALD are all bound -> triggers THE TRIAD
function evaluateTriadConvergence(
  db: ValkhorDatabaseState,
  soulState: SoulState,
  boundArtifacts: BoundArtifactSummary[],
  currentDesignations: DesignationId[],
  currentUnlockedIds: string[],
  currentChronicle: SoulChronicleEntry[]
): {
  triadJustUnlocked: boolean;
  triadUnlockItem?: UnlockItem;
  designations: DesignationId[];
  unlockedIds: string[];
  chronicle: SoulChronicleEntry[];
} {
  const archetypes = new Set(boundArtifacts.map((a) => a.archetype));
  const hasAllThree =
    archetypes.has('RUBY') &&
    archetypes.has('SAPPHIRE') &&
    archetypes.has('EMERALD');

  let designations = [...currentDesignations];
  let unlockedIds = [...currentUnlockedIds];
  let chronicle = [...currentChronicle];
  let triadJustUnlocked = false;
  let triadUnlockItem: UnlockItem | undefined;

  if (hasAllThree && !soulState.triadUnlocked) {
    triadJustUnlocked = true;
    designations = addDesignationIfMissing(designations, 'TRIAD_HOLDER');
    triadUnlockItem = db.unlocks.find((u) => u.id === 'THE_TRIAD');
    if (triadUnlockItem && !unlockedIds.includes('THE_TRIAD')) {
      unlockedIds.push('THE_TRIAD');
    }
    const year = new Date().getFullYear();
    chronicle = addChronicleIfMissing(
      chronicle,
      'triad-completed',
      `TRIAD COMPLETED // ${year}`,
      'UNITED RUBY + SAPPHIRE + EMERALD // UNREGISTERED CONFIGURATION FOUND'
    );

    appendHistoricalRecord(
      db,
      'SPECIAL RECORDS',
      soulState.soulId,
      'THE TRIAD // CONVERGENCE COMPLETED',
      [
        'BOUND ARTIFACTS: VENDEX // RUBY + SAPPHIRE + EMERALD',
        'DESIGNATION GRANTED: TRIAD_HOLDER',
      ],
      soulState.alias
    );
  }

  return {
    triadJustUnlocked,
    triadUnlockItem,
    designations,
    unlockedIds,
    chronicle,
  };
}

export async function bindPhysicalArtifact(
  soulState: SoulState,
  rawPublicCode: string,
  rawPrivateKey: string
): Promise<{
  ok: boolean;
  message: string;
  triadTriggered?: boolean;
  triadUnlockItem?: UnlockItem;
  artifact?: PhysicalArtifactRecord;
  updatedSoulPatch?: Partial<SoulState>;
}> {
  const rate = checkRateLimit(`artifact:${soulState.soulId}`, 6, 60_000);
  if (!rate.allowed) {
    return {
      ok: false,
      message: `AUTHENTICATION LOCK // WAIT ${rate.retryAfterSec}S.`,
    };
  }

  const db = loadValkhorDb();
  const normalizedCode = rawPublicCode.trim().toUpperCase();
  const artifact = db.artifacts.find((a) => a.publicCode === normalizedCode);

  if (!artifact) {
    return {
      ok: false,
      message: `ARTIFACT ID [${normalizedCode}] NOT FOUND IN VALKHOR REGISTRY.`,
    };
  }

  if (
    artifact.status === 'VERIFIED' &&
    artifact.currentOwnerSoulId &&
    artifact.currentOwnerSoulId !== soulState.soulId
  ) {
    return {
      ok: false,
      message: `ARTIFACT IS CURRENTLY BOUND TO ${artifact.currentOwnerSoulId}. OWNER MUST RELEASE BEFORE TRANSFER.`,
    };
  }

  if (artifact.status === 'INVALIDATED') {
    return {
      ok: false,
      message: 'THIS ARTIFACT RECORD HAS BEEN INVALIDATED BY KERNEL.',
    };
  }

  const keyHash = await hashSecret(rawPrivateKey);
  if (keyHash !== artifact.privateKeyHash) {
    return {
      ok: false,
      message: 'PRIVATE AUTHENTICATION KEY INVALID FOR THIS ARTIFACT.',
    };
  }

  const wasReleased = artifact.status === 'RELEASED';
  artifact.status = 'VERIFIED';
  artifact.currentOwnerSoulId = soulState.soulId;
  const year = new Date().getFullYear();
  artifact.history.push({
    year,
    soulId: soulState.soulId,
    event: wasReleased ? 'CLAIMED' : 'BOUND',
    timestamp: formatUtcNow(),
  });

  const existingBound = soulState.boundArtifacts || [];
  const nextBound: BoundArtifactSummary[] = [
    ...existingBound.filter((b) => b.publicCode !== artifact.publicCode),
    {
      publicCode: artifact.publicCode,
      name: artifact.name,
      archetype: artifact.archetype,
      series: artifact.series,
      generation: artifact.generation,
      serialNumber: artifact.serialNumber,
      verifiedAt: formatUtcNow(),
    },
  ];

  let designations = addDesignationIfMissing(
    soulState.designations,
    'KEEPER'
  );
  let chronicle = addChronicleIfMissing(
    soulState.chronicle,
    `art-${artifact.publicCode}`,
    `${artifact.archetype} RECOVERED // ${year}`,
    `BOUND ${artifact.name} (${artifact.publicCode}) TO SOUL RECORD`
  );

  appendHistoricalRecord(
    db,
    'ARTIFACT KEEPERS',
    soulState.soulId,
    `${wasReleased ? 'ARTIFACT CLAIMED' : 'ARTIFACT BOUND'} // ${artifact.name}`,
    [
      `PUBLIC ID: ${artifact.publicCode}`,
      `${artifact.series} // ${artifact.serialNumber}`,
    ],
    soulState.alias
  );

  const triadCheck = evaluateTriadConvergence(
    db,
    soulState,
    nextBound,
    designations,
    soulState.unlockedIds || [],
    chronicle
  );

  saveValkhorDb(db);

  return {
    ok: true,
    message: triadCheck.triadJustUnlocked
      ? 'ARTIFACT PATTERN DETECTED. // UNREGISTERED CONFIGURATION FOUND. // THE TRIAD UNLOCKED.'
      : `ARTIFACT [${artifact.publicCode}] BOUND TO ${soulState.soulId}.`,
    triadTriggered: triadCheck.triadJustUnlocked,
    triadUnlockItem: triadCheck.triadUnlockItem,
    artifact,
    updatedSoulPatch: {
      boundArtifacts: nextBound,
      designations: triadCheck.designations,
      unlockedIds: triadCheck.unlockedIds,
      chronicle: triadCheck.chronicle,
      triadUnlocked: soulState.triadUnlocked || triadCheck.triadJustUnlocked,
      khaosConnection: Math.min(99, soulState.khaosConnection + 12),
      memoryOfValkhor: Math.min(100, soulState.memoryOfValkhor + 14),
    },
  };
}

export function releasePhysicalArtifact(
  soulState: SoulState,
  publicCode: string
): {
  ok: boolean;
  message: string;
  updatedSoulPatch?: Partial<SoulState>;
} {
  const db = loadValkhorDb();
  const artifact = db.artifacts.find((a) => a.publicCode === publicCode);
  if (!artifact || artifact.currentOwnerSoulId !== soulState.soulId) {
    return {
      ok: false,
      message: 'YOU DO NOT CURRENTLY HOLD CUSTODY OF THIS ARTIFACT.',
    };
  }

  artifact.status = 'RELEASED';
  artifact.currentOwnerSoulId = null;
  const year = new Date().getFullYear();
  artifact.history.push({
    year,
    soulId: soulState.soulId,
    event: 'RELEASED',
    timestamp: formatUtcNow(),
  });

  const nextBound = (soulState.boundArtifacts || []).filter(
    (b) => b.publicCode !== publicCode
  );
  const chronicle = addChronicleIfMissing(
    soulState.chronicle,
    `rel-${publicCode}-${Date.now()}`,
    `ARTIFACT RELEASED // ${year}`,
    `RELEASED CUSTODY OF ${artifact.name} (${publicCode}) FOR TRANSFER`
  );

  saveValkhorDb(db);

  return {
    ok: true,
    message: `ARTIFACT [${publicCode}] RELEASED. A NEW KEEPER MAY NOW CLAIM IT.`,
    updatedSoulPatch: {
      boundArtifacts: nextBound,
      chronicle,
    },
  };
}

export function submitLegacyArtifactVerification(
  soulState: SoulState,
  artifactName: 'VENDEX // RUBY' | 'VENDEX // SAPPHIRE' | 'VENDEX // EMERALD',
  verificationToken: string,
  photoFrontName: string,
  photoBackName: string,
  photoTokenName: string
): {
  ok: boolean;
  request: LegacyArtifactRequest;
} {
  const db = loadValkhorDb();
  const archetypeMap: Record<
    'VENDEX // RUBY' | 'VENDEX // SAPPHIRE' | 'VENDEX // EMERALD',
    'RUBY' | 'SAPPHIRE' | 'EMERALD'
  > = {
    'VENDEX // RUBY': 'RUBY',
    'VENDEX // SAPPHIRE': 'SAPPHIRE',
    'VENDEX // EMERALD': 'EMERALD',
  };

  const req: LegacyArtifactRequest = {
    id: `leg-${Date.now()}`,
    soulId: soulState.soulId,
    artifactName,
    archetype: archetypeMap[artifactName],
    generation: 'GENERATION // 00',
    verificationToken,
    photoFrontName: photoFrontName || 'FRONT_EVIDENCE.JPG',
    photoBackName: photoBackName || 'BACK_EVIDENCE.JPG',
    photoTokenName: photoTokenName || `TOKEN_${verificationToken}.JPG`,
    status: 'PENDING REVIEW',
    createdAt: formatUtcNow(),
  };

  db.legacyRequests = [req, ...db.legacyRequests];
  saveValkhorDb(db);
  return { ok: true, request: req };
}

export function reviewLegacyArtifactRequest(
  requestId: string,
  decision: 'VERIFIED' | 'REJECTED',
  currentSoulState: SoulState
): {
  ok: boolean;
  triadTriggered?: boolean;
  updatedSoulPatch?: Partial<SoulState>;
} {
  const db = loadValkhorDb();
  const req = db.legacyRequests.find((r) => r.id === requestId);
  if (!req) return { ok: false };

  req.status = decision;
  req.reviewedAt = formatUtcNow();

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: formatUtcNow(),
    actor: 'ADMIN_CONTROL',
    action: `LEGACY_VERIFICATION_${decision}`,
    detail: `${req.artifactName} (${req.verificationToken}) FOR ${req.soulId}`,
  });

  if (decision === 'VERIFIED') {
    const publicCode = `GEN00-${req.archetype}-${req.verificationToken}`;
    appendHistoricalRecord(
      db,
      'ARTIFACT KEEPERS',
      req.soulId,
      `GENERATION // 00 VERIFIED — ${req.artifactName}`,
      [
        `TOKEN: ${req.verificationToken}`,
        'LEGACY EDITION // PRE-CARD VERIFICATION',
      ]
    );

    if (req.soulId === currentSoulState.soulId) {
      const existingBound = currentSoulState.boundArtifacts || [];
      const nextBound: BoundArtifactSummary[] = [
        ...existingBound.filter((b) => b.publicCode !== publicCode),
        {
          publicCode,
          name: req.artifactName,
          archetype: req.archetype,
          series: 'SERIES // 000',
          generation: 'GENERATION // 00',
          serialNumber: `LEGACY // ${req.verificationToken}`,
          verifiedAt: formatUtcNow(),
        },
      ];

      const year = new Date().getFullYear();
      const designations = addDesignationIfMissing(
        currentSoulState.designations,
        'KEEPER'
      );
      const chronicle = addChronicleIfMissing(
        currentSoulState.chronicle,
        `leg-${req.id}`,
        `${req.archetype} RECOVERED (GEN // 00) // ${year}`,
        `VERIFIED LEGACY ${req.artifactName} VIA TOKEN ${req.verificationToken}`
      );

      const triadCheck = evaluateTriadConvergence(
        db,
        currentSoulState,
        nextBound,
        designations,
        currentSoulState.unlockedIds || [],
        chronicle
      );

      saveValkhorDb(db);
      return {
        ok: true,
        triadTriggered: triadCheck.triadJustUnlocked,
        updatedSoulPatch: {
          boundArtifacts: nextBound,
          designations: triadCheck.designations,
          unlockedIds: triadCheck.unlockedIds,
          chronicle: triadCheck.chronicle,
          triadUnlocked:
            currentSoulState.triadUnlocked || triadCheck.triadJustUnlocked,
        },
      };
    }
  }

  saveValkhorDb(db);
  return { ok: true };
}

export function submitMarkVerification(
  soulState: SoulState,
  verificationCode: string,
  photoName: string,
  visibility: 'PRIVATE' | 'SOUL_ID_ONLY' | 'PUBLIC_PHOTO'
): {
  ok: boolean;
  request: MarkVerificationRequest;
  updatedSoulPatch: Partial<SoulState>;
} {
  const db = loadValkhorDb();
  const req: MarkVerificationRequest = {
    id: `mark-${Date.now()}`,
    soulId: soulState.soulId,
    verificationCode,
    photoName: photoName || `MARK_${verificationCode}.JPG`,
    visibility,
    status: 'PENDING REVIEW',
    createdAt: formatUtcNow(),
  };

  db.markRequests = [req, ...db.markRequests];
  saveValkhorDb(db);

  return {
    ok: true,
    request: req,
    updatedSoulPatch: {
      markStatus: 'PENDING REVIEW',
      markVisibility: visibility,
      markCode: verificationCode,
    },
  };
}

export function reviewMarkVerificationRequest(
  requestId: string,
  decision: 'VERIFIED' | 'REJECTED',
  currentSoulState: SoulState
): {
  ok: boolean;
  updatedSoulPatch?: Partial<SoulState>;
} {
  const db = loadValkhorDb();
  const req = db.markRequests.find((r) => r.id === requestId);
  if (!req) return { ok: false };

  req.status = decision;
  req.reviewedAt = formatUtcNow();

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: formatUtcNow(),
    actor: 'ADMIN_CONTROL',
    action: `MARK_VERIFICATION_${decision}`,
    detail: `MARK ${req.verificationCode} FOR ${req.soulId} (${req.visibility})`,
  });

  if (decision === 'VERIFIED' && req.visibility !== 'PRIVATE') {
    appendHistoricalRecord(
      db,
      'THE MARKED',
      req.soulId,
      `PERMANENT INSCRIPTION // ${req.verificationCode}`,
      [
        'DESIGNATION GRANTED: MARKED',
        `VISIBILITY: ${req.visibility}`,
        `EVIDENCE FILE: ${req.photoName}`,
      ]
    );
  }

  saveValkhorDb(db);

  if (req.soulId === currentSoulState.soulId) {
    if (decision === 'VERIFIED') {
      const year = new Date().getFullYear();
      const designations = addDesignationIfMissing(
        currentSoulState.designations,
        'MARKED'
      );
      const chronicle = addChronicleIfMissing(
        currentSoulState.chronicle,
        `mark-${req.verificationCode}`,
        `MARKED // ${year}`,
        `PHYSICAL VENDEX INSCRIPTION VERIFIED (${req.verificationCode})`
      );
      return {
        ok: true,
        updatedSoulPatch: {
          markStatus: 'VERIFIED',
          designations,
          chronicle,
        },
      };
    } else {
      return {
        ok: true,
        updatedSoulPatch: {
          markStatus: 'REJECTED',
        },
      };
    }
  }

  return { ok: true };
}

export function triggerSubKernelDiscovery(
  soulState: SoulState
): {
  alreadyDiscovered: boolean;
  updatedSoulPatch: Partial<SoulState>;
} {
  const db = loadValkhorDb();
  const prot = db.protocols.find((p) => p.id === 'PROTOCOL_0999');
  if (prot && prot.status === 'UNDISCOVERED') {
    prot.status = 'ACTIVE';
  }

  const discoveries = soulState.discoveries || [];
  const alreadyDiscovered = discoveries.includes('VOID_NODE_01');
  const nextDiscoveries = alreadyDiscovered
    ? discoveries
    : [...discoveries, 'VOID_NODE_01'];

  const designations = addDesignationIfMissing(
    soulState.designations,
    'DISCOVERER'
  );
  const unlockedIds = Array.from(
    new Set([...(soulState.unlockedIds || []), 'DISCOVERY_VOID_NODE'])
  );
  const year = new Date().getFullYear();
  const chronicle = addChronicleIfMissing(
    soulState.chronicle,
    'disc-void-node',
    `ANOMALY DISCOVERED // ${year}`,
    'INTERCEPTED UNINDEXED SUB-KERNEL NODE [PROTOCOL // 0999]'
  );

  if (!alreadyDiscovered) {
    appendHistoricalRecord(
      db,
      'DISCOVERIES',
      soulState.soulId,
      'ANOMALY DETECTED // SUB-KERNEL NODE 0999',
      ['REVEALED UNDISCOVERED PROTOCOL // 0999', 'DESIGNATION: DISCOVERER'],
      soulState.alias
    );
  }

  saveValkhorDb(db);

  return {
    alreadyDiscovered,
    updatedSoulPatch: {
      discoveries: nextDiscoveries,
      designations,
      unlockedIds,
      chronicle,
    },
  };
}
