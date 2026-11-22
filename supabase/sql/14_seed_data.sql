-- ============================================================================
-- 14_seed_data.sql
-- Seed data awal: 4 Directorate, 10 Ministry, C-Level master data,
-- Proker awal (Human Capital, Talent Growth, Creative Enterprise),
-- Template Evaluasi SDM, dan Kategori KPI awal.
-- Urutan Eksekusi: 14
-- ============================================================================

-- 1. DIRECTORATES (4)
INSERT INTO public.directorates (code, name, description) VALUES
  ('DIR-DEV', 'Directorate of Development', 'Directorate yang membawahi Human Capital, Talent Growth, dan Creative Enterprise'),
  ('DIR-ADV', 'Directorate of Advocacy & Network', 'Directorate yang membawahi Student Advocacy & Welfare dan Inter-Agency Affairs'),
  ('DIR-SOC', 'Directorate of Sociopolitical Activism', 'Directorate yang membawahi Studies & Strategic Action dan Social Equity & Environment'),
  ('DIR-INT', 'Directorate of Internal Catalyst', 'Directorate yang membawahi Administration & Finance, Creative Media & Information, dan IT Solutions')
ON CONFLICT (code) DO NOTHING;

-- 2. MINISTRIES (10)
INSERT INTO public.ministries (directorate_id, code, name)
SELECT d.id, v.code, v.name
FROM (VALUES
  ('DIR-DEV', 'MIN-HC',  'Human Capital'),
  ('DIR-DEV', 'MIN-TG',  'Talent Growth'),
  ('DIR-DEV', 'MIN-CE',  'Creative Enterprise'),
  ('DIR-ADV', 'MIN-SAW', 'Student Advocacy & Welfare'),
  ('DIR-ADV', 'MIN-IAA', 'Inter-Agency Affairs'),
  ('DIR-SOC', 'MIN-SSA', 'Studies & Strategic Action'),
  ('DIR-SOC', 'MIN-SEE', 'Social Equity & Environment'),
  ('DIR-INT', 'MIN-AF',  'Administration & Finance'),
  ('DIR-INT', 'MIN-CMI', 'Creative Media & Information'),
  ('DIR-INT', 'MIN-ITS', 'IT Solutions')
) AS v(dir_code, code, name)
JOIN public.directorates d ON d.code = v.dir_code
ON CONFLICT (code) DO NOTHING;

-- 3. C-LEVEL MASTER DATA (Tanpa mengarang email — email diisi oleh Admin)
INSERT INTO public.ministry_members (ministry_id, member_name, position_title, is_c_level)
SELECT m.id, v.member_name, 'C-Level', TRUE
FROM (VALUES
  -- Directorate of Development
  ('MIN-HC',  'Muhammad Abdillah'),
  ('MIN-HC',  'Faradilla Aurellia Lianto'),
  ('MIN-HC',  'Rafi Ibnushaleh'),
  ('MIN-TG',  'M Dzakir Thuha Al Ghaffar'),
  ('MIN-TG',  'Sang Pimandu Banjaran'),
  ('MIN-TG',  'Layla ''Afifah Ramadhani'),
  ('MIN-CE',  'Azka Mitsalia Zamzami'),
  ('MIN-CE',  'Niken Nur Baiti'),
  ('MIN-CE',  'Muhammad Dzakwan Ikram'),
  -- Directorate of Advocacy & Network
  ('MIN-SAW', 'Syarief Choirul Anwar'),
  ('MIN-SAW', 'Nayla Salmanda Lupita'),
  ('MIN-SAW', 'R. Herjuno Rizky Anugrah'),
  ('MIN-IAA', 'Ahmad Rayhan Sofian'),
  ('MIN-IAA', 'Mahessi Putri Septananta'),
  ('MIN-IAA', 'Gangsar Wijayanto'),
  -- Directorate of Sociopolitical Activism
  ('MIN-SSA', 'Muhammad Rafi Alfarel K'),
  ('MIN-SSA', 'Muhammad Najhan Adz Zikra'),
  ('MIN-SSA', 'Muhammad Cahyo Bintang'),
  ('MIN-SEE', 'Raihan Endri Pratama'),
  ('MIN-SEE', 'Zanita Alya Khairunnisa'),
  ('MIN-SEE', 'Anindhita Faiza Aulia'),
  -- Directorate of Internal Catalyst
  ('MIN-AF',  'Nayla Shafa Khairunnisa'),
  ('MIN-AF',  'Cantika Putri Permatasari'),
  ('MIN-AF',  'Raden Fatih Abdul Jabbar'),
  ('MIN-CMI', 'Ezra Fara Al Ihsan'),
  ('MIN-CMI', 'Ahsana Maswa'),
  ('MIN-CMI', 'Ifka Rosmalita Nur Nazjila'),
  ('MIN-ITS', 'Muhammad Naufal Mathara Rahman'),
  ('MIN-ITS', 'Novita Azka Maghfira'),
  ('MIN-ITS', 'Fernando Putra Islamy')
) AS v(min_code, member_name)
JOIN public.ministries m ON m.code = v.min_code
WHERE NOT EXISTS (
  SELECT 1 FROM public.ministry_members mm
  WHERE mm.ministry_id = m.id AND mm.member_name = v.member_name AND mm.is_c_level = TRUE
);

