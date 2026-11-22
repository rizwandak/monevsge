-- ============================================================================
-- 05_programs.sql
-- Tabel master program kerja (Proker), penanggung jawab OC, indikator, dan dokumen
-- Urutan Eksekusi: 5
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  directorate_id UUID NOT NULL REFERENCES public.directorates(id) ON DELETE RESTRICT,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE RESTRICT,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  evaluation_period_label VARCHAR(50) NOT NULL DEFAULT '2026',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_program_ministry_name_period UNIQUE (ministry_id, name, evaluation_period_label)
);

CREATE TABLE IF NOT EXISTS public.program_committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  member_name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  role_title VARCHAR(50) NOT NULL, -- 'KAPEL', 'WAKAPEL', atau 'PIC_TAMBAHAN'
  is_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_committee_role_title CHECK (role_title IN ('KAPEL', 'WAKAPEL', 'PIC_TAMBAHAN')),
  CONSTRAINT chk_committee_ub_email CHECK (email IS NULL OR LOWER(email) LIKE '%@student.ub.ac.id')
);

CREATE TABLE IF NOT EXISTS public.program_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  indicator_type indicator_type NOT NULL DEFAULT 'QUANTITATIVE',
  target_value NUMERIC(12, 2),
  target_text TEXT,
  unit VARCHAR(50),
  weight NUMERIC(5, 2), -- Opsional, diisi jika sudah dikonfigurasi
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.program_indicator_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.program_indicators(id) ON DELETE CASCADE,
  evaluation_type evaluation_type NOT NULL, -- 'SC' atau 'OC'
  realization_value NUMERIC(12, 2),
  realization_text TEXT,
  evidence_url TEXT,
  achievement_notes TEXT,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_indicator_result_type UNIQUE (indicator_id, evaluation_type)
);

CREATE TABLE IF NOT EXISTS public.program_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'DOKUMENTASI', 'LPJ', 'LAINNYA'
  title VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programs_directorate_id ON public.programs(directorate_id);
CREATE INDEX IF NOT EXISTS idx_programs_ministry_id ON public.programs(ministry_id);
CREATE INDEX IF NOT EXISTS idx_program_committee_program_id ON public.program_committee_members(program_id);
CREATE INDEX IF NOT EXISTS idx_program_committee_profile_id ON public.program_committee_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_program_indicators_program_id ON public.program_indicators(program_id);
CREATE INDEX IF NOT EXISTS idx_program_indicator_results_indicator_id ON public.program_indicator_results(indicator_id);
CREATE INDEX IF NOT EXISTS idx_program_documents_program_id ON public.program_documents(program_id);
