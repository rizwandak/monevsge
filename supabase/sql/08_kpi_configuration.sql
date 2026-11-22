-- ============================================================================
-- 08_kpi_configuration.sql
-- Tabel konfigurasi KPI fleksibel (kategori, indikator, rubrik, bobot)
-- Catatan: Bobot final & aspek kelima menunggu konfirmasi organisasi
-- Urutan Eksekusi: 8
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kpi_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL UNIQUE, -- Visi, Misi, Core Values, SOP Internal, [TODO: Aspek ke-5]
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kpi_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.kpi_categories(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  indicator_type indicator_type NOT NULL DEFAULT 'QUALITATIVE',
  assessor_scope VARCHAR(30) NOT NULL DEFAULT 'DIRECTOR', -- 'DIRECTOR', 'KD', 'SYSTEM'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kpi_rubrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.kpi_indicators(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kpi_rubric_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id UUID NOT NULL REFERENCES public.kpi_rubrics(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  score_value NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rubric_level UNIQUE (rubric_id, level_number)
);

CREATE TABLE IF NOT EXISTS public.kpi_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id UUID NOT NULL REFERENCES public.kpi_indicators(id) ON DELETE CASCADE,
  evaluation_period_label VARCHAR(50) NOT NULL DEFAULT '2026',
  weight_percentage NUMERIC(5, 2) NOT NULL CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
  is_finalized BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_kpi_weight_indicator_period UNIQUE (indicator_id, evaluation_period_label)
);

CREATE INDEX IF NOT EXISTS idx_kpi_indicators_category_id ON public.kpi_indicators(category_id);
CREATE INDEX IF NOT EXISTS idx_kpi_rubrics_indicator_id ON public.kpi_rubrics(indicator_id);
CREATE INDEX IF NOT EXISTS idx_kpi_rubric_levels_rubric_id ON public.kpi_rubric_levels(rubric_id);