-- 4. PROKER AWAL (Hanya Directorate of Development: HC, TG, CE)
INSERT INTO public.programs (directorate_id, ministry_id, name, evaluation_period_label)
SELECT m.directorate_id, m.id, v.prog_name, '2026'
FROM (VALUES
  -- Human Capital
  ('MIN-HC', 'PKKMB & SA'),
  ('MIN-HC', 'LKMM-TM'),
  ('MIN-HC', 'Duta FILKOM'),
  ('MIN-HC', 'Soft Skill Campaign'),
  -- Talent Growth
  ('MIN-TG', 'Artropolis'),
  ('MIN-TG', 'HOLOGY'),
  ('MIN-TG', 'Mawapres'),
  ('MIN-TG', 'WE CUP'),
  ('MIN-TG', 'Seeker Corner'),
  -- Creative Enterprise
  ('MIN-CE', 'FILKOMpreneur'),
  ('MIN-CE', 'SGE Market Hub'),
  ('MIN-CE', 'FILKOM Merchandise'),
  ('MIN-CE', 'Strategic Partnership')
) AS v(min_code, prog_name)
JOIN public.ministries m ON m.code = v.min_code
ON CONFLICT (ministry_id, name, evaluation_period_label) DO NOTHING;

-- 5. PENANGGUNG JAWAB OC AWAL
INSERT INTO public.program_committee_members (program_id, member_name, role_title, is_confirmed)
SELECT p.id, v.member_name, v.role_title, v.is_confirmed
FROM (VALUES
  -- Human Capital
  ('PKKMB & SA',           'Raihan',      'KAPEL',        TRUE),
  ('PKKMB & SA',           'Diandra',     'WAKAPEL',      TRUE),
  ('LKMM-TM',              'Matthew',     'KAPEL',        TRUE),
  ('LKMM-TM',              'Viona',       'WAKAPEL',      TRUE),
  ('Duta FILKOM',          'Luffi',       'KAPEL',        TRUE),
  ('Duta FILKOM',          'Naura',       'WAKAPEL',      TRUE),
  ('Soft Skill Campaign',  'Umar',        'KAPEL',        TRUE),
  ('Soft Skill Campaign',  'Queen',       'WAKAPEL',      TRUE),
  -- Talent Growth
  ('Artropolis',           'Fatih',       'KAPEL',        TRUE),
  ('Artropolis',           'Ayu',         'WAKAPEL',      TRUE),
  ('HOLOGY',               'Dhika',       'KAPEL',        TRUE),
  ('HOLOGY',               'Abdillah',    'WAKAPEL',      TRUE),
  ('Mawapres',             'Ananda',      'KAPEL',        TRUE),
  ('Mawapres',             'Aloysius',    'WAKAPEL',      TRUE),
  ('WE CUP',               'Yenny',       'KAPEL',        TRUE),
  ('WE CUP',               'Claudio',     'WAKAPEL',      TRUE),
  ('Seeker Corner',        'Annisa',      'KAPEL',        TRUE),
  ('Seeker Corner',        'Refi',        'WAKAPEL',      TRUE),
  -- Creative Enterprise
  ('FILKOMpreneur',        'Michael',     'KAPEL',        TRUE),
  ('FILKOMpreneur',        'Samuel',      'WAKAPEL',      TRUE),
  ('SGE Market Hub',       'Boyjes',      'KAPEL',        TRUE),
  ('SGE Market Hub',       'Aliyah',      'WAKAPEL',      TRUE),
  ('Strategic Partnership','Zaki',        'KAPEL',        TRUE),
  ('Strategic Partnership','Aqila',       'WAKAPEL',      TRUE),
  -- FILKOM Merchandise: Kapel & Wakapel belum dikonfirmasi, PIC tambahan sementara
  ('FILKOM Merchandise',   'Rafi Ageng',  'PIC_TAMBAHAN', FALSE),
  ('FILKOM Merchandise',   'Puty',        'PIC_TAMBAHAN', FALSE),
  ('FILKOM Merchandise',   'Alya Ashila', 'PIC_TAMBAHAN', FALSE)
) AS v(prog_name, member_name, role_title, is_confirmed)
JOIN public.programs p ON p.name = v.prog_name AND p.evaluation_period_label = '2026'
WHERE NOT EXISTS (
  SELECT 1 FROM public.program_committee_members pcm
  WHERE pcm.program_id = p.id AND pcm.member_name = v.member_name AND pcm.role_title = v.role_title
);

