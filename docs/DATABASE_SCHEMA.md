# Database Schema — Sistem Evaluasi Tahunan BEM FILKOM UB 2026

## Ringkasan Domain Tabel

1. **Organization:** `directorates`, `ministries`, `profiles`, `user_assignments`, `ministry_members`
2. **Programs:** `programs`, `program_committee_members`, `program_indicators`, `program_indicator_results`, `program_documents`
3. **Program Evaluation:** `evaluation_periods`, `evaluation_submissions`, `evaluation_answers`, `evaluation_answer_versions`, `evaluation_reviews`, `evaluation_clarifications`
4. **HR Evaluation:** `hr_evaluation_templates`, `hr_questions`, `hr_submissions`, `hr_answers`, `hr_subjects`, `hr_interviews`, `hr_observations`, `hr_findings`, `hr_assessments`
5. **KPI:** `kpi_categories`, `kpi_indicators`, `kpi_rubrics`, `kpi_rubric_levels`, `kpi_weights`, `kpi_assessments`, `kpi_assessment_details`, `kpi_results`
6. **System:** `app_settings`, `notifications`, `annual_reports`, `audit_logs`

## Keamanan & RLS
- Seluruh tabel mengaktifkan Row Level Security (`ENABLE ROW LEVEL SECURITY`).
- Helper `SECURITY DEFINER` (`current_profile_id`, `has_role`, `is_admin`, `is_director_of`, `is_assigned_to_ministry`, `is_oc_of_program`) digunakan untuk menghindari recursive RLS.
- Domain email dibatasi `@student.ub.ac.id` pada level constraint database.
