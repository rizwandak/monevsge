-- ============================================================================
-- 13_rls_policies.sql
-- Row Level Security (RLS) untuk seluruh tabel
-- Urutan Eksekusi: 13
-- ============================================================================

-- Aktifkan RLS pada seluruh tabel
ALTER TABLE public.directorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_indicator_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_answer_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_clarifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_evaluation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_rubric_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_assessment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: Master Organisasi (Directorates & Ministries)
-- ============================================================================
CREATE POLICY "Authenticated users can read directorates"
  ON public.directorates FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admin can manage directorates"
  ON public.directorates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated users can read ministries"
  ON public.ministries FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admin can manage ministries"
  ON public.ministries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- POLICIES: Profiles & User Assignments
-- ============================================================================
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Admin can manage profiles"
  ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can read own assignments"
  ON public.user_assignments FOR SELECT TO authenticated
  USING (profile_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Admin can manage assignments"
  ON public.user_assignments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Members readable by ministry scope or director or admin"
  ON public.ministry_members FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.is_assigned_to_ministry(ministry_id, 'C_LEVEL')
    OR public.is_assigned_to_ministry(ministry_id, 'STAFF')
    OR EXISTS (
      SELECT 1 FROM public.ministries m
      WHERE m.id = ministry_id AND public.is_director_of(m.directorate_id)
    )
  );

CREATE POLICY "Admin can manage ministry members"
  ON public.ministry_members FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- POLICIES: Programs & Committee
-- ============================================================================
CREATE POLICY "Programs readable by authorized roles"
  ON public.programs FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.is_director_of(directorate_id)
    OR public.is_assigned_to_ministry(ministry_id, 'C_LEVEL')
    OR public.is_oc_of_program(id)
    OR public.has_role('KD')
    OR public.has_role('VIEWER')
  );

CREATE POLICY "Admin or Director can manage programs"
  ON public.programs FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_director_of(directorate_id))
  WITH CHECK (public.is_admin() OR public.is_director_of(directorate_id));

CREATE POLICY "Committee readable by authorized roles"
  ON public.program_committee_members FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.is_oc_of_program(program_id)
    OR EXISTS (
      SELECT 1 FROM public.programs pr
      WHERE pr.id = program_id
        AND (public.is_director_of(pr.directorate_id) OR public.is_assigned_to_ministry(pr.ministry_id, 'C_LEVEL'))
    )
  );

CREATE POLICY "Admin or Director can manage committee"
  ON public.program_committee_members FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.programs pr WHERE pr.id = program_id AND public.is_director_of(pr.directorate_id))
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.programs pr WHERE pr.id = program_id AND public.is_director_of(pr.directorate_id))
  );

-- ============================================================================
-- POLICIES: Program Evaluations (SC & OC)
-- ============================================================================
CREATE POLICY "Evaluation periods readable by authenticated"
  ON public.evaluation_periods FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admin can manage evaluation periods"
  ON public.evaluation_periods FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Submissions readable by authorized scope"
  ON public.evaluation_submissions FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.programs pr
      WHERE pr.id = program_id
        AND (
          public.is_director_of(pr.directorate_id)
          OR (evaluation_type = 'SC' AND public.is_assigned_to_ministry(pr.ministry_id, 'C_LEVEL'))
          OR (evaluation_type = 'OC' AND public.is_oc_of_program(pr.id))
        )
    )
  );

CREATE POLICY "SC or OC can insert/update own submissions"
  ON public.evaluation_submissions FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.programs pr
      WHERE pr.id = program_id
        AND (
          public.is_director_of(pr.directorate_id)
          OR (evaluation_type = 'SC' AND public.is_assigned_to_ministry(pr.ministry_id, 'C_LEVEL'))
          OR (evaluation_type = 'OC' AND public.is_oc_of_program(pr.id))
        )
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.programs pr
      WHERE pr.id = program_id
        AND (
          public.is_director_of(pr.directorate_id)
          OR (evaluation_type = 'SC' AND public.is_assigned_to_ministry(pr.ministry_id, 'C_LEVEL'))
          OR (evaluation_type = 'OC' AND public.is_oc_of_program(pr.id))
        )
    )
  );

-- ============================================================================
-- POLICIES: HR Evaluations (Sensitif - dibatasi ketat)
-- ============================================================================
CREATE POLICY "HR templates and questions readable by authenticated"
  ON public.hr_evaluation_templates FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "HR questions readable by authenticated"
  ON public.hr_questions FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "HR submissions only readable by owner, director of directorate, or admin"
  ON public.hr_submissions FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR respondent_id = public.current_profile_id()
    OR EXISTS (
      SELECT 1 FROM public.ministries m
      WHERE m.id = ministry_id AND public.is_director_of(m.directorate_id)
    )
  );

CREATE POLICY "HR submissions manageable by owner or admin"
  ON public.hr_submissions FOR ALL TO authenticated
  USING (public.is_admin() OR respondent_id = public.current_profile_id())
  WITH CHECK (public.is_admin() OR respondent_id = public.current_profile_id());

CREATE POLICY "HR director-only tables"
  ON public.hr_assessments FOR ALL TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.hr_subjects hs
      JOIN public.ministries m ON m.id = hs.ministry_id
      WHERE hs.id = subject_id AND public.is_director_of(m.directorate_id)
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.hr_subjects hs
      JOIN public.ministries m ON m.id = hs.ministry_id
      WHERE hs.id = subject_id AND public.is_director_of(m.directorate_id)
    )
  );

-- ============================================================================
-- POLICIES: KPI, KD, Notifications, Audit Logs
-- ============================================================================
CREATE POLICY "KPI config readable by authenticated"
  ON public.kpi_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "KPI indicators readable by authenticated"
  ON public.kpi_indicators FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "KPI rubrics readable by authenticated"
  ON public.kpi_rubrics FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "KPI rubric levels readable by authenticated"
  ON public.kpi_rubric_levels FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "KPI results readable by authorized roles"
  ON public.kpi_results FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR public.has_role('KD')
    OR public.has_role('VIEWER')
    OR EXISTS (
      SELECT 1 FROM public.ministries m
      WHERE m.id = ministry_id AND public.is_director_of(m.directorate_id)
    )
  );

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (recipient_id = public.current_profile_id() OR public.is_admin());

CREATE POLICY "Admin can read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_admin());
