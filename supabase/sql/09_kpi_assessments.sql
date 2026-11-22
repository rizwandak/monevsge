-- ============================================================================
-- 09_kpi_assessments.sql
-- Tabel penilaian KPI Director (75%), KD (25%), detail indikator, dan hasil final
-- Urutan Eksekusi: 9
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.kpi_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  evaluation_period_label VARCHAR(50) NOT NULL DEFAULT '2026',
  assessor_type VARCHAR(20) NOT NULL, -- 'DIRECTOR' atau 'KD'
  assessor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  recommended_score NUMERIC(6, 2),
  final_score NUMERIC(6, 2),
  adjustment_reason TEXT,
  status kpi_assessment_status NOT NULL DEFAULT 'INCOMPLETE',
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_assessor_type CHECK (assessor_type IN ('DIRECTOR', 'KD')),
  CONSTRAINT uq_kpi_assessment_ministry_type UNIQUE (ministry_id, evaluation_period_label, assessor_type)
);

CREATE TABLE IF NOT EXISTS public.kpi_assessment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.kpi_assessments(id) ON DELETE CASCADE,
  indicator_id UUID NOT NULL REFERENCES public.kpi_indicators(id) ON DELETE RESTRICT,
  rubric_level_id UUID REFERENCES public.kpi_rubric_levels(id) ON DELETE SET NULL,
  raw_score NUMERIC(6, 2),
  weighted_score NUMERIC(6, 2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_kpi_detail_indicator UNIQUE (assessment_id, indicator_id)
);

CREATE TABLE IF NOT EXISTS public.kpi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  evaluation_period_label VARCHAR(50) NOT NULL DEFAULT '2026',
  director_score NUMERIC(6, 2), -- Bobot 75%
  kd_score NUMERIC(6, 2),       -- Bobot 25%
  final_kpi_score NUMERIC(6, 2),
  is_eligible_for_ranking BOOLEAN NOT NULL DEFAULT FALSE,
  directorate_rank INTEGER,
  overall_rank INTEGER,
  is_best_ministry BOOLEAN NOT NULL DEFAULT FALSE,
  status kpi_assessment_status NOT NULL DEFAULT 'INCOMPLETE',
  calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_kpi_result_ministry_period UNIQUE (ministry_id, evaluation_period_label)
);

CREATE INDEX IF NOT EXISTS idx_kpi_assessments_ministry_id ON public.kpi_assessments(ministry_id);
CREATE INDEX IF NOT EXISTS idx_kpi_assessment_details_assessment_id ON public.kpi_assessment_details(assessment_id);
CREATE INDEX IF NOT EXISTS idx_kpi_results_ministry_id ON public.kpi_results(ministry_id);
CREATE INDEX IF NOT EXISTS idx_kpi_results_final_score ON public.kpi_results(final_kpi_score DESC);
