-- ============================================================================
-- 06_program_evaluations.sql
-- Tabel periode evaluasi, submission SC/OC, jawaban, histori versi, dan review
-- Urutan Eksekusi: 6
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.evaluation_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  period_type VARCHAR(30) NOT NULL, -- 'SC', 'OC', 'C_LEVEL_HR', 'STAFF_HR', 'DIRECTOR_KPI', 'KD_KPI'
  start_at TIMESTAMPTZ NOT NULL,
  deadline_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_period_dates CHECK (deadline_at > start_at),
  CONSTRAINT chk_period_type CHECK (
    period_type IN ('SC', 'OC', 'C_LEVEL_HR', 'STAFF_HR', 'DIRECTOR_KPI', 'KD_KPI')
  )
);

CREATE TABLE IF NOT EXISTS public.evaluation_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  period_id UUID REFERENCES public.evaluation_periods(id) ON DELETE SET NULL,
  evaluation_type evaluation_type NOT NULL, -- 'SC' atau 'OC'
  status submission_status NOT NULL DEFAULT 'NOT_STARTED',
  primary_respondent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  reopened_at TIMESTAMPTZ,
  reopened_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reopen_reason TEXT,
  recommendation program_recommendation,
  recommendation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_program_evaluation_type UNIQUE (program_id, evaluation_type)
);

CREATE TABLE IF NOT EXISTS public.evaluation_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.evaluation_submissions(id) ON DELETE CASCADE,
  section_key VARCHAR(50) NOT NULL, -- 'IDENTITY', 'REALIZATION', 'PREPARATION', 'REFLECTION', 'RECOMMENDATION'
  question_key VARCHAR(100) NOT NULL,
  answer_text TEXT,
  answer_json JSONB,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_submission_question UNIQUE (submission_id, question_key)
);

CREATE TABLE IF NOT EXISTS public.evaluation_answer_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.evaluation_submissions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot_json JSONB NOT NULL,
  edited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  edit_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evaluation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  comparison_status comparison_status NOT NULL DEFAULT 'ALIGNED',
  review_notes TEXT,
  is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_program_review UNIQUE (program_id)
);

CREATE TABLE IF NOT EXISTS public.evaluation_clarifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.evaluation_submissions(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  question_text TEXT NOT NULL,
  response_text TEXT,
  responded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eval_submissions_program_id ON public.evaluation_submissions(program_id);
CREATE INDEX IF NOT EXISTS idx_eval_submissions_status ON public.evaluation_submissions(status);
CREATE INDEX IF NOT EXISTS idx_eval_answers_submission_id ON public.evaluation_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_eval_versions_submission_id ON public.evaluation_answer_versions(submission_id);
CREATE INDEX IF NOT EXISTS idx_eval_reviews_program_id ON public.evaluation_reviews(program_id);
CREATE INDEX IF NOT EXISTS idx_eval_clarifications_submission_id ON public.evaluation_clarifications(submission_id);
