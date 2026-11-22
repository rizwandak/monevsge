-- ============================================================================
-- 07_hr_evaluations.sql
-- Tabel evaluasi SDM (C-level & Staff), wawancara, observasi, temuan, & penilaian
-- Urutan Eksekusi: 7
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hr_evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  respondent_type hr_respondent_type NOT NULL, -- 'C_LEVEL' atau 'STAFF'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.hr_evaluation_templates(id) ON DELETE CASCADE,
  aspect_name VARCHAR(100) NOT NULL, -- Kinerja, Keaktifan, Konsistensi, dll.
  question_text TEXT NOT NULL,
  question_type VARCHAR(30) NOT NULL DEFAULT 'SCALE', -- 'SCALE', 'TEXT', 'MEMBER_PICK_WITH_REASON'
  is_gacor_question BOOLEAN NOT NULL DEFAULT FALSE,
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.hr_evaluation_templates(id) ON DELETE RESTRICT,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE RESTRICT,
  respondent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  respondent_type hr_respondent_type NOT NULL,
  period_id UUID REFERENCES public.evaluation_periods(id) ON DELETE SET NULL,
  status submission_status NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hr_submission_respondent UNIQUE (template_id, respondent_id)
);

CREATE TABLE IF NOT EXISTS public.hr_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.hr_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.hr_questions(id) ON DELETE CASCADE,
  score_value NUMERIC(5, 2),
  answer_text TEXT,
  selected_member_id UUID REFERENCES public.ministry_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hr_answer_question UNIQUE (submission_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.hr_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.ministry_members(id) ON DELETE CASCADE,
  evaluation_period_label VARCHAR(50) NOT NULL DEFAULT '2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hr_subject_member_period UNIQUE (member_id, evaluation_period_label)
);

CREATE TABLE IF NOT EXISTS public.hr_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.hr_subjects(id) ON DELETE CASCADE,
  director_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  interview_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT NOT NULL,
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.hr_subjects(id) ON DELETE CASCADE,
  director_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT NOT NULL,
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.hr_subjects(id) ON DELETE CASCADE,
  source_method hr_collection_method NOT NULL,
  summary TEXT NOT NULL,
  evidence_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'UNVERIFIED',
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hr_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.hr_subjects(id) ON DELETE CASCADE,
  director_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  individual_score NUMERIC(5, 2),
  summary_notes TEXT,
  is_finalized BOOLEAN NOT NULL DEFAULT FALSE,
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_hr_assessment_subject UNIQUE (subject_id)
);

CREATE INDEX IF NOT EXISTS idx_hr_questions_template_id ON public.hr_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_hr_submissions_ministry_id ON public.hr_submissions(ministry_id);
CREATE INDEX IF NOT EXISTS idx_hr_submissions_respondent_id ON public.hr_submissions(respondent_id);
CREATE INDEX IF NOT EXISTS idx_hr_answers_submission_id ON public.hr_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_hr_subjects_ministry_id ON public.hr_subjects(ministry_id);
CREATE INDEX IF NOT EXISTS idx_hr_findings_subject_id ON public.hr_findings(subject_id);
CREATE INDEX IF NOT EXISTS idx_hr_findings_status ON public.hr_findings(verification_status);
