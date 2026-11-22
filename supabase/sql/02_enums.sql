-- ============================================================================
-- 02_enums.sql
-- Definisi tipe ENUM untuk konsistensi domain data
-- Urutan Eksekusi: 2
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM (
    'ADMIN',
    'C_LEVEL',
    'STAFF',
    'KAPEL',
    'WAKAPEL',
    'DIRECTOR',
    'KD',
    'VIEWER'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE evaluation_type AS ENUM ('SC', 'OC');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hr_respondent_type AS ENUM ('C_LEVEL', 'STAFF');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM (
    'NOT_STARTED',
    'DRAFT',
    'SUBMITTED',
    'NEEDS_CLARIFICATION',
    'REVIEWED',
    'CONFIRMED',
    'LOCKED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE indicator_type AS ENUM ('QUANTITATIVE', 'QUALITATIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE comparison_status AS ENUM (
    'ALIGNED',
    'PARTIALLY_DIFFERENT',
    'SIGNIFICANTLY_DIFFERENT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE hr_collection_method AS ENUM ('FORM', 'INTERVIEW', 'OBSERVATION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM (
    'UNVERIFIED',
    'VERIFIED',
    'REJECTED',
    'NEEDS_CLARIFICATION'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE kpi_assessment_status AS ENUM (
    'INCOMPLETE',
    'RECOMMENDED',
    'REVIEWED',
    'CONFIRMED',
    'LOCKED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE program_recommendation AS ENUM (
    'CONTINUE_AS_IS',
    'CONTINUE_WITH_IMPROVEMENT',
    'DEVELOP_NEW_CONCEPT',
    'MERGE_WITH_OTHER',
    'DISCONTINUE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