-- 6. TEMPLATE EVALUASI SDM (C-LEVEL & STAFF)
INSERT INTO public.hr_evaluation_templates (respondent_type, title, description)
SELECT v.rtype::hr_respondent_type, v.title, v.description
FROM (VALUES
  ('C_LEVEL', 'Evaluasi SDM C-Level 2026', 'Formulir evaluasi SDM khusus responden C-Level'),
  ('STAFF',   'Evaluasi SDM Staff 2026',   'Formulir evaluasi SDM khusus responden Staff')
) AS v(rtype, title, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.hr_evaluation_templates t WHERE t.respondent_type = v.rtype::hr_respondent_type
);

-- Pertanyaan khusus Paling Gacor pada masing-masing template
INSERT INTO public.hr_questions (template_id, aspect_name, question_text, question_type, is_gacor_question, sort_order)
SELECT t.id, 'Apresiasi Khusus',
  'Menurutmu, siapa staff paling gacor atau paling menonjol selama periode kepengurusan ini? Jelaskan alasannya.',
  'MEMBER_PICK_WITH_REASON', TRUE, 99
FROM public.hr_evaluation_templates t
WHERE t.respondent_type = 'C_LEVEL'
  AND NOT EXISTS (
    SELECT 1 FROM public.hr_questions q WHERE q.template_id = t.id AND q.is_gacor_question = TRUE
  );

INSERT INTO public.hr_questions (template_id, aspect_name, question_text, question_type, is_gacor_question, sort_order)
SELECT t.id, 'Apresiasi Khusus',
  'Menurutmu, siapa C-level paling gacor atau paling menonjol selama periode kepengurusan ini? Jelaskan alasannya.',
  'MEMBER_PICK_WITH_REASON', TRUE, 99
FROM public.hr_evaluation_templates t
WHERE t.respondent_type = 'STAFF'
  AND NOT EXISTS (
    SELECT 1 FROM public.hr_questions q WHERE q.template_id = t.id AND q.is_gacor_question = TRUE
  );

-- 7. KATEGORI KPI AWAL (Aspek ke-5 ditandai TODO menunggu konfirmasi)
INSERT INTO public.kpi_categories (code, name, description, sort_order) VALUES
  ('KPI-VISI', 'Visi', 'Kesesuaian dan pencapaian visi organisasi', 1),
  ('KPI-MISI', 'Misi', 'Pelaksanaan misi organisasi', 2),
  ('KPI-CORE', 'Core Values', 'Implementasi nilai-nilai inti kabinet', 3),
  ('KPI-SOP',  'SOP Internal', 'Kepatuhan terhadap SOP internal organisasi', 4)
ON CONFLICT (code) DO NOTHING;
