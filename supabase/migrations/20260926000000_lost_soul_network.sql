-- ============================================================================
-- KHAOS // SOUL TERMINAL — LOST SOUL NETWORK PERSISTENT ARCHITECTURE
-- Supabase PostgreSQL Schema, Row Level Security (RLS), and Server-Side RPCs
-- Philosophy: DISCOVER -> VERIFY -> RECORD -> UNLOCK -> LEAVE A TRACE
-- ============================================================================

create extension if not exists "pgcrypto";

-- 01. SOUL PROFILES (Persistent Identity: SOUL RECORD)
create table if not exists public.soul_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  soul_code text unique not null, -- e.g. SOUL_008271 (immutable)
  alias text,
  country text,
  city text,
  origin text not null default 'EARTH',
  resonance text check (resonance in ('IGNHUM', 'DESERT', 'ICE', 'MECHANICAL')),
  mask_claimed boolean not null default false,
  khaos_connection integer not null default 34,
  first_contact_at timestamptz not null default now(),
  public_record boolean not null default false, -- OFF by default
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 02. ADMIN USERS
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'HERALD_ADMIN',
  created_at timestamptz not null default now()
);

-- 03. UNLOCKS (Generic Unlock Engine)
create table if not exists public.unlocks (
  id text primary key, -- e.g. ARCHIVE_0091, THE_TRIAD, TRANSMISSION_041
  code text unique not null,
  title text not null,
  unlock_type text not null check (unlock_type in (
    'ARCHIVE', 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT',
    'TRANSMISSION', 'SECRET_PAGE', 'PROTOCOL', 'DOWNLOAD',
    'DIGITAL_ARTIFACT', 'CUSTOM_EXPERIENCE'
  )),
  rule_type text not null, -- PROTOCOL_COMPLETED, SIGNAL_DECODED, ARTIFACT_COMBINATION, WITNESS_CLAIMED
  rule_condition text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.soul_unlocks (
  id uuid primary key default gen_random_uuid(),
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  unlock_id text not null references public.unlocks(id) on delete cascade,
  source_event text not null,
  unlocked_at timestamptz not null default now(),
  unique(soul_code, unlock_id)
);

-- 04. DESIGNATIONS (Historical Facts, Never Gamified Progress Bars)
create table if not exists public.designations (
  id text primary key, -- RECONNECTED, DECODER, WITNESS, KEEPER, ARCHIVIST, FIRST_CONTACT, FIRST_WITNESS, MARKED, TRIAD_HOLDER, DISCOVERER
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.soul_designations (
  id uuid primary key default gen_random_uuid(),
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  designation_id text not null references public.designations(id) on delete cascade,
  context_note text,
  granted_by text not null default 'SYSTEM',
  granted_at timestamptz not null default now(),
  unique(soul_code, designation_id)
);

-- 05. PROTOCOLS (Server-Validated Puzzles & Clandestine Directives)
create table if not exists public.protocols (
  id text primary key, -- e.g. PROTOCOL_0047
  code text unique not null, -- PROTOCOL // 0047
  title text not null,
  source text not null default 'UNKNOWN TRANSMISSION',
  content text not null,
  cipher_text text,
  media_url text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SOLVED', 'CLASSIFIED', 'ARCHIVED', 'UNDISCOVERED')),
  opens_at timestamptz not null default now(),
  closes_at timestamptz,
  solution_hash text not null, -- Salted SHA-256 hash; plaintext NEVER exposed to client
  max_attempts integer not null default 10,
  first_witness_limit integer not null default 10,
  unlock_id text references public.unlocks(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.protocol_attempts (
  id uuid primary key default gen_random_uuid(),
  protocol_id text not null references public.protocols(id) on delete cascade,
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  attempt_hash text not null,
  is_correct boolean not null default false,
  attempted_at timestamptz not null default now()
);

create table if not exists public.protocol_completions (
  id uuid primary key default gen_random_uuid(),
  protocol_id text not null references public.protocols(id) on delete cascade,
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  attempts integer not null default 1,
  discovery_position integer not null, -- 1 = FIRST WITNESS, 2 = SECOND WITNESS, etc.
  solved_at timestamptz not null default now(),
  unique(protocol_id, soul_code)
);

-- 06. SIGNALS & SIGNAL DECODER
create table if not exists public.signals (
  id text primary key,
  code_hash text unique not null, -- SHA-256 hash of signal code (e.g. VX-91-DEXTRALE)
  public_label text not null, -- Masked or revealed only after decode
  source text not null default 'EARTH',
  origin text not null default 'TRANSMISSION',
  action_type text not null check (action_type in (
    'UNLOCK_ARCHIVE', 'UNLOCK_PROTOCOL', 'REGISTER_DISCOVERY',
    'ACTIVATE_TRANSMISSION', 'REGISTER_WITNESS', 'UNLOCK_EXPERIENCE'
  )),
  unlock_id text references public.unlocks(id) on delete set null,
  target_protocol_id text references public.protocols(id) on delete set null,
  active_from timestamptz not null default now(),
  active_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.signal_discoveries (
  id uuid primary key default gen_random_uuid(),
  signal_id text not null references public.signals(id) on delete cascade,
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  discovery_position integer not null,
  discovered_at timestamptz not null default now(),
  unique(signal_id, soul_code)
);

-- 07. ARTIFACT REGISTRY, LEGACY CLAIMS, AND HISTORY
create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  public_code text unique not null, -- e.g. VX-RUBY-0047
  private_key_hash text, -- Salted SHA-256 of private scratch-off key (e.g. 8FH2-KH91-AQ72)
  name text not null, -- VENDEX // RUBY, VENDEX // SAPPHIRE, VENDEX // EMERALD, VENDEX // OBSIDIAN
  archetype text not null, -- RUBY, SAPPHIRE, EMERALD, OBSIDIAN, OTHER
  series text not null default 'EARTH ARTIFACT SERIES',
  generation text not null default 'GENERATION // 00',
  serial_number text not null,
  rarity_type text not null default 'RELIC' check (rarity_type in ('GEN_00', 'RELIC', 'RARE', 'ONE_OF_ONE')),
  status text not null default 'UNCLAIMED' check (status in ('UNCLAIMED', 'VERIFIED', 'RELEASED', 'INVALIDATED')),
  current_owner_soul_code text references public.soul_profiles(soul_code) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.artifact_claims (
  id uuid primary key default gen_random_uuid(),
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  artifact_name text not null, -- VENDEX // RUBY, etc.
  generation text not null default 'GENERATION // 00',
  verification_token text unique not null, -- e.g. LS-48192
  photo_front_path text,
  photo_back_path text,
  photo_token_path text,
  status text not null default 'PENDING REVIEW' check (status in ('PENDING REVIEW', 'VERIFIED', 'REJECTED')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.artifact_history (
  id uuid primary key default gen_random_uuid(),
  artifact_public_code text not null references public.artifacts(public_code) on delete cascade,
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  event_type text not null check (event_type in ('BOUND', 'RELEASED', 'CLAIMED', 'LEGACY_VERIFIED')),
  recorded_year integer not null default extract(year from now()),
  recorded_at timestamptz not null default now()
);

-- 08. EVENTS & WITNESS SYSTEM
create table if not exists public.events (
  id text primary key,
  code text unique not null,
  title text not null, -- VENDEX // MADRID
  city text not null,
  country text not null default 'EARTH',
  event_date text not null, -- 03.10.2026
  witness_code_hash text not null, -- SHA-256 of e.g. KHAOS-7104
  active_from timestamptz not null default now(),
  expires_at timestamptz not null,
  unlock_id text references public.unlocks(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_witnesses (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  witness_stamp text not null, -- WITNESS // MADRID 03.10.2026
  registered_at timestamptz not null default now(),
  unique(event_id, soul_code)
);

-- 09. THE MARKED (Voluntary Documentary Tattoo Registry)
create table if not exists public.mark_verifications (
  id uuid primary key default gen_random_uuid(),
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  verification_code text unique not null, -- e.g. VM-82914
  photo_path text,
  visibility text not null default 'PRIVATE' check (visibility in ('PRIVATE', 'SOUL_ID_ONLY', 'PUBLIC_PHOTO')),
  status text not null default 'PENDING REVIEW' check (status in ('PENDING REVIEW', 'VERIFIED', 'REJECTED')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 10. DISCOVERIES (Undiscovered Secrets & First Contacts)
create table if not exists public.discoveries (
  id text primary key,
  code text unique not null,
  title text not null,
  discovered_by_soul_code text references public.soul_profiles(soul_code) on delete set null,
  discovered_at timestamptz,
  total_discoverers integer not null default 0
);

-- 11. COLLECTIVE PROTOCOLS
create table if not exists public.collective_protocols (
  id text primary key, -- PROTOCOL_0091
  code text unique not null,
  title text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETE')),
  unlock_id text references public.unlocks(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.collective_fragments (
  id uuid primary key default gen_random_uuid(),
  collective_id text not null references public.collective_protocols(id) on delete cascade,
  fragment_key text not null, -- FRAGMENT A, FRAGMENT B, FRAGMENT C, FRAGMENT D
  source_hint text not null,
  solution_hash text not null,
  is_found boolean not null default false,
  found_by_soul_code text references public.soul_profiles(soul_code) on delete set null,
  found_at timestamptz,
  unique(collective_id, fragment_key)
);

create table if not exists public.collective_participation (
  id uuid primary key default gen_random_uuid(),
  collective_id text not null references public.collective_protocols(id) on delete cascade,
  soul_code text not null references public.soul_profiles(soul_code) on delete cascade,
  fragment_key text not null,
  participated_at timestamptz not null default now(),
  unique(collective_id, soul_code, fragment_key)
);

-- 12. AUDIT LOG (Anti-Cheat & Historical Integrity)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  soul_code text,
  action_type text not null,
  reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  server_timestamp timestamptz not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.soul_profiles enable row level security;
alter table public.protocols enable row level security;
alter table public.protocol_completions enable row level security;
alter table public.signals enable row level security;
alter table public.signal_discoveries enable row level security;
alter table public.artifacts enable row level security;
alter table public.artifact_claims enable row level security;
alter table public.artifact_history enable row level security;
alter table public.events enable row level security;
alter table public.event_witnesses enable row level security;
alter table public.soul_designations enable row level security;
alter table public.soul_unlocks enable row level security;
alter table public.mark_verifications enable row level security;
alter table public.discoveries enable row level security;
alter table public.collective_protocols enable row level security;
alter table public.collective_fragments enable row level security;
alter table public.audit_log enable row level security;

-- Privacy Policies: Users can only update their own optional profile fields;
-- Historical records (completions, designations, artifacts, witness records) are mutated ONLY via server-side functions.
create policy "Public soul profiles visible when public_record is true"
  on public.soul_profiles for select
  using (public_record = true or auth.uid() = user_id);

create policy "Users can update own alias, country, city, public_record"
  on public.soul_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
