-- ============================================================================
-- 12_functions_and_triggers.sql
-- Helper functions (updated_at trigger & RLS role/assignment helpers)
-- Urutan Eksekusi: 12
-- ============================================================================

-- 1. Trigger function untuk memperbarui updated_at otomatis
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Terapkan trigger updated_at ke seluruh tabel yang memiliki kolom updated_at
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'directorates', 'ministries', 'profiles', 'user_assignments', 'ministry_members',
    'programs', 'program_committee_members', 'program_indicators', 'program_indicator_results',
    'program_documents', 'evaluation_periods', 'evaluation_submissions', 'evaluation_answers',
    'evaluation_reviews', 'evaluation_clarifications', 'hr_evaluation_templates', 'hr_questions',
    'hr_submissions', 'hr_answers', 'hr_subjects', 'hr_interviews', 'hr_observations',
    'hr_findings', 'hr_assessments', 'kpi_categories', 'kpi_indicators', 'kpi_rubrics',
    'kpi_rubric_levels', 'kpi_weights', 'kpi_assessments', 'kpi_assessment_details',
    'kpi_results', 'app_settings', 'annual_reports'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;
      CREATE TRIGGER trg_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- 2. Helper functions SECURITY DEFINER untuk RLS (mencegah recursive RLS)
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(target_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_assignments ua
    JOIN public.profiles p ON p.id = ua.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND ua.role = target_role
      AND ua.is_active = TRUE
      AND p.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('ADMIN');
$$;

CREATE OR REPLACE FUNCTION public.is_director_of(target_directorate_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_assignments ua
    JOIN public.profiles p ON p.id = ua.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND ua.role = 'DIRECTOR'
      AND ua.directorate_id = target_directorate_id
      AND ua.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_to_ministry(target_ministry_id UUID, target_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_assignments ua
    JOIN public.profiles p ON p.id = ua.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND ua.role = target_role
      AND ua.ministry_id = target_ministry_id
      AND ua.is_active = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_oc_of_program(target_program_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.program_committee_members pcm
    JOIN public.profiles p ON p.id = pcm.profile_id
    WHERE p.auth_user_id = auth.uid()
      AND pcm.program_id = target_program_id
      AND pcm.is_active = TRUE
  );
$$;
